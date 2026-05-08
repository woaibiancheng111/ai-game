import { ACT1_NODES } from '../data/story/act1'
import { ACT2_NODES } from '../data/story/act2'
import { ACT3_NODES } from '../data/story/act3'
import { ACT4_NODES } from '../data/story/act4'
import { ACT5_NODES } from '../data/story/act5'
import { ACT6_NODES } from '../data/story/act6'
import { ACT7_NODES } from '../data/story/act7'
import { ACT8_NODES } from '../data/story/act8'
import type { ChapterMeta, GameState, PlayerChoice, StoryNode } from '../data/types'
import { doFlagsMatch, getAvailableChoices } from './state'

export const STORY_NODES: Record<string, StoryNode> = {
  ...ACT1_NODES,
  ...ACT2_NODES,
  ...ACT3_NODES,
  ...ACT4_NODES,
  ...ACT5_NODES,
  ...ACT6_NODES,
  ...ACT7_NODES,
  ...ACT8_NODES
}

export const CHAPTERS: ChapterMeta[] = [
  {
    actId: 'act1',
    actNumber: 1,
    title: '迎新周',
    subtitle: '入学适应篇',
    description: '完成报到、认识室友、处理第一批学习和生活选择，建立大学生活的基本节奏。',
    startNodeId: 'act1_start',
    themes: ['学习适应', '宿舍关系', '校园求助']
  },
  {
    actId: 'act2',
    actNumber: 2,
    title: '校园适应',
    subtitle: '节奏建立篇',
    description: '进入军训、选课、社团和生活费压力阶段，兼职诱因开始悄悄出现。',
    startNodeId: 'act2_military_training',
    unlockAfterActId: 'act1',
    themes: ['时间管理', '社交边界', '正规兼职']
  },
  {
    actId: 'act3',
    actNumber: 3,
    title: '防骗主线',
    subtitle: '风险识别篇',
    description: '面对问卷、兼职、到账截图和保证金陷阱，完成一次完整的校园反诈决策训练。',
    startNodeId: 'act3_honey_trap',
    unlockAfterActId: 'act2',
    themes: ['隐私保护', '信息核验', '转账前暂停']
  },
  {
    actId: 'act4',
    actNumber: 4,
    title: '风波之后',
    subtitle: '修复成长篇',
    description: '从防骗事件回到真实校园生活，处理学业补救、室友关系和班级分享的边界。',
    startNodeId: 'act4_rebuild_week',
    unlockAfterActId: 'act3',
    themes: ['情绪修复', '同伴支持', '经验转化']
  },
  {
    actId: 'act5',
    actNumber: 5,
    title: '期末与手册',
    subtitle: '长期成长篇',
    description: '面对期末压力和新的信息陷阱，把一学期经历沉淀成真正可用的新生手册。',
    startNodeId: 'act5_final_month',
    unlockAfterActId: 'act4',
    themes: ['期末压力', '互助网络', '入学手册']
  },
  {
    actId: 'act6',
    actNumber: 6,
    title: '大二分岔口',
    subtitle: '能力定向篇',
    description: '从新生适应进入长期成长，选择学业科研、校园安全、组织管理或继续探索。',
    startNodeId: 'act6_sophomore_crossroads',
    unlockAfterActId: 'act5',
    themes: ['专业成长', '项目协作', '方向选择']
  },
  {
    actId: 'act7',
    actNumber: 7,
    title: '大三选择题',
    subtitle: '未来路径篇',
    description: '面对升学、实习、公共服务和焦虑比较，学会核验机会并承认取舍。',
    startNodeId: 'act7_junior_choice',
    unlockAfterActId: 'act6',
    themes: ['升学就业', '价值取舍', '机会核验']
  },
  {
    actId: 'act8',
    actNumber: 8,
    title: '毕业去向',
    subtitle: '人生结局篇',
    description: '大四毕业季，根据四年的长期选择触发不同大学人生结局。',
    startNodeId: 'act8_senior_year',
    unlockAfterActId: 'act7',
    themes: ['毕业选择', '人生路线', '长期复盘']
  }
]

export function getStoryNode(id: string): StoryNode | undefined {
  return STORY_NODES[id]
}

export function getFirstNode(): StoryNode {
  return STORY_NODES.act1_start
}

export function getChapterStartNode(actId: string): StoryNode | undefined {
  const chapter = CHAPTERS.find(item => item.actId === actId)
  return chapter ? STORY_NODES[chapter.startNodeId] : undefined
}

export function getUnlockedActIds(state: GameState, hasAutosave = false, persistedActIds: string[] = []): string[] {
  const unlocked = new Set<string>(['act1', ...persistedActIds])
  const visited = new Set(state.visitedNodes)

  if (hasAutosave || state.currentActId === 'act2' || state.currentActId === 'act3' || visited.has('act1_end') || visited.has('act2_military_training')) {
    unlocked.add('act2')
  }

  if (state.currentActId === 'act3' || visited.has('act3_honey_trap') || visited.has('act2_part_time_hook') || visited.has('act2_xiaojie_warning')) {
    unlocked.add('act3')
  }

  if (state.currentActId === 'act4' || state.currentActId === 'act5' || visited.has('act4_rebuild_week') || visited.has('ending_anti_fraud_star') || visited.has('ending_growth') || visited.has('ending_social_leader') || visited.has('ending_study_growth') || visited.has('ending_survival_crisis')) {
    unlocked.add('act4')
  }

  if (state.currentActId === 'act5' || visited.has('act5_final_month') || visited.has('act4_club_project')) {
    unlocked.add('act5')
  }

  if (state.currentActId === 'act6' || state.currentActId === 'act7' || state.currentActId === 'act8' || visited.has('act6_sophomore_crossroads') || visited.has('act5_first_year_close')) {
    unlocked.add('act6')
  }

  if (state.currentActId === 'act7' || state.currentActId === 'act8' || visited.has('act7_junior_choice') || visited.has('act6_relationship_test')) {
    unlocked.add('act7')
  }

  if (state.currentActId === 'act8' || visited.has('act8_senior_year') || visited.has('act7_value_conflict')) {
    unlocked.add('act8')
  }

  return [...unlocked]
}

export function getNodeChoices(node: StoryNode | null, state: GameState): PlayerChoice[] {
  if (!node) {
    return []
  }

  return getAvailableChoices(node.playerChoices, state.flags)
}

export function canEnterNode(node: StoryNode, state: GameState): boolean {
  return doFlagsMatch(state.flags, node.requiredFlags)
}
