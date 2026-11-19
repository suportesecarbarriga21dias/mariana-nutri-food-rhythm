import { createFileRoute } from '@tanstack/react-router';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { EVENT_NAMES } from '@/lib/analytics/model';
import type { Database } from '@/integrations/supabase/types';
const identity=z.object({session:z.string().uuid(),capability:z.string().uuid()});
const schema=identity.extend({visitor:z.string().uuid(),meta:z.object({entry_page:z.enum(['/','/receitas']),referrer_host:z.string().max(120).regex(/^[a-zA-Z0-9.-]*$/),device:z.enum(['mobile','tablet','desktop','unknown']),utm_source:z.string().max(80),utm_medium:z.string().max(80),utm_campaign:z.string().max(80),utm_content:z.string().max(80),utm_term:z.string().max(80)}).strict(),events:z.array(z.object({key:z.string().min(1).max(100),name:z.enum(EVENT_NAMES),step:z.number().int().min(1).max(100).optional()}).strict()).min(1).max(20)}).strict();
async function handle(request:Request,erase=false){
 const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)return new Response('Forbidden',{status:403});
 if(!request.headers.get('content-type')?.includes('application/json'))return new Response('Unsupported',{status:415});
 const text=await request.text();if(text.length>12000)return new Response('Too large',{status:413});
 let body:unknown;try{body=JSON.parse(text);}catch{return new Response('Invalid',{status:400});}
 const url=process.env['SUPABASE_URL'];const key=process.env['SUPABASE_PUBLISHABLE_KEY'];if(!url||!key)return new Response('Unavailable',{status:503});
 const client=createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{const headers=new Headers(init?.headers);if(key.startsWith('sb_')&&headers.get('Authorization')===`Bearer ${key}`)headers.delete('Authorization');headers.set('apikey',key);return fetch(input,{...init,headers});}}});
 if(erase){const parsed=identity.strict().safeParse(body);if(!parsed.success)return new Response('Invalid',{status:400});const {error}=await client.rpc('erase_journey',{p_session:parsed.data.session,p_capability:parsed.data.capability});return new Response(null,{status:error?400:204});}
 const parsed=schema.safeParse(body);if(!parsed.success)return new Response('Invalid',{status:400});
 const d=parsed.data;const {error}=await client.rpc('record_journey',{p_session:d.session,p_visitor:d.visitor,p_capability:d.capability,p_meta:d.meta,p_events:d.events});
 return new Response(null,{status:error?400:204});
}
export const Route=createFileRoute('/api/public/journey')({server:{handlers:{POST:({request})=>handle(request),DELETE:({request})=>handle(request,true)}}});
