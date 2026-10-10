'use client';
import {saveClient} from './manage';
import MediaField from './MediaField';
import ConfirmButton from './ConfirmButton';
import useSave from './useSave';
export default function ClientForm({c,order,uploads}:{c?:any;order:number;uploads:boolean}){
const {busy,pending,err,onBusy,onSubmit}=useSave(saveClient);
return(<form onSubmit={onSubmit} className={'ad-client'+(c?'':' new')}>{c&&<input type="hidden" name="id" value={c.id}/>}
<div className="ad-grid"><label>{c?'Name':'New client'}<input name="name" defaultValue={c?.name} required maxLength={80} placeholder={c?undefined:'Brand or creator name'}/></label>
<label>Website (optional)<input name="website_url" defaultValue={c?.website_url??''} placeholder="https://..."/></label>
<label>Order<input name="sort_order" type="number" defaultValue={c?.sort_order??order}/></label></div>
<MediaField kind="logo" label="Logo" hint="A light or white logo on a transparent background (PNG or WebP) reads best on the dark site. Without a logo the name is shown." url={c?.logo_url??null} fileKey={c?.logo_key??null} uploads={uploads} onBusy={onBusy}/>
{err&&<p className="ad-flash bad" role="alert">{err}</p>}
<div className="ad-top"><label className="ad-check"><input type="checkbox" name="published" defaultChecked={c?c.published:true}/> Show on the site</label>
<div className="ad-acts">{c&&<ConfirmButton form={`d${c.id}`} msg="Delete this client and its logo?">Delete</ConfirmButton>}
<button className="ad-btn" disabled={busy||pending}>{busy?'Uploading...':pending?'Saving...':c?'Save':'Add client'}</button></div></div></form>);}
