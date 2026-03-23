/**
 * Example Usage: How to use printTrainingTicket in your training pages
 * Same logic as printHotelTicket but for training reservations
 */

import { printTrainingTicket } from "../utils/printTrainingTicket";

/* ════════════════════════════════════════════════════════════════════════════
   USAGE IN MY TRAINING RESERVATIONS PAGE
   Component: src/pages/client/DresseurReservationsPage.jsx
═════════════════════════════════════════════════════════════════════════════ */

// Import at the top:
// import { printTrainingTicket } from "../../utils/printTrainingTicket";

// In your component JSX:
const handlePrintTicket = (reservation) => {
  // Call the function with the reservation data
  printTrainingTicket(reservation, { nom: "Client Name" });
};

// In your button/list:
{/* <button onClick={() => handlePrintTicket(reservation)}>
  🎫 Télécharger le ticket
</button> */}

/* ════════════════════════════════════════════════════════════════════════════
   STRUCTURE COMPARISON
═════════════════════════════════════════════════════════════════════════════ */

// printHotelTicket extracts:
// - hotel.nom → hotelNom
// - reservation.dateDebut/dateFin → arrive/depart
// - reservation.montantTotal → montant
// - reservation.days → duration
// Badge: 🏨 Réservation

// printTrainingTicket extracts:
// - trainingType.nom → trainingNom
// - reservation.dateDebut/dateFin → debut/fin
// - reservation.totalPrice → montant
// - reservation.duree → duration
// - dresseur.nom + email → trainer info
// Badge: 🎓 Formation

/* ════════════════════════════════════════════════════════════════════════════
   DATA FLOW
═════════════════════════════════════════════════════════════════════════════ */

// When user completes training reservation:
// 1. Backend creates training reservation with full data
// 2. Frontend receives: { 
//    idReservation, dateDebut, dateFin, totalPrice, duree, 
//    trainingType: { nom, duree, prix },
//    dresseur: { nom, email },
//    client: { nom, email }
//  }
// 3. Pass to printTrainingTicket()
// 4. Function extracts data and generates ticket with barcode

/* ════════════════════════════════════════════════════════════════════════════
   INTEGRATION EXAMPLE IN YOUR PAGE
═════════════════════════════════════════════════════════════════════════════ */

export const TrainingPageExample = ({ trainingReservations = [] }) => {
  return (
    <div className="space-y-4">
      {trainingReservations.map((reservation) => (
        <div
          key={reservation.idReservation}
          className="p-4 border rounded-lg flex justify-between items-center"
        >
          <div>
            <h3 className="font-bold">{reservation.trainingType?.nom}</h3>
            <p className="text-sm text-gray-600">
              {reservation.dateDebut} to {reservation.dateFin}
            </p>
            <p className="font-semibold">
              {reservation.totalPrice?.toFixed(2)} MAD
            </p>
          </div>

          <button
            onClick={() => printTrainingTicket(reservation, { nom: "User" })}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg"
          >
            🎫 Imprimer le ticket
          </button>
        </div>
      ))}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   KEY DIFFERENCES
═════════════════════════════════════════════════════════════════════════════ */

/*
Hotel Ticket:
- Badge: 🏨 Réservation
- Title: Hotel name
- Left Info: Dates, Duration, Amount, Contact
- Left Icon: 🏨
- Show: Hotel address, city

Training Ticket:
- Badge: 🎓 Formation  
- Title: Training type name
- Left Info: Dates, Duration, Amount, Trainer
- Left Icon: 🎓
- Show: Trainer name & email

Both use same:
- Black/Gold design
- Perforation line
- Barcode
- Right-side white ticket info
- Print on A4 paper
*/
