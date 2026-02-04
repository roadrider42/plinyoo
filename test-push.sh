#!/bin/bash

# E2E Test für Push-Benachrichtigungen
# Testet die komplette Push-Kette: Service Worker -> Notification -> Deeplink

echo "🧪 SpoonUp Push-Benachrichtigungen E2E Test"
echo "==========================================="

# Konfiguration
PROJECT_URL="https://ddbrdvwguyhnfvicheqn.supabase.co"
SEND_PUSH_URL="${PROJECT_URL}/functions/v1/send-push"

echo "📡 Teste Push-Versand an alle Subscriptions..."
echo "URL: ${SEND_PUSH_URL}"
echo ""

# Test-Payload für Changelog-Deeplink
curl -X POST "${SEND_PUSH_URL}" \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkYnJkdndndXlobmZ2aWNoZXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTc0NzcsImV4cCI6MjA2ODg3MzQ3N30.Cif5HWsuFX6hqxxwJRa5mOvny56g5bbxznjlqLX1V74' \
  -d '{
    "audience": "all",
    "title": "🚀 Neue SpoonUp Features verfügbar!",
    "body": "Entdecken Sie die neuesten Updates und Verbesserungen.",
    "url": "/changelog"
  }' \
  -w "\n\nHTTP Status: %{http_code}\nResponse Time: %{time_total}s\n"

echo ""
echo "✅ Test abgeschlossen!"
echo ""
echo "📋 Erwartetes Verhalten:"
echo "1. Push-Notification erscheint auf allen registrierten Geräten"
echo "2. Klick auf Notification öffnet SpoonUp App"
echo "3. App navigiert automatisch zu /changelog"
echo "4. Server Response zeigt Anzahl versendeter/entfernter Subscriptions"
echo ""
echo "🔍 Debugging:"
echo "- DevTools → Application → Service Workers"
echo "- DevTools → Application → Push Messaging"
echo "- Browser Notifications Settings"
echo ""
echo "📱 iOS Hinweis:"
echo "Push funktioniert nur bei installierter PWA (Add to Home Screen, iOS 16.4+)"
