<?php
include 'cors.php';
include 'connection.php';

$vehicle_id = isset($_GET['vehicle_id']) ? intval($_GET['vehicle_id']) : 0;

if ($vehicle_id > 0) {
    // Get the active rental session for this vehicle
    $query = "SELECT rental_id FROM rent WHERE vehicle_id = ? AND tracking_enabled = 1 AND status = 'Turnover' LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $vehicle_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $rental = $result->fetch_assoc();

    if ($rental) {
        $rent_id = $rental['rental_id'];

        // Fetch tracking data for this rental session
        $query = "SELECT latitude, longitude, recorded_at FROM tracking WHERE rent_id = ? ORDER BY recorded_at DESC";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $rent_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $tracking_data = [];
        while ($row = $result->fetch_assoc()) {
            $tracking_data[] = $row;
        }

        echo json_encode(["success" => true, "data" => $tracking_data]);
    } else {
        echo json_encode(["success" => false, "message" => "No active tracking session"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid vehicle ID"]);
}