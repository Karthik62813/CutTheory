'use client';
import {useState} from 'react';
import type {Settings} from '@/lib/types';
const q=(s:string)=>encodeURIComponent(s.replace(/\r?\n/g,'\r\n'));
const withQuery=(base:string,params:[string,string][])=>{const p=params.filter(([,v])=>v).map(([k,v])=>`${k}=${q(v)}`).join('&');return p?`${base}?${p}`:base};
export default function Contact({s}:{s:Settings}){
const [note,setNote]=useState('');
const mail=s.email?withQuery(`mailto:${s.email}`,[['subject',s.email_subject],['body',s.email_body]]):null;
// Instagram and LinkedIn can't prefill a message, so it's copied for the visitor to paste into the chat.
const copy=(where:string)=>{if(s.social_message)navigator.clipboard?.writeText(s.social_message).then(()=>setNote(`Message copied. Paste it into the ${where} chat.`),()=>{})};
const links=[s.instagram_url&&{href:s.instagram_url,label:'Instagram',on:()=>copy('Instagram')},
s.linkedin_url&&{href:s.linkedin_url,label:'LinkedIn',on:()=>copy('LinkedIn')},
s.whatsapp_number&&{href:withQuery(`https://wa.me/${s.whatsapp_number}`,[['text',s.whatsapp_message]]),label:'WhatsApp',on:undefined}].filter(Boolean) as {href:string;label:string;on?:()=>void}[];
return(<section id="contact"><div className="w"><h2><span className="o">Got footage?</span> <span className="g">Send it over.</span></h2>
{mail&&<a className="mail" href={mail}>{s.email}</a>}
{links.length>0&&<div className="so">{links.map(l=><a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" onClick={l.on}>{l.label}</a>)}</div>}
<p className="cp" role="status">{note}</p></div></section>);}
