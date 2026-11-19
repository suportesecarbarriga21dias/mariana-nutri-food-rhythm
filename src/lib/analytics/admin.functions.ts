import { createServerFn } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
import type { JourneyEvent,Visit } from './model';
export const adminAccess=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 setResponseHeader('Cache-Control','no-store');const {data,error}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});return {allowed:!error&&data===true};
});
export const readAnalytics=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((input:unknown)=>z.object({from:z.string().datetime(),to:z.string().datetime()}).refine(d=>Date.parse(d.to)>Date.parse(d.from)&&Date.parse(d.to)-Date.parse(d.from)<=91*86400000,'Selecione até 90 dias.').parse(input)).handler(async({data,context})=>{
 setResponseHeader('Cache-Control','no-store');
 const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});if(role.error||role.data!==true)throw new Error('Acesso não autorizado.');
 const visits:Visit[]=[];const events:JourneyEvent[]=[];
 for(let page=0;;page++) {const {data:rows,error}=await context.supabase.from('analytics_sessions').select('id,visitor_id,entered_at,last_activity,entry_page,referrer_host,device,utm_source,utm_medium,utm_campaign,utm_content,utm_term').gte('entered_at',data.from).lt('entered_at',data.to).order('entered_at').order('id').range(page*1000,page*1000+999);if(error)throw new Error('Não foi possível carregar as sessões.');visits.push(...rows);if(rows.length<1000)break;}
 for(let page=0;;page++) {const {data:rows,error}=await context.supabase.from('analytics_events').select('id,session_id,name,step,occurred_at,analytics_sessions!inner(entered_at)').gte('analytics_sessions.entered_at',data.from).lt('analytics_sessions.entered_at',data.to).lt('occurred_at',data.to).order('occurred_at').order('id').range(page*1000,page*1000+999);if(error)throw new Error('Não foi possível carregar os eventos.');events.push(...rows.map(({id,session_id,name,step,occurred_at})=>({id,session_id,name,step,occurred_at})));if(rows.length<1000)break;}
 const profile=await context.supabase.from('profiles').select('display_name,avatar_url').eq('id',context.userId).single();
 return {visits,events,profile:profile.data,updatedAt:new Date().toISOString()};
});
