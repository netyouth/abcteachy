import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Profile, UserRole } from '@/integrations/supabase/types';
import { supabaseAdmin, createUserAsAdmin } from '@/integrations/supabase/admin-client';
import { Database } from '@/integrations/supabase/types';
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  Shield,
  Users
} from 'lucide-react';

type EditableUser = Profile;

interface EditState {
  isOpen: boolean;
  user: EditableUser | null;
  isSubmitting: boolean;
  fullName: string;
  role: UserRole;
}

export function AdminUserManagement() {
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [users, setUsers] = useState<EditableUser[]>([]);
  const [search, setSearch] = useState<string>('');

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState<{ fullName: string; email: string; password: string; role: UserRole }>({
    fullName: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const [editState, setEditState] = useState<EditState>({
    isOpen: false,
    user: null,
    isSubmitting: false,
    fullName: '',
    role: 'student',
  });

  const [deleteState, setDeleteState] = useState<{ isOpen: boolean; isSubmitting: boolean; user: EditableUser | null }>({
    isOpen: false,
    isSubmitting: false,
    user: null,
  });

  const loadUsers = useCallback(async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers((data as unknown as Database['public']['Tables']['profiles']['Row'][]) || []);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      toast({ title: 'Failed to load users', description: err.message || 'Unknown error', variant: 'destructive' });
    }
  }, [toast]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await loadUsers();
      setIsLoading(false);
    })();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(u =>
      u.full_name.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    );
  }, [users, search]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadUsers();
    setIsRefreshing(false);
  };

  const openEdit = (user: EditableUser) => {
    setEditState({
      isOpen: true,
      user,
      isSubmitting: false,
      fullName: user.full_name,
      role: user.role as UserRole,
    });
  };

  const submitEdit = async () => {
    if (!editState.user) return;
    setEditState(prev => ({ ...prev, isSubmitting: true }));
    try {
      const userId = editState.user.id;
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ full_name: editState.fullName, role: editState.role })
        .eq('id', userId);
      if (profileError) throw profileError;

      // Also update auth user metadata for consistency
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { full_name: editState.fullName, role: editState.role },
      });
      if (authError) throw authError;

      toast({ title: 'User updated', description: `${editState.fullName} is now ${editState.role}.` });
      setEditState(prev => ({ ...prev, isOpen: false, isSubmitting: false }));
      await loadUsers();
    } catch (err: any) {
      console.error('Failed to update user:', err);
      toast({ title: 'Failed to update user', description: err.message || 'Unknown error', variant: 'destructive' });
      setEditState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const openDelete = (user: EditableUser) => {
    setDeleteState({ isOpen: true, isSubmitting: false, user });
  };

  const submitDelete = async () => {
    if (!deleteState.user) return;
    setDeleteState(prev => ({ ...prev, isSubmitting: true }));
    try {
      const userId = deleteState.user.id;
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (authDeleteError) throw authDeleteError;

      // Clean up profile just in case
      const { error: profileDeleteError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId);
      if (profileDeleteError) {
        // Log but do not block; profile may be removed via triggers or RLS
        console.warn('Profile cleanup error:', profileDeleteError);
      }

      toast({ title: 'User deleted', description: `${deleteState.user.full_name} has been removed.` });
      setDeleteState({ isOpen: false, isSubmitting: false, user: null });
      await loadUsers();
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      toast({ title: 'Failed to delete user', description: err.message || 'Unknown error', variant: 'destructive' });
      setDeleteState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const { data, error } = await createUserAsAdmin(
        createForm.email,
        createForm.password,
        createForm.fullName,
        createForm.role
      );
      if (error) throw error;
      if (!data?.user) throw new Error('User not returned by API');

      toast({ title: 'User created', description: `${createForm.fullName} added as ${createForm.role}.` });
      setIsCreateOpen(false);
      setCreateForm({ fullName: '', email: '', password: '', role: 'student' });
      await loadUsers();
    } catch (err: any) {
      console.error('Failed to create user:', err);
      toast({ title: 'Failed to create user', description: err.message || 'Unknown error', variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View, create, edit, and delete user accounts</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isRefreshing}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>New accounts are confirmed automatically.</DialogDescription>
              </DialogHeader>
              <form onSubmit={submitCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create_fullName">Full Name</Label>
                  <Input id="create_fullName" value={createForm.fullName} onChange={(e) => setCreateForm(f => ({ ...f, fullName: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create_email">Email</Label>
                  <Input id="create_email" type="email" value={createForm.email} onChange={(e) => setCreateForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create_password">Password</Label>
                  <Input id="create_password" type="password" minLength={6} value={createForm.password} onChange={(e) => setCreateForm(f => ({ ...f, password: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create_role">Role</Label>
                  <Select value={createForm.role} onValueChange={(value: UserRole) => setCreateForm(f => ({ ...f, role: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full" disabled={isCreating}>
                    {isCreating ? 'Creating…' : 'Create User'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, role, or id…"
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/5" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or add a new user.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">{u.full_name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-medium">{u.full_name}</p>
                    <p className="text-xs text-muted-foreground">ID: {u.id}</p>
                    <p className="text-xs text-muted-foreground">Joined {new Date(u.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={
                    u.role === 'admin'
                      ? 'bg-destructive/10 text-destructive border-destructive/20'
                      : u.role === 'teacher'
                        ? 'bg-secondary-blue/10 text-secondary-blue border-secondary-blue/20'
                        : 'bg-secondary-green/10 text-secondary-green border-secondary-green/20'
                  }>
                    {u.role}
                  </Badge>

                  <Dialog open={editState.isOpen && editState.user?.id === u.id} onOpenChange={(open) => {
                    if (!open) setEditState(prev => ({ ...prev, isOpen: false }));
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(u)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>Update the user\'s name or role.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit_fullname">Full Name</Label>
                          <Input id="edit_fullname" value={editState.fullName} onChange={(e) => setEditState(prev => ({ ...prev, fullName: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit_role">Role</Label>
                          <Select value={editState.role} onValueChange={(value: UserRole) => setEditState(prev => ({ ...prev, role: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="teacher">Teacher</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={submitEdit} disabled={editState.isSubmitting}>
                          {editState.isSubmitting ? 'Saving…' : 'Save Changes'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={deleteState.isOpen && deleteState.user?.id === u.id} onOpenChange={(open) => {
                    if (!open) setDeleteState(prev => ({ ...prev, isOpen: false }));
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => openDelete(u)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete the user and remove their access.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2">
                        <p>Are you sure you want to delete <span className="font-medium">{deleteState.user?.full_name}</span>?</p>
                        <div className="flex items-center gap-2 text-amber-600 text-sm">
                          <Shield className="h-4 w-4" />
                          <span>
                            Admin-only action. Uses service role to remove the auth user and profile.
                          </span>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="destructive" onClick={submitDelete} disabled={deleteState.isSubmitting}>
                          {deleteState.isSubmitting ? 'Deleting…' : 'Delete User'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AdminUserManagement;



