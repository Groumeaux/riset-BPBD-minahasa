<?php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid method']);
    exit;
}

$id = $_POST['id'] ?? '';
$lokasi = $_POST['lokasi'] ?? '';
$disasterDate = $_POST['disasterDate'] ?? '';
$keterangan = $_POST['keterangan'] ?? null;

// Ambil data lama untuk cek hak akses
$stmt = $pdo->prepare("SELECT submitted_by, kategori_laporan FROM disasters WHERE id = ?");
$stmt->execute([$id]);
$report = $stmt->fetch();

if (!$report) {
    echo json_encode(['success' => false, 'message' => 'Data tidak ditemukan']);
    exit;
}

// Cek otorisasi: Hanya pembuat laporan atau Head yang boleh edit
// (Opsional: Batasi Head tidak boleh edit, hanya reject. Di sini kita biarkan user edit)
if ($_SESSION['role'] !== 'head' && $report['submitted_by'] != $_SESSION['user_id']) {
    echo json_encode(['success' => false, 'message' => 'Anda tidak berhak mengedit laporan ini']);
    exit;
}

$kategori = $report['kategori_laporan'];

try {
    $pdo->beginTransaction();

    if ($kategori === 'bencana') {
        $jiwa = $_POST['jiwaTerdampak'] ?? 0;
        $kk = $_POST['kkTerdampak'] ?? 0;
        $kerusakan = $_POST['tingkatKerusakan'] ?? 'Ringan';

        // LOGIKA UTAMA: Reset status ke 'pending', hapus validated_at, hapus reject_reason
        $sql = "UPDATE disasters SET 
                lokasi = ?, 
                disaster_date = ?, 
                jiwaTerdampak = ?, 
                kkTerdampak = ?, 
                tingkatKerusakan = ?, 
                keterangan = ?,
                status = 'pending', 
                validated_at = NULL,
                reject_reason = NULL 
                WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$lokasi, $disasterDate, $jiwa, $kk, $kerusakan, $keterangan, $id]);

    } else {
        // Insiden
        $sql = "UPDATE disasters SET 
                lokasi = ?, 
                disaster_date = ?, 
                keterangan = ?,
                status = 'pending',
                validated_at = NULL,
                reject_reason = NULL
                WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$lokasi, $disasterDate, $keterangan, $id]);
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Laporan diperbarui. Status kembali menjadi Pending menunggu validasi.']);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>