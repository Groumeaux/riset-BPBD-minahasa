<?php
session_start();
require_once 'config.php';

// Fungsi helper thumbnail (Khusus JPG)
if (!function_exists('create_thumbnail')) {
    function create_thumbnail($originalPath, $thumbPath, $maxWidth = 150, $maxHeight = 150) {
        list($origWidth, $origHeight, $type) = @getimagesize($originalPath);
        if (!$origWidth || !$origHeight) return false;
        
        // Hanya proses jika tipe adalah JPEG
        if ($type !== IMAGETYPE_JPEG) return false;

        $ratio = min($maxWidth / $origWidth, $maxHeight / $origHeight);
        $thumbWidth = (int)($origWidth * $ratio);
        $thumbHeight = (int)($origHeight * $ratio);
        
        $thumbImage = imagecreatetruecolor($thumbWidth, $thumbHeight);
        $sourceImage = @imagecreatefromjpeg($originalPath);
        
        if (!$sourceImage) return false;
        
        imagecopyresampled($thumbImage, $sourceImage, 0, 0, 0, 0, $thumbWidth, $thumbHeight, $origWidth, $origHeight);
        
        // Simpan sebagai JPG dengan kualitas 90
        $success = imagejpeg($thumbImage, $thumbPath, 90);
        
        imagedestroy($sourceImage);
        imagedestroy($thumbImage);
        return $success;
    }
}

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// --- LOGIKA BARU UNTUK KATEGORI ---
$kategoriLaporan = trim($_POST['kategoriLaporan'] ?? 'bencana');

// Bidang Umum
$lokasi = trim($_POST['lokasi'] ?? '');
$disasterDate = trim($_POST['disasterDate'] ?? '');
$userId = $_SESSION['user_id'];
$status = ($_SESSION['role'] === 'head') ? 'approved' : 'pending';
$validated_at = ($_SESSION['role'] === 'head') ? date('Y-m-d H:i:s') : null;

// Bidang Spesifik
$jenisBencana = '';
$keterangan = null;
$jiwaTerdampak = 0;
$kkTerdampak = 0;
$tingkatKerusakan = 'Ringan'; // Default

if (empty($lokasi) || empty($disasterDate)) {
    echo json_encode(['success' => false, 'message' => 'Lokasi dan Tanggal wajib diisi']);
    exit;
}

if ($kategoriLaporan === 'bencana') {
    $jenisBencana = trim($_POST['jenisBencana'] ?? '');
    $jiwaTerdampak = (int)($_POST['jiwaTerdampak'] ?? 0);
    $kkTerdampak = (int)($_POST['kkTerdampak'] ?? 0);
    $tingkatKerusakan = trim($_POST['tingkatKerusakan'] ?? 'Ringan');
    
    if (empty($jenisBencana)) {
        echo json_encode(['success' => false, 'message' => 'Jenis Bencana wajib diisi untuk kategori ini']);
        exit;
    }

} else if ($kategoriLaporan === 'insiden') {
    $jenisBencana = trim($_POST['jenisInsiden'] ?? ''); 
    $keterangan = trim($_POST['keteranganInsiden'] ?? null);
    
    $jiwaTerdampak = 0;
    $kkTerdampak = 0;
    $tingkatKerusakan = 'Ringan';
    
    if (empty($jenisBencana)) {
        echo json_encode(['success' => false, 'message' => 'Jenis Insiden wajib diisi untuk kategori ini']);
        exit;
    }
}

// --- LOGIKA UPLOAD FOTO (KHUSUS JPG) ---
$uploadedPhotos = [];
$uploadDir = 'uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

if (isset($_FILES['photos']) && is_array($_FILES['photos']['name'])) {
    // Hanya izinkan JPEG
    $allowedTypes = ['image/jpeg', 'image/jpg'];
    $maxFileSize = 5 * 1024 * 1024; // 5MB

    foreach ($_FILES['photos']['name'] as $key => $filename) {
        if (empty($filename)) continue;
        
        $fileTmp = $_FILES['photos']['tmp_name'][$key];
        $fileError = $_FILES['photos']['error'][$key];
        
        if ($fileError !== UPLOAD_ERR_OK) continue;
        
        $fileSize = @filesize($fileTmp);
        if ($fileSize === false || $fileSize > $maxFileSize) continue;

        $fileType = @mime_content_type($fileTmp);
        $fileExtension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        
        // Validasi Ketat untuk JPG
        $isValidType = false;
        if (($fileType === 'image/jpeg' || $fileType === 'image/jpg') && 
            ($fileExtension === 'jpg' || $fileExtension === 'jpeg')) {
            $isValidType = true;
        }

        if (!$isValidType) continue;

        $uniqueFilename = uniqid('disaster_', true) . '.jpg'; // Paksa ekstensi .jpg
        $filePath = $uploadDir . $uniqueFilename;

        if (move_uploaded_file($fileTmp, $filePath)) {
            $thumbFilename = 'thumb_' . $uniqueFilename;
            $thumbPath = $uploadDir . $thumbFilename;
            // Buat thumbnail (hanya JPG)
            create_thumbnail($filePath, $thumbPath);

            $uploadedPhotos[] = [
                'filename' => $uniqueFilename,
                'original_filename' => $filename,
                'file_path' => $filePath
            ];
        }
    }
}


try {
    $pdo->beginTransaction();

    $sql = "INSERT INTO disasters (
                jenisBencana, lokasi, jiwaTerdampak, kkTerdampak, tingkatKerusakan, keterangan, 
                disaster_date, status, submitted_by, validated_at, kategori_laporan
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $jenisBencana,
        $lokasi,
        $jiwaTerdampak,
        $kkTerdampak,
        $tingkatKerusakan,
        $keterangan,
        $disasterDate,
        $status,
        $userId,
        $validated_at,
        $kategoriLaporan
    ]);
    $disasterId = $pdo->lastInsertId();

    if (!empty($uploadedPhotos)) {
        $photoStmt = $pdo->prepare("INSERT INTO disaster_photos (disaster_id, filename, original_filename, file_path) VALUES (?, ?, ?, ?)");
        foreach ($uploadedPhotos as $photo) {
            $photoStmt->execute([$disasterId, $photo['filename'], $photo['original_filename'], $photo['file_path']]);
        }
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Laporan berhasil disimpan']);
} catch (PDOException $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>