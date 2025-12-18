// --- KONFIGURASI DAN DATA AWAL ---

// 1. Definisikan Bobot Kriteria (W) - Total harus 1.0
const weights = {
    jiwa: 0.40,
    kk: 0.25,
    kerusakan: 0.20,
    jenis: 0.15,
};

// 2. Definisikan Skor Kuantifikasi untuk Kriteria Kualitatif
const quantificationScores = {
    kerusakan: { 'Ringan': 1, 'Sedang': 2, 'Berat': 3 },
    jenis: {
        'Angin Puting Beliung': 1,
        'Banjir': 2,
        'Kebakaran': 2, 
        'Tanah Longsor': 3,
        'Kebakaran Hutan': 3, 
        'Gempa Bumi': 4
    }
};

// 3. Data Global
let allReportData = []; // Variabel global untuk menyimpan data dari server

// Daftar Opsi untuk Dropdown
const bencanaOptions = ['Banjir', 'Tanah Longsor', 'Angin Puting Beliung', 'Gempa Bumi', 'Kebakaran', 'Kebakaran Hutan'];
const insidenOptions = ['Pohon Tumbang', 'Orang Hilang'];

/**
 * Format date to Indonesian format: "16 Oktober 2025"
 */
function formatDate(dateString) {
    if (!dateString || dateString === '0000-00-00') {
        return 'Tanggal tidak valid';
    }
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

// Helper to get Indonesian Month Name from index (0-11)
function getIndonesianMonthName(monthIndex) {
    const monthNames = ["JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI", "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"];
    return monthNames[monthIndex];
}

// --- FUNGSI LOGIKA SAW (BENCANA) ---

/**
 * Fungsi inti yang menjalankan algoritma Simple Additive Weighting (SAW)
 */
function runSAW(data) {
    if (data.length === 0) return [];

    // Langkah 1: Kuantifikasi
    const quantifiedData = data.map(item => ({
        ...item,
        skorKerusakan: quantificationScores.kerusakan[item.tingkatKerusakan] || 0,
        skorJenis: quantificationScores.jenis[item.jenisBencana] || 0
    }));

    // Langkah 2: Cari nilai maksimum (Normalisasi)
    const maxValues = {
        jiwa: Math.max(1, ...quantifiedData.map(d => d.jiwaTerdampak)),
        kk: Math.max(1, ...quantifiedData.map(d => d.kkTerdampak)),
        kerusakan: Math.max(1, ...quantifiedData.map(d => d.skorKerusakan)),
        jenis: Math.max(1, ...quantifiedData.map(d => d.skorJenis))
    };

    // Langkah 3: Normalisasi
    const normalizedData = quantifiedData.map(item => ({
        ...item,
        normJiwa: (item.jiwaTerdampak || 0) / maxValues.jiwa,
        normKk: (item.kkTerdampak || 0) / maxValues.kk,
        normKerusakan: (item.skorKerusakan || 0) / maxValues.kerusakan,
        normJenis: (item.skorJenis || 0) / maxValues.jenis,
    }));

    // Langkah 4: Hitung Skor Akhir (V)
    const scoredData = normalizedData.map(item => {
        const score =
            (item.normJiwa * weights.jiwa) +
            (item.normKk * weights.kk) +
            (item.normKerusakan * weights.kerusakan) +
            (item.normJenis * weights.jenis);
        return { ...item, finalScore: score };
    });

    // Langkah 5: Urutkan
    const sortedData = scoredData.sort((a, b) => b.finalScore - a.finalScore);

    return sortedData;
}

// Fungsi Helper untuk Alert Alasan Penolakan
window.showRejectReason = function(reason) {
    Swal.fire({
        title: 'Alasan Penolakan',
        text: reason,
        icon: 'warning',
        confirmButtonText: 'Saya Mengerti, Saya akan Revisi',
        confirmButtonColor: '#e60013'
    });
};

// --- FUNGSI RENDER TABEL ---

/**
 * Menampilkan data BENCANA (SAW) ke tabel #report-table-body-bencana
 */
function generateBencanaTable(data) {
    const rankedData = runSAW(data); // Jalankan SAW
    const tableBody = document.getElementById('report-table-body-bencana');
    tableBody.innerHTML = '';

    if (rankedData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" class="text-center py-4 text-muted">Belum ada data bencana.</td></tr>`;
        return;
    }

    rankedData.forEach((item, index) => {
        const rank = index + 1;
        const rankColor = rank === 1 ? 'bg-danger-subtle text-danger-emphasis' : (rank === 2 ? 'bg-warning-subtle text-warning-emphasis' : 'bg-success-subtle text-success-emphasis');

        let photoThumbnails = '';
        if (item.photos && item.photos.length > 0) {
            photoThumbnails = '<div class="d-flex flex-wrap gap-1">';
            item.photos.forEach(photo => {
                photoThumbnails += `<img src="${photo.file_path}" alt="Foto bencana" class="img-thumbnail" style="width: 40px; height: 40px; object-fit: cover; cursor: pointer;" data-bs-toggle="modal" data-bs-target="#photo-modal" data-photo-src="${photo.file_path}" data-photo-title="${photo.original_filename}">`;
            });
            photoThumbnails += '</div>';
        } else {
            photoThumbnails = '<span class="text-muted">Tidak ada foto</span>';
        }

        // Logic Status Badge
        let statusBadge = '';
        let rowClass = '';
        if (item.status === 'approved') {
            statusBadge = '<span class="badge bg-success">Disetujui</span>';
        } else if (item.status === 'rejected') {
            let reason = item.reject_reason || 'Tidak ada alasan';
            reason = reason.replace(/'/g, "\\'"); 
            statusBadge = `<span class="badge bg-danger">Ditolak</span> 
                           <br><a href="#" class="small text-danger fw-bold text-decoration-none" onclick="showRejectReason('${reason}'); return false;">Lihat Alasan</a>`;
            rowClass = 'table-danger';
        } else {
            statusBadge = '<span class="badge bg-warning text-dark">Menunggu</span>';
        }

        const row = `
            <tr class="${rowClass}">
                <td class="text-center">
                    <span class="badge ${rankColor} rounded-pill fs-6">${rank}</span>
                </td>
                <td class="fw-medium">${item.jenisBencana}</td>
                <td>${item.lokasi}</td>
                <td>${formatDate(item.disaster_date)}</td>
                <td>${item.jiwaTerdampak} Jiwa / ${item.kkTerdampak} KK</td>
                <td class="text-center">
                     <span class="badge ${
                        item.tingkatKerusakan === 'Berat' ? 'bg-danger-subtle text-danger-emphasis' :
                        item.tingkatKerusakan === 'Sedang' ? 'bg-warning-subtle text-warning-emphasis' : 'bg-secondary-subtle text-secondary-emphasis'
                     } rounded-pill">${item.tingkatKerusakan}</span>
                </td>
                <td class="fw-bold text-primary">${item.finalScore.toFixed(4)}</td>
                <td>${statusBadge}</td>
                <td>${photoThumbnails}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${item.id}" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11a.5.5 0 0 1 .108-.191z"/></svg>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${item.id}" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5a.5.5 0 0 1-.5-.5V6a.5.5 0 0 0-1 0v6.5A1.5 1.5 0 0 0 9.5 14h1a1.5 1.5 0 0 0 1.5-1.5V6a.5.5 0 0 0-1 0z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

/**
 * Menampilkan data INSIDEN (Kronologis) ke tabel #report-table-body-insiden
 */
function generateInsidenTable(data) {
    const tableBody = document.getElementById('report-table-body-insiden');
    tableBody.innerHTML = '';

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">Belum ada laporan insiden.</td></tr>`;
        return;
    }

    // Urutkan berdasarkan tanggal terbaru
    data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    data.forEach(item => {
        let photoThumbnails = '';
        if (item.photos && item.photos.length > 0) {
            photoThumbnails = '<div class="d-flex flex-wrap gap-1">';
            item.photos.forEach(photo => {
                photoThumbnails += `<img src="${photo.file_path}" alt="Foto insiden" class="img-thumbnail" style="width: 40px; height: 40px; object-fit: cover; cursor: pointer;" data-bs-toggle="modal" data-bs-target="#photo-modal" data-photo-src="${photo.file_path}" data-photo-title="${photo.original_filename}">`;
            });
            photoThumbnails += '</div>';
        } else {
            photoThumbnails = '<span class="text-muted">Tidak ada foto</span>';
        }

        // Logic Status Badge
        let statusBadge = '';
        let rowClass = '';
        if (item.status === 'approved') {
            statusBadge = '<span class="badge bg-success">Disetujui</span>';
        } else if (item.status === 'rejected') {
            let reason = item.reject_reason || 'Tidak ada alasan';
            reason = reason.replace(/'/g, "\\'");
            statusBadge = `<span class="badge bg-danger">Ditolak</span> 
                           <br><a href="#" class="small text-danger fw-bold text-decoration-none" onclick="showRejectReason('${reason}'); return false;">Lihat Alasan</a>`;
            rowClass = 'table-danger';
        } else {
            statusBadge = '<span class="badge bg-warning text-dark">Menunggu</span>';
        }

        const row = `
            <tr class="${rowClass}">
                <td class="fw-medium">${item.jenisBencana}</td>
                <td>${item.lokasi}</td>
                <td>${item.keterangan || '<span class="text-muted">N/A</span>'}</td>
                <td>${formatDate(item.disaster_date)}</td>
                <td>${statusBadge}</td>
                <td>${photoThumbnails}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${item.id}" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11a.5.5 0 0 1 .108-.191z"/></svg>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${item.id}" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5a.5.5 0 0 1-.5-.5V6a.5.5 0 0 0-1 0v6.5A1.5 1.5 0 0 0 9.5 14h1a1.5 1.5 0 0 0 1.5-1.5V6a.5.5 0 0 0-1 0z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// --- FUNGSI INTERAKSI FORM (SUBMIT & LOGIN) ---

/**
 * Menangani submit form untuk menambah data bencana baru
 */
function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    // Validasi manual untuk input yang mungkin non-required (karena disembunyikan)
    const kategori = formData.get('kategoriLaporan');
    if (kategori === 'bencana') {
        if (!formData.get('jiwaTerdampak') || !formData.get('kkTerdampak')) {
             Swal.fire({
                icon: 'error',
                title: 'Gagal!',
                text: 'Untuk Kategori Bencana, Jiwa dan KK Terdampak wajib diisi.',
                confirmButtonColor: '#e60013'
            });
            return;
        }
    }

    // Send data to server
    fetch('save_disaster.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: data.message,
                confirmButtonColor: '#00499d'
            });
            form.reset();
            // Reset form dinamis ke default
            const formBencana = document.getElementById('form-grup-bencana');
            const formInsiden = document.getElementById('form-grup-insiden');
            if(formBencana && formInsiden) {
                formBencana.style.display = 'block';
                formInsiden.style.display = 'none';
                document.getElementById('jiwaTerdampak').required = true;
                document.getElementById('kkTerdampak').required = true;
            }
            
            loadAndDisplayAllReports(); // Memuat ulang SEMUA data
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Gagal!',
                text: data.message,
                confirmButtonColor: '#e60013'
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Terjadi kesalahan saat menyimpan laporan',
            confirmButtonColor: '#e60013'
        });
    });
}

/**
 * Menangani login form
 */
function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    fetch('login.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Login Berhasil!',
                text: 'Selamat datang di sistem BPBD.',
                confirmButtonColor: '#00499d',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                window.location.reload();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Login Gagal!',
                text: data.message,
                confirmButtonColor: '#e60013'
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Terjadi kesalahan saat login',
            confirmButtonColor: '#e60013'
        });
    });
}

// --- FUNGSI FILTER & LOAD DATA ---

/**
 * Mengisi Dropdown Tahun secara dinamis
 */
function populateYearDropdown() {
    const yearSelect = document.getElementById('filter-year');
    if (!yearSelect) return;

    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 2; // Mulai dari 2 tahun lalu
    const endYear = currentYear + 1;   // Sampai 1 tahun ke depan

    yearSelect.innerHTML = '';
    for (let y = startYear; y <= endYear; y++) {
        const option = document.createElement('option');
        option.value = y;
        option.textContent = y;
        if (y === currentYear) option.selected = true;
        yearSelect.appendChild(option);
    }
}

/**
 * Filter data berdasarkan bulan dan tahun yang dipilih
 */
function filterDataByMonth(data, filterValue) {
    if (!filterValue) return data;
    return data.filter(item => {
        // Asumsi item.disaster_date format 'YYYY-MM-DD'
        return item.disaster_date && item.disaster_date.startsWith(filterValue);
    });
}

/**
 * Render tabel dengan filter Tahun & Bulan
 */
function filterAndRenderReports() {
    const yearSelect = document.getElementById('filter-year');
    const monthSelect = document.getElementById('filter-month');
    
    // Jika elemen filter tidak ada (misal di halaman login), hentikan
    if (!yearSelect || !monthSelect) return;

    const year = yearSelect.value;
    const month = monthSelect.value;
    
    // Gabungkan menjadi format YYYY-MM jika bulan dipilih, atau YYYY jika setahun penuh
    let filterValue = year;
    if (month) {
        filterValue += '-' + month;
    }

    const filteredData = filterDataByMonth(allReportData, filterValue);

    // 1. Pisahkan data berdasarkan kategori
    const bencanaData = filteredData.filter(d => d.kategori_laporan === 'bencana' || !d.kategori_laporan);
    const insidenData = filteredData.filter(d => d.kategori_laporan === 'insiden');

    // 2. Hancurkan DataTable yang ada
    if ($.fn.DataTable.isDataTable('#disaster-report-table')) {
        $('#disaster-report-table').DataTable().destroy();
    }
    if ($.fn.DataTable.isDataTable('#insiden-report-table')) {
        $('#insiden-report-table').DataTable().destroy();
    }

    // 3. Generate HTML untuk setiap tabel
    generateBencanaTable(bencanaData);
    generateInsidenTable(insidenData);

    // Re-init DataTable
    setTimeout(function() {
        if (bencanaData.length > 0) {
            $('#disaster-report-table').DataTable({
                "pageLength": 5, "lengthMenu": [3, 5], "responsive": true, "order": [[0, "asc"]],
                "columnDefs": [ { "orderable": false, "targets": [1, 2, 3, 4, 5, 7, 8, 9] } ],
                "language": { "search": "Cari:", "paginate": { "next": ">", "previous": "<" } }
            });
        }
        if (insidenData.length > 0) {
            $('#insiden-report-table').DataTable({
                "pageLength": 5, "lengthMenu": [3, 5], "responsive": true, "order": [[3, "desc"]],
                "columnDefs": [ { "orderable": false, "targets": [0, 1, 2, 4, 5, 6] } ],
                "language": { "search": "Cari:", "paginate": { "next": ">", "previous": "<" } }
            });
        }
    }, 10);
}

/**
 * Load disaster data from server
 */
function loadAndDisplayAllReports() {
    fetch('get_disasters.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                allReportData = data.data; // Simpan semua data di global
                filterAndRenderReports(); // Tampilkan dengan filter default
            } else {
                console.error('Error loading data:', data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

/**
 * Handle logout
 */
function handleLogout() {
    Swal.fire({
        title: 'Konfirmasi Logout',
        text: 'Apakah Anda yakin ingin keluar dari sistem?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#00499d',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Logout',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Logout Berhasil!',
                text: 'Terima kasih telah menggunakan sistem BPBD.',
                icon: 'success',
                confirmButtonColor: '#00499d',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                window.location.href = 'logout.php';
            });
        }
    });
}

// --- FUNGSI CETAK LAPORAN ---

/**
 * [CETAK 1] Laporan Bencana (SAW) - Filter Tahunan/Bulanan
 */
function handlePrintReport() {
    const year = document.getElementById('filter-year').value;
    const month = document.getElementById('filter-month').value;
    
    let filterValue = year;
    if (month) filterValue += '-' + month;

    const filteredData = filterDataByMonth(allReportData, filterValue);
    const bencanaData = filteredData.filter(d => d.kategori_laporan === 'bencana' || !d.kategori_laporan);
    const rankedData = runSAW(bencanaData);
    
    // Tentukan Judul Periode untuk Cetak
    let periodText = `Tahun ${year}`;
    if (month) {
        periodText = `Bulan ${getIndonesianMonthName(parseInt(month) - 1)} ${year}`;
    }

    const previewContent = document.getElementById('preview-content');
    
    const today = new Date();
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const reportDate = `${today.getDate()} ${monthNames[today.getMonth()]} ${today.getFullYear()}`;

    let tableRows = '';
    if (rankedData.length === 0) {
        tableRows = '<tr><td colspan="9" style="text-align:center; padding: 20px;">Tidak ada data laporan untuk periode ini.</td></tr>';
    } else {
        rankedData.forEach((item, index) => {
            let photoCell = '<span style="font-size: 10px; color: #666;">Tidak ada foto</span>';
            if (item.photos && item.photos.length > 0) {
                const imageUrl = new URL(item.photos[0].file_path, window.location.href).href;
                photoCell = `<img src="${imageUrl}" alt="Foto Bencana" style="width: 100%; height: 100%; object-fit: cover;">`;
            }
            tableRows += `
                <tr style="border-bottom: 1px solid #ddd; page-break-inside: avoid;">
                    <td style="padding: 8px; text-align: center;">${index + 1}</td>
                    <td style="padding: 8px;">${item.jenisBencana}</td>
                    <td style="padding: 8px;">${item.lokasi}</td>
                    <td style="padding: 8px; text-align: center;">${formatDate(item.disaster_date)}</td>
                    <td style="padding: 8px; text-align: center;">${item.jiwaTerdampak}</td>
                    <td style="padding: 8px; text-align: center;">${item.kkTerdampak}</td>
                    <td style="padding: 8px;">${item.tingkatKerusakan}</td>
                    <td style="padding: 8px; font-weight: bold;">${item.finalScore.toFixed(4)}</td>
                    <td style="padding: 0; text-align: center; width: 100px;">${photoCell}</td>
                </tr>`;
        });
    }

    const printContent = `
        <div style="font-family: Arial, sans-serif; width: 100%; transform: scale(0.8); transform-origin: top left;">
            <div style="text-align: center; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 24px; font-weight: bold;">BADAN PENANGGULANGAN BENCANA DAERAH</h2>
                <h3 style="margin: 0; font-size: 20px;">KABUPATEN MINAHASA</h3>
                <p style="margin: 5px 0 0; font-size: 12px;">Alamat: Jl. Instansi No. 123, Tondano, Minahasa, Sulawesi Utara</p>
            </div>
            <h1 style="text-align: center; font-size: 18px; text-decoration: underline; margin-bottom: 20px;">LAPORAN REKAPITULASI DAN PRIORITAS DAMPAK BENCANA</h1>
            <p style="text-align: center; margin-top: -10px; margin-bottom: 30px;">Periode: ${periodText}</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                    <tr style="background-color: #f2f2f2; text-align: left;">
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Peringkat</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Jenis Bencana</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Lokasi</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Tanggal</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Jiwa</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">KK</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Kerusakan</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Indeks Dampak</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Dokumentasi</th>
                    </tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>
            <!-- TTD Section Updated with Flexbox -->
            <div style="margin-top: 1px; display: flex; justify-content: flex-end; page-break-inside: avoid;">
                <div style="text-align: center; width: 300px;">
                    <p style="margin-bottom: 60px;">Tondano, ${reportDate}<br><br>Kepala Badan Penanggulangan Bencana<br>Daerah Kabupaten Minahasa</p>
                    <p style="font-weight: bold; text-decoration: underline;">LONA O.K. WATTIE, S.STP, M.AP</p>
                    <p>Pembina Utama Muda, IV/c</p>
                    <p>NIP. 19791007 199810 1001</p>
                </div>
            </div>
        </div>`;

    document.getElementById('previewModalLabel').textContent = 'Preview Laporan Bencana (SAW)';
    previewContent.innerHTML = printContent;
    const modal = new bootstrap.Modal(document.getElementById('preview-modal'));
    modal.show();
}

/**
 * [CETAK 2] Laporan Insiden (Kronologis)
 */
function handlePrintInsidenReport() {
    const year = document.getElementById('filter-year').value;
    const month = document.getElementById('filter-month').value;
    
    let filterValue = year;
    if (month) filterValue += '-' + month;

    const filteredData = filterDataByMonth(allReportData, filterValue);
    const insidenData = filteredData.filter(d => d.kategori_laporan === 'insiden');
    insidenData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Judul Periode Dinamis
    let periodText = `Tahun ${year}`;
    if (month) {
        periodText = `Bulan ${getIndonesianMonthName(parseInt(month) - 1)} ${year}`;
    }

    const previewContent = document.getElementById('preview-content');
    const today = new Date();
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const reportDate = `${today.getDate()} ${monthNames[today.getMonth()]} ${today.getFullYear()}`;

    let tableRows = '';
    if (insidenData.length === 0) {
        tableRows = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Tidak ada data laporan insiden untuk periode ini.</td></tr>';
    } else {
        insidenData.forEach((item, index) => {
            let photoCell = '<span style="font-size: 10px; color: #666;">Tidak ada foto</span>';
            if (item.photos && item.photos.length > 0) {
                const imageUrl = new URL(item.photos[0].file_path, window.location.href).href;
                photoCell = `<img src="${imageUrl}" alt="Foto Insiden" style="width: 100%; height: 100%; object-fit: cover;">`;
            }
            tableRows += `
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px;">${item.jenisBencana}</td>
                    <td style="padding: 8px;">${item.lokasi}</td>
                    <td style="padding: 8px; font-size: 11px;">${item.keterangan || 'N/A'}</td>
                    <td style="padding: 8px; text-align: center;">${formatDate(item.disaster_date)}</td>
                    <td style="padding: 0; text-align: center; width: 100px;">${photoCell}</td>
                </tr>`;
        });
    }

    const printContent = `
        <div style="font-family: Arial, sans-serif; width: 100%; transform: scale(0.8); transform-origin: top left;">
            <div style="text-align: center; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 24px; font-weight: bold;">BADAN PENANGGULANGAN BENCANA DAERAH</h2>
                <h3 style="margin: 0; font-size: 20px;">KABUPATEN MINAHASA</h3>
                <p style="margin: 5px 0 0; font-size: 12px;">Alamat: Jl. Instansi No. 123, Tondano, Minahasa, Sulawesi Utara</p>
            </div>
            <h1 style="text-align: center; font-size: 18px; text-decoration: underline; margin-bottom: 20px;">LAPORAN REKAPITULASI INSIDEN DARURAT</h1>
            <p style="text-align: center; margin-top: -10px; margin-bottom: 30px;">Periode: ${periodText}</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                    <tr style="background-color: #f2f2f2; text-align: left;">
                        <th style="padding: 8px; border: 1px solid #ddd;">Jenis Insiden</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Lokasi</th>
                        <th style="padding: 8px; border: 1px solid #ddd;">Keterangan</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Tanggal</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Dokumentasi</th>
                    </tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>
            <!-- TTD Section Updated with Flexbox -->
            <div style="display: flex; justify-content: flex-end; page-break-inside: avoid;">
                <div style="text-align: center; width: 250px;">
                    <p style="margin-bottom: 60px;">Tondano, ${reportDate}<br><br>Kepala Badan Penanggulangan Bencana<br>Daerah Kabupaten Minahasa</p>
                    <p style="font-weight: bold; text-decoration: underline;">LONA O.K. WATTIE, S.STP, M.AP</p>
                    <p>Pembina Utama Muda, IV/c</p>
                    <p>NIP. 19791007 199810 1001</p>
                </div>
            </div>
        </div>`;

    document.getElementById('previewModalLabel').textContent = 'Preview Laporan Insiden Darurat';
    document.getElementById('preview-content').innerHTML = printContent;
    const modal = new bootstrap.Modal(document.getElementById('preview-modal'));
    modal.show();
}

/**
 * [CETAK 3] Laporan Kumulatif (Matrix Bulanan) - PER TAHUN (Mengabaikan filter bulan)
 */
function handlePrintCumulativeReport() {
    // Ambil tahun langsung dari dropdown tahun
    const selectedYear = document.getElementById('filter-year').value;
    
    // Filter data hanya untuk tahun yang dipilih
    const yearlyData = allReportData.filter(item => {
        if (!item.disaster_date) return false;
        return item.disaster_date.startsWith(selectedYear);
    });

    const months = ["JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI", "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"];
    const disasterColumns = [
        { db: 'Angin Puting Beliung', label: 'ANGIN PUTTING<br>BELIUNG' },
        { db: 'Pohon Tumbang', label: 'POHON<br>TUMBANG' },
        { db: 'Tanah Longsor', label: 'LONGSOR' },
        { db: 'Kebakaran', label: 'KEBAKARAN' },
        { db: 'Kebakaran Hutan', label: 'KARHUTLAH' },
        { db: 'Orang Hilang', label: 'ORANG<br>HILANG' },
        { db: 'Banjir', label: 'BANJIR' },
        { db: 'Gempa Bumi', label: 'GEMPA BUMI' }
    ];
    const stats = {};
    months.forEach((m, index) => {
        stats[index] = { total: 0 };
        disasterColumns.forEach(col => {
            stats[index][col.db] = 0;
        });
    });
    const grandTotals = { total: 0 };
    disasterColumns.forEach(col => grandTotals[col.db] = 0);

    yearlyData.forEach(item => {
        const date = new Date(item.disaster_date);
        const monthIndex = date.getMonth();
        let dbType = item.jenisBencana;
        if (dbType === "Kebakaran Hutan (Karhutla)") dbType = "Kebakaran Hutan"; 
        const colExists = disasterColumns.find(col => col.db === dbType);
        if (colExists && stats[monthIndex]) {
            stats[monthIndex][dbType]++;
            stats[monthIndex].total++;
            grandTotals[dbType]++;
            grandTotals.total++;
        }
    });

    let tableRows = '';
    months.forEach((monthName, index) => {
        const rowData = stats[index];
        let colsHtml = '';
        disasterColumns.forEach(col => {
            const val = rowData[col.db];
            colsHtml += `<td style="border: 1px solid #000; padding: 5px; text-align: center;">${val > 0 ? val : ''}</td>`;
        });
        tableRows += `<tr><td style="border: 1px solid #000; padding: 5px; text-align: center;">${index + 1}</td><td style="border: 1px solid #000; padding: 5px; text-align: left; padding-left: 10px;">${monthName}</td>${colsHtml}<td style="border: 1px solid #000; padding: 5px; text-align: center; font-weight: bold;">${rowData.total > 0 ? rowData.total : ''}</td></tr>`;
    });

    let grandTotalColsHtml = '';
    disasterColumns.forEach(col => {
        const val = grandTotals[col.db];
        grandTotalColsHtml += `<td style="border: 1px solid #000; padding: 5px; text-align: center; font-weight: bold;">${val > 0 ? val : ''}</td>`;
    });
    const grandTotalRow = `<tr style="background-color: #f0f0f0;"><td colspan="2" style="border: 1px solid #000; padding: 5px; text-align: center; font-weight: bold;">TOTAL</td>${grandTotalColsHtml}<td style="border: 1px solid #000; padding: 5px; text-align: center; font-weight: bold;">${grandTotals.total}</td></tr>`;

    const today = new Date();
    const monthNamesIndo = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const reportDateString = `${today.getDate()} ${monthNamesIndo[today.getMonth()]} ${today.getFullYear()}`;

    const printContent = `
        <div style="font-family: Arial, sans-serif; width: 100%; font-size: 12px; color: #000;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 16px; font-weight: bold;">PEMERINTAH KABUPATEN MINAHASA</h2>
                <h2 style="margin: 0; font-size: 18px; font-weight: bold;">BADAN PENANGGULANGAN BENCANA DAERAH</h2>
                <p style="margin: 5px 0 0; font-size: 10px;">Alamat: Kompleks Stadion Maesa Kelurahan Wewelen (Tondano)</p>
                <p style="margin: 0; font-size: 10px;">Website: www.minahasa.go.id E-mail: pemkab.minahasa@minahasa.go.id</p>
                <hr style="border: 1px solid #000; margin-top: 10px;">
            </div>
            <div style="text-align: center; margin-bottom: 15px;">
                <h3 style="margin: 0; font-size: 14px; font-weight: bold; text-decoration: underline;">REKAPITULASI DATA LAPORAN KEJADIAN BENCANA TAHUN ${selectedYear}</h3>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                <thead>
                    <tr style="background-color: #e0e0e0;">
                        <th style="border: 1px solid #000; padding: 5px; width: 30px;">NO</th>
                        <th style="border: 1px solid #000; padding: 5px;">BULAN</th>
                        ${disasterColumns.map(col => `<th style="border: 1px solid #000; padding: 5px; font-size: 10px;">${col.label}</th>`).join('')}
                        <th style="border: 1px solid #000; padding: 5px;">TOTAL</th>
                    </tr>
                </thead>
                <tbody>${tableRows}${grandTotalRow}</tbody>
            </table>
            <div style="margin-top: 10px; display: flex; justify-content: space-between; page-break-inside: avoid;">
                <div style="text-align: center; width: 40%;">
                    <p style="margin-bottom: 60px;">Tondano, ${reportDateString}<br>Kepala Badan Penanggulangan Bencana<br>Daerah Kabupaten Minahasa</p>
                    <p style="font-weight: bold; text-decoration: underline;">LONA O.K. WATTIE, S.STP, M.AP</p>
                    <p>Pembina Utama Muda, IV/c</p>
                    <p>Nip. 19791007 199810 1001</p>
                </div>
                <div style="text-align: center; width: 40%;">
                    <p style="margin-bottom: 60px;"><br>Kabid Kedaruratan dan Logistik</p>
                    <p style="font-weight: bold; text-decoration: underline;">Jelly N. Bokau, SST</p>
                    <p>Pembina Tkt I, IV/b</p>
                    <p>Nip. 19680702 199003 2007</p>
                </div>
            </div>
        </div>`;

    document.getElementById('previewModalLabel').textContent = 'Preview Laporan Kumulatif (Matrix)';
    document.getElementById('preview-content').innerHTML = printContent;
    const modal = new bootstrap.Modal(document.getElementById('preview-modal'));
    modal.show();
}

/**
 * [CETAK 4] Laporan Dampak Korban (KK/Jiwa) - PER TAHUN (Mengabaikan filter bulan)
 */
function handlePrintImpactReport() {
    const selectedYear = document.getElementById('filter-year').value;
    
    const yearlyData = allReportData.filter(item => {
        if (!item.disaster_date) return false;
        return item.disaster_date.startsWith(selectedYear);
    });

    const months = ["JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI", "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"];
    const disasterColumns = [
        { db: 'Angin Puting Beliung', label: 'ANGIN PUTTING BELIUNG' },
        { db: 'Pohon Tumbang', label: 'POHON TUMBANG' },
        { db: 'Tanah Longsor', label: 'LONGSOR' },
        { db: 'Kebakaran', label: 'KEBAKARAN' },
        { db: 'Kebakaran Hutan', label: 'KARHUTLAH' },
        { db: 'Orang Hilang', label: 'ORANG HILANG' },
        { db: 'Banjir', label: 'BANJIR' },
        { db: 'Gempa Bumi', label: 'GEMPA BUMI' }
    ];
    const stats = {};
    months.forEach((m, index) => {
        stats[index] = { total: { kk: 0, jiwa: 0 } };
        disasterColumns.forEach(col => stats[index][col.db] = { kk: 0, jiwa: 0 });
    });
    const grandTotals = { total: { kk: 0, jiwa: 0 } };
    disasterColumns.forEach(col => grandTotals[col.db] = { kk: 0, jiwa: 0 });

    yearlyData.forEach(item => {
        const date = new Date(item.disaster_date);
        const monthIndex = date.getMonth();
        let dbType = item.jenisBencana;
        if (dbType === "Kebakaran Hutan (Karhutla)") dbType = "Kebakaran Hutan";
        const colExists = disasterColumns.find(col => col.db === dbType);
        const kk = parseInt(item.kkTerdampak) || 0;
        const jiwa = parseInt(item.jiwaTerdampak) || 0;
        if (colExists && stats[monthIndex]) {
            stats[monthIndex][dbType].kk += kk;
            stats[monthIndex][dbType].jiwa += jiwa;
            stats[monthIndex].total.kk += kk;
            stats[monthIndex].total.jiwa += jiwa;
            grandTotals[dbType].kk += kk;
            grandTotals[dbType].jiwa += jiwa;
            grandTotals.total.kk += kk;
            grandTotals.total.jiwa += jiwa;
        }
    });

    let headerRowTop = '';
    let headerRowBottom = '';
    disasterColumns.forEach(col => {
        headerRowTop += `<th colspan="2" style="border: 1px solid #000; padding: 4px; font-size: 9px;">${col.label}</th>`;
        headerRowBottom += `<th style="border: 1px solid #000; padding: 4px; font-size: 8px;">KK</th><th style="border: 1px solid #000; padding: 4px; font-size: 8px;">JIWA</th>`;
    });

    let tableRows = '';
    months.forEach((monthName, index) => {
        const rowData = stats[index];
        let colsHtml = '';
        disasterColumns.forEach(col => {
            const data = rowData[col.db];
            const valKK = data.kk > 0 ? data.kk : '';
            const valJiwa = data.jiwa > 0 ? data.jiwa : '';
            colsHtml += `<td style="border: 1px solid #000; padding: 4px; text-align: center;">${valKK}</td><td style="border: 1px solid #000; padding: 4px; text-align: center;">${valJiwa}</td>`;
        });
        const totalKK = rowData.total.kk > 0 ? rowData.total.kk : '';
        const totalJiwa = rowData.total.jiwa > 0 ? rowData.total.jiwa : '';
        tableRows += `<tr><td style="border: 1px solid #000; padding: 4px; text-align: center;">${index + 1}</td><td style="border: 1px solid #000; padding: 4px; text-align: left; padding-left: 5px;">${monthName}</td>${colsHtml}<td style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">${totalKK}</td><td style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">${totalJiwa}</td></tr>`;
    });

    let grandTotalColsHtml = '';
    disasterColumns.forEach(col => {
        const data = grandTotals[col.db];
        const valKK = data.kk > 0 ? data.kk : '';
        const valJiwa = data.jiwa > 0 ? data.jiwa : '';
        grandTotalColsHtml += `<td style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">${valKK}</td><td style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">${valJiwa}</td>`;
    });
    const grandTotalRow = `<tr style="background-color: #f0f0f0;"><td colspan="2" style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">TOTAL</td>${grandTotalColsHtml}<td style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">${grandTotals.total.kk}</td><td style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">${grandTotals.total.jiwa}</td></tr>`;

    const today = new Date();
    const monthNamesIndo = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const reportDateString = `${today.getDate()} ${monthNamesIndo[today.getMonth()]} ${today.getFullYear()}`;

    const printContent = `
        <div style="font-family: Arial, sans-serif; width: 100%; font-size: 10px; color: #000;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 14px; font-weight: bold;">PEMERINTAH KABUPATEN MINAHASA</h2>
                <h2 style="margin: 0; font-size: 16px; font-weight: bold;">BADAN PENANGGULANGAN BENCANA DAERAH</h2>
                <p style="margin: 3px 0 0; font-size: 9px;">Alamat: Kompleks Stadion Maesa Kelurahan Wewelen (Tondano)</p>
                <p style="margin: 0; font-size: 9px;">Website: www.minahasa.go.id E-mail: pemkab.minahasa@minahasa.go.id</p>
                <hr style="border: 1px solid #000; margin-top: 8px;">
            </div>
            <div style="text-align: center; margin-bottom: 15px;">
                <h3 style="margin: 0; font-size: 12px; font-weight: bold; text-decoration: underline;">REKAPITULASI DATA LAPORAN KORBAN TERDAMPAK BENCANA TAHUN ${selectedYear}</h3>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
                <thead>
                    <tr style="background-color: #e0e0e0;">
                        <th rowspan="2" style="border: 1px solid #000; padding: 4px; width: 25px;">NO</th>
                        <th rowspan="2" style="border: 1px solid #000; padding: 4px;">BULAN</th>
                        ${headerRowTop}
                        <th colspan="2" style="border: 1px solid #000; padding: 4px;">TOTAL</th>
                    </tr>
                    <tr style="background-color: #e0e0e0;">
                        ${headerRowBottom}
                        <th style="border: 1px solid #000; padding: 4px; font-size: 8px;">KK</th>
                        <th style="border: 1px solid #000; padding: 4px; font-size: 8px;">JIWA</th>
                    </tr>
                </thead>
                <tbody>${tableRows}${grandTotalRow}</tbody>
            </table>
            <div style="margin-top: 10px; display: flex; justify-content: space-between; page-break-inside: avoid;">
                <div style="text-align: center; width: 40%;">
                    <p style="margin-bottom: 50px;">Mengetahui<br>Kepala Badan Penanggulangan Bencana<br>Daerah Kabupaten Minahasa</p>
                    <p style="font-weight: bold; text-decoration: underline;">LONA O.K. WATTIE, S.STP, M.AP</p>
                    <p>Pembina Utama Muda, IV/c</p>
                    <p>Nip. 19791007 199810 1001</p>
                </div>
                <div style="text-align: center; width: 40%;">
                    <p style="margin-bottom: 50px;">Tondano, ${reportDateString}<br><br>Kabid Kedaruratan dan Logistik</p>
                    <p style="font-weight: bold; text-decoration: underline;">Jelly N. Bokau, SST</p>
                    <p>Pembina Tkt I, IV/b</p>
                    <p>Nip. 19680702 199003 2007</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('previewModalLabel').textContent = 'Preview Laporan Dampak (KK/Jiwa)';
    document.getElementById('preview-content').innerHTML = printContent;
    const modal = new bootstrap.Modal(document.getElementById('preview-modal'));
    modal.show();
}

/**
 * Menangani konfirmasi cetak dari modal preview
 */
function handleConfirmPrint() {
    const previewContent = document.getElementById('preview-content');
    let printContent = previewContent.innerHTML;
    
    // Clean up transform scale styles for printing
    printContent = printContent.replace(/transform: scale\(.*?\);/g, '');
    printContent = printContent.replace(/transform-origin:.*?;/g, '');

    if (!printContent.includes('<html>')) {
        printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Laporan BPBD</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #000; padding: 4px; text-align: center; }
                    @page { size: A4 landscape; margin: 1cm; }
                </style>
            </head>
            <body>
                ${printContent}
            </body>
            </html>
        `;
    }

    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.onload = function() {
        printWindow.print();
    };
    
    // Hide modal
    const modalElement = document.getElementById('preview-modal');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
    }
}


// --- EVENT LISTENERS ---

document.addEventListener('DOMContentLoaded', function() {
    // 1. Populate Year Dropdown First
    populateYearDropdown();

    // 2. Set Default Values (Bulan Ini)
    const today = new Date();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
    
    const monthSelect = document.getElementById('filter-month');
    if (monthSelect) monthSelect.value = currentMonth; // Default bulan ini

    // 3. Add Event Listeners for Filters
    const yearSelect = document.getElementById('filter-year');
    if (yearSelect) yearSelect.addEventListener('change', filterAndRenderReports);
    if (monthSelect) monthSelect.addEventListener('change', filterAndRenderReports);

    // 4. Load Data
    loadAndDisplayAllReports();

    const validateLink = document.getElementById('validate-link');
    if (validateLink) {
        validateLink.addEventListener('click', function(e) {
            // (Tidak perlu aksi khusus di sini)
        });
    }

    const kategoriSelect = document.getElementById('kategoriLaporan');
    const formGrupBencana = document.getElementById('form-grup-bencana');
    const formGrupInsiden = document.getElementById('form-grup-insiden');
    const jiwaInput = document.getElementById('jiwaTerdampak');
    const kkInput = document.getElementById('kkTerdampak');

    if (kategoriSelect) {
        kategoriSelect.addEventListener('change', function() {
            if (this.value === 'bencana') {
                formGrupBencana.style.display = 'block';
                formGrupInsiden.style.display = 'none';
                jiwaInput.required = true;
                kkInput.required = true;
            } else { // 'insiden'
                formGrupBencana.style.display = 'none';
                formGrupInsiden.style.display = 'block';
                jiwaInput.required = false;
                kkInput.required = false;
            }
        });
    }

    const disasterForm = document.getElementById('disaster-form');
    if (disasterForm) {
        disasterForm.addEventListener('submit', handleFormSubmit);
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    const printBtn = document.getElementById('print-report');
    if (printBtn) {
        printBtn.addEventListener('click', handlePrintReport);
    }
    const printInsidenBtn = document.getElementById('print-insiden-report');
    if (printInsidenBtn) {
        printInsidenBtn.addEventListener('click', handlePrintInsidenReport); 
    }
    const printCumulativeBtn = document.getElementById('print-cumulative-report');
    if (printCumulativeBtn) {
        printCumulativeBtn.addEventListener('click', handlePrintCumulativeReport);
    }
    const printImpactBtn = document.getElementById('print-impact-report');
    if (printImpactBtn) {
        printImpactBtn.addEventListener('click', handlePrintImpactReport);
    }
    
    const confirmPrintBtn = document.getElementById('confirm-print');
    if (confirmPrintBtn) {
        confirmPrintBtn.addEventListener('click', handleConfirmPrint);
    }

    // --- [LOGIKA BARU] Handle Edit Button & Populate Modal ---
    document.addEventListener('click', function(e) {
        if (e.target.closest('.edit-btn')) {
            const id = e.target.closest('.edit-btn').getAttribute('data-id');
            
            // Ambil data dari server
            fetch(`get_single_disaster.php?id=${id}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const disaster = data.data; // Data laporan utama
                        const photos = data.data.photos; // [NEW] Data foto dari server
                        
                        // Isi formulir modal (ID & Data Umum)
                        document.getElementById('edit-disaster-id').value = disaster.id;
                        document.getElementById('edit-lokasi').value = disaster.lokasi;
                        document.getElementById('edit-disasterDate').value = disaster.disaster_date;
                        document.getElementById('edit-keterangan').value = disaster.keterangan || '';

                        // Reset input file
                        const photoInput = document.querySelector('#edit-disaster-form input[type="file"]');
                        if (photoInput) photoInput.value = '';

                        // Logic Kategori (Bencana vs Insiden)
                        const isInsiden = disaster.kategori_laporan === 'insiden';
                        const selectEl = document.getElementById('edit-jenisBencana');
                        const fieldBencana = document.querySelectorAll('.field-bencana');
                        
                        // Populate Dropdown Jenis Bencana
                        if (selectEl) {
                            selectEl.innerHTML = '';
                            const options = isInsiden ? insidenOptions : bencanaOptions;
                            
                            options.forEach(opt => {
                                const el = document.createElement('option');
                                el.value = opt;
                                el.textContent = opt;
                                if (opt === disaster.jenisBencana) el.selected = true;
                                selectEl.appendChild(el);
                            });
                        }

                        // Show/Hide Fields Berdasarkan Kategori
                        if (isInsiden) {
                            fieldBencana.forEach(el => el.style.display = 'none');
                        } else {
                            fieldBencana.forEach(el => el.style.display = 'block');
                            document.getElementById('edit-jiwaTerdampak').value = disaster.jiwaTerdampak;
                            document.getElementById('edit-kkTerdampak').value = disaster.kkTerdampak;
                            document.getElementById('edit-tingkatKerusakan').value = disaster.tingkatKerusakan;
                        }

                        // [NEW] Logic Menampilkan Foto Existing (Fitur Hapus)
                        const photoContainer = document.getElementById('edit-existing-photos');
                        const photoWrapper = document.getElementById('edit-existing-photos-container');
                        
                        if (photoContainer && photoWrapper) {
                            photoContainer.innerHTML = ''; // Reset konten sebelumnya
                            
                            // Cek jika ada foto yang dikirim dari server
                            if (photos && photos.length > 0) {
                                photoWrapper.style.display = 'block';
                                photos.forEach(photo => {
                                    const photoItem = `
                                        <div class="col-6 col-md-3">
                                            <div class="card h-100 border bg-light">
                                                <div class="card-body p-2 text-center">
                                                    <img src="${photo.file_path}" class="img-fluid rounded mb-2" style="height: 80px; object-fit: cover;">
                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input border-danger" type="checkbox" name="delete_photos[]" value="${photo.id}" id="del_idx_${photo.id}">
                                                        <label class="form-check-label text-danger small fw-bold" for="del_idx_${photo.id}">Hapus</label>
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
                        }
                        
                        // Tampilkan modal
                        const editModal = new bootstrap.Modal(document.getElementById('edit-modal'));
                        editModal.show();
                        
                    } else {
                        Swal.fire({ icon: 'error', title: 'Gagal!', text: data.message, confirmButtonColor: '#e60013' });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({ icon: 'error', title: 'Error!', text: 'Gagal mengambil data laporan.', confirmButtonColor: '#e60013' });
                });
        }
    });

    // Handle delete button
    document.addEventListener('click', function(e) {
        if (e.target.closest('.delete-btn')) {
            const id = e.target.closest('.delete-btn').getAttribute('data-id');
            handleDeleteDisaster(id);
        }
    });

/**
 * Handle delete disaster report
 */
function handleDeleteDisaster(id) {
    Swal.fire({
        title: 'Konfirmasi Hapus',
        text: 'Apakah Anda yakin ingin menghapus laporan bencana ini? Tindakan ini tidak dapat dibatalkan.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e60013',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            const formData = new FormData();
            formData.append('id', id);

            fetch('delete_disaster.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        text: data.message,
                        confirmButtonColor: '#00499d',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    loadAndDisplayAllReports(); // Reload data
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal!',
                        text: data.message,
                        confirmButtonColor: '#e60013'
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Terjadi kesalahan saat menghapus laporan.',
                    confirmButtonColor: '#e60013'
                });
            });
        }
    });
}

    // --- Handle Submit Formulir Edit Modal ---
    const editForm = document.getElementById('edit-disaster-form');
    if (editForm) {
        editForm.addEventListener('submit', function(event) {
            event.preventDefault(); 
            
            const form = event.target;
            const formData = new FormData(form); 
            const modalElement = document.getElementById('edit-modal');
            const modal = bootstrap.Modal.getInstance(modalElement);

            fetch('edit_disaster.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (modal) {
                        modal.hide();
                    }
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        text: data.message,
                        confirmButtonColor: '#00499d',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    loadAndDisplayAllReports(); // Muat ulang SEMUA data di tabel
                } else {
                    Swal.fire({ icon: 'error', title: 'Gagal!', text: data.message, confirmButtonColor: '#e60013' });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({ icon: 'error', title: 'Error!', text: 'Terjadi kesalahan saat menyimpan perubahan.', confirmButtonColor: '#e60013' });
            });
        });
    }

    // Handle photo modal
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-bs-target="#photo-modal"]')) {
            const imgSrc = e.target.getAttribute('data-photo-src');
            const imgTitle = e.target.getAttribute('data-photo-title');
            document.getElementById('photo-modal-image').src = imgSrc;
            document.getElementById('photoModalLabel').textContent = imgTitle || 'Foto Bencana';
        }
    });
});