export const slugify=(s:string)=>s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80);
export const txt=(fd:FormData,k:string)=>String(fd.get(k)??'').trim();
export const opt=(fd:FormData,k:string)=>txt(fd,k)||null;
export const flag=(fd:FormData,k:string)=>fd.get(k)==='on';
export const isUuid=(v:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
export const https=(v:string|null,label:string)=>{if(v&&!/^https:\/\/\S+$/.test(v))throw new Error(`${label} must be a full https:// link.`);return v};
export const lines=(v:string,max:number,len:number)=>v.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).slice(0,max).map(s=>s.slice(0,len));
