@echo off
echo EzDeploy Services Starter
echo ========================
echo.

echo Starting services in separate windows...
echo.

:: Start API Server
start cmd /k "cd api-server && echo Starting API Server... && npm run dev"

:: Start Client
start cmd /k "cd client && echo Starting Client... && npm run dev"

:: Start S3 Reverse Proxy
start cmd /k "cd s3-reverse-proxy && echo Starting S3 Reverse Proxy... && npm run dev"

echo.
echo All services started successfully!
echo To stop the services, close the respective command windows.
echo.
echo API Server: http://localhost:9000
echo Client: http://localhost:3000
echo S3 Reverse Proxy: http://localhost:8000 (if applicable)
echo.
echo Press any key to exit this window...
pause > nul
