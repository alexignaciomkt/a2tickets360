#!/bin/bash
echo "--- Testing Organizer Registration ---"
curl -is -X POST http://127.0.0.1:3000/api/organizers/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Organizer CLI 3",
    "email": "test_org_cli_3@example.com",
    "password": "Password123!",
    "mobilePhone": "11999999999",
    "cpfCnpj": "91243678000199"
  }'
echo -e "\n\n"

echo "--- Testing Staff Registration ---"
curl -is -X POST http://127.0.0.1:3000/api/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Staff CLI 3",
    "email": "test_staff_cli_3@example.com",
    "password": "Password123!",
    "phone": "11999999999",
    "city": "São Paulo",
    "state": "SP"
  }'
echo -e "\n"
