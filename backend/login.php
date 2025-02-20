<?php

include 'cors.php';

// Include your JWT functions (e.g., validate and generate JWT)
include_once 'jwt.php';  // Make sure you have a valid JWT generation and validation function

// Set the response header to JSON format
header('Content-Type: application/json');

// Database connection
include 'connection.php';

// Check connection
if ($conn->connect_error) {
    die(json_encode(['status' => 500, 'message' => 'Database connection failed']));
}

// Get POST data (email, password)
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

// Validate input
if (empty($email) || empty($password)) {
    echo json_encode(['status' => 400, 'message' => 'Email and password are required']);
    exit;
}

// Sanitize input to prevent SQL injection
$email = $conn->real_escape_string($email);

// Query the database to find the user
$sql = "SELECT * FROM users WHERE email = '$email' LIMIT 1";
$result = $conn->query($sql);

if ($result->num_rows == 0) {
    echo json_encode(['status' => 404, 'message' => 'User not found']);
    exit;
}

$user = $result->fetch_assoc();

// Check password
if (!password_verify($password, $user['password'])) {
    echo json_encode(['status' => 401, 'message' => 'Incorrect password']);
    exit;
}

// Generate JWT token (using your `generateJWT` function from jwt.php)
$token = generateJWT($user['user_id']);  // Assume `generateJWT` accepts user ID and returns a JWT

// Send success response with token
echo json_encode([
    'status' => 200,
    'message' => 'Login successful',
    'token' => $token,
    'user_id' => $user['user_id'],
    'user_type' => $user['vehicle_owner'],
    'role' => $user['role']
]);

$conn->close();