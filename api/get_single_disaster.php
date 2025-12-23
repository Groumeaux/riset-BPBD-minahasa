<?php
session_start();
require_once '../config/config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$id = $_GET['id'] ?? null;

if (!$id) {
    echo json_encode(['success' => false, 'message' => 'No ID provided']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM disasters WHERE id = ?");
    $stmt->execute([$id]);
    $disaster = $stmt->fetch();

    if (!$disaster) {
        echo json_encode(['success' => false, 'message' => 'Report not found']);
        exit;
    }

    $role = strtolower($_SESSION['role'] ?? 'guest');
    $userId = $_SESSION['user_id'] ?? -1;

    if ($role !== 'head' && $disaster['submitted_by'] != $userId) {
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit;
    }

    $photoStmt = $pdo->prepare("SELECT id, file_path, original_filename FROM disaster_photos WHERE disaster_id = ?");
    $photoStmt->execute([$id]);
    $disaster['photos'] = $photoStmt->fetchAll();

    echo json_encode(['success' => true, 'data' => $disaster]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>