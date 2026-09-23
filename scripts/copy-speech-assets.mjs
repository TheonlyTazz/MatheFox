import { copyFile, mkdir, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('..', import.meta.url))
const assets = [
  ['node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm', 'public/tts/ort/ort-wasm-simd-threaded.wasm'],
  ['node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.mjs', 'public/tts/ort/ort-wasm-simd-threaded.mjs'],
  ['node_modules/@diffusionstudio/piper-wasm/build/piper_phonemize.wasm', 'public/tts/piper_phonemize.wasm'],
  ['node_modules/@diffusionstudio/piper-wasm/build/piper_phonemize.data', 'public/tts/piper_phonemize.data'],
]

for (const [source, destination] of assets) {
  const from = path.join(root, source)
  const to = path.join(root, destination)
  const metadata = await stat(from)
  if (!metadata.isFile() || metadata.size === 0) throw new Error(`Speech asset is missing or empty: ${from}`)
  await mkdir(path.dirname(to), { recursive: true })
  await copyFile(from, to)
}
