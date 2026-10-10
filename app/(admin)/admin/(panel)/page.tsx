import {requireAdmin} from '@/lib/auth';
const gb=(n:number)=>(n/1073741824).toFixed(2)+' GB';
export default async function Dashboard(){
const {supabase}=await requireAdmin();
const [all,pub,used,cfg]=await Promise.all([
supabase.from('projects').select('*',{count:'exact',head:true}),
supabase.from('projects').select('*',{count:'exact',head:true}).eq('published',true),
supabase.rpc('storage_used_bytes'),
supabase.from('site_settings').select('storage_cap_bytes').eq('id',1).single()]);
const total=all.count??0,published=pub.count??0,u=Number(used.data??0),cap=Number(cfg.data?.storage_cap_bytes??10737418240);
return(<><h1 className="ad-h">Dashboard</h1>
<div className="ad-cards"><div className="ad-card">Projects<b>{total}</b></div><div className="ad-card">Published<b>{published}</b></div><div className="ad-card">Drafts<b>{total-published}</b></div></div>
<div className="ad-card"><div>{`Storage: ${gb(u)} of ${gb(cap)} used`}</div><div className="ad-bar"><i style={{width:Math.min(100,u/cap*100)+'%'}}/></div></div></>);}
