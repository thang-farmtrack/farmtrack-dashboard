'use client';
import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, getUser, clearAuth } from '@/lib/auth';

import { useT } from '@/lib/i18n';

const FarmCtx = createContext({ lang:'vi', user:null });
export const useFarm = () => useContext(FarmCtx);

// ── Icons (Tabler-style SVG) ─────────────────────────────────
const I = {
  home:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  chart:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  feed:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  chicken: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="9" r="4"/><path d="M8 13c-2 1-4 3-4 6h16c0-3-2-5-4-6"/><path d="M9 9c.3-2 1.5-4 3-4s2.7 2 3 4"/></svg>,
  molting: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  report:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  bell:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  settings:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  logout:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

const NAV = [
  { href:'/dashboard',           icon:I.home,    key:'nav_dashboard', badge:null },
  { href:'/phan-tich-ky-thuat', icon:I.chart,   key:'nav_tech',      badge:null },
  { href:'/quan-ly-cam',        icon:I.feed,    key:'nav_feed',      badge:null },
  { href:'/flocks',             icon:I.chicken, key:'nav_flock',     badge:null },
  { href:'/molting',            icon:I.molting, key:'nav_molt',      badge:null },
  { href:'/bao-cao',            icon:I.report,  key:'nav_report',    badge:null },
  { href:'/canh-bao',           icon:I.bell,    key:'nav_alert',     badge:8    },
  { href:'/cai-dat',            icon:I.settings,key:'nav_settings',  badge:null },
];

const SB = {
  bg:         '#0c1f0c',
  border:     '1px solid #1a3a1a',
  text:       '#86efac',
  textMuted:  '#4a7c4a',
  active:     '#166534',
  activeText: '#4ade80',
  logo:       '#4ade80',
};

export default function FarmLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser]   = useState(null);
  const [lang, setLang]   = useState('vi');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/login'); return; }
    setUser(getUser());
    const saved = localStorage.getItem('farmtrack_lang') || 'vi';
    setLang(saved);
    setReady(true);
  }, [router]);

  const handleLogout = () => { clearAuth(); router.replace('/login'); };
  const toggleLang   = () => {
    const nl = lang === 'vi' ? 'ja' : 'vi';
    setLang(nl);
    localStorage.setItem('farmtrack_lang', nl);
  };

  const t = useT(lang);

  if (!ready) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0f1117'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:40,marginBottom:12}}>🐔</div>
        <p style={{color:'#4ade80',fontSize:13,letterSpacing:1}}>{t('loading')}</p>
      </div>
    </div>
  );

  return (
    <FarmCtx.Provider value={{ lang, setLang, user }}>
      <div style={{display:'flex',minHeight:'100vh',background:'#0f1117',fontFamily:"'Inter',system-ui,sans-serif"}}>

        {/* ── Sidebar ────────────────────────────────────── */}
        <aside style={{
          width:220, flexShrink:0, background:SB.bg,
          borderRight:SB.border, display:'flex', flexDirection:'column',
          position:'sticky', top:0, height:'100vh', overflowY:'auto',
          zIndex:50,
        }}>
          {/* Logo */}
          <div style={{padding:'18px 16px 14px',borderBottom:SB.border}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{
                width:34,height:34,borderRadius:8,background:'#166534',
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,
              }}>🐔</div>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:'#ffffff',letterSpacing:1.5}}>FARMTRACK</div>
                <div style={{fontSize:9,color:SB.logo,letterSpacing:0.5,marginTop:1}}>Poultry Farm Management</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{flex:1,padding:'10px 8px',overflowY:'auto'}}>
            {NAV.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href+'/');
              return (
                <Link key={item.href} href={item.href} style={{textDecoration:'none',display:'block'}}>
                  <div style={{
                    display:'flex', alignItems:'center', gap:9, padding:'8px 10px',
                    borderRadius:7, marginBottom:2, cursor:'pointer',
                    background: active ? SB.active : 'transparent',
                    color: active ? SB.activeText : SB.text,
                    transition:'all 0.15s',
                    fontSize:12.5, fontWeight: active ? 600 : 400,
                  }}>
                    <span style={{flexShrink:0,opacity:active?1:0.75}}>{item.icon}</span>
                    <span style={{flex:1,lineHeight:1.3}}>{t(item.key)}</span>
                    {item.badge != null && (
                      <span style={{
                        background:'#ef4444',color:'#fff',fontSize:10,fontWeight:700,
                        padding:'1px 6px',borderRadius:999,minWidth:18,textAlign:'center',lineHeight:1.4,
                      }}>{item.badge}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Lang toggle */}
          <div style={{padding:'8px 10px',borderTop:SB.border}}>
            <button onClick={toggleLang} style={{
              width:'100%',padding:'6px 10px',borderRadius:6,fontSize:11,
              background:'transparent',border:'1px solid #1a3a1a',
              color:SB.text,cursor:'pointer',display:'flex',alignItems:'center',gap:6,
            }}>
              <span style={{fontSize:14}}>{lang==='vi'?'🇻🇳':'🇯🇵'}</span>
              <span>{lang==='vi'?'Tiếng Việt':'日本語'}</span>
            </button>
          </div>

          {/* User */}
          <div style={{padding:'10px 10px 14px',borderTop:SB.border}}>
            <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:9}}>
              <div style={{
                width:32,height:32,borderRadius:'50%',background:'#166534',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:13,fontWeight:700,color:'#4ade80',flexShrink:0,
              }}>{user?.name?.[0]?.toUpperCase()?? 'A'}</div>
              <div style={{minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,color:'#e6edf3',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                  {user?.name ?? 'Farm Admin'}
                </div>
                <div style={{fontSize:10,color:'#4ade80'}}>
                  {user?.is_admin ? t('role_admin') : t('role_staff')}
                </div>
              </div>
            </div>
            <button onClick={handleLogout} style={{
              display:'flex',alignItems:'center',gap:6,background:'transparent',
              border:'1px solid #1a3a1a',color:SB.text,fontSize:11,
              padding:'5px 10px',borderRadius:6,cursor:'pointer',width:'100%',
            }}>
              {I.logout} {t('logout')}
            </button>
          </div>
        </aside>

        {/* ── Main content ──────────────────────────────── */}
        <main style={{flex:1,overflow:'auto',minWidth:0}}>
          {children}
        </main>

      </div>
    </FarmCtx.Provider>
  );
}
