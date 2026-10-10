import {createClient} from '@supabase/supabase-js';
import {supabaseEnv} from './env';
// Cookie-free client for the public pages, so they can be prerendered and cached. It only sees what RLS shows visitors.
export function createPublicClient(){
const {url,key}=supabaseEnv();
return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});}
