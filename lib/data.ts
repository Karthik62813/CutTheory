import {cache} from 'react';
import {hasSupabaseEnv} from './supabase/env';
import {createPublicClient} from './supabase/public';
import * as sample from './sample-data';
import {youtubeThumb} from './video';
import type {Category,Client,Project,Settings} from './types';
export type SiteData={settings:Settings;categories:Category[];projects:Project[];clients:Client[]};
// Visitors may only read these settings columns (storage_cap_bytes stays private), so select * would be refused.
const SETTINGS='name,email,instagram_url,linkedin_url,whatsapp_number,about,tools,delivery,show_clients,email_subject,email_body,whatsapp_message,social_message';
// Everything the public pages show, read once per request. Without Supabase settings it falls back to the sample data so the design can be previewed.
export const getSiteData=cache(async():Promise<SiteData>=>{
const d=hasSupabaseEnv()?await load():samples();
// A YouTube project without its own thumbnail shows YouTube's.
return{...d,projects:await Promise.all(d.projects.map(async p=>p.thumbnail_url?p:{...p,thumbnail_url:await youtubeThumb(p.video_url)}))};});
function samples():SiteData{console.warn('Supabase is not configured: showing sample data. See .env.example.');return{settings:sample.settings,categories:sample.categories,projects:sample.projects,clients:[]};}
async function load():Promise<SiteData>{
const db=createPublicClient();
const [s,c,p,cl]=await Promise.all([
db.from('site_settings').select(SETTINGS).eq('id',1).maybeSingle(),
db.from('categories').select('*').order('sort_order').order('created_at'),
db.from('projects').select('*').eq('published',true).order('sort_order').order('created_at'),
db.from('clients').select('*').eq('published',true).order('sort_order').order('created_at')]);
const err=s.error??c.error??p.error??cl.error;
if(err)throw new Error('Could not load the site content from Supabase: '+err.message);
if(!s.data)throw new Error('The site_settings row is missing. Run supabase/setup.sql in the Supabase SQL editor.');
const settings=s.data as unknown as Settings;
return{settings,categories:(c.data??[]) as Category[],projects:(p.data??[]) as Project[],clients:settings.show_clients?(cl.data??[]) as Client[]:[]};}
