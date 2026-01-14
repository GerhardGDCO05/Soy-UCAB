#!/bin/bash

# Script para probar los endpoints de reportes implementados
# Asegúrate de que el servidor backend esté corriendo en http://localhost:3000

BASE_URL="http://localhost:3000/api/reports"

echo "=========================================="
echo "  PRUEBAS DE ENDPOINTS DE REPORTES"
echo "=========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para hacer requests y mostrar resultados
test_endpoint() {
    local name=$1
    local url=$2
    local description=$3
    
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Prueba: $name${NC}"
    echo -e "${YELLOW}URL: $url${NC}"
    echo -e "${YELLOW}Descripción: $description${NC}"
    echo ""
    
    response=$(curl -s -w "\n%{http_code}" "$url")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✓ Status: $http_code OK${NC}"
        echo ""
        echo "Respuesta:"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ Status: $http_code${NC}"
        echo ""
        echo "Error:"
        echo "$body"
    fi
    echo ""
    echo ""
}

# Verificar que el servidor esté corriendo
echo "Verificando que el servidor esté corriendo..."
if ! curl -s -f "$BASE_URL/../health" > /dev/null 2>&1; then
    echo -e "${RED}✗ Error: El servidor no está corriendo en http://localhost:3000${NC}"
    echo ""
    echo "Para iniciar el servidor, ejecuta:"
    echo "  cd Backend-SoyUcab"
    echo "  npm start"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Servidor está corriendo${NC}"
echo ""

# ============================================
# PRUEBA 1: Gestión de Eventos
# ============================================
test_endpoint \
    "Gestión de Eventos (sin límite)" \
    "$BASE_URL/gestion-eventos" \
    "Obtiene resumen de todos los eventos"

test_endpoint \
    "Gestión de Eventos (con límite=1)" \
    "$BASE_URL/gestion-eventos?limit=1" \
    "Obtiene resumen limitado a 1 evento"

# ============================================
# PRUEBA 2: Top Promedios por Facultad
# ============================================
test_endpoint \
    "Top Promedios por Facultad (default)" \
    "$BASE_URL/top-promedios-facultad" \
    "Obtiene top 10 estudiantes por facultad (default)"

test_endpoint \
    "Top Promedios por Facultad (limit=5)" \
    "$BASE_URL/top-promedios-facultad?limit=5" \
    "Obtiene top 5 estudiantes por facultad"

test_endpoint \
    "Top Promedios por Facultad (minPromedio=17)" \
    "$BASE_URL/top-promedios-facultad?minPromedio=17" \
    "Obtiene estudiantes con promedio mínimo de 17"

test_endpoint \
    "Top Promedios por Facultad (facultad específica)" \
    "$BASE_URL/top-promedios-facultad?facultad=Ingenier%C3%ADa&limit=3" \
    "Obtiene top 3 estudiantes de Ingeniería"

test_endpoint \
    "Top Promedios por Facultad (combinado)" \
    "$BASE_URL/top-promedios-facultad?facultad=Ingenier%C3%ADa&minPromedio=16&limit=2" \
    "Obtiene top 2 estudiantes de Ingeniería con promedio >= 16"

echo "=========================================="
echo -e "${GREEN}  PRUEBAS COMPLETADAS${NC}"
echo "=========================================="

