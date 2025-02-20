<?php
include 'cors.php';
include 'connection.php';

$rent_id = isset($_POST['rent_id']) ? intval($_POST['rent_id']) : 0;
$latitude = isset($_POST['latitude']) ? floatval($_POST['latitude']) : 0;
$longitude = isset($_POST['longitude']) ? floatval($_POST['longitude']) : 0;

if ($rent_id > 0 && $latitude != 0 && $longitude != 0) {
    // Check if tracking is enabled
    $checkQuery = "SELECT tracking_enabled FROM rent WHERE rental_id = ?";
    $stmt = $conn->prepare($checkQuery);
    $stmt->bind_param("i", $rent_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    if ($row && $row['tracking_enabled'] == 1) {
        $query = "INSERT INTO tracking (rent_id, latitude, longitude, recorded_at) VALUES (?, ?, ?, NOW())";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("idd", $rent_id, $latitude, $longitude);
        $stmt->execute();
        echo json_encode(["success" => true, "message" => "Location updated"]);
    } else {
        echo json_encode(["success" => false, "message" => "Tracking not enabled"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid data"]);
}
