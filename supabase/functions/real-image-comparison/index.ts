
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ComparisonResult {
  similarity: number;
  isIdentical: boolean;
  differences: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { projectId, oldImagePaths, newImagePaths } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured')
    }

    // Log the start of comparison
    await supabaseClient
      .from('processing_logs')
      .insert({
        project_id: projectId,
        phase: 'image_comparison',
        message: 'بدء مقارنة الصور الحقيقية',
        details: { 
          old_images: oldImagePaths.length,
          new_images: newImagePaths.length 
        }
      })

    const results = []
    const totalImages = Math.max(oldImagePaths.length, newImagePaths.length)

    // Process images in batches to avoid timeout
    const batchSize = 5
    for (let batchStart = 0; batchStart < totalImages; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, totalImages)
      
      for (let i = batchStart; i < batchEnd; i++) {
        const oldImagePath = oldImagePaths[i]
        const newImagePath = newImagePaths[i]
        
        let comparisonResult: ComparisonResult | null = null
        let extractedQuestions: any[] = []

        // Compare images if both exist
        if (oldImagePath && newImagePath) {
          comparisonResult = await compareImages(supabaseClient, oldImagePath, newImagePath, geminiApiKey)
          
          // Extract questions if images are different
          if (!comparisonResult.isIdentical) {
            extractedQuestions = await extractQuestionsFromImage(supabaseClient, newImagePath, geminiApiKey)
          }
        } else if (newImagePath && !oldImagePath) {
          // New image - extract questions
          extractedQuestions = await extractQuestionsFromImage(supabaseClient, newImagePath, geminiApiKey)
          comparisonResult = { similarity: 0, isIdentical: false, differences: ['صفحة جديدة'] }
        } else if (oldImagePath && !newImagePath) {
          // Removed image
          comparisonResult = { similarity: 0, isIdentical: false, differences: ['صفحة محذوفة'] }
        }

        const result = {
          project_id: projectId,
          page_number: i + 1,
          old_page_path: oldImagePath || null,
          new_page_path: newImagePath || null,
          comparison_type: 
            !oldImagePath && newImagePath ? 'new' :
            oldImagePath && !newImagePath ? 'removed' :
            comparisonResult?.isIdentical ? 'identical' : 'different',
          similarity_score: comparisonResult?.similarity || 0,
          ocr_text_old: oldImagePath ? await extractTextFromImage(supabaseClient, oldImagePath, geminiApiKey) : null,
          ocr_text_new: newImagePath ? await extractTextFromImage(supabaseClient, newImagePath, geminiApiKey) : null,
          questions_extracted: extractedQuestions
        }

        results.push(result)

        // Update progress
        const progress = Math.round(((i + 1) / totalImages) * 100)
        await supabaseClient
          .from('projects')
          .update({ progress })
          .eq('id', projectId)
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Insert all results
    const { error: insertError } = await supabaseClient
      .from('comparison_results')
      .insert(results)

    if (insertError) throw insertError

    // Mark project as completed
    await supabaseClient
      .from('projects')
      .update({ 
        status: 'completed',
        progress: 100,
        completed_at: new Date().toISOString()
      })
      .eq('id', projectId)

    // Log completion
    await supabaseClient
      .from('processing_logs')
      .insert({
        project_id: projectId,
        phase: 'completion',
        message: 'تم إكمال المقارنة بنجاح',
        details: { 
          total_results: results.length,
          identical: results.filter(r => r.comparison_type === 'identical').length,
          different: results.filter(r => r.comparison_type === 'different').length,
          new: results.filter(r => r.comparison_type === 'new').length,
          removed: results.filter(r => r.comparison_type === 'removed').length,
          extracted_questions: results.reduce((acc, r) => acc + r.questions_extracted.length, 0)
        }
      })

    return new Response(
      JSON.stringify({ success: true, results }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in real image comparison:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

async function compareImages(supabaseClient: any, oldImagePath: string, newImagePath: string, geminiApiKey: string): Promise<ComparisonResult> {
  try {
    // Get image URLs from Supabase Storage
    const { data: oldImageData } = await supabaseClient.storage
      .from('project-files')
      .download(oldImagePath)
    
    const { data: newImageData } = await supabaseClient.storage
      .from('project-files')
      .download(newImagePath)

    if (!oldImageData || !newImageData) {
      throw new Error('Failed to download images for comparison')
    }

    // Convert to base64 for Gemini API
    const oldImageBase64 = await blobToBase64(oldImageData)
    const newImageBase64 = await blobToBase64(newImageData)

    // Use Gemini Vision to compare images
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: "قارن بين هاتين الصورتين وأخبرني إذا كانتا متطابقتين أم مختلفتين. إذا كانتا مختلفتين، اذكر الاختلافات. أجب باللغة العربية وبصيغة JSON مع المفاتيح: similarity (رقم من 0 إلى 1), isIdentical (true/false), differences (مصفوفة من النصوص)"
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: oldImageBase64
              }
            },
            {
              inline_data: {
                mime_type: "image/jpeg", 
                data: newImageBase64
              }
            }
          ]
        }]
      })
    })

    const data = await response.json()
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text

    try {
      // Extract JSON from the response
      const jsonMatch = resultText.match(/\{.*\}/s)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      console.error('Error parsing Gemini response:', e)
    }

    // Fallback result
    return {
      similarity: 0.5,
      isIdentical: false,
      differences: ['تعذر تحليل الاختلافات']
    }

  } catch (error) {
    console.error('Error comparing images:', error)
    return {
      similarity: 0,
      isIdentical: false,
      differences: ['خطأ في مقارنة الصور']
    }
  }
}

async function extractTextFromImage(supabaseClient: any, imagePath: string, geminiApiKey: string): Promise<string> {
  try {
    const { data: imageData } = await supabaseClient.storage
      .from('project-files')
      .download(imagePath)

    if (!imageData) return 'تعذر قراءة الصورة'

    const imageBase64 = await blobToBase64(imageData)

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: "استخرج كل النص العربي والإنجليزي من هذه الصورة. اكتب النص كما هو بدون تعديل."
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64
              }
            }
          ]
        }]
      })
    })

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'لا يوجد نص'

  } catch (error) {
    console.error('Error extracting text:', error)
    return 'خطأ في استخراج النص'
  }
}

async function extractQuestionsFromImage(supabaseClient: any, imagePath: string, geminiApiKey: string): Promise<any[]> {
  try {
    const { data: imageData } = await supabaseClient.storage
      .from('project-files')
      .download(imagePath)

    if (!imageData) return []

    const imageBase64 = await blobToBase64(imageData)

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: "ابحث عن الأسئلة في هذه الصورة واستخرجها. إذا وجدت أسئلة، اكتبها بصيغة JSON كمصفوفة من الكائنات مع المفاتيح: question (نص السؤال), type (نوع السؤال: multiple_choice, true_false, essay, fill_blank), options (إذا كان اختيار متعدد). إذا لم تجد أسئلة، أرجع مصفوفة فارغة []."
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64
              }
            }
          ]
        }]
      })
    })

    const data = await response.json()
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text

    try {
      // Extract JSON array from the response
      const jsonMatch = resultText.match(/\[.*\]/s)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      console.error('Error parsing questions:', e)
    }

    return []

  } catch (error) {
    console.error('Error extracting questions:', error)
    return []
  }
}

async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)
  let binary = ''
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i])
  }
  return btoa(binary)
}
