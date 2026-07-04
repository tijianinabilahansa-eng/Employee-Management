# Employee Management Portal

Sebuah aplikasi web interaktif untuk pengelolaan data karyawan (**Employee Management**), dibangun menggunakan **React 19**, **TypeScript**, dan **Tailwind CSS v4** pada environment **Vite**. Aplikasi ini dirancang dengan desain responsif, transisi animasi halus menggunakan `motion`, dan arsitektur kode yang bersih (clean code) dan modular.

---

## 🚀 Fitur Utama & Kepatuhan Spesifikasi

Aplikasi ini mengimplementasikan penuh seluruh persyaratan dari instruksi tugas:

### 1. Halaman Login (Login Page)
*   **Username & Password Inputs**: Form input modern dengan validasi mandatory.
*   **Validasi Fungsional**: Menggunakan data kredensial yang divalidasi secara real-time (dengan feedback visual jika salah).
*   **Informasi Kredensial Demo**: Ditampilkan di layar login untuk kemudahan penguji:
    *   *Administrator*: Username `admin` / Password `admin123`
    *   *Manager*: Username `manager` / Password `manager123`
*   **Manajemen Sesi**: Sesi pengguna disimpan dengan aman di `localStorage` sehingga tetap terjaga meskipun halaman di-reload.

### 2. Halaman Daftar Karyawan (Employee List Page)
*   **100 Data Dummy**: Terisi otomatis dengan data awal yang realistis, menggunakan nama khas Indonesia, status, departemen, dan gaji proporsional.
*   **Advanced Searching (AND Rule)**: Mendukung pencarian gabungan multikriteria dengan logika **AND**:
    1.  *Pencarian Umum*: Berdasarkan Nama Lengkap, Username, atau Email.
    2.  *Saringan Departemen*: Pilihan Dropdown Grup.
    3.  *Saringan Status*: Pilihan Dropdown Status Karyawan.
*   **Sorting Dinamis**: Klik pada header kolom (Nama, Username, Email, Departemen, Gaji Pokok, Status) untuk mengurutkan secara *ascending* maupun *descending*.
*   **Pagination & Page Size**: Pengaturan jumlah data per halaman (pilihan 5, 10, 20, 50, atau 100 data) lengkap dengan nomor halaman navigasi yang elegan.
*   **Aksi Edit & Delete dengan Notifikasi Berwarna**:
    *   *Edit*: Menampilkan notifikasi berwarna **Kuning/Amber** (mengindikasikan aksi edit berhasil dilakukan pada karyawan terpilih).
    *   *Delete*: Menghapus data karyawan secara fungsional dari state lokal & `localStorage` serta menampilkan notifikasi konfirmasi berwarna **Merah**.

### 3. Halaman Tambah Karyawan (Add Employee Page)
*   **Mandatory Fields**: Validasi ketat yang memblokir penyimpanan jika ada field yang kosong. Border input akan berubah merah disertai pesan error yang intuitif.
*   **Input BirthDate**: Datetime picker fungsional dengan validasi maksimal tanggal hari ini (tidak boleh melebihi tanggal & jam saat ini).
*   **Validasi Email**: Format email dicek otomatis menggunakan ekspresi reguler (Regex).
*   **Input Basic Salary**: Validasi numerik (hanya angka positif yang diperbolehkan).
*   **Custom Searchable Group Dropdown**: Sesuai instruksi, input grup berupa dropdown list yang memiliki **search textbox di bagian atasnya** untuk mempermudah penyaringan 10 nama grup/departemen dummy.
*   **Tombol Save & Cancel**: Tombol simpan untuk menyimpan karyawan baru (data langsung dimasukkan ke baris teratas tabel) dan tombol cancel untuk membatalkan pengisian.

### 4. Halaman Detail Karyawan (Employee Detail Page)
*   **Data Formatting**: Menyajikan seluruh data lengkap karyawan dengan pemformatan yang rapi dan profesional:
    *   *Gaji Pokok (basicSalary)*: Diformat menggunakan standar Rupiah Indonesia (contoh: **`Rp 12.500.000,00`**).
    *   *Tanggal Lahir & Waktu Bergabung*: Ditampilkan menggunakan format bahasa Indonesia lengkap dengan nama hari, tanggal, bulan, tahun, dan waktu.
*   **Preservasi Status Pencarian (Penting)**: Ketika tombol **'Ok'** atau tombol kembali diklik, pengguna dialihkan ke daftar karyawan tanpa menghilangkan data saringan, pencarian, urutan kolom, maupun halaman aktif sebelumnya.

---

## 🛠️ Cara Menjalankan Aplikasi

Aplikasi berjalan pada environment Node.js standar. Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi secara lokal.

### Prasyarat
Pastikan Anda telah menginstal **Node.js** (versi 18 ke atas disarankan) dan **npm**.

### 1. Instalasi Dependensi
Jalankan perintah berikut di direktori root proyek untuk mengunduh semua library yang diperlukan:
```bash
npm install
```

### 2. Menjalankan Server Pengembangan (Dev Mode)
Untuk menjalankan aplikasi dalam mode pengembangan lokal dengan reload otomatis (Vite):
```bash
npm run dev
```
Aplikasi akan tersedia secara lokal melalui browser di: `http://localhost:3000` (atau port default yang diarahkan oleh sistem).

### 3. Membangun Proyek untuk Produksi
Untuk mengompilasi dan mengoptimalkan aset aplikasi untuk rilis produksi:
```bash
npm run build
```
Hasil kompilasi file statis siap dideploy akan berada di folder `/dist`.

### 4. Menjalankan Preview Rilis Produksi
Untuk menguji hasil rilis produksi secara lokal:
```bash
npm run preview
```

---

## 📁 Struktur Folder Proyek

Proyek ini menggunakan struktur yang modular dan terorganisasi dengan baik (*Clean Code*):

```text
/
├── .env.example         # Template konfigurasi environment variables
├── index.html           # File entrypoint HTML utama aplikasi
├── metadata.json        # Pengaturan metadata aplikasi Google AI Studio
├── package.json         # Dependensi proyek & naskah perintah (scripts)
├── tsconfig.json        # Konfigurasi compiler TypeScript
├── vite.config.ts       # Konfigurasi bundler Vite
└── src/
    ├── main.tsx         # File entri utama aplikasi React
    ├── index.css        # File CSS global dengan konfigurasi tema Tailwind v4
    ├── App.tsx          # Pengatur State Utama, Sesi Pengguna, dan Navigasi Halaman
    ├── types.ts         # Deklarasi tipe data TypeScript (Employee, SearchState)
    ├── data/
    │   └── dummyEmployees.ts  # Generator 100 data karyawan awal & manajemen penyimpanan lokal
    └── components/
        ├── LoginPage.tsx      # Komponen Halaman Login & Kredensial
        ├── EmployeeListPage.tsx  # Komponen Halaman Tabel Karyawan, Filter AND, Sortir & Paging
        ├── AddEmployeePage.tsx   # Komponen Formulir Tambah Karyawan dengan validasi & custom dropdown
        └── EmployeeDetailPage.tsx # Komponen Tampilan Detail Karyawan dengan format rupiah (Rp.)
```

---

## 🎨 Teknologi & Desain Visual

*   **Tailwind CSS v4**: Menggunakan utility classes modern untuk performa tinggi, layout responsif (Grid, Flexbox), dan transisi hover yang memanjakan mata.
*   **Lucide React**: Kumpulan ikon berkualitas tinggi untuk memperjelas visualisasi antarmuka pengguna.
*   **Motion**: Digunakan untuk animasi mikro yang halus saat toast melayang masuk/keluar, transisi perpindahan halaman, dan validasi form, menciptakan pengalaman pengguna yang mulus dan modern.
