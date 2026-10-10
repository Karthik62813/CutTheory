import type {Metadata} from 'next';
import '@fontsource/unbounded/latin-500.css';
import '@fontsource/unbounded/latin-700.css';
import '@fontsource/hanken-grotesk/latin-400.css';
import '@fontsource/hanken-grotesk/latin-500.css';
import '@fontsource/hanken-grotesk/latin-600.css';
import './globals.css';
import BackgroundEffects from '@/components/BackgroundEffects';
import {getSiteData} from '@/lib/data';
export async function generateMetadata():Promise<Metadata>{
const {settings:s}=await getSiteData(),title=`${s.name}, Video Editor`,description='Short-form and reel editing portfolio';
return{title:{default:title,template:`%s · ${s.name}`},description,openGraph:{title,description,type:'website'}};}
export default function RootLayout({children}:{children:React.ReactNode}){
return(<html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:"document.documentElement.className='js'"}}/></head><body><BackgroundEffects/>{children}</body></html>);}
