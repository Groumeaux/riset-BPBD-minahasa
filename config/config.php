<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'disaster_reporting');
define('DB_USER', 'root'); // Default XAMPP MySQL user
define('DB_PASS', ''); // Default XAMPP MySQL password (empty)

// Create PDO connection
try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
?>
