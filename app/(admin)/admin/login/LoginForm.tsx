'use client';
import {useActionState} from 'react';
import {login,type LoginState} from '../actions';
export default function LoginForm({denied}:{denied:boolean}){
const [s,act,pending]=useActionState<LoginState,FormData>(login,{});
return(<form action={act} className="ad-form"><div className="brand">Portfolio admin</div>
{denied&&<p className="ad-err">That account is not an admin.</p>}
<label>Email<input name="email" type="email" autoComplete="username" required/></label>
<label>Password<input name="password" type="password" autoComplete="current-password" required minLength={6}/></label>
{s.error&&<p className="ad-err" role="alert">{s.error}</p>}
<button className="ad-btn" disabled={pending}>{pending?'Signing in...':'Sign in'}</button></form>);}
