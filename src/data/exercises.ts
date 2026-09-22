import type { Exercise } from '../types/math'

const exerciseData: Omit<Exercise, 'validate'>[] = [
  { id: 'k1', topic: 'klammern', kind: 'number', prompt: 'Rechne: (8 + 4) · 3 = ?', answer: '36', hint: 'Zuerst kommt die Klammer.', explanation: '8 + 4 = 12 und 12 · 3 = 36.', xp: 15 },
  { id: 'k2', topic: 'klammern', kind: 'choice', prompt: 'Welche Rechnung ist richtig?', options: ['5 · (2 + 3) = 25', '5 · (2 + 3) = 13', '5 · (2 + 3) = 17'], answer: '5 · (2 + 3) = 25', hint: 'Klammer zuerst, dann mal.', explanation: '2 + 3 = 5 und 5 · 5 = 25.', xp: 15 },
  { id: 'g1', topic: 'grundrechenarten', kind: 'number', prompt: 'Rechne: 7 · 8 = ?', answer: '56', hint: 'Denke an die 7er-Reihe.', explanation: '7 · 8 = 56.', xp: 10 },
  { id: 'g2', topic: 'grundrechenarten', kind: 'choice', prompt: 'Welche Zahl fehlt? 81 : 9 = ?', options: ['7', '8', '9'], answer: '9', hint: '9 · 9 ergibt 81.', explanation: '81 geteilt durch 9 ist 9.', xp: 10 },
  { id: 'z1', topic: 'zeit', kind: 'choice', prompt: 'Wie viele Minuten hat eine Stunde?', options: ['30', '60', '100'], answer: '60', hint: 'Eine halbe Stunde hat 30 Minuten.', explanation: 'Eine Stunde besteht aus 60 Minuten.', xp: 10 },
  { id: 'z2', topic: 'zeit', kind: 'number', prompt: 'Der Bus fährt um 14:20 Uhr los und braucht 35 Minuten. Ankunft?', answer: '14:55', hint: 'Addiere 35 Minuten.', explanation: '20 + 35 = 55 Minuten, also 14:55 Uhr.', xp: 15 },
  { id: 'p1', topic: 'preise', kind: 'number', prompt: '2,50 € + 1,20 € = ?', answer: '3,70', hint: 'Rechne Euro und Cent getrennt.', explanation: '2 Euro 50 plus 1 Euro 20 sind 3 Euro 70.', xp: 15 },
  { id: 'p2', topic: 'preise', kind: 'choice', prompt: 'Was ist mehr?', options: ['0,99 €', '1,09 €', '1,00 €'], answer: '1,09 €', hint: 'Vergleiche zuerst die Euro.', explanation: '1,09 Euro ist mehr als 1,00 Euro und 0,99 Euro.', xp: 10 },
  { id: 'f1', topic: 'fachbegriffe', kind: 'choice', prompt: 'Wie heißt das Ergebnis einer Plusaufgabe?', options: ['Summe', 'Differenz', 'Produkt'], answer: 'Summe', hint: 'Plus ergibt eine ...', explanation: 'Das Ergebnis der Addition heißt Summe.', xp: 10 },
  { id: 'f2', topic: 'fachbegriffe', kind: 'choice', prompt: 'Wie heißt das Ergebnis einer Malaufgabe?', options: ['Quotient', 'Produkt', 'Summe'], answer: 'Produkt', hint: 'Malnehmen nennt man auch multiplizieren.', explanation: 'Das Ergebnis einer Multiplikation heißt Produkt.', xp: 10 },
  { id: 's1', topic: 'schriftlich_komma', kind: 'number', prompt: 'Rechne: 4,5 + 2,35 = ?', answer: '6,85', hint: 'Setze die Kommas untereinander.', explanation: '4,50 + 2,35 = 6,85.', xp: 15 },
  { id: 's2', topic: 'schriftlich_komma', kind: 'number', prompt: 'Rechne: 9,00 - 3,75 = ?', answer: '5,25', hint: 'Ergänze Nullen und rechne stellengerecht.', explanation: '9,00 - 3,75 = 5,25.', xp: 15 },
  { id: 'geo1', topic: 'geometrie', kind: 'choice', prompt: 'Wie viele Ecken hat ein Rechteck?', options: ['3', '4', '5'], answer: '4', hint: 'Male ein Rechteck in die Luft.', explanation: 'Ein Rechteck hat vier Ecken.', xp: 10 },
  { id: 'geo2', topic: 'geometrie', kind: 'number', prompt: 'Ein Quadrat hat eine Seitenlänge von 5 cm. Wie gross ist sein Umfang?', answer: '20', hint: 'Ein Quadrat hat vier gleich lange Seiten.', explanation: '4 · 5 cm = 20 cm.', xp: 15 },
  { id: 'sa1', topic: 'sachaufgaben', kind: 'number', prompt: 'Foxi hat 24 Nüsse und verteilt sie gleich auf 4 Körbe. Wie viele pro Korb?', answer: '6', hint: 'Teile 24 durch 4.', explanation: '24 : 4 = 6 Nüsse pro Korb.', xp: 15 },
  { id: 'sa2', topic: 'sachaufgaben', kind: 'number', prompt: 'Im Regal stehen 3 Reihen mit je 8 Büchern. Wie viele Bücher sind es?', answer: '24', hint: 'Mehrere gleiche Gruppen: malnehmen.', explanation: '3 · 8 = 24 Bücher.', xp: 15 },
]

const normalizeAnswer = (value: string): string => value.trim().toLowerCase().replace(',', '.').replace(/\s+/g, '')

export const exercises: Exercise[] = exerciseData.map((exercise) => ({
  ...exercise,
  validate: (input: string): boolean => normalizeAnswer(input) === normalizeAnswer(exercise.answer),
}))
