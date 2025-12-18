<?php
session_start();
require_once 'config.php';

// Cek User Login
if (!isset($_SESSION['user_id'])) {
    header('Location: index.php');
    exit;
}

$username = $_SESSION['username'] ?? 'User';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Status Laporan Saya - BPBD</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
    <!-- SweetAlert2 untuk Popup Alasan & Notifikasi -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11.10.1/dist/sweetalert2.min.css">
</head>
<body class="logged-in">
    <div class="p-4 p-md-5">
        <div class="container">
            
            <!-- HEADER -->
            <header class="bpbd-header shadow-sm rounded p-4 mb-4">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <div class="header-logo me-3">
                            <img src="uploads/bpbd-logo.png" alt="BPBD Logo" class="header-bpbd-logo">
                        </div>
                        <div>
                            <h1 class="h2 h1-md fw-bold text-dark mb-1">Status Laporan Saya</h1>
                            <p class="text-muted mb-0">Pantau perkembangan status validasi laporan Anda</p>
                            <p class="text-muted small mb-0">Halo, <?php echo htmlspecialchars($username); ?></p>
                        </div>
                    </div>
                    <div>
                        <a href="index.php" class="btn btn-outline-secondary me-2">
                            &larr; Kembali ke Dashboard
                        </a>
                    </div>
                </div>
            </header>

            <!-- TABEL STATUS -->
            <div class="bg-white p-4 rounded shadow-sm">
                <div class="alert alert-info d-flex align-items-center" role="alert">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-info-circle-fill flex-shrink-0 me-2" viewBox="0 0 16 16">
                        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                    </svg>
                    <div>
                        <strong>Info:</strong> Jika laporan Anda <b>Ditolak</b>, silakan klik tombol "Lihat Alasan" lalu edit laporan tersebut untuk diajukan kembali (Re-validasi).
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>Tanggal</th>
                                <th>Kategori</th>
                                <th>Jenis</th>
                                <th>Lokasi</th>
                                <th class="text-center">Status</th>
                                <th class="text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="my-reports-body">
                            <tr><td colspan="6" class="text-center py-4">Memuat data...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    </div>

    <!-- MODAL EDIT (Diperbarui dengan Upload & Dropdown) -->
    <div class="modal fade" id="edit-modal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Edit / Revisi Laporan</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <!-- Tambahkan enctype agar bisa upload file -->
                <form id="edit-disaster-form" enctype="multipart/form-data">
                    <div class="modal-body">
                        <input type="hidden" id="edit-disaster-id" name="id">
                        
                        <div class="alert alert-warning small mb-3">
                            <i class="bi bi-exclamation-triangle-fill"></i>
                            <strong>Perhatian:</strong> Menyimpan perubahan akan mengubah status laporan menjadi <b>Pending</b> untuk divalidasi ulang oleh Head.
                        </div>

                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label">Jenis Bencana/Insiden</label>
                                <!-- Ubah Input Readonly menjadi Select -->
                                <select id="edit-jenisBencana" name="jenisBencana" class="form-select">
                                    <!-- Opsi diisi via JS -->
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Lokasi</label>
                                <input type="text" id="edit-lokasi" name="lokasi" required class="form-control">
                            </div>
                            
                            <!-- Field khusus Bencana -->
                            <div class="col-md-4 field-bencana">
                                <label class="form-label">Jiwa Terdampak</label>
                                <input type="number" id="edit-jiwaTerdampak" name="jiwaTerdampak" min="0" class="form-control">
                            </div>
                            <div class="col-md-4 field-bencana">
                                <label class="form-label">KK Terdampak</label>
                                <input type="number" id="edit-kkTerdampak" name="kkTerdampak" min="0" class="form-control">
                            </div>
                            <div class="col-md-4 field-bencana">
                                <label class="form-label">Kerusakan</label>
                                <select id="edit-tingkatKerusakan" name="tingkatKerusakan" class="form-select">
                                    <option value="Ringan">Ringan</option>
                                    <option value="Sedang">Sedang</option>
                                    <option value="Berat">Berat</option>
                                </select>
                            </div>

                            <div class="col-md-12">
                                <label class="form-label">Keterangan / Kronologis</label>
                                <textarea id="edit-keterangan" name="keterangan" class="form-control" rows="3"></textarea>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label">Tanggal Kejadian</label>
                                <input type="date" id="edit-disasterDate" name="disasterDate" required class="form-control">
                            </div>
                            
                            <!-- [NEW] Container untuk Menampilkan Foto Saat Ini -->
                            <div class="col-12" id="edit-existing-photos-container" style="display: none;">
                                <label class="form-label fw-bold">Foto Saat Ini (Centang kotak "Hapus" untuk menghapus foto)</label>
                                <div id="edit-existing-photos" class="row g-2">
                                    <!-- Foto akan dimuat di sini oleh JS -->
                                </div>
                                <hr>
                            </div>

                            <!-- Input File Baru -->
                            <div class="col-md-6">
                                <label class="form-label">Tambah Foto Dokumentasi (Hanya .jpg/.jpeg)</label>
                                <!-- UPDATED: Accept attribute strictly set to .jpg, .jpeg to filter file explorer -->
                                <input type="file" name="photos[]" class="form-control" multiple accept=".jpg, .jpeg">
                                <div class="form-text small">Pilih foto baru jika ingin menambahkan dokumentasi.</div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                        <button type="submit" class="btn btn-primary">Simpan & Ajukan Ulang</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- JS -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11.10.1/dist/sweetalert2.all.min.js"></script>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            loadMyReports();

            // Handle Submit Edit Form
            const editForm = document.getElementById('edit-disaster-form');
            editForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const formData = new FormData(e.target);
                
                // Gunakan endpoint yang sudah ada (edit_disaster.php)
                // Endpoint ini SUDAH di-set untuk mengubah status jadi 'pending'
                fetch('edit_disaster.php', {
                    method: 'POST',
                    body: formData
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('Berhasil', data.message, 'success');
                        const modal = bootstrap.Modal.getInstance(document.getElementById('edit-modal'));
                        modal.hide();
                        loadMyReports(); // Reload tabel
                    } else {
                        Swal.fire('Gagal', data.message, 'error');
                    }
                })
                .catch(err => Swal.fire('Error', 'Terjadi kesalahan jaringan', 'error'));
            });
        });

        function loadMyReports() {
            fetch('get_user_reports.php')
            .then(res => res.json())
            .then(data => {
                const tbody = document.getElementById('my-reports-body');
                tbody.innerHTML = '';

                if (!data.success || data.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">Belum ada laporan yang Anda buat.</td></tr>';
                    return;
                }

                data.data.forEach(item => {
                    const date = new Date(item.disaster_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'});
                    const isInsiden = item.kategori_laporan === 'insiden';
                    
                    // Status Badge Logic
                    let statusBadge = '';
                    let actionBtn = '';
                    let rowClass = '';

                    if (item.status === 'pending') {
                        statusBadge = '<span class="badge bg-warning text-dark">Menunggu Validasi</span>';
                        // Tombol edit biasa
                        actionBtn = `<button class="btn btn-sm btn-outline-primary" onclick="openEdit(${item.id})">Edit</button>`;
                    } else if (item.status === 'approved') {
                        statusBadge = '<span class="badge bg-success">Disetujui</span>';
                        actionBtn = `<span class="text-muted small">Terkunci</span>`;
                    } else if (item.status === 'rejected') {
                        statusBadge = '<span class="badge bg-danger">Ditolak</span>';
                        rowClass = 'table-danger';
                        
                        // Tombol Lihat Alasan & Revisi
                        // Escape single quotes for JS string
                        const safeReason = (item.reject_reason || '').replace(/'/g, "\\'");
                        actionBtn = `
                            <div class="d-flex gap-1 justify-content-center">
                                <button class="btn btn-sm btn-danger" onclick="showReason('${safeReason}')">Lihat Alasan</button>
                                <button class="btn btn-sm btn-primary" onclick="openEdit(${item.id})">Revisi</button>
                            </div>
                        `;
                    }

                    const row = `
                        <tr class="${rowClass}">
                            <td>${date}</td>
                            <td>${isInsiden ? 'Insiden Darurat' : 'Bencana Alam'}</td>
                            <td class="fw-medium">${item.jenisBencana}</td>
                            <td>${item.lokasi}</td>
                            <td class="text-center">${statusBadge}</td>
                            <td class="text-center">${actionBtn}</td>
                        </tr>
                    `;
                    tbody.innerHTML += row;
                });
            });
        }

        // Fungsi Tampilkan Alasan (SweetAlert)
        function showReason(reason) {
            Swal.fire({
                title: 'Alasan Penolakan',
                text: reason || 'Tidak ada alasan spesifik.',
                icon: 'warning',
                confirmButtonText: 'Tutup',
                confirmButtonColor: '#d33'
            });
        }

        // Daftar opsi untuk dropdown (Agar konsisten dengan form input awal)
        const bencanaOptions = ['Banjir', 'Tanah Longsor', 'Angin Puting Beliung', 'Gempa Bumi', 'Kebakaran', 'Kebakaran Hutan'];
        const insidenOptions = ['Pohon Tumbang', 'Orang Hilang'];

        // Fungsi Buka Modal Edit
        function openEdit(id) {
            // Fetch single data untuk isi form
            fetch(`get_single_disaster.php?id=${id}`)
                .then(res => res.json())
                .then(resp => {
                    if (resp.success) {
                        const data = resp.data;
                        
                        // Isi Form Input Biasa
                        document.getElementById('edit-disaster-id').value = data.id;
                        document.getElementById('edit-lokasi').value = data.lokasi;
                        document.getElementById('edit-disasterDate').value = data.disaster_date;
                        document.getElementById('edit-keterangan').value = data.keterangan;

                        // Reset input file
                        document.querySelector('input[name="photos[]"]').value = '';

                        // Logic Kategori (Bencana vs Insiden)
                        const isInsiden = data.kategori_laporan === 'insiden';
                        const fieldBencana = document.querySelectorAll('.field-bencana');
                        
                        // Populate Dropdown Jenis Bencana
                        const selectEl = document.getElementById('edit-jenisBencana');
                        selectEl.innerHTML = ''; // Clear options
                        const options = isInsiden ? insidenOptions : bencanaOptions;
                        
                        options.forEach(opt => {
                            const el = document.createElement('option');
                            el.value = opt;
                            el.textContent = opt;
                            if (opt === data.jenisBencana) el.selected = true;
                            selectEl.appendChild(el);
                        });

                        // Show/Hide Fields
                        if (isInsiden) {
                            fieldBencana.forEach(el => el.style.display = 'none');
                        } else {
                            fieldBencana.forEach(el => el.style.display = 'block');
                            document.getElementById('edit-jiwaTerdampak').value = data.jiwaTerdampak;
                            document.getElementById('edit-kkTerdampak').value = data.kkTerdampak;
                            document.getElementById('edit-tingkatKerusakan').value = data.tingkatKerusakan;
                        }

                        // [NEW] Logic Menampilkan Foto Existing
                        const photoContainer = document.getElementById('edit-existing-photos');
                        const photoWrapper = document.getElementById('edit-existing-photos-container');
                        
                        photoContainer.innerHTML = ''; // Clear previous
                        
                        if (data.photos && data.photos.length > 0) {
                            photoWrapper.style.display = 'block';
                            data.photos.forEach(photo => {
                                const photoItem = `
                                    <div class="col-6 col-md-3">
                                        <div class="card h-100 border bg-light">
                                            <div class="card-body p-2 text-center">
                                                <img src="${photo.file_path}" class="img-fluid rounded mb-2" style="height: 80px; object-fit: cover;">
                                                <div class="form-check form-check-inline">
                                                    <input class="form-check-input border-danger" type="checkbox" name="delete_photos[]" value="${photo.id}" id="del_${photo.id}">
                                                    <label class="form-check-label text-danger small fw-bold" for="del_${photo.id}">Hapus</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                `;
                                photoContainer.innerHTML += photoItem;
                            });
                        } else {
                            photoWrapper.style.display = 'none';
                        }

                        // Show Modal
                        new bootstrap.Modal(document.getElementById('edit-modal')).show();
                    }
                });
        }
    </script>
</body>
</html>