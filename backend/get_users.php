<?php

include 'cors.php';
include 'connection.php';

$sql = "SELECT * FROM users";
$result = $conn->query($sql);

$users = [];

while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}

echo json_encode([
    'status' => 200,
    'data' => $users
]);

$conn->close();