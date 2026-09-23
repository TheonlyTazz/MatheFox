# MatheFox

<div align="center">

### 🦊 Schlau rechnen, Spass haben!

Eine mobile Lern-App für Mathematik in den Klassen 1 bis 4.

[**Live-App öffnen**](https://theonlytazz.github.io/MatheFox/) · [**Quellcode ansehen**](https://github.com/TheonlyTazz/MatheFox)

</div>

MatheFox verwandelt Matheübungen in kurze Missionen. Beim ersten Besuch wählen Kinder ihre Klasse, Themen, einen Spitznamen und einen Avatar. Aufgaben, Fortschritt und Einstellungen bleiben auf diesem Gerät. Die App läuft vollständig im Browser — ohne Backend und ohne Konto.

## Highlights

- 📚 40 Schwerpunkte in vier getrennten Klassenkatalogen
- 🎯 Gemischte Missionen nur aus den gewählten Themen sowie gezieltes Üben einzelner Themen
- 🔁 Generierte Rechenaufgaben und strukturierte Aufgaben mit Tabellen, Zuordnungen, Uhr, Zahlenmauern, Glücksrädern und Symmetrie-Gittern
- 🖐️ Interaktive Lernhilfen für Klasse 1 und 2: Zeigeruhr, Zehner-/Zwanzigerfeld, Münzen, Punktefeld, Spiegelgitter und Zahlenstrahl
- 🔊 Optionale deutsche Offline-Vorlesefunktion mit Ramona und optionalen Klängen
- ⚙️ Klassenstufe und aktive Themen jederzeit im Kopfbereich ändern
- 🧪 Prüfungs-Simulator für die Mathearbeit vom 29.09.2026 in Klasse 4, wenn alle Themen aktiv sind
- 🏆 XP, Lern-Streaks und Themen-Abzeichen
- ✏️ Mobiler Schmierzettel mit Touch- und Maus-Unterstützung
- 🔊 Kleine Web-Audio-Erfolge und Konfetti-Momente
- 💾 Fortschritt wird lokal im Browser gespeichert

## Übungen und Fortschritt

Der Übungsmodus erzeugt neue Aufgaben aus den aktiven Themen der gewählten Klasse. Eine gemischte Mission enthält zehn Aufgaben; eine Themenrunde enthält sechs. Falsche Antworten können erneut versucht werden. Nach einer vollständig gelösten Themenrunde wird ein Abzeichen freigeschaltet.

Das Profil mit Klasse, Themen, XP und Abzeichen wird automatisch im lokalen Browserspeicher gesichert. Für Klasse 4 bleibt die Probearbeit vom 29.09.2026 verfügbar.

### Vorlesen mit Ramona

Die kostenlose deutsche Stimme Ramona wird erst auf ausdrücklichen Klick geladen. Der erste Download umfasst ungefähr 95 MB für Stimme und Sprachlaufzeit. Danach erzeugt der Browser die Sprache auf dem Gerät; es gibt keinen Sprachdienst, kein Konto und keine laufenden Kosten. Der erste gesprochene Satz kann etwas länger dauern, während die Laufzeit startet. Die Stimme bleibt im lokalen Browserspeicher, solange der Browser diese Daten nicht löscht. Ohne Installation bleiben alle Übungen nutzbar.

Ramona stammt aus den [Piper-Stimmen von Rhasspy](https://huggingface.co/rhasspy/piper-voices/tree/main/de/de_DE/ramona/low). Das Training nutzte den [M-AILABS-Datensatz](https://github.com/i-celeste-aurora/m-ailabs-dataset/blob/master/README.md), dessen Nutzung eine Quellenangabe erfordert. Die Sprachausgabe im Browser nutzt [Piper TTS Web](https://github.com/Mintplex-Labs/piper-tts-web).

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

Die App ist für GitHub Pages mit dem Vite-Basispfad `/MatheFox/` konfiguriert. Jeder Push auf `main` startet den Workflow [`deploy.yml`](.github/workflows/deploy.yml), baut die App und veröffentlicht `dist`.

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
