<?php

echo "Testing OpenSSL EC support...\n\n";

// Test 1: Extension loaded
echo "1. OpenSSL extension: " . (extension_loaded('openssl') ? "✓ Loaded" : "✗ Not loaded") . "\n";
echo "   Version: " . OPENSSL_VERSION_TEXT . "\n";

// Test 2: EC constant defined
echo "\n2. EC Key Type constant: " . (defined('OPENSSL_KEYTYPE_EC') ? "✓ Defined" : "✗ Not defined") . "\n";

// Test 3: Try to create EC key
echo "\n3. Creating EC key (prime256v1)...\n";
$config = [
    'private_key_type' => OPENSSL_KEYTYPE_EC,
    'curve_name' => 'prime256v1',
];

$key = @openssl_pkey_new($config);
if ($key !== false) {
    echo "   ✓ EC key created successfully!\n";

    // Try to export it
    $exported = '';
    if (openssl_pkey_export($key, $exported)) {
        echo "   ✓ Key exported successfully\n";
        echo "   Key preview: " . substr($exported, 0, 50) . "...\n";
    } else {
        echo "   ✗ Failed to export: " . openssl_error_string() . "\n";
    }
} else {
    echo "   ✗ Failed to create EC key\n";
    echo "   Error: " . openssl_error_string() . "\n";

    while ($msg = openssl_error_string()) {
        echo "   Additional error: $msg\n";
    }
}

// Test 4: Check available curves
echo "\n4. Available curves:\n";
$curves = openssl_get_curve_names();
if ($curves && in_array('prime256v1', $curves)) {
    echo "   ✓ prime256v1 is available\n";
} else {
    echo "   ✗ prime256v1 is NOT available\n";
    if ($curves) {
        echo "   Available curves: " . implode(', ', array_slice($curves, 0, 10)) . "...\n";
    }
}

echo "\nTest complete.\n";
