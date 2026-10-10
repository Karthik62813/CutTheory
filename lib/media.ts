// Upload rules for each kind of file, shared by the admin form and the server checks.
export type Kind='video'|'preview'|'thumbnail'|'logo';
const MB=1048576,IMG={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/avif':'avif'};
export const MEDIA:Record<Kind,{types:Record<string,string>;max:number;label:string}>={
video:{types:{'video/mp4':'mp4','video/webm':'webm'},max:2048*MB,label:'Video'},
preview:{types:{'video/mp4':'mp4','video/webm':'webm'},max:60*MB,label:'Preview clip'},
thumbnail:{types:IMG,max:8*MB,label:'Thumbnail'},
logo:{types:IMG,max:2*MB,label:'Logo'}};
export const isKind=(k:string):k is Kind=>k in MEDIA;
export const keyOk=(kind:Kind,key:string)=>new RegExp(`^${kind}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(${Object.values(MEDIA[kind].types).join('|')})$`).test(key);
export const size=(n:number)=>n>=1073741824?(n/1073741824).toFixed(2)+' GB':n>=MB?(n/MB).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB';
