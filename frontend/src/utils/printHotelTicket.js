/**
 * Generates and opens a printable/downloadable hotel reservation ticket
 * with PetPal branding — "Hotel for dogs" design.
 */
export const printHotelTicket = (reservation, user = {}) => {
  const hotel    = reservation.hotel || {};
  const hotelNom = hotel.nom  || hotel.name || "Hôtel";
  const ville    = hotel.city?.nomVille || hotel.villeNom || "";
  const adresse  = hotel.adresse || "";

  const resId    = `RES-${String(reservation.idReservation ?? 0).padStart(5, "0")}`;
  const montant  = Number(reservation.montantTotal ?? 0).toFixed(2);
  const days     = reservation.days ?? "—";
  const guestName = user.nom || user.name || user.email || "Client PetPal";

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("fr-FR", {
      weekday: "long", day: "2-digit", month: "long", year: "numeric",
    });
  };

  const arrive = formatDate(reservation.dateDebut);
  const depart = formatDate(reservation.dateFin);
  const printedAt = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  // Pseudo-barcode built from reservation id repeated
  const barcodeVal = String(reservation.idReservation ?? "0").padStart(6, "0");
  const barcodeDisplay = `${barcodeVal} ${barcodeVal} ${barcodeVal} ${barcodeVal}`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Ticket — ${resId}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Courier+Prime:wght@400;700&display=swap');

    body {
      font-family: 'Inter', Arial, sans-serif;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 32px 16px;
    }

    .ticket {
      width: 480px;
      background: #fff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      position: relative;
    }

    /* ── Header ── */
    .ticket-header {
      background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 40%, #3b82f6 100%);
      padding: 28px 28px 20px;
      position: relative;
      overflow: hidden;
    }
    .ticket-header::before {
      content: '🐾';
      position: absolute;
      right: -10px;
      top: -20px;
      font-size: 120px;
      opacity: 0.08;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 18px;
    }
    .brand-logo {
      width: 42px;
      height: 42px;
      background: rgba(255,255,255,0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }
    .brand-name {
      color: #fff;
      font-weight: 800;
      font-size: 22px;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      color: rgba(255,255,255,0.7);
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    .ticket-type {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 8px;
      padding: 5px 12px;
      color: #fff;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 14px;
    }

    .hotel-name {
      color: #fff;
      font-size: 22px;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 4px;
    }
    .hotel-ville {
      color: rgba(255,255,255,0.75);
      font-size: 13px;
      font-weight: 500;
    }
    .hotel-adresse {
      color: rgba(255,255,255,0.55);
      font-size: 11px;
      margin-top: 2px;
    }

    /* ── Dates strip ── */
    .dates-strip {
      background: linear-gradient(90deg, #1e3a8a, #1d4ed8);
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      padding: 16px 28px;
      gap: 8px;
    }
    .date-block { }
    .date-label {
      color: rgba(255,255,255,0.55);
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .date-value {
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      line-height: 1.3;
      text-transform: capitalize;
    }
    .date-arrow {
      color: rgba(255,255,255,0.4);
      font-size: 18px;
      text-align: center;
    }

    /* ── Perforation ── */
    .perforation {
      background: #f1f5f9;
      display: flex;
      align-items: center;
      position: relative;
      height: 24px;
    }
    .perforation::before, .perforation::after {
      content: '';
      position: absolute;
      width: 24px;
      height: 24px;
      background: #f1f5f9;
      border-radius: 50%;
      top: 0;
    }
    .perforation::before { left: -12px; }
    .perforation::after  { right: -12px; }
    .perf-line {
      flex: 1;
      border-top: 2px dashed #cbd5e1;
      margin: 0 24px;
    }

    /* ── Body ── */
    .ticket-body {
      padding: 22px 28px 18px;
    }

    /* Reservation ID & status */
    .res-id-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
    }
    .res-id {
      font-family: 'Courier Prime', 'Courier New', monospace;
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
      letter-spacing: 1px;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      border-radius: 100px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #bbf7d0;
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #16a34a;
    }

    /* Details grid */
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 16px;
      margin-bottom: 18px;
    }
    .detail-item { }
    .detail-label {
      font-size: 10px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 3px;
    }
    .detail-value {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }

    /* Total row */
    .total-row {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 14px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
    }
    .total-label {
      font-size: 13px;
      font-weight: 600;
      color: #3b82f6;
    }
    .total-amount {
      font-size: 22px;
      font-weight: 900;
      color: #1d4ed8;
    }
    .total-currency {
      font-size: 12px;
      color: #3b82f6;
      margin-left: 4px;
    }

    /* Guest row */
    .guest-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: #f8fafc;
      border-radius: 12px;
      margin-bottom: 4px;
    }
    .guest-avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 16px;
      flex-shrink: 0;
    }
    .guest-name {
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
    }
    .guest-tag {
      font-size: 10px;
      color: #64748b;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* ── Barcode section ── */
    .barcode-section {
      background: #f8fafc;
      border-top: 2px dashed #e2e8f0;
      padding: 16px 28px 20px;
      text-align: center;
    }
    .barcode-lines {
      display: flex;
      justify-content: center;
      align-items: flex-end;
      gap: 2px;
      height: 48px;
      margin-bottom: 8px;
    }
    .barcode-lines span {
      display: inline-block;
      background: #1e293b;
      border-radius: 1px;
    }
    .barcode-number {
      font-family: 'Courier Prime', 'Courier New', monospace;
      font-size: 11px;
      color: #64748b;
      letter-spacing: 3px;
      margin-bottom: 6px;
    }
    .print-note {
      font-size: 9.5px;
      color: #94a3b8;
      letter-spacing: 0.3px;
    }

    /* Paw watermark */
    .watermark {
      position: absolute;
      bottom: 60px;
      right: 20px;
      font-size: 72px;
      opacity: 0.035;
      transform: rotate(-15deg);
      pointer-events: none;
    }

    @media print {
      body { background: #fff; padding: 0; }
      .ticket { box-shadow: none; border-radius: 0; width: 100%; }
    }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="watermark">🐾</div>

    <!-- Header -->
    <div class="ticket-header">
      <div class="brand">
        <div class="brand-logo">🐾</div>
        <div>
          <div class="brand-name">PetPal</div>
          <div class="brand-sub">Hôtel pour animaux</div>
        </div>
      </div>
      <div class="ticket-type">🏨 Billet de réservation</div>
      <div class="hotel-name">${hotelNom}</div>
      ${ville ? `<div class="hotel-ville">📍 ${ville}</div>` : ""}
      ${adresse ? `<div class="hotel-adresse">${adresse}</div>` : ""}
    </div>

    <!-- Dates strip -->
    <div class="dates-strip">
      <div class="date-block">
        <div class="date-label">Arrivée</div>
        <div class="date-value">${arrive}</div>
      </div>
      <div class="date-arrow">→</div>
      <div class="date-block" style="text-align:right">
        <div class="date-label">Départ</div>
        <div class="date-value">${depart}</div>
      </div>
    </div>

    <!-- Perforation -->
    <div class="perforation"><div class="perf-line"></div></div>

    <!-- Body -->
    <div class="ticket-body">
      <!-- Res ID + status -->
      <div class="res-id-row">
        <div class="res-id">${resId}</div>
        <div class="status-badge">
          <span class="status-dot"></span>
          Confirmée
        </div>
      </div>

      <!-- Details -->
      <div class="details-grid">
        <div class="detail-item">
          <div class="detail-label">Durée du séjour</div>
          <div class="detail-value">${days} nuit${Number(days) > 1 ? "s" : ""}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Hôtel</div>
          <div class="detail-value">${hotelNom}</div>
        </div>
        ${ville ? `
        <div class="detail-item">
          <div class="detail-label">Ville</div>
          <div class="detail-value">${ville}</div>
        </div>` : ""}
        <div class="detail-item">
          <div class="detail-label">Émis le</div>
          <div class="detail-value" style="font-size:12px">${printedAt}</div>
        </div>
      </div>

      <!-- Total -->
      <div class="total-row">
        <div class="total-label">Montant total payé</div>
        <div>
          <span class="total-amount">${montant}</span>
          <span class="total-currency">MAD</span>
        </div>
      </div>

      <!-- Guest -->
      <div class="guest-row">
        <div class="guest-avatar">👤</div>
        <div>
          <div class="guest-name">${guestName}</div>
          <div class="guest-tag">Client PetPal</div>
        </div>
      </div>
    </div>

    <!-- Barcode -->
    <div class="barcode-section">
      <div class="barcode-lines">
        ${generateBarcode(reservation.idReservation ?? 1)}
      </div>
      <div class="barcode-number">${barcodeDisplay}</div>
      <div class="print-note">Présentez ce billet à l'accueil de l'hôtel • petpal.ma</div>
    </div>
  </div>

  <script>
    window.onload = () => {
      setTimeout(() => { window.print(); }, 400);
    };
  </script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=600,height=900");
  if (!win) {
    alert("Veuillez autoriser les pop-ups pour télécharger le ticket.");
    return;
  }
  win.document.write(html);
  win.document.close();
};

// Pseudo-barcode: generate SVG-like bar heights from reservation ID seed
function generateBarcode(seed) {
  const heights = [48,32,48,20,40,48,28,36,48,16,44,48,24,40,32,48,20,44,
                   36,48,28,16,48,32,40,48,24,36,48,20,44,48,28,40,32,48];
  const widths  = [3,1,2,3,1,3,2,1,3,2,1,3,2,3,1,2,3,1,2,3,1,3,2,1,3,2,1,3,2,3,1,2,3,1,2,3];
  const offset  = (Number(seed) % 10);

  return heights.map((h, i) => {
    const idx = (i + offset) % heights.length;
    const w   = widths[(i + offset) % widths.length];
    return `<span style="height:${heights[idx]}px;width:${w}px;"></span>`;
  }).join("");
}
