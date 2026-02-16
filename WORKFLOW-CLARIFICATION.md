# 🔄 Clarification Workflow Git & Déploiement

## ⚠️ IMPORTANT - Distinction Critique

Il existe **DEUX répertoires distincts** pour ce projet :

### 1️⃣ **REPO PROJET (Source de Vérité)**
```
📂 /home/freebox/Projects/facturation/
   ├── src/                    (ancien code Express)
   ├── app/                    (Next.js - en cours)
   ├── lib/                    (librairies)
   ├── .git/                   (repo local)
   └── package.json            (dépendances)
```

**Qui :** Amélia (dev) travaille ici
**Actions :** 
- Modifications code
- git add/commit/push
- Tests locaux

**Branch :** main

---

### 2️⃣ **DÉPLOIEMENT PRODUCTION**
```
📂 /opt/invoicing/
   ├── (synced depuis GitHub)
   ├── .next/                  (build output)
   ├── node_modules/
   └── .env                    (variables prod)
```

**Qui :** Oscar (ops) gère ça
**Actions :**
- git pull origin main (depuis GitHub)
- npm install (si package.json changé)
- npm run build
- systemctl restart invoicing
- Monitoring + logs

**Branch :** main

---

## 🔁 Workflow Correct (GIT → PROD)

```
┌─────────────────────────────────────────┐
│ Amélia (dev)                            │
│ /home/freebox/Projects/facturation/     │
│                                         │
│ 1. Modifie code                         │
│ 2. git add .                            │
│ 3. git commit -m "..."                  │
│ 4. git push origin main                 │
└────────────────┬────────────────────────┘
                 │
                 ▼
         📤 GitHub (main)
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Oscar (ops)                             │
│ /opt/invoicing/ (VM01 Production)       │
│                                         │
│ 1. cd /opt/invoicing                    │
│ 2. git pull origin main                 │
│ 3. npm install (si package.json modifié)
│ 4. npm run build                        │
│ 5. systemctl restart invoicing          │
│ 6. Test: curl https://invoicing...      │
└─────────────────────────────────────────┘
                 │
                 ▼
        🎉 https://invoicing.hunik.cloud
```

---

## ✅ Actions Correctes par Agent

### Amélia (Dev) - Toujours à `/home/freebox/Projects/facturation/`

```bash
# ✅ BON
cd /home/freebox/Projects/facturation
git status
npm run build  # Test local
git push origin main

# ❌ MAUVAIS - Ne pas modifier directement /opt/invoicing
cd /opt/invoicing  # JAMAIS pour dev work
```

### Oscar (Ops) - Pull depuis GitHub, déploie à `/opt/invoicing`

```bash
# ✅ BON
cd /opt/invoicing
git pull origin main
npm install
npm run build
systemctl restart invoicing

# ❌ MAUVAIS - Ne pas committer directement à /opt/invoicing
cd /opt/invoicing
git add .
git commit ...  # JAMAIS - c'est une copie de prod
```

---

## 📋 Checklist Deployment

- [ ] Amélia: Modifications dans `/home/freebox/Projects/facturation/`
- [ ] Amélia: `git push origin main` depuis project repo
- [ ] Oscar: Notification que code est prêt
- [ ] Oscar: `cd /opt/invoicing && git pull origin main`
- [ ] Oscar: `npm install` (si package.json changé)
- [ ] Oscar: `npm run build` (vérifier le build)
- [ ] Oscar: `systemctl restart invoicing`
- [ ] Oscar: `curl https://invoicing.hunik.cloud/api/health`
- [ ] ✅ Production synced

---

## 🚨 Problème Actuel

**Ce qui s'est passé :**
- Amélia travaillait à `/opt/invoicing` (MAUVAIS - c'est la prod)
- Devrait travailler à `/home/freebox/Projects/facturation/` (BON - c'est le repo)

**Solution :**
1. Amélia retourne à `/home/freebox/Projects/facturation/`
2. Vérifie que tout le code Next.js 14.2 est là (Phases 2-3)
3. Complète Phase 4 (npm build + tests)
4. Complète Phase 5 (git push)
5. Oscar pull et déploie

---

**Rappel :** GitHub est la source de vérité. Deux directions de sync :
- **Dev → GitHub :** Amélia push le code modifié
- **GitHub → Prod :** Oscar pull le code sur VM01

Jamais de commits directs en prod. ✅

---

*Mis à jour : LUN 16 FÉV 13:31 UTC*
