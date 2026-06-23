import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function UsersList({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchVal);
      setOffset(0);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchVal]);

  // Drawer / modal profile details
  const [selectedUser, setSelectedUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  // Notes state
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Banning/Action states
  const [actionReason, setActionReason] = useState('');
  const [actionUser, setActionUser] = useState(null);
  const [actionType, setActionType] = useState(''); // 'ban' | 'unban' | 'activate' | 'deactivate' | 'role'
  const [targetRole, setTargetRole] = useState('USER');

  // Add Staff Modal state
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({ username: '', email: '', password: '', role: 'SUPPORT' });
  const [addingStaff, setAddingStaff] = useState(false);

  // Delete user confirmation state
  const [deleteTargetUser, setDeleteTargetUser] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/api/admin/users/?search=${search}&role=${roleFilter}&status=${statusFilter}&limit=${limit}&offset=${offset}`
      );
      setUsers(res.users);
      setTotal(res.total);
    } catch (err) {
      alert(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter, offset]);

  const viewUserProfile = async (user) => {
    setSelectedUser(user);
    setProfileLoading(true);
    try {
      const res = await api.get(`/api/admin/users/${user.id}/profile/`);
      setProfileData(res);
      setNotes(res.admin_notes || '');
    } catch (err) {
      alert(err.message || 'Failed to fetch user profile details');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedUser) return;
    setSavingNotes(true);
    try {
      const res = await api.post(`/api/admin/users/${selectedUser.id}/notes/`, { notes });
      setNotes(res.admin_notes);
      // update list
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, admin_notes: res.admin_notes } : u));
      alert('Internal staff notes saved successfully');
    } catch (err) {
      alert(err.message || 'Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const submitStatusAction = async () => {
    if (!actionUser) return;
    try {
      const body = {
        action: actionType,
        reason: actionReason,
      };
      if (actionType === 'role') {
        body.role = targetRole;
      }
      await api.post(`/api/admin/users/${actionUser.id}/status/`, body);
      fetchUsers();
      setActionUser(null);
      setActionReason('');
      if (selectedUser && selectedUser.id === actionUser.id) {
        // reload drawer details
        viewUserProfile(actionUser);
      }
    } catch (err) {
      alert(err.message || 'Failed to process action');
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setAddingStaff(true);
    try {
      await api.post('/api/admin/users/add-staff/', newStaff);
      alert(`Successfully added staff member: ${newStaff.username}`);
      setShowAddStaff(false);
      setNewStaff({ username: '', email: '', password: '', role: 'SUPPORT' });
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to add staff member');
    } finally {
      setAddingStaff(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTargetUser || !deleteReason.trim()) return;
    setDeleting(true);
    try {
      const res = await api.post(`/api/admin/users/${deleteTargetUser.id}/status/`, {
        action: 'delete',
        reason: deleteReason,
      });
      if (res.status === 'deleted') {
        // Close drawer if deleted user was being inspected
        if (selectedUser && selectedUser.id === deleteTargetUser.id) {
          setSelectedUser(null);
          setProfileData(null);
        }
        setDeleteTargetUser(null);
        setDeleteReason('');
        fetchUsers();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete user account');
    } finally {
      setDeleting(false);
    }
  };

  const formatSize = (bytes) => {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-kalam text-4xl font-bold text-[#2E241B]">Users Management</h1>
          <p className="font-patrick text-xl text-[#2E241B]/70">Admin moderation dashboard for Eterna accounts</p>
        </div>
        {currentUser?.role === 'ADMIN' && (
          <button
            onClick={() => setShowAddStaff(true)}
            className="bg-[#2E241B] hover:bg-black text-[#F8F5F0] px-4 py-2 rounded-lg font-bold shadow transition flex items-center gap-2"
          >
            <span>➕</span> Add Staff
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border-2 border-[#2E241B] p-4 rounded-lg shadow-hard font-patrick text-lg">
        <div>
          <label className="block text-sm font-bold text-[#2E241B] mb-1">Search User</label>
          <input
            type="text"
            placeholder="Username or email..."
            className="w-full bg-[#F8F5F0] border-2 border-[#2E241B] px-3 py-1.5 rounded"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-[#2E241B] mb-1">Staff Role</label>
          <select
            className="w-full bg-[#F8F5F0] border-2 border-[#2E241B] px-3 py-1.5 rounded"
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setOffset(0); }}
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Super Admin</option>
            <option value="MODERATOR">Moderator</option>
            <option value="SUPPORT">Support Staff</option>
            <option value="USER">Regular User</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-[#2E241B] mb-1">Status Filter</label>
          <select
            className="w-full bg-[#F8F5F0] border-2 border-[#2E241B] px-3 py-1.5 rounded"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setOffset(0); }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active & Clean</option>
            <option value="inactive">Deactivated</option>
            <option value="banned">Banned</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => { setSearchVal(''); setSearch(''); setRoleFilter(''); setStatusFilter(''); setOffset(0); }}
            className="w-full bg-white border-2 border-[#2E241B] text-[#2E241B] hover:bg-gray-100 py-1.5 font-bold rounded"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border-2 border-[#2E241B] rounded-lg shadow-hard overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-4 border-dashed border-[#C59B5C] rounded-full animate-spin"></div>
          </div>
        ) : users.length === 0 ? (
          <p className="font-patrick text-center text-xl text-[#2E241B]/60 italic py-16">No users found matching query.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-patrick text-lg border-collapse">
              <thead>
                <tr className="bg-[#2E241B] text-[#F8F5F0] border-b-2 border-[#2E241B]">
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Storage</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E241B]/10">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-gray-300 bg-gray-200 overflow-hidden shrink-0">
                        {u.profile_image ? (
                          <img src={u.profile_image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 uppercase">
                            {u.username[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-[#2E241B]">{u.username}</div>
                        <div className="text-xs text-gray-500">{u.display_name}</div>
                      </div>
                    </td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                        u.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                        u.role === 'MODERATOR' ? 'bg-amber-100 text-amber-700' :
                        u.role === 'SUPPORT' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-sm">{formatSize(u.storage_used)}</td>
                    <td className="p-3">
                      {u.is_banned ? (
                        <span className="text-red-600 font-bold">⛔ Banned</span>
                      ) : !u.is_active ? (
                        <span className="text-gray-400 italic">Deactivated</span>
                      ) : (
                        <span className="text-green-600 font-bold">🟢 Active</span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-2 shrink-0">
                      <button
                        onClick={() => viewUserProfile(u)}
                        className="bg-white border border-[#2E241B] px-2.5 py-1 text-sm rounded hover:bg-[#C59B5C]/10 text-[#2E241B]"
                      >
                        Inspect
                      </button>
                      {currentUser?.role === 'ADMIN' && u.id !== currentUser.id && (
                        <button
                          onClick={() => { setDeleteTargetUser(u); setDeleteReason(''); }}
                          className="bg-red-50 hover:bg-red-100 border border-red-400 px-2.5 py-1 text-sm rounded text-red-700 font-bold"
                          title="Permanently delete this account"
                        >
                          🗑 Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="bg-[#F8F5F0] border-t border-[#2E241B]/10 p-3 flex justify-between items-center font-patrick">
          <button
            disabled={offset === 0}
            onClick={() => setOffset(prev => Math.max(0, prev - limit))}
            className="px-3 py-1 bg-white border border-[#2E241B] disabled:opacity-50 rounded hover:bg-gray-50"
          >
            ◀ Previous Page
          </button>
          <span className="text-[#2E241B]/60 text-lg">
            Showing {offset + 1}-{Math.min(offset + limit, total)} of {total}
          </span>
          <button
            disabled={offset + limit >= total}
            onClick={() => setOffset(prev => prev + limit)}
            className="px-3 py-1 bg-white border border-[#2E241B] disabled:opacity-50 rounded hover:bg-gray-50"
          >
            Next Page ▶
          </button>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddStaff && (
        <div className="fixed inset-0 bg-[#2E241B]/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-3 border-[#2E241B] p-6 max-w-md w-full rounded-lg shadow-hard font-patrick text-lg">
            <h3 className="font-kalam text-2xl font-bold text-[#2E241B] mb-4 uppercase">
              Add Staff Member
            </h3>
            
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Username</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#F8F5F0] border-2 border-[#2E241B] px-3 py-2 rounded"
                  value={newStaff.username}
                  onChange={(e) => setNewStaff({...newStaff, username: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full bg-[#F8F5F0] border-2 border-[#2E241B] px-3 py-2 rounded"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  className="w-full bg-[#F8F5F0] border-2 border-[#2E241B] px-3 py-2 rounded"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-1">Assign Role</label>
                <select 
                  className="w-full bg-[#F8F5F0] border-2 border-[#2E241B] px-3 py-2 rounded"
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                >
                  <option value="ADMIN">Super Admin (Full Access)</option>
                  <option value="MODERATOR">Co-Admin / Moderator</option>
                  <option value="SUPPORT">Spectator / Support Staff</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 font-bold mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddStaff(false)}
                  className="bg-white border border-gray-300 px-4 py-1.5 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingStaff}
                  className="bg-[#2E241B] text-white px-4 py-1.5 rounded hover:bg-black disabled:opacity-50 flex items-center gap-2"
                >
                  {addingStaff ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Reason Confirmation Modal */}
      {actionUser && (
        <div className="fixed inset-0 bg-[#2E241B]/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-3 border-[#2E241B] p-6 max-w-md w-full rounded-lg shadow-hard font-patrick text-lg">
            <h3 className="font-kalam text-2xl font-bold text-[#2E241B] mb-2 uppercase">
              {actionType} User: {actionUser.username}
            </h3>
            
            {actionType === 'role' ? (
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1">Select Role</label>
                <select 
                  className="w-full bg-[#F8F5F0] border-2 border-[#2E241B] px-3 py-2 rounded"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                >
                  <option value="USER">Regular User</option>
                  <option value="SUPPORT">Support Staff</option>
                  <option value="MODERATOR">Moderator</option>
                  <option value="ADMIN">Super Admin</option>
                </select>
              </div>
            ) : null}

            <div className="mb-4">
              <label className="block text-sm font-bold mb-1">Provide Audit Action Reason</label>
              <textarea
                placeholder="Reason for safety logs..."
                className="w-full bg-[#F8F5F0] border-2 border-[#2E241B] h-24 p-2 rounded"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-3 font-bold">
              <button
                onClick={() => setActionUser(null)}
                className="bg-white border border-gray-300 px-4 py-1.5 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={submitStatusAction}
                disabled={!actionReason.trim()}
                className="bg-[#2E241B] text-white px-4 py-1.5 rounded hover:bg-black disabled:opacity-50"
              >
                Submit Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deleteTargetUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-red-600 p-6 max-w-md w-full rounded-xl shadow-2xl font-patrick text-lg">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">☠</span>
              <div>
                <h3 className="font-kalam text-2xl font-bold text-red-700">Permanently Delete Account</h3>
                <p className="text-sm text-gray-600">This action is <strong>irreversible</strong>. All data will be wiped.</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-sm">
              <p className="font-bold text-red-800">Account to be deleted:</p>
              <p className="text-red-700 font-mono">{deleteTargetUser.username} &lt;{deleteTargetUser.email}&gt;</p>
              <p className="text-red-600 mt-1">⚠ All memorials, stories, messages, and uploads owned by this user will be permanently erased.</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-1 text-red-700">Mandatory Deletion Reason (for audit log)</label>
              <textarea
                placeholder="State the reason for permanent account removal..."
                className="w-full bg-red-50 border-2 border-red-400 focus:border-red-600 h-24 p-2 rounded outline-none"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 font-bold">
              <button
                onClick={() => { setDeleteTargetUser(null); setDeleteReason(''); }}
                disabled={deleting}
                className="bg-white border border-gray-300 px-4 py-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={!deleteReason.trim() || deleting}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-1.5 rounded disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? 'Deleting...' : '☠ Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Detail Drawer */}
      {selectedUser && (
        <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-[#F8F5F0] border-l-3 border-[#2E241B] shadow-hard z-40 flex flex-col font-patrick">
          <div className="p-6 bg-[#2E241B] text-[#F8F5F0] flex justify-between items-center shrink-0">
            <div>
              <h2 className="font-kalam text-3xl font-bold">User Inspector</h2>
              <p className="text-sm opacity-80">Inspecting {selectedUser.username}</p>
            </div>
            <button
              onClick={() => { setSelectedUser(null); setProfileData(null); }}
              className="text-[#C59B5C] font-bold hover:text-white text-xl"
            >
              ✕ Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {profileLoading ? (
              <div className="flex justify-center items-center py-24">
                <div className="w-10 h-10 border-4 border-dashed border-[#C59B5C] rounded-full animate-spin"></div>
              </div>
            ) : profileData ? (
              <>
                {/* Profile Header */}
                <div className="flex gap-4 items-start bg-white border-2 border-[#2E241B] p-4 rounded">
                  <div className="w-16 h-16 rounded-full bg-gray-200 border border-gray-300 overflow-hidden shrink-0">
                    {profileData.profile_image ? (
                      <img src={profileData.profile_image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 uppercase text-3xl">
                        {profileData.username[0]}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-[#2E241B]">{profileData.username}</h3>
                    <p className="text-gray-600">{profileData.email}</p>
                    <p className="text-sm italic">"{profileData.display_name || 'No display name'}"</p>
                    {profileData.last_seen && (
                      <p className="text-xs text-gray-500 font-mono">Last Active: {new Date(profileData.last_seen).toLocaleString()}</p>
                    )}
                  </div>
                </div>

                {/* Profile Actions */}
                <div className="bg-white border-2 border-[#2E241B] p-4 rounded space-y-3">
                  <h4 className="font-kalam text-lg font-bold text-[#C59B5C]">Moderator Commands</h4>
                  <div className="flex flex-wrap gap-2">
                    {profileData.is_active ? (
                      <button
                        onClick={() => { setActionUser(selectedUser); setActionType('deactivate'); }}
                        className="bg-gray-100 hover:bg-gray-200 text-[#2E241B] border border-[#2E241B] px-3 py-1 rounded text-sm font-bold"
                      >
                        Deactivate Account
                      </button>
                    ) : (
                      <button
                        onClick={() => { setActionUser(selectedUser); setActionType('activate'); }}
                        className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-600 px-3 py-1 rounded text-sm font-bold"
                      >
                        Activate Account
                      </button>
                    )}

                    {currentUser.role === 'ADMIN' ? (
                      <>
                        {profileData.is_banned ? (
                          <button
                            onClick={() => { setActionUser(selectedUser); setActionType('unban'); }}
                            className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-600 px-3 py-1 rounded text-sm font-bold"
                          >
                            Unban User
                          </button>
                        ) : (
                          <button
                            onClick={() => { setActionUser(selectedUser); setActionType('ban'); }}
                            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-600 px-3 py-1 rounded text-sm font-bold"
                          >
                            Ban Account
                          </button>
                        )}
                        <button
                          onClick={() => { setActionUser(selectedUser); setActionType('role'); setTargetRole(profileData.role); }}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-600 px-3 py-1 rounded text-sm font-bold"
                        >
                          Modify Admin Role
                        </button>
                        {selectedUser.id !== currentUser.id && (
                          <button
                            onClick={() => { setDeleteTargetUser(selectedUser); setDeleteReason(''); }}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-bold ml-auto"
                            title="Permanently delete this account and all its data"
                          >
                            ☠ Permanently Delete Account
                          </button>
                        )}
                      </>
                    ) : null}
                  </div>
                  {profileData.is_banned && (
                    <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-100 p-2 rounded italic">
                      Banned Reason: {profileData.ban_reason || 'No reason specified'}
                    </div>
                  )}
                </div>

                {/* Storage Meter */}
                <div className="bg-white border-2 border-[#2E241B] p-4 rounded space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-[#2E241B]">Storage Space Limit</span>
                    <span className="font-mono">{formatSize(profileData.storage_used)} / {formatSize(profileData.storage_limit)}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-[#C59B5C] h-full"
                      style={{ width: `${Math.min((profileData.storage_used / profileData.storage_limit) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Internal Admin Notes */}
                <div className="bg-white border-2 border-[#2E241B] p-4 rounded space-y-3">
                  <h4 className="font-kalam text-lg font-bold text-[#C59B5C]">Internal Staff Notes (Visible only to staff)</h4>
                  <textarea
                    placeholder="Enter annotations for logs or transfer requests..."
                    className="w-full bg-[#F8F5F0] border border-[#2E241B] h-28 p-2 rounded text-base font-patrick"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="bg-[#2E241B] hover:bg-black text-[#F8F5F0] px-4 py-1 rounded font-bold text-sm disabled:opacity-50"
                  >
                    {savingNotes ? 'Saving...' : 'Save Annotation'}
                  </button>
                </div>

                {/* Memorials Owned */}
                <div className="bg-white border-2 border-[#2E241B] p-4 rounded space-y-2">
                  <h4 className="font-kalam text-lg font-bold text-[#C59B5C]">Memorials Owned</h4>
                  {profileData.memorials.length === 0 ? (
                    <p className="text-sm italic text-gray-500">No memorials owned.</p>
                  ) : (
                    <ul className="divide-y divide-[#2E241B]/10 max-h-48 overflow-y-auto">
                      {profileData.memorials.map(m => (
                        <li key={m.id} className="py-1.5 flex justify-between items-center text-sm">
                          <div>
                            <span className="font-bold">{m.full_name}</span>
                            <span className="text-gray-500 ml-2 font-mono text-xs">ID:{m.id}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="bg-gray-100 text-gray-700 px-1 rounded text-xs">{m.visibility}</span>
                            {m.is_hidden && <span className="bg-red-100 text-red-700 px-1 rounded text-xs">Hidden</span>}
                            {m.is_archived && <span className="bg-amber-100 text-amber-700 px-1 rounded text-xs">Archived</span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Tales Written */}
                <div className="bg-white border-2 border-[#2E241B] p-4 rounded space-y-2">
                  <h4 className="font-kalam text-lg font-bold text-[#C59B5C]">Tales Written</h4>
                  {profileData.tales.length === 0 ? (
                    <p className="text-sm italic text-gray-500">No tales written.</p>
                  ) : (
                    <ul className="divide-y divide-[#2E241B]/10 max-h-48 overflow-y-auto">
                      {profileData.tales.map(t => (
                        <li key={t.id} className="py-1.5 flex justify-between items-center text-sm">
                          <div>
                            <span className="font-bold">{t.title}</span>
                            <span className="text-gray-500 ml-2 font-mono text-xs">ID:{t.id}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="bg-gray-100 text-gray-700 px-1 rounded text-xs">{t.is_public ? 'Public' : 'Private'}</span>
                            {t.is_hidden && <span className="bg-red-100 text-red-700 px-1 rounded text-xs">Hidden</span>}
                            {t.is_archived && <span className="bg-amber-100 text-amber-700 px-1 rounded text-xs">Archived</span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
