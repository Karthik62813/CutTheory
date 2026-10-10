import {createServerClient} from '@supabase/ssr';
import {NextResponse,type NextRequest} from 'next/server';
import {supabaseEnv} from './env';
// Refreshes the login session and sends visitors without one to /admin/login.
export async function updateSession(request:NextRequest){
let response=NextResponse.next({request});
const {url,key}=supabaseEnv();
const supabase=createServerClient(url,key,{cookies:{getAll:()=>request.cookies.getAll(),setAll(list){list.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});list.forEach(({name,value,options})=>response.cookies.set(name,value,options))}}});
const {data}=await supabase.auth.getClaims();
if(!data?.claims&&request.nextUrl.pathname!=='/admin/login'){const u=request.nextUrl.clone();u.pathname='/admin/login';u.search='';return NextResponse.redirect(u)}
return response;}
