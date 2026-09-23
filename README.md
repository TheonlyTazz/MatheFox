# MatheFox

<div align="center">

### 🦊 Schlau rechnen, Spass haben!

Eine mobile Lern-App für Mathematik in den Klassen 1 bis 4.

[**Live-App öffnen**](https://theonlytazz.github.io/MatheFox/) · [**Quellcode ansehen**](https://github.com/TheonlyTazz/MatheFox)

</div>

MatheFox verwandelt Matheübungen in kurze Missionen. Beim ersten Besuch wählen Kinder ihre Klasse, Themen, einen Spitznamen und einen Avatar. Aufgaben, Fortschritt und Einstellungen bleiben auf diesem Gerät. Die App läuft vollständig im Browser — ohne Backend und ohne Konto.

## Highlights

- 📚 22 Schwerpunkte in vier getrennten Klassenkatalogen
- 🎯 Gemischte Missionen nur aus den gewählten Themen sowie gezieltes Üben einzelner Themen
- 🔁 Generierte Rechenaufgaben und strukturierte Aufgaben mit Tabellen, Zuordnungen, Uhr und Formen
- ⚙️ Klassenstufe und aktive Themen jederzeit im Kopfbereich ändern
- 🧪 Prüfungs-Simulator für die Mathearbeit vom 29.09.2026 in Klasse 4, wenn alle Themen aktiv sind
- 🏆 XP, Lern-Streaks und Themen-Abzeichen
- ✏️ Mobiler Schmierzettel mit Touch- und Maus-Unterstützung
- 🔊 Kleine Web-Audio-Erfolge und Konfetti-Momente
- 💾 Fortschritt wird lokal im Browser gespeichert

## Übungen und Fortschritt

Der Übungsmodus erzeugt neue Aufgaben aus den aktiven Themen der gewählten Klasse. Eine gemischte Mission enthält zehn Aufgaben; eine Themenrunde enthält sechs. Falsche Antworten können erneut versucht werden. Nach einer vollständig gelösten Themenrunde wird ein Abzeichen freigeschaltet.

Das Profil mit Klasse, Themen, XP und Abzeichen wird automatisch im lokalen Browserspeicher gesichert. Für Klasse 4 bleibt die Probearbeit vom 29.09.2026 verfügbar.

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
├── components/       Wizard, Kopfbereich, Übungs-Widgets und Schmierzettel
├── data/
│   ├── grades/       Getrennte Kataloge für Klassen 1 bis 4
│   └── tests/        Bestehende Mathearbeit für Klasse 4
├── services/         Audio-Feedback und Browser-Helfer
├── stores/           Pinia-Profil und bestehende Prüfungsdaten
├── types/            Typen für Kataloge und Aufgaben
└── views/            Dashboard, Üben und Simulator
```

### Neue Testmodule hinzufügen

Testdaten liegen getrennt von der Oberfläche. Für eine neue Mathearbeit:

1. Eine neue Datei unter `src/data/tests/` anlegen.
2. Ein `MathTestModule` mit den passenden Übungen definieren.
3. Das Modul in `src/data/tests/index.ts` registrieren.

Neue Übungsthemen werden im Katalog der passenden Klasse unter `src/data/grades/` ergänzt. Die Oberfläche liest den Katalog über `getGradeCatalog()`.

### Speicherung

Der Profil-Store speichert Änderungen automatisch in `localStorage`. Die Anwendung benötigt keinen externen Dienst.

## Technologie

`Vue 3` · `TypeScript` · `Vite` · `Pinia` · `Tailwind CSS` · `Lucide` · `canvas-confetti`

## Hinweis

MatheFox ist ein persönliches Lernprojekt für die Klassen 1 bis 4 und ersetzt keine individuelle Betreuung oder den Unterricht.
