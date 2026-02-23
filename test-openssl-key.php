<?php

echo "=== Teste OpenSSL Key Generation ===\n\n";

// Testar criação de chave EC
$keyResource = openssl_pkey_new([
    'curve_name' => 'prime256v1',
    'private_key_type' => OPENSSL_KEYTYPE_EC,
]);

if (!$keyResource) {
    echo "❌ FAILED to create key\n";
    echo "OpenSSL Error: " . openssl_error_string() . "\n";

    // Mostrar todas as mensagens de erro
    while ($msg = openssl_error_string()) {
        echo "  - " . $msg . "\n";
    }
} else {
    echo "✓ SUCCESS creating key\n";

    $details = openssl_pkey_get_details($keyResource);
    if ($details) {
        echo "✓ Got key details\n";
        echo "Key type: " . $details['type'] . "\n";
        echo "Bits: " . $details['bits'] . "\n";
    } else {
        echo "❌ Failed to get key details\n";
    }
}

// Verificar configuração OpenSSL
echo "\n=== OpenSSL Info ===\n";
echo "Version: " . OPENSSL_VERSION_TEXT . "\n";

// Verificar php.ini
echo "\n=== PHP Configuration ===\n";
echo "openssl extension loaded: " . (extension_loaded('openssl') ? 'YES' : 'NO') . "\n";

$ini = php_ini_loaded_file();
echo "php.ini loaded from: " . $ini . "\n";

// Verificar OPENSSL_CONF
$opensslConf = getenv('OPENSSL_CONF');
echo "OPENSSL_CONF env var: " . ($opensslConf ? $opensslConf : 'NOT SET') . "\n";
