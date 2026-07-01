# Audit — Page vitrine `http://localhost:3000/`

> Réalisé le 2026-07-01 — Dev frontend senior / Designer UI-UX

---

## 1. Assets disponibles dans `src/assets/`

| Fichier | Contenu | Utilisable ? | Où |
|---|---|---|---|
| `cabinet_dentaire.png` | Illustration flat design — dentiste avec patient ✅ qualité pro | **Oui** | Section "À propos / Nos soins" |
| `fauteuil_dentaire.png` | Illustration flat design — dentiste consultant ✅ qualité pro | **Oui** | Section réservation / "Comment ça marche" |
| `hero_bg.jpg` | Photo réaliste d'un examen dentaire propre | **Oui** | Remplacement du fond hero actuel |
| `equipe.jpeg` | Photo réelle du cabinet (mauvais angle, désordonnée) | **Avec précaution** | Section "Nos installations" uniquement en petit |
| `dent.png` | Illustration cartoon/fantasy — style incohérent avec les autres | **Non** | Style incompatible |
| `dental-clinic-renovation.jpeg` | Photo de chantier/rénovation — actuellement fond du hero 🔴 | **Non** | À remplacer |
| `Dental_Appointment*.jpg` | Stock photo calendrier+dent — retirée du code ✅ | **Non** | Déjà supprimée |
| `cabinetdentaireivoire.png` | QR Code du cabinet | **Non** | Réservé aux impressions/factures |
| `logo1.jpg` | Logo scanné basse résolution | **Non** | Remplacé par logo dynamique API |

---

## 2. Améliorations pour `http://localhost:3000/`

### 🔴 Critiques — Manquant / Structurel

#### 1. Section "À propos / Nos soins" absente
La page passe directement **Hero → Réservation** sans aucune présentation du cabinet.
- C'est normalement la 2e section de tout site de clinique médicale.
- C'est là que se joue la **confiance du patient** avant qu'il prenne rendez-vous.
- **Suggestion** : Intégrer `cabinet_dentaire.png` à gauche, texte de présentation à droite (nom du cabinet, philosophie, zone géographique).

#### 2. Aucune mention des soins proposés
Nulle part sur le site on ne sait ce que pratique le cabinet :
détartrage, soins de caries, blanchiment, implants, orthodontie, urgences ?
- Un patient ne prend pas rendez-vous si il ne sait pas si le cabinet pratique le soin dont il a besoin.
- **Suggestion** : Ajouter une section "Nos prestations" avec 4–6 icônes/cartes de soins.

#### 3. Aucune photo ni bio du praticien
"Dr Michael KOUAME" est mentionné dans le sous-titre du hero mais :
- Pas de photo
- Pas de spécialité
- Pas d'années d'expérience
- La confiance dans un cabinet dentaire passe en priorité par le visage et les qualifications du dentiste.
- **Suggestion** : Section "Votre dentiste" avec photo + diplômes + spécialités.

---

### 🟠 Design

#### 4. Fond hero = photo de chantier
`dental-clinic-renovation.jpeg` est une photo prise **pendant les travaux de rénovation** du cabinet.
- Un patient qui arrive sur le site voit une salle vide/en construction → contre-productif.
- **Suggestion** : Remplacer par `hero_bg.jpg` (photo professionnelle d'examen dentaire) ou l'image de fond dynamique configurée depuis le dashboard clinique.

#### 5. Ticker assurances — label illisible
Le badge "ASSURANCES ACCEPTÉES" dans le ticker est rose foncé sur fond rose.
- Contraste insuffisant, texte quasi illisible.
- **Suggestion** : Texte blanc sur fond primary-700, ou retirer le badge et utiliser uniquement la bande de défilement.

#### 6. Section réservation — fond rose uni trop plat
Le `bg-primary-50` uniforme sur toute la hauteur de la section manque de profondeur.
- **Suggestion** : Ajouter `fauteuil_dentaire.png` ou `cabinet_dentaire.png` en illustration décorative semi-transparente en arrière-plan ou en élément latéral pour donner du corps à la section sans surcharger le formulaire.

#### 7. Footer minimal
Seule ligne : `© 2026 Cabinet Dentaire Smile. Tous droits réservés.`
- Manque :
  - Liens de navigation rapide
  - Politique de confidentialité (obligatoire si patients collectent des données)
  - Réseaux sociaux (Facebook, WhatsApp, Telegram — déjà configurés dans le dashboard)
  - Adresse / téléphone en pied de page

---

### 🟡 UX / Parcours utilisateur

#### 8. Aucun bouton "Appeler maintenant" accessible
Le numéro de téléphone n'apparaît qu'en bas dans la section Contact.
- Sur mobile, un patient pressé qui veut appeler n'a aucun raccourci visible.
- **Suggestion** : Ajouter un bouton `tel:` dans la navbar mobile (icône téléphone) ou dans le hero sous les CTAs.

#### 9. Menu mobile sans lien "Accueil"
Le menu slide-in propose : Assurances, Prendre un rendez-vous, Nos contacts, Conseils Buco-dentaires.
- Si l'utilisateur est en bas de page et veut revenir en haut, il n'a que le bouton ↑ (scroll-to-top).
- **Suggestion** : Ajouter "Accueil" en premier lien du menu mobile, avec scroll vers le hero.

#### 10. Enquête de satisfaction toujours trop haute dans le parcours
Elle est après Assurances mais avant Contact & Horaires.
- Un patient remplit un avis **après** avoir trouvé et contacté le cabinet, pas au milieu de sa découverte.
- **Suggestion** : Déplacer l'enquête en **dernière section**, après Contact & Horaires et avant le footer.

#### 11. Pas de lien "Consulter le site" depuis la navbar scrollée
Une fois scrollé vers le bas, la navbar compacte ne propose que les liens de section.
- Si un visiteur veut naviguer vers le site depuis un lien externe deep-link, il n'y a pas de "retour à l'accueil" visible.

---

## 3. Ordre des sections recommandé

| # | Section actuelle | Section recommandée |
|---|---|---|
| 1 | Hero | Hero (fond photo pro) |
| 2 | Réservation | **À propos / Le praticien** ← nouvelle |
| 3 | Assurances | **Nos soins / Prestations** ← nouvelle |
| 4 | Conseils bucco-dentaires | Réservation en ligne |
| 5 | Enquête de satisfaction | Assurances acceptées |
| 6 | Contact & Horaires | Conseils bucco-dentaires |
| — | — | Contact & Horaires |
| — | — | Enquête de satisfaction ← dernière |
| — | — | Footer enrichi |

---

## 4. Priorités de mise en œuvre

| Priorité | Action | Impact |
|---|---|---|
| 🔴 P1 | Remplacer fond hero par `hero_bg.jpg` | Confiance immédiate |
| 🔴 P1 | Créer section "Le praticien" avec photo | Confiance, conversion |
| 🔴 P1 | Créer section "Nos soins" | Information critique manquante |
| 🟠 P2 | Intégrer `cabinet_dentaire.png` dans À propos | Cohérence visuelle |
| 🟠 P2 | Enrichir le footer | Professionnel, SEO |
| 🟠 P2 | Bouton "Appeler" accessible en mobile | UX mobile |
| 🟡 P3 | Rééquilibrer ordre des sections | Parcours patient |
| 🟡 P3 | Fixer le contraste du ticker assurances | Lisibilité |
| 🟡 P3 | Ajouter "Accueil" dans le menu mobile | Navigation |
