import {Fragment} from 'react';
import Link from 'next/link';
import {requireAdmin} from '@/lib/auth';
import {r2Enabled} from '@/lib/r2';
import {deleteClient} from '../manage';
import Flash from '../Flash';
import ClientForm from '../ClientForm';
export default async function Clients({searchParams}:{searchParams:Promise<{e?:string;ok?:string}>}){
const sp=await searchParams,{supabase}=await requireAdmin(),uploads=r2Enabled();
const [{data},{data:s}]=await Promise.all([supabase.from('clients').select('*').order('sort_order').order('created_at'),supabase.from('site_settings').select('show_clients').eq('id',1).single()]);
const list=data??[];
return(<><h1 className="ad-h">Clients</h1><p className="ad-mut">Brands and creators you have worked with. They appear as a logo wall on your site.</p>
{!s?.show_clients&&<div className="ad-note">The clients section is hidden on your site right now. Turn it on in <Link href="/admin/settings" className="ad-link">Settings</Link>.</div>}
<Flash {...sp}/>
<div className="ad-list">{list.map((c:any)=>(<Fragment key={c.id+c.updated_at}><form hidden id={`d${c.id}`} action={deleteClient}><input type="hidden" name="id" value={c.id}/></form><ClientForm c={c} order={c.sort_order} uploads={uploads}/></Fragment>))}
<ClientForm key={'new'+list.length} order={list.length+1} uploads={uploads}/></div></>);}
