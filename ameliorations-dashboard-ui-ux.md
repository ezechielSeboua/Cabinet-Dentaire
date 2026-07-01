# Améliorations UI/UX — Dashboard

Audit du design et de l'expérience utilisateur sur la zone admin (dashboard). La gestion du thème clair/sombre est **volontairement exclue** de ce fichier car elle sera retirée du projet — ne pas créer de nouvelles classes `dark:` en corrigeant les points ci-dessous.

Constat général : il existe un clivage net entre une **génération récente de pages** soignée (`TreatmentList.jsx`, `AppointmentList.jsx`, `OpeningHoursPage.jsx`) et une **génération plus ancienne** (`PatientList.jsx`, `PaymentList.jsx`, `InsuranceList.jsx`, `GetPatientForUser.jsx`, `MessageList.jsx`) qui n'a aucun de ces standards. Ces pages anciennes sont prioritaires.

---

## 🎨 Couleurs hors-charte (à remplacer par `primary-*`)

### 1. `PaymentList.jsx` — badges d'assurance incohérents — lignes 199, 204
Le badge `insurance` est en cyan, le badge `insurance2` en texte violet sur fond rose (`primary-100`) — clairement un copier-coller raté, illisible visuellement.
```jsx
// Avant
<span className="px-2 py-1 text-xs font-medium text-cyan-800 bg-cyan-100 rounded-full">
  {row.insurance}
</span>
...
<span className="px-2 py-1 text-xs font-medium text-purple-800 bg-primary-100 rounded-full">
  {row.insurance2}
</span>

// Après — un seul style cohérent pour les deux badges
<span className="px-2 py-1 text-xs font-medium text-primary-800 bg-primary-100 rounded-full">
  {row.insurance}
</span>
...
<span className="px-2 py-1 text-xs font-medium text-primary-800 bg-primary-100 rounded-full">
  {row.insurance2}
</span>
```

### 2. `PaymentList.jsx` — survol de ligne en hex brut bleu — lignes 295-298
```jsx
// Avant
highlightOnHoverStyle: {
  backgroundColor: "#EFF6FF",
  color: "#2563EB",
},

// Après (à aligner sur la valeur --color-primary-50/700 de src/index.css)
highlightOnHoverStyle: {
  backgroundColor: "#fdf2f8", // primary-50
  color: "#be185d",           // primary-700
},
```

### 3. `ClinicDetails.jsx` — liens réseaux sociaux en teal/bleu/sky — lignes 160, 239-281
Les liens (Facebook, WhatsApp, Telegram, etc.) utilisent des couleurs teal/blue/sky différentes de la charte. À uniformiser en `primary-*`, sauf si une couleur de marque tierce (ex. WhatsApp vert, Facebook bleu) est volontairement conservée comme repère visuel — à trancher au cas par cas plutôt qu'à tout passer en rose automatiquement.

### 4. `OpeningHoursPage.jsx` — couleur d'action en teal
Utilise `bg-teal-700`/`teal-600` comme couleur d'action principale, alors que c'est `ClinicDetails.jsx` (même module "Infos cabinet") qui devrait définir la référence — actuellement les deux pages divergent l'une de l'autre. Aligner les deux sur `primary-600`/`primary-700`.

### 5. `TreatmentList.jsx` (lignes 619, 670) / `PatientTreatmentHistory.jsx` (ligne 337) — icône "Historique" en indigo
```jsx
// Avant
className="... text-indigo-600 ..."

// Après
className="... text-primary-600 ..."
```

### 6. `GetPatientForUser.jsx` — bouton et en-tête de tableau en noir — lignes 62, 72
```jsx
// Avant
backgroundColor: "black", // en-tête de tableau
className="... bg-black ..." // bouton "Ajouter patients"

// Après
backgroundColor: "#db2777", // primary-600, cohérent avec PublicInsurances.jsx
className="... bg-primary-600 hover:bg-primary-700 ..."
```

---

## ⏳ États de chargement manquants

Pages qui fetch des données en `useEffect` mais affichent un écran vide pendant le chargement, au lieu d'un spinner :
- `src/pages/expenses/ExpensesList.jsx`
- `src/pages/expenses/ExpenseTypeList.jsx`
- `src/pages/patients/MessageList.jsx`
- `src/pages/payments/PaymentList.jsx`
- `src/pages/payments/UnpaidBillList.jsx`
- `src/pages/users/UsersList.jsx`

**Référence à suivre** : le pattern déjà en place dans `PatientList.jsx` / `AppointmentList.jsx` / `TreatmentList.jsx` (état `loading`, spinner `animate-spin` affiché en overlay ou dans la zone de contenu pendant le fetch).

---

## 📭 États "aucune donnée" manquants

Tableaux vides sans message explicatif :
- `src/pages/expenses/ExpensesList.jsx`
- `src/pages/expenses/ExpenseTypeList.jsx`
- `src/pages/patients/MessageList.jsx`
- `src/pages/payments/UnpaidBillList.jsx`

**Référence à suivre** : message "Aucune donnée" déjà présent dans `PatientList.jsx` / `AppointmentList.jsx` / `TreatmentList.jsx` / `InterventionList.jsx` / `UsersList.jsx`.

---

## ⚠️ Erreurs API silencieuses

Aucun retour visuel (toast/message) en cas d'échec d'appel API :
- `src/pages/patients/MessageList.jsx`
- `src/pages/payments/UnpaidBillList.jsx`
- `src/pages/users/GetPatientForUser.jsx` — cumule en plus l'absence totale de chargement et d'état vide (composant à moderniser entièrement, cf. section couleurs et responsive ci-dessus/dessous)

**Référence à suivre** : `.catch(() => toast.error("..."))` déjà utilisé ailleurs dans le projet (ex. `PublicBlog.jsx`, `AddToWaitingListModal.jsx`).

---

## 🔘 Boutons / badges non uniformisés

### 7. `InsuranceList.jsx` — boutons d'action sans `title` — lignes 141, 148, 197
Les boutons d'action en icône (modifier/supprimer) n'ont pas d'attribut `title`, contrairement aux mêmes boutons dans `TreatmentList.jsx`/`PaymentList.jsx`/`UsersList.jsx` qui en ont systématiquement un. Impact : pas de tooltip, accessibilité réduite.
```jsx
// Avant
<button onClick={() => handleEdit(row.id)}>
  <CiEdit ... />
</button>

// Après
<button onClick={() => handleEdit(row.id)} title="Modifier">
  <CiEdit ... />
</button>
```

### 8. Pastilles de statut — trois conventions différentes
`WaitingList.jsx` (ligne 144) utilise `rounded-full border px-2 py-0.5`, `TreatmentList.jsx` (lignes 500/560) utilise `rounded-full px-2 py-1` sans bordure, `PaymentList.jsx` (ligne 199, cf. point 1) reprend le padding de TreatmentList mais avec des couleurs différentes. À unifier sur un seul composant `Badge`/convention de classes partagée plutôt que de dupliquer le style à chaque page.

---

## 📱 Responsive

### 9. `InsuranceDetails.jsx` — largeur figée en dessous du breakpoint `md` — ligne 56
```jsx
// Avant — en dessous de md, la largeur reste forcée à 1200px → débordement horizontal mobile/tablette
<div className="mx-auto bg-white rounded-sm overflow-hidden w-[1200px] md:max-w-7xl mt-10">

// Après
<div className="mx-auto bg-white rounded-sm overflow-hidden w-full max-w-7xl mt-10">
```

### 10. `GetPatientForUser.jsx` — largeurs fixes et `float` — lignes 72, 96
```jsx
// Avant
className="... float-right w-[180px] h-[34px]"   // bouton
className="w-[70%] h-[35px] float-left ..."        // champ de recherche

// Après — pattern flex + breakpoints utilisé partout ailleurs (ex. PatientList.jsx)
className="... w-full sm:w-auto"
className="w-full sm:max-w-md"
// + envelopper les deux dans un conteneur flex-col sm:flex-row justify-between gap-4
```

### 11. `PaymentList.jsx`, `UsersList.jsx`, `ExpensesList.jsx` — faible couverture responsive
Très peu de classes `sm:`/`md:`/`lg:` comparé à `InsuranceList.jsx` ou `PatientList.jsx`. À revoir lors du passage sur chacune de ces pages (priorité secondaire, à traiter en même temps que les autres corrections de la même page plutôt qu'en passe séparée).

---

## Ordre de priorité suggéré

1. **`PaymentList.jsx`** — cumule couleurs incohérentes (badges + hover) + absence de chargement/vide + faible responsive → page la plus impactée, à traiter en premier.
2. **`GetPatientForUser.jsx`** — composant le plus daté (noir, floats, largeurs fixes, aucun état de chargement/erreur/vide) → refonte complète plutôt que correction ligne à ligne.
3. **`InsuranceList.jsx`** — `title` manquants + à vérifier en même temps que ses badges/couleurs.
4. **`ExpensesList.jsx` / `ExpenseTypeList.jsx` / `MessageList.jsx` / `UnpaidBillList.jsx`** — même lot d'ajouts (chargement, vide, erreur) à appliquer ensemble, probablement avec un pattern commun réutilisable.
5. **`ClinicDetails.jsx` / `OpeningHoursPage.jsx`** — alignement des couleurs entre les deux pages du même module.
6. **`TreatmentList.jsx` / `PatientTreatmentHistory.jsx` / `WaitingList.jsx`** — corrections ponctuelles (couleur indigo, badges) à faible risque.
