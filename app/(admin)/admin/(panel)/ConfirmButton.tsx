'use client';
export default function ConfirmButton({msg,form,children}:{msg:string;form?:string;children:React.ReactNode}){
return(<button type="submit" form={form} className="ad-btn danger" onClick={e=>{if(!confirm(msg))e.preventDefault()}}>{children}</button>);}
