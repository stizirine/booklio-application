#!/usr/bin/env node

/**
 * Script de test E2E pour le flux de facturation
 * 
 * Ce script teste :
 * 1. Création d'un client
 * 2. Ajout d'un rendez-vous pour ce client
 * 3. Création d'une facture avec paiement initial
 * 4. Vérification que l'invoiceSummary du client est à jour
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';
const TEST_EMAIL = process.env.REACT_APP_DEFAULT_EMAIL || 'admin@booklio.com';
const TEST_PASSWORD = process.env.REACT_APP_DEFAULT_PASSWORD || 'P@ssw0rd123';

let accessToken = null;

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${step}. ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Client API avec gestion du token
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Intercepteur pour logger les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      logError(`Erreur API: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      logError('Pas de réponse du serveur');
    } else {
      logError(`Erreur: ${error.message}`);
    }
    throw error;
  }
);

// Fonctions de test

async function login() {
  logStep('1', 'Connexion à l\'API');
  try {
    const response = await api.post('/v1/auth/login', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    accessToken = response.data.tokens.accessToken;
    logSuccess(`Connecté avec succès (User: ${response.data.user.email})`);
    return response.data.user;
  } catch (error) {
    logError('Échec de la connexion');
    throw error;
  }
}

async function createClient() {
  logStep('2', 'Création d\'un nouveau client');
  try {
    const clientData = {
      firstName: 'Test',
      lastName: 'E2E',
      email: `test-e2e-${Date.now()}@example.com`,
      phone: '0612345678',
      address: '123 Rue de Test',
    };

    const response = await api.post('/v1/clients', clientData);
    const client = response.data.client || response.data;

    logSuccess(`Client créé: ${client.firstName} ${client.lastName} (ID: ${client._id})`);
    logInfo(`Email: ${client.email}`);
    
    return client;
  } catch (error) {
    logError('Échec de la création du client');
    throw error;
  }
}

async function createAppointment(clientId) {
  logStep('3', 'Ajout d\'un rendez-vous pour le client');
  try {
    const appointmentData = {
      title: 'Consultation Test E2E',
      startAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // +1 jour
      endAt: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // +1 jour + 1h
      clientId: clientId,
      status: 'scheduled',
      notes: {
        comment: 'Test automatisé du flux de facturation'
      },
      location: 'Cabinet',
    };

    const response = await api.post('/v1/appointments', appointmentData);
    const appointment = response.data.appointment || response.data;

    logSuccess(`Rendez-vous créé: ${appointment.title} (ID: ${appointment._id})`);
    logInfo(`Date: ${new Date(appointment.startAt).toLocaleString('fr-FR')}`);
    
    return appointment;
  } catch (error) {
    logError('Échec de la création du rendez-vous');
    throw error;
  }
}

async function createInvoiceWithPayment(clientId) {
  logStep('4', 'Création d\'une facture avec paiement initial');
  try {
    const invoiceData = {
      clientId: clientId,
      totalAmount: 200,
      creditAmount: 0,
      currency: 'EUR',
      notes: {
        comment: 'Facture de test E2E - Consultation avec avance',
      },
      payments: [
        {
          amount: 75,
          method: 'cash',
          notes: 'Paiement initial en espèces',
        }
      ],
    };

    logInfo(`Envoi de la facture: Total ${invoiceData.totalAmount}€, Avance ${invoiceData.payments[0].amount}€`);
    
    const response = await api.post('/v1/invoices', invoiceData);
    const { invoice, invoiceSummary } = response.data;

    logSuccess(`Facture créée (ID: ${invoice._id})`);
    logInfo(`Total: ${invoice.totalAmount}€`);
    logInfo(`Avance payée: ${invoice.advanceAmount}€`);
    logInfo(`Solde restant: ${invoice.remainingAmount}€`);
    logInfo(`Statut: ${invoice.status}`);
    logInfo(`Nombre de paiements: ${invoice.payments.length}`);
    
    log('\n📊 Invoice Summary reçu:', 'yellow');
    logInfo(`  Total facturé: ${invoiceSummary.totalAmount}€`);
    logInfo(`  Total dû: ${invoiceSummary.dueAmount}€`);
    logInfo(`  Nombre de factures: ${invoiceSummary.invoiceCount}`);
    
    return { invoice, invoiceSummary };
  } catch (error) {
    logError('Échec de la création de la facture');
    throw error;
  }
}

async function getClientDetails(clientId) {
  logStep('5', 'Récupération des détails du client avec invoiceSummary');
  try {
    const response = await api.get(`/v1/clients/${clientId}`);
    const client = response.data.client || response.data;

    logSuccess(`Détails du client récupérés`);
    
    if (client.invoiceSummary) {
      log('\n📊 Invoice Summary dans le client:', 'yellow');
      logInfo(`  Total facturé: ${client.invoiceSummary.totalAmount || 0}€`);
      logInfo(`  Total dû: ${client.invoiceSummary.dueAmount || 0}€`);
      logInfo(`  Nombre de factures: ${client.invoiceSummary.invoiceCount || 0}`);
      logInfo(`  Dernière facture: ${client.invoiceSummary.lastInvoiceAt || 'N/A'}`);
    } else {
      logError('⚠️  invoiceSummary manquant dans les données du client !');
    }
    
    return client;
  } catch (error) {
    logError('Échec de la récupération du client');
    throw error;
  }
}

async function verifyInvoiceSummary(expectedSummary, actualClient) {
  logStep('6', 'Vérification de la cohérence de l\'invoiceSummary');
  
  const clientSummary = actualClient.invoiceSummary;
  
  if (!clientSummary) {
    logError('ÉCHEC: invoiceSummary manquant dans le client');
    return false;
  }
  
  let allOk = true;
  
  // Vérifier totalAmount
  if (clientSummary.totalAmount === expectedSummary.totalAmount) {
    logSuccess(`Total facturé: ${clientSummary.totalAmount}€ ✓`);
  } else {
    logError(`Total facturé incorrect: attendu ${expectedSummary.totalAmount}€, reçu ${clientSummary.totalAmount}€`);
    allOk = false;
  }
  
  // Vérifier dueAmount
  if (clientSummary.dueAmount === expectedSummary.dueAmount) {
    logSuccess(`Total dû: ${clientSummary.dueAmount}€ ✓`);
  } else {
    logError(`Total dû incorrect: attendu ${expectedSummary.dueAmount}€, reçu ${clientSummary.dueAmount}€`);
    allOk = false;
  }
  
  // Vérifier invoiceCount
  if (clientSummary.invoiceCount === expectedSummary.invoiceCount) {
    logSuccess(`Nombre de factures: ${clientSummary.invoiceCount} ✓`);
  } else {
    logError(`Nombre de factures incorrect: attendu ${expectedSummary.invoiceCount}, reçu ${clientSummary.invoiceCount}`);
    allOk = false;
  }
  
  // Vérifier lastInvoiceAt
  if (clientSummary.lastInvoiceAt) {
    logSuccess(`Dernière facture: ${new Date(clientSummary.lastInvoiceAt).toLocaleString('fr-FR')} ✓`);
  } else {
    logError('lastInvoiceAt manquant');
    allOk = false;
  }
  
  return allOk;
}

async function getClientInvoices(clientId) {
  logStep('7', 'Récupération de la liste des factures du client');
  try {
    const response = await api.get(`/v1/invoices`, {
      params: { clientId }
    });
    
    const invoices = response.data.items || response.data || [];
    
    logSuccess(`${invoices.length} facture(s) trouvée(s) pour ce client`);
    
    invoices.forEach((inv, index) => {
      logInfo(`  Facture ${index + 1}: ${inv.totalAmount}€ (Status: ${inv.status}, Avance: ${inv.advanceAmount}€)`);
    });
    
    return invoices;
  } catch (error) {
    logError('Échec de la récupération des factures');
    throw error;
  }
}

// Fonction principale
async function runTest() {
  log('\n' + '='.repeat(70), 'bright');
  log('🧪 TEST E2E: Flux complet de facturation', 'bright');
  log('='.repeat(70) + '\n', 'bright');
  
  try {
    // 1. Connexion
    await login();
    
    // 2. Créer un client
    const client = await createClient();
    
    // 3. Créer un rendez-vous
    const appointment = await createAppointment(client._id);
    
    // 4. Créer une facture avec paiement
    const { invoice, invoiceSummary: expectedSummary } = await createInvoiceWithPayment(client._id);
    
    // Attendre un peu pour laisser le temps au backend de traiter
    log('\n⏳ Attente de 2 secondes pour la synchronisation...', 'yellow');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 5. Récupérer les détails du client
    const updatedClient = await getClientDetails(client._id);
    
    // 6. Vérifier l'invoiceSummary
    const isValid = await verifyInvoiceSummary(expectedSummary, updatedClient);
    
    // 7. Récupérer les factures du client
    const invoices = await getClientInvoices(client._id);
    
    // Résultat final
    log('\n' + '='.repeat(70), 'bright');
    if (isValid) {
      log('✅ TEST RÉUSSI: Tous les contrôles sont passés !', 'green');
    } else {
      log('❌ TEST ÉCHOUÉ: Certains contrôles ont échoué', 'red');
    }
    log('='.repeat(70) + '\n', 'bright');
    
    // Résumé
    log('📝 Résumé du test:', 'cyan');
    logInfo(`Client créé: ${client._id}`);
    logInfo(`Rendez-vous créé: ${appointment._id}`);
    logInfo(`Facture créée: ${invoice._id}`);
    logInfo(`Total facture: ${invoice.totalAmount}€`);
    logInfo(`Avance payée: ${invoice.advanceAmount}€`);
    logInfo(`Solde: ${invoice.remainingAmount}€`);
    logInfo(`invoiceSummary synchronisé: ${isValid ? 'OUI ✅' : 'NON ❌'}`);
    
    process.exit(isValid ? 0 : 1);
    
  } catch (error) {
    log('\n' + '='.repeat(70), 'bright');
    log('❌ TEST ÉCHOUÉ: Une erreur est survenue', 'red');
    log('='.repeat(70) + '\n', 'bright');
    
    if (error.response) {
      logError(`Erreur HTTP ${error.response.status}`);
      logError(`Détails: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      logError(`Erreur: ${error.message}`);
    }
    
    process.exit(1);
  }
}

// Lancer le test
runTest();
