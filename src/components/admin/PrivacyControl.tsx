import { useEffect,useState } from 'react';
import { useLocation,Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { consentStatus,setAnalyticsConsent,flushJourney } from '@/lib/analytics/journey';
export function PrivacyControl(){
 const [status,setStatus]=useState<string|null>('pending');const [open,setOpen]=useState(false);const location=useLocation();
 useEffect(()=>{setStatus(consentStatus());const update=()=>setStatus(consentStatus());window.addEventListener('mariana-consent',update);const timer=window.setInterval(()=>void flushJourney(),15000);window.addEventListener('online',flushJourney);return()=>{clearInterval(timer);window.removeEventListener('mariana-consent',update);window.removeEventListener('online',flushJourney);};},[]);
 if(location.pathname!=='/'&&location.pathname!=='/receitas')return null;
 const choose=async(allow:boolean)=>{await setAnalyticsConsent(allow);setOpen(false);};
 if(status==='pending')return null;
 if(status!==null&&!open)return <Button variant="ghost" size="sm" className="fixed right-2 top-2 z-30 bg-card text-xs" onClick={()=>setOpen(true)}>Privacidade</Button>;
 return <aside aria-label="Preferências de privacidade" className="fixed inset-x-3 top-3 z-50 mx-auto max-w-lg rounded-lg border border-border bg-card p-4 shadow-lg"><p className="font-semibold">Sua privacidade importa</p><p className="mt-2 text-sm text-muted-foreground">Com sua permissão, medimos etapas e cliques por até 90 dias. Não guardamos seu nome nem suas respostas. Você pode usar o quiz sem aceitar.</p><Link to="/privacidade" className="mt-2 inline-block text-sm text-primary underline">Aviso de privacidade</Link><div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" onClick={()=>void choose(false)}>Recusar / revogar</Button><Button onClick={()=>void choose(true)}>Aceitar medição</Button></div></aside>;
}
