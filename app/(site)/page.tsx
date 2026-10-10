import {categories,projects,settings} from '@/lib/sample-data';
import Navbar from '@/components/Navbar';import Hero from '@/components/Hero';import WorkSection from '@/components/WorkSection';
import Services from '@/components/Services';import About from '@/components/About';import Contact from '@/components/Contact';
import Footer from '@/components/Footer';import SiteEffects from '@/components/SiteEffects';
export default function Home(){
const list=projects.filter(p=>p.published).sort((a,b)=>a.sort_order-b.sort_order);
return(<><Navbar/><main id="top"><Hero/>
<div className="band" aria-hidden="true"><span>Cut. Color. Sound. Motion. Story. Cut. Color. Sound. Motion. Story.</span></div>
<WorkSection categories={categories} projects={list}/><Services/><About s={settings}/><Contact s={settings}/></main><Footer name={settings.name}/><SiteEffects/></>);}
