-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 20, 2025 at 08:59 AM
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
-- Database: `tricycle_rental`
--

-- --------------------------------------------------------

--
-- Table structure for table `rent`
--

CREATE TABLE `rent` (
  `rental_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `renter_id` int(11) NOT NULL,
  `duration` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `tracking_enabled` tinyint(1) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rent`
--

INSERT INTO `rent` (`rental_id`, `vehicle_id`, `renter_id`, `duration`, `status`, `tracking_enabled`, `timestamp`) VALUES
(31, 66, 61, '3', 'Turnover', 0, '2025-02-20 03:27:45');

-- --------------------------------------------------------

--
-- Table structure for table `tracking`
--

CREATE TABLE `tracking` (
  `tracking_id` int(11) NOT NULL,
  `rent_id` int(11) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `first_name` varchar(250) NOT NULL,
  `last_name` varchar(250) NOT NULL,
  `mobile_number` varchar(255) NOT NULL,
  `email` varchar(250) NOT NULL,
  `password` varchar(250) NOT NULL,
  `vehicle_owner` int(11) NOT NULL,
  `address` varchar(255) NOT NULL,
  `longitude` double NOT NULL,
  `latitude` double NOT NULL,
  `role` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `first_name`, `last_name`, `mobile_number`, `email`, `password`, `vehicle_owner`, `address`, `longitude`, `latitude`, `role`) VALUES
(57, 'John', 'Doe', '+639123456789', 'john@mail.com', '$2y$10$UMmpYu1GV1bKQGO/Cg7Gz.e4sGFkSCtqRjBbir2XOnA/huonOmEsC', 1, '', 123.30862641334534, 10.953626698474102, 1),
(59, 'Mark', 'Doe', '+639123456789', 'mark@mail.com', '$2y$10$MLHRBYdzjDgXDYy7WWy7DOQ8CuDgLwTrmAKpEEC98eAyOaWwB4uUy', 0, 'Cadiz City', 123.31119735683978, 10.956322893315262, 0),
(61, 'Denver', 'Doe', '+639386997571', 'denver@mail.com', '$2y$10$/0U0buy/szyNfbLv6ijBo.il6q9YZytHBsZVU58G1Z2eVbNyZbU0i', 0, 'Cadiz City', 123.31121298762962, 10.95630167728544, 0);

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `vehicle_id` int(11) NOT NULL,
  `number` varchar(255) NOT NULL,
  `make` varchar(255) NOT NULL,
  `model` varchar(255) NOT NULL,
  `price` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `owner_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`vehicle_id`, `number`, `make`, `model`, `price`, `location`, `status`, `latitude`, `longitude`, `owner_id`) VALUES
(66, '0001', 'Kawasaki Barako ', '2018', '300', '', 'Available', 10.953626698474102, 123.30862641334534, 57),
(67, '0002', 'Bajaj', '2017', '300', '', 'Available', 10.953626698474102, 123.30862641334534, 57);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `rent`
--
ALTER TABLE `rent`
  ADD PRIMARY KEY (`rental_id`),
  ADD KEY `vehicle_id` (`vehicle_id`),
  ADD KEY `renter_id` (`renter_id`);

--
-- Indexes for table `tracking`
--
ALTER TABLE `tracking`
  ADD PRIMARY KEY (`tracking_id`),
  ADD KEY `rent_id` (`rent_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`vehicle_id`),
  ADD UNIQUE KEY `unique_vehicle_number` (`number`),
  ADD KEY `owner_id` (`owner_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `rent`
--
ALTER TABLE `rent`
  MODIFY `rental_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `tracking`
--
ALTER TABLE `tracking`
  MODIFY `tracking_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=794;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `vehicle_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `rent`
--
ALTER TABLE `rent`
  ADD CONSTRAINT `rent_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`),
  ADD CONSTRAINT `rent_ibfk_2` FOREIGN KEY (`renter_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `tracking`
--
ALTER TABLE `tracking`
  ADD CONSTRAINT `tracking_ibfk_1` FOREIGN KEY (`rent_id`) REFERENCES `rent` (`rental_id`);

--
-- Constraints for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
