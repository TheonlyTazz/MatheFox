import { choiceExercise, factory, numberExercise, randomInt, topic } from './helpers'
import type { ExerciseAnswer, GradeCatalog } from '../../types/curriculum'

const grade = 2 as const
const pick = <T>(values: readonly T[], index: number): T => {
  const value = values[index]
  if (value === undefined) throw new Error(`Grade 2 catalog index out of bounds: ${index}`)
  return value
}
const topics = [
  topic(grade, 'g2_zahlenraum_100', 'Zahlenraum bis 100', 'Zehner, Einer und Ausschnitte der Hundertertafel.', '💯', [
    factory((s) => { const n = randomInt(s, 10, 99); return numberExercise(grade, 'g2_zahlenraum_100', 'Zehner und Einer', `Wie viele Zehner hat ${n}?`, Math.floor(n / 10), s) }),
    factory((s) => { const n = randomInt(s, 10, 99); return numberExercise(grade, 'g2_zahlenraum_100', 'Einer bestimmen', `Wie viele Einer hat ${n}?`, n % 10, s) }),
    factory((s) => { const n = randomInt(s, 11, 89); return numberExercise(grade, 'g2_zahlenraum_100', 'Hundertertafel', `Welche Zahl steht eine Zeile darunter: ${n}?`, n + 10, s) }),
  ]),
  topic(grade, 'g2_einmaleins', 'Kleines Einmaleins', '2er, 3er, 4er, 5er und 10er Reihen sowie Tauschaufgaben.', '✖️', [
    factory((s) => { const a = pick([2, 3, 4, 5, 10] as const, randomInt(s, 0, 4)); const b = randomInt(s + 1, 1, 10); return numberExercise(grade, 'g2_einmaleins', 'Mal-Reihe', `Rechne: ${a} · ${b}`, a * b, s) }),
    factory((s) => { const a = randomInt(s, 6, 10); const b = randomInt(s + 1, 2, 5); return choiceExercise(grade, 'g2_einmaleins', 'Tauschaufgabe', `Welche Malaufgabe vertauscht die Faktoren von ${a} · ${b}?`, [`${b} · ${a}`, `${a} + ${b}`, `${a} · ${b + 1}`], `${b} · ${a}`, s) }),
  ]),
  topic(grade, 'g2_halbschriftlich', 'Halbschriftlich rechnen', 'Plus und Minus mit Zehnerübergang bis 100.', '🧮', [
    factory((s) => { const a = randomInt(s, 30, 89); const b = randomInt(s + 1, 11, 100 - a); return numberExercise(grade, 'g2_halbschriftlich', 'Plus bis 100', `Rechne: ${a} + ${b}`, a + b, s) }),
    factory((s) => { const a = randomInt(s, 30, 99); const b = randomInt(s + 1, 11, a); return numberExercise(grade, 'g2_halbschriftlich', 'Minus bis 100', `Rechne: ${a} − ${b}`, a - b, s) }),
  ]),
  topic(grade, 'g2_uhrzeit_zeitspannen', 'Uhrzeit und Längen', 'Viertelstunden, 5-Minuten-Takt sowie cm und m.', '📏', [
    factory((s) => { const minute = randomInt(s, 0, 11) * 5; return { id: `g2_uhrzeit_zeitspannen-clock-${s}`, topicId: 'g2_uhrzeit_zeitspannen', grade, title: 'Uhr einstellen', instruction: `Stelle die Uhr auf 3:${String(minute).padStart(2, '0')} Uhr.`, type: 'clock-interactive' as const, data: { hour: 3, minute, format: 'analog' as const }, xpReward: 10, validate: (value: import('../../types/curriculum').ExerciseAnswer) => value === `3:${String(minute).padStart(2, '0')}` } }),
    factory((s) => { const hour = randomInt(s, 1, 11); return { id: `g2_uhrzeit_zeitspannen-half-${s}`, topicId: 'g2_uhrzeit_zeitspannen', grade, title: 'Halbe Stunde', instruction: `Stelle die Uhr auf halb ${hour + 1}.`, type: 'clock-interactive' as const, data: { hour, minute: 30, format: 'analog' as const }, xpReward: 10, validate: (value: import('../../types/curriculum').ExerciseAnswer) => value === `${hour}:30` } }),
    factory((s) => { const hour = randomInt(s, 1, 11); const quarter = randomInt(s + 1, 0, 1) === 0 ? 15 : 45; return { id: `g2_uhrzeit_zeitspannen-quarter-${s}`, topicId: 'g2_uhrzeit_zeitspannen', grade, title: 'Viertelstunde', instruction: `Stelle die Uhr auf ${hour}:${String(quarter).padStart(2, '0')} Uhr.`, type: 'clock-interactive' as const, data: { hour, minute: quarter, format: 'analog' as const }, xpReward: 10, validate: (value: import('../../types/curriculum').ExerciseAnswer) => value === `${hour}:${quarter}` } }),
    factory((s) => { const metres = randomInt(s, 1, 9); return numberExercise(grade, 'g2_uhrzeit_zeitspannen', 'Längen umrechnen', `${metres} m sind wie viele cm?`, metres * 100, s, '1 m sind 100 cm.') }),
  ]),
  topic(grade, 'g2_geometrie_symmetrie', 'Symmetrie und Körper', 'Symmetrieachsen, Würfel und Kugel erkennen.', '⬛', [
    factory((s) => choiceExercise(grade, 'g2_geometrie_symmetrie', 'Symmetrie-Detektiv', 'Wie viele Symmetrieachsen hat ein Quadrat?', ['1', '2', '4'], '4', s)),
    factory((s) => choiceExercise(grade, 'g2_geometrie_symmetrie', 'Körper-Detektiv', 'Welcher Körper ist rund?', ['Würfel', 'Kugel', 'Quader'], 'Kugel', s)),
  ]),
  topic(grade, 'g2_rechenvorteile', 'Rechenvorteile', 'Nachbaraufgaben sowie Tausch- und Umkehraufgaben geschickt nutzen.', '🧠', [
    factory((s) => { const a = randomInt(s, 2, 8); const b = randomInt(s + 1, 2, 9); const neighbor = a * (b - 1); return numberExercise(grade, 'g2_rechenvorteile', 'Nachbaraufgabe', `Die Nachbaraufgabe ${a} · ${b - 1} = ${neighbor} hilft. Wie viel ist ${a} · ${b}?`, a * b, s) }),
    factory((s) => { const a = randomInt(s, 2, 9); const b = randomInt(s + 1, 2, 9); return choiceExercise(grade, 'g2_rechenvorteile', 'Tauschaufgabe', `Welche Aufgabe ist die Tauschaufgabe zu ${a} · ${b}?`, [`${b} · ${a}`, `${a} + ${b}`, `${a} · ${b + 1}`], `${b} · ${a}`, s) }),
    factory((s) => { const result = randomInt(s, 3, 18); const part = randomInt(s + 1, 1, result - 1); return numberExercise(grade, 'g2_rechenvorteile', 'Umkehraufgabe', `Welche Zahl fehlt: ${part} + ? = ${result}?`, result - part, s) }),
  ]),
  topic(grade, 'g2_gerade_ungerade', 'Gerade und ungerade Zahlen', 'Sortierquests für Zahlen bis 100: gerade oder ungerade?', '⚖️', [
    factory((s) => { const n = randomInt(s, 0, 50) * 2; return choiceExercise(grade, 'g2_gerade_ungerade', 'Zahlensortierung', `Ist ${n} gerade oder ungerade?`, ['gerade', 'ungerade'], 'gerade', s) }),
    factory((s) => { const n = randomInt(s, 0, 49) * 2 + 1; return choiceExercise(grade, 'g2_gerade_ungerade', 'Zahlensortierung', `Ist ${n} gerade oder ungerade?`, ['gerade', 'ungerade'], 'ungerade', s) }),
    factory((s) => { const n = randomInt(s, 10, 99); const answer = n % 2 === 0 ? 'gerade' : 'ungerade'; return choiceExercise(grade, 'g2_gerade_ungerade', 'Sortierquest', `In welchen Korb gehört ${n}?`, ['gerade', 'ungerade'], answer, s) }),
  ]),
  topic(grade, 'g2_kalender_zeit', 'Kalender und Zeit', 'Wochentage, Monate sowie Datum lesen und berechnen.', '📅', [
    factory((s) => { const days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'] as const; const index = randomInt(s, 0, 6); return choiceExercise(grade, 'g2_kalender_zeit', 'Wochentage', `Welcher Tag kommt nach ${days[index]}?`, [...days], days[(index + 1) % 7], s) }),
    factory((s) => { const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'] as const; const index = randomInt(s, 0, 10); return choiceExercise(grade, 'g2_kalender_zeit', 'Monate', `Welcher Monat kommt nach ${months[index]}?`, [...months], months[index + 1], s) }),
    factory((s) => { const day = randomInt(s, 1, 25); return numberExercise(grade, 'g2_kalender_zeit', 'Datum berechnen', `Heute ist der ${day}. Juni. Welcher Tag ist in 3 Tagen?`, day + 3, s) }),
  ]),
  topic(grade, 'g2_kombinatorik_einstieg', 'Kombinatorik-Einstieg', 'Finde alle Möglichkeiten mit 2 Hosen und 3 T-Shirts.', '👕', [
    factory((s) => { const groups = [{ label: 'Hosen', options: ['blau', 'rot'] }, { label: 'T-Shirts', options: ['gelb', 'grün', 'weiß'] }]; return { id: `g2_kombinatorik_einstieg-count-${s}`, topicId: 'g2_kombinatorik_einstieg', grade, title: 'Kleidungs-Kombis', instruction: 'Wie viele verschiedene Outfits sind möglich?', type: 'number-input' as const, data: { answer: 6 }, visual: { kind: 'combinations' as const, groups }, xpReward: 10, validate: (value: ExerciseAnswer) => value === 6 || (typeof value === 'string' && Number(value) === 6) } }),
    factory((s) => { const groups = [{ label: 'Hosen', options: ['blau', 'rot'] }, { label: 'T-Shirts', options: ['gelb', 'grün', 'weiß'] }]; return { id: `g2_kombinatorik_einstieg-match-${s}`, topicId: 'g2_kombinatorik_einstieg', grade, title: 'Outfit wählen', instruction: 'Verbinde die blaue Hose mit dem gelben Shirt und die rote Hose mit dem weißen Shirt.', type: 'matching' as const, data: { left: ['blaue Hose', 'rote Hose'], right: ['gelbes Shirt', 'grünes Shirt', 'weißes Shirt'], pairs: [[0, 0], [1, 2]] as const }, visual: { kind: 'combinations' as const, groups }, xpReward: 10, validate: (value: ExerciseAnswer) => Array.isArray(value) && value.join(',') === '0,2' } }),
    factory((s) => { const groups = [{ label: 'Hosen', options: ['blau', 'rot'] }, { label: 'T-Shirts', options: ['gelb', 'grün', 'weiß'] }]; return { id: `g2_kombinatorik_einstieg-list-${s}`, topicId: 'g2_kombinatorik_einstieg', grade, title: 'Möglichkeiten zählen', instruction: 'Wie viele Outfits entstehen mit jeder Hose und jedem T-Shirt?', type: 'multiple-choice' as const, data: { options: ['5', '6', '8'], answer: '6' }, visual: { kind: 'combinations' as const, groups }, xpReward: 10, validate: (value: ExerciseAnswer) => value === '6' } }),
  ]),
]

export const grade2: GradeCatalog = { grade, title: 'Klasse 2', topics }
