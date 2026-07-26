# State Diagram

Sebuah acara (Event) dan sebuah sesi pemilihan (Voting Session) di MUSKOM diatur berdasarkan *State Machine* (Mesin Status) untuk memastikan proses berjalan linear dan data tidak rusak.

## 1. State Diagram: Event (Acara)

Menjelaskan siklus hidup suatu acara musyawarah sejak direncanakan hingga diarsipkan.

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Admin membuat acara baru
    
    DRAFT --> SCHEDULED : Admin mempublikasikan acara
    DRAFT --> CANCELLED : Admin membatalkan persiapan
    
    SCHEDULED --> REGISTRATION_OPEN : H-1 atau H-jam (Akses QR dibuka)
    
    REGISTRATION_OPEN --> IN_PROGRESS : Kuorum tercapai & Sidang Resmi Dibuka
    
    IN_PROGRESS --> PAUSED : Pimpinan Sidang men-skors sidang (Opsional)
    PAUSED --> IN_PROGRESS : Cabut skorsing
    
    IN_PROGRESS --> COMPLETED : Sidang Pleno terakhir ditutup
    
    COMPLETED --> ARCHIVED : Notulensi selesai & Masa retention habis
    
    ARCHIVED --> [*]
```

## 2. State Diagram: Voting Session

Menjelaskan siklus hidup untuk sebuah kotak suara digital. Sesi pemilihan tidak bisa kembali ke status `ACTIVE` jika sudah berstatus `CLOSED` (untuk mencegah penambahan suara pasca perhitungan final).

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Sesi dibuat, kandidat sedang disiapkan
    
    DRAFT --> ACTIVE : Admin menekan "Mulai Sesi"
    
    state ACTIVE {
        [*] --> RECEIVING_VOTES
        RECEIVING_VOTES --> CALCULATING_LIVE : Triggered async via Redis
        CALCULATING_LIVE --> RECEIVING_VOTES
    }
    
    ACTIVE --> PAUSED : Sesi ditunda (Koneksi bermasalah/Interupsi)
    PAUSED --> ACTIVE : Sesi dilanjutkan
    
    ACTIVE --> CLOSED : Waktu Habis / Dihentikan Admin
    
    CLOSED --> PUBLISHED : Hasil suara dibuka (dipublikasi ke Peserta)
    
    PUBLISHED --> [*]
```
