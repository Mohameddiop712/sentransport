import { useState, useEffect } from 'react';
import './Previsions.css';

function Previsions() {
  const [previsions, setPrevisions] = useState([]);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    const API_KEY = process.env.REACT_APP_OWM_KEY;
    if (!API_KEY) {
      setErreur("Clé API manquante");
      return;
    }

    const url =
      `https://api.openweathermap.org/data/2.5/forecast`
      + `?q=Dakar&appid=${API_KEY}`
      + `&units=metric&lang=fr&cnt=24`;

    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error("Erreur : " + r.status);
        return r.json();
      })
      .then(data => {
        // Prendre une prévision par jour (toutes les 8 entrées = 24h)
        const parJour = data.list.filter((_, i) => i % 8 === 0).slice(0, 3);
        setPrevisions(parJour.map(item => ({
          date: new Date(item.dt * 1000).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' }),
          temp: Math.round(item.main.temp),
          description: item.weather[0].description,
          icone: item.weather[0].icon,
        })));
      })
      .catch(err => setErreur(err.message));
  }, []);

  if (erreur) return null;
  if (previsions.length === 0) return null;

  return (
    <div className="previsions">
      <p className="previsions-titre">📅 Prévisions 3 prochains jours</p>
      <div className="previsions-liste">
        {previsions.map((p, i) => (
          <div key={i} className="prevision-item">
            <p className="prevision-date">{p.date}</p>
            <img
              src={`https://openweathermap.org/img/wn/${p.icone}@2x.png`}
              alt={p.description}
              className="prevision-icone"
            />
            <p className="prevision-temp">{p.temp}°C</p>
            <p className="prevision-desc">{p.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Previsions;