import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const rootDir = process.cwd()
const storyDir = path.join(rootDir, 'src', 'data', 'story')

const route = [
  'c1_enthusiastic',
  'c2_proactive',
  'c3_attentive',
  'c4_sit_together',
  'c5_academic',
  'c6_direct',
  'c7_study',
  'c8_accept',
  'c9_help',
  'c10_continue',
  'act1_to_act2',
  'a1_bridge_continue',
  'a2_c1_help',
  'a2_c1b_coordinate',
  'a2_c1c_counselor',
  'a2_c2_verify',
  'a2_c2b_ask_help',
  'a2_c3_security',
  'a2_c5_go_talk',
  'a2_bridge_note',
  'a3_c1_refuse',
  'a3_c4_report_now',
  'a3_c6_public_report',
  'a3_end_star_to_act4',
  'a3_bridge_breathe',
  'a4_c1_counselor',
  'a4_c1b_small_help',
  'a4_c2_anonymous',
  'a4_c2b_boundary',
  'a4_dazhi_practical',
  'a4_xiaojie_space',
  'a4_xuejie_encourage',
  'a4_c3_support',
  'a4_bridge_pack_up',
  'a5_c1_study_group',
  'a5_c1b_ai_boundary',
  'a5_lonely_call_xuejie',
  'a5_xuejie_honest',
  'a5_c1c_honest',
  'a5_c2_share_manual',
  'a5_to_act6',
  'a5_bridge_return',
  'a6_c1_safety',
  'a6_c2_collaborate',
  'a6_drift_dinner',
  'a6_xiaoming_normalize',
  'a6_c2b_user_visit',
  'a6_c2c_answer_process',
  'a6_c3_repair',
  'a6_bridge_next_year',
  'a7_c1_public_service',
  'a7_c1b_career_center',
  'a7_c1c_review_rejections',
  'a7_imposter_admit',
  'a7_quiet_honest',
  'a7_c2_public_camp',
  'a7_c3_choose_people',
  'a7_bridge_senior',
  'a8_c1_mentor',
  'a8_c1b_say_goodbye',
  'a8_c1c_leave_note',
  'a8_reflect_deep',
  'a8_c2_educator_ending'
]

const nodes = parseStoryNodes()
const choiceMap = new Map()
const allChoiceIds = []
for (const node of nodes.values()) {
  for (const choice of node.choices) {
    allChoiceIds.push(choice.id)
    choiceMap.set(choice.id, { node, choice })
  }
}

const state = {
  currentNodeId: 'act1_start',
  flags: {},
  visited: ['act1_start']
}
const trace = []

for (const choiceId of route) {
  const node = nodes.get(state.currentNodeId)
  if (!node) {
    fail(`Current node not found: ${state.currentNodeId}`)
  }

  const choice = node.choices.find(item => item.id === choiceId)
  if (!choice) {
    const available = node.choices.map(item => item.id).join(', ') || '<none>'
    fail(`Choice ${choiceId} is not available at ${node.id}. Available: ${available}`)
  }

  if (!doFlagsMatch(state.flags, choice.requiredFlags)) {
    fail(`Choice ${choiceId} required flags not met at ${node.id}: ${JSON.stringify(choice.requiredFlags)}`)
  }

  Object.assign(state.flags, choice.setFlags)
  const nextNode = nodes.get(choice.nextNodeId)
  if (!nextNode) {
    fail(`Choice ${choiceId} points to missing node: ${choice.nextNodeId}`)
  }

  if (!doFlagsMatch(state.flags, nextNode.requiredFlags)) {
    fail(`Next node ${nextNode.id} required flags not met after ${choiceId}: ${JSON.stringify(nextNode.requiredFlags)}`)
  }

  Object.assign(state.flags, nextNode.setFlags)
  state.currentNodeId = nextNode.id
  state.visited.push(nextNode.id)
  trace.push(`${node.id} --${choiceId}--> ${nextNode.id}`)
}

const finalNode = nodes.get(state.currentNodeId)
if (!finalNode?.isEnding) {
  fail(`Route ended at ${state.currentNodeId}, but final node is not marked isEnding.`)
}

if (finalNode.endingId !== 'campus_educator') {
  fail(`Expected campus_educator ending, got ${finalNode.endingId ?? '<none>'}`)
}

const visitedActs = new Set(state.visited.map(nodeId => nodes.get(nodeId)?.actId).filter(Boolean))
const missingActs = ['act1', 'act2', 'act3', 'act4', 'act5', 'act6', 'act7', 'act8'].filter(actId => !visitedActs.has(actId))
if (missingActs.length > 0) {
  fail(`Route skipped acts: ${missingActs.join(', ')}`)
}

const duplicateChoiceIds = findDuplicates(allChoiceIds)
if (duplicateChoiceIds.length > 0) {
  fail(`Duplicate choice ids found: ${duplicateChoiceIds.join(', ')}`)
}

console.log('Route smoke passed.')
console.log(`Choices walked: ${route.length}`)
console.log(`Nodes visited: ${state.visited.length}`)
console.log(`Final node: ${finalNode.id}`)
console.log(`Ending: ${finalNode.endingId}`)
console.log(`Acts covered: ${[...visitedActs].join(', ')}`)

function parseStoryNodes() {
  const files = fs.readdirSync(storyDir)
    .filter(file => /^act\d+\.ts$/.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  const parsedNodes = new Map()

  for (const file of files) {
    const source = fs.readFileSync(path.join(storyDir, file), 'utf8')
    for (const block of extractNodeBlocks(source)) {
      const id = firstMatch(block, /^\s{4}id:\s*'([^']+)'/m)
      if (!id) {
        continue
      }

      parsedNodes.set(id, {
        id,
        actId: firstMatch(block, /^\s{4}actId:\s*'([^']+)'/m),
        isEnding: /isEnding:\s*true/.test(block),
        endingId: firstMatch(block, /^\s{4}endingId:\s*'([^']+)'/m),
        requiredFlags: parseInlineObject(firstMatch(block, /^\s{4}requiredFlags:\s*(\{[^}]*\})/m)),
        setFlags: parseInlineObject(firstMatch(block, /^\s{4}setFlags:\s*(\{[^}]*\})/m)),
        choices: extractChoices(block)
      })
    }
  }

  return parsedNodes
}

function extractNodeBlocks(source) {
  const blocks = []
  const nodeStartRegex = /^\s{2}[A-Za-z0-9_]+:\s*\{/gm
  const starts = [...source.matchAll(nodeStartRegex)].map(match => match.index)

  for (let index = 0; index < starts.length; index += 1) {
    const start = starts[index]
    const end = starts[index + 1] ?? source.lastIndexOf('\n}')
    blocks.push(source.slice(start, end))
  }

  return blocks
}

function extractChoices(nodeBlock) {
  const choices = []
  const choiceStartRegex = /^\s{6}\{/gm
  const starts = [...nodeBlock.matchAll(choiceStartRegex)].map(match => match.index)

  for (let index = 0; index < starts.length; index += 1) {
    const start = starts[index]
    const end = starts[index + 1] ?? nodeBlock.length
    const block = nodeBlock.slice(start, end)
    const id = firstMatch(block, /^\s{8}id:\s*'([^']+)'/m)
    const nextNodeId = firstMatch(block, /nextNodeId:\s*'([^']+)'/)
    if (!id || !nextNodeId) {
      continue
    }

    choices.push({
      id,
      nextNodeId,
      requiredFlags: parseInlineObject(firstMatch(block, /requiredFlags:\s*(\{[^}]*\})/)),
      setFlags: parseInlineObject(firstMatch(block, /setFlags:\s*(\{[^}]*\})/))
    })
  }

  return choices
}

function firstMatch(source, regex) {
  return source.match(regex)?.[1] ?? ''
}

function parseInlineObject(value) {
  if (!value) {
    return {}
  }

  const flags = {}
  for (const match of value.matchAll(/([A-Za-z0-9_]+):\s*(true|false|'[^']+'|-?\d+(?:\.\d+)?)/g)) {
    const [, key, rawValue] = match
    if (rawValue === 'true') {
      flags[key] = true
    } else if (rawValue === 'false') {
      flags[key] = false
    } else if (rawValue.startsWith("'")) {
      flags[key] = rawValue.slice(1, -1)
    } else {
      flags[key] = Number(rawValue)
    }
  }
  return flags
}

function doFlagsMatch(currentFlags, requiredFlags = {}) {
  return Object.entries(requiredFlags).every(([key, expected]) => currentFlags[key] === expected)
}

function findDuplicates(values) {
  const seen = new Set()
  const duplicates = new Set()
  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value)
    }
    seen.add(value)
  }
  return [...duplicates]
}

function fail(message) {
  console.error('Route smoke failed.')
  console.error(message)
  if (trace.length > 0) {
    console.error('Trace:')
    for (const item of trace.slice(-12)) {
      console.error(`- ${item}`)
    }
  }
  process.exit(1)
}
