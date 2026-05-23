'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { t } from '@/lib/i18n';

const navItems = (lang) => [
  { href: '/dashboard', icon: '📊', label: lang==='ja'?'ダッシュボード':'Tổng quan' },
  { href: '/flocks',    icon: '🐔', label: lang==='ja'?'鶏群管理':'Đàn gà' },
  { href: '/houses',   icon: '🏠', label: lang==='ja'?'鶏舎管理':'Chuồng trại' },
  { href: '/daily',    icon: '📋', label: lang==='ja'?'日次記録':'Nhật ký' },
  { href: '/users',    icon: '👤', label: lang==='ja'?'ユーザー':'Người dùng' },
];

export default function Sidebar({ lang, user, onLogout }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-primary-800 flex flex-col shadow-xl">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-primary-700">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🐔</span>
          <span className="text-white font-bold text-lg">FarmTrack</span>
        </div>
        <p className="text-primary-300 text-xs mt-1">Web Dashboard</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems(lang).map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-white/20 text-white'
                  : 'text-primary-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-4 border-t border-primary-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-primary-300 text-xs">
              {user?.is_admin ? t('admin', lang) : t('worker', lang)}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full text-left text-primary-300 hover:text-red-300 text-sm flex items-center gap-2 px-1 transition-colors"
        >
          <span>🚪</span> {t('logout', lang)}
        </button>
      </div>
    </aside>
  );
}
