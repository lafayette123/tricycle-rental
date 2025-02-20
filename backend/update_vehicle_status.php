<?php

include 'cors.php';
include 'connection.php';

$vehicleId = $_POST['vehicle_id'] ?? '';
$status = $_POST['status'] ?? '';

if (!$vehicleId) {
    echo json_encode(['status' => 400, 'message' => 'Vehicle ID is required']);
    exit;
}

// Update vehicle status to Available
$sql = "UPDATE vehicles SET status = ? WHERE vehicle_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $status, $vehicleId);

if ($stmt->execute()) {
    echo json_encode(['status' => 200, 'message' => 'Vehicle status updated to ' . $status]);
} else {
    echo json_encode(['status' => 500, 'message' => 'Failed to update vehicle status']);
}

$stmt->close();
$conn->close();
