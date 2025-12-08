<?php
session_start();
require_once 'config.php';

// Cek Keamanan: Hanya user dengan role 'user' (Staff) yang boleh akses
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'user') {
    header('Location: index.php');
    exit;
}

$username = $_SESSION['username'] ?? 'Staff';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Riwayat Laporan Saya - BPBD Minahasa</title>
    
    <!-- CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.datatables.net/2.0.8/css/dataTables.bootstrap5.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11.10.1/dist/sweetalert2.min.css">
</head>
<body class="bg-light">
    
    <div class="container py-5">
        <!-- Header & Navigasi -->
        <header class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
            <div class="d-flex align-items-center gap-3">
                <div class="bg-primary text-white rounded p-3 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-person-lines-fill" viewBox="0 0 16 16">
                        <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1h10zm11-5.666V14h3V8.334h-3zM14 7V1h-3v6h3zM6 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
                    </svg>
                </div>
                <div>
                    <h2 class="h4 fw-bold text-dark mb-0">Riwayat Laporan Saya</h2>
                    <p class="text-muted mb-0">Halo, <?php echo htmlspecialchars($username); ?>. Pantau status laporan Anda di sini.</p>
                </div>
            </div>
            <div>
                <a href="index.php" class="btn btn-outline-secondary d-flex align-items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                    </svg>
                    Kembali ke Dashboard
                </a>
            </div>
        </header>

        <!-- Tabel Riwayat -->
        <div class="card shadow-sm border-0">
            <div class="card-body p-4">
                <!-- Tabel khusus ini memiliki ID berbeda: 'my-reports-table' -->
                <div class="table-responsive">
                    <table id="my-reports-table" class="table table-hover align-middle w-100">
                        <thead class="table-light">
                            <tr>
                                <th>Tanggal</th>
                                <th>Kategori</th>
                                <th>Jenis Laporan</th>
                                <th>Lokasi</th>
                                <th>Detail (Jiwa/KK/Ket)</th>
                                <th>Foto</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="my-reports-body">
                            <!-- Data akan dimuat oleh script.js -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Edit / Revisi Laporan -->
    <div class="modal fade" id="edit-modal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title" id="editModalLabel">Edit / Revisi Laporan</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                
                <form id="edit-disaster-form">
                    <div class="modal-body">
                        <!-- Alert Peringatan Reset Status -->
                        <div class="alert alert-info d-flex align-items-center mb-4" role="alert">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-info-circle-fill me-2" viewBox="0 0 16 16">
                                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                            </svg>
                            <div>
                                <strong>Catatan Penting:</strong> Menyimpan perubahan akan mereset status laporan menjadi <u>Menunggu (Pending)</u> untuk divalidasi ulang oleh pimpinan.
                            </div>
                        </div>

                        <input type="hidden" id="edit-disaster-id" name="id">
                        
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label for="edit-jenisBencana" class="form-label fw-bold">Jenis Laporan</label>
                                <input type="text" id="edit-jenisBencana" name="jenisBencana" class="form-control bg-light" readonly>
                            </div>
                            <div class="col-md-6">
                                <label for="edit-disasterDate" class="form-label fw-bold">Tanggal Kejadian</label>
                                <input type="date" id="edit-disasterDate" name="disasterDate" required class="form-control">
                            </div>
                            <div class="col-12">
                                <label for="edit-lokasi" class="form-label fw-bold">Lokasi</label>
                                <input type="text" id="edit-lokasi" name="lokasi" required class="form-control">
                            </div>

                            <!-- Area Input Khusus Bencana (SAW) -->
                            <div id="edit-area-bencana" class="row g-3 mt-0">
                                <div class="col-md-4">
                                    <label for="edit-jiwaTerdampak" class="form-label">Jumlah Jiwa Terdampak</label>
                                    <input type="number" id="edit-jiwaTerdampak" name="jiwaTerdampak" min="0" class="form-control">
                                </div>
                                <div class="col-md-4">
                                    <label for="edit-kkTerdampak" class="form-label">Jumlah KK Terdampak</label>
                                    <input type="number" id="edit-kkTerdampak" name="kkTerdampak" min="0" class="form-control">
                                </div>
                                <div class="col-md-4">
                                    <label for="edit-tingkatKerusakan" class="form-label">Tingkat Kerusakan</label>
                                    <select id="edit-tingkatKerusakan" name="tingkatKerusakan" class="form-select">
                                        <option value="Ringan">Ringan</option>
                                        <option value="Sedang">Sedang</option>
                                        <option value="Berat">Berat</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Area Input Khusus Insiden (Non-SAW) -->
                            <div id="edit-area-insiden" class="col-12 mt-3" style="display:none;">
                                <label for="edit-keterangan" class="form-label fw-bold">Keterangan / Kronologi</label>
                                <textarea id="edit-keterangan" name="keterangan" class="form-control" rows="3"></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer bg-light">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                        <button type="submit" class="btn btn-primary fw-bold">Simpan Revisi</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Modal Preview Foto -->
    <div class="modal fade" id="photo-modal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content bg-transparent border-0">
                <div class="modal-body text-center position-relative p-0">
                    <button type="button" class="btn-close btn-close-white position-absolute top-0 end-0 m-3" data-bs-dismiss="modal" aria-label="Close"></button>
                    <img id="photo-modal-image" src="" alt="Foto Bencana" class="img-fluid rounded shadow">
                </div>
            </div>
        </div>
    </div>

    <!-- Script JS Libraries -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.datatables.net/2.0.8/js/dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/2.0.8/js/dataTables.bootstrap5.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11.10.1/dist/sweetalert2.all.min.js"></script>
    
    <!-- Menggunakan script.js yang sama, logika akan menyesuaikan berdasarkan ID tabel -->
    <script src="script.js"></script>
</body>
</html>