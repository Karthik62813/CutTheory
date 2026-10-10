// Placeholder data shaped like the future Supabase rows (Phase 8 swaps this for database reads).
import type {Category,Project,Settings} from './types';
export const categories:Category[]=[
{id:'reel',name:'Reels',slug:'reel',color:'#7c4ddb',sort_order:1},
{id:'brand',name:'Brand films',slug:'brand',color:'#2f6fe0',sort_order:2},
{id:'music',name:'Music videos',slug:'music',color:'#d6338a',sort_order:3},
{id:'docu',name:'Documentary',slug:'docu',color:'#0b7a6e',sort_order:4}];
const P=(i:number,title:string,c:string,duration:string):Project=>({id:String(i),title,slug:title.toLowerCase().replace(/\W+/g,'-'),category_id:c,description:'',client:null,year:2026,thumbnail_url:null,thumbnail_key:null,thumbnail_size:0,preview_url:`/samples/r${i}.mp4`,preview_key:null,preview_size:0,video_url:null,video_key:null,video_size:0,video_provider:'sample',duration,featured:false,sort_order:i,published:true,tags:[],created_at:'',updated_at:''});
export const projects:Project[]=[P(0,'Neon Nights','reel','0:30'),P(1,'Northwind','brand','1:00'),P(2,'Midnight Bloom','music','3:42'),P(3,'Salt and Stone','docu','12:10'),P(4,'Street Pulse','reel','0:45'),P(5,'Aurora Launch','brand','1:30')];
export const settings:Settings={name:'Karthik',email:'hello@yourmail.com',instagram_url:null,linkedin_url:null,whatsapp_number:null,about:'I love the moment a rough timeline clicks into a story. I work closely with creators and brands, keep feedback rounds quick, and deliver in every format you need.',tools:['Premiere Pro','After Effects','DaVinci Resolve','Final Cut Pro'],delivery:['Vertical, square and widescreen cuts from one project'],show_clients:false,email_subject:'Video editing enquiry',email_body:'',whatsapp_message:'',social_message:''};
