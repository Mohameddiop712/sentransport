import { useState, useEffect } from 'react';
import './ListeIncidents.css';

function ListeIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/incidents")
      .then(r => r.json())
      .then(data => {
        setIncidents(data);
        setChargement(false);
      })
      .catch(err => {
        console.error("Erreur incidents:", err);
        setChargement(false);
      });
  }, []);

  if (chargement) return <div className="liste-incidents">Chargement...</div>;

  return (
    <div className="liste-incidents">
      <h3 className="liste-incidents-titre">📋 Incidents signalés</h3>
      {incidents.length === 0 ? (
        <p className="liste-incidents-vide">Aucun incident signalé.</p>
      ) : (
        incidents.map(inc => (
          <div key={inc.id} className="incident-item">
            <span className="incident-ligne">Ligne {inc.ligne}</span>
            <span className="incident-lieu">📍 {inc.lieu}</span>
            <p className="incident-description">{inc.description}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default ListeIncidents;