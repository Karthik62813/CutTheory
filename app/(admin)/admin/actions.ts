'use server';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
export type LoginState={error?:string};
const BAD='Invalid email or password.';
export async function login(_prev:LoginState,fd:FormData):Promise<LoginState>{
const email=String(fd.get('email')??'').trim().toLowerCase(),password=String(fd.get('password')??'');
if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)||password.length<6||password.length>200)return{error:BAD};
const supabase=await createClient();
const {error}=await supabase.auth.signInWithPassword({email,password});
if(error)return{error:BAD};
const {data:ok}=await supabase.rpc('is_admin');
if(ok!==true){await supabase.auth.signOut();return{error:BAD};}
redirect('/admin');}
export async function logout(){const supabase=await createClient();await supabase.auth.signOut();redirect('/admin/login');}
