'use client';
import Link from 'next/link';
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import type {Category,Project} from '@/lib/types';
import {embed,youtubeId} from '@/lib/video';
import {loadYT} from '@/lib/youtube';
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
const touch=()=>matchMedia('(hover: none)').matches;
// Live YouTube players, least recently used first. Phones keep three: the previous, playing and next card. Building one takes about a second, which was most of the hover delay,
// so on desktop each card near the screen builds its player ahead of time (one at a time, through the queue) and keeps it
// until it scrolls far away. Players are heavy, so past the cap the oldest idle one is removed.
type Live={stop:()=>void;busy:()=>boolean};const pool:Live[]=[];let queue=Promise.resolve();
// Even a ready player took about 4 s to start the first time on a page: YouTube first has to connect to its video servers.
// So the first card's player plays muted and hidden for a moment, then pauses. That opens the connection (other cards then
// started in about 1 s) and leaves this card buffered (about 0.3 s). It costs a few MB once, so it is skipped on data saver
// and slow connections.
let primed=false;
const canPrime=()=>{const c=(navigator as any).connection;return !(c?.saveData||/2g|3g/.test(c?.effectiveType??''))};
const use=(l:Live)=>{const i=pool.indexOf(l);if(i>=0)pool.splice(i,1);pool.push(l);
for(const o of [...pool])if(pool.length>(touch()?3:8)&&o!==l&&!o.busy())o.stop()};
// Phones have no hover, so the card nearest the middle of the screen (at least 60% visible) plays instead, muted until
// the visitor turns sound on. Skipped for visitors who ask for reduced motion: they can still play a card with its sound button.
// While a card plays, the next YouTube card further down the page builds its player so it is ready when scrolled to.
// Further down, not just next in the list: on a two-column phone grid the card beside this one never becomes the playing one.
type Seen={ratio:number;yt:boolean;start:()=>void;pause:()=>void;build:()=>Promise<void>};const seen=new Map<Element,Seen>();let focused:Element|null=null;
const focus=(el:Element|null)=>{if(el===focused)return;if(focused)seen.get(focused)?.pause();focused=el;if(!el)return;seen.get(el)?.start();
const y=el.getBoundingClientRect().bottom,next=[...seen.keys()].filter(k=>seen.get(k)!.yt&&k.getBoundingClientRect().top>=y-1).sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top)[0];
if(next)queue=queue.then(()=>seen.get(next)?.build())};
const refocus=()=>{let best:Element|null=null,d=Infinity;const mid=innerHeight/2;
for(const [el,x] of seen){if(x.ratio<.6)continue;const r=el.getBoundingClientRect(),gap=Math.abs(r.top+r.height/2-mid);if(gap<d){d=gap;best=el}}
focus(best)};
export default function ProjectCard({project:p,category:c}:{project:Project;category?:Category}){
const wk=useRef<HTMLDivElement>(null),v=useRef<HTMLVideoElement>(null),th=useRef<HTMLDivElement>(null),box=useRef<HTMLDivElement>(null),yp=useRef<any>(null),me=useRef<Live|null>(null),want=useRef(false),building=useRef(false),priming=useRef(false);
const {on,vol,ok}=useSyncExternalStore(subscribe,getSnd,getSnd),sound=on&&ok,[live,setLive]=useState(false);
// Without its own preview clip, a YouTube project plays its video in the card.
const yt=p.preview_url?null:youtubeId(p.video_url),tall=!!yt&&!!embed(p.video_url!)?.tall;
useEffect(()=>{const e=v.current;if(e){e.muted=!sound;e.volume=vol/100}const y=yp.current;if(y?.setVolume){y.setVolume(vol);if(sound)y.unMute();else y.mute()}},[sound,vol]);
const play=()=>{const e=v.current;if(!e)return;e.muted=!(snd.on&&snd.ok);e.volume=snd.vol/100;e.currentTime=0;e.play().catch(()=>{e.muted=true;e.play().catch(()=>{})})};
// Builds this card's YouTube player, cued and silent; it starts at once if the card is wanted by the time it is ready.
const make=(warm=false)=>new Promise<void>(async done=>{
if(!yt||yp.current||building.current||!box.current)return done();
building.current=true;let YT;try{YT=await loadYT()}catch{building.current=false;return done()}
const b=box.current;if(!b){building.current=false;return done()}
// YouTube picks its stream from the player's size, and at the card's own size it sent 360p. So the player is built full
// size and scaled down: 1920x1080, or 1080x1920 for a Shorts link, the only shape that got vertical video its 1080p stream.
// The extra 1.3x zoom pushes YouTube's title bar and "More videos" button outside the card.
const ph=tall?1920:1080,fit=()=>b.style.setProperty('--s',String(b.clientHeight*1.3/ph)),ro=new ResizeObserver(fit);fit();ro.observe(b);
const l:Live={busy:()=>want.current||building.current,stop:()=>{ro.disconnect();yp.current?.destroy?.();yp.current=null;building.current=false;b.replaceChildren();setLive(false);
if(me.current===l)me.current=null;const i=pool.indexOf(l);if(i>=0)pool.splice(i,1);done()}};
me.current=l;use(l);setTimeout(done,8000);
yp.current=new YT.Player(b.appendChild(document.createElement('div')),{host:'https://www.youtube-nocookie.com',videoId:yt,width:tall?1080:1920,height:ph,
playerVars:{autoplay:0,mute:1,controls:0,disablekb:1,fs:0,iv_load_policy:3,playsinline:1,rel:0,origin:location.origin},
events:{onReady:(e:any)=>{building.current=false;e.target.setVolume(snd.vol);if(snd.on&&snd.ok)e.target.unMute();if(want.current)e.target.playVideo();
else if(warm||(seen.get(wk.current!)?.ratio??0)>0)prime();done()},
// Restarts at the end by hand: YouTube's own loop turns the video into a playlist with previous and next buttons.
onStateChange:(e:any)=>{if(e.data===1&&priming.current){priming.current=false;if(!want.current){e.target.pauseVideo();e.target.seekTo(0,true);return}}
if(e.data===1)setLive(true);else if(e.data===2)setLive(false);else if(e.data===0){e.target.seekTo(0,true);e.target.playVideo()}},
onError:()=>{building.current=false;done()}}});});
// Plays this card muted and hidden until it is moving, then pauses it (see primed). Phone browsers won't play video
// that is off screen, so on a phone this runs when the card first appears rather than when its player is built.
// Only the first YouTube card on screen, in page order, is primed: players get built in whatever order the browser reports.
const prime=()=>{const y=yp.current;if(primed||want.current||!y?.playVideo||!canPrime())return;
if([...document.querySelectorAll('.wk .yt')].find(b=>b.getBoundingClientRect().bottom>0)!==box.current)return;primed=priming.current=true;y.mute();y.playVideo()};
const start=()=>{want.current=true;if(!yt)return play();const y=yp.current;if(!y?.playVideo)return make();
if(me.current)use(me.current);if(snd.on&&snd.ok)y.unMute();else y.mute();if(y.getCurrentTime()>0.2)y.seekTo(0,true);y.playVideo()};
const pause=()=>{want.current=false;v.current?.pause();if(yp.current){yp.current.pauseVideo?.();setLive(false)}};
const fns=useRef({start,pause,make,prime});fns.current={start,pause,make,prime};
useEffect(()=>{arm();const el=wk.current!,obs:IntersectionObserver[]=[];
if(touch()&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&(yt||p.preview_url)){
const x:Seen={ratio:0,yt:!!yt,start:()=>fns.current.start(),pause:()=>fns.current.pause(),build:()=>fns.current.make()};seen.set(el,x);
const o=new IntersectionObserver(([e])=>{x.ratio=e.intersectionRatio;if(x.ratio>0)fns.current.prime();refocus()},{threshold:[0,.01,.3,.6,.8,1]});o.observe(el);obs.push(o);
// The first YouTube card builds its player as the work section comes near, so it can be primed the moment it appears.
if(yt){const w=new IntersectionObserver(([e])=>{if(e.isIntersecting&&!primed)queue=queue.then(()=>primed?undefined:fns.current.make())},{rootMargin:'600px'});w.observe(el);obs.push(w)}}
else if(yt&&!touch()){const o=new IntersectionObserver(([e])=>{if(e.isIntersecting)queue=queue.then(()=>fns.current.make(true));else if(!want.current)me.current?.stop()},{rootMargin:'300px'});o.observe(el);obs.push(o)}
return()=>{obs.forEach(o=>o.disconnect());seen.delete(el);if(focused===el)focused=null;me.current?.stop()}},[]);
// Moving over the card also starts it, in case the hover began before the page was ready and the enter event was missed.
const tilt=(e:React.PointerEvent<HTMLDivElement>)=>{if(e.pointerType!=='mouse')return;if(!want.current)start();if((e.target as Element).closest('.snd'))return;const r=e.currentTarget.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height,s=th.current!.style;s.setProperty('--ry',(x-.5)*14+'deg');s.setProperty('--rx',(.5-y)*14+'deg')};
const leave=(e:React.PointerEvent)=>{if(e.pointerType!=='mouse')return;pause();th.current!.style.setProperty('--rx','0deg');th.current!.style.setProperty('--ry','0deg')};
// The sound button also starts playback, and on a phone it makes this the playing card.
const toggle=()=>{const n=!sound;setSnd({on:n,ok:true,vol:n&&!vol?80:vol});if(seen.has(wk.current!)&&focused!==wk.current){focus(wk.current);return}if(!want.current||!live)start();else if(yt)yp.current?.playVideo?.()};
return(<div ref={wk} className="wk" data-c={c?.slug} style={{'--k':c?.color} as React.CSSProperties} onPointerEnter={e=>{if(e.pointerType==='mouse')start()}} onPointerMove={tilt} onPointerLeave={leave}>
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
