'use client';
import {useEffect,useRef,useState} from 'react';
import {loadYT} from '@/lib/youtube';
// The project page player for YouTube links, with our own controls.
// YouTube sends a stream to match the player's size, and only a full-size player (1920x1080, or 1080x1920 for Shorts) got
// the 1080p stream. With YouTube's controls that size would shrink them to a third, so the player is built full size with its
// controls off, scaled to fit (--s), and these controls sit on top at normal size.
const fmt=(s:number)=>{s=Math.max(0,Math.floor(s||0));const h=Math.floor(s/3600),m=Math.floor(s/60)%60,x=String(s%60).padStart(2,'0');return h?`${h}:${String(m).padStart(2,'0')}:${x}`:`${m}:${x}`};
const I={play:<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>,pause:<path d="M8 5v14M16 5v14"/>,again:<><path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4h4"/></>,
speaker:<path d="M3 9v6h4l5 4V5L7 9H3z"/>,waves:<path d="M16 8a5 5 0 010 8M19 5a9 9 0 010 14"/>,cross:<path d="M16 9l6 6M22 9l-6 6"/>,
full:<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>,exit:<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>};
const Icon=({children}:{children:React.ReactNode})=><svg viewBox="0 0 24 24" aria-hidden="true">{children}</svg>;
export default function YouTubePlayer({id,title,tall,poster}:{id:string;title:string;tall:boolean;poster:string|null}){
const wrap=useRef<HTMLDivElement>(null),host=useRef<HTMLDivElement>(null),yp=useRef<any>(null),want=useRef(false),idle=useRef(0);
const [state,setState]=useState(-1),[started,setStarted]=useState(false),[waiting,setWaiting]=useState(false),[failed,setFailed]=useState(false);
const [t,setT]=useState(0),[dur,setDur]=useState(0),[vol,setVol]=useState(100),[muted,setMuted]=useState(false),[full,setFull]=useState(false),[awake,setAwake]=useState(true),[canFull,setCanFull]=useState(false);
const pw=tall?1080:1920,ph=tall?1920:1080,playing=state===1||state===3,ended=state===0;
useEffect(()=>{let gone=false;const w=wrap.current!;
const fit=()=>w.style.setProperty('--s',String(Math.min(w.clientWidth/pw,w.clientHeight/ph))),ro=new ResizeObserver(fit);fit();ro.observe(w);
setCanFull(!!document.fullscreenEnabled);
const fs=()=>setFull(document.fullscreenElement===w);document.addEventListener('fullscreenchange',fs);
loadYT().then(YT=>{if(gone||!host.current)return;
yp.current=new YT.Player(host.current.appendChild(document.createElement('div')),{host:'https://www.youtube-nocookie.com',videoId:id,width:pw,height:ph,
playerVars:{controls:0,disablekb:1,fs:0,iv_load_policy:3,playsinline:1,rel:0,origin:location.origin},
events:{onReady:(e:any)=>{e.target.getIframe().tabIndex=-1;e.target.setVolume(100);setDur(e.target.getDuration());if(want.current){e.target.unMute();e.target.playVideo()}},
onStateChange:(e:any)=>{setState(e.data);if(e.data===1){setStarted(true);setWaiting(false);setDur(e.target.getDuration())}},
onError:()=>{setFailed(true);setWaiting(false)}}});},()=>setFailed(true));
return()=>{gone=true;ro.disconnect();document.removeEventListener('fullscreenchange',fs);clearTimeout(idle.current);yp.current?.destroy?.();yp.current=null}},[id,pw,ph]);
// The playhead, read from YouTube while the video plays.
useEffect(()=>{if(!playing)return;const r=setInterval(()=>{const y=yp.current;if(y?.getCurrentTime)setT(y.getCurrentTime())},200);return()=>clearInterval(r)},[playing]);
// Controls fade out after 2.5 s without the mouse moving while the video plays.
const poke=()=>{setAwake(true);clearTimeout(idle.current);idle.current=window.setTimeout(()=>setAwake(false),2500)};
const y=()=>yp.current?.playVideo?yp.current:null;
const play=()=>{const p=y();if(!p){want.current=true;setWaiting(true);return}if(ended){p.seekTo(0,true);setT(0)}if(!muted)p.unMute();p.playVideo()};
const toggle=()=>{if(playing)y()?.pauseVideo();else play();poke()};
const seek=(v:number)=>{const p=y();if(!p)return;v=Math.min(Math.max(v,0),dur||v);setT(v);p.seekTo(v,true)};
const volume=(v:number)=>{const p=y();setVol(v||vol);setMuted(!v);if(!p)return;if(v){p.setVolume(v);p.unMute()}else p.mute()};
const mute=()=>{const p=y();setMuted(!muted);if(!muted)p?.mute();else{p?.setVolume(vol);p?.unMute()}};
const fullscreen=()=>{if(document.fullscreenElement)document.exitFullscreen();else wrap.current?.requestFullscreen?.()};
const key=(e:React.KeyboardEvent)=>{const k=e.key.toLowerCase(),tag=(e.target as HTMLElement).tagName;
if(k===' '&&tag==='BUTTON')return;
if(k===' '||k==='k'){e.preventDefault();toggle()}else if(k==='m')mute();else if(k==='f'&&canFull)fullscreen();
else if((k==='arrowleft'||k==='arrowright')&&tag!=='INPUT'){e.preventDefault();seek(t+(k==='arrowleft'?-5:5))}else return;poke()};
const cover=!started||ended;
return(<div ref={wrap} className={'pf yp'+(tall?' tall':'')+(playing&&!awake?' idle':'')} tabIndex={0} role="group" aria-label={`${title}, video player`}
onPointerMove={poke} onPointerDown={poke} onPointerLeave={()=>{if(playing)setAwake(false)}} onKeyDown={key}>
<div ref={host} className="yh" aria-hidden="true"/>
<div className="ys" aria-hidden="true" onClick={toggle} onDoubleClick={canFull?fullscreen:undefined}/>
{cover&&<div className="yo">{poster&&<img src={poster} alt=""/>}</div>}
{cover&&!failed&&!waiting&&<button type="button" className="ybig" onClick={play} aria-label={ended?'Play again':'Play video'}><Icon>{ended?I.again:I.play}</Icon></button>}
{(waiting||(started&&state===3))&&!failed&&<span className="yspin" aria-hidden="true"/>}
{failed&&<div className="yerr"><p>This video can&apos;t play here.</p><a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noreferrer">Watch it on YouTube</a></div>}
{started&&!ended&&!failed&&<div className="yc">
<input className="yseek" type="range" min={0} max={dur||1} step="any" value={Math.min(t,dur||1)} onChange={e=>seek(+e.target.value)} aria-label="Seek" aria-valuetext={`${fmt(t)} of ${fmt(dur)}`}/>
<div className="ycr">
<button type="button" onClick={toggle} aria-label={playing?'Pause':'Play'}><Icon>{playing?I.pause:I.play}</Icon></button>
<div className="yvol"><button type="button" onClick={mute} aria-label={muted?'Unmute':'Mute'}><Icon>{I.speaker}{muted||!vol?I.cross:I.waves}</Icon></button>
<input type="range" min={0} max={100} step={5} value={muted?0:vol} onChange={e=>volume(+e.target.value)} aria-label="Volume"/></div>
<span className="ytime">{fmt(t)} / {fmt(dur)}</span>
{canFull&&<button type="button" className="yfs" onClick={fullscreen} aria-label={full?'Exit full screen':'Full screen'}><Icon>{full?I.exit:I.full}</Icon></button>}
</div></div>}
</div>);}
