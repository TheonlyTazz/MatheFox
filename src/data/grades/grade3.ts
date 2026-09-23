import { choiceExercise, factory, numberExercise, randomInt, topic } from './helpers'
import type { GradeCatalog } from '../../types/curriculum'

const grade = 3 as const
const topics = [
  topic(grade, 'g3_zahlenraum_1000', 'Zahlenraum bis 1000', 'Hunderter, Zehner, Einer und Runden.', '🔢', [
    factory((s) => { const n = randomInt(s, 100, 999); return numberExercise(grade, 'g3_zahlenraum_1000', 'Hunderter bestimmen', `Wie viele Hunderter hat ${n}?`, Math.floor(n / 100), s) }),
    factory((s) => { const n = randomInt(s, 100, 999); return numberExercise(grade, 'g3_zahlenraum_1000', 'Zehner bestimmen', `Welche Ziffer steht bei ${n} an der Zehnerstelle?`, Math.floor(n / 10) % 10, s) }),
    factory((s) => { const n = randomInt(s, 100, 999); return numberExercise(grade, 'g3_zahlenraum_1000', 'Einer bestimmen', `Wie viele Einer hat ${n}?`, n % 10, s) }),
    factory((s) => { const n = randomInt(s, 100, 999); return numberExercise(grade, 'g3_zahlenraum_1000', 'Runde auf Zehner', `Runde ${n} auf den nächsten Zehner.`, Math.round(n / 10) * 10, s) }),
    factory((s) => { const n = randomInt(s, 100, 899); return numberExercise(grade, 'g3_zahlenraum_1000', 'Runde auf Hunderter', `Runde ${n} auf den nächsten Hunderter.`, Math.round(n / 100) * 100, s) }),
  ]),
  topic(grade, 'g3_schriftlich_plus_minus', 'Schriftlich plus und minus', 'Rechnen mit Übertrag und Entbündeln.', '📝', [
    factory((s) => { const a = randomInt(s, 200, 899); const b = randomInt(s + 2, 100, 999 - a); return numberExercise(grade, 'g3_schriftlich_plus_minus', 'Addition mit Übertrag', `Rechne schriftlich: ${a} + ${b}`, a + b, s) }),
    factory((s) => { const a = randomInt(s, 400, 999); const b = randomInt(s + 2, 101, a - 1); return numberExercise(grade, 'g3_schriftlich_plus_minus', 'Subtraktion mit Entbündeln', `Rechne schriftlich: ${a} − ${b}`, a - b, s) }),
  ]),
  topic(grade, 'g3_multiplikation_division', 'Multiplikation und Division', 'Großes Einmaleins und Division mit Rest.', '➗', [
    factory((s) => { const a = randomInt(s, 12, 49); const b = randomInt(s + 1, 2, 9); return numberExercise(grade, 'g3_multiplikation_division', 'Großes Einmaleins', `Rechne: ${a} · ${b}`, a * b, s) }),
    factory((s) => { const divisor = randomInt(s, 3, 9); const quotient = randomInt(s + 1, 4, 12); const rest = randomInt(s + 2, 1, divisor - 1); const dividend = divisor * quotient + rest; return choiceExercise(grade, 'g3_multiplikation_division', 'Teilen mit Rest', `Was ist ${dividend} : ${divisor}?`, [`${quotient} R ${rest}`, `${quotient + 1} R 0`, `${quotient} R ${rest + 1}`], `${quotient} R ${rest}`, s) }),
  ]),
  topic(grade, 'g3_groessen_einheiten', 'Größen und Einheiten', 'Gewichte, Längen und Zeitspannen umrechnen.', '⚖️', [
    factory((s) => { const kg = randomInt(s, 2, 9); return numberExercise(grade, 'g3_groessen_einheiten', 'Gewichte', `${kg} kg sind wie viele Gramm?`, kg * 1000, s) }),
    factory((s) => { const metres = randomInt(s, 2, 9); return numberExercise(grade, 'g3_groessen_einheiten', 'Längen', `${metres} m sind wie viele cm?`, metres * 100, s) }),
    factory((s) => { const centimetres = randomInt(s, 2, 9); return numberExercise(grade, 'g3_groessen_einheiten', 'Millimeter', `${centimetres} cm sind wie viele mm?`, centimetres * 10, s) }),
    factory((s) => { const kilometres = randomInt(s, 2, 9); return numberExercise(grade, 'g3_groessen_einheiten', 'Kilometer', `${kilometres} km sind wie viele m?`, kilometres * 1000, s) }),
    factory((s) => { const hours = randomInt(s, 2, 8); return numberExercise(grade, 'g3_groessen_einheiten', 'Zeitspannen', `${hours} h sind wie viele Minuten?`, hours * 60, s) }),
    factory((s) => { const minutes = randomInt(s, 2, 9); return numberExercise(grade, 'g3_groessen_einheiten', 'Sekunden', `${minutes} min sind wie viele Sekunden?`, minutes * 60, s) }),
  ]),
  topic(grade, 'g3_geometrie_koerper', 'Geometrie und Körper', 'Rechte Winkel, Würfelnetze und Umfänge.', '📐', [
    factory((s) => choiceExercise(grade, 'g3_geometrie_koerper', 'Winkel-Detektiv', 'Welche Form hat vier rechte Winkel?', ['Dreieck', 'Rechteck', 'Kreis'], 'Rechteck', s)),
    factory((s) => choiceExercise(grade, 'g3_geometrie_koerper', 'Würfelnetz', 'Wie viele Quadrate braucht ein Würfelnetz?', ['4', '6', '8'], '6', s)),
    factory((s) => { const side = randomInt(s, 3, 12); return numberExercise(grade, 'g3_geometrie_koerper', 'Umfang', `Ein Quadrat hat Seite ${side} cm. Wie groß ist sein Umfang?`, side * 4, s) }),
  ]),
]

export const grade3: GradeCatalog = { grade, title: 'Klasse 3', topics }
