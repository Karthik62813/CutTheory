import {notFound} from 'next/navigation';
import {requireAdmin} from '@/lib/auth';
import {r2Enabled} from '@/lib/r2';
import {isUuid} from '@/lib/validate';
import Flash from '../../Flash';
import ProjectForm from '../../ProjectForm';
export default async function Edit({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{e?:string}>}){
const {id}=await params,sp=await searchParams;
if(!isUuid(id))notFound();
const {supabase}=await requireAdmin();
const [{data:p},{data:cats}]=await Promise.all([supabase.from('projects').select('*').eq('id',id).maybeSingle(),supabase.from('categories').select('id,name').order('sort_order')]);
if(!p)notFound();
return(<><h1 className="ad-h">Edit project</h1><Flash {...sp}/><ProjectForm p={p} categories={cats??[]} uploads={r2Enabled()}/></>);}
