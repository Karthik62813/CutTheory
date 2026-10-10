import Link from 'next/link';
import {requireAdmin} from '@/lib/auth';
import {logout} from '../actions';
export default async function Panel({children}:{children:React.ReactNode}){
const {user}=await requireAdmin();
return(<div className="ad-shell"><aside className="ad-side"><div className="brand">Portfolio admin</div>
<Link href="/admin">Dashboard</Link><Link href="/admin/projects">Projects</Link><Link href="/admin/categories">Categories</Link><Link href="/admin/clients">Clients</Link><Link href="/admin/settings">Settings</Link>
<Link href="/" target="_blank">View site</Link>
<div style={{marginTop:'auto',fontSize:'.8rem',color:'var(--mut)',wordBreak:'break-all'}}>{user.email}</div>
<form action={logout}><button className="ad-btn ghost">Log out</button></form></aside><main className="ad-main">{children}</main></div>);}
