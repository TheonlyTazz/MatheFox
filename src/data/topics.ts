import type { Topic, TopicKey } from '../types/math'

export const topics: Topic[] = [
  { key: 'klammern', title: 'Klammer-Profi', emoji: '🦊', color: 'orange', description: 'Rechne mit Klammern ganz schlau.' },
  { key: 'schriftlich_komma', title: 'Komma-Können', emoji: '✏️', color: 'sky', description: 'Schriftlich rechnen mit Komma.' },
  { key: 'zeit', title: 'Zeit-Meisterin', emoji: '⏰', color: 'violet', description: 'Uhrzeiten, Minuten und Stunden.' },
  { key: 'preise', title: 'Preis-Fuchs', emoji: '🪙', color: 'emerald', description: 'Mit Euro und Cent rechnen.' },
  { key: 'fachbegriffe', title: 'Wortgewandt', emoji: '📚', color: 'rose', description: 'Mathe-Fachbegriffe erkennen.' },
  { key: 'grundrechenarten', title: 'Rechenkönigin', emoji: '👑', color: 'amber', description: 'Plus, Minus, Mal und Geteilt.' },
  { key: 'geometrie', title: 'Formen-Detektiv', emoji: '🔷', color: 'cyan', description: 'Formen, Umfang und Flächen.' },
  { key: 'sachaufgaben', title: 'Knobel-Nase', emoji: '🔎', color: 'lime', description: 'Textaufgaben clever lösen.' },
]

export const topicByKey = (key: TopicKey): Topic => topics.find((topic) => topic.key === key) ?? topics[0]
