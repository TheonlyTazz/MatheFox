import type { Exercise, ExerciseKind, Grade, TopicKey } from '../types/math'

export const TOPIC_KEYS: readonly TopicKey[] = [
  'klammern',
  'schriftlich_komma',
  'zeit',
  'preise',
  'fachbegriffe',
  'grundrechenarten',
  'geometrie',
  'sachaufgaben',
]

export type Random = () => number
export type GeneratedExercise = Omit<Exercise, 'id'>
export type ExerciseFactory = (random: Random, grade: Grade) => GeneratedExercise

export interface GenerateSessionOptions {
  count?: number
  grade?: Grade
  topic?: TopicKey
}

const createRandom = (seed: string): Random => {
  if (seed.length === 0) throw new Error('Ein Generator-Schlüssel darf nicht leer sein.')
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

const integer = (random: Random, minimum: number, maximum: number): number => {
  if (minimum > maximum) throw new Error(`Ungültiger Zahlenbereich: ${minimum} bis ${maximum}.`)
  return minimum + Math.floor(random() * (maximum - minimum + 1))
}

const choose = <T>(random: Random, values: readonly T[]): T => {
  if (values.length === 0) throw new Error('Es gibt keine Auswahl für die Aufgabe.')
  const value = values[Math.floor(random() * values.length)]
  if (value === undefined) throw new Error('Die Auswahl konnte nicht erzeugt werden.')
  return value
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

const timeValidator = (answer: string): ((input: string) => boolean) => (input: string): boolean => (
  input.trim().replace(/\s+/g, '') === answer
)

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
): GeneratedExercise => {
  if (kind === 'choice' && (!options || options.length < 2 || !options.includes(answer))) {
    throw new Error(`Auswahlaufgabe für ${topic} hat keine gültigen Antwortoptionen.`)
  }
  const validate = validatorKind === 'number'
    ? numberValidator(answer)
    : validatorKind === 'time'
      ? timeValidator(answer)
      : textValidator(answer)
  return { topic, kind, prompt, options, answer, validate, hint, explanation, xp }
}

const formatDecimal = (value: number): string => value.toFixed(2).replace('.', ',')
const formatTime = (minutes: number): string => {
  const hour = Math.floor(minutes / 60) % 24
  const minute = minutes % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

const upper = (grade: Grade, grade4: number, grade5: number): number => grade === 4 ? grade4 : grade5

const klammern: readonly ExerciseFactory[] = [
  (random, grade) => {
    const a = integer(random, 3, upper(grade, 12, 20))
    const b = integer(random, 2, upper(grade, 9, 15))
    const factor = integer(random, 2, upper(grade, 6, 9))
    const answer = (a + b) * factor
    return createExercise('klammern', 'number', `Rechne: (${a} + ${b}) · ${factor} = ?`, String(answer), 'Zuerst kommt die Klammer.', `${a} + ${b} = ${a + b} und ${a + b} · ${factor} = ${answer}.`, 15)
  },
  (random, grade) => {
    const total = integer(random, 6, upper(grade, 20, 40)) * 5
    const divisor = integer(random, 2, upper(grade, 8, 12))
    const dividend = total * divisor
    return createExercise('klammern', 'number', `Rechne: ${dividend} : (${total - divisor} + ${divisor}) = ?`, String(dividend / total), 'Berechne zuerst die Klammer.', `${total - divisor} + ${divisor} = ${total} und ${dividend} : ${total} = ${dividend / total}.`, 15)
  },
]

const schriftlichKomma: readonly ExerciseFactory[] = [
  (random, grade) => {
    const left = integer(random, 100, upper(grade, 999, 4999))
    const right = integer(random, 100, upper(grade, 899, 3999))
    const answer = (left + right) / 100
    return createExercise('schriftlich_komma', 'number', `Rechne: ${formatDecimal(left / 100)} + ${formatDecimal(right / 100)} = ?`, formatDecimal(answer), 'Setze die Kommas untereinander.', `${formatDecimal(left / 100)} + ${formatDecimal(right / 100)} = ${formatDecimal(answer)}.`, 15)
  },
  (random, grade) => {
    const left = integer(random, 500, upper(grade, 1500, 7000))
    const right = integer(random, 100, left - 1)
    const answer = (left - right) / 100
    return createExercise('schriftlich_komma', 'number', `Rechne: ${formatDecimal(left / 100)} - ${formatDecimal(right / 100)} = ?`, formatDecimal(answer), 'Ergänze Nullen und rechne stellengerecht.', `${formatDecimal(left / 100)} - ${formatDecimal(right / 100)} = ${formatDecimal(answer)}.`, 15)
  },
]

const zeit: readonly ExerciseFactory[] = [
  (random, grade) => {
    const start = integer(random, 7 * 60, 17 * 60)
    const duration = integer(random, 15, upper(grade, 75, 150))
    const answer = formatTime(start + duration)
    return createExercise('zeit', 'number', `Der Bus fährt um ${formatTime(start)} Uhr los und braucht ${duration} Minuten. Ankunft?`, answer, 'Addiere die Minuten zur Startzeit.', `${formatTime(start)} + ${duration} Minuten = ${answer} Uhr.`, 15, undefined, 'time')
  },
  (random, grade) => {
    const hours = integer(random, 1, upper(grade, 4, 8))
    const minutes = integer(random, 5, 55)
    const answer = hours * 60 + minutes
    return createExercise('zeit', 'number', `${hours} h ${minutes} min sind wie viele Minuten?`, String(answer), `${hours} Stunden sind ${hours * 60} Minuten.`, `${hours * 60} + ${minutes} = ${answer} Minuten.`, 15)
  },
]

const preise: readonly ExerciseFactory[] = [
  (random, grade) => {
    const price = integer(random, 75, upper(grade, 450, 1200))
    const quantity = integer(random, 2, upper(grade, 6, 10))
    const answer = (price * quantity) / 100
    return createExercise('preise', 'number', `Ein Heft kostet ${formatDecimal(price / 100)} €. Wie viel kosten ${quantity} Hefte?`, formatDecimal(answer), `Rechne ${formatDecimal(price / 100)} € ${quantity}-mal.`, `${formatDecimal(price / 100)} € · ${quantity} = ${formatDecimal(answer)} €.`, 15)
  },
  (random, grade) => {
    const paid = integer(random, 500, upper(grade, 2000, 5000))
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
    const prompt = answer === 'Summe' ? `Wie heißt das Ergebnis von ${a} + ${b}?` : `Wie heißt das Ergebnis von ${a} · ${b}?`
    const options = answer === 'Summe' ? ['Summe', 'Differenz', 'Quotient'] : ['Produkt', 'Summe', 'Differenz']
    return createExercise('fachbegriffe', 'choice', prompt, answer, answer === 'Summe' ? 'Plus ergibt eine ...' : 'Malnehmen nennt man multiplizieren.', `Das Ergebnis dieser Aufgabe heißt ${answer}.`, 10, options)
  },
  (random, grade) => {
    const a = integer(random, 20, upper(grade, 90, 200))
    const b = integer(random, 2, upper(grade, 15, 30))
    const answer = 'Minuend und Subtrahend'
    return createExercise('fachbegriffe', 'choice', `Wie heißen die Zahlen bei ${a} - ${b} = ${a - b}?`, answer, 'Bei Minus gibt es einen Minuenden und einen Subtrahenden.', `${a} ist der Minuend, ${b} der Subtrahend und ${a - b} die Differenz.`, 10, [answer, 'Faktor und Produkt', 'Dividend und Quotient'])
  },
]

const grundrechenarten: readonly ExerciseFactory[] = [
  (random, grade) => {
    const a = integer(random, 4, upper(grade, 12, 20))
    const b = integer(random, 3, upper(grade, 9, 15))
    return createExercise('grundrechenarten', 'number', `Rechne: ${a} · ${b} = ?`, String(a * b), `Denke an die ${a}er-Reihe.`, `${a} · ${b} = ${a * b}.`, 10)
  },
  (random, grade) => {
    const divisor = integer(random, 3, upper(grade, 9, 15))
    const quotient = integer(random, 4, upper(grade, 12, 25))
    const dividend = divisor * quotient
    return createExercise('grundrechenarten', 'number', `Rechne: ${dividend} : ${divisor} = ?`, String(quotient), `${divisor} · ${quotient} ergibt ${dividend}.`, `${dividend} geteilt durch ${divisor} ist ${quotient}.`, 10)
  },
]

const geometrie: readonly ExerciseFactory[] = [
  (random, grade) => {
    const side = integer(random, 3, upper(grade, 12, 25))
    const answer = String(side * 4)
    return createExercise('geometrie', 'number', `Ein Quadrat hat eine Seitenlänge von ${side} cm. Wie groß ist sein Umfang?`, answer, 'Ein Quadrat hat vier gleich lange Seiten.', `4 · ${side} cm = ${answer} cm.`, 15)
  },
  (random, grade) => {
    const length = integer(random, 5, upper(grade, 14, 30))
    const width = integer(random, 2, length - 1)
    const answer = String((length + width) * 2)
    return createExercise('geometrie', 'number', `Ein Rechteck ist ${length} cm lang und ${width} cm breit. Wie groß ist sein Umfang?`, answer, 'Addiere alle vier Seiten.', `${length} + ${width} + ${length} + ${width} = ${answer} cm.`, 15)
  },
]

const sachaufgaben: readonly ExerciseFactory[] = [
  (random, grade) => {
    const groups = integer(random, 3, upper(grade, 8, 15))
    const each = integer(random, 4, upper(grade, 12, 20))
    const answer = groups * each
    return createExercise('sachaufgaben', 'number', `In ${groups} Tüten liegen je ${each} Murmeln. Wie viele Murmeln sind es?`, String(answer), `${groups} gleiche Gruppen mit je ${each}.`, `${groups} · ${each} = ${answer} Murmeln.`, 15)
  },
  (random, grade) => {
    const start = integer(random, 25, upper(grade, 80, 250))
    const givenAway = integer(random, 5, start - 5)
    const answer = start - givenAway
    return createExercise('sachaufgaben', 'number', `Lina hat ${start} Sticker und verschenkt ${givenAway}. Wie viele bleiben übrig?`, String(answer), `Rechne ${start} - ${givenAway}.`, `${start} - ${givenAway} = ${answer} Sticker.`, 10)
  },
]

export const generatorRegistry: Readonly<Record<TopicKey, readonly ExerciseFactory[]>> = {
  klammern,
  schriftlich_komma: schriftlichKomma,
  zeit,
  preise,
  fachbegriffe,
  grundrechenarten,
  geometrie,
  sachaufgaben,
}

const validateGeneratedExercise = (exercise: Exercise): Exercise => {
  if (exercise.id.length === 0 || exercise.prompt.length === 0 || exercise.answer.length === 0) {
    throw new Error('Der Generator hat eine unvollständige Aufgabe erzeugt.')
  }
  if (exercise.kind === 'choice' && (!exercise.options || !exercise.options.includes(exercise.answer))) {
    throw new Error(`Auswahlaufgabe ${exercise.id} enthält die richtige Antwort nicht.`)
  }
  if (!exercise.validate(exercise.answer)) throw new Error(`Die Aufgabe ${exercise.id} akzeptiert ihre Antwort nicht.`)
  return exercise
}

const topicFactories = (topic: TopicKey): readonly ExerciseFactory[] => {
  const factories = generatorRegistry[topic]
  if (!factories || factories.length < 2) throw new Error(`Thema ${topic} hat zu wenige Aufgabenvorlagen.`)
  return factories
}

const createExerciseId = (seed: string, topic: TopicKey, index: number): string => `${seed}-${topic}-${index + 1}`

export const generateSeededExercise = (seed: string, topic: TopicKey, grade: Grade = 4): Exercise => {
  const random = createRandom(`${seed}:${topic}`)
  const factories = topicFactories(topic)
  const index = Math.floor(random() * factories.length)
  const exercise = factories[index](random, grade)
  return validateGeneratedExercise({ ...exercise, id: createExerciseId(seed, topic, index) })
}

export const generateSeededSession = (seed: string, options: GenerateSessionOptions = {}): Exercise[] => {
  const count = options.count ?? TOPIC_KEYS.length
  const grade = options.grade ?? 4
  if (!Number.isInteger(count) || count < 1) throw new Error('Eine Sitzung muss mindestens eine Aufgabe enthalten.')
  const availableTopics = options.topic ? [options.topic] : TOPIC_KEYS
  const random = createRandom(`${seed}:session`)
  const questions: Exercise[] = []
  const used = new Set<string>()

  for (let index = 0; index < count; index += 1) {
    const topic = choose(random, availableTopics)
    const factories = topicFactories(topic)
    let exercise: Exercise | undefined
    for (let attempt = 0; attempt < factories.length * 3; attempt += 1) {
      const factoryIndex = Math.floor(random() * factories.length)
      const candidate = factories[factoryIndex](random, grade)
      const identity = `${candidate.topic}:${candidate.prompt}:${candidate.answer}`
      if (!used.has(identity)) {
        exercise = validateGeneratedExercise({ ...candidate, id: `${seed}-session-${index + 1}` })
        used.add(identity)
        break
      }
    }
    if (!exercise) throw new Error(`Keine neue Aufgabe für Sitzung ${seed} verfügbar.`)
    questions.push(exercise)
  }
  return questions
}

export const generateRandomSession = (options: GenerateSessionOptions = {}): Exercise[] => (
  generateSeededSession(`${Date.now()}-${Math.random()}-${Math.random()}`, options)
)

export const generateMixedExamSet = (seed: string, grade: Grade = 4, count = TOPIC_KEYS.length): Exercise[] => {
  if (!Number.isInteger(count) || count < TOPIC_KEYS.length) {
    throw new Error(`Ein gemischter Prüfungssatz braucht mindestens ${TOPIC_KEYS.length} Aufgaben.`)
  }
  const questions = TOPIC_KEYS.map((topic, index) => (
    generateSeededExercise(`${seed}-exam-${index}`, topic, grade)
  ))
  if (count > TOPIC_KEYS.length) {
    questions.push(...generateSeededSession(`${seed}-extras`, {
      count: count - TOPIC_KEYS.length,
      grade,
    }))
  }
  const ids = new Set(questions.map((question) => question.id))
  if (ids.size !== questions.length) throw new Error('Der gemischte Prüfungssatz enthält doppelte Aufgaben-IDs.')
  return questions
}

export const generateExercise = generateSeededExercise
export const generateSession = generateSeededSession
export const generateExamSet = generateMixedExamSet
