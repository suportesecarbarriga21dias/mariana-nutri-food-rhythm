import type { JourneyName } from './model';
const CONSENT='mariana-analytics-consent';
const STORE='mariana-journey-v1';
const VISITOR='mariana-anonymous-visitor';
type Pending={key:string;name:JourneyName;step?:number};
type State={id:string;visitor:string;capability:string;last:number;seen:string[];pending:Pending[];meta:Record<string,string>};
let sending=false;
export function consentStatus():string|null {try{return localStorage.getItem(CONSENT);}catch{return 'denied';}}
function state():State|null {
 if(consentStatus()!=='granted'||(navigator as Navigator & {globalPrivacyControl?:boolean}).globalPrivacyControl)return null;
 try{
 const previous=sessionStorage.getItem(STORE); if(previous){const s=JSON.parse(previous) as State;if(Date.now()-s.last<1800000)return s;}
 let visitor=localStorage.getItem(VISITOR);if(!visitor){visitor=crypto.randomUUID();localStorage.setItem(VISITOR,visitor);}
 const params=new URLSearchParams(location.search);const meta:Record<string,string>={entry_page:location.pathname==='/receitas'?'/receitas':'/',referrer_host:'',device:/Mobi|Android|iPhone/i.test(navigator.userAgent)?'mobile':/iPad|Tablet/i.test(navigator.userAgent)?'tablet':'desktop'};
 try{meta.referrer_host=document.referrer?new URL(document.referrer).hostname:'';}catch{/* unknown */}
 for(const k of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term']) {const val=params.get(k)||'';meta[k]=/^[a-zA-Z0-9_. -]{0,80}$/.test(val)&&!/@|https?:|\b\d{8,}\b/.test(val)?val:'';}
 const s:State={id:crypto.randomUUID(),visitor,capability:crypto.randomUUID(),last:Date.now(),seen:[],pending:[],meta};sessionStorage.setItem(STORE,JSON.stringify(s));return s;
 }catch{return null;}
}
export function recordJourney(name:JourneyName,step?:number,repeat=false) {
 const s=state();if(!s)return;
 const key=repeat?`${name}:${step??0}:${crypto.randomUUID()}`:`${name}:${step??0}`;
 if(s.seen.includes(key))return;
 s.seen.push(key);s.pending.push({key,name,...(step?{step}:{})});s.last=Date.now();sessionStorage.setItem(STORE,JSON.stringify(s));void flushJourney();
}
export async function flushJourney() {
 if(sending)return;const s=state();if(!s?.pending.length)return;sending=true;
 const batch=s.pending.slice(0,20);
 try {const response=await fetch('/api/public/journey',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session:s.id,visitor:s.visitor,capability:s.capability,meta:s.meta,events:batch}),keepalive:true});
 if(response.ok){const current=state();if(current?.id===s.id){current.pending=current.pending.filter(e=>!batch.some(b=>b.key===e.key));sessionStorage.setItem(STORE,JSON.stringify(current));}}
 }catch{/* keep pending for next interaction, reconnect or timer */}finally{sending=false;}
}
export async function setAnalyticsConsent(allow:boolean) {
 if(!allow){try{const raw=sessionStorage.getItem(STORE);if(raw){const s=JSON.parse(raw) as State;await fetch('/api/public/journey',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({session:s.id,capability:s.capability}),keepalive:true});}}catch{/* best effort; records expire automatically */}}
 localStorage.setItem(CONSENT,allow?'granted':'denied');if(!allow){sessionStorage.removeItem(STORE);localStorage.removeItem(VISITOR);}window.dispatchEvent(new Event('mariana-consent'));
}
