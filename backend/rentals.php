<?php
include 'cors.php';
include 'connection.php';

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
$rental_id = isset($_GET['rental_id']) ? $_GET['rental_id'] : null;
$status = isset($_GET['status']) ? $_GET['status'] : null;

$action = $_GET['action'];

switch ($action) {
    case 'rent_vehicle':

        $vehicleId = $_POST['vehicle_id'];
        $renterId = $_POST['renter_id'];
        $duration = $_POST['duration'];
        $status = $_POST['status'];
    
        $query = "INSERT INTO rent (vehicle_id, renter_id, duration, status) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("iiss", $vehicleId, $renterId, $duration, $status);
    
        if ($stmt->execute()) {
            echo json_encode(["status" => 200, "message" => "Rent vehicle successful, please wait for some moment for the owner to approve your rental request. Thankyou!"]);
        } else {
            echo json_encode(["status" => 500, "message" => "Error: " . $stmt->error]);
        }
    
        $stmt->close();

        break;

    case 'update_status':

        // Update the rental status
        $query = "UPDATE rent SET status = ? WHERE rental_id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("si", $status, $rental_id);
    
        if ($stmt->execute()) {
            // Fetch the vehicle_id associated with this rental
            $vehicleQuery = "SELECT vehicle_id, renter_id FROM rent WHERE rental_id = ?";
            $stmtVehicle = $conn->prepare($vehicleQuery);
            $stmtVehicle->bind_param("i", $rental_id);
            $stmtVehicle->execute();
            $result = $stmtVehicle->get_result();
            $rentalData = $result->fetch_assoc();
            $stmtVehicle->close();
    
            if ($rentalData) {
                $vehicle_id = $rentalData['vehicle_id'];
                $renter_id = $rentalData['renter_id'];
    
                // If the status is "Approved", update the vehicle status to "Not Available"
                if ($status === 'Approved') {
                    $updateVehicleQuery = "UPDATE vehicles SET status = 'Not Available' WHERE vehicle_id = ?";
                    $stmtUpdateVehicle = $conn->prepare($updateVehicleQuery);
                    $stmtUpdateVehicle->bind_param("i", $vehicle_id);
                    $stmtUpdateVehicle->execute();
                    $stmtUpdateVehicle->close();
                }
            }
    
            if($status == 'Approved') {
                echo json_encode(["status" => 200, "message" => "Rental updated successfully, please wait for some moment for the renter to confirm your approval. Thankyou!"]);
            }

            if($status == 'Confirmed') {
                echo json_encode(["status" => 200, "message" => "Rental Confirmed!"]);
            }

            if($status == 'Agreement Confirmed') {
                echo json_encode(["status" => 200, "message" => "Agreement & Documentation submitted, you may contact the owner's phone number or go to owners location for pick up of vehicle."]);
            }

            if($status == 'Turnover') {

                $query = "UPDATE vehicles SET status = 'On-Rent' WHERE vehicle_id = ?";
                $stmt = $conn->prepare($query);
                $stmt->bind_param("i", $vehicle_id);
            
                if ($stmt->execute()) {
                    echo json_encode(["status" => 200, "message" => "Vehicle succesfully turnover!"]);
                }
            }
            
        } else {
            echo json_encode(["status" => 500, "message" => "Database error: " . $stmt->error]);
        }
    
        break;
        

    case 'load_rental_notifications':

        $user_type = $_GET['user_type'];

        $condition = $user_type == 1 ? "WHERE r.status = 'Pending' OR r.status = 'Agreement Confirmed' AND v.owner_id = ?" : "WHERE r.status != 'Pending' AND u.user_id = ?";

        $query = "SELECT r.*, r.status as rental_status, v.*, v.status as vehicle_status, u.*
                        FROM rent r 
                        LEFT JOIN vehicles v ON r.vehicle_id = v.vehicle_id 
                        LEFT JOIN users u ON r.renter_id = u.user_id
                        $condition";

        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $user_id);

        $stmt->execute();
        $result = $stmt->get_result();

        $rentals = [];
        while ($row = $result->fetch_assoc()) {
            $rentals[] = $row;
        }

        echo json_encode(["status" => 200, "data" => $rentals]);

        break;

    case 'get_rental':

        $query = "SELECT r.*, v.*, 
                    renter.first_name as renter_first_name, 
                    renter.last_name as renter_last_name,
                    renter.mobile_number as renter_mobile_number,
                    renter.email as renter_email,
                    renter.address as renter_address,
                    
                    owner.first_name as owner_first_name, 
                    owner.last_name as owner_last_name,
                    owner.mobile_number as owner_mobile_number,
                    owner.email as owner_email,
                    owner.address as owner_address

                    FROM rent r 
                    LEFT JOIN vehicles v ON r.vehicle_id = v.vehicle_id 
                    LEFT JOIN users renter ON r.renter_id = renter.user_id
                    LEFT JOIN users owner ON v.owner_id = owner.user_id
                    WHERE r.rental_id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $rental_id);

        $stmt->execute();
        $result = $stmt->get_result();

        $rentals = [];
        while ($row = $result->fetch_assoc()) {
            $rentals[] = $row;
        }

        echo json_encode(["status" => 200, "data" => $rentals]);

        break;

    default:

        break;
}