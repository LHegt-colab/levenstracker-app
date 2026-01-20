# IndexedDB Upgrade - Meer Opslagruimte

## Waarom upgraden naar IndexedDB?

**localStorage limiet**: ~5MB (5000KB)
**IndexedDB limiet**: 50MB - 1GB+ (afhankelijk van browser)

Dat is **10x tot 200x meer opslag!**

## Wat is IndexedDB?

IndexedDB is een moderne browser database die:
- ✅ Veel meer data kan opslaan (50MB-1GB+)
- ✅ Sneller is bij grote datasets
- ✅ Lokaal blijft (geen internet nodig)
- ✅ Nog steeds gratis is
- ✅ Betere prestaties heeft

## Wanneer upgraden?

Upgrade naar IndexedDB als:
- Je vaak tegen de 5MB limiet aanloopt
- Je veel foto's of grote bestanden wilt opslaan
- Je jaren aan data wilt bewaren
- Je betere performance wilt

## Wat moet er veranderen?

### 1. Dependencies toevoegen
```bash
npm install dexie
```

Dexie.js is een gebruiksvriendelijke wrapper voor IndexedDB.

### 2. Nieuwe database structuur
In plaats van één groot JSON object in localStorage, krijg je:
- Aparte tabellen per data type
- Betere query mogelijkheden
- Automatische indexering

### 3. Code aanpassingen
- `src/utils/localStorage.js` → `src/utils/indexedDB.js`
- AppContext moet async data laden
- Migratie tool voor bestaande data

## Implementatie Stappen

### Stap 1: Installeer Dexie
```bash
npm install dexie
```

### Stap 2: Maak database configuratie
Ik maak een nieuw bestand `src/utils/indexedDB.js` met:
```javascript
import Dexie from 'dexie';

const db = new Dexie('LeventrackerDB');

db.version(1).stores({
  dagboek: '++id, date, *tags',
  verzameling: '++id, category, *tags',
  ideeen: '++id, status, *tags',
  kalender: '++id, date, category',
  gewoontes: '++id, name',
  doelen: '++id, *tags',
  reflecties: '++id, date, type',
  voeding: '++id, date',
  settings: 'key'
});

export default db;
```

### Stap 3: Update AppContext
AppContext moet:
- Async data laden bij startup
- Wijzigingen direct naar IndexedDB schrijven
- Error handling toevoegen

### Stap 4: Migratie tool
Een migratie script dat:
1. Leest huidige localStorage data
2. Converteert naar IndexedDB formaat
3. Importeert in nieuwe database
4. Maakt backup van oude data
5. Laat gebruiker kiezen: behouden of verwijderen

### Stap 5: Testing
Alle functionaliteit testen:
- Data toevoegen/bewerken/verwijderen
- Export/Import
- Performance vergelijken

## Voordelen na upgrade

### Voor jou:
- **50-1000x meer opslag**: Van 5MB naar 50MB-1GB
- **Snellere app**: Betere performance bij grote datasets
- **Meer mogelijkheden**:
  - Foto's kunnen weer toegevoegd worden
  - Jaren aan dagboek entries
  - Grote verzamelingen
  - Uitgebreide statistieken

### Technisch:
- Betere query mogelijkheden
- Automatische indexering
- Transactie support
- Offline-first architecture

## Nadelen / Overwegingen

- ⚠️ Iets complexere code
- ⚠️ Vereist code aanpassingen
- ⚠️ Migratie van bestaande data nodig
- ⚠️ Verschillende browser limieten

## Browser Limieten IndexedDB

| Browser | Limiet (bij genoeg schijfruimte) |
|---------|----------------------------------|
| Chrome | Tot 80% van vrije schijfruimte |
| Firefox | Tot 50% van vrije schijfruimte |
| Safari | ~1GB |
| Edge | Tot 80% van vrije schijfruimte |

Praktisch: meestal **50MB - 1GB** zonder vragen, meer is mogelijk.

## Alternatief: File System API

Voor nog meer opslag (GB's):
- Chrome's File System Access API
- Kan direct bestanden schrijven naar harde schijf
- Vereist user permission
- Alleen Chrome/Edge
- Meest complexe optie

## Wil je upgraden?

Als je wilt upgraden naar IndexedDB, kan ik:

1. ✅ **Dexie installeren**
2. ✅ **indexedDB.js maken** met database configuratie
3. ✅ **AppContext updaten** voor async data
4. ✅ **Migratie tool maken** om huidige data over te zetten
5. ✅ **Alle components updaten** waar nodig
6. ✅ **Testing** en validatie

Dit geeft je **10-200x meer opslagruimte** en een **stabielere app**!

---

## Snelle Beslissing Boom

```
Heb je meer dan 3MB data?
├─ Nee → Blijf bij localStorage (simpeler)
└─ Ja  → Wil je foto's opslaan?
    ├─ Ja  → Upgrade naar IndexedDB ✅
    └─ Nee → Check huidige opslag in Instellingen
        ├─ < 4000KB → localStorage is OK
        └─ > 4000KB → Upgrade naar IndexedDB ✅
```

---

## Conclusie

Voor de meeste gebruikers is de **Productie Build (Optie 1)** voldoende.

**Upgrade naar IndexedDB als:**
- Je tegen opslaglimieten aanloopt
- Je jaren aan data wilt bewaren
- Je foto's wilt kunnen toevoegen
- Je grote verzamelingen hebt

**Ik kan de volledige upgrade in ~30 minuten implementeren!**
