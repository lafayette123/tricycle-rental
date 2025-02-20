<?php

include 'cors.php';

// Database connection
include 'connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userId = $_POST['user_id'];
    $number = $_POST['number'];
    $make = $_POST['make'];
    $model = $_POST['model'];
    $price = $_POST['price'];
    $location = $_POST['location'];
    $status = $_POST['status'];
    $longitude = $_POST['longitude'];
    $latitude = $_POST['latitude'];

    // Check if the vehicle number already exists
    $checkQuery = "SELECT vehicle_id FROM vehicles WHERE number = ?";
    $stmt = $conn->prepare($checkQuery);
    $stmt->bind_param("s", $number);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        echo json_encode(["status" => 409, "message" => "Vehicle number already exists"]);
    } else {
        // Insert the new vehicle
        $query = "INSERT INTO vehicles (number, make, model, price, location, status, longitude, latitude, owner_id) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("sssssssss", $number, $make, $model, $price, $location, $status, $longitude, $latitude, $userId);
        
        if ($stmt->execute()) {
            echo json_encode(["status" => 200, "message" => "Registration successful"]);
        } else {
            echo json_encode(["status" => 500, "message" => "Error: " . $stmt->error]);
        }
    }

    $stmt->close();
}
