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
$uploadErrors = []; // [NEW] Array untuk menampung pesan error
$uploadDir = 'uploads/';

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

if (isset($_FILES['photos']) && is_array($_FILES['photos']['name'])) {
    $maxFileSize = 5 * 1024 * 1024; // 5MB

    foreach ($_FILES['photos']['name'] as $key => $filename) {
        if (empty($filename)) continue;
        
        $fileTmp = $_FILES['photos']['tmp_name'][$key];
        $fileError = $_FILES['photos']['error'][$key];
        
        // Cek error standar PHP
        if ($fileError !== UPLOAD_ERR_OK) {
            $uploadErrors[] = "File $filename gagal diupload (Error Code: $fileError)";
            continue;
        }
        
        // Cek ukuran
        $fileSize = @filesize($fileTmp);
        if ($fileSize === false || $fileSize > $maxFileSize) {
            $uploadErrors[] = "File $filename terlalu besar (Max 5MB)";
            continue;
        }

        // Cek tipe file
        $fileType = @mime_content_type($fileTmp);
        $fileExtension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        
        // Validasi Ketat untuk JPG
        $isValidType = false;
        if (($fileType === 'image/jpeg' || $fileType === 'image/jpg') && 
            ($fileExtension === 'jpg' || $fileExtension === 'jpeg')) {
            $isValidType = true;
        }

        if (!$isValidType) {
            // [NEW] Simpan pesan error jika format salah
            $uploadErrors[] = "File $filename ditolak (Hanya format JPG/JPEG yang diperbolehkan).";
            continue;
        }

        $uniqueFilename = uniqid('disaster_', true) . '.jpg';
        $filePath = $uploadDir . $uniqueFilename;

        if (move_uploaded_file($fileTmp, $filePath)) {
            $thumbFilename = 'thumb_' . $uniqueFilename;
            $thumbPath = $uploadDir . $thumbFilename;
            create_thumbnail($filePath, $thumbPath);

            $uploadedPhotos[] = [
                'filename' => $uniqueFilename,
                'original_filename' => $filename,
                'file_path' => $filePath
            ];
        } else {
             $uploadErrors[] = "Gagal memindahkan file $filename ke folder uploads.";
        }
    }
}

try {
    $pdo->beginTransaction();

    // Query INSERT disaster
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

    // [NEW] Buat pesan sukses yang informatif
    $message = 'Laporan berhasil disimpan.';
    if (count($uploadedPhotos) > 0) {
        $message .= ' (' . count($uploadedPhotos) . ' foto berhasil diupload)';
    }
    
    // [NEW] Tambahkan peringatan jika ada file yang ditolak
    if (count($uploadErrors) > 0) {
        $message .= "\n\nPERINGATAN: Beberapa file dilewati:\n- " . implode("\n- ", $uploadErrors);
    }

    echo json_encode(['success' => true, 'message' => $message]);

} catch (PDOException $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>