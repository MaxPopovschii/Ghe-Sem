#!/bin/bash

# Script di test per le API reali ATM Milano
# Utilizzo: ./test-api.sh

echo "🚊 Test API Trasporto Pubblico Milano"
echo "======================================"
echo ""

# Colori
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Open Data Milano - Vehicle Positions
echo "📍 Test 1: Vehicle Positions (Open Data Milano)"
echo "----------------------------------------------"
RESPONSE=$(curl -s "https://dati.comune.milano.it/api/3/action/datastore_search?resource_id=gtfs_rt_vehicle_position&limit=3")

if echo "$RESPONSE" | grep -q '"success":true'; then
    COUNT=$(echo "$RESPONSE" | grep -o '"vehicle_id"' | wc -l)
    echo -e "${GREEN}✅ SUCCESS${NC} - Trovati $COUNT veicoli"
    echo "Sample data:"
    echo "$RESPONSE" | jq -r '.result.records[0] | {vehicle_id, route_id, latitude, longitude}' 2>/dev/null || echo "$RESPONSE" | head -3
else
    echo -e "${RED}❌ FAILED${NC} - API non disponibile o errore"
    echo "Response: $RESPONSE" | head -5
fi

echo ""
echo ""

# Test 2: Trip Updates
echo "🕒 Test 2: Trip Updates (Arrivi)"
echo "----------------------------------------------"
RESPONSE=$(curl -s "https://dati.comune.milano.it/api/3/action/datastore_search?resource_id=gtfs_rt_trip_update&limit=3")

if echo "$RESPONSE" | grep -q '"success":true'; then
    COUNT=$(echo "$RESPONSE" | grep -o '"trip_id"' | wc -l)
    echo -e "${GREEN}✅ SUCCESS${NC} - Trovati $COUNT aggiornamenti"
else
    echo -e "${RED}❌ FAILED${NC} - API non disponibile"
fi

echo ""
echo ""

# Test 3: Check CORS
echo "🌐 Test 3: CORS Support"
echo "----------------------------------------------"
CORS=$(curl -s -I "https://dati.comune.milano.it/api/3/action/datastore_search?resource_id=gtfs_rt_vehicle_position&limit=1" | grep -i "access-control-allow-origin")

if [ -n "$CORS" ]; then
    echo -e "${GREEN}✅ CORS Enabled${NC}"
    echo "$CORS"
else
    echo -e "${YELLOW}⚠️  CORS Headers non trovati${NC}"
    echo "Potrebbe essere necessario un proxy in produzione"
fi

echo ""
echo ""

# Test 4: Verifica configurazione locale
echo "⚙️  Test 4: Configurazione Locale"
echo "----------------------------------------------"

if [ -f ".env" ]; then
    echo -e "${GREEN}✅ File .env presente${NC}"
    if grep -q "VITE_ATM_API_KEY" .env; then
        KEY=$(grep "VITE_ATM_API_KEY" .env | cut -d '=' -f2)
        if [ -n "$KEY" ]; then
            echo -e "${GREEN}✅ API Key configurata${NC} (${KEY:0:10}...)"
        else
            echo -e "${YELLOW}⚠️  API Key vuota${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  VITE_ATM_API_KEY non trovata${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  File .env non presente${NC}"
    echo "   Esegui: cp .env.example .env"
fi

echo ""

# Check USE_MOCK_DATA
if grep -q "USE_MOCK_DATA: false" src/services/transportAPI.js; then
    echo -e "${GREEN}✅ Dati reali ATTIVI${NC} (USE_MOCK_DATA: false)"
else
    echo -e "${YELLOW}⚠️  Dati mock ATTIVI${NC} (USE_MOCK_DATA: true)"
    echo "   Per attivare API reali: cambia USE_MOCK_DATA a false"
fi

echo ""
echo ""

# Riepilogo
echo "📊 Riepilogo"
echo "======================================"
echo ""
echo "Per usare i dati reali:"
echo "1. Apri src/services/transportAPI.js"
echo "2. Cambia: USE_MOCK_DATA: false"
echo "3. Riavvia: npm run dev"
echo ""
echo "Per maggiori info: cat REAL_API_GUIDE.md"
echo ""
echo "🚊 Test completato!"
