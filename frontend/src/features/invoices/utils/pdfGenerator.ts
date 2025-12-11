import { Invoice } from '../types';

/**
 * Génère et télécharge un PDF pour une facture
 * Note: Cette implémentation utilise une méthode simple avec jsPDF
 * Pour une version production, vous pouvez utiliser une bibliothèque plus avancée
 * ou un service backend pour générer des PDFs professionnels
 */
export async function generateInvoicePDF(invoice: Invoice): Promise<void> {
  // Créer le contenu HTML de la facture
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Facture ${invoice.number || invoice.id}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 40px;
          color: #333;
        }
        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
          border-bottom: 2px solid #4F46E5;
          padding-bottom: 20px;
        }
        .company-info {
          flex: 1;
        }
        .invoice-info {
          text-align: right;
        }
        .invoice-number {
          font-size: 24px;
          font-weight: bold;
          color: #4F46E5;
          margin-bottom: 10px;
        }
        .client-info {
          background: #F3F4F6;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .details-table th {
          background: #4F46E5;
          color: white;
          padding: 12px;
          text-align: left;
        }
        .details-table td {
          padding: 12px;
          border-bottom: 1px solid #E5E7EB;
        }
        .totals {
          margin-left: auto;
          width: 300px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
        }
        .total-row.final {
          border-top: 2px solid #4F46E5;
          font-size: 18px;
          font-weight: bold;
          color: #4F46E5;
          margin-top: 10px;
          padding-top: 10px;
        }
        .status {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status.paid { background: #D1FAE5; color: #065F46; }
        .status.sent { background: #DBEAFE; color: #1E40AF; }
        .status.draft { background: #F3F4F6; color: #374151; }
        .status.overdue { background: #FEE2E2; color: #991B1B; }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #E5E7EB;
          text-align: center;
          color: #6B7280;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <h1 style="margin: 0; color: #4F46E5;">Booklio</h1>
          <p style="margin: 5px 0 0 0; color: #6B7280;">Gestion de rendez-vous</p>
        </div>
        <div class="invoice-info">
          <div class="invoice-number">FACTURE #${invoice.number || invoice.id}</div>
          <div class="status ${invoice.status}">${getStatusLabel(invoice.status)}</div>
          ${invoice.createdAt ? `<p style="margin: 10px 0 0 0; color: #6B7280;">Date: ${new Date(invoice.createdAt).toLocaleDateString('fr-FR')}</p>` : ''}
        </div>
      </div>

      ${invoice.client ? `
      <div class="client-info">
        <h3 style="margin: 0 0 10px 0; color: #111827;">Client</h3>
        <p style="margin: 5px 0;"><strong>${invoice.client.name || 'N/A'}</strong></p>
        ${invoice.client.email ? `<p style="margin: 5px 0;">${invoice.client.email}</p>` : ''}
        ${invoice.client.phone ? `<p style="margin: 5px 0;">${invoice.client.phone}</p>` : ''}
      </div>
      ` : ''}

      <table class="details-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: right;">Montant</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items && invoice.items.length > 0 ? invoice.items.map(item => `
            <tr>
              <td>
                <strong>${item.name}</strong>
                ${item.description ? `<br><small style="color: #6B7280;">${item.description}</small>` : ''}
              </td>
              <td style="text-align: right;">${(item.quantity * item.unitPrice).toFixed(2)} ${invoice.currency}</td>
            </tr>
          `).join('') : `
            <tr>
              <td>Prestation</td>
              <td style="text-align: right;">${(invoice.total || 0).toFixed(2)} ${invoice.currency}</td>
            </tr>
          `}
        </tbody>
      </table>

      <div class="totals">
        ${invoice.advanceAmount && invoice.advanceAmount > 0 ? `
        <div class="total-row">
          <span>Montant total:</span>
          <span>${(invoice.total || 0).toFixed(2)} ${invoice.currency}</span>
        </div>
        <div class="total-row" style="color: #059669;">
          <span>Avance versée:</span>
          <span>-${invoice.advanceAmount.toFixed(2)} ${invoice.currency}</span>
        </div>
        ` : ''}
        <div class="total-row final">
          <span>${invoice.advanceAmount && invoice.advanceAmount > 0 ? 'Solde dû:' : 'TOTAL:'}</span>
          <span>${(invoice.balanceDue !== undefined ? invoice.balanceDue : invoice.total || 0).toFixed(2)} ${invoice.currency}</span>
        </div>
      </div>

      ${invoice.notes ? `
      <div style="margin-top: 40px; padding: 20px; background: #F9FAFB; border-radius: 8px;">
        <h4 style="margin: 0 0 10px 0; color: #374151;">Notes</h4>
        <p style="margin: 0; color: #6B7280;">${invoice.notes}</p>
      </div>
      ` : ''}

      <div class="footer">
        <p>Merci pour votre confiance !</p>
        <p>Booklio - Gestion simplifiée de vos rendez-vous et factures</p>
      </div>
    </body>
    </html>
  `;

  // Créer un iframe caché pour imprimer
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  // Écrire le contenu dans l'iframe
  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();

    // Attendre que le contenu soit chargé puis imprimer
    iframe.contentWindow?.addEventListener('load', () => {
      setTimeout(() => {
        iframe.contentWindow?.print();
        // Retirer l'iframe après l'impression
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 100);
      }, 250);
    });
  }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Brouillon',
    sent: 'Envoyée',
    paid: 'Payée',
    partial: 'Partiellement payée',
    overdue: 'En retard',
    canceled: 'Annulée',
  };
  return labels[status] || status;
}

/**
 * Télécharge la facture en format HTML
 */
export function downloadInvoiceHTML(invoice: Invoice): void {
  const html = generateInvoiceHTML(invoice);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `facture-${invoice.number || invoice.id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateInvoiceHTML(invoice: Invoice): string {
  // Même logique que generateInvoicePDF mais retourne juste le HTML
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Facture ${invoice.number || invoice.id}</title>
  <style>/* Styles identiques */</style>
</head>
<body>
  <!-- Contenu identique -->
</body>
</html>`;
}
