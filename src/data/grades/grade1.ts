import { choiceExercise, factory, numberExercise, randomInt, topic } from './helpers'
import type { GradeCatalog } from '../../types/curriculum'

const grade = 1 as const
const numberTopic = 'g1_zahlenraum_20'
const arithmeticTopic = 'g1_addition_subtraktion'
const pick = <T>(values: readonly T[], index: number): T => {
  const value = values[index]
  if (value === undefined) throw new Error(`Grade 1 catalog index out of bounds: ${index}`)
  return value
}
const topics = [
  topic(grade, numberTopic, 'Zahlenraum bis 20', 'Zählen, vergleichen sowie Vorgänger und Nachfolger.', '🔢', [
    factory((s) => { const a = randomInt(s, 0, 19); const b = randomInt(s + 1, a + 1, 20); return choiceExercise(grade, numberTopic, 'Zahlen-Detektiv', `Welche Zahl ist größer: ${a} oder ${b}?`, [String(a), String(b)], String(b), s) }),
    factory((s) => { const a = randomInt(s, 1, 19); const relation = randomInt(s + 1, 0, 2); const b = relation === 0 ? a + 1 : relation === 1 ? a : a - 1; const symbol = relation === 0 ? '<' : relation === 1 ? '=' : '>'; return choiceExercise(grade, numberTopic, 'Vergleichen', `Setze ein: ${a} __ ${b}`, ['<', '>', '='], symbol, s) }),
    factory((s) => { const n = randomInt(s, 1, 19); return numberExercise(grade, numberTopic, 'Vorgänger', `Welche Zahl kommt vor ${n}?`, n - 1, s) }),
    factory((s) => { const n = randomInt(s, 0, 19); return numberExercise(grade, numberTopic, 'Nachfolger', `Welche Zahl kommt nach ${n}?`, n + 1, s) }),
  ]),
  topic(grade, arithmeticTopic, 'Plus und Minus bis 20', 'Rechnen bis 10 und bis 20 mit Zehnerübergang.', '➕', [
    factory((s) => { const a = randomInt(s, 0, 9); const b = randomInt(s + 1, 0, 10 - a); return numberExercise(grade, arithmeticTopic, 'Plus bis 10', `Rechne: ${a} + ${b}`, a + b, s) }),
    factory((s) => { const a = randomInt(s, 6, 9); const b = randomInt(s + 1, 11 - a, 10); return numberExercise(grade, arithmeticTopic, 'Plus mit Zehnerübergang', `Rechne: ${a} + ${b}`, a + b, s, 'Zerlege die zweite Zahl bis zur 10.') }),
    factory((s) => { const a = randomInt(s, 11, 19); const b = randomInt(s + 1, a - 9, 10); return numberExercise(grade, arithmeticTopic, 'Minus mit Zehnerübergang', `Rechne: ${a} − ${b}`, a - b, s, 'Rechne zuerst bis zum Zehner zurück.') }),
  ]),
  topic(grade, 'g1_uhrzeit_geld', 'Uhrzeit und Geld', 'Volle Stunden und Euro- und Cent-Münzen zuordnen.', '⏰', [
    factory((s) => { const hour = randomInt(s, 1, 12); return { id: `g1_uhrzeit_geld-clock-${s}`, topicId: 'g1_uhrzeit_geld', grade, title: 'Volle Stunde', instruction: `Stelle die Uhr auf ${hour} Uhr.`, type: 'clock-interactive' as const, data: { hour, minute: 0, format: 'analog' as const }, xpReward: 10, validate: (value: import('../../types/curriculum').ExerciseAnswer) => value === `${hour}:00` } }),
    factory((s) => { const cents = pick([1, 5, 10] as const, randomInt(s, 0, 2)); const double = cents * 2; const distractors = [1, 2, 5, 10, 20, 50].filter((value) => value !== double).slice(0, 2); const options = [...distractors.map((value) => `${value} Cent`), `${double} Cent`]; return choiceExercise(grade, 'g1_uhrzeit_geld', 'Münzen-Detektiv', `Welche Münze ist doppelt so viel wert wie die ${cents}-Cent-Münze?`, options, `${double} Cent`, s) }),
    factory((s) => { const cents = pick([1, 2, 5, 10, 20, 50] as const, randomInt(s, 0, 5)); return numberExercise(grade, 'g1_uhrzeit_geld', 'Euro und Cent', `Wie viele Cent sind 1 Euro und ${cents} Cent zusammen?`, 100 + cents, s) }),
  ]),
  topic(grade, 'g1_geometrie_formen', 'Formen', 'Kreis, Dreieck, Quadrat und Rechteck erkennen.', '🔺', [
    factory((s) => { const shapes = ['Kreis', 'Dreieck', 'Quadrat', 'Rechteck'] as const; const clues = ['Welche Form hat keine Ecken?', 'Welche Form hat genau drei Ecken?', 'Welche Form hat vier gleich lange Seiten?', 'Welche Form hat vier Ecken sowie zwei lange und zwei kurze Seiten?'] as const; const index = randomInt(s, 0, shapes.length - 1); return choiceExercise(grade, 'g1_geometrie_formen', 'Formen-Detektiv', pick(clues, index), [...shapes], pick(shapes, index), s) }),
    factory((s) => choiceExercise(grade, 'g1_geometrie_formen', 'Seiten zählen', 'Welche Form hat drei Ecken?', ['Kreis', 'Dreieck', 'Quadrat', 'Rechteck'], 'Dreieck', s)),
  ]),
]

export const grade1: GradeCatalog = { grade, title: 'Klasse 1', topics }
