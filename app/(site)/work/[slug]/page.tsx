import Link from 'next/link';import {notFound} from 'next/navigation';
import {projects,categories} from '@/lib/sample-data';
export default async function Work({params}:{params:Promise<{slug:string}>}){
const {slug}=await params;const p=projects.find(x=>x.slug===slug);if(!p)notFound();
const c=categories.find(x=>x.id===p.category_id);
return(<main className="w" style={{padding:'6rem 0'}}><Link href="/#work" className="btn o">Back to work</Link><h1 style={{margin:'1.2rem 0'}}>{p.title}</h1><p className="lead">{c?.name}</p></main>);}
