# Améliorations Welcome.jsx

## 🔴 Bugs

### 1. `telephonemobile` non protégé — ligne 377
`clinicData.telephonemobile.replace(...)` plantera si le champ est `null`.
Même correction que `telephonemobile2` (déjà fixé) : conditionner le lien.

```jsx
// Avant
href={`https://wa.me/${clinicData.telephonemobile.replace(/\s+/g, "")}`}

// Après
{clinicData.telephonemobile && (
  <a href={`https://wa.me/${clinicData.telephonemobile.replace(/\s+/g, "")}`} ...>
```

### 2. `Reveal` + `useReveal` définis localement — lignes 24–64
L'extraction vers `src/components/ui/Reveal.jsx` a été annulée par le git pull.
Supprimer les définitions locales et importer le composant partagé.

```jsx
// Supprimer les lignes 24–64
// Ajouter :
import Reveal from "../components/ui/Reveal";
```

---

## 🟠 Couleurs incohérentes (thème rose)

### 3. Icônes Contact en `cyan-400` — lignes 325, 335, 349
```jsx
// Avant
<MapPinIcon className="w-8 h-8 text-cyan-400 mt-1" />

// Après
<MapPinIcon className="w-8 h-8 text-primary-400 mt-1" />
```

### 4. Liens hover en `cyan-400` — lignes 340, 360
```jsx
// Avant
className="text-gray-300 hover:text-cyan-400 transition-colors"

// Après
className="text-gray-300 hover:text-primary-400 transition-colors"
```

### 5. Hover social links en `cyan-500/20` — lignes 380, 390, 400
```jsx
// Avant
className="... hover:bg-cyan-500/20 ..."

// Après
className="... hover:bg-primary-500/20 ..."
```

---

## 🟡 Qualité de code

### 6. Double overlay sur le hero — lignes 127–129
Deux divs noires empilées = 75% d'opacité totale, trop sombre.
```jsx
// Supprimer une des deux :
<div className="absolute inset-0 bg-black/40" />   // ← garder
<div className="absolute inset-0 bg-black/35" />   // ← supprimer
```

### 7. Objet `data` inutile — lignes 86–92
`data.name` n'est jamais utilisé dans le JSX.
```jsx
// Avant
const data = {
  address: clinicData?.address || "Bouaké, Côte d'Ivoire",
  name: clinicData?.name || "Cabinet Dentaire Ivoire",
};
const addressParts = data.address.split(" - ");

// Après
const address = clinicData?.address || "Bouaké, Côte d'Ivoire";
const addressParts = address.split(" - ");
```

### 8. `<style>` inline dans le JSX — lignes 102–114
`scrollBob` et `shimmer` devraient vivre dans `index.css` avec les autres keyframes,
pas dans un tag `<style>` embarqué dans le rendu.

---

## 🔵 UX

### 9. Pas d'état de chargement
La section Contact reste invisible pendant le fetch API sans aucun indicateur visuel.
Ajouter un skeleton ou un spinner pendant que `clinicData === null`.

### 10. Pas de gestion d'erreur API
```jsx
// Avant
clinicPublic().then((res) => { ... });

// Après
clinicPublic()
  .then((res) => { ... })
  .catch(() => { /* afficher un message d'erreur */ });
```
