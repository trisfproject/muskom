# Sequence Diagrams

Dokumen ini mendeskripsikan secara interaktif dua buah *sequence* utama yang mendasari proses transaksi sistem: Alur *Check-In* Kehadiran dan Alur Pencoblosan Suara (Voting).

## 1. Sequence Diagram: Check-In dan Kuorum

```mermaid
sequenceDiagram
    autonumber
    actor Peserta
    actor Panitia
    participant AdminApp as Next.js Admin
    participant API as Go API Service
    participant Redis as Redis Cache/PubSub
    participant DB as PostgreSQL
    participant Proyektor as Layar Pimpinan Sidang

    Peserta->>Panitia: Menunjukkan QR Code
    Panitia->>AdminApp: Pindai QR menggunakan Kamera
    AdminApp->>API: POST /api/v1/attendance/check-in {userId}
    
    API->>DB: Validasi status pendaftaran Peserta
    DB-->>API: Data valid (Belum hadir)
    API->>DB: Update status -> 'Hadir'
    
    API->>API: Hitung ulang total kehadiran (Kuorum)
    API->>Redis: Publish (Channel 'QuorumUpdate', newTotal)
    API-->>AdminApp: 200 OK (Berhasil)
    
    Redis-->>Proyektor: Event Listener (WebSocket): Pembaruan Angka Kuorum
    Proyektor->>Proyektor: Re-render Grafik & Persentase Live
```

## 2. Sequence Diagram: Proses Pemungutan Suara Terenkripsi

```mermaid
sequenceDiagram
    autonumber
    actor Peserta
    participant WebApp as Next.js Web App
    participant API as Go API Service
    participant Redis as Redis Cache
    participant DB as PostgreSQL

    Peserta->>WebApp: Mengklik opsi Kandidat & "Kirim Suara"
    WebApp->>WebApp: Tampilkan Modal Konfirmasi
    Peserta->>WebApp: Klik "Ya, Kunci Suara"
    
    WebApp->>API: POST /api/v1/voting/cast {sessionId, optionId, token}
    
    API->>Redis: Cek Cache (Apakah token ini sudah pernah vote?)
    alt Sudah Vote
        Redis-->>API: True
        API-->>WebApp: 403 Forbidden (Sudah Menggunakan Hak Suara)
    else Belum Vote
        Redis-->>API: False
        API->>DB: Cek Relasi Hak Suara (Tabel Users)
        DB-->>API: Punya Hak Suara & Berstatus 'Hadir'
        
        API->>API: Hash(UserId + Timestamp) untuk integritas data
        API->>DB: Insert into VOTE_LOGS (Session, OptionId, HashSignature)
        API->>Redis: Set Key "has_voted_session_{id}_{user}" = true
        API-->>WebApp: 201 Created (Success)
        
        WebApp-->>Peserta: Tampilkan Pesan Sukses "Suara Terkunci"
    end
```
