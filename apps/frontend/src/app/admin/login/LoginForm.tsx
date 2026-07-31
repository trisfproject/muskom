'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [apiError, setApiError] = useState('');

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const response = await api.post('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      login(data.data.access_token, data.data.refresh_token, data.data.user);
      router.push('/admin');
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setApiError(error.response.data.message);
      } else {
        setApiError('An unexpected error occurred during login.');
      }
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setApiError('');
    mutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-sm mx-auto shadow-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access the MUSKOM admin portal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="admin"
              {...form.register('username')}
            />
            {form.formState.errors.username && (
              <p className="text-sm text-red-500 font-medium">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...form.register('password')}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-500 font-medium">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {apiError && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md font-medium border border-red-100">
              {apiError}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
