import type {Metadata} from 'next';
import './admin.css';
export const metadata:Metadata={title:'Portfolio admin',robots:{index:false,follow:false}};
export default function AdminRoot({children}:{children:React.ReactNode}){return(<html lang="en"><body>{children}</body></html>);}
