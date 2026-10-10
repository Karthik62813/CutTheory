import {useState,useTransition} from 'react';
// Submits by hand rather than through a form action: React resets action forms afterwards, which would wipe the fields on an error.
export default function useSave(save:(fd:FormData)=>Promise<{error?:string}>){
const [busy,setBusy]=useState(0),[err,setErr]=useState(''),[pending,start]=useTransition();
const onBusy=(b:boolean)=>setBusy(n=>n+(b?1:-1));
const onSubmit=(e:React.FormEvent<HTMLFormElement>)=>{e.preventDefault();if(busy)return;const fd=new FormData(e.currentTarget);setErr('');
start(async()=>{const r=await save(fd);if(r?.error)setErr(r.error)});};
return{busy:busy>0,pending,err,onBusy,onSubmit};}
