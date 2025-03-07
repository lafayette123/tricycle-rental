<?php

include 'cors.php';

// Database connection
include 'connection.php';

if(isset($_GET['get_history'])) {

    $vehicleId = isset($_GET['vehicle_id']) ? $_GET['vehicle_id'] : '';
    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : '';

    $sql = "SELECT r.*, u.*, v.number FROM rent r
            LEFT JOIN users u ON r.renter_id = u.user_id
            LEFT JOIN vehicles v ON r.vehicle_id = v.vehicle_id";

    $params = [];
    $types = "";

    if (!empty($vehicleId) && !empty($user_id)) {
        $sql .= " WHERE r.vehicle_id = ? AND v.owner_id = ?";
        $params[] = $vehicleId;
        $params[] = $user_id;
        $types .= "ii";
    } else {
        $sql .= " WHERE v.owner_id = ?";
        $params[] = $user_id;
        $types .= "i";
    }

    // Prepare the statement
    $stmt = $conn->prepare($sql);

    // Bind parameters if needed
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $data = [];

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // Convert timestamp to DateTime
            $startDate = new DateTime($row['timestamp']);
            $duration = (int) $row['duration']; // Convert duration to integer
            $dueDate = clone $startDate;
            $dueDate->modify("+$duration days"); // Calculate due date

            // Compare with current date
            $now = new DateTime();
            $isDue = $now > $dueDate; // True if the due date has passed

            // Add due status to the response
            $row['due_status'] = $isDue ? 'Due' : 'Not Due';
            $data[] = $row;
        }

        $response = [
            'status' => 200,
            'data' => $data
        ];
    } else {
        $response = [
            'status' => 404,
            'data' => [],
            'message' => 'Vehicle not found'
        ];
    }

    echo json_encode($response);

    // Clean up
    $stmt->close();
    $conn->close();

} elseif(isset($_GET['owner_id'])) {

    $ownerId = $_GET['owner_id'] ?? ''; // Optional filter for owner_id
    $whereClause = $ownerId ? "WHERE a.owner_id = '$ownerId'" : '';

    $sql = "SELECT a.*, b.* FROM vehicles a LEFT JOIN users b ON a.owner_id = b.user_id $whereClause";
    $result = $conn->query($sql);

    // Count available and not available vehicles
    $countStmt = $conn->prepare("SELECT 
                                    SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) AS available,
                                    SUM(CASE WHEN status != 'Available' THEN 1 ELSE 0 END) AS not_available
                                FROM vehicles WHERE owner_id = $ownerId");
    $countStmt->execute();
    $countResult = $countStmt->get_result();
    $countData = $countResult->fetch_assoc();

    $available = $countData['available'] ?? 0;
    $not_available = $countData['not_available'] ?? 0;

    if ($result->num_rows > 0) {
        $vehicles = [];
        while ($row = $result->fetch_assoc()) {
            $vehicles[] = $row;
        }
        echo json_encode([
            'status' => 200, 
            'data' => $vehicles,
            'available' => $available,
            'not_available' => $not_available
        ]);
    } else {
        echo json_encode(['status' => 200, 'data' => []]);
    }

    $conn->close();

} elseif(isset($_GET['latitude']) && isset($_GET['longitude'])) {
    
    // Handle location-based search
    $latitude = $_GET['latitude'];
    $longitude = $_GET['longitude'];
    $radius = $_GET['radius'] ?? 10; // Default radius is 10 km

    $sql = "SELECT v.*, u.*,
            (6371 * acos(
                cos(radians($latitude)) * cos(radians(v.latitude)) *
                cos(radians(v.longitude) - radians($longitude)) +
                sin(radians($latitude)) * sin(radians(v.latitude))
            )) AS distance
            FROM vehicles v
            LEFT JOIN users u ON v.owner_id = u.user_id
            HAVING distance <= $radius
            ORDER BY distance ASC";

    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $vehicles = [];
        while ($row = $result->fetch_assoc()) {
            $vehicles[] = $row;
        }
        echo json_encode(['status' => 200, 'data' => $vehicles]);
    } else {
        echo json_encode(['status' => 404, 'message' => 'No vehicles found']);
    }

    $conn->close();
} elseif(isset($_GET['vehicle_id'])) {

    $vehicleId = $_GET['vehicle_id'];

    // Secure the query using prepared statements
    $stmt = $conn->prepare("SELECT * FROM vehicles WHERE vehicle_id = ?");
    $stmt->bind_param("i", $vehicleId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $vehicle = $result->fetch_assoc();
        echo json_encode(['status' => 200, 'data' => $vehicle]);
    } else {
        echo json_encode(['status' => 404, 'message' => 'Vehicle not found']);
    }

    $stmt->close();
    $conn->close();

} else {
    // Handle invalid or missing parameters
    echo json_encode(['status' => 400, 'message' => 'Invalid request. Please provide the required parameters.']);
}