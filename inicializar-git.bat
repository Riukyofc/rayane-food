@echo off
echo ========================================
echo     RAYANE FOOD - Inicializador Git
echo ========================================
echo.

REM Verifica se o Git está instalado
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Git nao encontrado!
    echo.
    echo Por favor:
    echo 1. Feche este terminal
    echo 2. Reabra como Administrador
    echo 3. Execute este script novamente
    echo.
    echo OU reinicie o computador apos instalar o Git
    pause
    exit /b 1
)

echo [OK] Git encontrado!
echo.

REM Verifica se já existe repositório Git
if exist ".git" (
    echo [INFO] Repositorio Git ja existe!
    echo.
    git status
    pause
    exit /b 0
)

echo Inicializando repositorio Git...
git init
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao inicializar Git
    pause
    exit /b 1
)

echo [OK] Repositorio inicializado!
echo.

echo Configurando usuario...
set /p nome="Digite seu nome: "
set /p email="Digite seu email: "

git config user.name "%nome%"
git config user.email "%email%"

echo [OK] Usuario configurado!
echo.

echo Adicionando arquivos...
git add .
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao adicionar arquivos
    pause
    exit /b 1
)

echo [OK] Arquivos adicionados!
echo.

echo ========================================
echo Arquivos que serao enviados ao GitHub:
echo ========================================
git status
echo.

echo IMPORTANTE: Verifique se 'node_modules' NAO aparece acima!
echo.

set /p commit="Digite a mensagem do commit (ou pressione Enter para usar padrao): "
if "%commit%"=="" set commit=Primeiro commit - Projeto Rayane Food

echo.
echo Criando primeiro commit...
git commit -m "%commit%"
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao criar commit
    pause
    exit /b 1
)

echo [OK] Commit criado com sucesso!
echo.

echo ========================================
echo PROXIMO PASSO:
echo ========================================
echo 1. Acesse: https://github.com/new
echo 2. Crie um repositorio chamado: rayane-food
echo 3. Marque como PRIVATE (recomendado)
echo 4. NAO adicione README (ja temos!)
echo 5. Execute os comandos:
echo.
echo    git remote add origin https://github.com/SEU-USUARIO/rayane-food.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo (Substitua SEU-USUARIO pelo seu usuario do GitHub)
echo.

pause
