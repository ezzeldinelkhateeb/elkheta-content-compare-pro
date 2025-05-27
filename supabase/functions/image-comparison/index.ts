
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Log the start of comparison
    await supabaseClient
      .from('processing_logs')
      .insert({
        project_id: projectId,
        phase: 'image_comparison',
        message: 'بدء مقارنة الصور',
        details: { 
          old_images: oldImagePaths.length,
          new_images: newImagePaths.length 
        }
      })

    // Simulate image comparison process
    const results = []
    const totalImages = Math.max(oldImagePaths.length, newImagePaths.length)

    for (let i = 0; i < totalImages; i++) {
      const oldImage = oldImagePaths[i]
      const newImage = newImagePaths[i]
      
      // Simulate comparison logic
      const similarity = Math.random() > 0.3 ? 0.95 + Math.random() * 0.05 : Math.random() * 0.7
      const comparisonType = similarity > 0.9 ? 'identical' : 
                           oldImage && newImage ? 'different' :
                           oldImage && !newImage ? 'removed' : 'new'

      const result = {
        project_id: projectId,
        page_number: i + 1,
        old_page_path: oldImage || null,
        new_page_path: newImage || null,
        comparison_type: comparisonType,
        similarity_score: similarity,
        ocr_text_old: oldImage ? `محتوى نصي مستخرج من الصفحة ${i + 1} - النسخة القديمة` : null,
        ocr_text_new: newImage ? `محتوى نصي مستخرج من الصفحة ${i + 1} - النسخة الجديدة` : null,
        questions_extracted: comparisonType === 'different' || comparisonType === 'new' ? 
          [{ question: `سؤال مستخرج من الصفحة ${i + 1}`, type: 'multiple_choice' }] : []
      }

      results.push(result)

      // Update progress
      const progress = Math.round(((i + 1) / totalImages) * 100)
      await supabaseClient
        .from('projects')
        .update({ progress })
        .eq('id', projectId)
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
          removed: results.filter(r => r.comparison_type === 'removed').length
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
    console.error('Error in image comparison:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
