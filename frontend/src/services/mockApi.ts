// API mockée pour le développement sans backend
import { AppointmentStatus } from '../types/enums';

export type MockAppointment = {
  _id: string;
  title: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  notes?: string;
  location?: string;
};

export type MockClient = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
};

// Données mockées
const mockClients: MockClient[] = [
  {
    id: '1',
    name: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    phone: '01 23 45 67 89',
    address: '123 Rue de la Paix, 75001 Paris'
  },
  {
    id: '2',
    name: 'Marie Martin',
    email: 'marie.martin@email.com',
    phone: '01 98 76 54 32',
    address: '456 Avenue des Champs, 75008 Paris'
  },
  {
    id: '3',
    name: 'Pierre Durand',
    email: 'pierre.durand@email.com',
    phone: '01 55 44 33 22',
    address: '789 Boulevard Saint-Germain, 75006 Paris'
  }
];

// Données mockées pour les factures
const mockInvoices: any[] = [];

const mockAppointments: MockAppointment[] = [
  {
    _id: '1',
    title: 'Consultation dentaire',
    startAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // +2h
    endAt: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(), // +2.5h
    status: AppointmentStatus.Scheduled,
    clientId: '1',
    clientName: 'Jean Dupont',
    clientEmail: 'jean.dupont@email.com',
    clientPhone: '01 23 45 67 89',
    notes: 'Première consultation',
    location: 'Cabinet dentaire'
  },
  {
    _id: '2',
    title: 'Nettoyage',
    startAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // +1 jour
    endAt: new Date(Date.now() + 24.5 * 60 * 60 * 1000).toISOString(), // +1 jour + 30min
    status: AppointmentStatus.Scheduled,
    clientId: '2',
    clientName: 'Marie Martin',
    clientEmail: 'marie.martin@email.com',
    clientPhone: '01 98 76 54 32',
    notes: 'Nettoyage de routine',
    location: 'Cabinet dentaire'
  },
  {
    _id: '3',
    title: 'Extraction dentaire',
    startAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // -2h (passé)
    endAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), // -1.5h (passé)
    status: AppointmentStatus.Done,
    clientId: '3',
    clientName: 'Pierre Durand',
    clientEmail: 'pierre.durand@email.com',
    clientPhone: '01 55 44 33 22',
    notes: 'Extraction de la dent de sagesse',
    location: 'Cabinet dentaire'
  }
];

// Simulation d'un délai réseau
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API mockée
export const mockApi = {
  // Clients
  async getClients() {
    await delay(500);
    return { data: { clients: mockClients } };
  },

  async getClient(id: string) {
    await delay(300);
    const client = mockClients.find(c => c.id === id);
    if (!client) throw new Error('Client not found');
    
    // Calculer dynamiquement l'invoiceSummary depuis les factures
    const clientInvoices = mockInvoices.filter(inv => inv.client?._id === id);
    const invoiceSummary = clientInvoices.length > 0 ? {
      totalAmount: clientInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      dueAmount: clientInvoices.reduce((sum, inv) => sum + inv.remainingAmount, 0),
      invoiceCount: clientInvoices.length,
      lastInvoiceAt: clientInvoices.length > 0 
        ? clientInvoices.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0].createdAt
        : undefined,
    } : undefined;
    
    // Récupérer les appointments du client
    const clientAppointments = mockAppointments.filter(a => a.clientId === id);
    
    // Retourner le client au format API (avec _id, firstName, lastName)
    return { 
      data: { 
        _id: client.id,
        firstName: client.name.split(' ')[0],
        lastName: client.name.split(' ').slice(1).join(' '),
        email: client.email,
        phone: client.phone,
        address: client.address,
        invoiceSummary,
        appointments: clientAppointments,
      } 
    };
  },

  async updateClient(id: string, data: Partial<MockClient>) {
    await delay(400);
    const clientIndex = mockClients.findIndex(c => c.id === id);
    if (clientIndex === -1) throw new Error('Client not found');
    
    mockClients[clientIndex] = { ...mockClients[clientIndex], ...data };
    return { data: { client: mockClients[clientIndex] } };
  },

  async createClient(data: Omit<MockClient, 'id'>) {
    await delay(400);
    const newClient: MockClient = {
      id: Date.now().toString(),
      ...data
    };
    mockClients.push(newClient);
    return { data: { client: newClient } };
  },

  // Rendez-vous
  async getAppointments(params?: { clientId?: string; limit?: number }) {
    await delay(600);
    let appointments = [...mockAppointments];
    
    if (params?.clientId) {
      appointments = appointments.filter(a => a.clientId === params.clientId);
    }
    
    if (params?.limit) {
      appointments = appointments.slice(0, params.limit);
    }
    
    return { data: { items: appointments } };
  },

  async getAppointment(id: string) {
    await delay(300);
    const appointment = mockAppointments.find(a => a._id === id);
    if (!appointment) throw new Error('Appointment not found');
    return { data: { appointment } };
  },

  async createAppointment(data: Omit<MockAppointment, '_id'>) {
    await delay(500);
    const newAppointment: MockAppointment = {
      _id: Date.now().toString(),
      ...data
    };
    mockAppointments.push(newAppointment);
    return { data: { appointment: newAppointment } };
  },

  async updateAppointment(id: string, data: Partial<MockAppointment>) {
    await delay(400);
    const appointmentIndex = mockAppointments.findIndex(a => a._id === id);
    if (appointmentIndex === -1) throw new Error('Appointment not found');
    
    mockAppointments[appointmentIndex] = { ...mockAppointments[appointmentIndex], ...data };
    return { data: { appointment: mockAppointments[appointmentIndex] } };
  },

  async deleteAppointment(id: string) {
    await delay(300);
    const appointmentIndex = mockAppointments.findIndex(a => a._id === id);
    if (appointmentIndex === -1) throw new Error('Appointment not found');
    
    mockAppointments.splice(appointmentIndex, 1);
    return { data: { success: true } };
  },

  // Auth (simulation)
  async login(email: string, _password: string) {
    await delay(800);
    if (email === 'admin@booklio.com' && _password === 'P@ssw0rd123') {
      return {
        data: {
          tokens: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token'
          },
          user: {
            id: '1',
            email: 'admin@booklio.com',
            name: 'Admin Booklio'
          }
        }
      };
    }
    throw new Error('Invalid credentials');
  },

  async register(_tenantId: string, email: string, _password: string) {
    await delay(1000);
    return {
      data: {
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        },
        user: {
          id: Date.now().toString(),
          email,
          name: email.split('@')[0]
        }
      }
    };
  },

  // Invoices
  async getInvoices(params?: any) {
    await delay(500);
    let filteredInvoices = [...mockInvoices];
    
    // Filtrer par clientId si fourni
    if (params?.clientId) {
      filteredInvoices = filteredInvoices.filter(inv => inv.client._id === params.clientId);
    }
    
    return { data: { items: filteredInvoices } };
  },

  async getInvoice(id: string) {
    await delay(300);
    const invoice = mockInvoices.find(inv => inv._id === id);
    if (!invoice) throw new Error('Invoice not found');
    return { data: invoice };
  },

  async createInvoice(data: any) {
    await delay(500);
    
    // Calculer advanceAmount depuis les payments initiaux
    const advanceAmount = data.payments && data.payments.length > 0 
      ? data.payments.reduce((sum: number, p: any) => sum + p.amount, 0)
      : 0;
    
    const remainingAmount = data.totalAmount - advanceAmount;
    
    // Mapper les payments
    const payments = data.payments ? data.payments.map((p: any, index: number) => ({
      _id: `payment-${Date.now()}-${index}`,
      amount: p.amount,
      method: p.method,
      reference: p.reference,
      paidAt: new Date().toISOString(),
      notes: p.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })) : [];
    
    // Déterminer le statut
    let status = 'draft';
    if (advanceAmount > 0 && advanceAmount < data.totalAmount) {
      status = 'partial';
    } else if (advanceAmount >= data.totalAmount) {
      status = 'paid';
    }
    
    // Récupérer le client
    const client = mockClients.find(c => c.id === data.clientId);
    
    const newInvoice = {
      _id: `inv-${Date.now()}`,
      tenantId: 'mock-tenant-id',
      client: client ? {
        _id: client.id,
        firstName: client.name.split(' ')[0],
        lastName: client.name.split(' ').slice(1).join(' '),
        email: client.email,
        phone: client.phone,
      } : undefined,
      totalAmount: data.totalAmount,
      advanceAmount,
      creditAmount: data.creditAmount || 0,
      currency: data.currency,
      status,
      notes: data.notes,
      remainingAmount,
      payments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockInvoices.push(newInvoice);
    
    // Calculer invoiceSummary pour ce client
    const clientInvoices = mockInvoices.filter(inv => inv.client?._id === data.clientId);
    const invoiceSummary = {
      totalAmount: clientInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      dueAmount: clientInvoices.reduce((sum, inv) => sum + inv.remainingAmount, 0),
      invoiceCount: clientInvoices.length,
      lastInvoiceAt: new Date().toISOString(),
    };
    
    return {
      data: {
        invoice: newInvoice,
        invoiceSummary,
      }
    };
  },

  async updateInvoice(id: string, data: any) {
    await delay(400);
    const invoiceIndex = mockInvoices.findIndex(inv => inv._id === id);
    if (invoiceIndex === -1) throw new Error('Invoice not found');
    
    mockInvoices[invoiceIndex] = {
      ...mockInvoices[invoiceIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    const clientId = mockInvoices[invoiceIndex].client?._id;
    const clientInvoices = mockInvoices.filter(inv => inv.client?._id === clientId);
    const invoiceSummary = {
      totalAmount: clientInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      dueAmount: clientInvoices.reduce((sum, inv) => sum + inv.remainingAmount, 0),
      invoiceCount: clientInvoices.length,
      lastInvoiceAt: new Date().toISOString(),
    };
    
    return {
      data: {
        invoice: mockInvoices[invoiceIndex],
        invoiceSummary,
      }
    };
  },

  async addPayment(invoiceId: string, paymentData: any) {
    await delay(400);
    const invoiceIndex = mockInvoices.findIndex(inv => inv._id === invoiceId);
    if (invoiceIndex === -1) throw new Error('Invoice not found');
    
    const newPayment = {
      _id: `payment-${Date.now()}`,
      amount: paymentData.amount,
      method: paymentData.method,
      reference: paymentData.reference,
      paidAt: new Date().toISOString(),
      notes: paymentData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockInvoices[invoiceIndex].payments.push(newPayment);
    
    // Recalculer advanceAmount et remainingAmount
    const advanceAmount = mockInvoices[invoiceIndex].payments.reduce((sum: number, p: any) => sum + p.amount, 0);
    const remainingAmount = mockInvoices[invoiceIndex].totalAmount - advanceAmount;
    
    // Mettre à jour le statut
    let status = mockInvoices[invoiceIndex].status;
    if (remainingAmount <= 0) {
      status = 'paid';
    } else if (advanceAmount > 0) {
      status = 'partial';
    }
    
    mockInvoices[invoiceIndex] = {
      ...mockInvoices[invoiceIndex],
      advanceAmount,
      remainingAmount,
      status,
      updatedAt: new Date().toISOString(),
    };
    
    const clientId = mockInvoices[invoiceIndex].client?._id;
    const clientInvoices = mockInvoices.filter(inv => inv.client?._id === clientId);
    const invoiceSummary = {
      totalAmount: clientInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      dueAmount: clientInvoices.reduce((sum, inv) => sum + inv.remainingAmount, 0),
      invoiceCount: clientInvoices.length,
      lastInvoiceAt: new Date().toISOString(),
    };
    
    return {
      data: {
        invoice: mockInvoices[invoiceIndex],
        invoiceSummary,
      }
    };
  },

  async deletePayment(invoiceId: string, paymentId: string) {
    await delay(400);
    const invoiceIndex = mockInvoices.findIndex(inv => inv._id === invoiceId);
    if (invoiceIndex === -1) throw new Error('Invoice not found');
    
    // Supprimer le paiement
    mockInvoices[invoiceIndex].payments = mockInvoices[invoiceIndex].payments.filter(
      (p: any) => p._id !== paymentId
    );
    
    // Recalculer advanceAmount et remainingAmount
    const advanceAmount = mockInvoices[invoiceIndex].payments.reduce((sum: number, p: any) => sum + p.amount, 0);
    const remainingAmount = mockInvoices[invoiceIndex].totalAmount - advanceAmount;
    
    // Mettre à jour le statut
    let status = 'draft';
    if (remainingAmount <= 0) {
      status = 'paid';
    } else if (advanceAmount > 0) {
      status = 'partial';
    }
    
    mockInvoices[invoiceIndex] = {
      ...mockInvoices[invoiceIndex],
      advanceAmount,
      remainingAmount,
      status,
      updatedAt: new Date().toISOString(),
    };
    
    const clientId = mockInvoices[invoiceIndex].client?._id;
    const clientInvoices = mockInvoices.filter(inv => inv.client?._id === clientId);
    const invoiceSummary = {
      totalAmount: clientInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      dueAmount: clientInvoices.reduce((sum, inv) => sum + inv.remainingAmount, 0),
      invoiceCount: clientInvoices.length,
      lastInvoiceAt: new Date().toISOString(),
    };
    
    return {
      data: {
        invoice: mockInvoices[invoiceIndex],
        invoiceSummary,
      }
    };
  },

  async deleteInvoice(id: string) {
    await delay(400);
    const invoiceIndex = mockInvoices.findIndex(inv => inv._id === id);
    if (invoiceIndex === -1) throw new Error('Invoice not found');
    
    const clientId = mockInvoices[invoiceIndex].client?._id;
    mockInvoices.splice(invoiceIndex, 1);
    
    const clientInvoices = mockInvoices.filter(inv => inv.client?._id === clientId);
    const invoiceSummary = {
      totalAmount: clientInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      dueAmount: clientInvoices.reduce((sum, inv) => sum + inv.remainingAmount, 0),
      invoiceCount: clientInvoices.length,
      lastInvoiceAt: clientInvoices.length > 0 ? new Date().toISOString() : undefined,
    };
    
    return {
      data: {
        ok: true,
        hardDeleted: true,
        clientId,
        invoiceSummary,
      }
    };
  }
};
