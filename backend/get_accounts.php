<?php

include 'cors.php';

// Database connection
include 'connection.php';

$userId = $_GET['user_id'] ?? '';
$whereClause = "WHERE user_id = '$userId'";

$sql = "SELECT * FROM users $whereClause";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode(['status' => 200, 'data' => $data]);
} else {
    echo json_encode(['status' => 200, 'data' => []]);
}

$conn->close();