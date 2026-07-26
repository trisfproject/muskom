# Git Engineering Standard

Standar alur kolaborasi dan manajemen kode (*version control*) untuk MUSKOM.

## 1. Strategi Pencabangan (Branching)
MUSKOM menggunakan alur *Trunk-Based Development*:
- `main` adalah sumber kebenaran tunggal (*Single Source of Truth*) yang selalu siap dideploy (*production-ready*).
- Setiap pengerjaan fitur/perbaikan *bug* dilakukan di *branch* berumur pendek.
- Format *branch*: `tipe/nama-fitur` (contoh: `feature/user-login`, `bugfix/registration-error`, `chore/update-deps`).

## 2. Pesan Commit (Commit Message)
Wajib mengikuti spesifikasi **Conventional Commits**:
- Format: `<type>(<scope>): <subject>`
- Tipe yang diizinkan: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.
- Contoh: `feat(auth): implement JWT login` atau `fix(api): resolve memory leak on vote counting`.

## 3. Pull Requests (PR) & Code Review
- Jangan pernah melakukan *commit* langsung (push) ke *branch* `main`.
- Setiap PR wajib menyertakan deskripsi yang jelas mengenai apa yang diubah dan cara memverifikasinya. Tautkan PR ke ID *Issue* atau *Task* yang relevan.
- Semua *checks* di CI (Linting & Testing) harus berwarna hijau (*passed*) sebelum proses *merge*.
- Utamakan penggunaan metode *Squash and Merge* untuk menjaga riwayat *commit* di `main` tetap bersih dan relevan per fitur.
