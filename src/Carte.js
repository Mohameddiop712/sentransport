import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Carte.css';

// Corriger les icones Leaflet (bug webpack)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Exercice 2 : Composant pour centrer la carte
function BoutonCentrer({ position }) {
  const map = useMap();
  if (!position) return null;
  return (
    <button
      className="bouton-centrer"
      onClick={() => map.setView(position, 15)}
    >
      📍 Centrer sur ma position
    </button>
  );
}

// Calculer la distance entre 2 points GPS (km) - Formule de Haversine
function calculerDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function Carte() {
  const [arrets, setArrets] = useState([]);
  const [positionUtilisateur, setPositionUtilisateur] = useState(null);
  const [arretProche, setArretProche] = useState(null);
  const [arretsTries, setArretsTries] = useState([]);
  const DAKAR = [14.6928, -17.4467];

  // Icone rouge pour l'arret le plus proche (Exercice 1)
  const iconeProche = new L.Icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  // Charger les arrets depuis Flask
  useEffect(() => {
    fetch("http://localhost:5000/arrets-geo")
      .then(r => r.json())
      .then(data => setArrets(data))
      .catch(err => console.error("Erreur arrets:", err));
  }, []);

  // Geolocalisation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setPositionUtilisateur([
            pos.coords.latitude,
            pos.coords.longitude
          ]);
        },
        () => console.log("Geolocation refusee")
      );
    }
  }, []);

  // Trouver les 3 arrets les plus proches (Exercice 3)
  useEffect(() => {
    if (positionUtilisateur && arrets.length > 0) {
      const arretsAvecDistance = arrets.map(a => ({
        ...a,
        distance: calculerDistance(
          positionUtilisateur[0],
          positionUtilisateur[1],
          a.lat,
          a.lon
        )
      }));
      arretsAvecDistance.sort((a, b) => a.distance - b.distance);
      setArretProche(arretsAvecDistance[0]);
      setArretsTries(arretsAvecDistance.slice(0, 3));
    }
  }, [positionUtilisateur, arrets]);

  return (
    <div className="carte-container">
      <h2 className="carte-titre">Carte des arrêts</h2>

      {/* Exercice 3 : Les 3 arrêts les plus proches */}
      {arretsTries.length > 0 && (
        <div className="arrets-proches-liste">
          <p className="arrets-proches-titre">🚌 Les 3 arrêts les plus proches :</p>
          {arretsTries.map((a, i) => (
            <p key={a.id} className={`arret-proche ${i === 0 ? 'arret-proche-premier' : ''}`}>
              {i + 1}. <strong>{a.nom}</strong> — {a.distance.toFixed(1)} km
              — Lignes : {a.lignes.join(", ")}
            </p>
          ))}
        </div>
      )}

      <MapContainer center={DAKAR} zoom={13} className="carte">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        {arrets.map(a => (
          <Marker
            key={a.id}
            position={[a.lat, a.lon]}
            icon={arretProche && arretProche.id === a.id ? iconeProche : new L.Icon.Default()}
          >
            <Popup>
              <strong>{a.nom}</strong><br />
              Lignes : {a.lignes.join(", ")}
            </Popup>
          </Marker>
        ))}
        {positionUtilisateur && (
          <Marker position={positionUtilisateur}>
            <Popup>Vous êtes ici</Popup>
          </Marker>
        )}
        {/* Exercice 2 : Bouton centrer */}
        <BoutonCentrer position={positionUtilisateur} />
      </MapContainer>
    </div>
  );
}

export default Carte;