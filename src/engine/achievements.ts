import type { AchievementItem, GameState, SaveSlotMeta } from '../data/types'

export function getAchievements(state: GameState, saveSlots: SaveSlotMeta[] = [], syncedAchievementIds: string[] = []): AchievementItem[] {
  const flags = state.flags
  const visited = new Set(state.visitedNodes)
  const synced = new Set(syncedAchievementIds)
  const latestAct = saveSlots.reduce((max, save) => {
    const act = Number(save.currentActId.replace('act', ''))
    return Number.isFinite(act) ? Math.max(max, act) : max
  }, state.currentAct)

  const items: AchievementItem[] = [
    {
      id: 'orientation',
      title: '初入校园',
      description: '完成第一段迎新适应，认识校园里的第一批重要人物。',
      unlockHint: '进入或完成迎新周。',
      category: '适应',
      unlocked: visited.has('act1_end') || latestAct >= 1
    },
    {
      id: 'first_help',
      title: '第一次求助',
      description: '在压力或风险出现时，主动使用老师或学校正规渠道。',
      unlockHint: '找王老师、辅导员或校内勤工助学渠道确认。',
      category: '求助',
      unlocked: Boolean(flags.askedWorkStudy || flags.askedCounselorEarly || flags.askedAcademicHelp || flags.askedForHelp || flags.completedCounselorReview)
    },
    {
      id: 'evidence_keeper',
      title: '证据保存者',
      description: '面对可疑兼职或诈骗链条时，没有删除关键信息。',
      unlockHint: '保存截图、合同、聊天记录或转账证据。',
      category: '反诈',
      unlocked: Boolean(flags.savedScreenshots || flags.preservedEvidenceAfterScam || flags.evidenceBuilt)
    },
    {
      id: 'pause_before_transfer',
      title: '转账前停下',
      description: '在保证金、押金或解锁费出现时，没有被冲动推着走。',
      unlockHint: '在保证金节点拒绝付款、举报或求助。',
      category: '反诈',
      unlocked: Boolean(flags.reportedScam || flags.avoidedScam || flags.pausedBeforeDeposit || flags.askedForHelp)
    },
    {
      id: 'anti_fraud_star',
      title: '反诈之星',
      description: '识别并阻断校园兼职骗局，让风险没有继续扩散。',
      unlockHint: '成功举报骗局或完成反向验证。',
      category: '反诈',
      unlocked: state.endingId === 'anti_fraud_star' || Boolean(flags.counterTrapSucceeded || flags.reportedScam)
    },
    {
      id: 'peer_guardian',
      title: '同伴守望者',
      description: '没有让风险变成羞辱，而是把同伴一起拉回安全线。',
      unlockHint: '提醒大志、保护同学隐私或提醒班级。',
      category: '求助',
      unlocked: Boolean(flags.protectedDazhi || flags.warnedDazhiBeforeDeposit || flags.helpedClassmatesAvoidScam || flags.stoppedRumorSpread)
    },
    {
      id: 'ai_boundary',
      title: 'AI 工具边界',
      description: '把 AI 当成学习助手，而不是代写捷径。',
      unlockHint: '在期末阶段正确使用 AI 辅助复习。',
      category: '成长',
      unlocked: Boolean(flags.healthyAIToolUse)
    },
    {
      id: 'privacy_protector',
      title: '隐私保护者',
      description: '分享案例时保护当事人，不把教育变成围观。',
      unlockHint: '匿名化案例或制止二次传播。',
      category: '求助',
      unlocked: Boolean(flags.anonymousCaseShared || flags.wroteAnonymousSharingRule || flags.stoppedRumorSpread)
    },
    {
      id: 'steady_review',
      title: '稳定复盘者',
      description: '用复盘和计划修复学习、关系和长期项目。',
      unlockHint: '建立生活复盘、学习复盘或项目反馈表。',
      category: '成长',
      unlocked: Boolean(flags.weeklyReviewHabit || flags.reviewedFirstQuiz || flags.usedFeedbackTable || flags.finalsSleepPlan)
    },
    {
      id: 'graduation_route',
      title: '毕业路线完成',
      description: '走到毕业去向，形成自己的大学人生答案。',
      unlockHint: '到达任一第八章人生结局。',
      category: '毕业',
      unlocked: state.currentActId === 'act8' && Boolean(state.endingId?.includes('_')) && [...visited].some(node => node.startsWith('ending_'))
    }
  ]

  return items.map(item => ({
    ...item,
    unlocked: item.unlocked || synced.has(item.id),
    synced: synced.has(item.id)
  }))
}

export function getUnlockedAchievementIds(state: GameState, saveSlots: SaveSlotMeta[] = [], syncedAchievementIds: string[] = []): string[] {
  return getAchievements(state, saveSlots, syncedAchievementIds).filter(item => item.unlocked).map(item => item.id)
}
