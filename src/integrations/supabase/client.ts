// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://eskpzmyceeiomojjfmcn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVza3B6bXljZWVpb21vampmbWNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNDQzNDcsImV4cCI6MjA2MzkyMDM0N30.q2UHrkv-k3gKB5OvxR0fUApIllVbcn1TbVAasnnnJ3I";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);