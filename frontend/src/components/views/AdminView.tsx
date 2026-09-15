import React, { useEffect, useState } from 'react';
import { Shield, Users, TrendingUp, UserX, Search, RefreshCw } from 'lucide-react';
import { fetchAdminUsersApi, deleteAdminUserApi } from '../../api/client';
import type { AdminUserStats } from '../../api/client';

interface AdminViewProps {
  onLogout?: () => void;
}

export const AdminView: React.FC<AdminViewProps> = () => {
  const [users, setUsers] = useState<AdminUserStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUsersApi();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleDismissUser = async (userItem: AdminUserStats) => {
    if (window.confirm(`Are you sure you want to dismiss/delete account for ${userItem.name} (${userItem.email})?\nThis will permanently delete all trades and journal logs for this account.`)) {
      setDeletingId(userItem.id);
      try {
        await deleteAdminUserApi(userItem.id);
        setUsers((prev) => prev.filter((u) => u.id !== userItem.id));
      } catch (err: any) {
        alert(err.message || 'Failed to delete user account');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalSystemTrades = users.reduce((sum, u) => sum + u.stats.totalTrades, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Admin Header */}
      <div className="desk-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#f0f1f4] flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-amber-400" />
            Admin Desk - User & Platform Management
          </h2>
          <p className="text-sm text-[#8a8f9d] mt-1">
            Monitor registered trader accounts, inspect win rates & performance, and manage user access
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={loadAdminData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#14171B] hover:bg-[#191C21] border border-[#252930] text-sm text-[#f0f1f4] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh List</span>
          </button>
        </div>
      </div>

      {/* Admin Quick Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-binance">
        <div className="desk-card p-5 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8a8f9d] font-sans">
            <Users className="w-4 h-4 text-indigo-400" /> Total Accounts
          </div>
          <div className="text-2xl font-bold text-[#f0f1f4]">{users.length} Users</div>
        </div>

        <div className="desk-card p-5 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8a8f9d] font-sans">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Total System Trades
          </div>
          <div className="text-2xl font-bold text-[#f0f1f4]">{totalSystemTrades} Trades</div>
        </div>

        <div className="desk-card p-5 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8a8f9d] font-sans">
            <Shield className="w-4 h-4 text-amber-400" /> System Status
          </div>
          <div className="text-base font-bold text-emerald-400 mt-1 font-sans">Full Admin Authority Active</div>
        </div>
      </div>

      {/* User Search & Filter */}
      <div className="desk-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#5e6370] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full desk-input pl-9 pr-3.5 py-2 text-sm"
            />
          </div>
          <div className="text-xs text-[#8a8f9d] font-binance">
            Showing <strong className="text-[#f0f1f4]">{filteredUsers.length}</strong> of {users.length} registered accounts
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
            {error}
          </div>
        )}

        {/* Users Table */}
        {loading ? (
          <div className="p-12 text-center text-sm text-[#8a8f9d] font-mono">Loading trader accounts...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#5e6370]">No trader accounts found matching search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#f0f1f4]">
              <thead className="bg-[#0F1114] text-[#8a8f9d] uppercase text-xs font-mono border-b border-[#252930]">
                <tr>
                  <th className="py-3 px-4">Trader Account</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Total Trades</th>
                  <th className="py-3 px-4">Win Rate</th>
                  <th className="py-3 px-4">Net P/L</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252930]/60 font-binance text-xs sm:text-sm">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#191C21]/60 transition-colors">
                    <td className="py-3 px-4 font-sans">
                      <div className="font-bold text-[#f0f1f4]">{u.name}</div>
                      <div className="text-xs text-[#8a8f9d] font-mono">{u.email}</div>
                    </td>

                    <td className="py-3 px-4">
                      {u.role === 'admin' ? (
                        <span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold font-mono">
                          ADMIN
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs bg-[#14171B] text-[#8a8f9d] border border-[#252930]">
                          USER
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-bold">{u.stats.totalTrades} trades</td>

                    <td className="py-3 px-4">
                      <span className={u.stats.winRate >= 50 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {u.stats.winRate}%
                      </span>
                      <span className="text-xs text-[#8a8f9d] ml-1">
                        ({u.stats.wins}W/{u.stats.losses}L)
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold">
                      <span className={u.stats.netPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {u.stats.netPL >= 0 ? '+' : ''}${u.stats.netPL.toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-xs font-sans text-[#8a8f9d]">
                      {new Date(u.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3 px-4 text-right font-sans">
                      {u.role === 'admin' ? (
                        <span className="text-xs text-[#5e6370] italic">Protected Admin</span>
                      ) : (
                        <button
                          onClick={() => handleDismissUser(u)}
                          disabled={deletingId === u.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-400 text-xs font-semibold transition-colors cursor-pointer ml-auto"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>{deletingId === u.id ? 'Dismissing...' : 'Dismiss User'}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
