<?php
session_start();
require_once '../config/config.php';

// Cek Keamanan: Hanya Role 'head' yang boleh akses
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'head') {
    header('Location: ../index.php');
    exit;
}

$username = $_SESSION['username'] ?? '';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Validasi Laporan - BPBD</title>
    <!-- CSS Dependencies -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.datatables.net/2.0.8/css/dataTables.bootstrap5.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11.10.1/dist/sweetalert2.min.css">
</head>
<body class="logged-in">
    <div class="p-4 p-md-5">
        <div class="container">
            <!-- Header Halaman -->
            <header class="bpbd-header shadow-sm rounded p-4 mb-4">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <div class="header-logo me-3">
                            <img src="../uploads/logobpbd-minahasa.png" alt="BPBD Logo" class="header-bpbd-logo">
                        </div>
                        <div>
                            <h1 class="h2 h1-md fw-bold text-dark mb-1">Validasi Laporan</h1>
                            <p class="text-muted mb-0">Sistem Informasi Bencana BPBD Kabupaten Minahasa</p>
                            <p class="text-muted small mb-0">Selamat datang, <?php echo htmlspecialchars($username); ?> (Kepala)</p>
                        </div>
                    </div>
                    <div>
                        <a href="../index.php" class="btn btn-bpbd-primary me-2">Kembali ke Dashboard</a>
                        <button id="logout-btn" class="btn btn-bpbd-secondary" onclick="window.location.href='../api/logout.php'">Logout</button>
                    </div>
                </div>
            </header>

            <!-- Kartu Statistik -->
            <div class="bg-white p-4 rounded shadow-sm mb-4">
                <h2 class="h5 fw-semibold mb-3 text-dark border-bottom pb-2">Statistik Laporan Bulan Ini</h2>
                <div class="mb-4">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <div class="card bg-light">
                                <div class="card-body text-center">
                                    <h5 class="card-title text-primary" id="pending-count">0</h5>
                                    <p class="card-text">Laporan Menunggu</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card bg-success-subtle">
                                <div class="card-body text-center">
                                    <h5 class="card-title text-success" id="approved-count">0</h5>
                                    <p class="card-text">Sudah Disetujui</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card bg-danger-subtle">
                                <div class="card-body text-center">
                                    <h5 class="card-title text-danger" id="rejected-count">0</h5>
                                    <p class="card-text">Ditolak</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tombol Aksi Massal & Filter -->
                <div class="d-flex gap-2 mb-4">
                    <button id="approve-all-btn" class="btn btn-success" disabled onclick="approveAllReports()">Setujui Laporan Terpilih</button>
                    <button id="reject-all-btn" class="btn btn-danger" disabled onclick="rejectAllReports()">Tolak Laporan Terpilih</button>
                </div>
                
                <div class="row g-3 mb-3">
                    <div class="col-md-4">
                        <select id="filter-status" class="form-select">
                            <option value="">Semua Status</option>
                            <option value="Menunggu">Menunggu</option>
                            <option value="Disetujui">Disetujui</option>
                            <option value="Ditolak">Ditolak</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <select id="filter-jenis" class="form-select">
                            <option value="">Semua Jenis Bencana</option>
                            <option value="Banjir">Banjir</option>
                            <option value="Tanah Longsor">Tanah Longsor</option>
                            <option value="Angin Puting Beliung">Angin Puting Beliung</option>
                            <option value="Gempa Bumi">Gempa Bumi</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Tabel Bencana (Dampak Luas) -->
            <div class="bg-white p-4 rounded shadow-sm mb-4">
                <h2 class="h5 fw-semibold mb-3 text-dark border-bottom pb-2">Validasi Laporan Bencana (Dampak Luas)</h2>
                <div class="table-responsive">
                   <table id="pending-reports-table" class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th scope="col" width="30"><input type="checkbox" id="select-all-bencana"></th>
                                <th scope="col">Jenis Bencana</th>
                                <th scope="col">Lokasi</th>
                                <th scope="col">Terdampak</th>
                                <th scope="col">Kerusakan</th>
                                <th scope="col">Pengirim</th>
                                <th scope="col">Tanggal</th>
                                <th scope="col" style="min-width: 150px;">Foto</th>
                                <th scope="col">Status</th>
                                <th scope="col">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="pending-reports-body"></tbody>
                    </table>
                </div>
            </div>
            
            <!-- Tabel Insiden (Darurat) -->
            <div class="bg-white p-4 rounded shadow-sm">
                <h2 class="h5 fw-semibold mb-3 text-dark border-bottom pb-2">Validasi Laporan Insiden Darurat</h2>
                <div class="table-responsive">
                   <table id="insiden-reports-table" class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th scope="col" width="30"><input type="checkbox" id="select-all-insiden"></th>
                                <th scope="col">Jenis Insiden</th>
                                <th scope="col">Lokasi</th>
                                <th scope="col">Keterangan</th>
                                <th scope="col">Pengirim</th>
                                <th scope="col">Tanggal</th>
                                <th scope="col" style="min-width: 150px;">Foto</th>
                                <th scope="col">Status</th>
                                <th scope="col">Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="insiden-reports-body"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Tolak Laporan (Popup Alasan) -->
    <div class="modal fade" id="rejectModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Tolak Laporan</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="rejectId">
                    <div class="mb-3">
                        <label class="form-label">Alasan Penolakan</label>
                        <textarea class="form-control" id="rejectReason" rows="3" required placeholder="Contoh: Data kurang lengkap, foto buram..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="button" class="btn btn-danger" onclick="submitReject()">Kirim Penolakan</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Foto (Popup Gambar) -->
    <div class="modal fade" id="photo-modal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="photoModalLabel">Foto Dokumentasi</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body text-center">
                    <img id="photo-modal-image" src="" alt="Foto" class="img-fluid">
                </div>
            </div>
        </div>
    </div>

    <!-- Script JS Libraries -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.datatables.net/2.0.8/js/dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/2.0.8/js/dataTables.bootstrap5.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    
    <!-- LOGIKA JAVASCRIPT GABUNGAN -->
    <script>
        // --- VARIABLE GLOBAL ---
        let tableBencana, tableInsiden;

        // --- 1. SAAT HALAMAN DIMUAT ---
        document.addEventListener('DOMContentLoaded', function() {
            loadData(); // Muat data dari server

            // Listener Filter
            document.getElementById('filter-status').addEventListener('change', applyFilters);
            document.getElementById('filter-jenis').addEventListener('change', applyFilters);

            // Listener Select All
            document.getElementById('select-all-bencana').addEventListener('change', function() { handleSelectAll('#pending-reports-table', this); });
            document.getElementById('select-all-insiden').addEventListener('change', function() { handleSelectAll('#insiden-reports-table', this); });

            // Listener Checkbox Individual (Event Delegation)
            document.addEventListener('change', function(e) {
                if (e.target.classList.contains('report-checkbox')) updateButtonState();
            });
        });

        // --- 2. FUNGSI LOAD DATA ---
        function loadData() {
            fetch('../api/get_disasters.php')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        processData(data.data);
                    } else {
                        Swal.fire('Error', data.message, 'error');
                    }
                })
                .catch(err => console.error(err));
        }

        function processData(allData) {
            // Filter Data Bulan Ini (Opsional: Jika ingin semua data, hapus filter ini)
            // Di sini kita tampilkan semua agar hasil upload terlihat
            const monthlyData = allData; 

            // Update Statistik Angka
            document.getElementById('pending-count').innerText = monthlyData.filter(r => r.status === 'pending').length;
            document.getElementById('approved-count').innerText = monthlyData.filter(r => r.status === 'approved').length;
            document.getElementById('rejected-count').innerText = monthlyData.filter(r => r.status === 'rejected').length;

            // Pisahkan Data Bencana & Insiden
            const bencanaList = monthlyData.filter(d => d.kategori_laporan === 'bencana' || !d.kategori_laporan);
            const insidenList = monthlyData.filter(d => d.kategori_laporan === 'insiden');

            // Sortir data: Menunggu (pending) di atas, lalu berdasarkan tanggal descending
            const statusOrder = { 'pending': 1, 'approved': 2, 'rejected': 3 };
            bencanaList.sort((a, b) => {
                const aOrder = statusOrder[a.status] || 4;
                const bOrder = statusOrder[b.status] || 4;
                if (aOrder !== bOrder) return aOrder - bOrder;
                return new Date(b.disaster_date) - new Date(a.disaster_date);
            });
            insidenList.sort((a, b) => {
                const aOrder = statusOrder[a.status] || 4;
                const bOrder = statusOrder[b.status] || 4;
                if (aOrder !== bOrder) return aOrder - bOrder;
                return new Date(b.disaster_date) - new Date(a.disaster_date);
            });

            // Render Tabel
            renderTable('#pending-reports-table', '#pending-reports-body', bencanaList, 'bencana');
            renderTable('#insiden-reports-table', '#insiden-reports-body', insidenList, 'insiden');
        }

        // --- 3. RENDER TABEL ---
        function renderTable(tableId, tbodyId, data, type) {
            if ($.fn.DataTable.isDataTable(tableId)) {
                $(tableId).DataTable().destroy();
            }

            const tbody = document.querySelector(tbodyId);
            tbody.innerHTML = '';

            if (data.length === 0) {
                const span = type === 'bencana' ? 10 : 9;
                tbody.innerHTML = `<tr><td colspan="${span}" class="text-center text-muted py-3">Tidak ada data.</td></tr>`;
                return;
            }

            data.forEach(item => {
                const isPending = item.status === 'pending';
                const checkbox = isPending ? `<input type="checkbox" class="report-checkbox" value="${item.id}">` : '-';
                
                let statusBadge = `<span class="badge bg-warning text-dark">Menunggu</span>`;
                if(item.status === 'approved') statusBadge = `<span class="badge bg-success">Disetujui</span>`;
                if(item.status === 'rejected') statusBadge = `<span class="badge bg-danger">Ditolak</span>`;

                // --- PERBAIKAN LOGIKA FOTO ---
                // Menampilkan semua foto dalam grid kecil
                let photoHtml = '<span class="text-muted small">No Img</span>';
                if (item.photos && item.photos.length > 0) {
                    photoHtml = '<div class="d-flex flex-wrap gap-1">';
                    item.photos.forEach(p => {
                        photoHtml += `<img src="${p.file_path}" class="img-thumbnail" style="width: 40px; height: 40px; object-fit: cover; cursor: pointer;" onclick="showPhoto('${p.file_path}', '${p.original_filename}')" title="${p.original_filename}">`;
                    });
                    photoHtml += '</div>';
                }
                // ------------------------------

                let actions = '-';
                if(isPending) {
                    actions = `
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-success" onclick="approveSingle(${item.id})" title="Setujui">✓</button>
                            <button class="btn btn-danger" onclick="openRejectModal(${item.id})" title="Tolak">✕</button>
                        </div>
                    `;
                }

                // Format Tanggal
                let dateStr = item.disaster_date;
                try {
                    const d = new Date(item.disaster_date);
                    dateStr = d.toLocaleDateString('id-ID');
                } catch(e) {}

                let row = '';
                if(type === 'bencana') {
                    row = `<tr>
                        <td class="text-center">${checkbox}</td>
                        <td>${item.jenisBencana}</td>
                        <td>${item.lokasi}</td>
                        <td><small>${item.jiwaTerdampak} Jiwa / ${item.kkTerdampak} KK</small></td>
                        <td>${item.tingkatKerusakan}</td>
                        <td>${item.submitted_by_name || 'User'}</td>
                        <td>${dateStr}</td>
                        <td>${photoHtml}</td>
                        <td class="text-center">${statusBadge}</td>
                        <td class="text-center">${actions}</td>
                    </tr>`;
                } else {
                    row = `<tr>
                        <td class="text-center">${checkbox}</td>
                        <td>${item.jenisBencana}</td>
                        <td>${item.lokasi}</td>
                        <td><small>${item.keterangan || '-'}</small></td>
                        <td>${item.submitted_by_name || 'User'}</td>
                        <td>${dateStr}</td>
                        <td>${photoHtml}</td>
                        <td class="text-center">${statusBadge}</td>
                        <td class="text-center">${actions}</td>
                    </tr>`;
                }
                tbody.innerHTML += row;
            });

            // Inisialisasi DataTable Baru
            const targets = type === 'bencana' ? [0,3,4,7,9] : [0,2,3,6,8];
            const table = $(tableId).DataTable({
                pageLength: 5,
                order: [[6, 'desc']], // Urutkan berdasarkan tanggal (kolom ke-7, index 6)
                columnDefs: [{ orderable: false, targets: targets }]
            });

            if(type === 'bencana') tableBencana = table;
            else tableInsiden = table;
        }

        // --- 4. FUNGSI AKSI (APPROVE / REJECT) ---
        
        function approveSingle(id) {
            Swal.fire({
                title: 'Setujui Laporan?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Ya, Setujui',
                confirmButtonColor: '#198754'
            }).then(res => {
                if(res.isConfirmed) sendRequest(id, 'approved');
            });
        }

        function openRejectModal(id) {
            document.getElementById('rejectId').value = id;
            document.getElementById('rejectReason').value = '';
            new bootstrap.Modal('#rejectModal').show();
        }

        function submitReject() {
            const id = document.getElementById('rejectId').value;
            const reason = document.getElementById('rejectReason').value;
            if(!reason) return Swal.fire('Error', 'Alasan wajib diisi!', 'warning');

            sendRequest(id, 'rejected', reason);
            // Tutup modal manual
            const modalEl = document.getElementById('rejectModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
        }

        function sendRequest(id, action, reason = null) {
            const formData = new FormData();
            formData.append('id', id);
            formData.append('action', action);
            if(reason) formData.append('reason', reason);

            fetch('../api/validation_process.php', { method: 'POST', body: formData })
                .then(r => r.json())
                .then(data => {
                    if(data.success) {
                        Swal.fire('Sukses', data.message, 'success');
                        loadData(); // Reload data
                    } else {
                        Swal.fire('Gagal', data.message, 'error');
                    }
                })
                .catch(() => Swal.fire('Error', 'Gagal koneksi ke server', 'error'));
        }

        // --- 5. FUNGSI AKSI MASSAL (BULK) ---
        
        function approveAllReports() { processBulk('approved', 'Setujui'); }
        
        function rejectAllReports() {
            Swal.fire({
                title: 'Tolak Banyak Laporan',
                input: 'textarea',
                inputPlaceholder: 'Alasan penolakan untuk semua...',
                showCancelButton: true,
                confirmButtonText: 'Tolak Semua',
                confirmButtonColor: '#dc3545'
            }).then(res => {
                if(res.isConfirmed && res.value) processBulk('rejected', 'Tolak', res.value);
            });
        }

        async function processBulk(action, label, reason = null) {
            const checked = document.querySelectorAll('.report-checkbox:checked');
            if(checked.length === 0) return;

            const ids = Array.from(checked).map(cb => cb.value);
            
            const confirm = await Swal.fire({
                title: `Konfirmasi ${label} ${ids.length} Laporan?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ya, Lanjutkan'
            });
            if(!confirm.isConfirmed) return;

            Swal.fire({ title: 'Memproses...', didOpen: () => Swal.showLoading() });

            let success = 0, fail = 0;
            for(const id of ids) {
                const formData = new FormData();
                formData.append('id', id);
                formData.append('action', action);
                if(reason) formData.append('reason', reason);

                try {
                    const res = await fetch('validation_process.php', { method: 'POST', body: formData });
                    const json = await res.json();
                    if(json.success) success++; else fail++;
                } catch(e) { fail++; }
            }

            Swal.fire('Selesai', `Berhasil: ${success}, Gagal: ${fail}`, fail===0 ? 'success':'warning');
            loadData();
            document.querySelectorAll('.report-checkbox').forEach(cb => cb.checked = false); // Uncheck all
            updateButtonState();
        }

        // --- 6. UTILS (HELPER) ---

        function handleSelectAll(tableSelector, sourceCb) {
            document.querySelectorAll(`${tableSelector} .report-checkbox`).forEach(cb => {
                cb.checked = sourceCb.checked;
            });
            updateButtonState();
        }

        function updateButtonState() {
            const count = document.querySelectorAll('.report-checkbox:checked').length;
            const btnApprove = document.getElementById('approve-all-btn');
            const btnReject = document.getElementById('reject-all-btn');
            
            if(count > 0) {
                btnApprove.disabled = false;
                btnReject.disabled = false;
                btnApprove.textContent = `Setujui (${count})`;
                btnReject.textContent = `Tolak (${count})`;
            } else {
                btnApprove.disabled = true;
                btnReject.disabled = true;
                btnApprove.textContent = `Setujui Laporan Terpilih`;
                btnReject.textContent = `Tolak Laporan Terpilih`;
            }
        }

        function applyFilters() {
            const status = document.getElementById('filter-status').value;
            const jenis = document.getElementById('filter-jenis').value;

            if(tableBencana) {
                tableBencana.column(8).search(status).draw();
                tableBencana.column(1).search(jenis).draw();
            }
            if(tableInsiden) {
                tableInsiden.column(7).search(status).draw();
            }
        }

        function showPhoto(src, title) {
            document.getElementById('photo-modal-image').src = src;
            document.getElementById('photoModalLabel').textContent = title || 'Foto Dokumentasi';
            new bootstrap.Modal('#photo-modal').show();
        }
    </script>
</body>
</html>