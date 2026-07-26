# API Engineering Standard

Standar komunikasi layanan (REST API) yang menjembatani *frontend* dan *backend* MUSKOM.

## 1. Struktur Respons
Semua *endpoint* API wajib mengembalikan format struktur JSON yang seragam, baik saat sukses maupun gagal:

**Respons Berhasil:**
```json
{
  "success": true,
  "message": "Data berhasil diambil",
  "data": { ... },
  "meta": { "page": 1, "total": 50 } // Khusus untuk list/paginasi
}
```

**Respons Gagal:**
```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": [
    { "field": "email", "message": "Format email tidak valid" }
  ]
}
```

## 2. Konvensi Endpoint & Routing
- URL selalu menggunakan huruf kecil dengan *kebab-case* (contoh: `/api/v1/event-phases`).
- URL difokuskan pada kata benda (Resource), bukan kata kerja. (Gunakan `/api/v1/users` dengan metode POST untuk membuat *user*, bukan `/api/v1/create-user`).
- Pisahkan operasi berdasarkan Metode HTTP: `GET` (Membaca), `POST` (Membuat), `PUT` (Mengubah total), `PATCH` (Mengubah sebagian), dan `DELETE` (Menghapus).

## 3. Versioning
Selalu sertakan versi API dalam URI. Saat ini MUSKOM berjalan pada antarmuka `/api/v1/`.

## 4. Filter & Paginasi
Semua *endpoint* yang mengembalikan kumpulan data (List) wajib mendukung parameter kueri standar: `?page=1&limit=10&sort=-created_at`.
