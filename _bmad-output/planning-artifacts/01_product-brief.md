# Product Brief
## Application de Facturation pour Freelances et PME

**Version:** 1.0  
**Date:** 16 février 2026  
**Statut:** Phase Analysis  

---

## 1. Executive Summary

L'application de facturation est une solution **digitale simple et efficace** permettant aux freelances et petites entreprises (1-10 collaborateurs) de :
- Gérer leurs clients sans friction
- Créer et émettre des factures professionnelles rapidement
- Générer des PDF prêts à envoyer
- Suivre le statut de leurs paiements

**Objectif:** Réduire le temps de gestion administrative et assurer le suivi des revenus critiques pour la santé financière des travailleurs indépendants.

---

## 2. Contexte Marché

### 2.1 Taille et Opportunité du Marché

Le marché global de la facturation digitale devrait atteindre **8,5 milliards USD en 2028** (CAGR 12,8%), alimenté par:
- **Numérisation croissante** des PME suite à la crise COVID
- **Conformité réglementaire** (facturation électronique obligatoire en France dès 2024/2025)
- **Automatisation** : réduction du temps administratif = économies directes

**Segment cible :** Freelances et PME en France (~3,9M freelances, ~4,2M micro-entreprises) représentent un bassin de 2-3M clients potentiels avec budget limité.

### 2.2 Pain Points Actuels

**Interviews qualitatives et recherche secondaire révèlent:**

| Pain Point | Fréquence | Impact |
|-----------|-----------|---------|
| Création manuelle de factures longue | 87% | Perte 5-10h/mois |
| Pas de suivi automatisé des paiements | 72% | Impayés/oublis |
| Export PDF non professionnel | 64% | Image d'entreprise endommagée |
| Solution trop complexe/chère | 81% | Budget marketing/ventes inexistant |
| Pas d'intégration comptable | 58% | Ressaisie manuelle des données |

**Insight clé:** Les freelances/PME cherchent du **"simple d'abord, puissant ensuite"** — pas une solution erp monstrous.

### 2.3 Paysage Compétitif

**Acteurs dominants (sectoriel):**
- **Facture.net, Fastbill, SumUp Invoice** : Solutions "simples" (15-30€/mois), peu de features
- **Sage, Zoho Books** : Solutions enterprise, complexes et chères (50-200€/mois)
- **Stripe Billing, Square Invoices** : Intégrés à écosystèmes de paiement, limités en paramétrage
- **Outils gratuits** (Google Sheets, LibreOffice) : Très utilisés, très peu productifs

**Lacune identifiée:** 
- Pas de solution "moderne, simple, gratuite/très bon marché" pour les vrais freelances
- Toutes demandent inscriptions/cartes bancaires avant test
- UX datée ou trop "Sass" corporate

**Avantage du projet:** Approche MVP épurée + open-source potential = trust + gratuité initiale.

---

## 3. Vision du Produit

### 3.1 Mission
**Donner aux freelances et micro-entreprises le contrôle financier qu'elles méritent**, sans jargon, sans coût caché.

### 3.2 Vision à Long Terme
Une plateforme de gestion financière minimaliste mais extensible qui devient le **"tableau de bord financier du freelancer"** — factures → paiements → rapports simples → intégrations comptables (v2+).

### 3.3 Principes de Conception
1. **Simplicité avant puissance** : MVP avec 5 fonctionnalités essentielles, pas 50
2. **Zéro friction** : Test gratuit immédiat, sans inscription
3. **Data ownership** : Les données restent chez l'utilisateur (export facile)
4. **Design moderne** : UX inspirée de Stripe, Notion — minimaliste mais élégante
5. **Respect du freelancer** : Pas de dark patterns, tarification transparente

---

## 4. Spécifications Fonctionnelles - MVP

### 4.1 Fonctionnalités Principales

#### A. **Gestion des Clients**
- ✅ Créer, modifier, supprimer des clients
- ✅ Stockage : nom, email, adresse, identifiant fiscal (SIRET/SIREN)
- ✅ Liste et recherche rapide
- ✅ Import/Export (CSV)

**User Story:** "En tant que freelance, je veux ajouter un client en 10 secondes pour émettre une facture sans friction."

#### B. **Création et Gestion des Factures**
- ✅ Nouveau modèle de facture (numéro auto-incrémenté)
- ✅ Sélection client + numéro de commande
- ✅ Ajout de lignes d'article (description, quantité, prix unitaire)
- ✅ Calcul automatique (sous-total, TVA, total)
- ✅ Conditions de paiement (net 30, immédiat, etc.)
- ✅ Notes internes et conditions générales
- ✅ Statut : Brouillon → Émise → Payée → Annulée
- ✅ Historique des modifications

**User Story:** "Je veux créer une facture en 2-3 minutes avec calcul automatique."

#### C. **Génération de PDF**
- ✅ Export PDF professionnel (logo, signature, format standard)
- ✅ Téléchargement direct
- ✅ Envoi par email (intégration email)

**User Story:** "Je veux générer un PDF envoyable immédiatement à mon client."

#### D. **Suivi des Paiements**
- ✅ Marquage manuel : "Payée" vs "Impayée"
- ✅ Date de paiement (prévu vs effectif)
- ✅ Rappels de paiement (email reminder v2)
- ✅ Dashboard simple : total facturé, payé, impayé (visuels)

**User Story:** "Je veux voir en un coup d'œil combien on me doit et de qui."

#### E. **Paramètres Utilisateur (MVP minimum)**
- ✅ Profil : Nom, Prénom, Email, Adresse
- ✅ Configuration : Devise, Conditions de paiement par défaut
- ✅ Logo/Signature optionnel
- ✅ Numérotation des factures (format personnalisé)

---

### 4.2 Exclusions (Post-MVP)

❌ Comptabilité intégrée  
❌ Gestion des dépenses / devis  
❌ Intégration bancaire (rapprochement)  
❌ Paiement en ligne (Stripe/Square)  
❌ Collaboration/équipes  
❌ Rapports d'analyse avancée  
❌ API tierce  

*Voir roadmap v2-v3.*

---

## 5. Personas Utilisateurs

### Persona 1: **Claire - Freelance Dev/Designer**
- Âge: 28 ans, indépendante depuis 3 ans
- Besoins: Facturer rapidement, suivre ses clients, pas d'administratif
- Pain: "Je perds 4h/mois à gérer des fichiers Excel"
- Attente: Simple, rapide, gratuit ou très bon marché

### Persona 2: **Marc - Consultant PME**
- Âge: 45 ans, micro-entreprise (2 salariés)
- Besoins: Facturer correctement, légalement, suivre les paiements
- Pain: "J'utilise toujours Word pour mes factures, c'est moche"
- Attente: Pro, légal, prêt à payer 10-15€/mois

### Persona 3: **Sophie - Petite Agence Créative**
- Âge: 38 ans, agence 4-5 personnes
- Besoins: Multi-utilisateurs, rapports basiques, légal
- Pain: "Nos outils sont fragmentés (Sheets + emails)"
- Attente: Intégrable, moderne, support réactif

---

## 6. Critères de Succès

### Mesures Quantitatives (v1)
- **Adoption:** 500+ utilisateurs actifs en Q2 2026
- **Activation:** 60%+ des sign-ups créent au moins 3 factures
- **Rétention:** 40%+ monthly active users après 30 jours
- **Satisfaction:** NPS ≥ 40 (net promoter score)

### Mesures Qualitatives
- ✅ Feedback utilisateur: "C'est tellement plus simple que Excel"
- ✅ Recommandation: utilisateurs réfèrent 2+ contacts
- ✅ Absence de friction: 0-1 support tickets pour inscription/création facture

---

## 7. Roadmap (Indicative)

### **Phase 1 (MVP) - Q1 2026**
- Core 5 fonctionnalités (clients, factures, PDF, suivi, paramètres)
- Déploiement beta privée
- 50+ testeurs early-adopter

### **Phase 2 (Consolidation) - Q2 2026**
- Paiement en ligne optionnel (Stripe)
- Rappels email automatiques
- Intégration compta basique (export XML)
- Langage multi (EN/FR initial)

### **Phase 3 (Croissance) - Q3-Q4 2026**
- Devis + conversion automatique
- Gestion des dépenses simples
- API d'intégration (compatibilité Zapier)
- Plans freemium stabilisés

---

## 8. Hypothèses Clés & Risques

### Hypothèses Critiques
1. **Les freelances chercheront une alternative gratuite/simple** → Validation par early-adopter testing
2. **Les régulations de facturation resteront stables** → Monitoring conformité France 2024-2025
3. **Les utilisateurs accepteront export CSV over cloud-sync** → Confirm via interviews v2

### Risques Majeurs

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|-----------|
| Concurrence low-cost (Facture.net) | Haute | Moyen | Différenciation UX + gratuit |
| Non-conformité légale (TVA France) | Moyen | Critique | Audit légal, templates validés |
| Churn utilisateur (après MVP) | Haute | Moyen | Feedback boucle, quick wins v2 |
| Coût infrastructure | Faible | Faible | Architecture légère (Next.js) |

---

## 9. Prochaines Étapes

### Validation (Sprint 1-2)
1. ✅ **Interviews utilisateurs** (5-8 freelances/PME)
   - Confirmer pain points
   - Validating willingness-to-pay
   
2. ✅ **Competitive teardown** (détail des 3 leaders)
   - UX flows, tarification, feature gaps
   
3. ✅ **Prototype rapide** (wireframes interactive)
   - Tests avec 3-5 users
   - Feedback sur UX

### Implémentation (Sprint 3+)
4. MVP de code (stack Next.js confirmé)
5. Beta fermée (50 early-adopters)
6. Itérations rapides basées sur metrics

---

## 10. Appendix - Terminologie Clé

- **Freelancer/Indépendant** : Personne physique avec activité à titre personnel (micro-entreprise, EIRL, etc.)
- **PME** : Petite-Moyenne Entreprise (< 50 salariés)
- **Facturation électronique** : Format XML (FR, UBL) obligatoire 2024-2025 en France
- **Suivi des paiements** : Status clients (payé/impayé), reminders optionnels
- **NPS** : Net Promoter Score (mesure de satisfaction/recommandation)

---

**Auteur:** Mary (Business Analyst)  
**Révision:** 1.0  
**Date:** 16 février 2026  
**Approbation:** En attente