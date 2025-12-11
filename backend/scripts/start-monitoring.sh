#!/bin/bash

echo "🚀 Starting Booklio monitoring stack..."

# Start the monitoring services
docker compose up -d prometheus grafana

echo "⏳ Waiting for services to be ready..."
sleep 10

echo "✅ Monitoring stack started!"
echo ""
echo "📊 Services available:"
echo "  - Prometheus: http://localhost:9090"
echo "  - Grafana:    http://localhost:3000 (admin/admin)"
echo "  - API Metrics: http://localhost:4000/metrics"
echo ""
echo "📈 Dashboard: Booklio Agent Metrics"
echo "   - Messages sent over time"
echo "   - Webhook errors"
echo "   - Jobs processed"
echo "   - Inbound intents"
echo ""
echo "🔧 To stop monitoring: docker compose down prometheus grafana"
