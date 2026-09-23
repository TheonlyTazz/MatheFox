import { choiceExercise, factory, numberExercise, randomInt, topic } from './helpers'
import type { GradeCatalog } from '../../types/curriculum'

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
]

export const grade2: GradeCatalog = { grade, title: 'Klasse 2', topics }
