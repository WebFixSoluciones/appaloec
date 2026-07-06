'use client';

import React, { useEffect, useState } from 'react';
import { db, auth } from '../../../lib/firebase/config';
import { logAdminAction } from '../../../lib/firebase/audit';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { 
  Users, 
  Search, 
  Mail, 
  Edit2, 
  Check, 
  X, 
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Slash
} from 'lucide-react';

const GoogleIcon = () => (
  <svg className="h-4 w-4 text-red-500 fill-current" viewBox="0 0 24 24">
    <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.41 0-6.19-2.78-6.19-6.19s2.78-6.19 6.19-6.19c1.7 0 3.25.69 4.4 1.8l3.185-3.185C19.065 2.54 15.86 1 12.24 1A11 11 0 001.24 12a11 11 0 0011 11c6.075 0 11-4.39 11-11 0-.742-.09-1.445-.26-2.115H12.24z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="h-4 w-4 text-blue-600 fill-current" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
import { toast } from 'sonner';

interface UserItem {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  authProvider?: string;
  role: 'admin' | 'user';
  membershipId?: string;
  status?: 'active' | 'suspended';
  createdAt?: any;
}

interface Membership {
  id: string;
  name: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields
  const [editRole, setEditRole] = useState<'admin' | 'user'>('user');
  const [editMembership, setEditMembership] = useState('free');
  const [editStatus, setEditStatus] = useState<'active' | 'suspended'>('active');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load memberships for dropdown selection
        const memSnap = await getDocs(collection(db, 'memberships'));
        const mems = memSnap.docs.map(d => ({ id: d.id, name: d.data().name }));
        setMemberships([{ id: 'free', name: 'Gratuito / Ninguno' }, ...mems]);

        // Load users
        const usersSnap = await getDocs(collection(db, 'users'));
        const list: UserItem[] = [];
        usersSnap.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            uid: docSnap.id,
            email: data.email || '',
            displayName: data.displayName || 'Usuario sin nombre',
            photoURL: data.photoURL || '',
            authProvider: data.authProvider || 'Email',
            role: data.role || 'user',
            membershipId: data.membershipId || 'free',
            status: data.status || 'active',
            createdAt: data.createdAt
          });
        });
        setUsers(list);
      } catch (err) {
        console.error('Error loading users:', err);
        toast.error('Error al cargar la lista de usuarios');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleEditClick = (user: UserItem) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditMembership(user.membershipId || 'free');
    setEditStatus(user.status || 'active');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    
    // Prevent self role downgrade
    if (selectedUser.uid === auth.currentUser?.uid && editRole !== 'admin') {
      toast.error('No puedes remover tu propio rol de Administrador.');
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Guardando cambios en el usuario...');

    try {
      const userRef = doc(db, 'users', selectedUser.uid);
      const updatedFields: Record<string, any> = {
        role: editRole,
        membershipId: editMembership,
        status: editStatus,
        membershipUpdatedAt: new Date(),
      };

      if (editMembership === 'free') {
        updatedFields.isPremium = false;
        updatedFields.activeProtocolId = null;
      } else {
        updatedFields.isPremium = true;
      }

      await updateDoc(userRef, updatedFields);

      // Audit log registration for traceability
      await logAdminAction('UPDATE', 'users', selectedUser.uid, {
        description: `Actualización de rol, membresía y estado del usuario: ${selectedUser.email}`,
        previousValues: {
          role: selectedUser.role,
          membershipId: selectedUser.membershipId,
          status: selectedUser.status
        },
        newValues: updatedFields
      });

      // Update state locally
      setUsers(users.map(u => u.uid === selectedUser.uid ? { ...u, ...updatedFields } : u));
      toast.success('Usuario actualizado correctamente', { id: toastId });
      setIsEditing(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error('Error al actualizar usuario: ' + error.message, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const term = search.toLowerCase();
    return (
      user.displayName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  });

  const getProviderIcon = (provider?: string) => {
    switch (provider?.toLowerCase()) {
      case 'google.com':
      case 'google':
        return <span title="Google Auth"><GoogleIcon /></span>;
      case 'facebook.com':
      case 'facebook':
        return <span title="Facebook Auth"><FacebookIcon /></span>;
      default:
        return <span title="Email Auth"><Mail size={16} className="text-ink-500" /></span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Usuarios Registrados</h1>
          <p className="text-sm text-ink-500 mt-1">Administra roles, accesos y suscripciones de los miembros.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ink-400" size={18} />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-ink-200 outline-none focus:border-[#008000] text-sm text-ink-900"
            placeholder="Buscar por nombre, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008000]"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="border border-ink-200 p-12 text-center text-ink-500 bg-white">
          <Users className="mx-auto mb-4 text-ink-300" size={48} />
          <p className="font-bold text-lg text-ink-700 mb-1">No se encontraron usuarios</p>
          <p className="text-sm">Prueba ajustando los términos de búsqueda.</p>
        </div>
      ) : (
        <div className="bg-white border border-ink-200 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50 text-xs font-bold text-ink-700 uppercase">
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Proveedor</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Membresía</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 text-sm text-ink-900">
              {filteredUsers.map((user) => (
                <tr key={user.uid} className="hover:bg-ink-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="h-9 w-9 rounded-full object-cover border border-ink-200" />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-ink-100 flex items-center justify-center font-bold text-ink-700">
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-bold">{user.displayName}</div>
                        <div className="text-xs text-ink-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getProviderIcon(user.authProvider)}
                      <span className="text-xs capitalize">{user.authProvider || 'Email'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-ink-100 text-ink-700'
                    }`}>
                      {user.role === 'admin' ? <ShieldCheck size={12} /> : <UserCheck size={12} />}
                      {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-xs">
                    <span className={`px-2 py-0.5 border ${
                      user.membershipId && user.membershipId !== 'free'
                        ? 'border-[#008000] text-[#008000] bg-[#008000]/5 font-bold'
                        : 'border-ink-200 text-ink-600'
                    }`}>
                      {memberships.find(m => m.id === user.membershipId)?.name || 'Gratuito / Ninguno'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                      user.status === 'suspended' ? 'text-red-600' : 'text-[#008000]'
                    }`}>
                      {user.status === 'suspended' ? '● Suspendido' : '● Activo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEditClick(user)}
                      className="p-2 text-ink-600 hover:text-[#008000] hover:bg-ink-50 transition-colors"
                      title="Editar privilegios/estado"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal (Dropbox Flat Theme) */}
      {isEditing && selectedUser && (
        <div className="fixed inset-0 bg-ink-900/40 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white border border-ink-300 w-full max-w-md p-6 relative">
            <h3 className="text-lg font-bold text-ink-900 mb-2">Editar Configuración de Usuario</h3>
            <p className="text-xs text-ink-500 mb-6">Modifica los accesos del usuario {selectedUser.email}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Rol del Sistema</label>
                <select
                  className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                >
                  <option value="user">Usuario Estándar</option>
                  <option value="admin">Administrador del Panel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Nivel de Membresía</label>
                <select
                  className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm"
                  value={editMembership}
                  onChange={(e) => setEditMembership(e.target.value)}
                >
                  {memberships.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase mb-2">Estado de Acceso</label>
                <select
                  className="w-full p-2.5 bg-white border border-ink-300 outline-none focus:border-ink-900 text-sm"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                >
                  <option value="active">Activo / Permitido</option>
                  <option value="suspended">Suspendido / Bloqueado</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 border-t border-ink-200 pt-4">
              <button
                type="button"
                className="px-4 py-2 border border-ink-300 text-ink-700 font-bold text-sm hover:bg-ink-50 transition-colors"
                onClick={() => setIsEditing(false)}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-[#008000] hover:bg-[#006400] text-white font-bold text-sm transition-colors flex items-center gap-1.5"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
