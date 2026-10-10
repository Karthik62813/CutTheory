import {Fragment} from 'react';
import {requireAdmin} from '@/lib/auth';
import {saveCategory,deleteCategory} from '../manage';
import Flash from '../Flash';
import ConfirmButton from '../ConfirmButton';
export default async function Categories({searchParams}:{searchParams:Promise<{e?:string;ok?:string}>}){
const sp=await searchParams,{supabase}=await requireAdmin();
const {data}=await supabase.from('categories').select('*').order('sort_order').order('created_at');
const list=data??[];
return(<><h1 className="ad-h">Categories</h1><p className="ad-mut">These become the filter buttons on your site. The colour tints each project card.</p><Flash {...sp}/>
<div className="ad-list">{list.map((c:any)=>(<Fragment key={c.id}><form hidden id={`d${c.id}`} action={deleteCategory}><input type="hidden" name="id" value={c.id}/></form><form action={saveCategory} className="ad-row"><input type="hidden" name="id" value={c.id}/>
<input name="name" defaultValue={c.name} required maxLength={60} aria-label="Name"/><input name="slug" defaultValue={c.slug} aria-label="Slug"/>
<input name="color" type="color" defaultValue={c.color} aria-label="Colour"/><input name="sort_order" type="number" defaultValue={c.sort_order} aria-label="Order"/>
<button className="ad-btn">Save</button><ConfirmButton form={`d${c.id}`} msg="Delete this category? Its projects stay but become uncategorized.">Delete</ConfirmButton></form></Fragment>))}
<form action={saveCategory} className="ad-row new"><input name="name" placeholder="New category name" required maxLength={60}/><input name="slug" placeholder="slug (automatic)"/>
<input name="color" type="color" defaultValue="#7c4ddb"/><input name="sort_order" type="number" defaultValue={list.length+1}/><button className="ad-btn">Add</button><span/></form></div></>);}
