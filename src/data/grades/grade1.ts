import { choiceExercise, factory, numberExercise, randomInt, topic } from './helpers'
import type { ExerciseAnswer, GradeCatalog } from '../../types/curriculum'

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
  topic(grade, 'g1_zahlenzerlegung', 'Zahlenzerlegung bis 10', 'Schüttelboxen und Zahlenhäuser zeigen, wie sich Zahlen bis 10 zerlegen lassen.', '🏠', [
    factory((s) => { const total = randomInt(s, 3, 10); const left = randomInt(s + 1, 0, total); const right = total - left; return { id: `g1_zahlenzerlegung-box-${s}`, topicId: 'g1_zahlenzerlegung', grade, title: 'Schüttelbox', instruction: `In der Schüttelbox liegen ${total} Plättchen. Wie viele liegen im zweiten Fach?`, type: 'table-fill' as const, data: { headers: ['Gesamt', 'Fach 1', 'Fach 2'], rows: [[total, left, null]], answers: [right] }, visual: { kind: 'tokens' as const, tokens: Array.from({ length: total }, () => '🔵') }, xpReward: 10, validate: (value: ExerciseAnswer) => value === right || (Array.isArray(value) && value.length === 1 && value[0] === right) } }),
    factory((s) => { const total = randomInt(s, 4, 10); const left = randomInt(s + 1, 1, total - 1); const right = total - left; return { id: `g1_zahlenzerlegung-house-${s}`, topicId: 'g1_zahlenzerlegung', grade, title: 'Zahlenhaus', instruction: `Im Zahlenhaus steht oben ${total}. Ergänze das fehlende Dach-Zimmer: ${left} + ? = ${total}.`, type: 'table-fill' as const, data: { headers: ['Oben', 'Links', 'Rechts'], rows: [[total, left, null]], answers: [right] }, xpReward: 10, validate: (value: ExerciseAnswer) => value === right || (Array.isArray(value) && value.length === 1 && value[0] === right) } }),
    factory((s) => { const total = randomInt(s, 2, 10); const right = randomInt(s + 1, 0, total); const left = total - right; return numberExercise(grade, 'g1_zahlenzerlegung', 'Zerlegen', `Ergänze: ${left} + ? = ${total}.`, right, s) }),
  ]),
  topic(grade, 'g1_verdoppeln_halbieren', 'Verdoppeln und Halbieren', 'Spiegelbilder und visuelle Paare im Zahlenraum bis 20.', '🪞', [
    factory((s) => { const n = randomInt(s, 1, 10); return { ...numberExercise(grade, 'g1_verdoppeln_halbieren', 'Verdoppeln', `Wie viel ist das Doppelte von ${n}?`, n * 2, s, 'Lege zwei gleich große Gruppen.'), visual: { kind: 'pairs' as const, icon: '🍎', groups: n, mirrored: true } } }),
    factory((s) => { const n = randomInt(s, 1, 10) * 2; return { ...numberExercise(grade, 'g1_verdoppeln_halbieren', 'Halbieren', `Wie viel ist die Hälfte von ${n}?`, n / 2, s), visual: { kind: 'pairs' as const, icon: '⭐', groups: n / 2, mirrored: true } } }),
    factory((s) => { const n = randomInt(s, 1, 10); return choiceExercise(grade, 'g1_verdoppeln_halbieren', 'Paare finden', `Welche Zahl ist das Doppelte von ${n}?`, [`${n}`, `${n * 2}`, `${n * 2 + 1}`], `${n * 2}`, s) }),
  ]),
  topic(grade, 'g1_muster_folgen', 'Muster und Folgen', 'Logische Muster und Ornamente mit Formen und Farben fortsetzen.', '🟣', [
    factory((s) => { const start = randomInt(s, 0, 1); const tokens = start === 0 ? ['🔴', '🔵', '🔴', '🔵'] : ['🔵', '🔴', '🔵', '🔴']; const answer = start === 0 ? '🔴' : '🔵'; return { id: `g1_muster_folgen-color-${s}`, topicId: 'g1_muster_folgen', grade, title: 'Farbenmuster', instruction: `Setze das Muster fort: ${tokens.join(' ')} __`, type: 'multiple-choice' as const, data: { options: ['🔴', '🔵', '🟡'], answer }, visual: { kind: 'tokens' as const, tokens }, xpReward: 10, validate: (value: ExerciseAnswer) => value === answer } }),
    factory((s) => { const tokens = ['▲', '■', '▲', '■']; return { id: `g1_muster_folgen-shape-${s}`, topicId: 'g1_muster_folgen', grade, title: 'Formenornament', instruction: 'Welche Form kommt als Nächstes: ▲ ■ ▲ ■ __?', type: 'multiple-choice' as const, data: { options: ['▲', '■', '●'], answer: '▲' }, visual: { kind: 'tokens' as const, tokens }, xpReward: 10, validate: (value: ExerciseAnswer) => value === '▲' } }),
    factory((s) => { const tokens = ['🟢', '🟢', '🟠', '🟢', '🟢', '🟠']; return { id: `g1_muster_folgen-repeat-${s}`, topicId: 'g1_muster_folgen', grade, title: 'Dreiermuster', instruction: 'Welche Farbe folgt auf 🟢 🟢 🟠 🟢 🟢 🟠?', type: 'multiple-choice' as const, data: { options: ['🟢', '🟠', '🔵'], answer: '🟢' }, visual: { kind: 'tokens' as const, tokens }, xpReward: 10, validate: (value: ExerciseAnswer) => value === '🟢' } }),
  ]),
  topic(grade, 'g1_raumorientierung', 'Raumorientierung', 'Finde die Eule links, rechts, oben, unten oder zwischen den Feldern.', '🦉', [
    factory((s) => { const choices = [{ label: 'links', answerIndex: 3 }, { label: 'rechts', answerIndex: 5 }, { label: 'oben', answerIndex: 1 }, { label: 'unten', answerIndex: 7 }]; const item = pick(choices, randomInt(s, 0, choices.length - 1)); return { id: `g1_raumorientierung-place-${s}`, topicId: 'g1_raumorientierung', grade, title: 'Wo ist die Eule?', instruction: `Platziere die Eule ${item.label} vom roten Punkt.`, type: 'spatial-grid' as const, data: { reference: '🔴', referenceIndex: 4, answerIndex: item.answerIndex, columns: 3, rows: 3 }, xpReward: 10, validate: (value: ExerciseAnswer) => value === item.answerIndex || (typeof value === 'string' && Number(value) === item.answerIndex) } }),
    factory((s) => ({ id: `g1_raumorientierung-grid-${s}`, topicId: 'g1_raumorientierung', grade, title: 'Gitterdetektiv', instruction: 'Setze die Eule in das Feld rechts unten vom roten Punkt.', type: 'spatial-grid' as const, data: { reference: '🔴', referenceIndex: 4, answerIndex: 8, columns: 3, rows: 3 }, xpReward: 10, validate: (value: ExerciseAnswer) => value === 8 || (typeof value === 'string' && Number(value) === 8) })),
    factory((s) => ({ id: `g1_raumorientierung-between-${s}`, topicId: 'g1_raumorientierung', grade, title: 'Dazwischen', instruction: 'Setze die Eule zwischen die beiden roten Punkte.', type: 'spatial-grid' as const, data: { reference: '🔴', referenceIndex: 3, secondaryReferenceIndex: 5, answerIndex: 4, columns: 3, rows: 3 }, xpReward: 10, validate: (value: ExerciseAnswer) => value === 4 || (typeof value === 'string' && Number(value) === 4) })),
  ]),
]

export const grade1: GradeCatalog = { grade, title: 'Klasse 1', topics }
