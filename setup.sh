#!/bin/bash

echo "Iniciando setup completo del proyecto GhostRunning..."

# 1) Verificar Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js no esta instalado. Instalalo y vuelve a ejecutar este script."
  exit 1
fi

# 2) Verificar npm
if ! command -v npm >/dev/null 2>&1; then
  echo "npm no esta instalado. Instalalo y vuelve a ejecutar este script."
  exit 1
fi

# --- 3. Cargar variables del archivo .env (ubicado en la raíz del proyecto) ---
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
    echo " Variables de entorno cargadas desde .env"
else
    echo " No se encontro el archivo .env en la raiz del proyecto"
fi

# 4) Instalar dependencias de Database
echo "Instalando dependencias de Database..."
cd Proyecto/Database || { echo "No se encontro la carpeta Proyecto/Database."; exit 1; }
npm install

# 5) Volver a la raiz
cd ../.. || true

# 6) Instalar dependencias del Backend
echo "Instalando dependencias del Backend..."
cd Proyecto/Backend || { echo "No se encontro la carpeta Proyecto/Backend."; exit 1; }
npm install

# 7) Verificar o crear base de datos (ejecuta el script disponible)
echo "Verificando o creando base de datos..."
npm run setup-db

# 7.1) Ejecutar tests del Backend
echo "Ejecutando tests del Backend..."
npm test || { echo "Tests del backend fallaron"; exit 1; }

# 8) Volver a la raiz relativa del repo
cd ../.. || true

# 9) Instalar dependencias del Frontend
echo "Instalando dependencias del Frontend..."
cd Proyecto/Frontend || { echo "No se encontro la carpeta del frontend."; exit 1; }
npm install

# 10) Instalar expo-speech para anuncios de audio
echo "Instalando expo-speech para anuncios de audio..."
npm install expo-speech

# 11) Volver a Database para crear ghost ficticio
echo "Creando ghost ficticio de 10km..."
cd ../Database || { echo "No se encontro la carpeta Database."; exit 1; }
npx ts-node seed-ghost.ts diegoGo@runner.com

# 12) Levantar el servidor Backend (bloqueante, como en el .bat)
echo "Levantando el servidor Backend..."
cd ../Backend || { echo "No se encontro la carpeta Backend."; exit 1; }
npm start

echo "==============================================="
echo "Setup completado con exito."
echo "==============================================="