<?php
include 'cors.php';
include 'connection.php';

$rent_id = isset($_GET['rent_id']) ? intval($_GET['rent_id']) : 0;

if ($rent_id > 0) {
    $query = "SELECT tracking_enabled FROM rent WHERE rental_id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $rent_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    echo json_encode(["success" => true, "tracking_enabled" => $row['tracking_enabled']]);
} else {
    echo json_encode(["success" => false, "message" => "Invalid rent ID"]);
}