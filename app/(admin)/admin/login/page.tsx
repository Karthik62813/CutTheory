import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import LoginForm from './LoginForm';
export const metadata={title:'Admin login'};
export default async function Login({searchParams}:{searchParams:Promise<{error?:string}>}){
const sp=await searchParams,supabase=await createClient();
const {data:{user}}=await supabase.auth.getUser();
if(user){const {data:ok}=await supabase.rpc('is_admin');if(ok===true)redirect('/admin');}
return(<div className="ad-login"><LoginForm denied={sp.error==='denied'}/></div>);}
