<?php
session_start();
require_once '../config/config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'head') {
    echo json_encode(['success' => false, 'message' => 'Akses ditolak.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Metode salah.']);
    exit;
}

$id = $_POST['id'] ?? null;
$action = $_POST['action'] ?? null;

if (!$id || !in_array($action, ['approved', 'rejected'])) {
    echo json_encode(['success' => false, 'message' => 'Data tidak valid.']);
    exit;
}

try {
    if ($action === 'approved') {
        $stmt = $pdo->prepare("UPDATE disasters SET status = 'approved', validated_at = NOW(), reject_reason = NULL WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Laporan disetujui.']);
    } 
    elseif ($action === 'rejected') {
        $reason = trim($_POST['reason'] ?? '');
        if (empty($reason)) {
            echo json_encode(['success' => false, 'message' => 'Alasan penolakan wajib diisi.']);
            exit;
        }
        
        $stmt = $pdo->prepare("UPDATE disasters SET status = 'rejected', validated_at = NOW(), reject_reason = ? WHERE id = ?");
        $stmt->execute([$reason, $id]);
        echo json_encode(['success' => true, 'message' => 'Laporan ditolak.']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'DB Error: ' . $e->getMessage()]);
}
?>