<?php

function generateJWT($user_id) {
    $issuedAt = time();
    $expirationTime = $issuedAt + 3600;  // JWT valid for 1 hour from the issued time
    $secretKey = 'your_secret_key';  // Replace with your secret key, keep it secure

    // Create the payload data
    $payload = [
        'iat' => $issuedAt,            // Issued at: time when the JWT was generated
        'exp' => $expirationTime,      // Expiration time: when the JWT will expire
        'user_id' => $user_id          // The user ID stored in the JWT
    ];

    // Encode the JWT
    $jwt = encodeJWT($payload, $secretKey);
    return $jwt;
}

function encodeJWT($payload, $secretKey) {
    // Encode the header (set the algorithm and type)
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    
    // Base64 encode the header
    $header = base64UrlEncode($header);
    
    // Encode the payload
    $payload = json_encode($payload);
    $payload = base64UrlEncode($payload);

    // Create the signature
    $signature = hash_hmac('sha256', "$header.$payload", $secretKey, true);
    
    // Base64 encode the signature
    $signature = base64UrlEncode($signature);

    // Return the JWT in the form of header.payload.signature
    return "$header.$payload.$signature";
}

function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}