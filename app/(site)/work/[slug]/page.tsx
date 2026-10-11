import {Fragment} from 'react';
import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getSiteData} from '@/lib/data';
import {embed,youtubeId} from '@/lib/video';
import YouTubePlayer from '@/components/YouTubePlayer';
import Navbar from '@/components/Navbar';import Footer from '@/components/Footer';import SiteEffects from '@/components/SiteEffects';
export const revalidate=3600;
type Props={params:Promise<{slug:string}>};
export async function generateStaticParams(){const {projects}=await getSiteData();return projects.map(p=>({slug:p.slug}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{
const [{slug},{projects,settings}]=await Promise.all([params,getSiteData()]),p=projects.find(x=>x.slug===slug);
if(!p)return{};
const description=p.description.slice(0,160)||`${p.title}, edited by ${settings.name}.`;
return{title:p.title,description,openGraph:{title:p.title,description,images:p.thumbnail_url?[p.thumbnail_url]:undefined}};}
export default async function Work({params}:Props){
const [{slug},{projects,categories,settings}]=await Promise.all([params,getSiteData()]);
const i=projects.findIndex(x=>x.slug===slug);if(i<0)notFound();
const p=projects[i],c=categories.find(x=>x.id===p.category_id),next=projects.length>1?projects[(i+1)%projects.length]:null;
// The full edit, or the hover preview when only that exists. YouTube and Vimeo links play in their own player.
const src=p.video_url??p.preview_url,player=src?embed(src):null;
const facts:[string,string|null,string?][]=[['Client',p.client],['Year',p.year?String(p.year):null],['Runtime',p.duration,'tc'],['Category',c?.name??null]];
return(<><Navbar name={settings.name} base="/"/><main id="top" className="w pj" style={{'--k':c?.color} as React.CSSProperties}>
<Link href="/#work" className="btn o">Back to work</Link>
<h1>{p.title}</h1>{c&&<p className="pc"><i/>{c.name}</p>}
<div className="pv">{player?.provider==='youtube'?<YouTubePlayer id={youtubeId(src)!} title={p.title} tall={player.tall} poster={p.thumbnail_url}/>
:player?<div className={player.tall?'pf tall':'pf'}><iframe src={player.src} title={`${p.title} video`} allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/></div>
:src?<video src={src} poster={p.thumbnail_url??undefined} controls playsInline preload="metadata"/>
:<div className="pv-x">Video coming soon</div>}</div>
<div className="ab">{p.description&&<p className="pd">{p.description}</p>}
<dl>{facts.filter(([,v])=>v).map(([k,v,cl])=>(<Fragment key={k}><dt>{k}</dt><dd className={cl}>{v}</dd></Fragment>))}
{p.tags.length>0&&<><dt>Tags</dt><dd className="tg">{p.tags.map(t=><span key={t}>{t}</span>)}</dd></>}</dl></div>
{next&&<Link href={`/work/${next.slug}`} className="nx"><span>Next project</span><strong><span className="o">{next.title}</span></strong></Link>}
</main><Footer name={settings.name}/><SiteEffects/></>);}
