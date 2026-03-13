import { useState } from "react";
import { Link } from "react-router-dom";

const ORANGE = "#E8720C";
const ORANGE_LIGHT = "#FFF4EB";

// ─── Pet Card ──────────────────────────────────────────────────
const PetCard = ({ pet, onEdit, onDelete }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Supprimer ${pet.nom}?`)) return;
    setDeleting(true);
    try {
      onDelete(pet.id);
    } finally {
      setDeleting(false);
    }
  };

  const speciesEmoji = {
    chien: "🐕",
    chat: "🐱",
    lapin: "🐰",
    oiseau: "🦜",
    hamster: "🐹",
    cobaye: "🐭",
  }[pet.espece?.toLowerCase()] || "🐾";

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6" style={{ boxShadow: "0 2px 18px 0 rgba(0,0,0,0.06)" }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: ORANGE_LIGHT }}>
            {speciesEmoji}
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 text-lg">{pet.nom}</h3>
            <p className="text-sm text-gray-500 capitalize">{pet.espece}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(pet)}
            className="px-3 py-1.5 text-xs font-semibold text-white border rounded-xl transition-opacity hover:opacity-90"
            style={{ backgroundColor: ORANGE, borderColor: ORANGE }}
          >
            ✏️ Modifier
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1.5 text-xs font-semibold text-white border rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#DC2626", borderColor: "#DC2626" }}
          >
            {deleting ? "…" : "🗑️ Supprimer"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Race", value: pet.race || "—" },
          { label: "Âge", value: pet.age ? `${pet.age} ans` : "—" },
          { label: "Poids", value: pet.poids ? `${pet.poids} kg` : "—" },
          { label: "Couleur", value: pet.couleur || "—" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-gray-800">{value}</p>
          </div>
        ))}
      </div>

      {pet.commentaires && (
        <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-400 font-medium mb-1">Notes</p>
          <p className="text-sm text-gray-700">{pet.commentaires}</p>
        </div>
      )}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────
const MyPetsPage = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Placeholder: pets data would come from API
  const demoHasPets = false;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter','Poppins',sans-serif" }}>
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Mes animaux</h1>
            <p className="text-gray-500 text-sm mt-1">Gestion complète de vos compagnons</p>
          </div>
          <Link
            to="#"
            className="text-sm px-4 py-2 text-white font-semibold rounded-2xl hover:opacity-90 transition-opacity"
            style={{ backgroundColor: ORANGE }}
          >
            + Ajouter un animal
          </Link>
        </div>

        {/* Stats */}
        {!loading && pets.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total", value: pets.length, color: ORANGE, bg: ORANGE_LIGHT },
              { label: "Chiens", value: pets.filter((p) => p.espece?.toLowerCase() === "chien").length, color: "#10B981", bg: "#ECFDF5" },
              { label: "Chats", value: pets.filter((p) => p.espece?.toLowerCase() === "chat").length, color: "#F97316", bg: "#FFF7ED" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className="rounded-3xl p-4" style={{ backgroundColor: bg }}>
                <p className="text-2xl font-extrabold" style={{ color }}>{value}</p>
                <p className="text-xs font-medium mt-0.5 opacity-80 text-gray-600">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 animate-pulse">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-100 rounded w-32" />
                    <div className="h-3 bg-gray-100 rounded w-24" />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-16 bg-gray-100 rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : demoHasPets || pets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: ORANGE_LIGHT }}>
              <span className="text-5xl">🐾</span>
            </div>
            <p className="text-gray-500 font-medium text-lg mb-2">Aucun animal enregistré</p>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              Ajoutez vos animaux de compagnie pour bénéficier nos services de consultations, dressage et garde.
            </p>
            <Link
              to="#"
              className="inline-block px-6 py-3 text-white font-semibold rounded-2xl transition-opacity hover:opacity-90"
              style={{ backgroundColor: ORANGE }}
            >
              Ajouter mon premier animal
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                onEdit={(p) => console.log("Edit:", p)}
                onDelete={(id) => setPets((prev) => prev.filter((p) => p.id !== id))}
              />
            ))}
          </div>
        )}

        {/* Info section */}
        <div className="mt-12 rounded-3xl p-8 text-white" style={{ background: `linear-gradient(135deg, ${ORANGE} 0%, #f5a623 100%)` }}>
          <h3 className="text-lg font-extrabold mb-4">💡 Pourquoi enregistrer vos animaux?</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="shrink-0 mt-1">✓</span>
              <span>Accès facile à l'historique médical et aux consultations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 mt-1">✓</span>
              <span>Réservation simplifiée pour les dressages et services</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 mt-1">✓</span>
              <span>Gestion des vaccinations et documents importants</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0 mt-1">✓</span>
              <span>Profil partagé avec nos vétérinaires et dresseurs</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MyPetsPage;
