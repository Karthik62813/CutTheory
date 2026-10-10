// Turns a YouTube or Vimeo link into its embed player. Any other link is treated as a video file.
export function embed(url:string):{src:string;provider:'youtube'|'vimeo';tall:boolean}|null{
let u:URL;try{u=new URL(url)}catch{return null}
const id=ytId(u);
if(id)return{src:`https://www.youtube-nocookie.com/embed/${id}?rel=0`,provider:'youtube',tall:u.pathname.startsWith('/shorts/')};
const h=u.hostname.replace(/^(www|m)\./,'');
if(h==='vimeo.com'||h==='player.vimeo.com'){
const m=u.pathname.match(/\/(\d{5,})(?:\/([\da-f]{6,}))?/);
return m?{src:`https://player.vimeo.com/video/${m[1]}${m[2]?`?h=${m[2]}`:u.searchParams.get('h')?`?h=${u.searchParams.get('h')}`:''}`,provider:'vimeo',tall:false}:null;}
return null;}
// The 11-character id in a YouTube watch, youtu.be, Shorts, embed or live link.
function ytId(u:URL){
const h=u.hostname.replace(/^(www|m)\./,'');
if(h!=='youtu.be'&&h!=='youtube.com'&&h!=='youtube-nocookie.com')return null;
return (h==='youtu.be'?u.pathname.slice(1):u.searchParams.get('v')??u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)/)?.[1])?.match(/^[\w-]{11}$/)?.[0]??null;}
export const youtubeId=(url:string|null)=>{try{return url?ytId(new URL(url)):null}catch{return null}};
// YouTube's own cover images. mqdefault always exists and, unlike hqdefault, has no black bars, so it crops cleanly into a tall card.
const ytImg=(id:string,size:'maxresdefault'|'mqdefault')=>`https://i.ytimg.com/vi/${id}/${size}.jpg`;
export const youtubeThumbSmall=(url:string|null)=>{const id=youtubeId(url);return id?ytImg(id,'mqdefault'):null};
// The sharp 1280px image only exists for HD uploads, and only once YouTube has finished processing them, so check before using it.
// Only hits are remembered: a fresh upload that gains its HD image later is picked up on the next render.
const hd=new Set<string>();
export async function youtubeThumb(url:string|null):Promise<string|null>{
const id=youtubeId(url);if(!id)return null;
if(hd.has(id))return ytImg(id,'maxresdefault');
try{const r=await fetch(ytImg(id,'maxresdefault'),{method:'HEAD',signal:AbortSignal.timeout(3000)});if(r.ok){hd.add(id);return ytImg(id,'maxresdefault');}}catch{}
return ytImg(id,'mqdefault');}
