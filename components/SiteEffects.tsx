'use client';
import {useEffect} from 'react';
export default function SiteEffects(){
useEffect(()=>{
const d=document,R=d.documentElement,$$=<T extends HTMLElement=HTMLElement>(s:string)=>Array.from(d.querySelectorAll<T>(s));
const rm=matchMedia('(prefers-reduced-motion:reduce)').matches,fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
const off:(()=>void)[]=[];
const on=(t:EventTarget,ev:string,fn:EventListener,o?:AddEventListenerOptions)=>{t.addEventListener(ev,fn,o);off.push(()=>t.removeEventListener(ev,fn))};
const rv=$$('h2,.chips,.wk,.sv,.ab>*,.mail,.so,.band,.cl,.pv,.nx');rv.forEach(e=>e.classList.add('rv'));
$$('.grid,.sl,.cls').forEach(g=>Array.from(g.children).forEach((c,i)=>(c as HTMLElement).style.setProperty('--d',String(i%3))));
// Sections the nav links point at; on project pages they live on the home page, so they are missing here.
const bar=d.getElementById('pg'),links=$$<HTMLAnchorElement>('nav .hl'),secs=links.map(a=>d.getElementById(a.hash.slice(1)));
let tk=0,raf=0;
const sc=()=>{tk=0;rv.forEach(e=>{if(!e.classList.contains('in')&&e.getBoundingClientRect().top<innerHeight*.92)e.classList.add('in')});const y=scrollY,m=R.scrollHeight-innerHeight;R.style.setProperty('--sy',String(y));if(bar)bar.style.transform=`scaleX(${m>0?y/m:0})`;let c=-1;secs.forEach((s,i)=>{if(s&&s.getBoundingClientRect().top<innerHeight*.4)c=i});links.forEach((a,i)=>a.classList.toggle('on',i===c))};
on(window,'scroll',()=>{tk||(tk=requestAnimationFrame(sc))},{passive:true});on(window,'resize',sc);sc();
on(window,'pointermove',e=>{const p=e as PointerEvent;R.style.setProperty('--mx',p.clientX+'px');R.style.setProperty('--my',p.clientY+'px')},{passive:true});
if(fine&&!rm){
const c=d.getElementById('cur')!;let cx=0,cy=0,mx=0,my=0,seen=false;
on(window,'pointermove',e=>{const p=e as PointerEvent;mx=p.clientX;my=p.clientY;if(!seen){seen=true;cx=mx;cy=my;c.style.opacity='1'}});
// Over a project card or the video player the cursor stays a plain ring, so it never covers the video or its controls.
on(d,'pointerover',e=>{const t=e.target as Element,k=!!t.closest('.wk,.yp');c.classList.toggle('big',!k&&!!t.closest('a,button,.tl'));c.dataset.t=!k&&t.closest('.tl')?'Drag':''});
const loop=()=>{cx+=(mx-cx)*.18;cy+=(my-cy)*.18;c.style.transform=`translate(${cx}px,${cy}px) translate(-50%,-50%)`;raf=requestAnimationFrame(loop)};loop();
$$('.btn').forEach(b=>{on(b,'pointermove',e=>{const p=e as PointerEvent,r=b.getBoundingClientRect();b.style.transform=`translate(${(p.clientX-r.left-r.width/2)*.25}px,${(p.clientY-r.top-r.height/2)*.35}px)`});on(b,'pointerleave',()=>{b.style.transform=''})});}
return()=>{off.forEach(f=>f());cancelAnimationFrame(raf)};
},[]);
return null;}
