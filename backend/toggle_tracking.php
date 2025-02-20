<?php
include 'cors.php';
include 'connection.php';

$vehicle_id = isset($_POST['vehicle_id']) ? intval($_POST['vehicle_id']) : 0;
$enable_tracking = isset($_POST['enable']) ? intval($_POST['enable']) : 0;

if ($vehicle_id > 0) {
    $query = "UPDATE rent SET tracking_enabled = ? WHERE vehicle_id = ? AND status = 'Turnover'";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ii", $enable_tracking, $vehicle_id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => $enable_tracking ? "Tracking started" : "Tracking stopped"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to update tracking"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid vehicle ID"]);
}