@echo off
setlocal

:: ----------------------
:: Step 1: Tạo file .env
:: ----------------------
echo ======================================
echo [+] Creating .env files...
echo ======================================

:: AuthService
echo DB_HOST=mldb.postgres.database.azure.com > AuthService\.env
echo DB_PORT=5432 >> AuthService\.env
echo DB_USER=ml_admin >> AuthService\.env
echo DB_PASSWORD="ml#web_db#2224" >> AuthService\.env
echo DB_NAME=user >> AuthService\.env
echo PORT=3001 >> AuthService\.env
echo JWT_SECRET=my_super_secret_key_123456 >> AuthService\.env

:: ProductService
echo DB_HOST=mldb.postgres.database.azure.com > ProductService\.env
echo DB_PORT=5432 >> ProductService\.env
echo DB_USER=ml_admin >> ProductService\.env
echo DB_PASSWORD="ml#web_db#2224" >> ProductService\.env
echo DB_NAME=product >> ProductService\.env
echo PORT=3002 >> ProductService\.env
echo JWT_SECRET=my_super_secret_key_123456 >> ProductService\.env

:: OrderService
echo DB_HOST=mldb.postgres.database.azure.com > OrderService\.env
echo DB_PORT=5432 >> OrderService\.env
echo DB_USER=ml_admin >> OrderService\.env
echo DB_PASSWORD="ml#web_db#2224" >> OrderService\.env
echo DB_NAME=order >> OrderService\.env
echo PORT=3003 >> OrderService\.env
echo JWT_SECRET=my_super_secret_key_123456 >> OrderService\.env

:: Front-End
echo API_BASE_URL=http://localhost > Front-End\.env
echo [DONE] .env files created.

echo ======================================
echo [+] Building Docker images...
echo ======================================
docker-compose up --build

echo ======================================
echo [+] Tagging and pushing images...
echo ======================================

docker tag auth-service 22127471/auth-service
docker tag product-service 22127471/product-service
docker tag order-service 22127471/order-service
docker tag front-end 22127471/front-end

docker push 22127471/auth-service
docker push 22127471/product-service
docker push 22127471/order-service
docker push 22127471/front-end

echo ======================================
echo [DONE] Docker images built successfully.
echo ======================================

echo ======================================
echo [+] Deleting Docker containers...
echo ======================================
docker-compose down --rmi all
echo ======================================
echo [DONE] Docker containers deleted successfully.
echo ======================================

echo ======================================
echo [+] Cleaning up .env files...
echo ======================================

del /f /q AuthService\.env
del /f /q ProductService\.env
del /f /q OrderService\.env
del /f /q Front-End\.env

echo ======================================
echo [DONE] Cleaned up. Done.
echo ======================================

endlocal