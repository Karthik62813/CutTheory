export default function Flash({e,ok}:{e?:string;ok?:string}){return e?<p className="ad-flash bad" role="alert">{e}</p>:ok?<p className="ad-flash good">{ok}</p>:null;}
