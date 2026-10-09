import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://bzltbdqwbizvhlrnghmq.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_p1V_z8CJIJxaATXmdWRMAg_c5X0Fzku'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
