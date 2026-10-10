import {saveProject} from './manage';
export default function ProjectForm({p,categories}:{p?:any;categories:{id:string;name:string}[]}){
return(<form action={saveProject} className="ad-edit">{p&&<input type="hidden" name="id" value={p.id}/>}
<div className="ad-grid"><label>Title<input name="title" defaultValue={p?.title} required maxLength={120}/></label>
<label>Slug (web address, automatic if empty)<input name="slug" defaultValue={p?.slug}/></label>
<label>Category<select name="category_id" defaultValue={p?.category_id??''}><option value="">None</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
<label>Year<input name="year" type="number" min={1990} max={2100} defaultValue={p?.year??new Date().getFullYear()}/></label>
<label>Duration (like 0:45)<input name="duration" defaultValue={p?.duration??''} placeholder="0:45"/></label>
<label>Client<input name="client" defaultValue={p?.client??''}/></label></div>
<label>Description<textarea name="description" rows={4} defaultValue={p?.description}/></label>
<label>Tags (comma separated)<input name="tags" defaultValue={p?.tags?.join(', ')}/></label>
<div className="ad-note">Uploading the video, preview clip and thumbnail arrives in the next step. Until then you can paste full https links.</div>
<label>Video link<input name="video_url" defaultValue={p?.video_url??''} placeholder="https://..."/></label>
<label>Preview clip link (short clip that plays on hover)<input name="preview_url" defaultValue={p?.preview_url??''} placeholder="https://..."/></label>
<label>Thumbnail link<input name="thumbnail_url" defaultValue={p?.thumbnail_url??''} placeholder="https://..."/></label>
<div className="ad-checks"><label><input type="checkbox" name="featured" defaultChecked={p?.featured}/> Featured</label><label><input type="checkbox" name="published" defaultChecked={p?.published}/> Published (visible on the site)</label></div>
<div className="ad-top"><button className="ad-btn">Save project</button><a href="/admin/projects" className="ad-btn ghost">Cancel</a></div></form>);}
