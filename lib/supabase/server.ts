import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
import {supabaseEnv} from './env';
export async function createClient(){
const store=await cookies(),{url,key}=supabaseEnv();
return createServerClient(url,key,{cookies:{getAll:()=>store.getAll(),setAll(list){try{list.forEach(({name,value,options})=>store.set(name,value,options))}catch{/* Server Component render: the proxy refreshes sessions instead */}}}});}
