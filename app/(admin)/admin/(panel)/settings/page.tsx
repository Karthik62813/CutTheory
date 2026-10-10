import {requireAdmin} from '@/lib/auth';
import {saveSettings} from '../manage';
import Flash from '../Flash';
export default async function Settings({searchParams}:{searchParams:Promise<{e?:string;ok?:string}>}){
const sp=await searchParams,{supabase}=await requireAdmin();
const {data:s}=await supabase.from('site_settings').select('*').eq('id',1).single();
if(!s)return <p className="ad-flash bad">Settings row missing. Run the database setup SQL again.</p>;
return(<><h1 className="ad-h">Settings</h1><Flash {...sp}/><form action={saveSettings} className="ad-edit">
<label className="ad-check"><input type="checkbox" name="show_clients" defaultChecked={s.show_clients}/> Show the &quot;Clients I&apos;ve worked with&quot; section on the site</label>
<div className="ad-grid"><label>Your name<input name="name" defaultValue={s.name} required/></label>
<label>Email<input name="email" type="email" defaultValue={s.email??''}/></label>
<label>Instagram link<input name="instagram_url" defaultValue={s.instagram_url??''} placeholder="https://instagram.com/yourname"/></label>
<label>LinkedIn link<input name="linkedin_url" defaultValue={s.linkedin_url??''} placeholder="https://linkedin.com/in/yourname"/></label>
<label>WhatsApp number (digits with country code)<input name="whatsapp_number" defaultValue={s.whatsapp_number??''} placeholder="919876543210"/></label>
<label>Storage limit (GB)<input name="storage_cap_gb" type="number" step="0.5" min="0.5" defaultValue={Number(s.storage_cap_bytes)/1073741824}/></label></div>
<label>About paragraph<textarea name="about" rows={4} defaultValue={s.about}/></label>
<div className="ad-grid"><label>Tools (one per line)<textarea name="tools" rows={5} defaultValue={s.tools.join('\n')}/></label>
<label>Delivery (one per line)<textarea name="delivery" rows={5} defaultValue={s.delivery.join('\n')}/></label></div>
<div className="ad-note">These messages open when a visitor clicks a Contact link. Instagram and LinkedIn cannot prefill a chat, so their message is copied for the visitor to paste.</div>
<label>Email subject<input name="email_subject" defaultValue={s.email_subject}/></label>
<label>Email message<textarea name="email_body" rows={6} defaultValue={s.email_body}/></label>
<label>WhatsApp message<textarea name="whatsapp_message" rows={3} defaultValue={s.whatsapp_message}/></label>
<label>Instagram / LinkedIn message<textarea name="social_message" rows={3} defaultValue={s.social_message}/></label>
<button className="ad-btn">Save settings</button></form></>);}
