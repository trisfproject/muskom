# API Design Guideline

Aplikasi akan memaparkan RESTful API berbasis JSON. GraphQL dapat dipertimbangkan di masa depan jika relasi data menjadi sangat kompleks.

## 1. Konvensi Umum
- **Base URL**: `https://api.muskom.com/v1`
- **Request/Response Format**: `application/json`
- **Authentication**: Bearer Token (JWT) diletakkan di header `Authorization`.
- **Pagination**: Menggunakan limit dan offset/page (contoh: `?page=1&limit=20`).

## 2. Standar Response Structure
```json
{
  "status": "success", // 'success' atau 'error'
  "message": "Data retrieved successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "total": 100
  }
}
```

## 3. Endpoint Utama (High-Level)

### Auth
- `POST /auth/login` - Autentikasi user dan mendapatkan JWT.
- `POST /auth/refresh` - Refresh token.

### Event & Agenda
- `GET /events` - List musyawarah.
- `POST /events` - Buat acara baru (Admin).
- `GET /events/:id/agendas` - List agenda dari sebuah event.

### Presensi
- `POST /events/:id/attendance` - Submit check-in (Scan QR).
- `GET /events/:id/attendance/stats` - Mendapatkan angka kuorum (SSE / Polling).

### Voting
- `GET /voting-sessions?event_id=:id` - List sesi voting.
- `POST /voting-sessions/:id/cast` - Submit suara. Payload terenkripsi.
- `GET /voting-sessions/:id/results` - Mendapatkan hasil. Dapat menggunakan WebSocket (Socket.io) untuk real-time updates.

### Dokumen
- `POST /documents/upload` - Upload file ke bucket (S3).
- `GET /events/:id/documents` - Mengambil list file musyawarah.
