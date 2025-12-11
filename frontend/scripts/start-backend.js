#!/usr/bin/env node

// Serveur backend simple pour tester la détection automatique
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint de santé pour la détection
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Serveur backend disponible',
    timestamp: new Date().toISOString()
  });
});

// Endpoints de base (simulation)
app.get('/v1/clients', (req, res) => {
  res.json({
    clients: [
      { id: '1', name: 'Client Backend', email: 'backend@test.com' }
    ]
  });
});

app.get('/v1/appointments', (req, res) => {
  res.json({
    items: [
      { 
        _id: '1', 
        title: 'RDV Backend', 
        startAt: new Date().toISOString(),
        endAt: new Date(Date.now() + 3600000).toISOString(),
        status: 'scheduled'
      }
    ]
  });
});

// Auth endpoints
app.post('/v1/auth/login', (req, res) => {
  console.log('Login attempt:', req.body);
  const { email, password } = req.body;
  if (email === 'admin@booklio.com' && password === 'P@ssw0rd123') {
    res.json({
      tokens: {
        accessToken: 'backend-access-token',
        refreshToken: 'backend-refresh-token'
      },
      user: {
        id: '1',
        email: 'admin@booklio.com',
        name: 'Admin Backend'
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/v1/auth/register', (req, res) => {
  const { tenantId, email, password } = req.body;
  res.json({
    tokens: {
      accessToken: 'backend-access-token',
      refreshToken: 'backend-refresh-token'
    },
    user: {
      id: Date.now().toString(),
      email,
      name: email.split('@')[0]
    }
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 Identifiants de test: admin@booklio.com / P@ssw0rd123`);
  console.log(`\n💡 L'application frontend détectera automatiquement ce serveur !`);
});
