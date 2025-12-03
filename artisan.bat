@echo off
REM Script para rodar comandos Artisan com OpenSSL configurado
set OPENSSL_CONF=C:\PHP\openssl.cnf
php artisan %*
