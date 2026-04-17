# TODO pour la prochaine session — chap. 6 Visuel

> Créé le 2026-04-17 en fin de session. 3 features demandées par Anthony à ajouter au spike / futur widget palette.

## 1. Assistant WCAG — trouver automatiquement les bonnes paires

**Problème** : c'est compliqué de trouver manuellement dans la matrice 12×12 quelle paire text/bg passe AA.

**Solution** :
- Bouton **"Suggérer les meilleures paires AA"** au-dessus de la matrice → affiche 3-5 paires recommandées (ex : text-900 sur bg-50, text-50 sur bg-900, etc.)
- Dans le mariage : si une paire échoue, bouton **"Corriger auto"** qui propose le shade le plus proche qui passe AA (ex : remplace text par text-900 au lieu de text-700)

**Complexité** : M (1-2 jours)

## 2. Save couleurs préférées (persistance multi-device)

**Problème** : quand l'user trouve une couleur qu'il aime, il ne peut pas la garder.

**Solution recommandée** : étendre la table Supabase existante `user_preferences` avec une colonne `saved_colors jsonb` (array de `{hex, name?, oklch}`).

- Bouton ⭐ à côté du color picker pour sauver la couleur actuelle
- Section "Mes couleurs" dans le bloc 1 qui affiche les couleurs sauvegardées avec clic pour recharger
- Supprimer une couleur sauvegardée

**Pourquoi Supabase et pas localStorage** : Mindeck devient SaaS public → user doit retrouver ses couleurs sur n'importe quel device.

**Complexité** : S (0.5-1 jour). Migration SQL mineure.

## 3. Combos personnels (user-generated)

**Problème** : l'user peut créer ses propres combos à partir des couleurs qu'il aime.

**Solution** : nouvelle table Supabase `custom_color_combos` :

```sql
create table custom_color_combos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  style text check (style in ('vintage', 'modern', 'natural', 'pastel', 'corporate', 'playful', 'tech', 'ancient', 'brand', 'custom')),
  colors text[] not null,
  note text,
  created_at timestamptz default now()
);
-- + RLS : user_id = auth.uid()
```

UI :
- Bouton **"Créer un combo"** dans bloc 2 → form (nom + couleurs piochées dans les sélections actuelles + style)
- Les combos custom apparaissent dans la même liste que les préfaits, avec un badge "Perso"
- Édition / suppression des combos custom

**Complexité** : M (2-3 jours). Migration SQL + UI CRUD + intégration dans le picker existant.

---

## Ordre suggéré pour la prochaine session

1. **Décider scope session** : implémenter les 3 features dans le spike, OU migrer le spike dans la structure définitive `src/app/project/[id]/design/visual/` d'abord ?
2. Si on reste dans le spike : commencer par #1 (Assistant WCAG, le plus simple), puis #2 (save colors), puis #3 (combos custom).
3. Si on migre d'abord : structure `design/visual/`, puis les 3 features dans la vraie structure.

**Recommandation** : migrer d'abord dans la vraie structure. Le spike a validé les concepts, maintenant il faut le mettre dans Mindeck proprement avec sauvegarde DB. Les 3 features seront codées directement dans la bonne archi.

---

## État actuel du spike (rappel)

Fichiers créés :
- `src/lib/design/oklch.ts` — palette generator + contrast WCAG
- `src/lib/design/combos.ts` — 20 combos curatés
- `src/app/design-spike/page.tsx` — page test avec 4 blocs

Dépendances ajoutées :
- `culori` (runtime) + `@types/culori` (dev)

4 blocs fonctionnels :
1. Éditeur de palette (color picker + 3 sliders tuning) + matrice 12×12 WCAG
2. Combos inspirationnels (20 combos par style)
3. Preview mariage (chips avec rôles + boutons ◀ ▶ + mockup live + rapport WCAG)
4. Palettes de référence (7 couleurs de test)
