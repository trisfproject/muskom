import * as z from "zod";

export const candidateSchema = z.object({
  // Step 1
  full_name: z.string().min(3, "Nama lengkap harus diisi (min. 3 karakter)"),
  nickname: z.string().optional(),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(10, "Nomor telepon harus diisi (min. 10 angka)"),
  gender: z.enum(["MALE", "FEMALE"], { required_error: "Jenis kelamin harus dipilih" }),
  birth_place: z.string().min(3, "Tempat lahir harus diisi"),
  birth_date: z.string().min(10, "Tanggal lahir harus diisi (YYYY-MM-DD)"),

  // Step 2
  occupation: z.string().min(1, "Pekerjaan/Jabatan harus diisi"),
  organization: z.string().min(1, "Instansi/Organisasi harus diisi"),
  address: z.string().min(10, "Alamat lengkap harus diisi"),

  // Step 3
  biography: z.string().min(50, "Biografi singkat harus diisi (min. 50 karakter)"),
  motivation: z.string().min(50, "Motivasi pencalonan harus diisi (min. 50 karakter)"),
  vision: z.string().min(20, "Visi harus diisi"),
  mission: z.string().min(20, "Misi harus diisi"),
});

export type CandidateFormData = z.infer<typeof candidateSchema>;
