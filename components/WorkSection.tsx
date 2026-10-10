'use client';
import {useState} from 'react';
import ProjectCard from './ProjectCard';
import type {Category,Project} from '@/lib/types';
export default function WorkSection({categories,projects}:{categories:Category[];projects:Project[]}){
const [f,setF]=useState('all');
// Only categories that have work get a filter button, so no filter leads to an empty grid.
const used=categories.filter(c=>projects.some(p=>p.category_id===c.id));
const shown=projects.filter(p=>f==='all'||p.category_id===f);
return(<section id="work"><div className="w"><h2><span className="o">Selected</span> <span className="g">work</span></h2>
{used.length>1&&<div className="chips"><button className={'chip'+(f==='all'?' on':'')} aria-pressed={f==='all'} onClick={()=>setF('all')}>All</button>{used.map(c=>(<button key={c.id} className={'chip'+(f===c.id?' on':'')} aria-pressed={f===c.id} onClick={()=>setF(c.id)}>{c.name}</button>))}</div>}
{projects.length===0?<p className="lead">New work is on the way. Check back soon.</p>:<div className="grid">{shown.map(p=><ProjectCard key={p.id} project={p} category={categories.find(c=>c.id===p.category_id)}/>)}</div>}</div></section>);}
