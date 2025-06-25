@echo off
title LOCAL DEV ENVIRONMENT - ProductService (3002), AuthService (3001), OrderService (3003), Front-End (8080)
color 0a
echo ============================================
echo  STARTING LOCAL DEVELOPMENT ENVIRONMENT
echo ============================================
echo.

REM Đặt đường dẫn tới các thư mục service (giống với Docker Compose)
set AUTH_SERVICE_DIR=.\AuthService
set PRODUCT_SERVICE_DIR=.\ProductService
set ORDER_SERVICE_DIR=.\OrderService
set FRONTEND_DIR=.\Front-End

REM Kiểm tra thư mục tồn tại
if not exist "%AUTH_SERVICE_DIR%" (
    echo ERROR: AuthService directory not found at %AUTH_SERVICE_DIR%
    pause
    exit /b 1
)

if not exist "%PRODUCT_SERVICE_DIR%" (
    echo ERROR: ProductService directory not found at %PRODUCT_SERVICE_DIR%
    pause
    exit /b 1
)

if not exist "%ORDER_SERVICE_DIR%" (
    echo ERROR: OrderService directory not found at %ORDER_SERVICE_DIR%
    pause
    exit /b 1
)

if not exist "%FRONTEND_DIR%" (
    echo ERROR: Front-End directory not found at %FRONTEND_DIR%
    pause
    exit /b 1
)

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

REM Khởi chạy các service với port theo Docker Compose
start "AuthService (3001)" cmd /k "cd /d %AUTH_SERVICE_DIR% && echo Starting AuthService on port 3001... && node server.js"
start "ProductService (3002)" cmd /k "cd /d %PRODUCT_SERVICE_DIR% && echo Starting ProductService on port 3002... && node server.js"
start "OrderService (3003)" cmd /k "cd /d %ORDER_SERVICE_DIR% && echo Starting OrderService on port 3003... && node server.js"

REM Front-End sẽ chạy sau cùng
timeout /t 5 /nobreak >nul
start "Front-End (8080)" cmd /k "cd /d %FRONTEND_DIR% && echo Starting Front-End on port 8080... && node app.js"

echo.
echo ============================================
echo  ALL SERVICES STARTED SUCCESSFULLY!
echo ============================================
echo AuthService:    http://localhost:3001
echo ProductService: http://localhost:3002
echo OrderService:   http://localhost:3003
echo Front-End:      http://localhost:8080
echo.
echo NOTE: Verify these configurations in your code:
echo - Backend services must listen to their respective ports (3001, 3002, 3003)
echo - Frontend must use correct API endpoints (http://localhost:3001, etc.)
echo - Enable CORS in backend services
pause