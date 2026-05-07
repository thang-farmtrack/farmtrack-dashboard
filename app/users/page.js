'use client';
import { useState, useEffect } from 'react';
import AppShell, { useLang } from '@/components/AppShell';
import { usersApi } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { t } from '@/lib/i18n';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function UsersContent() {
  const { lang } = useLang();
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showAdd, setShowAdd]   = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [isAdmin, setIsAdmin]   = useState(false);
  const [form, setForm]         = useState({ name: '', phone: '', password: '', is_admin: false });

  useEffect(() => {
    const me = getUser();
    setIsAdmin(me?.is_admin === true || me?.isAdmin === true);
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await usersApi.getAll();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await usersApi.create(form);
      setShowAdd(false);
      setForm({ name: '', phone: '', password: '', is_admin: false });
      await load();
    } catch(err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    setSaving(true);
    try {
      await usersApi.delete(id);
      setDeleteId(null);
      await load();
    } catch(err) { alert(err.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('users', lang)}</h1>
          <p className="text-gray-400 text-sm mt-1">{t('userList', lang)}</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <span>+</span> {t('addUser', lang)}
          </button>
        )}
      </div>

      {!isAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-yellow-700 text-sm">
          ⚠️ {lang === 'vi' ? 'Chỉ quản trị viên mới có thể quản lý người dùng.' : '管理者のみがユーザーを管理できます。'}
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">{t('loading', lang)}</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-400">{t('noData', lang)}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['ID', t('name',lang), t('phone',lang), t('role',lang), t('actions',lang)].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-400 font-mono">#{u.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      u.is_admin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.is_admin ? t('admin', lang) : t('worker', lang)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {isAdmin && (
                      <button
                        onClick={() => setDeleteId(u.id)}
                        className="text-red-400 hover:text-red-600 text-xs font-medium transition"
                      >
                        🗑 {t('delete', lang)}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <Modal title={t('addUser', lang)} onClose={() => { setShowAdd(false); setError(''); }}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm mb-4">{error}</div>
          )}
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('name', lang)}</label>
              <input className="input-field" required value={form.name}
                onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone', lang)}</label>
              <input className="input-field" type="tel" required value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})} placeholder="0912345678" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('password', lang)}</label>
              <input className="input-field" type="password" required value={form.password}
                onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_admin" checked={form.is_admin}
                onChange={e => setForm({...form, is_admin: e.target.checked})}
                className="w-4 h-4 accent-primary-700" />
              <label htmlFor="is_admin" className="text-sm text-gray-700">{t('admin', lang)}</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setShowAdd(false); setError(''); }}
                className="btn-secondary flex-1 justify-center">{t('cancel', lang)}</button>
              <button type="submit" disabled={saving}
                className="btn-primary flex-1 justify-center">
                {saving ? t('loading', lang) : t('save', lang)}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <Modal title={t('confirm', lang)} onClose={() => setDeleteId(null)}>
          <p className="text-gray-600 mb-6">{t('confirmDelete', lang)}</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1 justify-center">{t('cancel', lang)}</button>
            <button onClick={() => handleDelete(deleteId)} disabled={saving}
              className="btn-danger flex-1">
              {saving ? t('loading', lang) : t('delete', lang)}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function UsersPage() {
  return <AppShell><UsersContent /></AppShell>;
}
