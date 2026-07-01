import React, { useState, useMemo } from "react";
import { IoClose, IoSearch } from "react-icons/io5";
import { AnimatePresence, motion } from "framer-motion";

// --- MOCK DATA: In a real app, this would likely come from an API ---
const allProfessions = [
  "Administrateur civil",
  "Administrateur réseau",
  "Agent d’assurance",
  "Agent immobilier",
  "Aide-soignant",
  "Analyste de données",
  "Analyste financier",
  "Animateur radio / TV",
  "Architecte",
  "Archiviste",
  "Assistant administratif",
  "Assistant commercial",
  "Assistant de direction",
  "Assistant Dentaire",
  "Assistant en ressources humaines",
  "Assistant juridique",
  "Assistant marketing",
  "Assistant médical",
  "Assistant social",
  "Attaché de presse",
  "Auditeur",
  "Auditeur externe",
  "Auditeur interne",
  "Auxiliaire de Puériculture",
  "Autre profession",
  "Auxiliaire de Santé (ou Aide-Soignant)",
  "Auxiliaire de Soins Obstétricaux",
  "Auxiliaire des Techniques Sanitaires (Option Hygiène et Assainissement)",
  "Auxiliaire des Techniques Sanitaires (Option Imagerie Médicale)",
  "Auxiliaire des Techniques Sanitaires (Option Laboratoire)",
  "Auxiliaire des Techniques Sanitaires (Option Pharmacie)",
  "Avocat",
  "Banquier",
  "Biologiste",
  "Boucher",
  "Boulanger / Boulangère",
  "Brocanteur",
  "Bureau d’études",
  "Cadre administratif",
  "Cadre commercial",
  "Cadre financier",
  "Cadre juridique",
  "Cadre marketing",
  "Cadre médical",
  "Cadre RH",
  "Cadre technique",
  "Cadreur",
  "Caissier bancaire",
  "Cariste",
  "Carrossier",
  "Charpentier",
  "Chauffagiste",
  "Chauffeur (taxi, bus, personnel)",
  "Chef de chantier",
  "Chef de cuisine",
  "Chef de produit",
  "Chef de projet",
  "Chef de projet informatique",
  "Chef de projet marketing",
  "Chef de projet technique",
  "Chef de rayon",
  "Chef de service",
  "Chef de service informatique",
  "Chercheur",
  "Chimiste",
  "Chirurgien",
  "Coiffeur / Coiffeuse",
  "Commerçant(e)",
  "Community manager",
  "Comptable",
  "Conducteur d’engins",
  "Conducteur de travaux",
  "Conseiller d’orientation",
  "Cordonnier / Cordonnière",
  "Coursier / Coursière",
  "Couturier / Couturière",
  "Créateur de contenu",
  "Critique de cinéma",
  "Cuisinier / Cuisinière",
  "Dentiste",
  "Designer",
  "Développeur de jeux vidéo",
  "Développeur de logiciels",
  "Développeur mobile",
  "Développeur web / logiciel",
  "Directeur artistique",
  "Directeur de la communication",
  "Directeur de la photographie",
  "Directeur de la production",
  "Directeur de la stratégie",
  "Directeur des opérations",
  "Directeur des ressources humaines",
  "Douanier",
  "Écrivain / Scénariste",
  "Électricien",
  "Éleveur",
  "Élève",
  "Enseignant du primaire / secondaire",
  "Environnementaliste",
  "Étudiant(e)",
  "Forgeron",
  "Forestier / Forestière",
  "Géomètre",
  "Gérant(e) de boutique",
  "Gérant(e) de maquis",
  "Graphiste",
  "Greffier",
  "Huissier",
  "Infirmier / Infirmière",
  "Influenceur /Influenceuse",
  "Ingénieur agronome",
  "Ingénieur civil",
  "Ingénieur en chimie",
  "Ingénieur en électronique",
  "Ingénieur en énergie",
  "Ingénieur en environnement",
  "Ingénieur en informatique",
  "Ingénieur en matériaux",
  "Ingénieur en mécanique",
  "Ingénieur en systèmes d’information",
  "Ingénieur en systèmes de contrôle",
  "Ingénieur en systèmes de développement durable",
  "Ingénieur en systèmes de gestion",
  "Ingénieur en systèmes de gestion de l’eau",
  "Ingénieur en systèmes de gestion des déchets",
  "Ingénieur en systèmes de gestion des infrastructures",
  "Ingénieur en systèmes de gestion des ressources naturelles",
  "Ingénieur en systèmes de gestion des risques",
  "Ingénieur en systèmes de gestion des systèmes d’information géographique",
  "Ingénieur en systèmes de gestion des transports",
  "Ingénieur en systèmes de logistique",
  "Ingénieur en systèmes de maintenance",
  "Ingénieur en systèmes de production",
  "Ingénieur en systèmes de qualité",
  "Ingénieur en systèmes de sécurité",
  "Ingénieur en systèmes de télécommunications",
  "Ingénieur en systèmes de transport intelligent",
  "Ingénieur en systèmes embarqués",
  "Ingénieur en systèmes énergétiques",
  "Ingénieur en systèmes mécaniques",
  "Ingénieur en systèmes photovoltaïques",
  "Ingénieur en systèmes robotiques",
  "Ingénieur en systèmes thermiques",
  "Ingénieur en télécommunications",
  "Inspecteur / inspectrice du travail",
  "Inspecteur / inspectrice pédagogique",
  "Journaliste",
  "Juge",
  "Juriste",
  "Kinésithérapeute",
  "Lavandier / Lavandière",
  "Logisticien / Logisticienne",
  "Maçon",
  "Magistrat / Magistrate",
  "Manutentionnaire",
  "Matrone (ou Accoucheuse traditionnelle)",
  "Mécanicien",
  "Médecin généraliste / Spécialiste",
  "Ménagère",
  "Menuisier / Menuisière",
  "Musicien / Musicienne",
  "Notaire",
  "Pêcheur / Pêcheuse",
  "Pharmacien / Pharmacienne",
  "Photographe / Vidéaste",
  "Plombier / Plombière",
  "Policier / Gendarme",
  "Préfet / Préfète",
  "Professeur d’université",
  "Rayonniste",
  "Retraité(e)",
  "Sage-femme / Maïeuticien",
  "Secrétaire administratif",
  "Serveur / Serveuse",
  "Soudeur / Soudeuse",
  "Spécialiste en cybersécurité",
  "Technicien(ne) agricole",
  "Technicien(ne) de laboratoire",
  "Technicien(ne) en aéronautique",
  "Technicien(ne) en agriculture",
  "Technicien(ne) en audiovisuel",
  "Technicien(ne) en bâtiment",
  "Technicien(ne) en biologie",
  "Technicien(ne) en chimie",
  "Technicien(ne) en chimie industrielle",
  "Technicien(ne) en construction",
  "Technicien(ne) en contrôle qualité",
  "Technicien(ne) en électronique",
  "Technicien(ne) en électronique industrielle",
  "Technicien(ne) en électroménager",
  "Technicien(ne) en énergie",
  "Technicien(ne) en énergie renouvelable",
  "Technicien(ne) en environnement",
  "Technicien(ne) en géologie",
  "Technicien(ne) en géomatique",
  "Technicien(ne) en hydraulique",
  "Technicien(ne) en hydraulique urbaine",
  "Technicien(ne) en informatique",
  "Technicien(ne) en informatique industrielle",
  "Technicien(ne) en instrumentation",
  "Technicien(ne) en maintenance informatique",
  "Technicien(ne) en maintenance industrielle",
  "Technicien(ne) en mécanique",
  "Technicien(ne) en mécanique automobile",
  "Technicien(ne) en mécanique industrielle",
  "Technicien(ne) en métallurgie",
  "Technicien(ne) en métrologie",
  "Technicien(ne) en microbiologie",
  "Technicien(ne) en optique",
  "Technicien(ne) en optique et photonique",
  "Technicien(ne) en pharmacie",
  "Technicien(ne) en pharmacie industrielle",
  "Technicien(ne) en plomberie",
  "Technicien(ne) en production audiovisuelle",
  "Technicien(ne) en qualité de l’air",
  "Technicien(ne) en qualité de l’eau",
  "Technicien(ne) en radiocommunication",
  "Technicien(ne) en radiologie",
  "Technicien(ne) en réseaux et télécommunications",
  "Technicien(ne) en réseaux informatiques",
  "Technicien(ne) en restauration",
  "Technicien(ne) en sécurité",
  "Technicien(ne) en sécurité des systèmes d’information",
  "Technicien(ne) en sécurité informatique",
  "Technicien(ne) en systèmes d’information",
  "Technicien(ne) en systèmes de contrôle",
  "Technicien(ne) en systèmes de transport intelligent",
  "Technicien(ne) en systèmes électroniques",
  "Technicien(ne) en systèmes énergétiques",
  "Technicien(ne) en systèmes informatiques",
  "Technicien(ne) en systèmes mécaniques",
  "Technicien(ne) en systèmes photovoltaïques",
  "Technicien(ne) en systèmes robotiques",
  "Technicien(ne) en systèmes thermiques",
  "Technicien(ne) en télécommunications",
  "Technicien(ne) en téléphonie",
  "Technicien(ne) en textile",
  "Technicien(ne) en transport",
  "Technicien(ne) en urbanisme",
  "Transitaires",
  "Vendeur / Vendeuse de détail",
  "Vendeur / Vendeuse ambulant",
];

// --- END MOCK DATA ---

export default function ProfessionModal({
  isOpen,
  onClose,
  onProfessionSelect,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProfessions = useMemo(
    () =>
      allProfessions.filter((profession) =>
        profession.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [searchTerm],
  );

  const handleSelect = (profession) => {
    onProfessionSelect(profession);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md transform rounded-2xl bg-white dark:bg-gray-800 shadow-2xl transition-all m-4 max-h-[70vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-primary-800 dark:text-white">
            Sélectionner une profession
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full cursor-pointer text-rose-500 hover:bg-rose-500 dark:hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <IoClose size={22} />
          </button>
        </div>

        <div className="p-4 border-b dark:border-gray-700">
          <div className="relative">
            <IoSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Rechercher une profession..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="overflow-y-auto">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            <AnimatePresence>
              {filteredProfessions.length > 0 ? (
                filteredProfessions.map((profession) => (
                  <motion.li
                    key={profession}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => handleSelect(profession)}
                    className="px-5 py-3 cursor-pointer text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors duration-150"
                  >
                    {profession}
                  </motion.li>
                ))
              ) : (
                <p className="p-5 text-center text-sm text-gray-500">
                  Aucune profession trouvée.
                </p>
              )}
            </AnimatePresence>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
