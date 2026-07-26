# Backend Architecture & Patterns

Arsitektur *backend* Go untuk MUSKOM menggunakan pola *Clean Architecture* (*Domain-Driven Design*) untuk memisahkan logika bisnis dari infrastruktur kerangka kerja (Go Fiber) dan basis data (sqlx).

## 1. Struktur Folder (Folder Structure)

Struktur repositori `apps/api/` mengikuti *Standard Go Project Layout*:

```text
apps/api/
├── cmd/
│   └── api/                  # Titik masuk (main.go). Menginisialisasi DI (Dependency Injection)
├── internal/
│   ├── config/               # Pemuat Environment Variables (.env)
│   ├── delivery/
│   │   └── http/             # Fiber Handlers/Controllers (HTTP routing)
│   ├── domain/               # Entitas Inti (Structs/Models) & Interface definisi
│   ├── middleware/           # Fiber Middlewares (Auth, Rate Limit, Logger)
│   ├── repository/           # Lapisan akses data (Postgres / Redis)
│   └── service/              # Lapisan Logika Bisnis (Usecases)
├── pkg/
│   ├── logger/               # Konfigurasi Zap Logger
│   └── utils/                # Helper / Hashing / Crypto
├── go.mod
└── Dockerfile
```

## 2. Pemanfaatan Lapis Arsitektur (Layered Pattern)

### A. Repository Pattern
- Bertanggung jawab HANYA untuk berkomunikasi dengan *Database* atau pihak ke-3.
- Menggunakan `sqlx` untuk kueri mentah yang di-*binding* (*Struct mapping*). Tidak menggunakan *Heavy ORM* seperti GORM demi performa tinggi saat *E-Voting*.
- Diimplementasikan dalam bentuk `Interface` di dalam folder `domain` sehingga `Service` dapat menggunakan *Mock Repository* untuk *Unit Testing*.

### B. Service Layer (Usecase)
- Otak dari aplikasi. Di sini tempat aturan bisnis hidup (Misal: "Hanya peserta berstatus HADIR yang boleh memberikan suara").
- **TIDAK BOLEH** mengetahui konteks HTTP (`*fiber.Ctx`). Hal ini memastikan *Service* murni fungsi Go dan dapat dipanggil lewat medium apa saja (contoh: *Cron Job* atau gRPC).

### C. Delivery Layer (Handler)
- Menghandle rute (`app.Post(...)`).
- Membaca `fiber.Ctx`, mem-parsing JSON *body*, melakukan validasi, lalu meneruskan *payload* ke *Service Layer*.
- Mengemas nilai *return* dari *Service* menjadi respons JSON yang sesuai.

## 3. Dependency Injection (DI)

Tidak boleh ada pembuatan *instance* (`new(Service)`) di dalam metode/handler. Semua *Repository* harus diinjeksi ke dalam *Service*, dan semua *Service* diinjeksi ke dalam *Handler* melalui `main.go`. Hal ini menjamin tingkat *Testability* 100%.
