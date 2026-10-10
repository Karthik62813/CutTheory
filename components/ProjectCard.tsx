'use client';
import Link from 'next/link';
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import type {Category,Project} from '@/lib/types';
import {youtubeId} from '@/lib/video';
// Sound and volume are shared by every card. Sound is on by default, but browsers only allow it after the visitor
// has clicked, tapped or pressed a key on the page (`ok`); until then cards play muted.
let snd={on:true,vol:80,ok:false};const subs=new Set<()=>void>();
const setSnd=(n:Partial<typeof snd>)=>{snd={...snd,...n};subs.forEach(f=>f())};
const subscribe=(f:()=>void)=>{subs.add(f);return()=>{subs.delete(f)}},getSnd=()=>snd;
// The sound controls are skipped: they set `ok` themselves, and doing it here first would make the speaker's click turn sound off.
let armed=false;
const arm=()=>{if(armed)return;armed=true;const ua=navigator.userActivation;if(ua?.hasBeenActive)return setSnd({ok:true});
const T=['pointerdown','pointerup','keydown','click'],f=(e:Event)=>{if((e.target as Element).closest?.('.snd'))return;if(ua?.hasBeenActive??true){setSnd({ok:true});T.forEach(t=>document.removeEventListener(t,f,true))}};
T.forEach(t=>document.addEventListener(t,f,true))};
// YouTube's player script loads on the first hover, not with the page.
let api:Promise<any>|null=null;
const loadYT=()=>api??=new Promise((ok,fail)=>{const w=window as any;if(w.YT?.Player)return ok(w.YT);const prev=w.onYouTubeIframeAPIReady;w.onYouTubeIframeAPIReady=()=>{prev?.();ok(w.YT)};
const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.onerror=()=>{api=null;s.remove();fail()};document.head.appendChild(s)});
// One YouTube player at a time: starting a card's player removes the previous card's.
let current:(()=>void)|null=null;
export default function ProjectCard({project:p,category:c}:{project:Project;category?:Category}){
const v=useRef<HTMLVideoElement>(null),th=useRef<HTMLDivElement>(null),box=useRef<HTMLDivElement>(null),yp=useRef<any>(null),stop=useRef<(()=>void)|null>(null),want=useRef(false);
const {on,vol,ok}=useSyncExternalStore(subscribe,getSnd,getSnd),sound=on&&ok,[live,setLive]=useState(false);
// Without its own preview clip, a YouTube project plays its video in the card.
const yt=p.preview_url?null:youtubeId(p.video_url);
useEffect(()=>{const e=v.current;if(e){e.muted=!sound;e.volume=vol/100}const y=yp.current;if(y?.setVolume){y.setVolume(vol);if(sound)y.unMute();else y.mute()}},[sound,vol]);
useEffect(()=>{arm();return()=>stop.current?.()},[]);
const play=()=>{const e=v.current;if(!e)return;e.muted=!(snd.on&&snd.ok);e.volume=snd.vol/100;e.currentTime=0;e.play().catch(()=>{e.muted=true;e.play().catch(()=>{})})};
const startYt=async()=>{
if(yp.current){yp.current.seekTo?.(0,true);yp.current.playVideo?.();return}
let YT;try{YT=await loadYT()}catch{return}
if(!want.current||yp.current||!box.current)return;
current?.();
const s=()=>{yp.current?.destroy?.();yp.current=null;box.current?.replaceChildren();setLive(false);stop.current=null;if(current===s)current=null};
stop.current=current=s;
yp.current=new YT.Player(box.current.appendChild(document.createElement('div')),{host:'https://www.youtube-nocookie.com',videoId:yt,
playerVars:{autoplay:1,mute:1,controls:0,disablekb:1,fs:0,iv_load_policy:3,playsinline:1,rel:0,origin:location.origin},
events:{onReady:(e:any)=>{e.target.setVolume(snd.vol);if(snd.on&&snd.ok)e.target.unMute();if(want.current)e.target.playVideo();else e.target.pauseVideo()},
// Restarts at the end by hand: YouTube's own loop turns the video into a playlist with previous and next buttons.
onStateChange:(e:any)=>{if(e.data===1)setLive(true);else if(e.data===2)setLive(false);else if(e.data===0){e.target.seekTo(0,true);e.target.playVideo()}}}});};
const start=()=>{want.current=true;if(yt)startYt();else play()};
const tilt=(e:React.PointerEvent<HTMLDivElement>)=>{if(e.pointerType!=='mouse'||(e.target as Element).closest('.snd'))return;const r=e.currentTarget.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height,s=th.current!.style;s.setProperty('--ry',(x-.5)*14+'deg');s.setProperty('--rx',(.5-y)*14+'deg');s.setProperty('--gx',x*100+'%');s.setProperty('--gy',y*100+'%')};
const leave=(e:React.PointerEvent)=>{if(e.pointerType!=='mouse')return;want.current=false;v.current?.pause();if(yp.current){yp.current.pauseVideo?.();setLive(false)}th.current!.style.setProperty('--rx','0deg');th.current!.style.setProperty('--ry','0deg')};
// The sound button also starts playback, so touch screens without hover can still play the card.
const toggle=()=>{const n=!sound;setSnd({on:n,ok:true,vol:n&&!vol?80:vol});if(!want.current||!live)start();else if(yt)yp.current?.playVideo?.()};
return(<div className="wk" data-c={c?.slug} style={{'--k':c?.color} as React.CSSProperties} onPointerEnter={e=>{if(e.pointerType==='mouse')start()}} onPointerMove={tilt} onPointerLeave={leave}>
<Link href={`/work/${p.slug}`} className="wk-l"><div className="th" ref={th}>
{p.thumbnail_url&&<img src={p.thumbnail_url} alt="" loading="lazy" decoding="async" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>}
{p.preview_url&&<video ref={v} className={live?'on':undefined} src={p.preview_url} muted loop playsInline preload="none" onPlaying={()=>setLive(true)} onPause={()=>setLive(false)}/>}
{yt&&<div ref={box} className={live?'yt on':'yt'}/>}
{p.featured&&<span className="ft">Featured</span>}{p.duration&&<b>{p.duration}</b>}</div>
<span className="cap"><strong>{p.title}</strong><em>{c?.name}</em></span></Link>
{(p.preview_url||yt)&&<div className="snd">
<button className="sb" type="button" aria-pressed={sound} aria-label={sound?'Turn sound off':'Turn sound on'} onClick={toggle}>
<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3z"/><path className="x" d="M16 9l6 6M22 9l-6 6"/><path className="w" d="M16 8a5 5 0 010 8M19 5a9 9 0 010 14"/></svg></button>
<div className="vol"><input type="range" min={0} max={100} step={5} value={sound?vol:0} aria-label="Volume" onChange={e=>{const n=+e.target.value;setSnd(n?{on:true,ok:true,vol:n}:{on:false})}}/></div></div>}</div>);}
