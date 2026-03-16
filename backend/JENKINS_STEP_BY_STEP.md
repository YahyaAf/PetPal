# 📊 Step-by-Step: Jenkins Dashboard Setup for PetPal

## Section 1: Jenkins Initial Setup

### Step 1: Accéder à Jenkins Dashboard

```
URL: http://localhost:8081
```

Vous allez voir cette page:
```
✅ Unlock Jenkins
   Enter the password from: /var/jenkins_home/secrets/initialAdminPassword
```

---

### Step 2: Entrer le Password

1. Coller le password: `04903b5803e34d92b21655dc4824f571`
2. Clicker **Continue** ➜

```
Le page va charger → "Getting Started"
```

---

### Step 3: Install Suggested Plugins

```
Jenkins suggère des plugins utiles
```

Clicker **Install suggested plugins** ➜ Attendre ~5 minutes

```
Plugins à installer:
✅ Pipeline
✅ Git
✅ GitHub
✅ Docker
✅ Maven Integration
```

---

### Step 4: Créer First Admin User

```
Page d'enregistrement:

Username: admin
Password: votre_password_123
Confirm password: votre_password_123
Full name: PetPal Admin
E-mail: admin@petpal.com
```

Clicker **Create First Admin User** ➜

---

### Step 5: Jenkins URL Configuration

```
Jenkins URL: http://localhost:8081/
```

Clicker **Save and Continue** ➜

---

### Step 6: Dashboard Initial

```
✅ Jenkins is ready!

Vous êtes maintenant à:
http://localhost:8081/
```

---

## Section 2: Créer le Job Pipeline

### Step 7: Créer un New Item

1. **Homepage** → Clicker **+ New Item** (haut gauche)

```
Ou directement: http://localhost:8081/view/all/newJob
```

---

### Step 8: Configurer le Job

```
Item name: PetPal-Backend

Type: Pipeline

Clicker OK ➜
```

---

### Step 9: Configuration du Pipeline

Vous êtes maintenant dans la page de configuration du job.

**Onglet: General**
```
✅ Description: 
   CI/CD Pipeline pour PetPal Backend
   
✅ Discard old builds:
   - Keep builds for 7 days
   - Keep maximum 10 builds
```

---

### Step 10: Configuration du SCM (Source Code Management)

**Onglet: Pipeline**

```
Definition: Pipeline script from SCM

SCM: Git

Repository URL:
  https://github.com/YOUR_USERNAME/PetPal.git
  
Branch Specifier:
  */main
  
Script Path:
  backend/Jenkinsfile
```

**Important**: Remplacer `YOUR_USERNAME` par votre username GitHub!

---

### Step 11: Build Triggers

**Onglet: Build Triggers**

```
☐ GitHub hook trigger for GITScm polling
  (on activera après)
  
☐ Poll SCM
  H/5 * * * *
  (Vérifier GitHub toutes les 5 minutes)
```

---

### Step 12: Sauvegarder

Clicker **Save** en bas à droite ➜

```
Vous êtes maintenant sur la page du job:
http://localhost:8081/job/PetPal-Backend/
```

---

## Section 3: Premier Build Manual

### Step 13: Lancer le Premier Build

Page du job PetPal-Backend:

Clicker **Build Now** (haut gauche)

```
Un nouveau build #1 apparaît dans "Build History"
```

---

### Step 14: Monitorer le Build

1. Clicker sur **#1** dans Build History

```
Vous voyez:
- Build Status: IN PROGRESS (en cours)
- Build Timestamp
- Log détaillé
```

2. Clicker **Console Output** pour voir les logs en temps réel

```
Vous allez voir:
[Pipeline] Start of Pipeline
[Pipeline] node
[Pipeline] {
[Pipeline] stage
[Pipeline] { (Checkout)
  ✅ Récupération du code...
  Cloning repository...
[Pipeline] stage
[Pipeline] { (Build)
  🔨 Build du projet avec Maven...
  mvn clean compile
...
```

---

### Step 15: Attendre la fin du Build

Attendre que le pipeline se termine:

```
Variantes:
✅ SUCCESS - Tout va bien!
❌ FAILURE - Erreur détectée
⏸️  UNSTABLE - Warnings mais continue
```

---

## Section 4: Dashboard & Monitoring

### Step 16: Voir le Dashboard Principal

Aller à: `http://localhost:8081/`

```
Dashboard montre:
┌─────────────────────────────────────┐
│ Jenkins                             │
├─────────────────────────────────────┤
│                                     │
│ Jobs:                               │
│ ✅ PetPal-Backend                    │
│    Last Build: #1 (SUCCESS)        │
│    Health: ████████░░ 80%          │
│                                     │
└─────────────────────────────────────┘
```

---

### Step 17: Voir les Stages du Pipeline

Sur la page du job: `http://localhost:8081/job/PetPal-Backend/1/`

```
Clicker "Pipeline" → Vue graphique des stages:

Checkout ─→ Build ─→ Test ─→ Package ─→ Docker Build ─→ Deploy
   ✅         ✅       ✅       ✅          ✅           ⏸️
   
(Les stages qui ont réussi montrent ✅)
(Les stages échoués montrent ❌)
```

---

### Step 18: Voir la Tendance

Clicker sur **Trend** ou **Build History**

```
Graphe montrant:
- Tous les builds récents
- Durée de chaque build
- Status (SUCCESS/FAILURE)
```

---

## Section 5: Configuration GitHub Webhook (Optionnel)

### Step 19: Activer les Builds Automatiques

**Dans Jenkins:**

1. Aller à: `http://localhost:8081/job/PetPal-Backend/configure`
2. Onglet: **Build Triggers**
3. ✅ Cocher **GitHub hook trigger for GITScm polling**
4. Clicker **Save**

---

### Step 20: Configurer GitHub Webhook

**Sur GitHub:**

1. Aller à votre repo: `https://github.com/YOUR_USERNAME/PetPal`
2. **Settings** → **Webhooks**
3. **Add webhook**

```
Payload URL:
  http://your-jenkins-ip:8081/github-webhook/
  
Content type: application/json

Events:
  ☑️ Push events
  ☑️ Pull requests
  
Clicker "Add webhook"
```

---

### Step 21: Tester le Webhook

Chaque fois que vous poussez vers `main`:

```
Git push → GitHub → Webhook → Jenkins
  ↓
Build lancé automatiquement!
```

---

## Section 6: Blue Ocean (UI Meilleure)

### Step 22: Installer Blue Ocean Plugin

1. **Manage Jenkins** → **Manage Plugins** → **Available**
2. Chercher: **Blue Ocean**
3. Clicker **Install without restart**
4. Attendre que le plugin s'installe

---

### Step 23: Accéder à Blue Ocean

```
URL: http://localhost:8081/blue
```

```
Interface plus moderne qui montre:
- Visual pipeline avec stages graphiques
- Real-time logs
- Build trends
- GitHub integration
```

---

## Section 7: Dépannage

### Problème 1: BuildFails - "mvn: command not found"

**Solution:**

1. **Manage Jenkins** → **Global Tool Configuration**
2. **Maven** → **Add Maven**
   ```
   Name: Maven 3.9
   Install automatically: ☑️
   ```
3. Relancer le build

---

### Problème 2: Docker Command Not Found

**Solution:**

```bash
docker exec petpal-jenkins usermod -aG docker jenkins
docker restart petpal-jenkins
```

---

### Problème 3: Git Clone échoue

**Solution:**

Vérifier que l'URL GitHub est correcte et que le repo est public
(ou configurer SSH key)

---

## Section 8: Dashboard Final View

Après tout est configuré, votre dashboard montre:

```
┌──────────────────────────────────────────────────┐
│ JENKINS DASHBOARD                                │
├──────────────────────────────────────────────────┤
│                                                  │
│ 📊 JOBS                                          │
│                                                  │
│ PetPal-Backend                                   │
│ ✅ SUCCESS (Last build #5)                       │
│ 📈 Health: ████████░░ 80%                       │
│ ⏱️  Average build time: 5 minutes                │
│                                                  │
│ BUILD HISTORY:                                   │
│ #5  ✅ SUCCESS   (2 min ago)                    │
│ #4  ✅ SUCCESS   (7 min ago)                    │
│ #3  ❌ FAILURE   (15 min ago)                   │
│ #2  ✅ SUCCESS   (22 min ago)                   │
│ #1  ✅ SUCCESS   (30 min ago)                   │
│                                                  │
│ 📈 TRENDS                                        │
│ [Graph showing build success rate]               │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## ✅ Checklist Complète

- [ ] Jenkins running sur http://localhost:8081
- [ ] Admin user créé
- [ ] Plugins installés
- [ ] Job "PetPal-Backend" créé
- [ ] Jenkinsfile lié correctement
- [ ] Premier build lancé avec succès
- [ ] Dashboard visible
- [ ] GitHub Webhook configuré (optionnel)
- [ ] Blue Ocean installed (optionnel)
- [ ] Stages du pipeline visibles et en succès

---

## 🚀 Prochaines Étapes

1. **Automatiser les builds** - GitHub webhook
2. **Ajouter des notifications** - Slack/Email
3. **Configurer le déploiement** - Docker registry push
4. **Ajouter des rapports** - Résultats tests, couverture code
5. **Sécuriser** - Jenkins credentials pour docker/github

---

**Document créé pour PetPal | Mars 2026**
