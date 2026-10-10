import {requireAdmin} from '@/lib/auth';
import {r2Enabled} from '@/lib/r2';
import Flash from '../../Flash';
import ProjectForm from '../../ProjectForm';
export default async function New({searchParams}:{searchParams:Promise<{e?:string}>}){
const sp=await searchParams,{supabase}=await requireAdmin();
const {data}=await supabase.from('categories').select('id,name').order('sort_order');
return(<><h1 className="ad-h">Add project</h1><Flash {...sp}/><ProjectForm categories={data??[]} uploads={r2Enabled()}/></>);}
