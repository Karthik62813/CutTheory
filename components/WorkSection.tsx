'use client';
import {useState} from 'react';
import ProjectCard from './ProjectCard';
import type {Category,Project} from '@/lib/types';
export default function WorkSection({categories,projects}:{categories:Category[];projects:Project[]}){
const [f,setF]=useState('all');
const shown=projects.filter(p=>f==='all'||p.category_id===f);
return(<section id="work"><div className="w"><h2><span className="o">Selected</span> <span className="g">work</span></h2>
<div className="chips"><button className={'chip'+(f==='all'?' on':'')} onClick={()=>setF('all')}>All</button>{categories.map(c=>(<button key={c.id} className={'chip'+(f===c.id?' on':'')} onClick={()=>setF(c.id)}>{c.name}</button>))}</div>
<div className="grid">{shown.map(p=><ProjectCard key={p.id} project={p} category={categories.find(c=>c.id===p.category_id)}/>)}</div></div></section>);}
