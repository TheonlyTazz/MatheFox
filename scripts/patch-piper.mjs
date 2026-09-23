import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const packageFile = fileURLToPath(new URL('../node_modules/@mintplex-labs/piper-tts-web/dist/piper-tts-web.js', import.meta.url))
const original = 'resolve(JSON.parse(data).phoneme_ids);'
const replacement = `const result = JSON.parse(data);
        const idMap = __privateGet(this, _modelConfig).phoneme_id_map;
        const pad = idMap["_"];
        const bos = idMap["^"];
        const eos = idMap["$"];
        if (!Array.isArray(result.phonemes) || !pad || !bos || !eos) throw new Error("Invalid Piper phoneme data or voice configuration");
        const ids = [...bos, ...pad];
        for (const phoneme of result.phonemes) {
          const mapped = idMap[phoneme];
          if (mapped) ids.push(...mapped, ...pad);
        }
        ids.push(...eos);
        resolve(ids);`
const source = await readFile(packageFile, 'utf8')
if (source.includes(replacement)) process.exit(0)
if (!source.includes(original)) throw new Error('Piper runtime changed; review the phoneme mapping patch before building')
await writeFile(packageFile, source.replace(original, replacement))
