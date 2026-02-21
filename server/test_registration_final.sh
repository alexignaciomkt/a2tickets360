#!/bin/bash
# Generate random suffix
SUFFIX=$(date +%s)

echo "--- Testing Organizer Registration ---"
curl -is -X POST http://127.0.0.1:3000/api/organizers/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Organizer Final\",
    \"email\": \"org_final_${SUFFIX}@example.com\",
    \"password\": \"Password123!\",
    \"mobilePhone\": \"11999999999\",
    \"cpfCnpj\": \"${SUFFIX}\"
  }"
echo -e "\n\n"

echo "--- Testing Staff Registration ---"
curl -is -X POST http://127.0.0.1:3000/api/candidates \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Staff Final\",
    \"email\": \"staff_final_${SUFFIX}@example.com\",
    \"password\": \"Password123!\",
    \"phone\": \"11999999999\",
    \"city\": \"São Paulo\",
    \"state\": \"SP\"
  }"
echo -e "\n"
