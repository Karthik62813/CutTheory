// YouTube's IFrame player script, loaded once on first use rather than with the page. Browser only.
let api:Promise<any>|null=null;
export const loadYT=()=>api??=new Promise((ok,fail)=>{const w=window as any;if(w.YT?.Player)return ok(w.YT);const prev=w.onYouTubeIframeAPIReady;w.onYouTubeIframeAPIReady=()=>{prev?.();ok(w.YT)};
const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.onerror=()=>{api=null;s.remove();fail()};document.head.appendChild(s)});
