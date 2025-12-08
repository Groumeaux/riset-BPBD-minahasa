<?php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

// 1. Cek Login
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Anda belum login']);
    exit;
}

$userId = $_SESSION['user_id'];

try {
    // 2. Ambil semua laporan milik user yang sedang login
    // Kita ambil juga kolom reject_reason untuk ditampilkan jika ditolak
    $query = "SELECT d.*, u.username 
              FROM disasters d 
              JOIN users u ON d.submitted_by = u.id 
              WHERE d.submitted_by = ? 
              ORDER BY d.created_at DESC";
              
    $stmt = $pdo->prepare($query);
    $stmt->execute([$userId]);
    $reports = $stmt->fetchAll();

    // 3. Ambil foto thumbnail (sama seperti logic sebelumnya)
    foreach ($reports as &$report) {
        $photoStmt = $pdo->prepare("SELECT file_path, original_filename FROM disaster_photos WHERE disaster_id = ? LIMIT 1");
        $photoStmt->execute([$report['id']]);
        $photo = $photoStmt->fetch();
        $report['thumbnail'] = $photo ? $photo['file_path'] : null;
    }

    echo json_encode(['success' => true, 'data' => $reports]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>