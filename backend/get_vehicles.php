<?php

include 'cors.php';

// Database connection
include 'connection.php';

if(isset($_GET['get_history'])) {

    $vehicleId = $_GET['vehicle_id'];

    $sql = "SELECT r.*, u.*, v.number FROM rent r
            LEFT JOIN users u ON r.renter_id = u.user_id
            LEFT JOIN vehicles v ON r.vehicle_id = v.vehicle_id
            WHERE r.vehicle_id = ?";

    // Secure the query using prepared statements
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $vehicleId);
    $stmt->execute();
    $result = $stmt->get_result();

    $data = [];

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $data[] = $row; // Add each row to the data array
        }
        echo json_encode(['status' => 200, 'data' => $data]);
    } else {
        echo json_encode(['status' => 404, 'message' => 'Vehicle not found']);
    }

    $stmt->close();
    $conn->close();

} elseif(isset($_GET['owner_id'])) {

    $ownerId = $_GET['owner_id'] ?? ''; // Optional filter for owner_id
    $whereClause = $ownerId ? "WHERE a.owner_id = '$ownerId'" : '';

    $sql = "SELECT a.*, b.* FROM vehicles a LEFT JOIN users b ON a.owner_id = b.user_id $whereClause";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $vehicles = [];
        while ($row = $result->fetch_assoc()) {
            $vehicles[] = $row;
        }
        echo json_encode(['status' => 200, 'data' => $vehicles]);
    } else {
        echo json_encode(['status' => 200, 'data' => []]);
    }

    $conn->close();

} elseif(isset($_GET['latitude']) && isset($_GET['longitude'])) {
    
    // Handle location-based search
    $latitude = $_GET['latitude'];
    $longitude = $_GET['longitude'];
    $radius = $_GET['radius'] ?? 10; // Default radius is 10 km

    $sql = "SELECT v.*, u.*,
            (6371 * acos(
                cos(radians($latitude)) * cos(radians(v.latitude)) *
                cos(radians(v.longitude) - radians($longitude)) +
                sin(radians($latitude)) * sin(radians(v.latitude))
            )) AS distance
            FROM vehicles v
            LEFT JOIN users u ON v.owner_id = u.user_id
            HAVING distance <= $radius
            ORDER BY distance ASC";

    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $vehicles = [];
        while ($row = $result->fetch_assoc()) {
            $vehicles[] = $row;
        }
        echo json_encode(['status' => 200, 'data' => $vehicles]);
    } else {
        echo json_encode(['status' => 404, 'message' => 'No vehicles found']);
    }

    $conn->close();
} elseif(isset($_GET['vehicle_id'])) {

    $vehicleId = $_GET['vehicle_id'];

    // Secure the query using prepared statements
    $stmt = $conn->prepare("SELECT * FROM vehicles WHERE vehicle_id = ?");
    $stmt->bind_param("i", $vehicleId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $vehicle = $result->fetch_assoc();
        echo json_encode(['status' => 200, 'data' => $vehicle]);
    } else {
        echo json_encode(['status' => 404, 'message' => 'Vehicle not found']);
    }

    $stmt->close();
    $conn->close();

} else {
    // Handle invalid or missing parameters
    echo json_encode(['status' => 400, 'message' => 'Invalid request. Please provide the required parameters.']);
}