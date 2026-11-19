export const EVENT_NAMES = ['intro_viewed','start_clicked','questions_started','question_viewed','question_answered','question_advanced','question_returned','last_question_viewed','quiz_completed','result_viewed','recipes_presented','recipes_page_viewed','redemption_clicked','whatsapp_clicked','full_product_clicked'] as const;
export type JourneyName = typeof EVENT_NAMES[number];
export type JourneyEvent = { id: string; session_id: string; name: string; step: number | null; occurred_at: string };
export type Visit = { id: string; visitor_id: string; entered_at: string; last_activity: string; entry_page: string; referrer_host: string; device: string; utm_source: string; utm_medium: string; utm_campaign: string; utm_content: string; utm_term: string };
export const EVENT_LABELS: Record<string,string> = {intro_viewed:'Acessou o quiz',start_clicked:'Clicou em começar',questions_started:'Iniciou as perguntas',question_viewed:'Visualizou a pergunta',question_answered:'Respondeu à pergunta',question_advanced:'Avançou da pergunta',question_returned:'Retornou à pergunta',last_question_viewed:'Chegou à última pergunta',quiz_completed:'Concluiu o quiz',result_viewed:'Visualizou o resultado',recipes_presented:'Visualizou a apresentação das receitas',recipes_page_viewed:'Acessou as receitas grátis',redemption_clicked:'Clicou em resgatar',whatsapp_clicked:'Clicou para abrir o WhatsApp',full_product_clicked:'Clicou no livro completo'};
export const percentage = (n:number,d:number) => d ? Number((100*n/d).toFixed(1)) : 0;
export function summarize(visits:Visit[],events:JourneyEvent[],count:number,now=Date.now()) {
 const bySession = new Map<string,JourneyEvent[]>();
 for (const e of events) { const list=bySession.get(e.session_id) ?? []; list.push(e); bySession.set(e.session_id,list); }
 const has=(id:string,name:string) => (bySession.get(id) ?? []).some(e=>e.name===name);
 const tally=(name:string)=>visits.filter(v=>has(v.id,name)).length;
 const started=tally('questions_started'), completed=tally('quiz_completed'), whatsapp=tally('whatsapp_clicked');
 const abandoned=visits.filter(v=>has(v.id,'questions_started')&&!has(v.id,'quiz_completed')&&now-Date.parse(v.last_activity)>30*60*1000).length;
 const questions=Array.from({length:count},(_,i)=>{
   const step=i+1; const reached=visits.filter(v=>(bySession.get(v.id)??[]).some(e=>e.name==='question_viewed'&&e.step===step));
   const answered=reached.filter(v=>(bySession.get(v.id)??[]).some(e=>e.name==='question_answered'&&e.step===step)).length;
   const advanced=reached.filter(v=>(bySession.get(v.id)??[]).some(e=>e.name==='question_advanced'&&e.step===step)).length;
   const lost=reached.filter(v=>{const list=bySession.get(v.id)??[]; return now-Date.parse(v.last_activity)>1800000&&!has(v.id,'quiz_completed')&&!list.some(e=>e.name==='question_advanced'&&e.step===step)&&list.filter(e=>e.name==='question_viewed').at(-1)?.step===step;}).length;
   return {step,reached:reached.length,answered,advanced,abandoned:lost,abandonmentRate:percentage(lost,reached.length),advanceRate:percentage(advanced,reached.length)};
 });
 const stages=[['Acessaram o quiz','intro_viewed'],['Clicaram para começar','start_clicked'],['Iniciaram as perguntas','questions_started'],['Avançaram pelas perguntas','question_advanced'],['Chegaram à última pergunta','last_question_viewed'],['Concluíram o questionário','quiz_completed'],['Visualizaram o resultado','result_viewed'],['Chegaram às receitas grátis','recipes_presented'],['Clicaram em resgatar','redemption_clicked'],['Clicaram para abrir o WhatsApp','whatsapp_clicked']];
 const funnel=stages.map(([label,name],i)=>({label,name,total:tally(name),conversion:i?percentage(tally(name),tally(stages[i-1][1])):100}));
 const dailyMap=new Map<string,{day:string;visitors:Set<string>;starts:Set<string>;completions:Set<string>;whatsapp:Set<string>}>();
 const dayFor=(time:string)=> new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(time));
 const getDay=(day:string)=>{let d=dailyMap.get(day);if(!d){d={day,visitors:new Set(),starts:new Set(),completions:new Set(),whatsapp:new Set()};dailyMap.set(day,d);}return d;};
 visits.forEach(v=>getDay(dayFor(v.entered_at)).visitors.add(v.visitor_id));
 events.forEach(e=>{const d=getDay(dayFor(e.occurred_at));if(e.name==='questions_started')d.starts.add(e.session_id);if(e.name==='quiz_completed')d.completions.add(e.session_id);if(e.name==='whatsapp_clicked')d.whatsapp.add(e.session_id);});
 const daily=[...dailyMap.values()].sort((a,b)=>a.day.localeCompare(b.day)).map(d=>({day:d.day,visitors:d.visitors.size,starts:d.starts.size,completions:d.completions.size,whatsapp:d.whatsapp.size}));
 const groups=new Map<string,Visit[]>();visits.forEach(v=>{const key=JSON.stringify([v.utm_source||v.referrer_host||'Direta / desconhecida',v.utm_medium||'—',v.utm_campaign||'—',v.utm_content||'—',v.utm_term||'—']);groups.set(key,[...(groups.get(key)??[]),v]);});
 const sources=[...groups].map(([key,list])=>{const [source,medium,campaign,content,term]=JSON.parse(key) as string[];return {source,medium,campaign,content,term,visits:list.length,completed:list.filter(v=>has(v.id,'quiz_completed')).length,whatsapp:list.filter(v=>has(v.id,'whatsapp_clicked')).length};});
 return {unique:new Set(visits.map(v=>v.visitor_id)).size,sessions:visits.length,started,completed,whatsapp,completionRate:percentage(completed,started),whatsappRate:percentage(whatsapp,visits.length),abandonmentRate:percentage(abandoned,started),questions,funnel,daily,sources,bySession};
}
export function csv(rows:Record<string,unknown>[]) {
 const headers=Object.keys(rows[0]??{});
 const escape=(v:unknown)=>{let s=String(v??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
 return '\uFEFF'+[headers,...rows.map(r=>headers.map(h=>r[h]))].map(r=>r.map(escape).join(';')).join('\r\n');
}
export function periodRange(mode:string,start?:string,end?:string,now=new Date()) {
 const local=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 const last=new Date(`${local}T00:00:00-03:00`); const first=new Date(last);
 if(mode==='custom'&&start&&end) return {from:new Date(`${start}T00:00:00-03:00`).toISOString(),to:new Date(new Date(`${end}T00:00:00-03:00`).getTime()+86400000).toISOString()};
 if(mode==='yesterday'){first.setUTCDate(first.getUTCDate()-1);return {from:first.toISOString(),to:last.toISOString()};}
 const days=mode==='today'?1:Number(mode)||7;first.setUTCDate(first.getUTCDate()-(days-1));last.setUTCDate(last.getUTCDate()+1);
 return {from:first.toISOString(),to:last.toISOString()};
}
