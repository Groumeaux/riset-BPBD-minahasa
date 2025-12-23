<?php
// Simple SAW Process Page
session_start();
require_once 'config.php';

// Enable all error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

// Output buffer to catch any issues
ob_start();

echo "<h1>SAW Process Page</h1>";
echo "<p>Testing basic functionality...</p>";

// Check session
echo "<h2>Session Info:</h2>";
echo "<p>Session ID: " . session_id() . "</p>";
echo "<p>User ID: " . (isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 'Not set') . "</p>";
echo "<p>Username: " . (isset($_SESSION['username']) ? $_SESSION['username'] : 'Not set') . "</p>";

// Check if logged in
if (!isset($_SESSION['user_id'])) {
    echo "<p style='color: red;'>You are not logged in. Please <a href='index.php'>login first</a>.</p>";
    ob_end_flush();
    exit;
}

echo "<p style='color: green;'>You are logged in!</p>";

// Basic SAW content
echo "<h2>SAW Method Explanation</h2>";
echo "<p>Simple Additive Weighting (SAW) is a multi-criteria decision making method...</p>";

// Get output buffer content
$content = ob_get_clean();
echo $content;
?>
