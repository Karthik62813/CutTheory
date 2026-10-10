import type {Settings} from '@/lib/types';
export default function About({s}:{s:Settings}){return(<section id="about"><div className="w"><h2><span className="g">About</span> <span className="o">me</span></h2><div className="ab"><p>{s.about}</p><dl><dt>Tools</dt><dd>{s.tools.join(', ')}</dd><dt>Delivery</dt><dd>{s.delivery.join(', ')}</dd></dl></div></div></section>);}
