<?php
session_start();
require_once '../config/config.php';

// --- FUNGSI HELPER: MEMBUAT THUMBNAIL OTOMATIS (KHUSUS JPG) ---
if (!function_exists('create_thumbnail')) {
    function create_thumbnail($originalPath, $thumbPath, $maxWidth = 150, $maxHeight = 150) {
        list($origWidth, $origHeight, $type) = @getimagesize($originalPath);
        if (!$origWidth || !$origHeight) return false;
        
        // Hanya proses jika tipe adalah JPEG (Kode 2)
        if ($type !== IMAGETYPE_JPEG) return false;
        
        $ratio = min($maxWidth / $origWidth, $maxHeight / $origHeight);
        $thumbWidth = (int)($origWidth * $ratio);
        $thumbHeight = (int)($origHeight * $ratio);
        
        $thumbImage = imagecreatetruecolor($thumbWidth, $thumbHeight);
        $sourceImage = @imagecreatefromjpeg($originalPath);
        
        if (!$sourceImage) return false;
        
        imagecopyresampled($thumbImage, $sourceImage, 0, 0, 0, 0, $thumbWidth, $thumbHeight, $origWidth, $origHeight);
        
        // Simpan thumbnail sebagai JPG dengan kualitas 90
        $success = imagejpeg($thumbImage, $thumbPath, 90);
        
        imagedestroy($sourceImage);
        imagedestroy($thumbImage);
        return $success;
    }
}

header('Content-Type: application/json');

// 1. Cek Login
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Anda belum login']);
    exit;
}

// 2. Cek Metode Request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid method']);
    exit;
}

// 3. Ambil Data dari Form
$id = $_POST['id'] ?? '';
$lokasi = $_POST['lokasi'] ?? '';
$disasterDate = $_POST['disasterDate'] ?? '';
$keterangan = $_POST['keterangan'] ?? null;
$jenisBencanaBaru = $_POST['jenisBencana'] ?? ''; 

// 4. Validasi Keamanan & Kepemilikan
$stmt = $pdo->prepare("SELECT submitted_by, kategori_laporan, jenisBencana FROM disasters WHERE id = ?");
$stmt->execute([$id]);
$report = $stmt->fetch();

if (!$report) {
    echo json_encode(['success' => false, 'message' => 'Data laporan tidak ditemukan']);
    exit;
}

// Hanya Head ATAU Pemilik Laporan yang boleh mengedit
if ($_SESSION['role'] !== 'head' && $report['submitted_by'] != $_SESSION['user_id']) {
    echo json_encode(['success' => false, 'message' => 'Anda tidak berhak mengedit laporan ini']);
    exit;
}

// Gunakan jenis bencana lama jika user tidak mengubahnya
if (empty($jenisBencanaBaru)) {
    $jenisBencanaBaru = $report['jenisBencana'];
}

$kategori = $report['kategori_laporan'];

// --- 5. LOGIKA UPLOAD FOTO BARU (KHUSUS JPG) ---
$uploadedPhotos = [];
$uploadErrors = [];
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
        
        if ($fileError !== UPLOAD_ERR_OK) {
            $uploadErrors[] = "Gagal upload $filename (Kode: $fileError)";
            continue;
        }
        
        $fileSize = @filesize($fileTmp);
        if ($fileSize === false || $fileSize > $maxFileSize) {
            $uploadErrors[] = "File $filename terlalu besar (Maks 5MB)";
            continue;
        }

        $fileType = @mime_content_type($fileTmp);
        $fileExtension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        
        // VALIDASI KETAT HANYA JPG/JPEG
        $isValidType = false;
        if (($fileType === 'image/jpeg' || $fileType === 'image/jpg') && 
            ($fileExtension === 'jpg' || $fileExtension === 'jpeg')) {
            $isValidType = true;
        }

        if (!$isValidType) {
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
            $uploadErrors[] = "Gagal menyimpan file $filename ke server";
        }
    }
}

// --- 6. UPDATE DATABASE (TRANSAKSI) ---
try {
    $pdo->beginTransaction();

    // A. Update Data Utama Laporan (Reset Status ke Pending)
    if ($kategori === 'bencana') {
        $jiwa = $_POST['jiwaTerdampak'] ?? 0;
        $kk = $_POST['kkTerdampak'] ?? 0;
        $kerusakan = $_POST['tingkatKerusakan'] ?? 'Ringan';

        $sql = "UPDATE disasters SET 
                jenisBencana = ?, 
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
        $stmt->execute([$jenisBencanaBaru, $lokasi, $disasterDate, $jiwa, $kk, $kerusakan, $keterangan, $id]);

    } else {
        $sql = "UPDATE disasters SET 
                jenisBencana = ?, 
                lokasi = ?, 
                disaster_date = ?, 
                keterangan = ?, 
                status = 'pending', 
                validated_at = NULL, 
                reject_reason = NULL
                WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$jenisBencanaBaru, $lokasi, $disasterDate, $keterangan, $id]);
    }

    // B. [NEW] HAPUS FOTO YANG DIPILIH
    if (isset($_POST['delete_photos']) && is_array($_POST['delete_photos'])) {
        $idsToDelete = $_POST['delete_photos'];
        
        foreach ($idsToDelete as $photoId) {
            // Verifikasi kepemilikan foto (harus milik report ini)
            $checkStmt = $pdo->prepare("SELECT file_path FROM disaster_photos WHERE id = ? AND disaster_id = ?");
            $checkStmt->execute([$photoId, $id]);
            $photo = $checkStmt->fetch();

            if ($photo) {
                // Hapus file fisik
                if (file_exists($photo['file_path'])) {
                    unlink($photo['file_path']);
                }
                // Hapus thumbnail jika ada
                $thumbPath = str_replace('disaster_', 'thumb_disaster_', $photo['file_path']);
                if (file_exists($thumbPath)) {
                    unlink($thumbPath);
                }

                // Hapus dari database
                $delStmt = $pdo->prepare("DELETE FROM disaster_photos WHERE id = ?");
                $delStmt->execute([$photoId]);
            }
        }
    }

    // C. Masukkan Foto Baru ke Database
    if (!empty($uploadedPhotos)) {
        $photoStmt = $pdo->prepare("INSERT INTO disaster_photos (disaster_id, filename, original_filename, file_path) VALUES (?, ?, ?, ?)");
        foreach ($uploadedPhotos as $photo) {
            $photoStmt->execute([$id, $photo['filename'], $photo['original_filename'], $photo['file_path']]);
        }
    }

    $pdo->commit();

    $msg = "Laporan berhasil diperbarui dan status kembali menjadi PENDING.";
    if (isset($_POST['delete_photos']) && count($_POST['delete_photos']) > 0) {
        $msg .= " (" . count($_POST['delete_photos']) . " foto dihapus)";
    }
    if (count($uploadedPhotos) > 0) {
        $msg .= " (" . count($uploadedPhotos) . " foto baru ditambahkan)";
    }
    if (count($uploadErrors) > 0) {
        $msg .= ". Peringatan: Beberapa file ditolak karena bukan format JPG.";
    }

    echo json_encode(['success' => true, 'message' => $msg]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Database Error: ' . $e->getMessage()]);
}
?>