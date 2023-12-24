import { createClient } from '@supabase/supabase-js';
const config = await Bun.file('src/config.json').json();

const supabaseURL = config.supabaseURL;
const supabaseKey = config.supabaseKey;
const supabaseClient = createClient(supabaseURL, supabaseKey);

export { supabaseClient };
