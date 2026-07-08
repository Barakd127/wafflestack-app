#!/usr/bin/env node
/**
 * bidi-test.mjs — regression tests for src/lib/bidiSegments.ts.
 * Transpiles the TS module with esbuild, then asserts segmentation on the
 * exact bug cases from live screenshots (2026-07-08) plus prior regressions.
 * Wired into `npm run qa:rtl`. Exit 1 on any failure.
 */
import { transformSync } from 'esbuild'
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const src = readFileSync(path.join(root, 'src/lib/bidiSegments.ts'), 'utf8')
const js = transformSync(src, { loader: 'ts' }).code
const tmp = path.join(root, 'scripts/.bidiSegments.test-build.mjs')
writeFileSync(tmp, js)
const { bidiSegments } = await import(pathToFileURL(tmp).href)
rmSync(tmp)

const fmt = segs => segs.map(s => `${s.ltr ? 'L' : 'R'}[${s.text}]`).join(' ')
let failures = 0
function check(name, line, assert) {
  const segs = bidiSegments(line)
  const problems = assert(segs)
  if (problems.length) {
    failures++
    console.error(`✗ ${name}\n    input: ${line}\n    segs:  ${fmt(segs)}\n    ${problems.join('\n    ')}`)
  } else {
    console.log(`✓ ${name}`)
  }
}
const ltrTexts = segs => segs.filter(s => s.ltr).map(s => s.text)
const rtlText = segs => segs.filter(s => !s.ltr).map(s => s.text).join('')

// 1. THE screenshot bug: sentence-final dot after a Latin word must NOT be
//    inside the LTR island — it belongs to the RTL paragraph.
check('trailing dot after Latin word stays RTL', 'וזו בדיוק שאילתת SQL.', segs => {
  const p = []
  if (ltrTexts(segs).some(t => t.includes('.'))) p.push('dot glued into LTR island')
  if (!ltrTexts(segs).some(t => t.trim() === 'SQL')) p.push('SQL not isolated')
  if (!rtlText(segs).endsWith('.')) p.push('dot not at paragraph end')
  return p
})

// 2. Enumeration marker renders as authored ("1)" not "(1").
check('enumeration marker "1)" atomic LTR', 'מאפשרת: 1) זמן מהיר', segs => {
  const p = []
  if (!ltrTexts(segs).some(t => t.trim() === '1)')) p.push('"1)" not an atomic LTR token')
  if (ltrTexts(segs).some(t => t.includes(':'))) p.push('colon torn off the Hebrew word')
  return p
})

// 3. Line-start enumeration (screenshot 3: "1) זמן: אומדן...").
check('line-start "2)" enumeration', '2) עלות: דגימה זולה משחלקת אוכלוסייה.', segs => {
  const p = []
  if (!segs[0].ltr || segs[0].text.trim() !== '2)') p.push('leading marker not LTR-isolated')
  if (!rtlText(segs).endsWith('.')) p.push('final dot not RTL')
  return p
})

// 4. Parenthetical with mixed content mirrors correctly (screenshot 2):
//    parens flanked by disagreeing directions take the paragraph (RTL) side.
check('mixed-content parens stay RTL', 'אחוזון נע בין 0 ל-100 (או 1- ל-100 במוסכמות מסוימות).', segs => {
  const p = []
  if (ltrTexts(segs).some(t => t.includes('(') || t.includes(')'))) p.push('paren glued into LTR island')
  if (!rtlText(segs).endsWith('.')) p.push('final dot not RTL')
  return p
})

// 5. Equation stays ONE island including internal punctuation.
check('equation keeps internal punct', 'ההסתברות היא P(A) = 0.6 בקירוב', segs => {
  const p = []
  if (!ltrTexts(segs).some(t => t.includes('P(A) = 0.6'))) p.push('equation fragmented: ' + JSON.stringify(ltrTexts(segs)))
  return p
})

// 6. "ל-100" keeps hyphen+number as LTR (hyphen is strong-math by design).
check('hyphen-number after Hebrew prefix', 'בין 0 ל-100 בדיוק', segs => {
  const p = []
  if (!ltrTexts(segs).some(t => t.includes('-100'))) p.push('-100 not LTR')
  return p
})

// 7. Percent sticks to its number.
check('percent island', 'תצפית באחוזון 75% מהתצפיות', segs => {
  const p = []
  if (!ltrTexts(segs).some(t => t.trim() === '75%')) p.push('75% not one LTR island: ' + JSON.stringify(ltrTexts(segs)))
  return p
})

// 8. Hebrew gershayim quote is not an island.
check('gershayim stays Hebrew', 'סה"כ שבעים נקודות', segs => {
  const p = []
  if (segs.some(s => s.ltr)) p.push('unexpected LTR island in pure Hebrew')
  return p
})

// 9. Latin acronym with colon-number (SQL:2023) stays one island.
check('SQL:2023 one island', 'התקן החדש SQL:2023 הוסיף גרפים', segs => {
  const p = []
  if (!ltrTexts(segs).some(t => t.trim() === 'SQL:2023')) p.push('SQL:2023 fragmented: ' + JSON.stringify(ltrTexts(segs)))
  return p
})

// 10. Question mark after Latin at end → RTL.
check('question mark after Latin stays RTL', 'מה מחזירה השאילתה SELECT COUNT?', segs => {
  const p = []
  if (ltrTexts(segs).some(t => t.includes('?'))) p.push('? glued into LTR island')
  return p
})

if (failures) {
  console.error(`\nbidi-test FAILED — ${failures} case(s).`)
  process.exit(1)
}
console.log('\nbidi-test passed — all cases.')
