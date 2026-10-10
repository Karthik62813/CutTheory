'use client';
import {useRef,useState} from 'react';
import {MEDIA,size,type Kind} from '@/lib/media';
import {prepareUpload} from './upload';
// One file slot (video, preview, thumbnail or logo): upload straight to storage, or paste a link.
// The link box always shows what will be saved; uploading fills it in, typing in it drops the uploaded file.
export default function MediaField({kind,label,hint,url,fileKey,uploads,onBusy}:{kind:Kind;label:string;hint?:string;url:string|null;fileKey:string|null;uploads:boolean;onBusy:(b:boolean)=>void}){
const m=MEDIA[kind],pick=useRef<HTMLInputElement>(null),xhr=useRef<XMLHttpRequest|null>(null);
const [v,setV]=useState(url??''),[k,setK]=useState(fileKey??''),[pct,setPct]=useState<number|null>(null),[err,setErr]=useState('');
const busy=(b:boolean)=>{setPct(b?0:null);onBusy(b)};
async function upload(f:File){
setErr('');busy(true);
try{
const r=await prepareUpload(kind,f.type,f.size);
if('error' in r)throw new Error(r.error);
await new Promise<void>((ok,bad)=>{const x=new XMLHttpRequest();xhr.current=x;x.open('PUT',r.url);x.setRequestHeader('Content-Type',f.type);
x.upload.onprogress=e=>{if(e.lengthComputable)setPct(Math.round(e.loaded/e.total*100))};
x.onload=()=>x.status<300?ok():bad(new Error(`Upload failed (${x.status}).`));
x.onerror=()=>bad(new Error('Upload failed. Check your connection, and that the R2 bucket allows uploads from this site (see README).'));
x.onabort=()=>bad(new Error('Upload cancelled.'));x.send(f);});
setV(r.publicUrl);setK(r.key);
}catch(e){setErr((e as Error).message)}finally{xhr.current=null;busy(false);if(pick.current)pick.current.value='';}}
const video=kind==='video'||kind==='preview';
return(<div className="ad-media"><span className="ad-media-l">{label}</span>{hint&&<span className="ad-mut ad-small">{hint}</span>}
<div className="ad-media-row">{v&&(video?<video src={v} muted playsInline preload="metadata" className="ad-media-p"/>:<img src={v} alt="" className="ad-media-p"/>)}
<input name={`${kind}_url`} value={v} onChange={e=>{setV(e.target.value);setK('')}} placeholder="https://..." aria-label={`${label} link`} disabled={pct!==null}/>
<input type="hidden" name={`${kind}_key`} value={k}/>
{uploads&&(pct===null?<button type="button" className="ad-btn ghost" onClick={()=>pick.current?.click()}>{v?'Replace':'Upload'}</button>
:<button type="button" className="ad-btn ghost" onClick={()=>xhr.current?.abort()}>Cancel</button>)}
{v&&pct===null&&<button type="button" className="ad-btn ghost" onClick={()=>{setV('');setK('')}}>Remove</button>}</div>
{uploads&&<input ref={pick} type="file" hidden accept={Object.keys(m.types).join(',')} onChange={e=>{const f=e.target.files?.[0];if(f)upload(f)}}/>}
{pct!==null&&<div className="ad-bar" role="progressbar" aria-label={`Uploading ${label}`} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><i style={{width:pct+'%'}}/></div>}
{pct!==null&&<span className="ad-mut ad-small">Uploading... {pct}%. Keep this tab open.</span>}
{k&&k!==fileKey&&pct===null&&<span className="ad-mut ad-small">Uploaded. It is kept when you save.</span>}
{!k&&uploads&&pct===null&&<span className="ad-mut ad-small">{Object.values(m.types).filter((t,i,a)=>a.indexOf(t)===i).join(', ').toUpperCase()}, up to {size(m.max)}</span>}
{err&&<span className="ad-err ad-small" role="alert">{err}</span>}</div>);}
