# API Specification

Dokumen ini menjelaskan rancangan endpoint API secara struktural. Seluruh API menggunakan format JSON dan diproteksi dengan tipe autentikasi token Bearer (JWT) untuk endpoint yang tidak berstatus *public*.

## 1. Authentication Endpoints

### POST `/api/v1/auth/login`
- **Fungsi**: Memverifikasi kredensial pengguna dan mengembalikan Token.
- **Akses**: Public
- **Request Body**:
  ```json
  {
    "email": "peserta@domain.com",
    "password": "securepassword"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "token": "eyJhbG...",
      "role": "peserta"
    }
  }
  ```

## 2. Event & Attendance Endpoints

### GET `/api/v1/events/active`
- **Fungsi**: Mendapatkan musyawarah yang sedang berjalan.
- **Akses**: Authenticated User
- **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "id": "event-uuid",
      "name": "Musyawarah Nasional 2026",
      "quorumTarget": 150
    }
  }
  ```

### POST `/api/v1/attendance/check-in`
- **Fungsi**: Mencatat kehadiran berdasarkan ID Peserta (Via Scan QR).
- **Akses**: Panitia / Admin
- **Request Body**:
  ```json
  {
    "userId": "user-uuid",
    "eventId": "event-uuid"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Peserta berhasil diverifikasi hadir."
  }
  ```

## 3. Voting Endpoints

### GET `/api/v1/voting/active`
- **Fungsi**: Mendapatkan sesi voting yang sedang aktif untuk event berjalan.
- **Akses**: Peserta Tersertifikasi (Hadir & Hak Suara)

### POST `/api/v1/voting/cast`
- **Fungsi**: Menyimpan surat suara (*vote casting*).
- **Akses**: Peserta (Token divalidasi)
- **Request Body**:
  ```json
  {
    "votingSessionId": "session-uuid",
    "selectedOptions": ["option-uuid-1"]
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "status": "success",
    "message": "Suara berhasil dikirimkan."
  }
  ```
*(Catatan: Error 403 dikembalikan apabila peserta mencoba vote dua kali).*

### GET `/api/v1/voting/:id/results`
- **Fungsi**: Mendapatkan kalkulasi hasil voting terkini.
- **Akses**: Admin / Pimpinan Sidang (Peserta hanya saat sesi berstatus 'Closed' dan dipublikasi).
