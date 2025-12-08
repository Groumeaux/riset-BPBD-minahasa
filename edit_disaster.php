<?php
session_start();
require_once 'config.php';

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
$uploadDir = 'uploads/'; // Pastikan folder ini ada dan writable

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

if (isset($_FILES['photos']) && is_array($_FILES['photos']['name'])) {
    $maxFileSize = 5 * 1024 * 1024; // 5MB

    foreach ($_FILES['photos']['name'] as $key => $filename) {
        if (empty($filename)) continue;
        
        $fileTmp = $_FILES['photos']['tmp_name'][$key];
        $fileError = $_FILES['photos']['error'][$key];
        
        // Cek error upload bawaan PHP
        if ($fileError !== UPLOAD_ERR_OK) {
            $uploadErrors[] = "Gagal upload $filename (Kode: $fileError)";
            continue;
        }
        
        // Cek ukuran file
        $fileSize = @filesize($fileTmp);
        if ($fileSize === false || $fileSize > $maxFileSize) {
            $uploadErrors[] = "File $filename terlalu besar (Maks 5MB)";
            continue;
        }

        // Cek tipe file (MIME type dan Ekstensi)
        $fileType = @mime_content_type($fileTmp);
        $fileExtension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        
        // VALIDASI KETAT HANYA JPG/JPEG
        $isValidType = false;
        if (($fileType === 'image/jpeg' || $fileType === 'image/jpg') && 
            ($fileExtension === 'jpg' || $fileExtension === 'jpeg')) {
            $isValidType = true;
        }

        if (!$isValidType) {
            $uploadErrors[] = "Format file $filename tidak didukung. Mohon hanya upload file JPG/JPEG.";
            continue;
        }

        // Generate nama file unik dengan ekstensi .jpg
        $uniqueFilename = uniqid('disaster_', true) . '.jpg';
        $filePath = $uploadDir . $uniqueFilename;

        // Pindahkan file
        if (move_uploaded_file($fileTmp, $filePath)) {
            // Buat Thumbnail (Juga JPG)
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
        // Logika untuk Insiden
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

    // B. Masukkan Foto Baru ke Database (Jika ada)
    if (!empty($uploadedPhotos)) {
        $photoStmt = $pdo->prepare("INSERT INTO disaster_photos (disaster_id, filename, original_filename, file_path) VALUES (?, ?, ?, ?)");
        foreach ($uploadedPhotos as $photo) {
            $photoStmt->execute([$id, $photo['filename'], $photo['original_filename'], $photo['file_path']]);
        }
    }

    $pdo->commit();

    // Siapkan pesan respons
    $msg = "Laporan berhasil diperbarui dan status kembali menjadi PENDING.";
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