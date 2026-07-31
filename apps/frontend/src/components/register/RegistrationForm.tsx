'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { registrationService } from '@/services/registration';
import { PublicRegistrationResponse } from '@/types/registration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const registrationSchema = z.object({
  full_name: z.string().min(2, 'Name is required (min 2 characters)').max(255),
  company: z.string().min(2, 'Company/Organization is required').max(255),
  job_title: z.string().max(255).optional(),
  phone: z.string().min(8, 'Valid WhatsApp number is required').max(50),
  email: z.string().email('Valid email is required').max(255),
  agreement: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm the information is accurate.' }),
  }),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  onSuccess: (data: PublicRegistrationResponse) => void;
}

export function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
  });

  // Replaced watch with Controller down below

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: (data: RegistrationFormValues) => {
      return registrationService.registerParticipant({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        job_title: data.job_title,
        participant_category: 'PARTICIPANT',
      });
    },
    onSuccess: (data) => {
      onSuccess(data);
    },
  });

  const onSubmit = (data: RegistrationFormValues) => {
    mutate(data);
  };

  let errorMessage = 'An unexpected error occurred during registration. Please try again.';
  if (isError && error) {
    const err = error as { response?: { data?: { message?: string } } };
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    }
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Participant Registration</h2>
        <p className="text-slate-500">Please fill out the form below to register for the Musyawarah event.</p>
      </div>

      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="full_name">Full Name <span className="text-red-500">*</span></Label>
          <Input id="full_name" placeholder="John Doe" {...register('full_name')} className={errors.full_name ? 'border-red-500' : ''} />
          {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="company">Company / Organization <span className="text-red-500">*</span></Label>
            <Input id="company" placeholder="PT ABC" {...register('company')} className={errors.company ? 'border-red-500' : ''} />
            {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company.message}</p>}
          </div>

          <div>
            <Label htmlFor="job_title">Position (Optional)</Label>
            <Input id="job_title" placeholder="Manager" {...register('job_title')} className={errors.job_title ? 'border-red-500' : ''} />
            {errors.job_title && <p className="text-red-500 text-sm mt-1">{errors.job_title.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
            <Input id="email" type="email" placeholder="john@example.com" {...register('email')} className={errors.email ? 'border-red-500' : ''} />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="phone">WhatsApp Number <span className="text-red-500">*</span></Label>
            <Input id="phone" type="tel" placeholder="+628123456789" {...register('phone')} className={errors.phone ? 'border-red-500' : ''} />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
          </div>
        </div>

        <div className="flex items-start space-x-3 pt-4 border-t border-slate-100">
          <Controller
            name="agreement"
            control={control}
            render={({ field }) => (
              <Checkbox 
                id="agreement" 
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="agreement" className="font-medium text-slate-700 leading-snug cursor-pointer">
              I confirm that the submitted information is accurate.
            </Label>
            {errors.agreement && <p className="text-red-500 text-sm">{errors.agreement.message}</p>}
          </div>
        </div>

        <div className="pt-4">
          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-6 text-lg font-semibold"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting Registration...
              </>
            ) : (
              'Submit Registration'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
