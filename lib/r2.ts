import {createHash,createHmac,randomUUID} from 'node:crypto';
// Cloudflare R2 through its S3 API, signed with AWS Signature V4. Server only: the secret key never reaches the browser.
type R2={account:string;keyId:string;secret:string;bucket:string;publicUrl:string};
function config():R2|null{
const e=process.env,account=e.R2_ACCOUNT_ID,keyId=e.R2_ACCESS_KEY_ID,secret=e.R2_SECRET_ACCESS_KEY,bucket=e.R2_BUCKET,pub=e.R2_PUBLIC_URL;
return account&&keyId&&secret&&bucket&&pub?{account,keyId,secret,bucket,publicUrl:pub.replace(/\/+$/,'')}:null;}
export const r2Enabled=()=>config()!==null;
function need(){const c=config();if(!c)throw new Error('File storage is not set up. Add the R2_ settings from .env.example.');return c;}

const hex=(d:string)=>createHash('sha256').update(d).digest('hex');
const hmac=(k:string|Buffer,d:string)=>createHmac('sha256',k).update(d).digest();
const enc=(s:string)=>encodeURIComponent(s).replace(/[!'()*]/g,c=>'%'+c.charCodeAt(0).toString(16).toUpperCase());
type Sig={method:string;host:string;path:string;region:string;keyId:string;secret:string;now:Date;expires?:number;headers?:Record<string,string>};
// Exported for the signing test. Query signing (expires set) makes a shareable URL; otherwise it returns request headers.
export function sigv4({method,host,path,region,keyId,secret,now,expires,headers={}}:Sig){
const amz=now.toISOString().replace(/[-:]|\.\d{3}/g,''),day=amz.slice(0,8),scope=`${day}/${region}/s3/aws4_request`;
const h:Record<string,string>={host,...headers},q:Record<string,string>={};
if(expires)Object.assign(q,{'X-Amz-Algorithm':'AWS4-HMAC-SHA256','X-Amz-Credential':`${keyId}/${scope}`,'X-Amz-Date':amz,'X-Amz-Expires':String(expires)});
else{h['x-amz-content-sha256']??='UNSIGNED-PAYLOAD';h['x-amz-date']=amz;}
const names=Object.keys(h).map(n=>n.toLowerCase()).sort(),signed=names.join(';'),lower=Object.fromEntries(Object.entries(h).map(([k,v])=>[k.toLowerCase(),v.trim()]));
if(expires)q['X-Amz-SignedHeaders']=signed;
const qs=Object.keys(q).sort().map(k=>`${enc(k)}=${enc(q[k])}`).join('&');
const canon=[method,path,qs,names.map(n=>`${n}:${lower[n]}\n`).join(''),signed,lower['x-amz-content-sha256']??'UNSIGNED-PAYLOAD'].join('\n');
const key=hmac(hmac(hmac(hmac('AWS4'+secret,day),region),'s3'),'aws4_request');
const signature=createHmac('sha256',key).update(['AWS4-HMAC-SHA256',amz,scope,hex(canon)].join('\n')).digest('hex');
if(expires)return{url:`https://${host}${path}?${qs}&X-Amz-Signature=${signature}`,headers:{}};
const {host:_,...out}=lower;
return{url:`https://${host}${path}`,headers:{...out,authorization:`AWS4-HMAC-SHA256 Credential=${keyId}/${scope}, SignedHeaders=${signed}, Signature=${signature}`}};}

const req=(c:R2,method:string,key:string,expires?:number)=>sigv4({method,host:`${c.account}.r2.cloudflarestorage.com`,path:`/${c.bucket}/${key.split('/').map(enc).join('/')}`,region:'auto',keyId:c.keyId,secret:c.secret,now:new Date(),expires});
export const newKey=(kind:string,ext:string)=>`${kind}/${randomUUID()}.${ext}`;
export const publicUrl=(key:string)=>`${need().publicUrl}/${key}`;
// A one-hour URL the browser uploads the file to directly, so large videos never pass through this server.
export const uploadUrl=(key:string)=>req(need(),'PUT',key,3600).url;
export async function headObject(key:string):Promise<{size:number}|null>{
const {url,headers}=req(need(),'HEAD',key),r=await fetch(url,{method:'HEAD',headers,cache:'no-store'});
if(r.status===404)return null;
if(!r.ok)throw new Error(`File storage answered ${r.status}. Check the R2_ settings.`);
return{size:Number(r.headers.get('content-length')??0)};}
export async function deleteObjects(keys:(string|null|undefined)[]){
const list=keys.filter((k):k is string=>!!k);if(!list.length)return;
const c=need();
for(const k of list){const {url,headers}=req(c,'DELETE',k),r=await fetch(url,{method:'DELETE',headers,cache:'no-store'});
if(!r.ok&&r.status!==404)throw new Error(`Could not delete a file from storage (${r.status}).`);}}
