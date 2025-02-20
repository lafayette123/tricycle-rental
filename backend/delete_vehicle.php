<?php
include 'cors.php';
include 'connection.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    if (!isset($_POST['vehicle_id'])) {
        echo json_encode(["status" => 400, "message" => "Missing Vehicle ID"]);
        exit;
    }

    $vehicle_id = intval($_POST['vehicle_id']); // Sanitize input

    $sql = "DELETE FROM vehicles WHERE vehicle_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $vehicle_id);

    if ($stmt->execute()) {
        echo json_encode(["status" => 200, "message" => "Vehicle deleted successfully"]);
    } else {
        echo json_encode(["status" => 500, "message" => "Failed to delete Vehicle"]);
    }
} else {
    echo json_encode(["status" => 405, "message" => "Method Not Allowed"]);
}