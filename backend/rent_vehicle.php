<?php
include 'cors.php';

// Database connection
include 'connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $vehicleId = $_POST['vehicle_id'];
    $renterId = $_POST['renter_id'];
    $duration = $_POST['duration'];
    $status = $_POST['status'];

    // Insert the new rent vehicle
    $query = "INSERT INTO rent (vehicle_id, renter_id, duration, status) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("iiss", $vehicleId, $renterId, $duration, $status);

    if ($stmt->execute()) {
        echo json_encode(["status" => 200, "message" => "Rent vehicle successful"]);
    } else {
        echo json_encode(["status" => 500, "message" => "Error: " . $stmt->error]);
    }

    $stmt->close();
}