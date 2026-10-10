import type {Client} from '@/lib/types';
export default function Clients({list}:{list:Client[]}){
if(!list.length)return null;
return(<section id="clients"><div className="w"><h2><span className="o">Clients I&apos;ve</span> <span className="g">worked with</span></h2>
<ul className="cls">{list.map(c=>{const mark=c.logo_url?<img src={c.logo_url} alt={c.name} loading="lazy" decoding="async"/>:<span>{c.name}</span>;
return(<li key={c.id} className="cl">{c.website_url?<a href={c.website_url} target="_blank" rel="noopener noreferrer">{mark}</a>:mark}</li>);})}</ul></div></section>);}
