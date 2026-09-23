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
  topic(grade, 'g3_ueberschlag_runden', 'Überschlag und Runden', 'Runde auf Zehner oder Hunderter und schätze Ergebnisse geschickt.', '🎯', [
    factory((s) => { const n = randomInt(s, 101, 998); return numberExercise(grade, 'g3_ueberschlag_runden', 'Zehner-Runde', `Runde ${n} auf Zehner.`, Math.round(n / 10) * 10, s) }),
    factory((s) => { const n = randomInt(s, 101, 998); return numberExercise(grade, 'g3_ueberschlag_runden', 'Hunderter-Runde', `Runde ${n} auf Hunderter.`, Math.round(n / 100) * 100, s + 1000) }),
    factory((s) => { const a = randomInt(s, 120, 480); const b = randomInt(s + 1, 120, 480); return numberExercise(grade, 'g3_ueberschlag_runden', 'Überschlag', `Schätze ${a} + ${b} durch Runden auf Hunderter.`, Math.round(a / 100) * 100 + Math.round(b / 100) * 100, s + 2000) }),
  ]),
  topic(grade, 'g3_zahlenfolgen', 'Zahlenfolgen und Bildungsregeln', 'Entdecke Regeln und ergänze Zahlenfolgen bis 1.000.', '🔁', [
    factory((s) => { const start = randomInt(s, 80, 220); const step = randomInt(s + 1, 10, 40); return numberExercise(grade, 'g3_zahlenfolgen', 'Plus-Regel', `Setze fort: ${start}, ${start + step}, ${start + step * 2}, __`, start + step * 3, s) }),
    factory((s) => { const start = randomInt(s, 700, 900); const step = randomInt(s + 1, 10, 40); return numberExercise(grade, 'g3_zahlenfolgen', 'Minus-Regel', `Setze fort: ${start}, ${start - step}, ${start - step * 2}, __`, start - step * 3, s + 1000) }),
    factory((s) => { const start = randomInt(s, 2, 8); const factor = randomInt(s + 1, 2, 4); return numberExercise(grade, 'g3_zahlenfolgen', 'Mal-Regel', `Setze fort: ${start}, ${start * factor}, ${start * factor * factor}, __`, start * factor * factor * factor, s + 2000) }),
  ]),
  topic(grade, 'g3_wahrscheinlichkeit', 'Wahrscheinlichkeit', 'Beschreibe Glücksräder mit sicher, möglich und unmöglich.', '🎡', [
    factory((s) => choiceExercise(grade, 'g3_wahrscheinlichkeit', 'Sicher oder möglich?', 'Das Glücksrad hat nur rote Felder. Welche Aussage stimmt?', ['Rot ist sicher.', 'Rot ist unmöglich.', 'Rot ist möglich, aber nicht sicher.'], 'Rot ist sicher.', s)),
    factory((s) => ({ id: `g3_wahrscheinlichkeit-${s + 1000}`, topicId: 'g3_wahrscheinlichkeit', grade, title: 'Glücksrad lesen', instruction: 'Auf dem Rad sind rote und blaue Felder. Blau zu drehen ist …', type: 'multiple-choice', data: { options: ['sicher', 'möglich', 'unmöglich'], answer: 'möglich' }, visual: { kind: 'wheel', sectors: [{ label: 'Rot', color: '#ef4444' }, { label: 'Blau', color: '#3b82f6' }, { label: 'Rot', color: '#ef4444' }] }, xpReward: 10, validate: (value) => value === 'möglich' })),
    factory((s) => ({ id: `g3_wahrscheinlichkeit-${s + 2000}`, topicId: 'g3_wahrscheinlichkeit', grade, title: 'Unmögliches Feld', instruction: 'Das Glücksrad hat kein grünes Feld. Grün zu drehen ist …', type: 'multiple-choice', data: { options: ['sicher', 'möglich', 'unmöglich'], answer: 'unmöglich' }, visual: { kind: 'wheel', sectors: [{ label: 'Gelb', color: '#facc15' }, { label: 'Orange', color: '#fb923c' }] }, xpReward: 10, validate: (value) => value === 'unmöglich' })),
  ]),
  topic(grade, 'g3_rechenmauern', 'Rechenmauern', 'Fülle drei- und vierstöckige Zahlenmauern durch Addieren aus.', '🧱', [
    factory((s) => { const bottom = [randomInt(s, 1, 9), randomInt(s + 1, 1, 9), randomInt(s + 2, 1, 9)]; const top = [bottom[0] + bottom[1], bottom[1] + bottom[2]]; const root = top[0] + top[1]; return { id: `g3_rechenmauern-${s}`, topicId: 'g3_rechenmauern', grade, title: 'Dreier-Mauer', instruction: 'Fülle die leeren Steine aus: Jeder Stein ist die Summe der beiden darunter.', type: 'number-wall', data: { rows: [[null], [null, null], bottom], answers: [root, top[0], top[1]] }, xpReward: 15, validate: (value) => Array.isArray(value) && value.length === 3 && value[0] === root && value[1] === top[0] && value[2] === top[1] } }),
    factory((s) => { const bottom = [randomInt(s, 1, 8), randomInt(s + 1, 1, 8), randomInt(s + 2, 1, 8), randomInt(s + 3, 1, 8)]; const row2 = bottom.slice(0, 3).map((value, index) => value + bottom[index + 1]); const row3 = [row2[0] + row2[1], row2[1] + row2[2]]; const root = row3[0] + row3[1]; const answers = [root, row3[0], row3[1], ...row2]; return { id: `g3_rechenmauern-${s + 1000}`, topicId: 'g3_rechenmauern', grade, title: 'Vierer-Mauer', instruction: 'Fülle alle leeren Steine der Zahlenmauer aus.', type: 'number-wall', data: { rows: [[null], [null, null], [null, null, null], bottom], answers }, xpReward: 15, validate: (value) => Array.isArray(value) && value.length === answers.length && value.every((item, index) => item === answers[index]) } }),
    factory((s) => { const bottom = [2 + randomInt(s, 0, 5), 3 + randomInt(s + 1, 0, 5), 1 + randomInt(s + 2, 0, 5)]; const known = bottom[0] + bottom[1]; const missing = bottom[1] + bottom[2]; const root = known + missing; return { id: `g3_rechenmauern-${s + 2000}`, topicId: 'g3_rechenmauern', grade, title: 'Mauer mit Lücke', instruction: 'Der oberste Stein und die untere Reihe sind vorgegeben. Ergänze den fehlenden Mittelstein.', type: 'number-wall', data: { rows: [[root], [known, null], bottom], answers: [missing] }, xpReward: 15, validate: (value) => Array.isArray(value) && value.length === 1 && value[0] === missing } }),
  ]),
  topic(grade, 'g3_achsensymmetrie', 'Achsensymmetrie', 'Zeichne Spiegelachsen im Gitternetz und ergänze spiegelgleiche Felder.', '🪞', [
    factory((s) => { const columns = 7; const rows = 4; const axisAfterColumn = 3; const filledIndices = [0, 1, 8, 9]; const answerIndices = [5, 6, 11, 12]; return { id: `g3_achsensymmetrie-${s}`, topicId: 'g3_achsensymmetrie', grade, title: 'Spiegelbild ergänzen', instruction: 'Klicke die Felder an, die das Spiegelbild ergeben.', type: 'symmetry-grid', data: { columns, rows, axisAfterColumn, filledIndices, answerIndices }, xpReward: 15, validate: (value) => Array.isArray(value) && value.length === answerIndices.length && value.every((item, index) => item === answerIndices[index]) } }),
    factory((s) => { const columns = 9; const rows = 3; const axisAfterColumn = 4; const filledIndices = [1, 10, 19]; const answerIndices = [7, 16, 25]; return { id: `g3_achsensymmetrie-${s + 1000}`, topicId: 'g3_achsensymmetrie', grade, title: 'Muster spiegeln', instruction: 'Ergänze die drei gespiegelten Kästchen.', type: 'symmetry-grid', data: { columns, rows, axisAfterColumn, filledIndices, answerIndices }, xpReward: 15, validate: (value) => Array.isArray(value) && value.length === answerIndices.length && value.every((item, index) => item === answerIndices[index]) } }),
    factory((s) => { const columns = 7; const rows = 5; const axisAfterColumn = 3; const filledIndices = [2, 9, 16, 23]; const answerIndices = [4, 11, 18, 25]; return { id: `g3_achsensymmetrie-${s + 2000}`, topicId: 'g3_achsensymmetrie', grade, title: 'Spiegelachse entdecken', instruction: 'Welche Felder liegen spiegelgleich zur Achse?', type: 'symmetry-grid', data: { columns, rows, axisAfterColumn, filledIndices, answerIndices }, xpReward: 15, validate: (value) => Array.isArray(value) && value.length === answerIndices.length && value.every((item, index) => item === answerIndices[index]) } }),
  ]),
]

export const grade3: GradeCatalog = { grade, title: 'Klasse 3', topics }
