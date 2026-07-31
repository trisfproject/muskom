'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { AlertCircle, Loader2, Eye, EyeOff, LogIn } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
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
        setApiError('Terjadi kesalahan. Silakan coba lagi.');
      }
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setApiError('');
    mutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {/* Username */}
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-semibold text-slate-700 mb-1.5"
        >
          Username
        </label>
        <input
          id="username"
          type="text"
          placeholder="Masukkan username"
          autoComplete="username"
          className={`w-full px-4 py-3 rounded-xl border bg-white text-slate-900 text-sm placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
            form.formState.errors.username
              ? 'border-red-300 ring-1 ring-red-300'
              : 'border-slate-200 hover:border-slate-300'
          }`}
          {...form.register('username')}
        />
        {form.formState.errors.username && (
          <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {form.formState.errors.username.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-slate-700 mb-1.5"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Masukkan password"
            autoComplete="current-password"
            className={`w-full px-4 py-3 pr-12 rounded-xl border bg-white text-slate-900 text-sm placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
              form.formState.errors.password
                ? 'border-red-300 ring-1 ring-red-300'
                : 'border-slate-200 hover:border-slate-300'
            }`}
            {...form.register('password')}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      {/* API Error */}
      {apiError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 font-medium">{apiError}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 gradient-primary text-white font-semibold rounded-xl text-sm hover:opacity-90 active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Memverifikasi...
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4" />
            Masuk ke Dashboard
          </>
        )}
      </button>
    </form>
  );
}
