<?php

include 'cors.php';

// Database connection
include 'connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_GET['step'] == 1) {

    $email = $_POST['email'];

    // Check if email already exists in the database
    $checkEmailQuery = "SELECT user_id FROM users WHERE email = '$email'";
    $result = $conn->query($checkEmailQuery);

    if ($result->num_rows > 0) {
        // Email exists, send error message
        echo json_encode(["status" => 400, "message" => "Email already exists."]);
        exit;
    }

    $firstname = $_POST['firstname'];
    $lastname = $_POST['lastname'];
    $mobile_number = $_POST['mobile_number'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    
    $query = "INSERT INTO users (first_name, last_name, mobile_number, email, password) VALUES ('$firstname', '$lastname', '$mobile_number', '$email', '$password')";
    if ($conn->query($query) === TRUE) {

        $user_id = $conn->insert_id;

        echo json_encode([
            "status" => 200, 
            "message" => "Registration successful", 
            "user_id" => $user_id
        ]);
    } else {
        echo json_encode(["status" => 401, "message" => "Error: " . $conn->error]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_GET['step'] == 2 && !empty($_POST['user_id'])) {

    $address = !empty($_POST['address']) ? $_POST['address'] : 'Cadiz City';
    $longitude = $_POST['longitude'];
    $latitude = $_POST['latitude'];
    $user_type = $_POST['user_type'];
    $user_id = $_POST['user_id'];
    $license_number = $_POST['license_number'];
    
    $query = "UPDATE users SET address = '$address', longitude = '$longitude', latitude = '$latitude', vehicle_owner = '$user_type', license_number = '$license_number' WHERE user_id = '$user_id'";
    if ($conn->query($query) === TRUE) {
        echo json_encode(["status" => 200, "message" => "Registration successful", "user_type" => $user_type]);
    } else {
        echo json_encode(["status" => 401, "message" => "Error: " . $conn->error]);
    }
}