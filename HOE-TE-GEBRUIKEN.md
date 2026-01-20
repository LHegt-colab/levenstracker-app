# Persoonlijke Levenstracker - Gebruiksinstructies

## Applicatie Starten

### Optie 1: Auto-restart (AANBEVOLEN)
Dubbelklik op `start-app.bat` in de map `levenstracker`.
- De applicatie start automatisch
- Bij crashes herstart de app automatisch binnen 5 seconden
- Druk op Ctrl+C om volledig te stoppen

### Optie 2: Handmatig starten
Open een terminal in de map `levenstracker` en voer uit:
```
npm start
```

## Toegang tot de applicatie
Open je browser en ga naar: **http://localhost:3003**

## Waarom crasht de applicatie soms?

De React development server is bedoeld voor ontwikkeling en kan crashen door:
1. **Memory leaks** - Te veel data in localStorage
2. **Hot reload issues** - Automatische updates triggeren crashes
3. **Resource limits** - Browser of Node.js bereikt geheugenlimieten
4. **Windows process management** - Achtergrondprocessen worden automatisch beëindigd

## Oplossingen voor stabiliteit

### 1. Gebruik de auto-restart batch file
Het `start-app.bat` bestand herstart de app automatisch bij crashes.

### 2. Maak regelmatig backups
- Ga naar Instellingen → Data Beheer
- Klik op "Exporteer Alle Data (JSON)"
- Bewaar het .json bestand op een veilige plek

### 3. Verwijder oude data
Als de opslaglimiet bijna bereikt is:
- Ga naar Instellingen → bekijk Opslaggebruik
- Verwijder oude dagboek entries, events, etc.
- Exporteer eerst een backup!

### 4. Browser cache legen
Soms helpt het om de browser cache te legen:
- Chrome/Edge: Ctrl + Shift + Delete
- Kies "Cached images and files"
- Klik "Clear data"

### 5. Productie build maken (gevorderd)
Voor een stabielere versie, maak een productie build:
```
npm run build
```
Dan gebruik je een lokale server zoals `serve`:
```
npm install -g serve
serve -s build -l 3003
```

## Data Opslag

De applicatie gebruikt **localStorage** van je browser:
- **Limiet**: ~5MB (5000KB)
- **Locatie**: In je browser, niet op de harde schijf
- **Belangrijk**: Als je browser data wist, verlies je alles!

### Aanbevelingen:
1. Maak **wekelijks** een backup (Export Data)
2. Bewaar backups op meerdere locaties
3. Hou je opslaggebruik onder de 4000KB

## Veelvoorkomende problemen

### "Deze site is niet bereikbaar"
**Oorzaak**: De applicatie is gestopt
**Oplossing**: Start `start-app.bat` opnieuw

### "Opslaglimiet bereikt"
**Oorzaak**: Te veel data in localStorage
**Oplossing**:
1. Exporteer een backup
2. Verwijder oude entries
3. Overweeg maandelijks te archiveren

### Applicatie laadt niet
**Oplossingen**:
1. Ververs de pagina (F5)
2. Hard refresh (Ctrl + F5)
3. Sluit en heropen de browser
4. Stop de app (Ctrl+C) en start opnieuw

### Wijzigingen worden niet opgeslagen
**Oorzaak**: localStorage is vol of geblokkeerd
**Oplossing**:
1. Check opslaggebruik in Instellingen
2. Maak ruimte door oude data te verwijderen
3. Check browser privacy instellingen

## Technische Details

- **Framework**: React 19
- **Styling**: Tailwind CSS v3
- **Data opslag**: Browser localStorage
- **Port**: 3003
- **Node.js**: Vereist (voor development server)

## Support

Bij problemen:
1. Check deze handleiding
2. Probeer de app opnieuw te starten
3. Controleer of je een recente backup hebt
4. Overweeg browser cache te legen

## Belangrijke Bestanden

- `start-app.bat` - Auto-restart script
- `package.json` - Project configuratie
- `src/` - Broncode van de applicatie
- `.env` (optioneel) - Omgevingsvariabelen

---

**Veel plezier met je Persoonlijke Levenstracker!**
