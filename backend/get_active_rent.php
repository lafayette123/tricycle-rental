<?php
include 'cors.php';
include 'connection.php';

$user_id = intval($_GET['user_id']);

$sql = "SELECT rental_id FROM rent WHERE renter_id = ? AND status = 'Turnover' ORDER BY timestamp DESC LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

if ($row) {
    echo json_encode(["success" => true, "rent_id" => $row['rental_id']]);
} else {
    echo json_encode(["success" => false, "message" => "No active rent found"]);
}

$stmt->close();
$conn->close();