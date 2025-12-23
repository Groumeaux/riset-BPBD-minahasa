<?php
session_start();
require_once '../config/config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$id = $_POST['id'] ?? null;

if (!$id) {
    echo json_encode(['success' => false, 'message' => 'Disaster ID is required']);
    exit;
}

$role = $_SESSION['role'];
$userId = $_SESSION['user_id'];

try {
    $checkStmt = $pdo->prepare("SELECT submitted_by FROM disasters WHERE id = ?");
    $checkStmt->execute([$id]);
    $disaster = $checkStmt->fetch();

    if (!$disaster) {
        echo json_encode(['success' => false, 'message' => 'Disaster report not found']);
        exit;
    }

    if ($role !== 'head' && $disaster['submitted_by'] != $userId) {
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit;
    }

    $photoStmt = $pdo->prepare("SELECT file_path FROM disaster_photos WHERE disaster_id = ?");
    $photoStmt->execute([$id]);
    $photos = $photoStmt->fetchAll();

    foreach ($photos as $photo) {
        $physicalPath = '../' . $photo['file_path'];

        if (file_exists($physicalPath)) {
            unlink($physicalPath);
        }

        $thumbPath = str_replace('disaster_', 'thumb_disaster_', $physicalPath);
        if (file_exists($thumbPath)) {
            unlink($thumbPath);
        }
    }

    $stmt = $pdo->prepare("DELETE FROM disasters WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(['success' => true, 'message' => 'Laporan bencana berhasil dihapus']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>