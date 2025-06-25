@echo off
echo ============================
echo 🚀 Starting Minikube Deployment with Ingress
echo ============================

REM Step 1: Start Minikube if not already running
minikube status | findstr /C:"Running" >nul
if %errorlevel% neq 0 (
    echo 🔄 Minikube is not running. Starting Minikube...
    minikube start
)

REM Step 2: Enable ingress addon
echo ✅ Enabling ingress addon...
minikube addons enable ingress

REM Step 3: Set Docker environment for Minikube
echo 🔧 Setting Docker environment...
for /f "tokens=*" %%i in ('minikube docker-env --shell cmd ^| findstr /V "REM"') do %%i


REM Step 4: Apply ConfigMaps
echo 📦 Applying config files...
kubectl apply -f k8s/configs/

REM Step 5: Apply Services
echo 🌐 Applying services...
kubectl apply -f k8s/services/

REM Step 6: Apply Deployments
echo 📤 Applying deployments...
kubectl apply -f k8s/deployments/

REM Step 7: Apply Ingress
echo 🚪 Applying ingress rules...
kubectl apply -f k8s/ingress/

REM Step 8: Wait for ingress controller
echo 🕒 Waiting for ingress controller to be ready...
kubectl wait --namespace kube-system --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=90s

REM Step 9: Get Minikube IP
for /f "tokens=*" %%i in ('minikube ip') do set MINIKUBE_IP=%%i

REM Step 10: Start tunnel in new window
echo 🔁 Starting minikube tunnel in a new window (leave it open)...
start cmd /k "minikube tunnel"

REM Step 11: Ingress Domain Instructions
echo.
echo ========================================
echo ✅ Deployment completed!
echo 🌍 Your ingress host is likely:
kubectl get ingress -o jsonpath="{.items[0].spec.rules[0].host}"
echo.
echo 📌 Please add the following line to your hosts file:
echo %MINIKUBE_IP%    coffee-and-chill.com
echo.
echo ⚠️  File to edit (as Administrator): C:\Windows\System32\drivers\etc\hosts
echo 🛑 Keep the "tunnel" window open while running the app
echo 🔗 Now access: http://coffee-and-chill.com/
echo ========================================

pause
