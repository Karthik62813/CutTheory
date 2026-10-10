import {getSiteData} from '@/lib/data';
import Navbar from '@/components/Navbar';import Hero from '@/components/Hero';import WorkSection from '@/components/WorkSection';
import Clients from '@/components/Clients';import Services from '@/components/Services';import About from '@/components/About';
import Contact from '@/components/Contact';import Footer from '@/components/Footer';import SiteEffects from '@/components/SiteEffects';
// Prerendered, refreshed by the admin on every change; the hourly refresh only catches edits made straight in Supabase.
export const revalidate=3600;
export default async function Home(){
const {settings,categories,projects,clients}=await getSiteData();
return(<><Navbar name={settings.name}/><main id="top"><Hero name={settings.name}/>
<div className="band" aria-hidden="true"><span>Cut. Color. Sound. Motion. Story. Cut. Color. Sound. Motion. Story.</span></div>
<WorkSection categories={categories} projects={projects}/><Clients list={clients}/><Services/><About s={settings}/><Contact s={settings}/></main><Footer name={settings.name}/><SiteEffects/></>);}
