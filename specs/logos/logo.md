# Logo Mindeck — Décisions finales

## Logo retenu

**Symbole** : cerveau circuit (5 nœuds reliés en réseau neuronal)
**Wordmark** : "Mindeck" en Inter 800, bicolore — "Mind" en couleur principale + "eck" en accent
**Shape** : rectangle à coins arrondis diagonaux ↖↘ (`border-radius: 28px 6px 28px 6px`)
**Favicon** : cerveau seul dans un squircle navy (`border-radius: 22px`)

## Couleurs par thème

| Élément | Mode clair | Mode sombre |
|---------|-----------|-------------|
| Fond shape | `#E8E0D8` (beige) | `#0c0c14` (navy) |
| Cerveau | `#7C6A4F` (moka) | `#C9956B` (caramel) |
| "Mind" | `#2a2520` (brun foncé) | `#ffffff` (blanc) |
| "eck" | `#7C6A4F` (moka) | `#C9956B` (caramel) |
| Favicon fond | — | `#1a1a28` (navy card) |
| Favicon nœuds | — | `#C9956B` (caramel) |

## Police

- **Inter 800** (Google Fonts)
- `letter-spacing: -0.05em`
- M majuscule, reste en minuscule

## Historique des itérations

Toutes les versions sont dans `specs/logos/` :

| Fichier | Contenu |
|---------|---------|
| `showcase-v1.html` | 20 logos noir — majorité lettermarks M |
| `showcase-v2.html` | 20 logos noir — cartes/deck abstraits |
| `showcase-v3.html` | 20 logos noir — fusion mind + deck |
| `showcase-v4.html` | 16 wordmarks typo + 16 combos M + wordmark |
| `showcase-v5.html` | 6 wordmarks Inter/Space Grotesk + 16 combos cerveau + wordmark |
| `showcase-v6.html` | Cerveau circuit × 2 polices × 4 fonds (blanc, navy, beige) |
| `showcase-v7.html` | Shapes (squircle, pill, diag, bordure) + favicons + test tailles |
| `showcase-v8.html` | Comparaison finale Shape 2 vs Shape 3 + favicon validé |
| `brainstorm.md` | Brainstorm initial (concepts, métaphores, plan des 20 logos v1) |

## Réflexion clé

- **"mindeck"** = mind (penser à un projet) + deck (liste de projets)
- Séparer "mind" / "deck" visuellement crée un double "d" (mind**d**eck) → on coupe après le d partagé : "Mind" + "eck"
- Le cerveau circuit (nœuds reliés) représente la réflexion/brainstorming
- La shape diag ↖↘ suit le flux de lecture naturel (gauche→droite, haut→bas)
- Le favicon fonctionne bien en petit grâce aux nœuds épais (testé à 32px)

## SVG du cerveau (réutilisable)

```svg
<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="30" cy="30" r="10" fill="currentColor"/>
  <circle cx="70" cy="30" r="10" fill="currentColor"/>
  <circle cx="50" cy="55" r="10" fill="currentColor"/>
  <circle cx="25" cy="75" r="10" fill="currentColor"/>
  <circle cx="75" cy="75" r="10" fill="currentColor"/>
  <line x1="30" y1="30" x2="50" y2="55" stroke="currentColor" stroke-width="5"/>
  <line x1="70" y1="30" x2="50" y2="55" stroke="currentColor" stroke-width="5"/>
  <line x1="30" y1="30" x2="70" y2="30" stroke="currentColor" stroke-width="5"/>
  <line x1="25" y1="75" x2="50" y2="55" stroke="currentColor" stroke-width="5"/>
  <line x1="75" y1="75" x2="50" y2="55" stroke="currentColor" stroke-width="5"/>
</svg>
```

## SVG du favicon (squircle navy)

```svg
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" width="92" height="92" rx="22" fill="#1a1a28"/>
  <circle cx="36" cy="36" r="9" fill="#C9956B"/>
  <circle cx="64" cy="36" r="9" fill="#C9956B"/>
  <circle cx="50" cy="54" r="9" fill="#C9956B"/>
  <circle cx="30" cy="70" r="9" fill="#C9956B"/>
  <circle cx="70" cy="70" r="9" fill="#C9956B"/>
  <line x1="36" y1="36" x2="50" y2="54" stroke="#C9956B" stroke-width="5"/>
  <line x1="64" y1="36" x2="50" y2="54" stroke="#C9956B" stroke-width="5"/>
  <line x1="36" y1="36" x2="64" y2="36" stroke="#C9956B" stroke-width="5"/>
  <line x1="30" y1="70" x2="50" y2="54" stroke="#C9956B" stroke-width="5"/>
  <line x1="70" y1="70" x2="50" y2="54" stroke="#C9956B" stroke-width="5"/>
</svg>
```
