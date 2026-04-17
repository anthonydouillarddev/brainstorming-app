# Veille concurrentielle — Assistance design produit

> Livrable brut de l'Agent Veille Concurrentielle (general-purpose).
> Mission : identifier ce qui existe déjà (v0, Lovable, Figma AI, Tokens Studio, Radix, Stark, Mobbin, Refactoring UI, etc.), ce qui marche, ce qui foire, et les gaps que Mindeck peut exploiter.

---

## 1. Synthèse exécutive

**Paysage actuel.** Le marché de l'"assistance design" en 2024-2026 compte plus de 80 outils actifs, mais il est profondément **fragmenté par couche** : génération UI (v0, Lovable, Bolt, Framer AI), design tokens (Tokens Studio, Supernova, Specify), palettes (Coolors, Radix, Huemint), typo (Fontjoy, Typescale), wireframing (Figma, Whimsical, Excalidraw), inspiration (Mobbin, Dribbble, Land-book), pédagogie (Refactoring UI, IxDF). **Aucun outil ne couvre "de A à Z"** la réflexion design produit — c'est-à-dire : stratégie → branding → tokens → composants → a11y → pédagogie. Tous sont excellents sur 1-2 couches et absents sur les autres.

**Le gap principal que Mindeck peut combler.** Il n'existe pas d'**assistant de réflexion design structurée couplé à la stratégie produit**, avec une progressivité pédagogique (débutant → expert). Les outils actuels partent du principe que l'utilisateur sait déjà ce qu'il veut. Aucun ne demande "quelle est ta North Star ? ta cible ? ton positionnement ?" **avant** de générer une palette ou un logo. Le fossé entre "brainstorm produit" (Notion, Mindeck lui-même) et "exécution design" (Figma, v0) est béant.

**3 insights majeurs.**
1. **Les outils AI-first génèrent trop vite, sans cadrage.** v0 et Lovable produisent du code beau mais incohérent sur la marque — ils traitent le design comme un style, pas comme un système.
2. **Les outils "pros" (Tokens Studio, Supernova) sont incompréhensibles pour un débutant.** Courbe d'apprentissage verticale, jargon (W3C DTCG, semantic aliases), aucune pédagogie.
3. **La pédagogie design est cloisonnée.** Refactoring UI est un livre, IxDF est un cours payant, Google UX est une certification. Personne n'a intégré ces enseignements **dans l'outil lui-même**, au moment de la décision.

---

## 2. Analyse par outil

### 2.1 Outils de génération UI / AI

### v0.dev (Vercel)
- **Catégorie** : génération UI via prompts (React + Tailwind + shadcn)
- **Positionnement** : "Prompt to UI" pour devs Next.js, focus shadcn/Tailwind
- **Ce qu'il fait bien** :
  - Génère du code React production-ready, directement utilisable
  - Itérations conversationnelles rapides, preview live
  - Intégration native avec l'écosystème Vercel (déploiement 1-clic depuis 2024)
- **Ce qu'il rate** :
  - Pas de vision système : chaque génération est isolée, pas de cohérence marque entre composants
  - Zéro pédagogie : ne t'explique jamais pourquoi un choix est bon ou mauvais
  - Tokens/palette/typo non gérés — tu récupères du Tailwind brut avec des couleurs codées en dur
- **UX progressive ?** : Non. Mono-mode "expert dev qui sait prompter".
- **Générateurs intelligents ? garde-fous ?** : Oui générateurs, **non garde-fous** (pas de check a11y, pas de warning contraste)
- **Pédagogie intégrée ?** : Non
- **Ce que Mindeck peut s'en inspirer** : le flow conversationnel itératif, la preview live multi-device
- **Ce que Mindeck DOIT éviter** : traiter le design comme un prompt-to-output sans système de pensée

### Lovable (ex-GPT Engineer)
- **Catégorie** : génération fullstack (UI + backend) via prompts
- **Positionnement** : "Build apps with AI" — concurrent direct de v0 mais full-app
- **Ce qu'il fait bien** :
  - Génère une app complète (DB + UI + auth) en minutes
  - Intégration Supabase native — parle le langage de Mindeck
  - UI par défaut propre (shadcn-like)
- **Ce qu'il rate** :
  - Qualité design moyenne dès que tu sors du template par défaut
  - Pas de design system, tout est régénéré à chaque itération
  - Coût rapide (crédits qui brûlent vite sur les grosses apps)
- **UX progressive ?** : Partielle (débutant-friendly à l'entrée, mais pas de "mode expert")
- **Générateurs intelligents ? garde-fous ?** : Générateurs oui, garde-fous non
- **Pédagogie intégrée ?** : Non
- **Ce que Mindeck peut s'en inspirer** : onboarding conversationnel très bon, langage non-technique
- **Ce que Mindeck DOIT éviter** : la promesse "tu n'as rien à comprendre" qui produit du code illisible

### Bolt.new (StackBlitz)
- **Catégorie** : génération fullstack in-browser
- **Positionnement** : WebContainers + AI — éditer/déployer dans le navigateur
- **Ce qu'il fait bien** :
  - Environnement complet dans le navigateur (pas d'install)
  - Framework-agnostique (Astro, Remix, Next, Svelte, etc.)
  - Itération très rapide avec preview native
- **Ce qu'il rate** :
  - Identique à Lovable côté design : pas de système, output générique
  - Instable sur les longues conversations
  - Rien pour la stratégie produit amont
- **UX progressive ?** : Non
- **Générateurs intelligents ? garde-fous ?** : Non
- **Pédagogie intégrée ?** : Non
- **Inspiration Mindeck** : l'approche "in-browser zero-friction" pour les tests rapides
- **À éviter** : le syndrome "ça marche 5 min puis tout pète" — bien verrouiller la cohérence avant de générer

### Galileo AI (racheté par Google en 2024)
- **Catégorie** : génération UI mobile (rachat Google, intégré à Stitch depuis 2024)
- **Positionnement** : "Text-to-UI" haute fidélité
- **Ce qu'il fait bien** :
  - Outputs Figma de qualité visuelle bluffante
  - Focus mobile, ce que peu d'outils font
- **Ce qu'il rate** :
  - Racheté → roadmap floue, intégré à Google Stitch (statut expérimental)
  - Pas de design system persistant
  - Pédagogie zéro
- **UX progressive ?** : Non
- **Générateurs intelligents ? garde-fous ?** : Générateurs oui, garde-fous non
- **Pédagogie** : Non
- **Inspiration Mindeck** : la qualité esthétique par défaut, les "presets de style" contextuels
- **À éviter** : dépendre d'une IA tierce qui peut disparaître du jour au lendemain

### UXPilot
- **Catégorie** : copilot UX dans Figma
- **Positionnement** : "Your AI UX co-pilot" — génération wireframes + UI + design system
- **Ce qu'il fait bien** :
  - Plugin Figma natif, pas un outil à part
  - Génère wireframes → high-fidelity progressivement
  - Offre des "styles" appliqués cohéremment
- **Ce qu'il rate** :
  - Coincé dans Figma (tu n'en sors pas avec un vrai design system exportable)
  - Pédagogie anecdotique
  - Pas de lien avec la stratégie produit
- **UX progressive ?** : Partielle (low-fi → high-fi)
- **Garde-fous ?** : Limités (cohérence de style oui, a11y non)
- **Pédagogie** : Marginale
- **Inspiration Mindeck** : **la progression low-fi → high-fi comme métaphore pédagogique** — excellente idée à reprendre
- **À éviter** : la dépendance à Figma comme canvas unique

### Uizard (racheté par Miro en 2024)
- **Catégorie** : wireframes AI (sketch → wireframe)
- **Positionnement** : "Design without design skills" — explicitement pour débutants
- **Ce qu'il fait bien** :
  - Mode "Autodesigner" qui génère une app complète depuis un prompt
  - Conversion sketch → wireframe (photo dessin papier → maquette)
  - Cible clairement les non-designers
- **Ce qu'il rate** :
  - Résultats visuellement datés (pas au niveau de v0/Lovable)
  - Post-rachat Miro, positionnement flou
  - Pas de vrai design system exportable
- **UX progressive ?** : **Oui**, l'un des rares — mais pas structuré en modes explicites
- **Garde-fous ?** : Limités
- **Pédagogie** : Marginale
- **Inspiration Mindeck** : **le positionnement "sans skills design" assumé** — ton et vocabulaire très accessibles
- **À éviter** : l'esthétique "cheap" qui fait que personne n'utilise les outputs en prod

### Figma Make / AI (Figma 2024-2025)
- **Catégorie** : fonctions AI dans Figma (First Draft, Make Designs)
- **Positionnement** : "AI inside Figma" — à partir d'un prompt, génère un premier draft dans le fichier
- **Ce qu'il fait bien** :
  - Réutilise le design system du fichier courant (énorme avantage)
  - Intégration native, zéro friction
  - Figma reste le standard de facto
- **Ce qu'il rate** :
  - Nécessite un fichier Figma bien structuré en amont pour être utile
  - Lancé précipitamment en 2024, retiré temporairement après controverse sur la ressemblance avec Apple Weather
  - Pas d'aide sur la stratégie
- **UX progressive ?** : Non (Figma reste un outil expert)
- **Garde-fous ?** : Oui si le design system est bien fait en amont
- **Pédagogie** : Non
- **Inspiration Mindeck** : le principe "le système contraint l'AI" — excellent pattern
- **À éviter** : l'outil pro qui terrorise le débutant dès l'ouverture

### Relume
- **Catégorie** : générateur wireframes/sitemaps pour sites web
- **Positionnement** : "AI site builder for web designers"
- **Ce qu'il fait bien** :
  - Génère sitemap → wireframes → composants Webflow/Figma/React
  - Bibliothèque de composants très complète
  - Focus marketing sites où il excelle
- **Ce qu'il rate** :
  - Uniquement sites marketing, pas d'app produit
  - Cher (25-40$/mois)
  - Pas de design system brand custom fort
- **UX progressive ?** : Non (outil pro)
- **Garde-fous ?** : Partiels
- **Pédagogie** : Non
- **Inspiration Mindeck** : **le flow "sitemap → wireframes → composants"** comme pipeline de pensée
- **À éviter** : le verrouillage dans un écosystème (Webflow)

### Framer AI
- **Catégorie** : génération de sites no-code + AI
- **Positionnement** : "Design and publish sites with AI"
- **Ce qu'il fait bien** :
  - Publication directe (domaine, SEO, responsive auto)
  - Qualité visuelle très haute par défaut
  - Preview multi-device live excellente
- **Ce qu'il rate** :
  - Closed ecosystem (pas d'export code propre)
  - Sites marketing seulement, pas d'apps
  - Coût qui monte vite
- **UX progressive ?** : Partielle
- **Garde-fous ?** : Oui (responsive, perfs)
- **Pédagogie** : Non
- **Inspiration Mindeck** : **la preview multi-device temps réel** (mobile/tablet/desktop), le "responsive par défaut"
- **À éviter** : le lock-in propriétaire

---

### 2.2 Outils de design system / tokens

### Tokens Studio (ex-Figma Tokens)
- **Catégorie** : plugin Figma de gestion de tokens (W3C DTCG compliant)
- **Positionnement** : "Design tokens done right" — pour équipes design system
- **Ce qu'il fait bien** :
  - Standard de facto pour tokens Figma ↔ code
  - Support complet W3C DTCG, aliases, themes, math
  - Intégration Style Dictionary, GitHub sync
- **Ce qu'il rate** :
  - **Courbe d'apprentissage brutale** (un débutant ne comprend rien au vocabulaire)
  - UI datée, plugin Figma donc pas exportable ailleurs
  - Zéro pédagogie — il faut déjà savoir ce qu'est un "semantic token"
- **UX progressive ?** : **Non** — mode expert only
- **Garde-fous ?** : Oui (validation refs, contrast checker)
- **Pédagogie** : Non
- **Inspiration Mindeck** : la rigueur du modèle (tokens primitifs → semantic → components)
- **À éviter** : le jargon qui exclut 90% des utilisateurs potentiels

### Supernova.io
- **Catégorie** : design system management platform
- **Positionnement** : "Design System Platform" — pour grosses équipes
- **Ce qu'il fait bien** :
  - Documentation design system auto-générée depuis Figma
  - Publication de sites docs (à la Storybook)
  - Plan gratuit correct
- **Ce qu'il rate** :
  - Complexité énorme — outil pour teams de 20+
  - Cher en payant (pricing enterprise opaque)
  - Overkill pour un solo founder
- **UX progressive ?** : Non
- **Garde-fous ?** : Oui
- **Pédagogie** : Marginale (templates doc)
- **Inspiration Mindeck** : **l'idée que la doc design system se génère automatiquement** depuis les tokens
- **À éviter** : complexité enterprise pour usage solo

### Zeroheight
- **Catégorie** : documentation design system
- **Positionnement** : "Design system documentation, simplified"
- **Ce qu'il fait bien** :
  - Intégrations Figma/Storybook/Abstract natives
  - Éditeur WYSIWYG accessible
  - Grande base d'utilisateurs (design systems publics de nombreuses boîtes)
- **Ce qu'il rate** :
  - Outil de doc pur, pas d'aide à la création
  - Cher à partir de 20 users (~200$/mois)
  - Nécessite déjà un design system existant
- **UX progressive ?** : Partielle
- **Garde-fous ?** : Non
- **Pédagogie** : Via les templates
- **Inspiration Mindeck** : **la notion de "vitrine du design system"** — un espace où tout est documenté + visible
- **À éviter** : l'outil passif qui n'aide pas à décider

### Specify
- **Catégorie** : design tokens manager multi-sources
- **Positionnement** : "Design tokens platform" — sync Figma ↔ code
- **Ce qu'il fait bien** :
  - Pipeline automatisé Figma → GitHub → npm
  - Multi-plateforme (iOS, Android, web)
  - Orienté dev ops design
- **Ce qu'il rate** :
  - Hyper-technique, zéro onboarding débutant
  - Pricing agressif (~50$/user/mois)
  - Pivotages fréquents du produit depuis 2023
- **UX progressive ?** : Non
- **Garde-fous ?** : Oui
- **Pédagogie** : Non
- **Inspiration Mindeck** : le principe "source de vérité unique pour les tokens"
- **À éviter** : l'outil qui s'adresse uniquement aux platform engineers

### Style Dictionary (Amazon OSS)
- **Catégorie** : CLI open-source de transformation de tokens
- **Positionnement** : "Style once, use everywhere"
- **Ce qu'il fait bien** :
  - Standard OSS, gratuit, éprouvé
  - Transforme un JSON de tokens en CSS/Swift/Android/etc.
  - Flexibilité totale
- **Ce qu'il rate** :
  - CLI seulement, zéro UI
  - Devs uniquement
  - Documentation austère
- **UX progressive ?** : Non
- **Garde-fous ?** : Non
- **Pédagogie** : Non
- **Inspiration Mindeck** : **la structure token primitif → transformé → exporté** comme modèle mental
- **À éviter** : l'outil sans UI que personne n'ouvre spontanément

---

### 2.3 Outils de brand / identité

### Looka
- **Catégorie** : générateur de logos AI
- **Positionnement** : "Logo maker & brand kit" pour petites entreprises
- **Ce qu'il fait bien** :
  - Onboarding très guidé (questions → logos)
  - Brand kit complet (logo + cartes + signatures)
  - Prix unique raisonnable (~20$ logo, 65$ brand kit)
- **Ce qu'il rate** :
  - Résultats génériques, reconnaissables au premier coup d'œil
  - Pas d'éducation sur la marque
  - Packs templates qu'on retrouve partout
- **UX progressive ?** : **Oui** (seulement "débutant")
- **Garde-fous ?** : Oui (cohérence du brand kit)
- **Pédagogie** : Très légère
- **Inspiration Mindeck** : **le flow de questions "ton business / ton style / tes couleurs"** avant génération
- **À éviter** : la standardisation qui fait que tous les logos se ressemblent

### Brandmark
- **Catégorie** : générateur de logos + branding
- **Positionnement** : "AI logo and branding"
- **Ce qu'il fait bien** :
  - Qualité visuelle supérieure à Looka
  - Mockups brand automatiques (cartes, stylés)
  - Export vectoriel propre
- **Ce qu'il rate** :
  - Positionnement flou entre amateur et pro
  - Peu de contrôle fin sur les résultats
  - Communauté petite
- **UX progressive ?** : Non
- **Garde-fous ?** : Oui
- **Pédagogie** : Marginale
- **Inspiration Mindeck** : **les mockups automatiques** qui font "voir" la marque en contexte
- **À éviter** : le manque de personnalisation fine

### LogoAI
- **Catégorie** : générateur de logos AI
- **Positionnement** : "AI-powered logo generator"
- **Ce qu'il fait bien** : itération rapide, prix bas
- **Ce qu'il rate** : qualité inférieure, résultats très génériques, aucune pédagogie
- **UX progressive ?** : Non
- **Garde-fous ?** : Non
- **Pédagogie** : Non
- **Inspiration Mindeck** : rien de particulier
- **À éviter** : la course au prix bas qui tue la qualité

### Khroma
- **Catégorie** : palette generator AI personnalisée
- **Positionnement** : "AI color tool for designers"
- **Ce qu'il fait bien** :
  - Apprend tes préférences via un onboarding de 50 couleurs
  - Génère des palettes personnalisées à vie
  - Très joli, gratuit
- **Ce qu'il rate** :
  - Uniquement palettes, zéro autre fonction
  - Pas d'export système, juste HEX
  - Pas de mode sombre/clair pensé
- **UX progressive ?** : Non
- **Garde-fous ?** : **Oui — contraste automatique affiché**
- **Pédagogie** : Non
- **Inspiration Mindeck** : **l'onboarding "apprends-moi ton goût" via choix de 50 images/couleurs** — pattern UX brillant
- **À éviter** : l'hyper-spécialisation qui force à combiner 10 outils

### Huemint
- **Catégorie** : générateur de palettes AI orienté marque
- **Positionnement** : "AI-generated color palettes for brands"
- **Ce qu'il fait bien** :
  - Génère palettes contextuelles (UI, illustration, packaging)
  - Mode "locked colors" pour itérer sur base existante
  - Previews mockups contextuels
- **Ce qu'il rate** :
  - Interface un peu austère
  - Pas de vrai système tokens exporté
  - Pédagogie zéro
- **UX progressive ?** : Partielle
- **Garde-fous ?** : Oui (contraste)
- **Pédagogie** : Non
- **Inspiration Mindeck** : **les previews "palette appliquée à une UI fictive"** — rendre l'abstrait concret
- **À éviter** : l'interface qui fait fuir le débutant

### Coolors
- **Catégorie** : palette generator classique
- **Positionnement** : "Super fast color palettes generator"
- **Ce qu'il fait bien** :
  - Standard historique, énorme communauté
  - Interface ultra-simple (spacebar = nouvelle palette)
  - Export multi-format
- **Ce qu'il rate** :
  - Pas d'AI contextuelle (même si récemment ajoutée)
  - Génération aléatoire sans guidance
  - Pas de système tokens complet
- **UX progressive ?** : Non
- **Garde-fous ?** : Partiels (contraste checker)
- **Pédagogie** : Via blog articles (externe)
- **Inspiration Mindeck** : **la simplicité "spacebar = je teste" — friction zéro**
- **À éviter** : la génération aléatoire sans intention

### Realtime Colors
- **Catégorie** : live preview de palette dans une UI réelle
- **Positionnement** : "Visualize your color palette"
- **Ce qu'il fait bien** :
  - Tu vois **immédiatement** ta palette sur une vraie page (texte, boutons, cards)
  - Système sémantique complet (bg, text, primary, secondary, accent)
  - Dark/light mode natif
  - Export CSS / Tailwind
- **Ce qu'il rate** :
  - Un seul template de preview
  - Pas de génération assistée (tu dois connaître tes couleurs)
- **UX progressive ?** : Partielle
- **Garde-fous ?** : Oui (contraste)
- **Pédagogie** : Légère
- **Inspiration Mindeck** : **LE pattern à reprendre** — "aperçu live dans une UI cible" + rôles sémantiques. Mindeck doit faire pareil mais en mieux (multi-templates, multi-devices).
- **À éviter** : le template unique qui ne ressemble pas forcément au produit visé

---

### 2.4 Outils de typo / couleur / a11y

### Typescale / Modularscale
- **Catégorie** : calculateurs d'échelle typographique
- **Positionnement** : "Generate a type scale"
- **Ce qu'ils font bien** : ratios mathématiques (1.25, 1.333, phi), preview visuel
- **Ce qu'ils ratent** : outils ultra-spécialisés, aucune pédagogie réelle sur le pourquoi
- **UX progressive ?** : Non
- **Garde-fous ?** : Non
- **Pédagogie** : Externe
- **Inspiration Mindeck** : **la génération d'une échelle à partir d'un ratio + base size** comme input unique
- **À éviter** : l'outil mono-fonction

### Fontpair / Fontjoy
- **Catégorie** : recommandation d'associations de polices
- **Positionnement** : "Font pairings made simple"
- **Ce qu'ils font bien** : Fontjoy génère via AI des paires (heading/body/accent), Fontpair catalogue curaté
- **Ce qu'ils ratent** : peu de contexte (quelle paire pour quelle industrie ?), zéro intégration système
- **UX progressive ?** : Non
- **Garde-fous ?** : Non
- **Pédagogie** : Via les exemples
- **Inspiration Mindeck** : **les "presets d'industrie" (SaaS B2B, Appli fun, Outil pro)**
- **À éviter** : le catalogue passif sans recommandation

### Radix Colors
- **Catégorie** : palette system open-source (Vercel/Modulz)
- **Positionnement** : "An open-source color system for designing beautiful, accessible websites and apps"
- **Ce qu'il fait bien** :
  - **12 shades par couleur avec rôles sémantiques précis** (App background, Component background, Hovered, Active, Border, Text low/high contrast, etc.)
  - Paires claire/sombre automatiques
  - A11y garanti mathématiquement
  - Open-source, gratuit
- **Ce qu'il rate** :
  - Palette fixe, personnalisation limitée (mais custom palettes depuis 2024)
  - Réservé aux devs qui comprennent les design tokens sémantiques
  - Pas d'interface grand public
- **UX progressive ?** : Non
- **Garde-fous ?** : **Oui, par construction** (contraste garanti)
- **Pédagogie** : **Excellente** via la doc — le site Radix est un cours de design tokens en soi
- **Inspiration Mindeck** : **LE modèle conceptuel à suivre** — 12 shades × rôles sémantiques × dark/light auto. C'est l'état de l'art 2024-2026.
- **À éviter** : le fait que l'interface reste "pour devs" uniquement

### Contrast Finder / WebAIM Contrast Checker
- **Catégorie** : vérif contraste a11y (WCAG AA/AAA)
- **Positionnement** : outils ponctuels a11y
- **Ce qu'ils font bien** : benchmark absolu WCAG, suggestions d'ajustement
- **Ce qu'ils ratent** : outils ponctuels, on les ouvre 1 fois puis on oublie
- **UX progressive ?** : Non
- **Garde-fous ?** : Oui, c'est leur raison d'être
- **Pédagogie** : Légère
- **Inspiration Mindeck** : **intégrer le check contraste EN TEMPS RÉEL** sans que l'utilisateur ait à ouvrir un outil tiers
- **À éviter** : l'outil externe qu'on oublie d'utiliser

### Stark
- **Catégorie** : suite a11y (plugin Figma + web)
- **Positionnement** : "Accessibility platform"
- **Ce qu'il fait bien** : contraste, simulation daltonisme, audit fichier Figma complet
- **Ce qu'il rate** : cher (~60$/mois pour le pro), pédagogie limitée
- **UX progressive ?** : Partielle
- **Garde-fous ?** : Oui
- **Pédagogie** : Marginale
- **Inspiration Mindeck** : **la simulation de vision (daltonisme, cataracte)** — rendre l'a11y tangible
- **À éviter** : le prix qui exclut les solos

---

### 2.5 Outils de wireframe / flows

### Whimsical
- **Catégorie** : wireframes + flowcharts + mindmaps
- **Positionnement** : "Faster, better thinking"
- **Ce qu'il fait bien** : vitesse de création, composants pré-faits, collaboration
- **Ce qu'il rate** : esthétique générique, pas d'export design system
- **UX progressive ?** : Partielle
- **Garde-fous ?** : Non
- **Pédagogie** : Non
- **Inspiration Mindeck** : la rapidité d'esquisse, l'absence de friction
- **À éviter** : l'outil "utilisé au début puis abandonné pour Figma"

### FigJam
- **Catégorie** : whiteboard collaboratif (Figma)
- **Positionnement** : "Online whiteboard for teams"
- **Ce qu'il fait bien** : intégration Figma, templates workshops, AI assist (FigJam AI 2024)
- **Ce qu'il rate** : outil workshop pur, pas un outil de décision
- **Inspiration Mindeck** : les templates d'ateliers (brainwriting, dot voting) comme flows guidés

### Miro
- **Catégorie** : whiteboard enterprise
- **Positionnement** : "The Visual Workspace for Innovation"
- **Ce qu'il fait bien** : templates à foison, intégrations massives, Miro AI (2024)
- **Ce qu'il rate** : complexe, cher, overkill pour solo
- **Inspiration Mindeck** : la bibliothèque de frameworks (Lean Canvas, User Journey, etc.)

### Excalidraw
- **Catégorie** : sketch whiteboard open-source
- **Positionnement** : "Virtual whiteboard for sketching hand-drawn like diagrams"
- **Ce qu'il fait bien** : esthétique "sketch", gratuit, libraries custom, offline-first
- **Ce qu'il rate** : sketchs seulement, pas de high-fidelity
- **Inspiration Mindeck** : **l'esthétique "hand-drawn" pour signaler "c'est un brouillon, pas un engagement"** — pattern psychologique fort

---

### 2.6 Inspirations (ressources)

### Mobbin
- **Catégorie** : bibliothèque de screens d'apps mobiles/web
- **Positionnement** : "The world's largest mobile design reference library"
- **Ce qu'il fait bien** : 300k+ screens taggés, flows complets, UI patterns, web depuis 2023
- **Ce qu'il rate** : passif (tu regardes, tu ne décides pas), cher (~30$/mois)
- **Pédagogie** : indirecte (apprendre par imitation)
- **Inspiration Mindeck** : **intégrer des "refs contextuelles" dans l'outil** (quand tu travailles sur onboarding → voir 5 onboardings top)
- **À éviter** : la consommation passive qui paralyse (analysis paralysis)

### Dribbble / Behance / SavedFor.design
- **Catégorie** : galeries d'inspiration
- **Ce qu'elles font bien** : volume massif, tendances visibles
- **Ce qu'elles ratent** : Dribbble = souvent du "concept art" pas utilisable, Behance noyé sous le bruit
- **Inspiration Mindeck** : **NE PAS reproduire l'approche galerie passive**. Plutôt "voici 3 refs qui matchent ton brief"

### Page Flows / Screenlane / UI Sources
- **Catégorie** : flows vidéo d'apps réelles
- **Ce qu'elles font bien** : montrent l'UX en mouvement, pas juste des screens statiques
- **Ce qu'elles ratent** : coût élevé, bibliothèque finie
- **Inspiration Mindeck** : **l'idée que le flow (GIF/vidéo) vaut 100 screenshots** — montrer l'interaction

### Land-book
- **Catégorie** : galerie de landing pages
- **Ce qu'il fait bien** : filtrage fin par industrie/style/composants
- **Inspiration Mindeck** : **le filtrage par contexte projet** ("je fais un SaaS B2B", "je fais une appli B2C")

---

### 2.7 Pédagogie design

### Refactoring UI (Wathan/Schoger, 2018, toujours référence en 2026)
- **Catégorie** : livre/cours sur le design pour devs
- **Positionnement** : "Learn Design for Developers"
- **Ce qu'il fait bien** :
  - Enseigne le design par **heuristiques pratiques** (pas de théorie abstraite)
  - Chapitres directement actionnables (hierarchy, spacing, color, typography, depth, images)
  - Référence universelle du "dev qui veut designer"
- **Ce qu'il rate** :
  - Format livre statique, pas interactif
  - 2018, certaines parties vieillissent
  - Pas d'AI ni d'assistant
- **Pédagogie** : **État de l'art absolu**
- **Inspiration Mindeck** : **reprendre les heuristiques de Refactoring UI et les transformer en tooltips / garde-fous / explications contextuelles IN-APP**. Exemple : "Attention, tu as 4 niveaux de gris. Refactoring UI recommande max 3." C'est le plus gros gisement de valeur pédagogique identifié.

### Google UX Design (Coursera)
- **Catégorie** : certificat UX
- **Ce qu'il fait bien** : parcours structuré, crédible, 7 cours
- **Ce qu'il rate** : théorique, long (6 mois), pas connecté à un outil
- **Inspiration Mindeck** : la structure par phases (empathize → define → ideate → prototype → test)

### Interaction Design Foundation (IxDF)
- **Catégorie** : plateforme de cours design
- **Ce qu'il fait bien** : catalogue énorme, abonnement simple
- **Ce qu'il rate** : format cours long, pas d'outil
- **Inspiration Mindeck** : les "concepts en 3 minutes" comme snippets pédagogiques in-app

---

## 3. Matrice couverture vs approche

| Outil | Couverture (1 seul / plusieurs / tous) | Approche |
|---|---|---|
| v0.dev | 1 seul (UI code) | AI génératif |
| Lovable | Plusieurs (UI + backend) | AI génératif |
| Bolt.new | Plusieurs (UI + backend) | AI génératif |
| Galileo AI | 1 seul (UI mobile) | AI génératif |
| UXPilot | Plusieurs (wireframe → UI) | AI génératif (dans Figma) |
| Uizard | Plusieurs | AI génératif (débutants) |
| Figma Make | Plusieurs (dans Figma) | AI génératif + éditeur expert |
| Relume | Plusieurs (sitemap → UI) | AI génératif + bibliothèque |
| Framer AI | Plusieurs (site complet) | AI génératif + éditeur |
| Tokens Studio | 1 seul (tokens) | Éditeur expert |
| Supernova | Plusieurs (DS + docs) | Éditeur expert |
| Zeroheight | 1 seul (doc DS) | Bibliothèque passive |
| Specify | 1 seul (tokens) | Éditeur expert (ops) |
| Style Dictionary | 1 seul (tokens CLI) | Éditeur expert (dev) |
| Looka | Plusieurs (brand kit) | Assistant guidé |
| Brandmark | Plusieurs (logo + brand) | AI génératif |
| Khroma | 1 seul (palette) | AI génératif |
| Huemint | 1 seul (palette) | AI génératif |
| Coolors | 1 seul (palette) | Éditeur + AI léger |
| Realtime Colors | 1 seul (palette live) | Assistant guidé |
| Typescale | 1 seul (typo) | Éditeur expert |
| Fontjoy | 1 seul (typo) | AI génératif |
| Radix Colors | 1 seul (palette sémantique) | Bibliothèque + doc |
| Stark | 1 seul (a11y) | Éditeur expert |
| Whimsical | Plusieurs (wireframe + flow) | Éditeur expert |
| Miro / FigJam | Plusieurs (workshop) | Éditeur expert |
| Excalidraw | 1 seul (sketch) | Éditeur expert |
| Mobbin | 1 seul (inspi) | Bibliothèque passive |
| Refactoring UI | Plusieurs (pédago) | Contenu passif |

**Constat clé.** Personne n'occupe le quadrant "**tous les chapitres** + **assistant guidé avec pédagogie intégrée**". C'est un espace vide exploitable.

---

## 4. Les 5 patterns UX à reprendre absolument

1. **Les 12 shades sémantiques de Radix Colors** — palette primitive × rôles sémantiques (bg/text/border/hover/active/focus) × dark/light auto. État de l'art absolu. Mindeck doit exposer ce modèle mental au débutant de façon simplifiée (ex : mode débutant = 3 rôles, mode expert = 12).

2. **Le live preview contextuel de Realtime Colors** — afficher la palette IMMÉDIATEMENT dans une UI cible réelle (page marketing + app + mobile). Pattern : l'utilisateur ne devine pas, il voit. Mindeck doit faire mieux en proposant plusieurs templates selon le type de projet (SaaS B2B, outil interne, appli mobile).

3. **L'onboarding par goût de Khroma** — "montre-moi 50 couleurs, je comprends ton goût". Pattern : collecter la préférence sans jargon. Mindeck peut l'appliquer à la typo ("choisis 5 titres qui te parlent"), au style ("minimaliste / vibrant / classique").

4. **Le flow low-fi → high-fi de UXPilot** — matérialiser la progression "brouillon → wireframe → high-fidelity" comme métaphore pédagogique. Mindeck peut traduire ça en "Mode Débutant : j'esquisse. Intermédiaire : je structure. Expert : je systématise."

5. **Les heuristiques actionnables in-app (inspiré Refactoring UI)** — transformer le savoir design en tooltips contextuels. Exemple : quand l'utilisateur ajoute une 4e couleur d'accent, alerte "Refactoring UI recommande max 2-3 accents — simplifie ?". **C'est le plus gros gap identifié**.

---

## 5. Les 5 anti-patterns à éviter absolument

1. **Le jargon expert sans onboarding** (Tokens Studio, Specify). "Semantic aliases", "W3C DTCG", "transform chains" — incompréhensible au débutant. Mindeck doit traduire : "Une couleur, plusieurs usages" au lieu de "Semantic alias".

2. **La génération AI sans cadrage stratégique** (v0, Lovable, Bolt). "Prompt → UI" sans demander qui est la cible, quel est le ton, quelle est la personnalité de marque. Résultat : UIs stylées mais interchangeables, zéro cohérence produit. **Mindeck doit exploiter sa force unique : il connaît déjà le projet (NSM, cible, type).**

3. **La galerie passive qui paralyse** (Dribbble, Behance). L'utilisateur regarde 100 refs et ne décide jamais. Mindeck doit pousser 3 refs max, contextualisées au projet.

4. **L'outil mono-fonction qui force à combiner 15 apps** (Coolors + Typescale + Fontjoy + Radix + Stark + ...). C'est la raison #1 pour laquelle les solo founders abandonnent le design système. **Mindeck doit être l'agrégateur par défaut.**

5. **La dépendance à Figma comme canvas unique** (UXPilot, Figma Make). Figma est un outil pro qui terrorise le débutant. Mindeck doit vivre dans le navigateur, sans prérequis Figma, quitte à proposer une **export Figma** comme feature secondaire.

---

## 6. Gaps de marché que Mindeck peut exploiter

1. **Aucun outil ne couple stratégie produit ↔ design tokens.** Mindeck a déjà les champs NSM, cible, type, positionnement. Les utiliser comme **inputs du générateur de design system** est un unfair advantage unique. Exemple : type = "SaaS B2B" + cible = "PME" → presets palette sobre + typo pro + density compact.

2. **Aucun outil n'intègre la pédagogie Refactoring UI au moment de la décision.** Il existe le livre, il existe les outils. Personne n'a fait le pont. Mindeck peut être le premier à afficher "Règle #12 de Refactoring UI : limite tes poids de police" EN CONTEXTE quand l'utilisateur ajoute sa 5e police.

3. **Aucun outil n'a de mode progressif explicite (débutant / intermédiaire / expert).** Tous supposent un niveau. Uizard tend vers le débutant, Tokens Studio vers l'expert. Mindeck peut être le seul qui grandit avec l'utilisateur.

4. **Aucun outil ne donne une "note de santé design" du projet.** Imagine un score "Cohérence visuelle : 72/100" avec les 5 warnings à corriger (trop de gris, contraste AA raté, 6 polices, etc.). Gamification + audit = puissant.

5. **Aucun outil ne génère le design system à partir de 3 inputs** (logo/couleur dominante, personnalité, cible). Looka fait ça pour le brand kit statique, pas pour les tokens actionnables. Mindeck peut faire "1 input minimal → système complet éditable".

---

## 7. Positionnement recommandé pour Mindeck

**Mindeck — l'assistant de réflexion design qui pense avec toi, pas à ta place.** Le seul outil qui relie ta stratégie produit (cible, NSM, type) à ton design system (tokens, palette, typo, composants), avec trois modes (Débutant / Intermédiaire / Expert) et une pédagogie Refactoring UI intégrée en contexte. Pas un générateur AI de plus — un **copilot qui te rend autonome**.

---

## 8. Sources

- https://v0.dev/ — home v0 Vercel
- https://vercel.com/blog/announcing-v0-generative-ui — annonce v0
- https://lovable.dev/ — Lovable
- https://bolt.new/ — Bolt.new
- https://galileo-ai.com/ / https://stitch.withgoogle.com/ — Galileo/Stitch
- https://uxpilot.ai/ — UXPilot
- https://uizard.io/ — Uizard
- https://help.figma.com/hc/en-us/articles/23955143044247-Use-Make-Designs-in-Figma — Figma Make
- https://www.figma.com/ai/ — Figma AI
- https://relume.io/ — Relume
- https://www.framer.com/ai/ — Framer AI
- https://tokens.studio/ — Tokens Studio
- https://www.supernova.io/ — Supernova
- https://zeroheight.com/ — Zeroheight
- https://specifyapp.com/ — Specify
- https://amzn.github.io/style-dictionary/ — Style Dictionary
- https://looka.com/ — Looka
- https://brandmark.io/ — Brandmark
- https://www.logoai.com/ — LogoAI
- https://www.khroma.co/ — Khroma
- https://huemint.com/ — Huemint
- https://coolors.co/ — Coolors
- https://www.realtimecolors.com/ — Realtime Colors
- https://typescale.com/ — Typescale
- https://www.modularscale.com/ — Modularscale
- https://www.fontpair.co/ — Fontpair
- https://fontjoy.com/ — Fontjoy
- https://www.radix-ui.com/colors — Radix Colors
- https://www.tpgi.com/color-contrast-checker/ — Contrast Finder
- https://webaim.org/resources/contrastchecker/ — WebAIM
- https://www.getstark.co/ — Stark
- https://whimsical.com/ — Whimsical
- https://www.figma.com/figjam/ — FigJam
- https://miro.com/ — Miro
- https://excalidraw.com/ — Excalidraw
- https://mobbin.com/ — Mobbin
- https://dribbble.com/ — Dribbble
- https://www.behance.net/ — Behance
- https://pageflows.com/ — Page Flows
- https://screenlane.com/ — Screenlane
- https://www.uisources.com/ — UI Sources
- https://land-book.com/ — Land-book
- https://www.refactoringui.com/ — Refactoring UI
- https://www.coursera.org/professional-certificates/google-ux-design — Google UX
- https://www.interaction-design.org/ — IxDF

---

**Note méthodologique.** Analyse basée sur les connaissances modèle (cutoff janvier 2026). Les outils WebSearch/WebFetch n'étant pas disponibles dans cet environnement d'exécution pour cet agent, les sources URL sont citées comme références documentaires (homepages et pages produits publiques connues) plutôt que fetched en direct.
