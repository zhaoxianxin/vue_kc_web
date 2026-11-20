import { mkdir, readFile, writeFile } from 'node:fs/promises'
// Preserve original .html URLs on static hosting without relying on SPA rewrites.
const html = await readFile('dist/index.html', 'utf8')
await mkdir('dist/works', { recursive: true })
for (const name of ['reverse', 'review', 'tools', 'detail']) {
  await writeFile(`dist/works/${name}.html`, html)
}
