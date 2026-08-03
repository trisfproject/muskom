import * as z from "zod";

export const candidateSchema = z.object({
  // Step 1
  full_name: z.string().min(3, "Nama lengkap harus diisi (min. 3 karakter)"),
  nickname: z.string().optional(),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(10, "Nomor telepon harus diisi (min. 10 angka)"),
  // Step 2
  company_name: z.string().min(1, "Nama perusahaan harus diisi"),
  industrial_area: z.string().min(1, "Kawasan industri harus dipilih"),
  job_title: z.string().min(1, "Jabatan harus diisi"),
  department: z.string().optional(),

  // Step 3
  biography: z.string().min(50, "Biografi singkat harus diisi (min. 50 karakter)"),
  motivation: z.string().min(50, "Motivasi pencalonan harus diisi (min. 50 karakter)"),
  vision: z.string().min(20, "Visi harus diisi"),
  mission: z.string().min(20, "Misi harus diisi"),
});

export type CandidateFormData = z.infer<typeof candidateSchema>;
