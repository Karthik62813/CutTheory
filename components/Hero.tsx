'use client';
import {useEffect,useRef} from 'react';
const W:[string,string][]=[['I',''],['cut',''],['footage',''],['into',''],['stories','o'],['people',''],['finish.','g']];
const T:[string,[string,number][]][]=[['V2',[['Title card',2],['',3],['Lower third',2],['',2],['End card',3]]],['V1',[['Interview A',4],['B-roll',3],['Interview B',4],['Drone',3],['Montage',3]]],['A1',[['Music intro',5],['Music, main',12]]]];
const pad=(n:number)=>String(n).padStart(2,'0');
export default function Hero(){
const tl=useRef<HTMLDivElement>(null),ph=useRef<HTMLElement>(null),tc=useRef<HTMLSpanElement>(null);
useEffect(()=>{
const el=tl.current!,D=12,rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
let p=.18,drag=false,vis=true,last=performance.now(),raf=0;
const mv=(e:PointerEvent)=>{const r=el.getBoundingClientRect();p=Math.min(1,Math.max(0,(e.clientX-r.left)/r.width))};
const ev:[string,(e:PointerEvent)=>void][]=[['pointerdown',e=>{drag=true;el.setPointerCapture(e.pointerId);mv(e)}],['pointermove',e=>{if(drag)mv(e)}],['pointerup',()=>{drag=false}],['pointercancel',()=>{drag=false}]];
ev.forEach(([n,h])=>el.addEventListener(n,h as EventListener));
const io=new IntersectionObserver(([e])=>{vis=e.isIntersecting});io.observe(el);
const f=(n:number)=>{if(vis){if(!drag&&!rm)p=(p+(n-last)/1000/D)%1;const t=p*D;ph.current!.style.left=p*100+'%';tc.current!.textContent=`00:00:${pad(~~t)}:${pad(~~(t%1*24))}`}last=n;raf=requestAnimationFrame(f)};
raf=requestAnimationFrame(f);
return()=>{cancelAnimationFrame(raf);io.disconnect();ev.forEach(([n,h])=>el.removeEventListener(n,h as EventListener))};
},[]);
return(<div className="hero w"><div className="st"><i/>Taking on new projects</div>
<h1>{W.map(([w,c],i)=>(<span key={i}><span className="wd"><span className={c||undefined} style={{'--i':i} as React.CSSProperties}>{w}</span></span>{' '}</span>))}</h1>
<p className="lead">I&apos;m Karthik, a video editor for creators and brands. Reels, brand films and music videos, paced for the first three seconds and the last.</p>
<div className="cta"><a className="btn" href="#work">See my work</a><a className="btn o" href="#contact">Start a project</a></div>
<div className="tl" ref={tl} aria-label="Editing timeline. Drag to scrub."><div className="rl"><span ref={tc}>00:00:02:00</span><span>Drag to scrub</span></div>
{T.map(([n,cl])=>(<div className="tk" data-n={n} key={n}>{cl.map(([l,fx],i)=>(<i key={i} className={l?'c':undefined} style={{flex:fx}}>{l}</i>))}</div>))}
<b className="ph" ref={ph}/></div></div>);}
