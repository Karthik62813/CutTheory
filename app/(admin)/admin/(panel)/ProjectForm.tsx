'use client';
import {saveProject} from './manage';
import MediaField from './MediaField';
import useSave from './useSave';
export default function ProjectForm({p,categories,uploads}:{p?:any;categories:{id:string;name:string}[];uploads:boolean}){
const {busy,pending,err,onBusy,onSubmit}=useSave(saveProject);
return(<form onSubmit={onSubmit} className="ad-edit">{p&&<input type="hidden" name="id" value={p.id}/>}
<div className="ad-grid"><label>Title<input name="title" defaultValue={p?.title} required maxLength={120}/></label>
<label>Slug (web address, automatic if empty)<input name="slug" defaultValue={p?.slug}/></label>
<label>Category<select name="category_id" defaultValue={p?.category_id??''}><option value="">None</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
<label>Year<input name="year" type="number" min={1990} max={2100} defaultValue={p?.year??new Date().getFullYear()}/></label>
<label>Duration (like 0:45)<input name="duration" defaultValue={p?.duration??''} placeholder="0:45"/></label>
<label>Client<input name="client" defaultValue={p?.client??''}/></label></div>
<label>Description<textarea name="description" rows={4} defaultValue={p?.description}/></label>
<label>Tags (comma separated)<input name="tags" defaultValue={p?.tags?.join(', ')}/></label>
{!uploads&&<div className="ad-note">File uploads are off until the R2 storage settings are added (see README). Until then, paste full https links.</div>}
<MediaField kind="video" label="Video" hint="The full edit, played on the project page. A YouTube or Vimeo link also works. MP4 (H.264) plays in every browser." url={p?.video_url??null} fileKey={p?.video_key??null} uploads={uploads} onBusy={onBusy}/>
<MediaField kind="preview" label="Preview clip" hint="A short loop (5 to 15 seconds) that plays when visitors hover the card. Keep it small so it starts fast." url={p?.preview_url??null} fileKey={p?.preview_key??null} uploads={uploads} onBusy={onBusy}/>
<MediaField kind="thumbnail" label="Thumbnail" hint="Vertical 9:16 image, shown on the card before the preview plays. Leave it empty for a YouTube video to use YouTube's thumbnail." url={p?.thumbnail_url??null} fileKey={p?.thumbnail_key??null} uploads={uploads} onBusy={onBusy}/>
<div className="ad-checks"><label><input type="checkbox" name="featured" defaultChecked={p?.featured}/> Featured</label><label><input type="checkbox" name="published" defaultChecked={p?.published}/> Published (visible on the site)</label></div>
{err&&<p className="ad-flash bad" role="alert">{err}</p>}
<div className="ad-top"><button className="ad-btn" disabled={busy||pending}>{busy?'Uploading...':pending?'Saving...':'Save project'}</button><a href="/admin/projects" className="ad-btn ghost">Cancel</a></div></form>);}
