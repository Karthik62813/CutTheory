'use server';
import {requireAdmin} from '@/lib/auth';
import {MEDIA,isKind,size} from '@/lib/media';
import {newKey,publicUrl,r2Enabled,uploadUrl} from '@/lib/r2';
export type Upload={url:string;key:string;publicUrl:string}|{error:string};
// Step 1 of an upload: check the file and the storage limit, then hand the browser a signed address to send it to.
export async function prepareUpload(kind:string,type:string,bytes:number):Promise<Upload>{
const {supabase}=await requireAdmin();
if(!r2Enabled())return{error:'File uploads are not set up yet. Paste a link instead.'};
if(!isKind(kind))return{error:'Invalid request.'};
const m=MEDIA[kind],ext=m.types[type];
if(!ext)return{error:`${m.label}: use ${[...new Set(Object.values(m.types))].join(', ').toUpperCase()}.`};
if(!(bytes>0&&bytes<=m.max))return{error:`${m.label} is too big. The limit is ${size(m.max)}.`};
const [used,cfg]=await Promise.all([supabase.rpc('storage_used_bytes'),supabase.from('site_settings').select('storage_cap_bytes').eq('id',1).single()]);
const cap=Number(cfg.data?.storage_cap_bytes??10737418240),now=Number(used.data??0);
if(now+bytes>cap)return{error:`This file needs ${size(bytes)} but only ${size(Math.max(0,cap-now))} of your storage limit is left. Delete old files or raise the limit in Settings.`};
const key=newKey(kind,ext);
return{url:uploadUrl(key),key,publicUrl:publicUrl(key)};}
