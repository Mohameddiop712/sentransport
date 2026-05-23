import { useState, useEffect } from 'react';
import './App.css';
import Header from './Header';
import Recherche from './Recherche';
import LigneBus from './LigneBus';
import DetailLigne from './DetailLigne';
import Footer from './Footer';

function App() {
  // 1. Trois états pour gérer le fetch
  const [lignes, setLignes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  
  // 2. Les autres états
  const [recherche, setRecherche] = useState("");
  const [ligneSelectionnee, setLigneSelectionnee] = useState(null);
  const [compteurRecherche, setCompteurRecherche] = useState(0);

  // 3. Fonction fetch extraite
  function chargerLignes() {
    setChargement(true);
    setErreur(null);
    fetch("http://localhost:5000/lignes")
      .then(response => {
        if (!response.ok) {
          throw new Error("Erreur serveur : " + response.status);
        }
        return response.json();
      })
      .then(data => {
        setLignes(data);
        setChargement(false);
      })
      .catch(error => {
        setErreur(error.message);
        setChargement(false);
      });
  }

  // 4. Charger au démarrage
  useEffect(() => {
    chargerLignes();
  }, []);

  // 5. Filtre
  const lignesFiltrees = lignes.filter(l =>
    l.depart.toLowerCase().includes(recherche.toLowerCase()) ||
    l.arrivee.toLowerCase().includes(recherche.toLowerCase()) ||
    l.numero.includes(recherche)
  );

  // 6. Clic sur une ligne — fetch les détails via /lignes/<id>
  function handleClickLigne(ligne) {
    if (ligneSelectionnee && ligneSelectionnee.id === ligne.id) {
      setLigneSelectionnee(null);
    } else {
      fetch("http://localhost:5000/lignes/" + ligne.id)
        .then(response => response.json())
        .then(data => {
          setLigneSelectionnee(data);
        })
        .catch(error => {
          console.error("Erreur chargement détails :", error);
        });
    }
  }

  // 7. Écran de chargement
  if (chargement) {
    return (
      <div className="App">
        <Header />
        <main className="contenu">
          <p className="message-chargement">Chargement des lignes...</p>
        </main>
      </div>
    );
  }

  // 8. Écran d'erreur
  if (erreur) {
    return (
      <div className="App">
        <Header />
        <main className="contenu">
          <div className="message-erreur">
            <p>Impossible de charger les lignes.</p>
            <p className="erreur-detail">{erreur}</p>
            <p>Vérifiez que le serveur Flask est lancé (python api/app.py).</p>
            <button className="bouton-recharger" onClick={chargerLignes}>
              🔄 Recharger
            </button>
          </div>
        </main>
      </div>
    );
  }

  // 9. Écran normal
  return (
    <div className="App">
      <Header />
      <main className="contenu">
        <button className="bouton-recharger" onClick={chargerLignes}>
          🔄 Recharger
        </button>
        <Recherche valeur={recherche} onChange={(texte) => {
          setRecherche(texte);
          if (texte.length > 0) {
            setCompteurRecherche(c => c + 1);
          }
        }} />
        <p className="compteur-recherche">
          Vous avez effectué {compteurRecherche} recherche{compteurRecherche > 1 ? 's' : ''}
        </p>
        <p className="resultat-recherche">
          {lignesFiltrees.length} ligne{lignesFiltrees.length > 1 ? 's' : ''} trouvee{lignesFiltrees.length > 1 ? 's' : ''}
        </p>
        {lignesFiltrees.length === 0 && (
          <p className="aucun-resultat">Aucune ligne trouvée</p>
        )}
        {lignesFiltrees.map(ligne => (
          <LigneBus
            key={ligne.id}
            numero={ligne.numero}
            depart={ligne.depart}
            arrivee={ligne.arrivee}
            arrets={ligne.arrets}
            estSelectionnee={ligneSelectionnee
              && ligneSelectionnee.id === ligne.id}
            onClick={() => handleClickLigne(ligne)}
          />
        ))}
        {ligneSelectionnee
          && <DetailLigne ligne={ligneSelectionnee} />}
      </main>
      <Footer />
    </div>
  );
}

export default App;