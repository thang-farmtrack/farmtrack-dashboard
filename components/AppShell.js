'use client';
import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getUser, clearAuth, isAuthenticated } from '@/lib/auth';
import { t } from '@/lib/i18n';

const AppCtx = createContext({
  lang: 'ja', setLang: () => {},
  user: null,
  filters: {}, setFilters: () => {},
});
export const useApp = () => useContext(AppCtx);

const NAV = [
  { href: '/dashboard', icon: '📊', labelVi: 'Tổng quan',    labelJa: 'ダッシュボード' },
  { href: '/flocks',    icon: '🐔', labelVi: 'Đàn gà',       labelJa: '鶏群管理' },
  { href: '/houses',   icon: '🏠', labelVi: 'Chuồng trại',  labelJa: '鶏舎管理' },
  { href: '/daily',    icon: '📋', labelVi: 'Nhật ký',       labelJa: '日次記録' },
  { href: '/users',    icon: '👤', labelVi: 'Người dùng',    labelJa: 'ユーザー' },
];

export default function AppShell({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser]     = useState(null);
  const [lang, setLangS]    = useState('ja');
  const [ready, setReady]   = useState(false);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/login'); return; }
    setUser(getUser());
    const saved = localStorage.getItem('farmtrack_lang') || 'ja';
    setLangS(saved);
    setReady(true);
  }, [router]);

  function setLang(l) { setLangS(l); localStorage.setItem('farmtrack_lang', l); }
  function handleLogout() { clearAuth(); router.replace('/login'); }

  if (!ready) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#080c10' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:40, marginBottom:12 }}>🐔</div>
        <p style={{ color:'#607080', fontSize:13 }}>Loading...</p>
      </div>
    </div>
  );

  const label = (item) => lang === 'ja' ? item.labelJa : item.labelVi;

  return (
    <AppCtx.Provider value={{ lang, setLang, user, filters, setFilters }}>
      <div style={{ display:'flex', minHeight:'100vh', position:'relative', zIndex:1 }}>
        {/* Sidebar */}
        <aside style={{
          width: 220, flexShrink: 0,
          background: 'var(--sf)',
          borderRight: '1px solid var(--bd)',
          display: 'flex', flexDirection: 'column',
          position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
        }}>
          {/* Logo */}
          <div style={{ padding:'20px 16px 14px', borderBottom:'1px solid var(--bd)' }}>
            <div style={{ fontSize:20, fontWeight:700, color:'var(--acc)', letterSpacing:2 }}>🐔 FARM</div>
            <div style={{ fontSize:9, color:'var(--mu)', marginTop:3, fontFamily:'monospace', letterSpacing:1 }}>
              {lang === 'ja' ? '採卵鶏 分析システム' : 'FarmTrack Dashboard'}
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:2 }}>
            {NAV.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link key={item.href} href={item.href} style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding:'9px 12px', borderRadius:8,
                  fontSize:12, fontWeight: active ? 500 : 400,
                  color: active ? '#fff' : 'var(--tx2)',
                  background: active ? 'rgba(245,166,35,.15)' : 'transparent',
                  border: active ? '1px solid rgba(245,166,35,.3)' : '1px solid transparent',
                  textDecoration:'none', transition:'all .15s',
                }}>
                  <span style={{ fontSize:14 }}>{item.icon}</span>
                  {label(item)}
                </Link>
              );
            })}
          </nav>

          {/* User */}
          <div style={{ padding:'12px 14px', borderTop:'1px solid var(--bd)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <div style={{
                width:32, height:32, borderRadius:'50%',
                background:'rgba(245,166,35,.2)', border:'1.5px solid rgba(245,166,35,.4)',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'var(--acc)', fontWeight:700, fontSize:12, flexShrink:0,
              }}>{user?.name?.[0]?.toUpperCase() ?? 'U'}</div>
              <div>
                <div style={{ color:'var(--tx)', fontSize:12, fontWeight:500 }}>{user?.name}</div>
                <div style={{ color:'var(--mu)', fontSize:10 }}>
                  {user?.is_admin ? (lang==='ja'?'管理者':'Quản trị') : (lang==='ja'?'作業員':'Nhân viên')}
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={() => setLang(lang==='ja'?'vi':'ja')} style={{
                flex:1, padding:'5px 0', fontSize:10, fontFamily:'monospace', fontWeight:700,
                background:'transparent', border:'1px solid var(--bd2)',
                color:'var(--tx2)', borderRadius:6, cursor:'pointer',
              }}>{lang==='ja'?'JP → VI':'VI → JP'}</button>
              <button onClick={handleLogout} style={{
                flex:1, padding:'5px 0', fontSize:10,
                background:'transparent', border:'1px solid var(--bd2)',
                color:'var(--mu)', borderRadius:6, cursor:'pointer',
              }}>{lang==='ja'?'ログアウト':'Đăng xuất'}</button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex:1, minWidth:0, overflowX:'hidden' }}>
          {children}
        </main>
      </div>
    </AppCtx.Provider>
  );
}
