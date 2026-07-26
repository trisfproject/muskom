# API Standards & Error Handling

Standar RESTful API ini harus diikuti oleh seluruh *engineer* yang mengembangkan *backend* MUSKOM agar menghasilkan API yang *predictable* dan kokoh.

## 1. REST API Standard

- **URL & Endpoints**: Gunakan kata benda jamak (*plural nouns*) dan gunakan huruf kecil dipisahkan dengan tanda hubung (*kebab-case*).
  - ✅ Benar: `GET /api/v1/voting-sessions`
  - ❌ Salah: `GET /api/v1/getVotingSession`
- **Metode HTTP**:
  - `GET`: Mengambil data (*Read*). Tidak boleh mengubah *state*.
  - `POST`: Membuat entitas baru (*Create*).
  - `PUT`: Memperbarui data secara keseluruhan (*Replace*).
  - `PATCH`: Memperbarui sebagian data (*Partial Update*).
  - `DELETE`: Menghapus data (Fisik atau *Soft Delete*).

## 2. API Versioning

Setiap URL API wajib menyertakan versi di *path* (*URI Versioning*). Hal ini paling transparan dan termudah untuk di-debug.
- **Base URL**: `/api/v1/`
- Jika ada *breaking changes* di masa depan, jangan ubah `v1`, melainkan buat *handler* baru di `/api/v2/`.

## 3. Standar Validasi (Validation Standard)

Proses validasi harus dilakukan di *Delivery Layer* (Handlers) menggunakan pustaka `go-playground/validator/v10` terintegrasi dengan Fiber.
- Jangan percaya input apapun (*Zero-Trust Payload*).
- Filter XSS dan injeksi *payload* berbahaya sebelum data mencapai *Service Layer*.
- Tiap *Struct* yang menjadi *Request Body* harus memiliki *tag* validasi (`validate:"required,email"`, dll).

## 4. Standar Respons Kesalahan (Error Response Standard)

Setiap *HTTP Handler* tidak boleh memberikan format *error* yang berbeda-beda. Gunakan *Middleware* penangkap *Error* global (*Global Error Handler*).

**Format JSON Error (Baku):**
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Permintaan tidak valid, periksa kembali data Anda.",
    "details": [
      {
        "field": "email",
        "message": "Format email tidak valid."
      }
    ]
  },
  "request_id": "req-uuid-12345"
}
```

- **HTTP Status Code Mapping**:
  - `400 Bad Request`: Kesalahan input/validasi.
  - `401 Unauthorized`: Token JWT tidak ada atau kedaluwarsa.
  - `403 Forbidden`: Token JWT valid, tetapi tidak memiliki peran (Role) yang diizinkan (*RBAC rejected*).
  - `404 Not Found`: *Resource* atau Endpoint tidak ditemukan.
  - `429 Too Many Requests`: Kena batasan limit (*Rate Limiting*).
  - `500 Internal Server Error`: *Panic* / Kesalahan kritis di server (Jangan *expose* detail *stack trace* ke *client* produksi).
