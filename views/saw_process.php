<?php
session_start();
require_once '../config/config.php';

// Check if user is logged in
$loggedIn = isset($_SESSION['user_id']);
$userRole = $_SESSION['role'] ?? 'user';
$username = $_SESSION['username'] ?? '';

if (!$loggedIn) {
    // For debugging: show a message instead of redirecting
    echo "<div style='padding: 20px; background: #f8f9fa; border: 1px solid #dee2e6; margin: 20px;'>";
    echo "<h3>Access Denied</h3>";
    echo "<p>You need to be logged in to access this page.</p>";
    echo "<a href='index.php' class='btn btn-primary'>Go to Login</a>";
    echo "</div>";
    exit;
}

// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Proses Perhitungan SAW - BPBD</title>
    <link rel="icon" href="uploads/logobpbd-minahasa.png" type="image/png">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.datatables.net/2.0.8/css/dataTables.bootstrap5.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="login.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11.10.1/dist/sweetalert2.min.css">
    <style>
        body {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
            font-family: 'Inter', sans-serif;
        }

        .hero-section {
            background: linear-gradient(135deg, #00499d 0%, #0066cc 100%);
            color: white;
            padding: 3rem 0;
            margin-bottom: 2rem;
            border-radius: 0 0 50px 50px;
            box-shadow: 0 4px 20px rgba(0, 73, 157, 0.15);
        }

        .hero-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .hero-subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 1rem;
        }

        .content-card {
            background: white;
            border-radius: 20px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 2px 10px rgba(0, 73, 157, 0.1);
            border: none;
            transition: all 0.3s ease;
        }

        .content-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 20px rgba(0, 73, 157, 0.15);
        }

        .card-header-custom {
            background: linear-gradient(135deg, #00499d 0%, #0066cc 100%);
            color: white;
            padding: 1.5rem;
            border-radius: 15px 15px 0 0;
            margin: -2rem -2rem 1.5rem -2rem;
        }

        .card-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .step-container {
            position: relative;
            margin-bottom: 2rem;
        }

        .step-number {
            position: absolute;
            left: -20px;
            top: 0;
            width: 40px;
            height: 40px;
            background: #00499d;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 1.2rem;
            box-shadow: 0 2px 10px rgba(0, 73, 157, 0.1);
        }

        .step-content {
            margin-left: 30px;
            padding: 1.5rem;
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
            border-radius: 15px;
            border-left: 4px solid #00499d;
        }

        .formula-box {
            background: linear-gradient(135deg, #00499d 0%, #0066cc 100%);
            color: white;
            padding: 1.5rem;
            border-radius: 15px;
            margin: 1rem 0;
            font-family: 'Courier New', monospace;
            box-shadow: 0 2px 10px rgba(0, 73, 157, 0.1);
        }

        .highlight-cell {
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            font-weight: bold;
            color: #856404;
            border: 2px solid #ffc107;
        }

        .table-custom {
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 73, 157, 0.1);
        }

        .table-custom thead th {
            background: linear-gradient(135deg, #00499d 0%, #0066cc 100%);
            color: white;
            border: none;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85rem;
            letter-spacing: 0.5px;
            padding: 1rem;
        }

        .table-custom tbody tr:hover {
            background-color: rgba(0, 73, 157, 0.05);
            transform: scale(1.01);
            transition: all 0.2s ease;
        }

        .ranking-badge {
            background: linear-gradient(135deg, #e60013 0%, #ff4757 100%);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 0.5rem;
        }

        .calculation-result {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 2rem;
            border-radius: 15px;
            text-align: center;
            margin-top: 2rem;
            box-shadow: 0 4px 20px rgba(0, 73, 157, 0.15);
        }

        .btn-custom {
            background: linear-gradient(135deg, #00499d 0%, #0066cc 100%);
            border: none;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 25px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 2px 10px rgba(0, 73, 157, 0.1);
        }

        .btn-custom:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 20px rgba(0, 73, 157, 0.15);
            color: white;
        }

        .alert-custom {
            background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
            border: 1px solid #c3e6cb;
            border-radius: 15px;
            padding: 1.5rem;
            margin: 1rem 0;
        }

        .info-box {
            background: linear-gradient(135deg, #cce7ff 0%, #b3d9ff 100%);
            border: 1px solid #b3d9ff;
            border-radius: 15px;
            padding: 1.5rem;
            margin: 1rem 0;
        }

        .icon-large {
            width: 2rem;
            height: 2rem;
            margin-right: 0.5rem;
        }
    </style>
</head>
<body class="logged-in">
    <div id="main-content" class="p-4 p-md-5">
        <div class="container">
            <header class="bpbd-header shadow-sm rounded p-4 mb-4">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <div class="header-logo me-3">
                            <img src="uploads/logobpbd-minahasa.png" alt="BPBD Logo" class="header-bpbd-logo">
                        </div>
                        <div>
                            <h1 class="h2 h1-md fw-bold text-dark mb-1">Proses Perhitungan SAW</h1>
                            <p class="text-muted mb-0">Simple Additive Weighting untuk Prioritas Bencana</p>
                            <p class="text-muted small mb-0">Selamat datang, <?php echo htmlspecialchars($username); ?> (<?php echo htmlspecialchars($userRole); ?>)</p>
                        </div>
                    </div>
                    <div>
                        <a href="../index.php" class="btn btn-bpbd-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left me-1" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 1-.708.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                            </svg>
                            Kembali ke Dashboard
                        </a>
                    </div>
                </div>
            </header>

            <!-- Hero Section -->
            <div class="hero-section text-center">
                <div class="container">
                    <h1 class="hero-title">Proses Perhitungan SAW</h1>
                    <p class="hero-subtitle">Simple Additive Weighting untuk Prioritas Bencana</p>
                    <div class="mt-4">
                        <span class="badge bg-white text-primary px-3 py-2 fs-6">Metode Multi-Kriteria</span>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-12">
                    <!-- Introduction Card -->
                    <div class="content-card">
                        <div class="card-header-custom">
                            <h2 class="card-title">
                                <svg class="icon-large" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                    <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                                </svg>
                                Apa itu Metode SAW?
                            </h2>
                        </div>
                        <p class="mb-3 fs-5">
                            <strong>Simple Additive Weighting (SAW)</strong> adalah metode pengambilan keputusan multi-kriteria yang digunakan untuk menentukan prioritas bencana berdasarkan beberapa kriteria yang telah ditentukan bobotnya.
                        </p>
                        <div class="info-box">
                            <strong>🎯 Tujuan:</strong> Menentukan ranking prioritas bencana berdasarkan dampaknya terhadap masyarakat, dengan mempertimbangkan faktor-faktor seperti jumlah jiwa terdampak, jumlah KK terdampak, tingkat kerusakan, dan jenis bencana.
                        </div>
                    </div>

                    <!-- Criteria Weights Card -->
                    <div class="content-card">
                        <div class="card-header-custom">
                            <h2 class="card-title">
                                <svg class="icon-large" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M2 3.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 0 0-1h-11A1.5 1.5 0 0 0 1 3.5v9A1.5 1.5 0 0 0 2.5 14h11a.5.5 0 0 0 0-1h-11A.5.5 0 0 1 2 12.5v-9z"/>
                                    <path d="M8 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0-8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                                </svg>
                                Bobot Kriteria
                            </h2>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-custom">
                                <thead>
                                    <tr>
                                        <th>Kriteria</th>
                                        <th>Bobot</th>
                                        <th>Keterangan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Jumlah Jiwa Terdampak</strong></td>
                                        <td><span class="badge bg-primary">40%</span></td>
                                        <td>Dampak terhadap individu</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Jumlah KK Terdampak</strong></td>
                                        <td><span class="badge bg-success">25%</span></td>
                                        <td>Dampak terhadap keluarga</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Tingkat Kerusakan</strong></td>
                                        <td><span class="badge bg-warning">20%</span></td>
                                        <td>Kerugian material</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Jenis Bencana</strong></td>
                                        <td><span class="badge bg-info">15%</span></td>
                                        <td>Potensi bahaya dan kompleksitas</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Quantification Scores Card -->
                    <div class="content-card">
                        <div class="card-header-custom">
                            <h2 class="card-title">
                                <svg class="icon-large" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
                                </svg>
                                Skor Kuantifikasi Kriteria Kualitatif
                            </h2>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <h5 class="text-center mb-3">🏗️ Tingkat Kerusakan</h5>
                                <table class="table table-custom table-sm">
                                    <tbody>
                                        <tr><td><strong>Ringan</strong></td><td><span class="badge bg-success">1</span></td></tr>
                                        <tr><td><strong>Sedang</strong></td><td><span class="badge bg-warning">2</span></td></tr>
                                        <tr><td><strong>Berat</strong></td><td><span class="badge bg-danger">3</span></td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <h5 class="text-center mb-3">🌪️ Jenis Bencana</h5>
                                <table class="table table-custom table-sm">
                                    <tbody>
                                        <tr><td><strong>Angin Puting Beliung</strong></td><td><span class="badge bg-success">1</span></td></tr>
                                        <tr><td><strong>Banjir</strong></td><td><span class="badge bg-info">2</span></td></tr>
                                        <tr><td><strong>Kebakaran</strong></td><td><span class="badge bg-info">2</span></td></tr>
                                        <tr><td><strong>Tanah Longsor</strong></td><td><span class="badge bg-warning">3</span></td></tr>
                                        <tr><td><strong>Kebakaran Hutan</strong></td><td><span class="badge bg-warning">3</span></td></tr>
                                        <tr><td><strong>Gempa Bumi</strong></td><td><span class="badge bg-danger">4</span></td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Calculation Steps Card -->
                    <div class="content-card">
                        <div class="card-header-custom">
                            <h2 class="card-title">
                                <svg class="icon-large" fill="currentColor" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.5.5 0 0 1 .5.5v5.21l2.25-2.25a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 0 0 .708.708L7.5 9.71V4.5A.5.5 0 0 1 8 4z"/>
                                </svg>
                                Langkah-langkah Perhitungan SAW
                            </h2>
                        </div>

                        <div class="step-container">
                            <div class="step-number">1</div>
                            <div class="step-content">
                                <h5 class="text-primary mb-3">📊 Kuantifikasi Data</h5>
                                <p>Mengubah data kualitatif menjadi kuantitatif menggunakan skor yang telah ditentukan.</p>
                                <div class="formula-box">
                                    <strong>Rumus:</strong><br>
                                    skorKerusakan = quantificationScores.kerusakan[tingkatKerusakan]<br>
                                    skorJenis = quantificationScores.jenis[jenisBencana]
                                </div>
                            </div>
                        </div>

                        <div class="step-container">
                            <div class="step-number">2</div>
                            <div class="step-content">
                                <h5 class="text-primary mb-3">⚖️ Normalisasi Data</h5>
                                <p>Normalisasi nilai setiap kriteria dengan membaginya dengan nilai maksimum kriteria tersebut.</p>
                                <div class="formula-box">
                                    <strong>Rumus:</strong><br>
                                    normJiwa = jiwaTerdampak / maxJiwa<br>
                                    normKK = kkTerdampak / maxKK<br>
                                    normKerusakan = skorKerusakan / maxKerusakan<br>
                                    normJenis = skorJenis / maxJenis
                                </div>
                            </div>
                        </div>

                        <div class="step-container">
                            <div class="step-number">3</div>
                            <div class="step-content">
                                <h5 class="text-primary mb-3">🧮 Perhitungan Skor Akhir</h5>
                                <p>Mengalikan nilai ternormalisasi dengan bobot kriteria dan menjumlahkannya.</p>
                                <div class="formula-box">
                                    <strong>Rumus:</strong><br>
                                    finalScore = (normJiwa × 0.40) + (normKK × 0.25) + (normKerusakan × 0.20) + (normJenis × 0.15)
                                </div>
                            </div>
                        </div>

                        <div class="step-container">
                            <div class="step-number">4</div>
                            <div class="step-content">
                                <h5 class="text-primary mb-3">🏆 Ranking</h5>
                                <p>Mengurutkan data berdasarkan skor akhir secara descending (tertinggi ke terendah).</p>
                            </div>
                        </div>
                    </div>

                    <!-- Calculation Example Card -->
                    <div class="content-card">
                        <div class="card-header-custom">
                            <h2 class="card-title">
                                <svg class="icon-large" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                    <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                                </svg>
                                Contoh Perhitungan
                            </h2>
                        </div>
                        <div id="calculation-example">
                            <!-- Contoh perhitungan akan dimuat di sini -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Data contoh untuk demonstrasi
        const sampleData = [
            {
                id: 1,
                jenisBencana: 'Banjir',
                lokasi: 'Desa A',
                jiwaTerdampak: 100,
                kkTerdampak: 25,
                tingkatKerusakan: 'Berat',
                disaster_date: '2024-01-15'
            },
            {
                id: 2,
                jenisBencana: 'Tanah Longsor',
                lokasi: 'Desa B',
                jiwaTerdampak: 50,
                kkTerdampak: 15,
                tingkatKerusakan: 'Sedang',
                disaster_date: '2024-01-20'
            },
            {
                id: 3,
                jenisBencana: 'Gempa Bumi',
                lokasi: 'Desa C',
                jiwaTerdampak: 200,
                kkTerdampak: 50,
                tingkatKerusakan: 'Berat',
                disaster_date: '2024-01-25'
            }
        ];

        // Konfigurasi SAW (sama dengan script.js)
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

        function runSAWDemo(data) {
            if (data.length === 0) return [];

            // Langkah 1: Kuantifikasi
            const quantifiedData = data.map(item => ({
                ...item,
                skorKerusakan: quantificationScores.kerusakan[item.tingkatKerusakan] || 0,
                skorJenis: quantificationScores.jenis[item.jenisBencana] || 0
            }));

            // Langkah 2: Cari nilai maksimum
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

            // Langkah 4: Hitung Skor Akhir
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

            return { quantifiedData, maxValues, normalizedData, scoredData: sortedData };
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            const day = date.getDate();
            const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();
            return `${day} ${month} ${year}`;
        }

        document.addEventListener('DOMContentLoaded', function() {
            const result = runSAWDemo(sampleData);
            const container = document.getElementById('calculation-example');

            let html = `
                <h5>Data Awal</h5>
                <div class="table-responsive mb-4">
                    <table class="table table-bordered table-sm">
                        <thead class="table-light">
                            <tr>
                                <th>Jenis Bencana</th>
                                <th>Lokasi</th>
                                <th>Jiwa</th>
                                <th>KK</th>
                                <th>Kerusakan</th>
                                <th>Tanggal</th>
                            </tr>
                        </thead>
                        <tbody>`;

            sampleData.forEach(item => {
                html += `
                    <tr>
                        <td>${item.jenisBencana}</td>
                        <td>${item.lokasi}</td>
                        <td>${item.jiwaTerdampak}</td>
                        <td>${item.kkTerdampak}</td>
                        <td>${item.tingkatKerusakan}</td>
                        <td>${formatDate(item.disaster_date)}</td>
                    </tr>`;
            });

            html += `
                        </tbody>
                    </table>
                </div>

                <h5 class="mt-4">Langkah 1: Kuantifikasi</h5>
                <div class="table-responsive mb-4">
                    <table class="table table-bordered table-sm">
                        <thead class="table-light">
                            <tr>
                                <th>Jenis Bencana</th>
                                <th>Lokasi</th>
                                <th>Jiwa</th>
                                <th>KK</th>
                                <th>Kerusakan</th>
                                <th>Skor Kerusakan</th>
                                <th>Skor Jenis</th>
                            </tr>
                        </thead>
                        <tbody>`;

            result.quantifiedData.forEach(item => {
                html += `
                    <tr>
                        <td>${item.jenisBencana}</td>
                        <td>${item.lokasi}</td>
                        <td>${item.jiwaTerdampak}</td>
                        <td>${item.kkTerdampak}</td>
                        <td>${item.tingkatKerusakan}</td>
                        <td class="highlight">${item.skorKerusakan}</td>
                        <td class="highlight">${item.skorJenis}</td>
                    </tr>`;
            });

            html += `
                        </tbody>
                    </table>
                </div>

                <div class="alert alert-info">
                    <strong>Nilai Maksimum:</strong> Jiwa=${result.maxValues.jiwa}, KK=${result.maxValues.kk}, Kerusakan=${result.maxValues.kerusakan}, Jenis=${result.maxValues.jenis}
                </div>

                <h5 class="mt-4">Langkah 2: Normalisasi</h5>
                <div class="table-responsive mb-4">
                    <table class="table table-bordered table-sm">
                        <thead class="table-light">
                            <tr>
                                <th>Jenis Bencana</th>
                                <th>Lokasi</th>
                                <th>Norm Jiwa</th>
                                <th>Norm KK</th>
                                <th>Norm Kerusakan</th>
                                <th>Norm Jenis</th>
                            </tr>
                        </thead>
                        <tbody>`;

            result.normalizedData.forEach(item => {
                html += `
                    <tr>
                        <td>${item.jenisBencana}</td>
                        <td>${item.lokasi}</td>
                        <td class="highlight">${item.normJiwa.toFixed(4)}</td>
                        <td class="highlight">${item.normKk.toFixed(4)}</td>
                        <td class="highlight">${item.normKerusakan.toFixed(4)}</td>
                        <td class="highlight">${item.normJenis.toFixed(4)}</td>
                    </tr>`;
            });

            html += `
                        </tbody>
                    </table>
                </div>

                <h5 class="mt-4">Langkah 3: Perhitungan Skor Akhir</h5>
                <div class="table-responsive mb-4">
                    <table class="table table-bordered table-sm">
                        <thead class="table-light">
                            <tr>
                                <th>Peringkat</th>
                                <th>Jenis Bencana</th>
                                <th>Lokasi</th>
                                <th>Skor Akhir</th>
                                <th>Perhitungan</th>
                            </tr>
                        </thead>
                        <tbody>`;

            result.scoredData.forEach((item, index) => {
                const calc = `(${item.normJiwa.toFixed(4)} × 0.40) + (${item.normKk.toFixed(4)} × 0.25) + (${item.normKerusakan.toFixed(4)} × 0.20) + (${item.normJenis.toFixed(4)} × 0.15)`;
                html += `
                    <tr>
                        <td class="text-center fw-bold">${index + 1}</td>
                        <td>${item.jenisBencana}</td>
                        <td>${item.lokasi}</td>
                        <td class="highlight fw-bold">${item.finalScore.toFixed(4)}</td>
                        <td class="small">${calc} = ${item.finalScore.toFixed(4)}</td>
                    </tr>`;
            });

            html += `
                        </tbody>
                    </table>
                </div>

                <div class="alert alert-success">
                    <strong>Kesimpulan:</strong> Berdasarkan perhitungan SAW, bencana dengan prioritas tertinggi adalah <strong>${result.scoredData[0].jenisBencana} di ${result.scoredData[0].lokasi}</strong> dengan skor ${result.scoredData[0].finalScore.toFixed(4)}.
                </div>`;

            container.innerHTML = html;
        });
    </script>
</body>
</html>
