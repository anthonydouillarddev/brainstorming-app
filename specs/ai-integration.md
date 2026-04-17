# Intégration IA dans Mindeck — Réflexion & Plan

> Brainstorm stratégique sur l'ajout d'une IA assistante dans Mindeck.
> Date : 2026-04-17

---

## 1. Est-ce utile ?

Oui, potentiellement **beaucoup** pour un outil comme Mindeck. 3 cas d'usage prioritaires :

- **Assistant brainstorm** : pose les bonnes questions sur une section vide, challenge les réponses faibles, suggère des angles oubliés
- **Analyse cockpit** : lit l'état d'un projet et propose la prochaine action logique, repère les incohérences (ex: phase "launched" mais todos P1 encore ouverts)
- **Génération** : résumé exécutif, pitch, user stories à partir du brainstorm

---

## 2. Faut-il "entraîner" un modèle custom ?

**Non.** Entraîner un modèle custom est cher, long, et inutile à cette échelle.

### Approches modernes

1. **API + contexte dans le prompt** (recommandé)
   Tu appelles Claude / OpenAI / Groq via leur API, et tu injectes le contexte du projet (sections, todos, décisions) dans le prompt à chaque requête.
   Le modèle "apprend" le projet le temps de la conversation. **Zéro stockage de modèle.**

2. **RAG** (plus tard, si nécessaire)
   Indexer les projets dans une base vectorielle pour retrouver des infos entre projets. **Overkill pour l'instant.**

### Ce qu'on stocke en DB

Juste les **conversations** dans une table Supabase `ai_conversations` (pas de modèle).

---

## 3. Chatbot : quel format ?

2 options UX :

- **Chatbot global** (bouton flottant partout) → connaît tous les projets
- **Chatbot contextuel par projet** → plus ciblé, **reco**

**Plus léger au démarrage** : un bouton "💡 Aide IA" dans l'onglet Brainstorm qui envoie la section courante à l'IA avec un prompt système type "coach produit, challenge cette réponse".
→ Coût : quelques centimes par usage, 1 journée de dev.

---

## 4. Pricing : qui paye l'API ?

### Option 1 — Ton API (centralisé)
- ✅ UX parfaite, zéro friction
- ❌ Tu payes tout + risque d'abus
- → obligation quasi-certaine d'un plan payant

### Option 2 — BYOK (Bring Your Own Key)
- ✅ Coût zéro pour toi
- ❌ Friction énorme : 90% des users décrochent

### Option 3 — Hybride (**recommandé**)
Standard SaaS 2026 (Cursor, Raycast, Zed) :
- **Plan gratuit** : 20 messages IA/mois sur ton API
- **Plan payant (ex: 9€/mois)** : 500 messages/mois sur ton API
- **Plan BYOK** (gratuit ou 2€) : user met sa clé, illimité

### Champs DB à ajouter dans `user_preferences`

```sql
ai_provider        -- 'platform' | 'byok'
ai_key_encrypted   -- clé chiffrée (si byok)
ai_monthly_usage   -- compteur quotas
ai_monthly_limit   -- selon plan
```

---

## 5. Tokens & coûts réels

### Claude.ai ≠ Claude API (confusion classique)

|  | Claude.ai (abo Pro/Max) | Claude API |
|---|---|---|
| Cible | Usage humain direct | Apps / devs |
| Facturation | Abonnement fixe | **Pay-as-you-go au token** |
| Limites | Quotas 5h + semaine | **Aucune limite de session** |

**Les limites 5h/semaine n'existent PAS sur l'API.** Sur l'API, tu payes chaque token input + output, c'est tout.

### "20 messages" = unité produit

C'est toi qui définis l'unité. En backend tu traques les tokens réels.

### Coût d'un message Mindeck typique

- **Input** : prompt système + contexte projet (sections + todos + décisions) + historique → ~3 000 tokens
- **Output** : réponse IA → ~1 000 tokens

| Modèle | Input /M | Output /M | 1 message | 20 msg | 500 msg |
|---|---|---|---|---|---|
| **Haiku 4.5** | ~$0.80 | ~$4 | ~$0.006 | **~$0.12** | **~$3** |
| **Sonnet 4.6** | ~$3 | ~$15 | ~$0.024 | **~$0.48** | **~$12** |
| **Opus 4.7** | ~$15 | ~$75 | ~$0.12 | ~$2.40 | ~$60 |

### Prompt caching = game changer

Claude API permet de **cacher** le contexte statique (prompt système + données projet).
→ **-90% sur les tokens cachés**.

Exemple : 10 messages dans une session brainstorm
- Sans cache : 10 × 3k = 30k tokens input facturés
- Avec cache : 3k + 10% × 27k = ~5.7k → **5× moins cher**

---

## 6. IA locale / Open Source : bonne idée ?

### Les 3 approches "open source"

#### 1. Self-host sur serveur (GPU cloud)
- ✅ Zéro coût par token, data privée
- ❌ GPU cloud = **500-2000€/mois fixe**
- ❌ Pas possible sur Vercel (pas de GPU)
- ❌ DevOps lourd
- → **Rentable seulement à partir de ~500 users actifs**

#### 2. Ollama sur ton PC
- ✅ Gratuit
- ❌ **Inutilisable pour un SaaS public** (PC allumé 24/7, pas fiable)
- → OK pour dev/perso uniquement

#### 3. API open source hébergée (**vrai sweet spot**)
Providers qui hébergent les modèles OSS et facturent au token :
- **Groq** : ultra rapide (10× plus rapide que Claude), Llama 3.3 70B à ~$0.59/$0.79 par M
- **Together.ai** / **Fireworks** / **DeepInfra**
- **DeepSeek V3** via DeepInfra : ~$0.27/$1.10 par M → presque gratuit

### Comparaison finale (1 message Mindeck, ~3k input + 1k output)

| Option | Coût/msg | 500 msg/mois | Qualité | Setup |
|---|---|---|---|---|
| Haiku 4.5 (Claude) | ~$0.006 | ~$3 | ⭐⭐⭐⭐ | Facile |
| Sonnet 4.6 (Claude) | ~$0.024 | ~$12 | ⭐⭐⭐⭐⭐ | Facile |
| **Llama 3.3 70B (Groq)** | ~$0.003 | **~$1.50** | ⭐⭐⭐⭐ | Facile |
| **DeepSeek V3 (DeepInfra)** | ~$0.002 | **~$1** | ⭐⭐⭐⭐ | Facile |
| Self-host Llama 70B | $0 | **$500-2000 fixe** | ⭐⭐⭐⭐ | Galère |
| Ollama sur PC | $0 | $0 | ⭐⭐⭐ | Perso only |

---

## 7. Stratégie retenue : multi-provider swappable

**Oublier le self-host.** À l'échelle de Mindeck, c'est une perte de temps.

### Archi recommandée

| Tier | Modèle | Provider | Coût/user |
|---|---|---|---|
| **Free** | Llama 3.3 70B | Groq | ~$1.50/mois max |
| **Pro (9€/mois)** | Sonnet 4.6 | Claude/Anthropic | ~$12/mois max → **marge ~60%** |
| **BYOK** | Au choix user | Claude / Groq / OpenAI | 0€ pour moi |

### Avantages
- Coûts bas sur le free (Groq)
- Qualité top sur le premium (Sonnet)
- Swap provider en 1 ligne côté code (SDK Vercel AI ou API OpenAI-compatible de Groq)
- Le BYOK protège financièrement si pricing mal calibré

### Prompt caching activé partout
→ Divise les coûts par 3-5.

---

## 8. Next steps concrets

### v0 — MVP solo (usage perso)
- [ ] Ajouter bouton "💡 Aide IA" dans l'onglet Brainstorm
- [ ] Route API Next.js `/api/ai/brainstorm` → Claude API avec prompt système coach produit
- [ ] Injecter contexte section courante + réponses existantes
- [ ] Streaming de la réponse (SDK `ai` de Vercel)
- [ ] Coût estimé : ~0-5€/mois en perso

### v1 — Préparer multi-user
- [ ] Table `ai_conversations` (id, user_id, project_id, messages jsonb, tokens_used, model, created_at)
- [ ] Champs quotas dans `user_preferences` (voir section 4)
- [ ] Middleware de rate limiting par user
- [ ] UI de consultation de l'historique des conversations
- [ ] Abstraction provider (interface commune Claude + Groq)

### v2 — Chatbot contextuel projet
- [ ] Bouton "💬 Assistant" dans le header projet
- [ ] Drawer latéral avec conversation
- [ ] Inject tout le contexte projet (sections + todos + décisions + risks)
- [ ] Actions suggérées (ex: "Créer une todo depuis cette réponse")

### v3 — Cockpit intelligent
- [ ] Widget "Analyse IA" dans le cockpit
- [ ] Détection auto d'incohérences (phase vs todos, risques non mitigés, etc.)
- [ ] Suggestion automatique de la prochaine action

### v4 — Tier payant + BYOK
- [ ] Intégration Stripe
- [ ] Gestion des quotas + upgrade flow
- [ ] Chiffrement clés BYOK (Supabase Vault ou crypto natif)
- [ ] Switch provider dans les settings

---

## 9. Tradeoffs à garder en tête

- **Coût vs qualité** : Haiku/Llama suffisent pour 90% des cas. Sonnet/Opus pour l'analyse complexe.
- **Vitesse vs qualité** : Groq = ultra rapide mais qualité Llama. Claude = plus lent mais plus subtil.
- **Privacy vs features** : Claude/OpenAI stockent parfois les prompts (opt-out possible). Groq est plus flou. Self-host = 100% privé mais cher.
- **Verrouillage provider** : toujours coder avec une abstraction pour swap facilement.
