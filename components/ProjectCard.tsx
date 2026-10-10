'use client';
import Link from 'next/link';
import {useRef,useState} from 'react';
import type {Category,Project} from '@/lib/types';
export default function ProjectCard({project:p,category:c}:{project:Project;category?:Category}){
const v=useRef<HTMLVideoElement>(null),th=useRef<HTMLDivElement>(null);
const [sound,setSound]=useState(false),[live,setLive]=useState(false);
const play=(snd=sound)=>{const e=v.current;if(!e)return;e.muted=!snd;e.currentTime=0;e.play().catch(()=>{e.muted=true;e.play().catch(()=>{})})};
const tilt=(e:React.PointerEvent<HTMLDivElement>)=>{if(e.pointerType!=='mouse')return;const r=e.currentTarget.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height,s=th.current!.style;s.setProperty('--ry',(x-.5)*14+'deg');s.setProperty('--rx',(.5-y)*14+'deg');s.setProperty('--gx',x*100+'%');s.setProperty('--gy',y*100+'%')};
const leave=(e:React.PointerEvent)=>{if(e.pointerType!=='mouse')return;v.current?.pause();th.current!.style.setProperty('--rx','0deg');th.current!.style.setProperty('--ry','0deg')};
return(<div className="wk" data-c={c?.slug} style={{'--k':c?.color} as React.CSSProperties} onPointerEnter={e=>{if(e.pointerType==='mouse')play()}} onPointerMove={tilt} onPointerLeave={leave}>
<Link href={`/work/${p.slug}`} className="wk-l"><div className="th" ref={th}>
{p.thumbnail_url&&<img src={p.thumbnail_url} alt="" loading="lazy" decoding="async" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>}
{p.preview_url&&<video ref={v} className={live?'on':undefined} src={p.preview_url} muted loop playsInline preload="none" onPlaying={()=>setLive(true)} onPause={()=>setLive(false)}/>}
{p.featured&&<span className="ft">Featured</span>}{p.duration&&<b>{p.duration}</b>}</div>
<span className="cap"><strong>{p.title}</strong><em>{c?.name}</em></span></Link>
{p.preview_url&&<button className="sb" type="button" aria-pressed={sound} aria-label={sound?'Turn sound off':'Turn sound on'} onClick={()=>{const n=!sound;setSound(n);const e=v.current;if(e){e.muted=!n;if(e.paused)play(n)}}}>
<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3z"/><path className="x" d="M16 9l6 6M22 9l-6 6"/><path className="w" d="M16 8a5 5 0 010 8M19 5a9 9 0 010 14"/></svg></button>}</div>);}
