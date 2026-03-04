import { useState, useEffect, useCallback } from "react";
import hotelService from "../../services/hotelService";
import cityService from "../../services/cityService";
import HotelFormModal from "../../components/admin/HotelFormModal";
import ConfirmDeleteModal from "../../components/admin/ConfirmDeleteModal";
import useToastStore from "../../store/toastStore";

const HotelsManagementPage = () => {
  const [hotels, setHotels] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");

  const [formModal, setFormModal] = useState({ open: false, hotel: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, hotel: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState(null);
  const [actionError, setActionError] = useState("");
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    cityService.getAll().then(setCities).catch(() => {});
  }, []);

  const fetchHotels = useCallback(async () => {
    setLoadingList(true);
    setListError("");
    try {
      const data = selectedCityId
        ? await hotelService.getByCity(selectedCityId)
        : await hotelService.getAll();
      setHotels(data);
    } catch {
      setListError("Impossible de charger les hôtels.");
    } finally {
      setLoadingList(false);
    }
  }, [selectedCityId]);

  useEffect(() => { fetchHotels(); }, [fetchHotels]);

  const openCreate = () => {
    setServerErrors(null);
    setActionError("");
    setFormModal({ open: true, hotel: null });
  };

  const openEdit = (hotel) => {
    setServerErrors(null);
    setActionError("");
    setFormModal({ open: true, hotel });
  };

  const openDelete = (hotel) => {
    setActionError("");
    setDeleteModal({ open: true, hotel });
  };

  const handleFormSubmit = async (payload) => {
    setActionLoading(true);
    setServerErrors(null);
    setActionError("");
    try {
      if (formModal.hotel) {
        await hotelService.update(formModal.hotel.id, payload);
        addToast("Hôtel modifié avec succès");
      } else {
        await hotelService.create(payload);
        addToast("Hôtel créé avec succès");
      }
      setFormModal({ open: false, hotel: null });
      fetchHotels();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        setServerErrors(data.errors);
      } else {
        const msg = data?.message || data?.error || "Une erreur est survenue";
        setActionError(msg);
        if (msg.toLowerCase().includes("nom")) {
          setServerErrors({ nom: msg });
        }
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    setActionError("");
    try {
      await hotelService.delete(deleteModal.hotel.id);
      setDeleteModal({ open: false, hotel: null });
      fetchHotels();
      addToast("Hôtel supprimé avec succès");
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de la suppression";
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const selectedCityName = selectedCityId
    ? cities.find((c) => String(c.idCity) === selectedCityId)?.nomVille
    : null;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Gestion des hôtels</h1>
          {selectedCityName && (
            <p className="text-sm text-gray-500 mt-0.5">
              Filtré par : <span className="font-medium text-blue-600">{selectedCityName}</span>
            </p>
          )}
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Nouvel hôtel
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Filtrer par ville :</label>
        <select
          value={selectedCityId}
          onChange={(e) => setSelectedCityId(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white min-w-[180px]"
        >
          <option value="">Toutes les villes</option>
          {cities.map((c) => (
            <option key={c.idCity} value={c.idCity}>{c.nomVille}</option>
          ))}
        </select>
        {selectedCityId && (
          <button
            onClick={() => setSelectedCityId("")}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {actionError && !formModal.open && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {actionError}
        </div>
      )}

      {listError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{listError}</div>
      )}

      {loadingList ? (
        <div className="text-center py-16 text-gray-400 text-sm">Chargement...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Nom</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Adresse</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Ville</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Prix/Jour</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Places</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Disponibilité</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {hotels.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    {selectedCityId ? "Aucun hôtel dans cette ville" : "Aucun hôtel trouvé"}
                  </td>
                </tr>
              ) : (
                hotels.map((h) => (
                  <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{h.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{h.nom}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate" title={h.adresse}>{h.adresse}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {h.city?.nomVille || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{h.prixParJour} MAD</td>
                    <td className="px-4 py-3 text-gray-600">{h.countOfPlace}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          h.disponibilite
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {h.disponibilite ? "Disponible" : "Non disponible"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEdit(h)}
                          className="px-3 py-1 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => openDelete(h)}
                          className="px-3 py-1 text-xs rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <HotelFormModal
        open={formModal.open}
        hotel={formModal.hotel}
        cities={cities}
        onClose={() => setFormModal({ open: false, hotel: null })}
        onSubmit={handleFormSubmit}
        loading={actionLoading}
        serverErrors={serverErrors}
      />

      <ConfirmDeleteModal
        open={deleteModal.open}
        userName={deleteModal.hotel?.nom}
        onClose={() => setDeleteModal({ open: false, hotel: null })}
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </div>
  );
};

export default HotelsManagementPage;
