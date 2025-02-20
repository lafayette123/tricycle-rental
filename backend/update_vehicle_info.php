<?php

include 'cors.php';
include 'connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $vehicleId = $_POST['vehicle_id'];
    $number = $_POST['number'];
    $make = $_POST['make'];
    $model = $_POST['model'];
    $price = $_POST['price'];

    // Check if the vehicle exists
    $checkQuery = "SELECT vehicle_id FROM vehicles WHERE vehicle_id = ?";
    $stmt = $conn->prepare($checkQuery);
    $stmt->bind_param("s", $vehicleId);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows == 0) {
        echo json_encode(["status" => 404, "message" => "Vehicle not found"]);
    } else {
        // Update vehicle information
        $query = "UPDATE vehicles SET number = ?, make = ?, model = ?, price = ? WHERE vehicle_id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("sssss", $number, $make, $model, $price, $vehicleId);

        if ($stmt->execute()) {
            echo json_encode(["status" => 200, "message" => "Vehicle updated successfully"]);
        } else {
            echo json_encode(["status" => 500, "message" => "Error: " . $stmt->error]);
        }
    }

    $stmt->close();
}
