'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {requireAdmin} from '@/lib/auth';
import {slugify,txt,opt,flag,isUuid,https,lines} from '@/lib/validate';
function back(path:string,key:'e'|'ok',msg:string):never{redirect(`${path}?${key}=${encodeURIComponent(msg)}`);}
function explain(e:{code?:string;message:string}|null){
if(!e)return null;
if(e.code==='23505')return 'That slug is already used. Pick a different one.';
if(e.message.includes('published_needs_video'))return 'Add a video link before publishing.';
if(e.code==='23514')return 'A value is not allowed: '+e.message;
if(e.code==='42501')return 'Not allowed.';
return 'Could not save: '+e.message;}
const refresh=()=>{revalidatePath('/');revalidatePath('/work/[slug]','page');};

export async function saveCategory(fd:FormData){
const {supabase}=await requireAdmin(),P='/admin/categories';
const id=txt(fd,'id'),name=txt(fd,'name'),slug=slugify(txt(fd,'slug')||name),color=txt(fd,'color')||'#7c4ddb';
if(!name||!slug)back(P,'e','Name is required.');
if(!/^#[0-9a-fA-F]{6}$/.test(color))back(P,'e','Pick a valid colour.');
const row={name:name.slice(0,60),slug,color,sort_order:parseInt(txt(fd,'sort_order')||'0',10)||0};
const {error}=id?await supabase.from('categories').update(row).eq('id',id):await supabase.from('categories').insert(row);
const m=explain(error);if(m)back(P,'e',m);
refresh();back(P,'ok',id?'Category saved.':'Category added.');}

export async function deleteCategory(fd:FormData){
const {supabase}=await requireAdmin(),id=txt(fd,'id');
if(!isUuid(id))back('/admin/categories','e','Invalid request.');
const {error}=await supabase.from('categories').delete().eq('id',id);
const m=explain(error);if(m)back('/admin/categories','e',m);
refresh();back('/admin/categories','ok','Category deleted.');}

export async function saveProject(fd:FormData){
const {supabase}=await requireAdmin(),id=txt(fd,'id'),title=txt(fd,'title');
const P=id?`/admin/projects/${id}`:'/admin/projects/new';
if(id&&!isUuid(id))back('/admin/projects','e','Invalid request.');
if(!title)back(P,'e','Title is required.');
const slug=slugify(txt(fd,'slug')||title);if(!slug)back(P,'e','Slug is required.');
const dur=opt(fd,'duration');if(dur&&!/^\d{1,2}:\d{2}(:\d{2})?$/.test(dur))back(P,'e','Duration must look like 0:45 or 1:30.');
const yr=opt(fd,'year'),year=yr?parseInt(yr,10):null;if(year!==null&&!(year>=1990&&year<=2100))back(P,'e','Year must be between 1990 and 2100.');
const cat=opt(fd,'category_id');if(cat&&!isUuid(cat))back(P,'e','Invalid category.');
let video:string|null,preview:string|null,thumb:string|null;
try{video=https(opt(fd,'video_url'),'Video link');preview=https(opt(fd,'preview_url'),'Preview link');thumb=https(opt(fd,'thumbnail_url'),'Thumbnail link');}catch(e){back(P,'e',(e as Error).message);}
const row={title:title.slice(0,120),slug,category_id:cat,description:txt(fd,'description').slice(0,4000),client:opt(fd,'client'),year,duration:dur,
tags:txt(fd,'tags').split(',').map(s=>s.trim().slice(0,30)).filter(Boolean).slice(0,12),featured:flag(fd,'featured'),published:flag(fd,'published'),video_url:video,preview_url:preview,thumbnail_url:thumb};
let error;
if(id)({error}=await supabase.from('projects').update(row).eq('id',id));
else{const {data:last}=await supabase.from('projects').select('sort_order').order('sort_order',{ascending:false}).limit(1);
({error}=await supabase.from('projects').insert({...row,sort_order:(last?.[0]?.sort_order??0)+1}));}
const m=explain(error);if(m)back(P,'e',m);
refresh();back('/admin/projects','ok',id?'Project saved.':'Project added.');}

export async function toggleProject(fd:FormData){
const {supabase}=await requireAdmin(),id=txt(fd,'id'),f=txt(fd,'field');
if(!isUuid(id)||(f!=='published'&&f!=='featured'))back('/admin/projects','e','Invalid request.');
const {data:p}=await supabase.from('projects').select('published,featured').eq('id',id).single();
if(!p)back('/admin/projects','e','Project not found.');
const {error}=await supabase.from('projects').update({[f]:!p[f as 'published'|'featured']}).eq('id',id);
const m=explain(error);if(m)back('/admin/projects','e',m);
refresh();back('/admin/projects','ok',f==='published'?(p.published?'Project unpublished.':'Project published.'):(p.featured?'Removed from featured.':'Marked as featured.'));}

export async function moveProject(fd:FormData){
const {supabase}=await requireAdmin(),id=txt(fd,'id'),dir=txt(fd,'dir');
if(!isUuid(id))back('/admin/projects','e','Invalid request.');
const {data}=await supabase.from('projects').select('id').order('sort_order').order('created_at');
const ids=(data??[]).map(r=>r.id as string),i=ids.indexOf(id),j=dir==='up'?i-1:i+1;
if(i>=0&&j>=0&&j<ids.length){[ids[i],ids[j]]=[ids[j],ids[i]];
const {error}=await supabase.rpc('reorder_projects',{ids});const m=explain(error);if(m)back('/admin/projects','e',m);}
refresh();redirect('/admin/projects');}

export async function deleteProject(fd:FormData){
const {supabase}=await requireAdmin(),id=txt(fd,'id');
if(!isUuid(id))back('/admin/projects','e','Invalid request.');
// Phase 7: delete the video, preview and thumbnail files from storage here, before removing the row.
const {error}=await supabase.from('projects').delete().eq('id',id);
const m=explain(error);if(m)back('/admin/projects','e',m);
refresh();back('/admin/projects','ok','Project deleted.');}

export async function saveSettings(fd:FormData){
const {supabase}=await requireAdmin(),P='/admin/settings';
const name=txt(fd,'name');if(!name)back(P,'e','Name is required.');
const email=opt(fd,'email');if(email&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))back(P,'e','The email address looks wrong.');
const wa=txt(fd,'whatsapp_number').replace(/[\s+()-]/g,'');if(wa&&!/^\d{8,15}$/.test(wa))back(P,'e','WhatsApp number: digits with country code, like 919876543210.');
let ig:string|null,li:string|null;
try{ig=https(opt(fd,'instagram_url'),'Instagram link');li=https(opt(fd,'linkedin_url'),'LinkedIn link');}catch(e){back(P,'e',(e as Error).message);}
const gb=parseFloat(txt(fd,'storage_cap_gb'));if(!(gb>0&&gb<=1000))back(P,'e','Storage limit must be between 0 and 1000 GB.');
const {error}=await supabase.from('site_settings').update({name:name.slice(0,60),email,instagram_url:ig,linkedin_url:li,whatsapp_number:wa||null,
about:txt(fd,'about').slice(0,1500),tools:lines(txt(fd,'tools'),20,60),delivery:lines(txt(fd,'delivery'),20,120),show_clients:flag(fd,'show_clients'),
email_subject:txt(fd,'email_subject').slice(0,150),email_body:txt(fd,'email_body').slice(0,3000),whatsapp_message:txt(fd,'whatsapp_message').slice(0,1000),social_message:txt(fd,'social_message').slice(0,1000),
storage_cap_bytes:Math.round(gb*1073741824)}).eq('id',1);
const m=explain(error);if(m)back(P,'e',m);
refresh();back(P,'ok','Settings saved.');}
