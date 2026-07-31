'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { candidateRegistrationService } from '@/services/candidate-registration';
import { CandidateRegistrationResponse } from '@/types/candidate-registration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CandidateUploadPhoto } from './CandidateUploadPhoto';
import { CandidateUploadCV } from './CandidateUploadCV';

const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CV_SIZE = 10 * 1024 * 1024; // 10MB

const candidateSchema = z.object({
  // General
  full_name: z.string().min(2, 'Name is required (min 2 characters)').max(255),
  company: z.string().min(2, 'Company/Organization is required').max(255),
  job_title: z.string().max(255).optional(),
  phone: z.string().min(8, 'Valid WhatsApp number is required').max(50),
  email: z.string().email('Valid email is required').max(255),
  
  // Profile
  vision: z.string().min(10, 'Vision is required (min 10 characters)'),
  mission: z.string().min(10, 'Mission is required (min 10 characters)'),
  work_program: z.string().min(10, 'Work Programs are required (min 10 characters)'),
  motivation: z.string().min(10, 'Motivation is required (min 10 characters)'),
  biography: z.string().optional(),

  // Files
  photo: z.custom<File>((v) => v instanceof File, {
    message: 'Profile photo is required',
  }).refine((file) => file?.size <= MAX_PHOTO_SIZE, 'Max file size is 5MB'),
  
  cv: z.custom<File>((v) => v instanceof File, {
    message: 'CV/Resume is required',
  }).refine((file) => file?.size <= MAX_CV_SIZE, 'Max file size is 10MB'),

  // Agreement
  agreement: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm the information is true.' }),
  }),
});

type CandidateFormValues = z.infer<typeof candidateSchema>;

interface CandidateRegistrationFormProps {
  onSuccess: (data: CandidateRegistrationResponse, name: string) => void;
}

export function CandidateRegistrationForm({ onSuccess }: CandidateRegistrationFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
  });

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: candidateRegistrationService.registerCandidate,
    onSuccess: (data, variables) => {
      onSuccess(data, variables.full_name);
    },
  });

  const onSubmit = (data: CandidateFormValues) => {
    mutate(data);
  };

  let errorMessage = 'An unexpected error occurred during registration. Please try again.';
  if (isError && error) {
    const err = error as { response?: { data?: { message?: string } } };
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else {
      errorMessage = (error as Error).message;
    }
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="mb-8 border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Candidate Registration</h2>
        <p className="text-slate-500">Submit your profile to run as an official candidate in the Musyawarah.</p>
      </div>

      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        
        {/* Step 1: General Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 border-l-4 border-blue-500 pl-3">1. General Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="full_name">Full Name <span className="text-red-500">*</span></Label>
              <Input id="full_name" placeholder="John Doe" {...register('full_name')} className={errors.full_name ? 'border-red-500' : ''} />
              {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>}
            </div>

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
        </div>

        {/* Step 2: Documents */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 border-l-4 border-purple-500 pl-3">2. Document Uploads</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            <div className="md:col-span-1 flex flex-col">
              <Label className="mb-2">Profile Photo <span className="text-red-500">*</span></Label>
              <Controller
                name="photo"
                control={control}
                render={({ field }) => (
                  <CandidateUploadPhoto 
                    value={field.value} 
                    onChange={field.onChange} 
                    error={errors.photo?.message} 
                  />
                )}
              />
            </div>
            
            <div className="md:col-span-3 flex flex-col">
              <Label className="mb-2">CV / Resume <span className="text-red-500">*</span></Label>
              <Controller
                name="cv"
                control={control}
                render={({ field }) => (
                  <CandidateUploadCV 
                    value={field.value} 
                    onChange={field.onChange} 
                    error={errors.cv?.message} 
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Step 3: Candidate Profile */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 border-l-4 border-green-500 pl-3">3. Candidate Profile</h3>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="vision">Vision <span className="text-red-500">*</span></Label>
              <Textarea id="vision" placeholder="Your long-term vision..." className={`min-h-[100px] ${errors.vision ? 'border-red-500' : ''}`} {...register('vision')} />
              {errors.vision && <p className="text-red-500 text-sm mt-1">{errors.vision.message}</p>}
            </div>

            <div>
              <Label htmlFor="mission">Mission <span className="text-red-500">*</span></Label>
              <Textarea id="mission" placeholder="How will you achieve your vision..." className={`min-h-[100px] ${errors.mission ? 'border-red-500' : ''}`} {...register('mission')} />
              {errors.mission && <p className="text-red-500 text-sm mt-1">{errors.mission.message}</p>}
            </div>

            <div>
              <Label htmlFor="work_program">Work Programs <span className="text-red-500">*</span></Label>
              <Textarea id="work_program" placeholder="Specific programs you will implement..." className={`min-h-[100px] ${errors.work_program ? 'border-red-500' : ''}`} {...register('work_program')} />
              {errors.work_program && <p className="text-red-500 text-sm mt-1">{errors.work_program.message}</p>}
            </div>

            <div>
              <Label htmlFor="motivation">Motivation <span className="text-red-500">*</span></Label>
              <p className="text-xs text-slate-500 mb-2">Note: This field will be displayed in your public profile but is not strictly verified by the committee backend.</p>
              <Textarea id="motivation" placeholder="Why are you running for this position?" className={`min-h-[80px] ${errors.motivation ? 'border-red-500' : ''}`} {...register('motivation')} />
              {errors.motivation && <p className="text-red-500 text-sm mt-1">{errors.motivation.message}</p>}
            </div>

            <div>
              <Label htmlFor="biography">Biography (Optional)</Label>
              <Textarea id="biography" placeholder="A brief background about yourself..." className="min-h-[80px]" {...register('biography')} />
            </div>
          </div>
        </div>

        {/* Agreement */}
        <div className="flex items-start space-x-3 pt-6 border-t border-slate-100">
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
          <div className="grid gap-1.5 leading-none mt-1">
            <Label htmlFor="agreement" className="font-medium text-slate-700 leading-snug cursor-pointer">
              I certify that all submitted information is true and I am ready to be held accountable.
            </Label>
            {errors.agreement && <p className="text-red-500 text-sm">{errors.agreement.message}</p>}
          </div>
        </div>

        <div className="pt-4">
          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-full py-6 text-lg font-semibold shadow-lg shadow-slate-900/20"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting Application & Uploading Documents...
              </>
            ) : (
              'Submit Candidate Application'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
