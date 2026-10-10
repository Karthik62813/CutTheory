import Link from 'next/link';
import {requireAdmin} from '@/lib/auth';
import {moveProject,toggleProject,deleteProject} from '../manage';
import Flash from '../Flash';
import ConfirmButton from '../ConfirmButton';
import {youtubeThumbSmall} from '@/lib/video';
function Act({action,id,name,value,children}:{action:(fd:FormData)=>void|Promise<void>;id:string;name:string;value:string;children:React.ReactNode}){
return(<form action={action}><input type="hidden" name="id" value={id}/><input type="hidden" name={name} value={value}/><button className="ad-btn ghost">{children}</button></form>);}
export default async function Projects({searchParams}:{searchParams:Promise<{e?:string;ok?:string}>}){
const sp=await searchParams,{supabase}=await requireAdmin();
const {data}=await supabase.from('projects').select('id,title,published,featured,thumbnail_url,video_url,categories(name)').order('sort_order').order('created_at');
const list=(data??[]).map((p:any)=>({...p,thumb:p.thumbnail_url??youtubeThumbSmall(p.video_url)}));
return(<><div className="ad-top"><h1 className="ad-h">Projects</h1><Link href="/admin/projects/new" className="ad-btn">+ Add project</Link></div><Flash {...sp}/>
{list.length===0?<p className="ad-mut">No projects yet. Click Add project.</p>:<div className="ad-list">{list.map((p:any)=>(<div key={p.id} className="ad-prow">
{p.thumb?<img src={p.thumb} alt="" className="ad-thumb"/>:<div className="ad-thumb"/>}
<div><b>{p.title}</b><div className="ad-mut">{p.categories?.name??'No category'}</div></div>
<span className={'ad-badge '+(p.published?'on':'')}>{p.published?'Published':'Draft'}</span>
<div className="ad-acts"><Act action={moveProject} id={p.id} name="dir" value="up">↑</Act><Act action={moveProject} id={p.id} name="dir" value="down">↓</Act>
<Act action={toggleProject} id={p.id} name="field" value="published">{p.published?'Unpublish':'Publish'}</Act>
<Act action={toggleProject} id={p.id} name="field" value="featured">{p.featured?'★ Featured':'☆ Feature'}</Act>
<Link href={`/admin/projects/${p.id}`} className="ad-btn ghost">Edit</Link>
<form action={deleteProject}><input type="hidden" name="id" value={p.id}/><ConfirmButton msg="Delete this project? This cannot be undone.">Delete</ConfirmButton></form></div></div>))}</div>}</>);}
