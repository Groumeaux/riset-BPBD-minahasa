const weights = {
    jiwa: 0.40,
    kk: 0.25,
    kerusakan: 0.20,
    jenis: 0.15,
};

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

let allReportData = [];

const bencanaOptions = ['Banjir', 'Tanah Longsor', 'Angin Puting Beliung', 'Gempa Bumi', 'Kebakaran', 'Kebakaran Hutan'];
const insidenOptions = ['Pohon Tumbang', 'Orang Hilang'];

const minahasaLocations = {
    "Eris": {
        desa: ["Eris", "Maumbi", "Ranomerut", "Tandengan", "Tandengan Satu", "Telap", "Toliang Oki", "Watumea"]
    },
    "Kakas": {
        desa: ["Kaweng", "Kayuwatu", "Mahembang", "Makalelon", "Pahaleten", "Paslaten", "Rinondor", "Sendangan", "Talikuran", "Toulimembet", "Tounelet", "Tumpaan", "Wineru"]
    },
    "Kakas Barat": {
        desa: ["Bukittinggi", "Kalawiran", "Panasen", "Passo", "Simbel", "Totolan", "Touliang", "Tountimomor", "Wailang", "Wasian"]
    },
    "Kawangkoan": {
        kelurahan: ["Kinali", "Kinali Satu", "Sendangan", "Sendangan Selatan", "Sendangan Utara", "Uner Satu"],
        desa: ["Kanonang Tiga", "Tondegesan", "Tondegesan Dua", "Tondegesan Satu"]
    },
    "Kawangkoan Barat": {
        desa: ["Kanonang Dua", "Kanonang Empat", "Kanonang Lima", "Kanonang Satu", "Kayuuwi", "Kayuuwi Satu", "Ranolambot", "Tombasian Atas", "Tombasian Atas Satu", "Tombasian Bawah"]
    },
    "Kawangkoan Utara": {
        kelurahan: ["Talikuran", "Talikuran Barat", "Talikuran Utara", "Uner"],
        desa: ["Kiawa Dua", "Kiawa Dua Barat", "Kiawa Dua Timur", "Kiawa Satu", "Kiawa Satu Barat", "Kiawa Satu Utara"]
    },
    "Kombi": {
        desa: ["Kalawiran", "Kayu Besi", "Kinaleosan", "Kolongan", "Kolongan Satu", "Kombi", "Lalumpe", "Makalisung", "Ranowangko Dua", "Rerer", "Rerer Satu", "Sawangan", "Tulap"]
    },
    "Langowan Barat": {
        desa: ["Ampreng", "Kopiwangker", "Koyawas", "Lowian", "Noongan", "Noongan Dua", "Noongan Tiga", "Paslaten", "Raranon", "Raranon Selatan", "Raranon Utara", "Raringis", "Tounelet", "Tumaratas", "Tumaratas Dua", "Walewangko"]
    },
    "Langowan Selatan": {
        desa: ["Atep", "Atep Satu", "Kaayuran Atas", "Kaayuran Bawah", "Kawatak", "Manembo", "Palamba", "Rumbia", "Temboan", "Winebetan"]
    },
    "Langowan Timur": {
        desa: ["Amongena I", "Amongena II", "Amongena III", "Karondoran", "Sumarayar", "Teep", "Waleure", "Wolaang"]
    },
    "Langowan Utara": {
        desa: ["Karumenga", "Taraitak", "Taraitak Satu", "Tempang I", "Tempang II", "Tempang III", "Toraget", "Walantakan"]
    },
    "Lembean Timur": {
        desa: ["Atep Oki", "Kaleosan", "Kapataran", "Kapataran I", "Karor", "Kayuroya", "Parentek", "Seretan", "Seretan Timu", "Watulaney", "Watulaney Amian"]
    },
    "Mandolang": {
        desa: ["Agotey", "Kalasey Dua", "Kalasey Satu", "Koha", "Koha Barat", "Koha Selatan", "Koha Timur", "Tateli", "Tateli I", "Tateli II", "Tateli III", "Tateli Weru"]
    },
    "Pineleng": {
        desa: ["Kali", "Kali Selatan", "Lotta", "Pineleng Dua Indah", "Pineleng I", "Pineleng II", "Pineleng Satu Timur", "Sea", "Sea I", "Sea II", "Sea Mitra", "Sea Tumpengan", "Warembungan", "Winagun Atas"]
    },
    "Remboken": {
        desa: ["Kaima", "Kasuratan", "Leleko", "Parepei", "Paslaten", "Pulutan", "Sendangan", "Sinuian", "Talikuran", "Tampusu", "Timu"]
    },
    "Sonder": {
        desa: ["Kauneran", "Kauneran Satu", "Kolongan Atas", "Kolongan Atas Dua", "Kolongan Atas Satu", "Leilem", "Leilem Dua", "Leilem Tiga", "Rambunan", "Rambunan Amian", "Sawangan", "Sendangan", "Sendangan Satu", "Talikuran", "Talikuran Satu", "Timbukar", "Tincep", "Tounelet", "Tounelet Satu"]
    },
    "Tombariri": {
        desa: ["Borgo", "Kumu", "Mokupa", "Pinasungkulan", "Poopoh", "Ranowangko", "Sarani Matani", "Senduk", "Tambala", "Teling"]
    },
    "Tombariri Timur": {
        desa: ["Lemoh", "Lemoh Barat", "Lemoh Timur", "Lemoh Uner", "Lolah", "Lolah Dua", "Lolah Satu", "Lolah Tiga", "Ranotongkor", "Ranotongkor Timur"]
    },
    "Tombulu": {
        desa: ["Kamangta", "Kembes I", "Kembes II", "Koka", "Rumengkor", "Rumengkor Dua", "Rumengkor Satu", "Sawangan", "Suluan", "Tikela", "Tombuluan"]
    },
    "Tompaso": {
        desa: ["Kamanga", "Kamanga Dua", "Liba", "Sendangan", "Talikuran", "Tember", "Tempok", "Tempok Selatan", "Tolok", "Tolok Satu"]
    },
    "Tompaso Barat": {
        desa: ["Pinabetengan", "Pinabetengan Selatan", "Pinabetengan Utara", "Pinaesaan", "Tompaso Dua", "Tompaso Dua Utara", "Tonsewer", "Tonsewer Selatan", "Touure", "Touure Dua"]
    },
    "Tondano Barat": {
        kelurahan: ["Masarang", "Rerewokan", "Rinegetan", "Roong", "Tounkuramber", "Tuutu", "Watulambot", "Wawalintouan", "Wewelan"]
    },
    "Tondano Selatan": {
        kelurahan: ["Koya", "Maesa Unima", "Peleloan", "Tataaran I", "Tataaran II", "Tataaran Patar", "Tounsaru", "Urongo"]
    },
    "Tondano Timur": {
        kelurahan: ["Katinggolan", "Kendis", "Kiniar", "Liningaan", "Luaan", "Makalounsow", "Papakelan", "Ranowangko", "Taler", "Touluor", "Wengkol"]
    },
    "Tondano Utara": {
        kelurahan: ["Kampung Jawa", "Marawas", "Sasaran", "Sumalangka", "Wulauan"],
        desa: ["Kembuan", "Kembuan Satu", "Tonsea Lama"]
    }
};

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

function getIndonesianMonthName(monthIndex) {
    const monthNames = ["JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI", "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"];
    return monthNames[monthIndex];
}

function runSAW(data) {
    if (data.length === 0) return [];

    const quantifiedData = data.map(item => ({
        ...item,
        skorKerusakan: quantificationScores.kerusakan[item.tingkatKerusakan] || 0,
        skorJenis: quantificationScores.jenis[item.jenisBencana] || 0
    }));

    const maxValues = {
        jiwa: Math.max(1, ...quantifiedData.map(d => d.jiwaTerdampak)),
        kk: Math.max(1, ...quantifiedData.map(d => d.kkTerdampak)),
        kerusakan: Math.max(1, ...quantifiedData.map(d => d.skorKerusakan)),
        jenis: Math.max(1, ...quantifiedData.map(d => d.skorJenis))
    };

    const normalizedData = quantifiedData.map(item => ({
        ...item,
        normJiwa: (item.jiwaTerdampak || 0) / maxValues.jiwa,
        normKk: (item.kkTerdampak || 0) / maxValues.kk,
        normKerusakan: (item.skorKerusakan || 0) / maxValues.kerusakan,
        normJenis: (item.skorJenis || 0) / maxValues.jenis,
    }));

    const scoredData = normalizedData.map(item => {
        const score =
            (item.normJiwa * weights.jiwa) +
            (item.normKk * weights.kk) +
            (item.normKerusakan * weights.kerusakan) +
            (item.normJenis * weights.jenis);
        return { ...item, finalScore: score };
    });

    const sortedData = scoredData.sort((a, b) => b.finalScore - a.finalScore);

    return sortedData;
}

window.showRejectReason = function(reason) {
    Swal.fire({
        title: 'Alasan Penolakan',
        text: reason,
        icon: 'warning',
        confirmButtonText: 'Saya Mengerti, Saya akan Revisi',
        confirmButtonColor: '#e60013'
    });
};

function generateBencanaTable(data) {
    const rankedData = runSAW(data); 
    const tableBody = document.getElementById('report-table-body-bencana');
    tableBody.innerHTML = '';

    if (rankedData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-muted">Belum ada data bencana.</td></tr>`;
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

        const row = `
            <tr>
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

function generateInsidenTable(data) {
    const tableBody = document.getElementById('report-table-body-insiden');
    tableBody.innerHTML = '';

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">Belum ada laporan insiden.</td></tr>`;
        return;
    }

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

        const row = `
            <tr>
                <td class="fw-medium">${item.jenisBencana}</td>
                <td>${item.lokasi}</td>
                <td>${item.keterangan || '<span class="text-muted">N/A</span>'}</td>
                <td>${formatDate(item.disaster_date)}</td>
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

function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
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

    fetch('api/save_disaster.php', {
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
            const formBencana = document.getElementById('form-grup-bencana');
            const formInsiden = document.getElementById('form-grup-insiden');
            if(formBencana && formInsiden) {
                formBencana.style.display = 'block';
                formInsiden.style.display = 'none';
                document.getElementById('jiwaTerdampak').required = true;
                document.getElementById('kkTerdampak').required = true;
            }
            
            loadAndDisplayAllReports(); 
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

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    fetch('views/login.php', {
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

function populateYearDropdown() {
    const yearSelect = document.getElementById('filter-year');
    if (!yearSelect) return;

    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 2; 
    const endYear = currentYear + 2;   

    yearSelect.innerHTML = '';
    for (let y = startYear; y <= endYear; y++) {
        const option = document.createElement('option');
        option.value = y;
        option.textContent = y;
        if (y === currentYear) option.selected = true;
        yearSelect.appendChild(option);
    }
}

function filterDataByMonth(data, filterValue) {
    if (!filterValue) return data;
    return data.filter(item => {
        return item.disaster_date && item.disaster_date.startsWith(filterValue);
    });
}

function filterAndRenderReports() {
    const yearSelect = document.getElementById('filter-year');
    const monthSelect = document.getElementById('filter-month');
    
    if (!yearSelect || !monthSelect) return;

    const year = yearSelect.value;
    const month = monthSelect.value;
    
    let filterValue = year;
    if (month) {
        filterValue += '-' + month;
    }

    const filteredData = filterDataByMonth(allReportData, filterValue);

    const bencanaData = filteredData.filter(d => d.kategori_laporan === 'bencana' || !d.kategori_laporan);
    const insidenData = filteredData.filter(d => d.kategori_laporan === 'insiden');

    if ($.fn.DataTable.isDataTable('#disaster-report-table')) {
        $('#disaster-report-table').DataTable().destroy();
    }
    if ($.fn.DataTable.isDataTable('#insiden-report-table')) {
        $('#insiden-report-table').DataTable().destroy();
    }

    generateBencanaTable(bencanaData);
    generateInsidenTable(insidenData);

    setTimeout(function() {
        if (bencanaData.length > 0) {
            $('#disaster-report-table').DataTable({
                "pageLength": 5, "lengthMenu": [3, 5], "responsive": true, "order": [[0, "asc"]],
                "columnDefs": [ { "orderable": false, "targets": [1, 2, 3, 4, 5, 7, 8] } ],
                "language": { "search": "Cari:", "paginate": { "next": ">", "previous": "<" } }
            });
        }
        if (insidenData.length > 0) {
            $('#insiden-report-table').DataTable({
                "pageLength": 5, "lengthMenu": [3, 5], "responsive": true, "order": [[3, "desc"]],
                "columnDefs": [ { "orderable": false, "targets": [0, 1, 2, 4, 5] } ],
                "language": { "search": "Cari:", "paginate": { "next": ">", "previous": "<" } }
            });
        }
    }, 10);
}

function loadAndDisplayAllReports() {
    fetch('api/get_disasters.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                allReportData = data.data; 
                filterAndRenderReports(); 
            } else {
                console.error('Error loading data:', data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

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
                window.location.href = 'views/logout.php';
            });
        }
    });
}

const kecamatanSelect = document.getElementById('kecamatan');
const lokasiSelect = document.getElementById('lokasi');
if (kecamatanSelect && lokasiSelect) {
    Object.keys(minahasaLocations).forEach(kecamatan => {
        const option = document.createElement('option');
        option.value = kecamatan;
        option.textContent = kecamatan;
        kecamatanSelect.appendChild(option);
    });

    kecamatanSelect.addEventListener('change', function() {
        const selectedKecamatan = this.value;
        lokasiSelect.innerHTML = '<option value="">Pilih Desa/Kelurahan</option>';

        if (selectedKecamatan && minahasaLocations[selectedKecamatan]) {
            const villages = minahasaLocations[selectedKecamatan];

            if (villages.desa) {
                villages.desa.forEach(location => {
                    const option = document.createElement('option');
                    option.value = `Desa ${location}, Kec. ${selectedKecamatan}`;
                    option.textContent = `Desa ${location}`;
                    lokasiSelect.appendChild(option);
                });
            }

            if (villages.kelurahan) {
                villages.kelurahan.forEach(location => {
                    const option = document.createElement('option');
                    option.value = `Kelurahan ${location}, Kec. ${selectedKecamatan}`;
                    option.textContent = `Kelurahan ${location}`;
                    lokasiSelect.appendChild(option);
                });
            }
        }
    });
}

function handlePrintReport() {
    const year = document.getElementById('filter-year').value;
    const month = document.getElementById('filter-month').value;

    const isViews = window.location.pathname.includes('/views/');
    const uploadsPath = isViews ? '../uploads/' : 'uploads/';
    
    const logoKabUrl = new URL(uploadsPath + 'logokab-minahasa.png', window.location.href).href;
    const logoBpbdUrl = new URL(uploadsPath + 'logobpbd-minahasa.png', window.location.href).href;

    let filterValue = year;
    if (month) filterValue += '-' + month;

    const filteredData = filterDataByMonth(allReportData, filterValue);
    const bencanaData = filteredData.filter(
        d => d.kategori_laporan === 'bencana' || !d.kategori_laporan
    );
    const rankedData = runSAW(bencanaData);

    let periodText = `Tahun ${year}`;
    if (month) {
        periodText = `Bulan ${getIndonesianMonthName(parseInt(month) - 1)} ${year}`;
    }

    const today = new Date();
    const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const reportDate = `${today.getDate()} ${monthNames[today.getMonth()]} ${today.getFullYear()}`;

    let tableRows = '';

    if (rankedData.length === 0) {
        tableRows = `
            <tr>
                <td colspan="9" style="padding: 20px; text-align: center;">
                    Tidak ada data laporan untuk periode ini.
                </td>
            </tr>
        `;
    } else {
        rankedData.forEach((item, index) => {
            let photoCell = `
                <div style="font-size: 10px; color: #666;">
                    Tidak ada foto
                </div>
            `;

            if (item.photos && item.photos.length > 0) {
                const imageUrl = new URL(
                    item.photos[0].file_path,
                    window.location.href
                ).href;

                photoCell = `
                    <img 
                        src="${imageUrl}" 
                        alt="Foto Bencana"
                        style="width: 100px; height: 70px; object-fit: cover;"
                    >
                `;
            }

            tableRows += `
                <tr style="page-break-inside: avoid;">
                    <td style="text-align: center;">${index + 1}</td>
                    <td>${item.jenisBencana}</td>
                    <td>${item.lokasi}</td>
                    <td style="text-align: center;">${formatDate(item.disaster_date)}</td>
                    <td style="text-align: center;">${item.jiwaTerdampak}</td>
                    <td style="text-align: center;">${item.kkTerdampak}</td>
                    <td>${item.tingkatKerusakan}</td>
                    <td style="font-weight: bold; text-align: center;">
                        ${item.finalScore.toFixed(4)}
                    </td>
                    <td style="text-align: center;">
                        ${photoCell}
                    </td>
                </tr>
            `;
        });
    }

    const printContent = `
        <style>
            @page {
                size: A4;
                margin: 20mm;
            }

            body {
                font-family: Arial, sans-serif;
                font-size: 14px;
                color: #000;
            }

            table {
                width: 100%;
                border-collapse: collapse;
            }

            th, td {
                border: 1px solid #000;
                padding: 6px;
                vertical-align: middle;
            }

            thead {
                display: table-header-group;
            }

            .header {
                margin-bottom: 20px;
            }

            .title {
                text-align: center;
                font-weight: bold;
                text-decoration: underline;
                margin: 20px 0 5px;
            }

            .periode {
                text-align: center;
                margin-bottom: 20px;
            }

            .signature-wrapper {
                margin-top: 30px;
                display: flex;
                justify-content: flex-end;
                page-break-inside: avoid;
            }

            .signature {
                width: 300px;
                text-align: center;
                line-height: 1.3;
            }
        </style>

        <div class="header">
            <table style="width: 100%; border-collapse: collapse; border: none;">
                <tr>
                    <td style="width: 80px; text-align: left; vertical-align: middle; border: none;">
                        <img
                            src="${logoKabUrl}" 
                            alt="Logo Kabupaten Minahasa"
                            style="width: 70px; height: auto;"
                        >
                    </td>

                        <td style="text-align: center; vertical-align: middle; border: none;">
                            <div style="font-size: 14px; font-weight: bold;">
                                PEMERINTAH KABUPATEN MINAHASA
                            </div>
                            <div style="font-size: 16px; font-weight: bold;">
                                BADAN PENANGGULANGAN BENCANA DAERAH
                            </div>
                            <div style="font-size: 9px; margin-top: 3px;">
                                Alamat: Kompleks Stadion Maesa Kelurahan Wewelen (Tondano)
                            </div>
                            <div style="font-size: 9px;">
                                Website: www.minahasa.go.id E-mail: pemkab.minahasa@minahasa.go.id
                            </div>
                        </td>

                    <td style="width: 80px; text-align: right; vertical-align: middle; border: none;">
                        <img
                            src="${logoBpbdUrl}" 
                            alt="Logo BPBD"
                            style="width: 70px; height: auto;"
                        >
                    </td>
                </tr>
            </table>

            <hr style="border: 1px solid #000; margin-top: 8px;">
        </div>

        <div class="title">
            LAPORAN REKAPITULASI DAN PRIORITAS DAMPAK BENCANA
        </div>

        <div class="periode">
            Periode: ${periodText}
        </div>

        <table>
            <thead>
                <tr style="background-color: #f2f2f2;">
                    <th style="width: 5%;">Peringkat</th>
                    <th style="width: 15%;">Jenis Bencana</th>
                    <th style="width: 18%;">Lokasi</th>
                    <th style="width: 10%;">Tanggal</th>
                    <th style="width: 8%;">Jiwa</th>
                    <th style="width: 8%;">KK</th>
                    <th style="width: 12%;">Kerusakan</th>
                    <th style="width: 10%;">Indeks Dampak</th>
                    <th style="width: 14%;">Dokumentasi</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>

        <div class="signature-wrapper">
            <div class="signature">
                <div style="margin-bottom: 60px;">
                    Tondano, ${reportDate}<br><br>
                    Kepala Badan Penanggulangan Bencana<br>
                    Daerah Kabupaten Minahasa
                </div>

                <div style="font-weight: bold; text-decoration: underline;">
                    LONA O.K. WATTIE, S.STP, M.AP
                </div>
                <div>
                    Pembina Utama Muda, IV/c
                </div>
                <div>
                    NIP. 19791007 199810 1001
                </div>
            </div>
        </div>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    iframe.contentDocument.write(printContent);
    iframe.contentWindow.print();
    setTimeout(() => {
        document.body.removeChild(iframe);
    }, 1000);
}

function handlePrintInsidenReport() {
    const year = document.getElementById('filter-year').value;
    const month = document.getElementById('filter-month').value;
    
    const isViews = window.location.pathname.includes('/views/');
    const uploadsPath = isViews ? '../uploads/' : 'uploads/';
    
    const logoKabUrl = new URL(uploadsPath + 'logokab-minahasa.png', window.location.href).href;
    const logoBpbdUrl = new URL(uploadsPath + 'logobpbd-minahasa.png', window.location.href).href;

    let filterValue = year;
    if (month) filterValue += '-' + month;

    const filteredData = filterDataByMonth(allReportData, filterValue);
    const insidenData = filteredData.filter(d => d.kategori_laporan === 'insiden');
    insidenData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    let periodText = `Tahun ${year}`;
    if (month) {
        periodText = `Bulan ${getIndonesianMonthName(parseInt(month) - 1)} ${year}`;
    }

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
                photoCell = `<img src="${imageUrl}" alt="Foto Insiden" style="width: 100px; height: 70px; object-fit: cover;">`;
            }
            tableRows += `
                <tr>
                    <td style="text-align: left;">${item.jenisBencana}</td>
                    <td style="text-align: left;">${item.lokasi}</td>
                    <td style="text-align: left; font-size: 11px;">${item.keterangan || 'N/A'}</td>
                    <td style="text-align: center;">${formatDate(item.disaster_date)}</td>
                    <td style="text-align: center;">${photoCell}</td>
                </tr>`;
        });
    }

    const printContent = `
        <style>
            @page {
                size: A4;
                margin: 20mm;
            }

            body {
                font-family: Arial, sans-serif;
                font-size: 14px;
                color: #000;
            }

            table {
                width: 100%;
                border-collapse: collapse;
            }

            th, td {
                border: 1px solid #000;
                padding: 6px;
                vertical-align: middle;
            }

            thead {
                display: table-header-group;
            }

            .header {
                margin-bottom: 20px;
            }

            .title {
                text-align: center;
                font-weight: bold;
                text-decoration: underline;
                margin: 20px 0 5px;
            }

            .periode {
                text-align: center;
                margin-bottom: 20px;
            }

            .signature-wrapper {
                margin-top: 30px;
                display: flex;
                justify-content: flex-end;
                page-break-inside: avoid;
            }

            .signature {
                width: 300px;
                text-align: center;
                line-height: 1.3;
            }
        </style>

        <div class="header">
            <table style="width: 100%; border-collapse: collapse; border: none;">
                <tr>
                    <td style="width: 80px; text-align: left; vertical-align: middle; border: none;">
                        <img
                            src="${logoKabUrl}"
                            alt="Logo Kabupaten Minahasa"
                            style="width: 70px; height: auto;"
                        >
                    </td>

                    <td style="text-align: center; vertical-align: middle; border: none;">
                        <div style="font-size: 14px; font-weight: bold;">
                            PEMERINTAH KABUPATEN MINAHASA
                        </div>
                        <div style="font-size: 16px; font-weight: bold;">
                            BADAN PENANGGULANGAN BENCANA DAERAH
                        </div>
                        <div style="font-size: 9px; margin-top: 3px;">
                            Alamat: Kompleks Stadion Maesa Kelurahan Wewelen (Tondano)
                        </div>
                        <div style="font-size: 9px;">
                            Website: www.minahasa.go.id E-mail: pemkab.minahasa@minahasa.go.id
                        </div>
                    </td>

                    <td style="width: 80px; text-align: right; vertical-align: middle; border: none;">
                        <img
                            src="${logoBpbdUrl}"
                            alt="Logo BPBD"
                            style="width: 70px; height: auto;"
                        >
                    </td>
                </tr>
            </table>

            <hr style="border: 1px solid #000; margin-top: 8px;">
        </div>

        <div class="title">LAPORAN REKAPITULASI INSIDEN DARURAT</div>
        <div class="periode">Periode: ${periodText}</div>

        <table>
            <thead>
                <tr style="background-color: #f2f2f2;">
                    <th style="width: 20%;">Jenis Insiden</th>
                    <th style="width: 20%;">Lokasi</th>
                    <th style="width: 30%;">Keterangan</th>
                    <th style="width: 15%;">Tanggal</th>
                    <th style="width: 15%;">Dokumentasi</th>
                </tr>
            </thead>
            <tbody>${tableRows}</tbody>
        </table>

        <div class="signature-wrapper">
            <div class="signature">
                <div style="margin-bottom: 60px;">
                    Tondano, ${reportDate}<br><br>
                    Kepala Badan Penanggulangan Bencana<br>
                    Daerah Kabupaten Minahasa
                </div>

                <div style="font-weight: bold; text-decoration: underline;">
                    LONA O.K. WATTIE, S.STP, M.AP
                </div>
                <div>
                    Pembina Utama Muda, IV/c
                </div>
                <div>
                    NIP. 19791007 199810 1001
                </div>
            </div>
        </div>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    iframe.contentDocument.write(printContent);
    iframe.contentWindow.print();
    
    setTimeout(() => {
        document.body.removeChild(iframe);
    }, 1000);
}

function handlePrintCumulativeReport() {
    const selectedYear = document.getElementById('filter-year').value;
    
    const isViews = window.location.pathname.includes('/views/');
    const uploadsPath = isViews ? '../uploads/' : 'uploads/';
    
    const logoKabUrl = new URL(uploadsPath + 'logokab-minahasa.png', window.location.href).href;
    const logoBpbdUrl = new URL(uploadsPath + 'logobpbd-minahasa.png', window.location.href).href;

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

<div style="width: 100%; margin-bottom: 10px;">
    <table style="width: 100%; border-collapse: collapse; border: none;">
        <tr>
            <td style="width: 80px; text-align: left; vertical-align: middle; border: none;">
                <img 
                    src="${logoKabUrl}" 
                    alt="Logo Kabupaten Minahasa"
                    style="width: 70px; height: auto;"
                >
            </td>

            <td style="text-align: center; vertical-align: middle; border: none;">
                <div style="font-size: 16px; font-weight: bold;">
                    PEMERINTAH KABUPATEN MINAHASA
                </div>
                <div style="font-size: 18px; font-weight: bold;">
                    BADAN PENANGGULANGAN BENCANA DAERAH
                </div>
                <div style="font-size: 10px; margin-top: 4px;">
                    Alamat: Kompleks Stadion Maesa Kelurahan Wewelen (Tondano)
                </div>
                <div style="font-size: 10px;">
                    Website: www.minahasa.go.id E-mail: pemkab.minahasa@minahasa.go.id
                </div>
            </td>

            <td style="width: 80px; text-align: right; vertical-align: middle; border: none;">
                <img 
                    src="${logoBpbdUrl}" 
                    alt="Logo BPBD"
                    style="width: 70px; height: auto;"
                >
            </td>
        </tr>
    </table>

    <hr style="border: px solid #000; margin-top: 8px;">
</div>

    <div style="text-align: center; margin-bottom: 15px;">
        <div style="font-size: 14px; font-weight: bold; text-decoration: underline;">
            REKAPITULASI DATA LAPORAN KEJADIAN BENCANA TAHUN ${selectedYear}
        </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <thead>
            <tr style="background-color: #e0e0e0;">
                <th style="border: 1px solid #000; padding: 5px; width: 30px;">NO</th>
                <th style="border: 1px solid #000; padding: 5px;">BULAN</th>
                ${disasterColumns.map(col =>
                    `<th style="border: 1px solid #000; padding: 5px; font-size: 10px;">${col.label}</th>`
                ).join('')}
                <th style="border: 1px solid #000; padding: 5px;">TOTAL</th>
            </tr>
        </thead>
        <tbody>
            ${tableRows}
            ${grandTotalRow}
        </tbody>
    </table>

    <div style="margin-top: 10px; display: flex; justify-content: space-between; page-break-inside: avoid;">

        <div style="width: 40%; text-align: center;">
            <div style="margin-bottom: 60px; line-height: 1.3;">
                Tondano, ${reportDateString}<br>
                Kepala Badan Penanggulangan Bencana<br>
                Daerah Kabupaten Minahasa
            </div>

            <div style="font-weight: bold; text-decoration: underline; line-height: 1.2;">
                LONA O.K. WATTIE, S.STP, M.AP
            </div>
            <div style="line-height: 1.2;">
                Pembina Utama Muda, IV/c
            </div>
            <div style="line-height: 1.2;">
                Nip. 19791007 199810 1001
            </div>
        </div>

        <div style="width: 40%; text-align: center; margin-top: 18px;">
            <div style="margin-bottom: 60px; line-height: 1.3;">
                Kabid Kedaruratan dan Logistik
            </div>

            <div style="font-weight: bold; text-decoration: underline; line-height: 1.2;">
                JELLY N. BOKAU, S.ST
            </div>
            <div style="line-height: 1.2;">
                Pembina Tkt I, IV/b
            </div>
            <div style="line-height: 1.2;">
                Nip. 19680702 199003 2007
            </div>
        </div>

    </div>
</div>
`;


    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    iframe.contentDocument.write(printContent);
    iframe.contentWindow.print();
    setTimeout(() => {
        document.body.removeChild(iframe);
    }, 1000);
}

function handlePrintImpactReport() {
    const selectedYear = document.getElementById('filter-year').value;
    
    const isViews = window.location.pathname.includes('/views/');
    const uploadsPath = isViews ? '../uploads/' : 'uploads/';
    
    const logoKabUrl = new URL(uploadsPath + 'logokab-minahasa.png', window.location.href).href;
    const logoBpbdUrl = new URL(uploadsPath + 'logobpbd-minahasa.png', window.location.href).href;

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

    <div style="margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse; border: none;">
            <tr>
                <td style="width: 80px; text-align: left; vertical-align: middle; border: none;">
                    <img 
                        src="${logoKabUrl}" 
                        alt="Logo Kabupaten Minahasa"
                        style="width: 70px; height: auto;"
                    >
                </td>

                <td style="text-align: center; vertical-align: middle; border: none;">
                    <div style="font-size: 14px; font-weight: bold;">
                        PEMERINTAH KABUPATEN MINAHASA
                    </div>
                    <div style="font-size: 16px; font-weight: bold;">
                        BADAN PENANGGULANGAN BENCANA DAERAH
                    </div>
                    <div style="font-size: 9px; margin-top: 3px;">
                        Alamat: Kompleks Stadion Maesa Kelurahan Wewelen (Tondano)
                    </div>
                    <div style="font-size: 9px;">
                        Website: www.minahasa.go.id E-mail: pemkab.minahasa@minahasa.go.id
                    </div>
                </td>

                <td style="width: 80px; text-align: right; vertical-align: middle; border: none;">
                    <img 
                        src="${logoBpbdUrl}" 
                        alt="Logo BPBD Minahasa"
                        style="width: 70px; height: auto;"
                    >
                </td>
            </tr>
        </table>

        <hr style="border: 1px solid #000; margin-top: 8px;">
    </div>

    <div style="text-align: center; margin-bottom: 15px;">
        <div style="font-size: 12px; font-weight: bold; text-decoration: underline;">
            REKAPITULASI DATA LAPORAN KORBAN TERDAMPAK BENCANA TAHUN ${selectedYear}
        </div>
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
        <tbody>
            ${tableRows}
            ${grandTotalRow}
        </tbody>
    </table>

    <div style="margin-top: 12px; display: flex; justify-content: space-between; page-break-inside: avoid;">

        <div style="width: 40%; text-align: center;">
            <div style="margin-bottom: 50px; line-height: 1.3;">
                Mengetahui<br>
                Kepala Badan Penanggulangan Bencana<br>
                Daerah Kabupaten Minahasa
            </div>

            <div style="font-weight: bold; text-decoration: underline; line-height: 1.2;">
                LONA O.K. WATTIE, S.STP, M.AP
            </div>
            <div style="line-height: 1.2;">
                Pembina Utama Muda, IV/c
            </div>
            <div style="line-height: 1.2;">
                Nip. 19791007 199810 1001
            </div>
        </div>

        <div style="width: 40%; text-align: center;">
            <div style="margin-bottom: 50px; line-height: 1.3;">
                Tondano, ${reportDateString}<br><br>
                Kabid Kedaruratan dan Logistik
            </div>

            <div style="font-weight: bold; text-decoration: underline; line-height: 1.2;">
                JELLY N. BOKAU, S.ST
            </div>
            <div style="line-height: 1.2;">
                Pembina Tkt I, IV/b
            </div>
            <div style="line-height: 1.2;">
                Nip. 19680702 199003 2007
            </div>
        </div>

    </div>
</div>
`;


    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    iframe.contentDocument.write(printContent);
    iframe.contentWindow.print();
    setTimeout(() => {
        document.body.removeChild(iframe);
    }, 1000);
}

function handleConfirmPrint() {
    const previewContent = document.getElementById('preview-content');
    let printContent = previewContent.innerHTML;
    
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
                    <base href="${window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1)}">
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
    
    const modalElement = document.getElementById('preview-modal');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    populateYearDropdown();

    const today = new Date();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
    
    const monthSelect = document.getElementById('filter-month');
    if (monthSelect) monthSelect.value = currentMonth; 

    const yearSelect = document.getElementById('filter-year');
    if (yearSelect) yearSelect.addEventListener('change', filterAndRenderReports);
    if (monthSelect) monthSelect.addEventListener('change', filterAndRenderReports);

    loadAndDisplayAllReports();

    const validateLink = document.getElementById('validate-link');
    if (validateLink) {
        validateLink.addEventListener('click', function(e) {
            
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
            } else { 
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

    document.addEventListener('click', function(e) {
        if (e.target.closest('.edit-btn')) {
            const id = e.target.closest('.edit-btn').getAttribute('data-id');
            
            fetch(`api/get_single_disaster.php?id=${id}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const disaster = data.data; 
                        const photos = data.data.photos; 
                        
                        document.getElementById('edit-disaster-id').value = disaster.id;
                        
                        // --- NEW: PARSE LOCATION STRING ---
                        // Format expected: "Desa Name, Kec. Name" or "Kelurahan Name, Kec. Name"
                        const fullLoc = disaster.lokasi || "";
                        let kecFound = "";
                        let kelFound = fullLoc; // Default fallback

                        // Try to extract Kecamatan from string (e.g. split by ", Kec. ")
                        if (fullLoc.includes(", Kec. ")) {
                            const parts = fullLoc.split(", Kec. ");
                            if (parts.length > 1) {
                                kecFound = parts[1].trim(); // "Tombulu"
                                kelFound = fullLoc; // Full string matches the option value
                            }
                        }

                        // 1. Set Kecamatan
                        if (editKecSelect) {
                            editKecSelect.value = kecFound;
                            // Trigger change event manually to populate Kelurahan
                            editKecSelect.dispatchEvent(new Event('change'));
                            
                            // 2. Set Kelurahan (after options are populated)
                            // We need a small timeout or direct execution since the event is synchronous
                            if (editKelSelect) {
                                editKelSelect.value = kelFound;
                            }
                        }
                        // ----------------------------------

                        document.getElementById('edit-disasterDate').value = disaster.disaster_date;
                        document.getElementById('edit-lokasi').value = disaster.lokasi;
                        document.getElementById('edit-disasterDate').value = disaster.disaster_date;
                        document.getElementById('edit-keterangan').value = disaster.keterangan || '';

                        const photoInput = document.querySelector('#edit-disaster-form input[type="file"]');
                        if (photoInput) photoInput.value = '';

                        const isInsiden = disaster.kategori_laporan === 'insiden';
                        const selectEl = document.getElementById('edit-jenisBencana');
                        const fieldBencana = document.querySelectorAll('.field-bencana');
                        
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

                        if (isInsiden) {
                            fieldBencana.forEach(el => el.style.display = 'none');
                        } else {
                            fieldBencana.forEach(el => el.style.display = 'block');
                            document.getElementById('edit-jiwaTerdampak').value = disaster.jiwaTerdampak;
                            document.getElementById('edit-kkTerdampak').value = disaster.kkTerdampak;
                            document.getElementById('edit-tingkatKerusakan').value = disaster.tingkatKerusakan;
                        }

                        const photoContainer = document.getElementById('edit-existing-photos');
                        const photoWrapper = document.getElementById('edit-existing-photos-container');
                        
                        if (photoContainer && photoWrapper) {
                            photoContainer.innerHTML = ''; 
                            
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

    document.addEventListener('click', function(e) {
        if (e.target.closest('.delete-btn')) {
            const id = e.target.closest('.delete-btn').getAttribute('data-id');
            handleDeleteDisaster(id);
        }
    });

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

            fetch('api/delete_disaster.php', {
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
                    loadAndDisplayAllReports(); 
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

const editForm = document.getElementById('edit-disaster-form');
    if (editForm) {
        editForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // --- NEW: COMBINE DROPDOWNS INTO HIDDEN INPUT ---
            // The value of editKelSelect is already "Desa X, Kec. Y"
            const finalLoc = document.getElementById('edit-kelurahan').value;
            document.getElementById('edit-lokasi-combined').value = finalLoc;
            // ------------------------------------------------
            
            const form = event.target;
            const formData = new FormData(form);
            const modalElement = document.getElementById('edit-modal');
            const modal = bootstrap.Modal.getInstance(modalElement);

            fetch('api/edit_disaster.php', {
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
                    loadAndDisplayAllReports(); 
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

    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-bs-target="#photo-modal"]')) {
            const imgSrc = e.target.getAttribute('data-photo-src');
            const imgTitle = e.target.getAttribute('data-photo-title');
            document.getElementById('photo-modal-image').src = imgSrc;
            document.getElementById('photoModalLabel').textContent = imgTitle || 'Foto Bencana';
        }
    });
});

// --- 1. SETUP EDIT DROPDOWNS ---
    const editKecSelect = document.getElementById('edit-kecamatan');
    const editKelSelect = document.getElementById('edit-kelurahan');

    // Populate Kecamatan Dropdown
    if (editKecSelect) {
        Object.keys(minahasaLocations).forEach(kec => {
            const opt = document.createElement('option');
            opt.value = kec;
            opt.textContent = kec;
            editKecSelect.appendChild(opt);
        });

        // Handle Change Event (Cascade)
        editKecSelect.addEventListener('change', function() {
            const selectedKec = this.value;
            editKelSelect.innerHTML = '<option value="">Pilih Desa/Kelurahan</option>';

            if (selectedKec && minahasaLocations[selectedKec]) {
                const data = minahasaLocations[selectedKec];
                
                if (data.desa) {
                    data.desa.forEach(d => {
                        const val = `Desa ${d}, Kec. ${selectedKec}`; // Format standard
                        const opt = document.createElement('option');
                        opt.value = val;
                        opt.textContent = `Desa ${d}`;
                        opt.setAttribute('data-pure-name', `Desa ${d}`); // Helper for matching
                        editKelSelect.appendChild(opt);
                    });
                }
                if (data.kelurahan) {
                    data.kelurahan.forEach(k => {
                        const val = `Kelurahan ${k}, Kec. ${selectedKec}`;
                        const opt = document.createElement('option');
                        opt.value = val;
                        opt.textContent = `Kelurahan ${k}`;
                        opt.setAttribute('data-pure-name', `Kelurahan ${k}`);
                        editKelSelect.appendChild(opt);
                    });
                }
            }
        });
    }