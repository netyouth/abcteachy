import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createUserAsAdmin } from '@/integrations/supabase/admin-client';
import { Users, GraduationCap, Shield } from 'lucide-react';

type UserRole = 'student' | 'teacher' | 'admin';

interface RoleConfig {
  value: UserRole;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const roleConfigs: RoleConfig[] = [
  {
    value: 'student',
    label: 'Student',
    description: 'Regular student account with access to learning materials',
    icon: <GraduationCap className="h-4 w-4" />,
    color: 'text-blue-600'
  },
  {
    value: 'teacher',
    label: 'Teacher',
    description: 'Teacher account with access to class management and student progress',
    icon: <Users className="h-4 w-4" />,
    color: 'text-green-600'
  },
  {
    value: 'admin',
    label: 'Administrator',
    description: 'Full system access with user management capabilities',
    icon: <Shield className="h-4 w-4" />,
    color: 'text-red-600'
  }
];

export function AdminUserCreationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const { toast } = useToast();

  const selectedRoleConfig = roleConfigs.find(config => config.value === role);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Creating user account with admin privileges for:', { email, fullName, role });
      
      // Use the admin client to create user with auto-confirmation
      const { data, error } = await createUserAsAdmin(email, password, fullName, role);

      if (error) {
        console.error('Admin user creation error:', error);
        throw error;
      }

      console.log('User created successfully:', data);

      if (data?.user) {
        toast({
          title: `${selectedRoleConfig?.label} account created`,
          description: `${selectedRoleConfig?.label} account for ${fullName} has been successfully created and activated. They can login immediately.`
        });
      } else {
        throw new Error('User creation failed - no user data returned');
      }

      // Reset form
      setEmail('');
      setPassword('');
      setFullName('');
      setRole('student');
      
    } catch (error: any) {
      console.error('User creation error:', error);
      
      let errorMessage = error.message;
      
      // Provide more helpful error messages
      if (error.message?.includes('User already registered') || error.message?.includes('already exists')) {
        errorMessage = 'A user with this email address already exists.';
      } else if (error.message?.includes('Password')) {
        errorMessage = 'Password must be at least 6 characters long.';
      } else if (error.message?.includes('Email')) {
        errorMessage = 'Please provide a valid email address.';
      } else if (error.message?.includes('Invalid API key')) {
        errorMessage = 'Admin privileges required. Please contact system administrator.';
      }
      
      toast({
        title: `Error creating ${selectedRoleConfig?.label.toLowerCase()} account`,
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* User Creation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New User Account</CardTitle>
          <CardDescription>
            Add a new user to the ABC Teachy platform. The account will be immediately active and ready to use.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Secure password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">User Role</Label>
              <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent>
                  {roleConfigs.map((roleConfig) => (
                    <SelectItem key={roleConfig.value} value={roleConfig.value}>
                      <div className="flex items-center space-x-2">
                        <span className={roleConfig.color}>{roleConfig.icon}</span>
                        <span>{roleConfig.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : `Create ${selectedRoleConfig?.label} Account`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Role Information */}
      <Card>
        <CardHeader>
          <CardTitle>Selected Role: {selectedRoleConfig?.label}</CardTitle>
          <CardDescription>
            {selectedRoleConfig?.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={`flex items-center space-x-3 p-4 rounded-lg bg-muted/50 ${selectedRoleConfig?.color}`}>
              {selectedRoleConfig?.icon}
              <div>
                <h4 className="font-medium">{selectedRoleConfig?.label}</h4>
                <p className="text-sm text-muted-foreground">{selectedRoleConfig?.description}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h5 className="font-medium">Role Permissions:</h5>
              <ul className="space-y-2 text-sm">
                {role === 'student' && (
                  <>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      <span>Access to learning materials and courses</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      <span>View assignments and submit work</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      <span>Track personal progress</span>
                    </li>
                  </>
                )}
                {role === 'teacher' && (
                  <>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      <span>All student permissions</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      <span>Create and manage assignments</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      <span>View student progress and grades</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      <span>Manage class rosters</span>
                    </li>
                  </>
                )}
                {role === 'admin' && (
                  <>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                      <span>All teacher and student permissions</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                      <span>Create and manage user accounts</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                      <span>System configuration and settings</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                      <span>Full platform administration</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 