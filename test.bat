@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo Abstract Image Generator - Test Suite
echo ============================================================
echo.

set PASSED=0
set FAILED=0
set TOTAL=0

:: Colors for Windows 10+
set "GREEN=[32m"
set "RED=[31m"
set "YELLOW=[33m"
set "RESET=[0m"

:: Clean up previous test outputs
if exist "generated-images\test-content-landscape.png" del "generated-images\test-content-landscape.png"
if exist "generated-images\test-content-square.png" del "generated-images\test-content-square.png"
if exist "generated-images\26136-landscape.png" del "generated-images\26136-landscape.png"
if exist "generated-images\26136-square.png" del "generated-images\26136-square.png"

echo [Test 1/5] Checking dependencies...
set /a TOTAL+=1
if exist "node_modules" (
    echo %GREEN%PASS%RESET%: node_modules exists
    set /a PASSED+=1
) else (
    echo %YELLOW%WARN%RESET%: node_modules not found, running npm install...
    call npm install
    if !ERRORLEVEL! EQU 0 (
        echo %GREEN%PASS%RESET%: Dependencies installed
        set /a PASSED+=1
    ) else (
        echo %RED%FAIL%RESET%: Failed to install dependencies
        set /a FAILED+=1
    )
)
echo.

echo [Test 2/5] CLI: Generate from file (test-content.txt)...
set /a TOTAL+=1
node src/cli/cli.js generate --source file --path test-content.txt --all >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    if exist "generated-images\test-content-landscape.png" (
        if exist "generated-images\test-content-square.png" (
            echo %GREEN%PASS%RESET%: Generated landscape and square images from file
            set /a PASSED+=1
        ) else (
            echo %RED%FAIL%RESET%: Square image not generated
            set /a FAILED+=1
        )
    ) else (
        echo %RED%FAIL%RESET%: Landscape image not generated
        set /a FAILED+=1
    )
) else (
    echo %RED%FAIL%RESET%: CLI command failed
    set /a FAILED+=1
)
echo.

echo [Test 3/5] CLI: Generate from WordPress (post 26136)...
set /a TOTAL+=1
node src/cli/cli.js generate --source wordpress --url https://osmeusapontamentos.com --id 26136 --all >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    if exist "generated-images\26136-landscape.png" (
        if exist "generated-images\26136-square.png" (
            echo %GREEN%PASS%RESET%: Generated landscape and square images from WordPress
            set /a PASSED+=1
        ) else (
            echo %RED%FAIL%RESET%: Square image not generated
            set /a FAILED+=1
        )
    ) else (
        echo %RED%FAIL%RESET%: Landscape image not generated
        set /a FAILED+=1
    )
) else (
    echo %RED%FAIL%RESET%: CLI command failed (network issue?)
    set /a FAILED+=1
)
echo.

echo [Test 4/5] CLI: Generate with resize crop mode...
set /a TOTAL+=1
del "generated-images\test-content-landscape.png" 2>nul
del "generated-images\test-content-square.png" 2>nul
node src/cli/cli.js generate --source file --path test-content.txt --all --crop-mode resize >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    if exist "generated-images\test-content-landscape.png" (
        echo %GREEN%PASS%RESET%: Resize crop mode works
        set /a PASSED+=1
    ) else (
        echo %RED%FAIL%RESET%: Image not generated with resize crop
        set /a FAILED+=1
    )
) else (
    echo %RED%FAIL%RESET%: CLI command failed
    set /a FAILED+=1
)
echo.

echo [Test 5/5] CLI: Generate with custom output directory...
set /a TOTAL+=1
if exist "test-output" rd /s /q "test-output"
mkdir "test-output" 2>nul
node src/cli/cli.js generate --source file --path test-content.txt --all --output-dir test-output >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    if exist "test-output\test-content-landscape.png" (
        if exist "test-output\test-content-square.png" (
            echo %GREEN%PASS%RESET%: Custom output directory works
            set /a PASSED+=1
            rd /s /q "test-output"
        ) else (
            echo %RED%FAIL%RESET%: Square image not in custom directory
            set /a FAILED+=1
        )
    ) else (
        echo %RED%FAIL%RESET%: Landscape image not in custom directory
        set /a FAILED+=1
    )
) else (
    echo %RED%FAIL%RESET%: CLI command failed
    set /a FAILED+=1
)
echo.

echo ============================================================
echo TEST RESULTS: !PASSED!/!TOTAL! passed
echo ============================================================
if !PASSED!==!TOTAL! (
    echo %GREEN%All tests passed!%RESET%
    exit /b 0
) else (
    echo %RED%Some tests failed!%RESET%
    exit /b 1
)
