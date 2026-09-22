# MatheFox

<div align="center">

### 🦊 Schlau rechnen, Spass haben!

Eine mobile-first Lern-App für Mathearbeiten in der 4. und 5. Klasse.

[**Live-App öffnen**](https://theonlytazz.github.io/MatheFox/) · [**Quellcode ansehen**](https://github.com/TheonlyTazz/MatheFox)

</div>

MatheFox verwandelt das Üben für die Mathearbeit in kleine Quests: Kinder rechnen in kurzen Einheiten, bekommen sofort verständliches Feedback und sammeln dabei XP, Streaks und Abzeichen. Die App läuft vollständig statisch und offline-freundlich auf GitHub Pages — ohne Backend und ohne Konto.

## Highlights

- 📚 Übungsmodus mit dauerhaftem Fragenpool und unbegrenzten Wiederholungen
- 📅 Tägliche Mathe-Challenge im Wordle-Stil mit 10 deterministisch generierten Aufgaben
- 🔁 Jeden Tag neue Zahlen, Rechenwege und Aufgabenvarianten
- 🧪 Prüfungs-Simulator mit 15 gemischten Aufgaben und Zeitlimit
- 🧠 Schwerpunkte für die Mathearbeit am 29.09.2026:
  Klammern, Kommazahlen, Uhrzeiten, Preise und Fachbegriffe
- 🌱 Evergreen-Themen: Grundrechenarten, Geometrie und Sachaufgaben
- 🏆 XP, Level, Lern-Streaks und Abzeichen wie „Zeit-Meisterin“ und „Klammer-Profi“
- ✏️ Mobiler Schmierzettel mit Touch- und Maus-Unterstützung
- 🔊 Kleine Web-Audio-Erfolge und Konfetti-Momente
- 💾 Fortschritt wird lokal im Browser gespeichert

## Tägliche Challenge

Die Tages-Challenge erzeugt jeden Tag ein neues Set aus zehn Fragen. Das Datum dient als Seed für einen kleinen Zufallsgenerator. Dadurch gilt:

- Alle Kinder bekommen am selben Tag dieselben Aufgaben.
- Am nächsten Tag entstehen neue Zahlen und Varianten.
- Ein erneutes Öffnen am selben Tag setzt die Challenge nicht zurück.
- Antworten werden lokal gespeichert und jede Aufgabe kann nur einmal abgegeben werden.

Die Generierung ist komplett offline und benötigt keine API oder zentrale Datenbank.

## Lokal starten

Voraussetzungen: Node.js 20 oder neuer und npm.

```bash
npm install
npm run dev
```

Danach die von Vite ausgegebene lokale URL öffnen.

## Build und Vorschau

```bash
npm run build
npm run preview
```

Der Build prüft zuerst die TypeScript-Typen und erzeugt anschließend das Produktionspaket in `dist`.

## GitHub Pages

Die App ist für GitHub Pages mit einem relativen Vite-Basispfad (`./`) konfiguriert. Jeder Push auf `main` startet den Workflow [`deploy.yml`](.github/workflows/deploy.yml), baut die App und veröffentlicht `dist`.

Live-Adresse:

```text
https://theonlytazz.github.io/MatheFox/
```

## Architektur

Die App ist als kleine, erweiterbare Vue-Anwendung aufgebaut:

```text
src/
├── components/       Wiederverwendbare UI-Bausteine
├── data/
│   ├── tests/        Testmodule und Registry
│   ├── exercises.ts  Statischer Übungspool
│   └── dailyChallenge.ts
├── services/         StorageAdapter und Audio-Feedback
├── stores/           Pinia-Stores für Fortschritt und Tages-Challenge
├── types/            Gemeinsame TypeScript-Typen
└── views/            Dashboard, Üben, Challenge und Simulator
```

### Neue Testmodule hinzufügen

Testdaten liegen getrennt von der Oberfläche. Für eine neue Mathearbeit:

1. Eine neue Datei unter `src/data/tests/` anlegen.
2. Ein `MathTestModule` mit den passenden Übungen definieren.
3. Das Modul in `src/data/tests/index.ts` registrieren.

Die UI kann dadurch weitere Tests und Themen nutzen, ohne dass die Aufgabenlogik in den Views dupliziert werden muss.

### Speicherung

Der `StorageAdapter` kapselt den lokalen Speicher. Er kann später durch einen Adapter für Supabase oder einen anderen Sync-Dienst ersetzt werden, ohne dass die Pinia-Stores oder die Oberfläche ihre Schnittstellen ändern müssen.

## Technologie

`Vue 3` · `TypeScript` · `Vite` · `Pinia` · `Tailwind CSS` · `Lucide` · `canvas-confetti`

## Hinweis

MatheFox ist ein persönliches Lernprojekt für die Vorbereitung auf eine Mathearbeit. Die Inhalte sind für die Klassenstufen 4/5 gedacht und ersetzen keine individuelle Betreuung oder den Unterricht.
