-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 22, 2025 at 06:19 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `disaster_reporting`
--

-- --------------------------------------------------------

--
-- Table structure for table `disasters`
--

CREATE TABLE `disasters` (
  `id` int(11) NOT NULL,
  `jenisBencana` varchar(50) NOT NULL,
  `lokasi` varchar(100) NOT NULL,
  `disaster_date` date NOT NULL,
  `jiwaTerdampak` int(11) NOT NULL,
  `kkTerdampak` int(11) NOT NULL,
  `tingkatKerusakan` enum('Ringan','Sedang','Berat') NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `submitted_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `validated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `disasters`
--

INSERT INTO `disasters` (`id`, `jenisBencana`, `lokasi`, `disaster_date`, `jiwaTerdampak`, `kkTerdampak`, `tingkatKerusakan`, `status`, `submitted_by`, `created_at`, `validated_at`) VALUES
(1, 'Banjir', 'Desa A', '2025-10-21', 80, 25, 'Sedang', 'approved', 1, '2025-10-21 05:36:48', NULL),
(2, 'Tanah Longsor', 'Desa B', '2025-10-21', 15, 5, 'Berat', 'approved', 1, '2025-10-21 05:36:48', NULL),
(3, 'Banjir', 'Taler', '2025-10-21', 100, 20, 'Sedang', 'approved', 1, '2025-10-21 05:37:10', '2025-10-21 05:51:08'),
(4, 'Angin Puting Beliung', 'Gonta', '2025-10-21', 10, 1, 'Berat', 'approved', 1, '2025-10-21 05:51:32', '2025-10-22 03:17:02'),
(5, 'Gempa Bumi', 'Taler', '2025-10-21', 50, 20, 'Sedang', 'approved', 1, '2025-10-21 06:27:45', '2025-10-21 06:28:08'),
(6, 'Tanah Longsor', 'Rerer', '2025-10-22', 50, 12, 'Sedang', 'approved', 2, '2025-10-21 17:19:00', '2025-10-22 03:17:02'),
(7, 'Banjir', 'Rarar', '2025-10-22', 54, 9, 'Ringan', 'approved', 1, '2025-10-22 03:16:43', '2025-10-22 03:17:02'),
(8, 'Angin Puting Beliung', 'Rarar', '2025-10-22', 40, 10, 'Sedang', 'approved', 2, '2025-10-22 03:21:30', '2025-10-22 03:23:01'),
(11, 'Banjir', 'Rora', '2025-10-22', 7, 2, 'Berat', 'approved', 2, '2025-10-22 03:31:08', '2025-10-21 21:31:08'),
(12, 'Banjir', 'Sasan', '2025-10-22', 789, 120, 'Sedang', 'approved', 1, '2025-10-22 03:31:50', '2025-10-22 03:32:01'),
(13, 'Banjir', 'Rarar', '2025-10-22', 1, 1, 'Berat', 'approved', 1, '2025-10-22 03:36:20', '2025-10-22 03:36:37'),
(14, 'Banjir', 'Rarar', '2025-10-22', 1, 1, 'Berat', 'rejected', 1, '2025-10-22 03:36:22', '2025-10-22 03:36:33'),
(15, 'Tanah Longsor', 'Wengkol', '2025-05-09', 10, 2, 'Sedang', 'approved', 1, '2025-10-22 04:09:15', '2025-10-22 04:09:42'),
(16, 'Angin Puting Beliung', 'Rora', '2025-05-07', 50, 15, 'Berat', 'approved', 2, '2025-10-22 04:13:39', '2025-10-21 22:13:39');

-- --------------------------------------------------------

--
-- Table structure for table `disaster_photos`
--

CREATE TABLE `disaster_photos` (
  `id` int(11) NOT NULL,
  `disaster_id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `disaster_photos`
--

INSERT INTO `disaster_photos` (`id`, `disaster_id`, `filename`, `original_filename`, `file_path`, `uploaded_at`) VALUES
(1, 5, 'disaster_68f727e133d7e5.00094003.png', 'RobloxScreenShot20240825_181133302.png', 'uploads/disaster_68f727e133d7e5.00094003.png', '2025-10-21 06:27:45'),
(2, 5, 'disaster_68f727e133ec09.54646290.png', 'RobloxScreenShot20240825_182057147.png', 'uploads/disaster_68f727e133ec09.54646290.png', '2025-10-21 06:27:45'),
(3, 5, 'disaster_68f727e133ff40.80075555.png', 'RobloxScreenShot20240825_192740348.png', 'uploads/disaster_68f727e133ff40.80075555.png', '2025-10-21 06:27:45'),
(4, 5, 'disaster_68f727e1341392.02224547.png', 'RobloxScreenShot20250201_175607885.png', 'uploads/disaster_68f727e1341392.02224547.png', '2025-10-21 06:27:45'),
(5, 5, 'disaster_68f727e13425e7.39559914.png', 'RobloxScreenShot20250718_203249542.png', 'uploads/disaster_68f727e13425e7.39559914.png', '2025-10-21 06:27:45'),
(6, 6, 'disaster_68f7c084c645d3.49237267.png', 'Picture1.png', 'uploads/disaster_68f7c084c645d3.49237267.png', '2025-10-21 17:19:00'),
(7, 6, 'disaster_68f7c084c6ae97.48508648.png', 'Picture2.png', 'uploads/disaster_68f7c084c6ae97.48508648.png', '2025-10-21 17:19:00'),
(8, 6, 'disaster_68f7c084c6c284.92763922.png', 'Screenshot (1069).png', 'uploads/disaster_68f7c084c6c284.92763922.png', '2025-10-21 17:19:00'),
(9, 6, 'disaster_68f7c084c6fcd4.74100354.png', 'Screenshot (1070).png', 'uploads/disaster_68f7c084c6fcd4.74100354.png', '2025-10-21 17:19:00'),
(10, 7, 'disaster_68f84c9b074ce4.70937158.jpg', 'gradient-blue-silver-background-christmas-season_52683-145150.jpg', 'uploads/disaster_68f84c9b074ce4.70937158.jpg', '2025-10-22 03:16:43'),
(11, 7, 'disaster_68f84c9b075d00.29965443.jpg', '397277_wallpaper-abstract-background-blue-background-white-snowflakes_1024x768_h.jpg', 'uploads/disaster_68f84c9b075d00.29965443.jpg', '2025-10-22 03:16:43'),
(12, 7, 'disaster_68f84c9b0769c2.47725146.jpg', '1050132_christmas-theme-backgrounds-wallpapers-zone_1600x1200_h.jpg', 'uploads/disaster_68f84c9b0769c2.47725146.jpg', '2025-10-22 03:16:43'),
(13, 7, 'disaster_68f84c9b0774c3.69008064.jpg', 'istockphoto-1063011484-612x612.jpg', 'uploads/disaster_68f84c9b0774c3.69008064.jpg', '2025-10-22 03:16:43'),
(14, 7, 'disaster_68f84c9b078152.57823698.jpg', '005821b28fb245b.jpg', 'uploads/disaster_68f84c9b078152.57823698.jpg', '2025-10-22 03:16:43'),
(15, 8, 'disaster_68f84dba75a5e3.20974902.webp', 'Shadow_Twinblades.webp', 'uploads/disaster_68f84dba75a5e3.20974902.webp', '2025-10-22 03:21:30'),
(16, 8, 'disaster_68f84dba75bb53.69016067.webp', 'Divine_Glaive.webp', 'uploads/disaster_68f84dba75bb53.69016067.webp', '2025-10-22 03:21:30'),
(17, 8, 'disaster_68f84dba75cc64.00457907.webp', 'Malefic_Roar.webp', 'uploads/disaster_68f84dba75cc64.00457907.webp', '2025-10-22 03:21:30'),
(18, 8, 'disaster_68f84dba75da04.09663126.webp', 'Necklace_of_Durance.webp', 'uploads/disaster_68f84dba75da04.09663126.webp', '2025-10-22 03:21:30'),
(19, 8, 'disaster_68f84dba75eb48.24545140.webp', 'Sea_Halberd.webp', 'uploads/disaster_68f84dba75eb48.24545140.webp', '2025-10-22 03:21:30'),
(20, 11, 'disaster_68f84ffc3152d5.47755111.jpg', 'WhatsApp Image 2025-10-16 at 09.39.07.jpg', 'uploads/disaster_68f84ffc3152d5.47755111.jpg', '2025-10-22 03:31:08'),
(21, 11, 'disaster_68f84ffc3d7aa5.00133298.jpeg', 'WhatsApp Image 2025-10-16 at 09.39.07.jpeg', 'uploads/disaster_68f84ffc3d7aa5.00133298.jpeg', '2025-10-22 03:31:08'),
(22, 11, 'disaster_68f84ffc4864b1.31844639.jpeg', 'WhatsApp Image 2025-10-16 at 09.39.00.jpeg', 'uploads/disaster_68f84ffc4864b1.31844639.jpeg', '2025-10-22 03:31:08'),
(23, 11, 'disaster_68f84ffc533428.13852097.jpeg', 'WhatsApp Image 2025-10-16 at 09.32.00.jpeg', 'uploads/disaster_68f84ffc533428.13852097.jpeg', '2025-10-22 03:31:08'),
(24, 11, 'disaster_68f84ffc5e3df0.64305700.jpg', 'SD GMIM Tondegesan.jpg', 'uploads/disaster_68f84ffc5e3df0.64305700.jpg', '2025-10-22 03:31:08'),
(25, 12, 'disaster_68f85026b09f72.98765737.jpg', 'WhatsApp Image 2024-12-24 at 09.38.52_472d8021.jpg', 'uploads/disaster_68f85026b09f72.98765737.jpg', '2025-10-22 03:31:50'),
(26, 12, 'disaster_68f85026b5fb12.48901058.jpg', 'Background graduation - MSIB Batch 7.jpg', 'uploads/disaster_68f85026b5fb12.48901058.jpg', '2025-10-22 03:31:50'),
(27, 12, 'disaster_68f85026c67742.65001150.jpg', 'logo-minahasa-besar-1024x427.jpg', 'uploads/disaster_68f85026c67742.65001150.jpg', '2025-10-22 03:31:50'),
(28, 12, 'disaster_68f85026ca4563.84623516.jpg', 'WhatsApp Image 2024-12-18 at 06.15.44_ebccccfd.jpg', 'uploads/disaster_68f85026ca4563.84623516.jpg', '2025-10-22 03:31:50'),
(29, 12, 'disaster_68f85026d3e297.61413808.jpg', 'WhatsApp Image 2024-12-17 at 09.01.13_4ff7f5e4.jpg', 'uploads/disaster_68f85026d3e297.61413808.jpg', '2025-10-22 03:31:50'),
(30, 13, 'disaster_68f8513318a2e8.45996263.jpg', 'IMG_20240903_100818.jpg', 'uploads/disaster_68f8513318a2e8.45996263.jpg', '2025-10-22 03:36:20'),
(31, 13, 'disaster_68f8513367e1d6.25111995.jpg', 'IMG_20240903_100548.jpg', 'uploads/disaster_68f8513367e1d6.25111995.jpg', '2025-10-22 03:36:20'),
(32, 13, 'disaster_68f85133b8c618.58381776.jpg', 'IMG_20240903_100532.jpg', 'uploads/disaster_68f85133b8c618.58381776.jpg', '2025-10-22 03:36:20'),
(33, 13, 'disaster_68f85134117457.45423621.jpg', 'IMG_20240903_114609.jpg', 'uploads/disaster_68f85134117457.45423621.jpg', '2025-10-22 03:36:20'),
(34, 13, 'disaster_68f85134634c92.38183022.jpg', 'IMG_20240903_114631.jpg', 'uploads/disaster_68f85134634c92.38183022.jpg', '2025-10-22 03:36:20'),
(35, 14, 'disaster_68f85134b14855.16679868.jpg', 'IMG_20240903_100818.jpg', 'uploads/disaster_68f85134b14855.16679868.jpg', '2025-10-22 03:36:22'),
(36, 14, 'disaster_68f85135102cc6.58114995.jpg', 'IMG_20240903_100548.jpg', 'uploads/disaster_68f85135102cc6.58114995.jpg', '2025-10-22 03:36:22'),
(37, 14, 'disaster_68f851355cf0d7.94444178.jpg', 'IMG_20240903_100532.jpg', 'uploads/disaster_68f851355cf0d7.94444178.jpg', '2025-10-22 03:36:22'),
(38, 14, 'disaster_68f85135a438c2.30048620.jpg', 'IMG_20240903_114609.jpg', 'uploads/disaster_68f85135a438c2.30048620.jpg', '2025-10-22 03:36:22'),
(39, 14, 'disaster_68f85135f34256.95605453.jpg', 'IMG_20240903_114631.jpg', 'uploads/disaster_68f85135f34256.95605453.jpg', '2025-10-22 03:36:22'),
(40, 15, 'disaster_68f858eba3cf52.06414092.png', 'Emblem_of_Minahasa_Regency (3).png', 'uploads/disaster_68f858eba3cf52.06414092.png', '2025-10-22 04:09:15'),
(41, 15, 'disaster_68f858eba89993.27454259.png', 'images.png', 'uploads/disaster_68f858eba89993.27454259.png', '2025-10-22 04:09:15'),
(42, 15, 'disaster_68f858ebad87b0.87907252.jpg', 'pngtree-beautiful-blue-christmas-background-design-picture-image_978133.jpg', 'uploads/disaster_68f858ebad87b0.87907252.jpg', '2025-10-22 04:09:15'),
(43, 15, 'disaster_68f858ebb66b73.08267174.jpg', 'lovepik-blue-stylish-merry-christmas-banner-background-image_450052086.jpg', 'uploads/disaster_68f858ebb66b73.08267174.jpg', '2025-10-22 04:09:15'),
(44, 15, 'disaster_68f858ebb94094.19971947.png', 'png-transparent-christmas-banners-on-a-blue-background-christmas-christmas-balls-beautiful.png', 'uploads/disaster_68f858ebb94094.19971947.png', '2025-10-22 04:09:15'),
(45, 16, 'disaster_68f859f31b0df2.35386347.png', 'Screenshot (41).png', 'uploads/disaster_68f859f31b0df2.35386347.png', '2025-10-22 04:13:39'),
(46, 16, 'disaster_68f859f333a495.39824793.png', 'Screenshot (39).png', 'uploads/disaster_68f859f333a495.39824793.png', '2025-10-22 04:13:39'),
(47, 16, 'disaster_68f859f34bbb50.37922801.png', 'Screenshot (40).png', 'uploads/disaster_68f859f34bbb50.37922801.png', '2025-10-22 04:13:39'),
(48, 16, 'disaster_68f859f364f843.78526440.png', 'Screenshot (42).png', 'uploads/disaster_68f859f364f843.78526440.png', '2025-10-22 04:13:39'),
(49, 16, 'disaster_68f859f37d85c5.23910369.png', 'Screenshot (38).png', 'uploads/disaster_68f859f37d85c5.23910369.png', '2025-10-22 04:13:39');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','head') NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `created_at`) VALUES
(1, 'user1', 'password123', 'user', '2025-10-21 05:36:48'),
(2, 'head1', 'password123', 'head', '2025-10-21 05:36:48');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `disasters`
--
ALTER TABLE `disasters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `submitted_by` (`submitted_by`);

--
-- Indexes for table `disaster_photos`
--
ALTER TABLE `disaster_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `disaster_id` (`disaster_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `disasters`
--
ALTER TABLE `disasters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `disaster_photos`
--
ALTER TABLE `disaster_photos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `disasters`
--
ALTER TABLE `disasters`
  ADD CONSTRAINT `disasters_ibfk_1` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `disaster_photos`
--
ALTER TABLE `disaster_photos`
  ADD CONSTRAINT `disaster_photos_ibfk_1` FOREIGN KEY (`disaster_id`) REFERENCES `disasters` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
