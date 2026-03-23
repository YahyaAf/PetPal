/**
 * Generates and opens a printable/downloadable hotel reservation ticket
 * with PetPal branding — Black/Gold elegant design.
 */
export const printHotelTicket = (reservation, user = {}) => {
  const hotel    = reservation.hotel || {};
  const hotelNom = hotel.nom  || hotel.name || "Hôtel";
  const ville    = hotel.city?.nomVille || hotel.villeNom || "";
  const adresse  = hotel.adresse || "";

  const resId    = `RES-${String(reservation.idReservation ?? 0).padStart(5, "0")}`;
  const montant  = Number(reservation.montantTotal ?? 0).toFixed(2);
  const days     = reservation.days ?? "1";
  const guestName = user.nom || user.name || user.email || "Client PetPal";

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("fr-FR", {
      weekday: "short", day: "2-digit", month: "short", year: "numeric",
    });
  };

  const arrive = formatDate(reservation.dateDebut);
  const depart = formatDate(reservation.dateFin);
  const currentYear = new Date().getFullYear();

  // Pseudo-barcode built from reservation id repeated
  const barcodeVal = String(reservation.idReservation ?? "0").padStart(6, "0");
  const barcodeDisplay = `${barcodeVal} ${barcodeVal}`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>${resId}</title>
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

    .ticket-container {
      width: 100%;
      max-width: 700px;
      background: #fff;
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    }

    .ticket-content {
      display: flex;
      min-height: 350px;
    }

    /* Left side - Black */
    .ticket-left {
      flex: 1;
      background: #1a1a1a;
      padding: 32px 28px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .ticket-left::before {
      content: '🐾';
      position: absolute;
      top: -20px;
      right: -20px;
      font-size: 150px;
      opacity: 0.05;
    }

    .event-badge {
      display: inline-block;
      background: #f59e0b;
      color: #000;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 14px;
      width: fit-content;
    }

    .hotel-title {
      font-size: 52px;
      font-weight: 900;
      color: #fff;
      line-height: 1.1;
      margin-bottom: 8px;
      font-style: italic;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .hotel-subtitle {
      color: rgba(255,255,255,0.6);
      font-size: 13px;
      margin-bottom: 24px;
    }

    .details-section {
      space-y: 18px;
    }

    .detail-block {
      margin-bottom: 18px;
    }

    .detail-label {
      font-size: 10px;
      font-weight: 700;
      color: rgba(255,255,255,0.5);
      letter-spacing: 1.2px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .detail-content {
      font-size: 15px;
      font-weight: 600;
      color: #fff;
    }

    .detail-content.gold {
      color: #f59e0b;
      font-size: 20px;
      font-weight: 900;
    }

    .contact-section {
      padding-top: 16px;
      border-top: 1px solid rgba(255,255,255,0.1);
      margin-top: 16px;
    }

    .contact-line {
      font-size: 12px;
      color: #f59e0b;
      margin-bottom: 4px;
      font-weight: 500;
    }

    /* Perforation line */
    .perforation {
      width: 20px;
      position: relative;
      background: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2720%27 height=%2740%27 viewBox=%270 0 20 40%27%3E%3Ccircle cx=%2710%27 cy=%275%27 r=%274%27 fill=%27%23e5e7eb%27/%3E%3Ccircle cx=%2710%27 cy=%2735%27 r=%274%27 fill=%27%23e5e7eb%27/%3E%3C/svg%3E') repeat-y center;
    }

    /* Right side - White */
    .ticket-right {
      flex: 1;
      background: #fff;
      padding: 32px 28px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      position: relative;
    }

    .icon-large {
      font-size: 80px;
      margin-bottom: 12px;
    }

    .hotel-name-right {
      font-size: 28px;
      font-weight: 900;
      color: #000;
      margin-bottom: 8px;
      line-height: 1.2;
    }

    .year {
      font-size: 18px;
      color: rgba(0,0,0,0.4);
      font-weight: 600;
      margin-bottom: 20px;
    }

    .ticket-details {
      width: 100%;
      margin-bottom: 16px;
      text-align: center;
    }

    .ticket-detail-item {
      margin-bottom: 12px;
    }

    .ticket-detail-label {
      font-size: 9px;
      font-weight: 700;
      color: rgba(0,0,0,0.5);
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 3px;
    }

    .ticket-detail-value {
      font-size: 13px;
      font-weight: 700;
      color: #000;
      font-family: 'Courier Prime', monospace;
    }

    .rating {
      font-size: 16px;
      color: #f59e0b;
      margin-bottom: 16px;
      letter-spacing: 2px;
    }

    .barcode-display {
      width: 100%;
      height: 50px;
      background: #f3f4f6;
      border-radius: 8px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 2px;
      padding: 8px;
      margin-bottom: 8px;
    }

    .bar {
      background: #1a1a1a;
      border-radius: 1px;
      flex: 1;
      min-width: 3px;
    }

    .barcode-text {
      font-size: 10px;
      color: rgba(0,0,0,0.4);
      font-family: 'Courier Prime', monospace;
      letter-spacing: 3px;
    }

    @media print {
      body { background: #fff; padding: 0; }
      .ticket-container { box-shadow: none; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="ticket-container">
    <div class="ticket-content">
      
      <!-- Left Side (Black) -->
      <div class="ticket-left">
        <div>
          <div class="event-badge">🏨 Réservation</div>
          <div class="hotel-title">${hotelNom}</div>
          <div class="hotel-subtitle">Hôtel pour animaux PetPal</div>
        </div>

        <div class="details-section">
          <div class="detail-block">
            <div class="detail-label">Dates</div>
            <div class="detail-content">${arrive} → ${depart}</div>
          </div>

          <div class="detail-block">
            <div class="detail-label">Durée</div>
            <div class="detail-content">${days} nuit${Number(days) > 1 ? "s" : ""}</div>
          </div>

          <div class="detail-block">
            <div class="detail-label">Montant</div>
            <div class="detail-content gold">${montant} MAD</div>
          </div>

          <div class="contact-section">
            <div class="detail-label">Contact</div>
            <div class="contact-line">📞 +212 5XX XXX XXX</div>
            <div class="contact-line">📧 info@petpal.ma</div>
          </div>
        </div>
      </div>

      <!-- Perforation -->
      <div class="perforation"></div>

      <!-- Right Side (White) -->
      <div class="ticket-right">
        <div class="icon-large">🏨</div>
        <div class="hotel-name-right">${hotelNom}</div>
        <div class="year">${currentYear}</div>

        <div class="ticket-details">
          <div class="ticket-detail-item">
            <div class="ticket-detail-label">Numéro de réservation</div>
            <div class="ticket-detail-value">${resId}</div>
          </div>
          <div class="ticket-detail-item">
            <div class="ticket-detail-label">Montant</div>
            <div class="ticket-detail-value">${montant} MAD</div>
          </div>
        </div>

        <div class="rating">★★★★★</div>

        <div class="barcode-display">
          ${generateBarcode(reservation.idReservation ?? 1)}
        </div>
        <div class="barcode-text">${barcodeDisplay}</div>
      </div>

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

// Pseudo-barcode: generate div bars from reservation ID seed
function generateBarcode(seed) {
  const heights = [50,35,50,25,40,50,30,45,50,20,44,50,28,42,36,50,22,46,
                   38,50,32,18,50,36,42,50,26,40,50,24,46,50,32,42,36,50];
  const offset  = (Number(seed) % 10);

  return heights.map((h, i) => {
    const idx = (i + offset) % heights.length;
    return `<div class="bar" style="height:${heights[idx]}px;"></div>`;
  }).join("");
}
