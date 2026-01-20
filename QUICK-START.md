# Quick Start Guide - Persoonlijke Levenstracker v2.0 (IndexedDB)

## ✅ Huidige Status

Je applicatie is **klaar voor gebruik** met IndexedDB upgrade!

## 🚀 Start de Applicatie

### Stap 1: Open in Browser
Ga naar: **http://localhost:3000**

### Stap 2: Migratie Wizard (Eerste keer)
Als je bestaande data hebt, zie je de migratie wizard:

1. **Download Backup** (VERPLICHT)
   - Klik op "Download Backup"
   - Bewaar het .json bestand veilig

2. **Start Migratie**
   - Klik op "Start Migratie"
   - Wacht 10-30 seconden

3. **Verificatie**
   - Controleert of alle data correct is overgezet
   - Toont aantal entries per categorie

4. **Klaar!**
   - Klik "Start de app"
   - Begin met gebruiken

### Als je GEEN bestaande data hebt:
- De app start direct met IndexedDB
- Je kunt meteen beginnen

---

## 📊 Wat is er Nieuw?

### Opslag Capaciteit:
- **Voor:** 5MB (localStorage)
- **Nu:** 50MB - 1GB (IndexedDB)
- **10-200x meer ruimte!**

### Prestaties:
- 2-3x snellere laadtijd
- Async operaties (UI blijft responsive)
- Betere performance met grote datasets

### Nieuw sinds vorige sessie:
- ✅ Voeding module (maaltijden, kcal tracking)
- ✅ Terugkerende kalender events (dagelijks/wekelijks/maandelijks/jaarlijks)
- ✅ Kalender events bewerken en verwijderen
- ✅ IndexedDB upgrade (50MB-1GB opslag)

---

## 🔄 Server Beheer

### Production Server (AANBEVOLEN):
```bash
# Start:
npx serve -s build

# Of dubbelklik:
start-productie.bat

# URL: http://localhost:3000
```

### Development Server (voor ontwikkeling):
```bash
# Start:
PORT=3003 npm start

# URL: http://localhost:3003
```

**Let op:** Development server crasht vaker. Gebruik production voor dagelijks gebruik!

---

## 💾 Data Veiligheid

### Waar staat je data?
- **IndexedDB** in je browser (lokaal op je computer)
- **Niet in de cloud** - alles blijft privé
- **Per browser** - elke browser heeft eigen data

### Backup maken:
1. Ga naar **Instellingen**
2. Klik **"Exporteer Alle Data (JSON)"**
3. Bewaar bestand op veilige plek

**Aanbeveling:** Maak wekelijks een backup!

### Je oude localStorage data:
- Is **NIET verwijderd**
- Blijft als backup beschikbaar
- Wordt niet meer gebruikt

---

## ⚙️ Instellingen

Je kunt nu in de app instellen:

### Voeding Module:
- Dagelijks kcal doel instellen
- Maaltijden toevoegen (type, hoeveelheid, kcal)
- Periode overzichten bekijken

### Kalender:
- Events met herhaling
- Bewerken en verwijderen van events
- Categorieën en notificaties

### Andere Modules:
- Dagboek (zonder foto's - bespaart ruimte)
- Verzameling
- Ideeën
- Gewoontes
- Doelen
- Reflecties

---

## 🐛 Problemen Oplossen

### App laadt niet:
1. Check of server draait (zie hierboven)
2. Ga naar http://localhost:3000 (NIET 3003!)
3. Hard refresh: **Ctrl + F5**

### Migratie mislukt:
- Geen zorgen! Je originele data is veilig
- Klik "Opnieuw proberen"
- Of kies "Gebruik localStorage" om terug te gaan

### Data niet zichtbaar:
1. Open Developer Tools: **F12**
2. Ga naar **Console** tab
3. Zoek naar fouten
4. Ga naar **Application** → **IndexedDB** → **LeventrackerDB**
5. Controleer of data er staat

### Wil opnieuw migreren:
1. Open Developer Tools (**F12**)
2. **Application** → **IndexedDB** → Delete "LeventrackerDB"
3. **Application** → **Local Storage** → Delete "levenstracker_migration_status"
4. Refresh pagina (**F5**)

---

## 📈 Opslag Monitor

In **Instellingen** zie je nu:

- **Gebruikt:** Hoeveel ruimte je data inneemt
- **Beschikbaar:** Totale ruimte (50MB-1GB)
- **Percentage:** Hoe vol je opslag is

---

## 📚 Meer Informatie

Voor uitgebreide documentatie, zie:
- **README-INDEXEDDB.md** - Volledige IndexedDB gids
- **PRODUCTIE-SETUP.md** - Deployment opties
- **HOE-TE-GEBRUIKEN.md** - Algemene handleiding

---

## 🎯 Je kunt Nu:

1. **Jaren aan data opslaan**
   - Dagboek entries zonder limiet zorgen
   - Grote verzamelingen
   - Uitgebreide statistieken

2. **Stabiel werken**
   - Production server crasht bijna nooit
   - Snelle prestaties
   - Responsive UI

3. **Nieuwe features gebruiken**
   - Voeding tracking met kcal
   - Terugkerende kalender events
   - Events bewerken/verwijderen

---

**Veel plezier met je Levenstracker v2.0!** 🚀

Bij vragen, check de troubleshooting sectie of de uitgebreide README's.
