import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createUserAsAdmin } from '@/integrations/supabase/admin-client';

export function AdminStudentCreationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const { toast } = useToast();

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Creating student account with admin privileges for:', { email, fullName });
      
      // Use the admin client to create user with auto-confirmation
      const { data, error } = await createUserAsAdmin(email, password, fullName, 'student');

      if (error) {
        console.error('Admin user creation error:', error);
        throw error;
      }

      console.log('Student created successfully:', data);

      if (data?.user) {
        toast({
          title: 'Student account created',
          description: `Student account for ${fullName} has been successfully created and activated. They can login immediately.`
        });
      } else {
        throw new Error('User creation failed - no user data returned');
      }

      // Reset form
      setEmail('');
      setPassword('');
      setFullName('');
      
    } catch (error: any) {
      console.error('Student creation error:', error);
      
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
        title: 'Error creating student account',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Student Account</CardTitle>
        <CardDescription>
          Add a new student account to the system. The account will be immediately active and ready to use.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateStudent} className="space-y-4">
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="student@example.com"
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Student Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
