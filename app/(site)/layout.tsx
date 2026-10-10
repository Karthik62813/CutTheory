import type {Metadata} from 'next';
import '@fontsource/unbounded/latin-500.css';
import '@fontsource/unbounded/latin-700.css';
import '@fontsource/hanken-grotesk/latin-400.css';
import '@fontsource/hanken-grotesk/latin-500.css';
import '@fontsource/hanken-grotesk/latin-600.css';
import './globals.css';
import BackgroundEffects from '@/components/BackgroundEffects';
export const metadata:Metadata={title:'Karthik, Video Editor',description:'Short-form and reel editing portfolio'};
export default function RootLayout({children}:{children:React.ReactNode}){
return(<html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:"document.documentElement.className='js'"}}/></head><body><BackgroundEffects/>{children}</body></html>);}
