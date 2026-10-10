'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {requireAdmin} from '@/lib/auth';
import {slugify,txt,opt,flag,isUuid,https,lines} from '@/lib/validate';
import {MEDIA,keyOk,type Kind} from '@/lib/media';
import {deleteObjects,headObject,publicUrl} from '@/lib/r2';
import {embed} from '@/lib/video';
export type Result={error?:string};
function back(path:string,key:'e'|'ok',msg:string):never{redirect(`${path}?${key}=${encodeURIComponent(msg)}`);}
function explain(e:{code?:string;message:string}|null){
if(!e)return null;
if(e.code==='23505')return 'That slug is already used. Pick a different one.';
if(e.message.includes('published_needs_video'))return 'Add a video before publishing.';
if(e.code==='23514')return 'A value is not allowed: '+e.message;
if(e.code==='42501')return 'Not allowed.';
return 'Could not save: '+e.message;}
const refresh=()=>{revalidatePath('/');revalidatePath('/work/[slug]','page');};

// A stored file: an uploaded one has a key in R2, a pasted link has none.
type File={url:string|null;key:string|null;size:number};
const PROJECT_FILES=['video','preview','thumbnail'] as const;
// Reads one file slot from the form. A new upload is checked against R2, which also gives its real size for the storage meter.
async function file(fd:FormData,kind:Kind,old?:File):Promise<File>{
const key=opt(fd,`${kind}_key`),label=MEDIA[kind].label;
if(!key)return{url:https(opt(fd,`${kind}_url`),`${label} link`),key:null,size:0};
if(old?.key===key)return old;
if(!keyOk(kind,key))throw new Error('Invalid upload.');
const head=await headObject(key);
if(!head)throw new Error(`${label}: the upload did not finish. Upload it again.`);
return{url:publicUrl(key),key,size:head.size};}
const stored=(row:Record<string,any>,kind:Kind):File=>({url:row[`${kind}_url`],key:row[`${kind}_key`],size:Number(row[`${kind}_size`]??0)});
// Files that were replaced or removed. The database is already updated, so a failure here only leaves a stray file behind.
async function cleanup(keys:(string|null)[]){try{await deleteObjects(keys)}catch(e){console.error('Storage cleanup failed:',e)}}

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

// Returns errors to the form instead of redirecting, so typed values and finished uploads survive a mistake.
export async function saveProject(fd:FormData):Promise<Result>{
const {supabase}=await requireAdmin(),id=txt(fd,'id'),title=txt(fd,'title');
if(id&&!isUuid(id))return{error:'Invalid request.'};
if(!title)return{error:'Title is required.'};
const slug=slugify(txt(fd,'slug')||title);if(!slug)return{error:'Slug is required.'};
const dur=opt(fd,'duration');if(dur&&!/^\d{1,2}:\d{2}(:\d{2})?$/.test(dur))return{error:'Duration must look like 0:45 or 1:30.'};
const yr=opt(fd,'year'),year=yr?parseInt(yr,10):null;if(year!==null&&!(year>=1990&&year<=2100))return{error:'Year must be between 1990 and 2100.'};
const cat=opt(fd,'category_id');if(cat&&!isUuid(cat))return{error:'Invalid category.'};
let old:Record<string,any>|null=null;
if(id){({data:old}=await supabase.from('projects').select('video_url,video_key,video_size,preview_url,preview_key,preview_size,thumbnail_url,thumbnail_key,thumbnail_size').eq('id',id).maybeSingle());if(!old)return{error:'Project not found.'};}
const f={} as Record<(typeof PROJECT_FILES)[number],File>;
try{for(const k of PROJECT_FILES)f[k]=await file(fd,k,old?stored(old,k):undefined);}catch(e){return{error:(e as Error).message};}
if(f.preview.url&&embed(f.preview.url))return{error:'The preview clip plays inside the card, so it must be a video file (MP4 or WebM), not a YouTube or Vimeo link.'};
const row={title:title.slice(0,120),slug,category_id:cat,description:txt(fd,'description').slice(0,4000),client:opt(fd,'client'),year,duration:dur,
tags:txt(fd,'tags').split(',').map(s=>s.trim().slice(0,30)).filter(Boolean).slice(0,12),featured:flag(fd,'featured'),published:flag(fd,'published'),
...Object.fromEntries(PROJECT_FILES.flatMap(k=>[[`${k}_url`,f[k].url],[`${k}_key`,f[k].key],[`${k}_size`,f[k].size]])),
video_provider:f.video.key||!f.video.url?'r2':embed(f.video.url)?.provider??'link'};
let error;
if(id)({error}=await supabase.from('projects').update(row).eq('id',id));
else{const {data:last}=await supabase.from('projects').select('sort_order').order('sort_order',{ascending:false}).limit(1);
({error}=await supabase.from('projects').insert({...row,sort_order:(last?.[0]?.sort_order??0)+1}));}
const m=explain(error);if(m)return{error:m};
if(old){const o=old;await cleanup(PROJECT_FILES.map(k=>o[`${k}_key`]!==f[k].key?o[`${k}_key`]:null));}
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

// Removes the files first: if storage can't be reached the row stays, so no file is left behind unaccounted for.
async function removeFiles(keys:(string|null)[],P:string,what:string){
if(!keys.some(Boolean))return;
let msg='';try{await deleteObjects(keys)}catch(e){msg=(e as Error).message}
if(msg)back(P,'e',`${msg} The ${what} was not deleted.`);}

export async function deleteProject(fd:FormData){
const {supabase}=await requireAdmin(),id=txt(fd,'id'),P='/admin/projects';
if(!isUuid(id))back(P,'e','Invalid request.');
const {data:p}=await supabase.from('projects').select('video_key,preview_key,thumbnail_key').eq('id',id).maybeSingle();
if(!p)back(P,'e','Project not found.');
await removeFiles([p.video_key,p.preview_key,p.thumbnail_key],P,'project');
const {error}=await supabase.from('projects').delete().eq('id',id);
const m=explain(error);if(m)back(P,'e',m);
refresh();back(P,'ok','Project deleted.');}

export async function saveClient(fd:FormData):Promise<Result>{
const {supabase}=await requireAdmin(),id=txt(fd,'id'),name=txt(fd,'name');
if(id&&!isUuid(id))return{error:'Invalid request.'};
if(!name)return{error:'Name is required.'};
let old:Record<string,any>|null=null;
if(id){({data:old}=await supabase.from('clients').select('logo_url,logo_key,logo_size').eq('id',id).maybeSingle());if(!old)return{error:'Client not found.'};}
let logo:File,site:string|null;
try{logo=await file(fd,'logo',old?stored(old,'logo'):undefined);site=https(opt(fd,'website_url'),'Website link');}catch(e){return{error:(e as Error).message};}
const row={name:name.slice(0,80),website_url:site,logo_url:logo.url,logo_key:logo.key,logo_size:logo.size,published:flag(fd,'published'),sort_order:parseInt(txt(fd,'sort_order')||'0',10)||0};
const {error}=id?await supabase.from('clients').update(row).eq('id',id):await supabase.from('clients').insert(row);
const m=explain(error);if(m)return{error:m};
if(old&&old.logo_key!==logo.key)await cleanup([old.logo_key]);
refresh();back('/admin/clients','ok',id?'Client saved.':'Client added.');}

export async function deleteClient(fd:FormData){
const {supabase}=await requireAdmin(),id=txt(fd,'id'),P='/admin/clients';
if(!isUuid(id))back(P,'e','Invalid request.');
const {data:c}=await supabase.from('clients').select('logo_key').eq('id',id).maybeSingle();
if(!c)back(P,'e','Client not found.');
await removeFiles([c.logo_key],P,'client');
const {error}=await supabase.from('clients').delete().eq('id',id);
const m=explain(error);if(m)back(P,'e',m);
refresh();back(P,'ok','Client deleted.');}

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
