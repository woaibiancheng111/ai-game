import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const rootDir = process.cwd()
const storyDir = path.join(rootDir, 'src', 'data', 'story')
const npcFile = path.join(rootDir, 'src', 'data', 'npcs', 'xuejie.ts')
const educationFile = path.join(rootDir, 'src', 'data', 'education', 'cards.ts')

const storyFiles = fs.readdirSync(storyDir)
  .filter(file => /^act\d+\.ts$/.test(file))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

const storySource = storyFiles
  .map(file => fs.readFileSync(path.join(storyDir, file), 'utf8'))
  .join('\n')

const npcSource = fs.readFileSync(npcFile, 'utf8')
const educationSource = fs.readFileSync(educationFile, 'utf8')

const nodeIds = collectMatches(storySource, /^\s{2}([A-Za-z0-9_]+):\s*\{/gm)
const declaredIds = collectMatches(storySource, /^\s{4}id:\s*'([^']+)'/gm)
const nextNodeIds = collectMatches(storySource, /nextNodeId:\s*'([^']+)'/g)
const npcRefs = collectMatches(storySource, /npcId:\s*'([^']+)'/g)
const npcIds = collectMatches(npcSource, /^\s{2}([A-Za-z0-9_]+):\s*[A-Z0-9_]+_NPC,?$/gm)
const nodeCardEntries = collectMapEntries(educationSource, 'NODE_CARD_MAP')
const choiceCardEntries = collectMapEntries(educationSource, 'CHOICE_CARD_MAP')
const educationCardIds = collectMatches(educationSource, /^\s{2}([A-Za-z0-9_]+):\s*\{/gm)
const choiceIds = collectMatches(storySource, /^\s{8}id:\s*'([^']+)'/gm)

const errors = [
  ...findDuplicateValues(nodeIds, 'Duplicate node key'),
  ...findDuplicateValues(declaredIds, 'Duplicate node id'),
  ...findMismatchedNodeKeys(nodeIds, declaredIds),
  ...findMissing(nextNodeIds, nodeIds, 'Missing nextNodeId target'),
  ...findMissing(npcRefs, npcIds, 'Missing NPC reference'),
  ...findMissing(nodeCardEntries.map(entry => entry.key), nodeIds, 'Education card maps unknown node'),
  ...findMissing(choiceCardEntries.map(entry => entry.key), choiceIds, 'Education card maps unknown choice'),
  ...findMissing([...nodeCardEntries, ...choiceCardEntries].map(entry => entry.value), educationCardIds, 'Missing education card id')
]

const summary = [
  `Story files: ${storyFiles.length}`,
  `Nodes: ${nodeIds.length}`,
  `Declared IDs: ${declaredIds.length}`,
  `Next targets: ${nextNodeIds.length}`,
  `NPC refs: ${new Set(npcRefs).size}`,
  `Education triggers: ${nodeCardEntries.length + choiceCardEntries.length}`,
  `Education cards: ${educationCardIds.length}`
]

if (errors.length > 0) {
  console.error('Story validation failed.')
  console.error(summary.join('\n'))
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exitCode = 1
} else {
  console.log('Story validation passed.')
  console.log(summary.join('\n'))
}

function collectMatches(source, regex) {
  return [...source.matchAll(regex)].map(match => match[1])
}

function collectMapEntries(source, mapName) {
  const mapMatch = source.match(new RegExp(`const ${mapName}: Record<string, string> = \\{([\\s\\S]*?)\\n\\}`))
  if (!mapMatch) {
    return []
  }

  return [...mapMatch[1].matchAll(/^\s{2}([A-Za-z0-9_]+):\s*'([^']+)'/gm)]
    .map(match => ({ key: match[1], value: match[2] }))
}

function findDuplicateValues(values, label) {
  const seen = new Set()
  const duplicates = new Set()
  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value)
    }
    seen.add(value)
  }

  return [...duplicates].map(value => `${label}: ${value}`)
}

function findMismatchedNodeKeys(keys, ids) {
  const errors = []
  const max = Math.max(keys.length, ids.length)
  for (let index = 0; index < max; index += 1) {
    if (keys[index] !== ids[index]) {
      errors.push(`Node key/id mismatch at index ${index}: key=${keys[index] ?? '<missing>'}, id=${ids[index] ?? '<missing>'}`)
    }
  }
  return errors
}

function findMissing(values, allowedValues, label) {
  const allowed = new Set(allowedValues)
  return [...new Set(values)]
    .filter(value => !allowed.has(value))
    .map(value => `${label}: ${value}`)
}
