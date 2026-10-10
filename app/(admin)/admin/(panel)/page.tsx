import Link from 'next/link';
import {requireAdmin} from '@/lib/auth';
import {r2Enabled} from '@/lib/r2';
const gb=(n:number)=>(n/1073741824).toFixed(2)+' GB';
export default async function Dashboard(){
const {supabase}=await requireAdmin();
const [all,pub,cl,used,cfg]=await Promise.all([
supabase.from('projects').select('*',{count:'exact',head:true}),
supabase.from('projects').select('*',{count:'exact',head:true}).eq('published',true),
supabase.from('clients').select('*',{count:'exact',head:true}),
supabase.rpc('storage_used_bytes'),
supabase.from('site_settings').select('storage_cap_bytes').eq('id',1).single()]);
const total=all.count??0,published=pub.count??0,u=Number(used.data??0),cap=Number(cfg.data?.storage_cap_bytes??10737418240),pct=Math.min(100,u/cap*100);
return(<><div className="ad-top"><h1 className="ad-h">Dashboard</h1><Link href="/admin/projects/new" className="ad-btn">+ Add project</Link></div>
<div className="ad-cards"><div className="ad-card">Projects<b>{total}</b></div><div className="ad-card">Published<b>{published}</b></div><div className="ad-card">Drafts<b>{total-published}</b></div><div className="ad-card">Clients<b>{cl.count??0}</b></div></div>
{!r2Enabled()&&<div className="ad-note ad-gap">File uploads are off. Add the R2 storage settings to upload videos and images from here (see README). Until then, projects take pasted links.</div>}
<div className="ad-card"><div>{`Storage: ${gb(u)} of ${gb(cap)} used`}</div><div className="ad-bar" role="img" aria-label={`${Math.round(pct)}% of storage used`}><i style={{width:pct+'%'}}/></div></div></>);}
