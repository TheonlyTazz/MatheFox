import type { Exercise, ExerciseKind, TopicKey } from '../types/math'

export const DAILY_CHALLENGE_TITLE = 'Tägliche Mathe-Challenge'
export const DAILY_CHALLENGE_DESCRIPTION = 'Eine Aufgabe aus jedem Mathe-Thema und zwei Extra-Fragen.'

export interface DailyChallenge {
  dateKey: string
  title: string
  description: string
  questions: Exercise[]
}

const topicKeys: readonly TopicKey[] = [
  'klammern',
  'schriftlich_komma',
  'zeit',
  'preise',
  'fachbegriffe',
  'grundrechenarten',
  'geometrie',
  'sachaufgaben',
]

type Random = () => number
type ExerciseFactory = (random: Random) => Exercise

const isValidDateKey = (dateKey: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false
  const [yearText, monthText, dayText] = dateKey.split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

export const getLocalDateKey = (date: Date): string => {
  if (Number.isNaN(date.getTime())) throw new Error('Ein ungültiges Datum kann keinen Tages-Schlüssel erzeugen.')
  const pad = (value: number): string => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const createRandom = (seed: string): Random => {
  let state = 2166136261
  for (let index = 0; index < seed.length; index += 1) {
    state ^= seed.charCodeAt(index)
    state = Math.imul(state, 16777619)
  }

  return (): number => {
    state = Math.imul(state ^ (state >>> 15), 1 | state)
    state ^= state + Math.imul(state ^ (state >>> 7), 61 | state)
    return ((state ^ (state >>> 14)) >>> 0) / 4294967296
  }
}

const integer = (random: Random, minimum: number, maximum: number): number => (
  minimum + Math.floor(random() * (maximum - minimum + 1))
)

const choose = <T>(random: Random, values: readonly T[]): T => {
  const value = values[Math.floor(random() * values.length)]
  if (value === undefined) throw new Error('Es gibt keine Auswahl für die Tages-Challenge.')
  return value
}

const shuffle = <T>(random: Random, values: readonly T[]): T[] => {
  const result = [...values]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const current = result[index]
    result[index] = result[swapIndex] as T
    result[swapIndex] = current as T
  }
  return result
}

const normalize = (value: string): string => value
  .trim()
  .toLowerCase()
  .replace(/€/g, '')
  .replace(',', '.')
  .replace(/\s+/g, '')

const numberValidator = (answer: string): ((input: string) => boolean) => (input: string): boolean => {
  const expected = Number(normalize(answer))
  const actual = Number(normalize(input))
  return Number.isFinite(actual) && actual === expected
}

const textValidator = (answer: string): ((input: string) => boolean) => (input: string): boolean => (
  normalize(input) === normalize(answer)
)

const timeValidator = (answer: string): ((input: string) => boolean) => (input: string): boolean => {
  const normalized = input.trim().replace(/\s+/g, '')
  return normalized === answer
}

const createExercise = (
  topic: TopicKey,
  kind: ExerciseKind,
  prompt: string,
  answer: string,
  hint: string,
  explanation: string,
  xp: number,
  options?: string[],
  validatorKind: 'number' | 'time' | 'text' = kind === 'number' ? 'number' : 'text',
): Exercise => {
  const validate = validatorKind === 'number'
    ? numberValidator(answer)
    : validatorKind === 'time'
      ? timeValidator(answer)
      : textValidator(answer)
  return { id: '', topic, kind, prompt, options, answer, validate, hint, explanation, xp }
}

const formatDecimal = (value: number): string => value.toFixed(2).replace('.', ',')
const formatTime = (minutes: number): string => {
  const hour = Math.floor(minutes / 60) % 24
  const minute = minutes % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

const klammern: readonly ExerciseFactory[] = [
  (random) => {
    const a = integer(random, 3, 12)
    const b = integer(random, 2, 9)
    const factor = integer(random, 2, 6)
    const answer = (a + b) * factor
    return createExercise('klammern', 'number', `Rechne: (${a} + ${b}) · ${factor} = ?`, String(answer), 'Zuerst kommt die Klammer.', `${a} + ${b} = ${a + b} und ${a + b} · ${factor} = ${answer}.`, 15)
  },
  (random) => {
    const total = integer(random, 6, 20) * 5
    const divisor = integer(random, 2, 8)
    const dividend = total * divisor
    return createExercise('klammern', 'number', `Rechne: ${dividend} : (${total - divisor} + ${divisor}) = ?`, String(dividend / total), 'Berechne zuerst die Klammer.', `${total - divisor} + ${divisor} = ${total} und ${dividend} : ${total} = ${dividend / total}.`, 15)
  },
]

const schriftlichKomma: readonly ExerciseFactory[] = [
  (random) => {
    const left = integer(random, 100, 999)
    const right = integer(random, 100, 899)
    const answer = (left + right) / 100
    return createExercise('schriftlich_komma', 'number', `Rechne: ${formatDecimal(left / 100)} + ${formatDecimal(right / 100)} = ?`, formatDecimal(answer), 'Setze die Kommas untereinander.', `${formatDecimal(left / 100)} + ${formatDecimal(right / 100)} = ${formatDecimal(answer)}.`, 15)
  },
  (random) => {
    const left = integer(random, 500, 1500)
    const right = integer(random, 100, left - 1)
    const answer = (left - right) / 100
    return createExercise('schriftlich_komma', 'number', `Rechne: ${formatDecimal(left / 100)} - ${formatDecimal(right / 100)} = ?`, formatDecimal(answer), 'Ergänze Nullen und rechne stellengerecht.', `${formatDecimal(left / 100)} - ${formatDecimal(right / 100)} = ${formatDecimal(answer)}.`, 15)
  },
]

const zeit: readonly ExerciseFactory[] = [
  (random) => {
    const start = integer(random, 7 * 60, 17 * 60)
    const duration = integer(random, 15, 75)
    const answer = formatTime(start + duration)
    return createExercise('zeit', 'number', `Der Bus fährt um ${formatTime(start)} Uhr los und braucht ${duration} Minuten. Ankunft?`, answer, 'Addiere die Minuten zur Startzeit.', `${formatTime(start)} + ${duration} Minuten = ${answer} Uhr.`, 15, undefined, 'time')
  },
  (random) => {
    const hours = integer(random, 1, 4)
    const minutes = integer(random, 5, 55)
    const answer = hours * 60 + minutes
    return createExercise('zeit', 'number', `${hours} h ${minutes} min sind wie viele Minuten?`, String(answer), `${hours} Stunden sind ${hours * 60} Minuten.`, `${hours * 60} + ${minutes} = ${answer} Minuten.`, 15)
  },
]

const preise: readonly ExerciseFactory[] = [
  (random) => {
    const price = integer(random, 75, 450)
    const quantity = integer(random, 2, 6)
    const answer = (price * quantity) / 100
    return createExercise('preise', 'number', `Ein Heft kostet ${formatDecimal(price / 100)} €. Wie viel kosten ${quantity} Hefte?`, formatDecimal(answer), `Rechne ${formatDecimal(price / 100)} € ${quantity}-mal.`, `${formatDecimal(price / 100)} € · ${quantity} = ${formatDecimal(answer)} €.`, 15)
  },
  (random) => {
    const paid = integer(random, 500, 2000)
    const cost = integer(random, 100, paid - 50)
    const answer = (paid - cost) / 100
    return createExercise('preise', 'number', `Du bezahlst ${formatDecimal(paid / 100)} € für etwas, das ${formatDecimal(cost / 100)} € kostet. Wie viel bekommst du zurück?`, formatDecimal(answer), `Rechne ${formatDecimal(paid / 100)} € - ${formatDecimal(cost / 100)} €.`, `${formatDecimal(paid / 100)} € - ${formatDecimal(cost / 100)} € = ${formatDecimal(answer)} €.`, 15)
  },
]

const fachbegriffe: readonly ExerciseFactory[] = [
  (random) => {
    const a = integer(random, 2, 9)
    const b = integer(random, 2, 9)
    const answer = choose(random, ['Summe', 'Produkt'])
    const prompt = answer === 'Summe'
      ? `Wie heißt das Ergebnis von ${a} + ${b}?`
      : `Wie heißt das Ergebnis von ${a} · ${b}?`
    const options = answer === 'Summe' ? ['Summe', 'Differenz', 'Quotient'] : ['Produkt', 'Summe', 'Differenz']
    return createExercise('fachbegriffe', 'choice', prompt, answer, answer === 'Summe' ? 'Plus ergibt eine ...' : 'Malnehmen nennt man multiplizieren.', `Das Ergebnis dieser Aufgabe heißt ${answer}.`, 10, options)
  },
  (random) => {
    const a = integer(random, 20, 90)
    const b = integer(random, 2, 15)
    const answer = 'Minuend und Subtrahend'
    return createExercise('fachbegriffe', 'choice', `Wie heißen die Zahlen bei ${a} - ${b} = ${a - b}?`, answer, 'Bei Minus gibt es einen Minuenden und einen Subtrahenden.', `${a} ist der Minuend, ${b} der Subtrahend und ${a - b} die Differenz.`, 10, [answer, 'Faktor und Produkt', 'Dividend und Quotient'])
  },
]

const grundrechenarten: readonly ExerciseFactory[] = [
  (random) => {
    const a = integer(random, 4, 12)
    const b = integer(random, 3, 9)
    return createExercise('grundrechenarten', 'number', `Rechne: ${a} · ${b} = ?`, String(a * b), `Denke an die ${a}er-Reihe.`, `${a} · ${b} = ${a * b}.`, 10)
  },
  (random) => {
    const divisor = integer(random, 3, 9)
    const quotient = integer(random, 4, 12)
    const dividend = divisor * quotient
    return createExercise('grundrechenarten', 'number', `Rechne: ${dividend} : ${divisor} = ?`, String(quotient), `${divisor} · ${quotient} ergibt ${dividend}.`, `${dividend} geteilt durch ${divisor} ist ${quotient}.`, 10)
  },
]

const geometrie: readonly ExerciseFactory[] = [
  (random) => {
    const side = integer(random, 3, 12)
    const answer = String(side * 4)
    return createExercise('geometrie', 'number', `Ein Quadrat hat eine Seitenlänge von ${side} cm. Wie groß ist sein Umfang?`, answer, 'Ein Quadrat hat vier gleich lange Seiten.', `4 · ${side} cm = ${answer} cm.`, 15)
  },
  (random) => {
    const length = integer(random, 5, 14)
    const width = integer(random, 2, length - 1)
    const answer = String((length + width) * 2)
    return createExercise('geometrie', 'number', `Ein Rechteck ist ${length} cm lang und ${width} cm breit. Wie groß ist sein Umfang?`, answer, 'Addiere alle vier Seiten.', `${length} + ${width} + ${length} + ${width} = ${answer} cm.`, 15)
  },
]

const sachaufgaben: readonly ExerciseFactory[] = [
  (random) => {
    const groups = integer(random, 3, 8)
    const each = integer(random, 4, 12)
    const answer = groups * each
    return createExercise('sachaufgaben', 'number', `In ${groups} Tüten liegen je ${each} Murmeln. Wie viele Murmeln sind es?`, String(answer), `${groups} gleiche Gruppen mit je ${each}.`, `${groups} · ${each} = ${answer} Murmeln.`, 15)
  },
  (random) => {
    const start = integer(random, 25, 80)
    const givenAway = integer(random, 5, start - 5)
    const answer = start - givenAway
    return createExercise('sachaufgaben', 'number', `Lina hat ${start} Sticker und verschenkt ${givenAway}. Wie viele bleiben übrig?`, String(answer), `Rechne ${start} - ${givenAway}.`, `${start} - ${givenAway} = ${answer} Sticker.`, 10)
  },
]

const factories: Readonly<Record<TopicKey, readonly ExerciseFactory[]>> = {
  klammern,
  schriftlich_komma: schriftlichKomma,
  zeit,
  preise,
  fachbegriffe,
  grundrechenarten,
  geometrie,
  sachaufgaben,
}

const createQuestion = (dateKey: string, index: number, factory: ExerciseFactory, random: Random): Exercise => ({
  ...factory(random),
  id: `${dateKey}-${index + 1}`,
})

export const generateDailyChallenge = (dateKey: string): DailyChallenge => {
  if (!isValidDateKey(dateKey)) throw new Error(`Ungültiger Tages-Schlüssel: ${dateKey}`)
  const random = createRandom(dateKey)
  const questions: Exercise[] = topicKeys.map((topic, index) => {
    const factory = choose(random, factories[topic])
    return createQuestion(dateKey, index, factory, random)
  })

  const extraTopics = shuffle(random, topicKeys).slice(0, 2)
  extraTopics.forEach((topic, offset) => {
    const factory = choose(random, factories[topic])
    questions.push(createQuestion(dateKey, questions.length + offset, factory, random))
  })

  if (questions.length !== 10 || new Set(questions.map((question) => question.id)).size !== 10) {
    throw new Error('Tages-Challenge muss genau zehn eindeutige Aufgaben enthalten.')
  }
  if (!topicKeys.every((topic) => questions.some((question) => question.topic === topic))) {
    throw new Error('Tages-Challenge enthält nicht alle Themen.')
  }
  questions.forEach((question) => {
    if (question.kind === 'choice' && (!question.options || !question.options.includes(question.answer))) {
      throw new Error(`Auswahlaufgabe ${question.id} enthält die richtige Antwort nicht.`)
    }
  })

  return {
    dateKey,
    title: DAILY_CHALLENGE_TITLE,
    description: DAILY_CHALLENGE_DESCRIPTION,
    questions,
  }
}
