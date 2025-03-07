<?php
include 'cors.php';
include 'connection.php';

$rental_id = $_GET['rental_id'];

$sql = "SELECT r.*, v.* FROM rent r
        LEFT JOIN vehicles v ON r.vehicle_id = v.vehicle_id WHERE r.rental_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $rental_id,);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

if ($row) {
    echo json_encode(["status" => 200, "data" => $row]);
} else {
    echo json_encode(["status" => 404, "message" => "No data found"]);
}

$stmt->close();
$conn->close();