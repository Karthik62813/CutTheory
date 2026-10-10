import {cache} from 'react';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
// Authoritative server-side check, used by every admin page and action: valid login AND listed in admin_users.
export const requireAdmin=cache(async()=>{
const supabase=await createClient();
const {data:{user}}=await supabase.auth.getUser();
if(!user)redirect('/admin/login');
const {data:ok}=await supabase.rpc('is_admin');
if(ok!==true)redirect('/admin/login?error=denied');
return{supabase,user};});
