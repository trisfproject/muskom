# System Architecture Diagram

Arsitektur aplikasi MUSKOM dirancang dengan memisahkan *backend* dan *frontend* menggunakan arsitektur berbasis *micro-services* skala ringan. Komunikasi antarlayanan (*containers*) ditengahi oleh *Reverse Proxy* dan di-deploy dalam sebuah jaringan terisolasi.

## C4 Container Diagram

Berikut adalah representasi kontainer sistem menggunakan *Mermaid JS*:

```mermaid
C4Context
    title Arsitektur Sistem MUSKOM (Container Level)

    Person(peserta, "Peserta Musyawarah", "Mengakses melalui peramban web pada ponsel cerdas.")
    Person(admin, "Panitia / Admin", "Mengelola acara dan memindai QR Code via peramban web desktop/tablet.")

    System_Boundary(muskom, "MUSKOM Platform") {
        
        Container(nginx, "Nginx Gateway", "Nginx", "Reverse proxy yang mengarahkan lalu lintas internet ke servis terkait secara internal.")
        
        Container(web_app, "Web App (Peserta)", "Next.js 15, React", "Aplikasi portal utama yang menampilkan antarmuka e-voting dan agenda.")
        Container(admin_app, "Admin Dashboard", "Next.js 15, React", "Antarmuka manajemen acara, dokumen, dan statistik kuorum.")
        
        Container(api_server, "API Service", "Go (Fiber v3)", "Layanan inti untuk logika bisnis, manajemen identitas, dan kalkulasi suara.")
        
        ContainerDb(database, "Database", "PostgreSQL 17", "Menyimpan data persisten: pengguna, acara, log suara terenkripsi, dan relasi dokumen.")
        ContainerDb(cache, "Cache & PubSub", "Redis", "Menyimpan sesi login sementara, dan mengelola antrian pesan/WebSockets (PubSub) untuk live-result.")
        
    }

    Rel(peserta, nginx, "HTTPS (Port 443)", "Berinteraksi dengan portal")
    Rel(admin, nginx, "HTTPS (Port 443/admin)", "Berinteraksi dengan dasbor")
    
    Rel(nginx, web_app, "Proxy_pass HTTP /", "Rute trafik Peserta")
    Rel(nginx, admin_app, "Proxy_pass HTTP /admin", "Rute trafik Admin")
    Rel(nginx, api_server, "Proxy_pass HTTP /api", "Rute trafik API")

    Rel(web_app, api_server, "JSON/REST API", "Memanggil fungsionalitas (Voting, Auth)")
    Rel(admin_app, api_server, "JSON/REST API", "Memanggil fungsionalitas (Manajemen, Data)")
    
    Rel(api_server, database, "TCP", "SQLx Connection (Read/Write)")
    Rel(api_server, cache, "TCP", "Menyimpan session token, Redis Connection")
```
