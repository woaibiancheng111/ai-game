import { DEFAULT_SCHOOL_CONFIG } from '../data/school/defaultConfig'
import type { EndingReport, GameState, SchoolConfig } from '../data/types'

type EndingReportDraft = Omit<EndingReport, 'growthSummary'> & { growthSummary?: string }

const LEVEL_COLORS = {
  good: '#4ade80',
  normal: '#fbbf24',
  bad: '#f87171'
}

export function getEndingLevelColor(level: EndingReport['level']): string {
  return LEVEL_COLORS[level]
}

export function createEndingReport(state: GameState, schoolConfig: SchoolConfig = DEFAULT_SCHOOL_CONFIG): EndingReport {
  const { flags, endingId, playerStatus } = state
  const isFinal = state.currentActId === 'act8' && Boolean(endingId?.includes('_'))
  const scammed = Boolean(flags.gotScammed || endingId === 'survival_crisis')
  const schoolContacts = schoolConfig.contacts.slice(0, 3)

  if (scammed && !isFinal) {
    return withGrowth(state, {
      title: '生存危机',
      typeLabel: '阶段复盘',
      description: '你缴纳保证金后被拉黑，生活费骤降，情绪也受到冲击。重要的是，故事没有停在被骗那一刻。被骗不是人格失败，而是一次需要留证、求助、止损和复盘的风险事件。',
      level: 'bad',
      scammed: true,
      routeTags: ['保证金风险', '被骗止损', '求助路径'],
      npcReview: '王老师：被骗不是丢脸，继续隐瞒才危险。保留证据、及时求助，是止损的第一步。',
      pitfallTip: '凡是兼职要求先交保证金、押金、解锁费，都应立即停止并核验。真实工作不会靠转账制造门槛。',
      handbookAdvice: ['被骗后先保存证据，不删除聊天记录', '联系辅导员、保卫处或警方反诈渠道', '生活费压力优先走资助中心和勤工助学'],
      nextActions: ['不要删除聊天和转账记录', '联系学校安全与辅导员入口', '复盘生活费压力来源'],
      schoolContacts
    })
  }

  if (endingId === 'research_scholar') {
    return withGrowth(state, withFinalScamStatus(finalReport('可信技术研究者', '你继续深造，研究可信 AI、数字安全和学生风险教育。你没有忘记最初的问题：为什么聪明的新生也会在压力下相信危险承诺。', ['科研深造', '可信技术', '风险教育'], '林雨薇：你把自己的经历变成了一个值得长期追问的问题。', schoolContacts), state))
  }

  if (endingId === 'product_guardian') {
    return withGrowth(state, withFinalScamStatus(finalReport('产品安全守护者', '你进入企业做用户安全和产品风控。你知道真正的安全设计，不只是拦住坏人，也要理解普通人为什么会在压力下做错判断。', ['产品风控', '用户安全', '压力情境'], '小杰：你终于把“别转钱”升级成了“让系统帮人多一次刹车”。', schoolContacts), state))
  }

  if (endingId === 'campus_educator') {
    return withGrowth(state, withFinalScamStatus(finalReport('校园教育共创者', `你和${schoolConfig.schoolName}一起把新生手册做成互动课程。每年九月，你都会看见新的学生站在校门口，而你知道他们会多一条求助路径。`, ['入学教育', '互动课程', '学校合作'], '王老师：你没有只留下一个故事，你留下了一套能被后来者练习的方法。', schoolContacts), state))
  }

  if (endingId === 'peer_network_builder') {
    return withGrowth(state, withFinalScamStatus(finalReport('同伴网络建设者', '你把互助小组扩展成跨学院网络。它不完美，也不总是热闹，但当有人说“我差点转钱，能帮我看一下吗”，总有人回应。', ['同伴互助', '匿名求助', '跨学院协作'], '大志：以前我只会转发热闹，现在我会先问一句，大家帮忙看看。', schoolContacts), state))
  }

  if (endingId === 'resilient_restart') {
    return withGrowth(state, {
      ...withFinalScamStatus(finalReport('韧性重启', '你没有用一份漂亮去向证明自己，而是学会在需要时停下、修复、重新选择。你的大学不是爽文结局，却很真实，也很有力量。', ['自我修复', '延迟选择', '韧性成长'], '王老师：能照顾好自己的人，才有机会走更远的路。', schoolContacts), state),
      level: 'normal'
    })
  }

  if (endingId === 'burnout_warning' || playerStatus.mood < 35 || playerStatus.gpa < 2) {
    return withGrowth(state, {
      title: endingId === 'burnout_warning' ? '过载警告' : '迷茫警告',
      typeLabel: isFinal ? '最终人生结局' : '阶段复盘',
      description: '你拿到了不少机会，却几乎透支了自己。毕业或阶段结束不是失败，但它提醒你：如果总用燃烧换结果，身体和关系迟早会替你按下暂停。',
      level: 'bad',
      scammed: false,
      routeTags: ['过载识别', '任务取舍', '心理支持'],
      npcReview: '林雨薇：你不是不够努力，你是太久没有把自己也放进计划里。',
      pitfallTip: '过载不是荣誉勋章。长期忽视睡眠、情绪和关系，会让再好的机会变成风险，甚至让努力本身失去方向。',
      handbookAdvice: ['暂停新增承诺', '联系可信老师或心理中心', '把任务按必须、可延后、可放弃重新排序'],
      nextActions: ['恢复睡眠和饮食', '预约学校心理支持', '缩小近期任务范围'],
      schoolContacts
    })
  }

  if (endingId === 'anti_fraud_star' || flags.counterTrapSucceeded || flags.reportedScam) {
    return withGrowth(state, {
      title: '反诈骗之星',
      typeLabel: '阶段复盘',
      description: '你没有被到账截图和熟人推荐冲昏头脑，而是保存证据、核验主体、及时求助，最终帮同学们避开骗局。',
      level: 'good',
      scammed: false,
      routeTags: ['信息核验', '证据保存', '校园协作'],
      npcReview: '小杰：你不是不信任所有人，你是在学会让信任有证据。',
      pitfallTip: '截图、合同、营业执照、群聊关系都可以被伪造。第一次到账也可能是诱饵，要交叉验证。',
      handbookAdvice: ['把核验过程整理给班级同学', '提醒同伴不要转发未经核验的兼职', '用学校官方渠道查证社团、问卷和兼职'],
      nextActions: ['维护证据清单', '协助班级反诈提醒', '把可疑信息交给学校核验'],
      schoolContacts
    })
  }

  if (endingId === 'social_leader' || playerStatus.social >= 80) {
    return withGrowth(state, {
      title: '社交守望者',
      typeLabel: '阶段复盘',
      description: '你把风险识别变成了团队协作，没有让差点被骗的大志独自承受尴尬，也帮更多同学建立警惕。你守住的不只是钱，还有同伴重新求助的勇气。',
      level: 'good',
      scammed: false,
      routeTags: ['同伴支持', '熟人推荐风险', '班级传播'],
      npcReview: '大志：以后我转机会之前，先问一句靠谱吗。你这人，关键时候真稳。',
      pitfallTip: '社交圈会放大信息，也会放大风险。越是熟人推荐，越要保留核验动作，同时避免把教育变成羞辱。',
      handbookAdvice: ['建立班级风险提醒规则', '在班群提醒时避免羞辱差点被骗的同学', '可疑信息交给老师核验'],
      nextActions: ['继续维护同伴互助网络', '保留匿名求助入口', '把学习答疑和安全提醒连接起来'],
      schoolContacts
    })
  }

  if (endingId === 'study_growth' || playerStatus.gpa >= 3.35) {
    return withGrowth(state, {
      title: '学霸成长线',
      typeLabel: '阶段复盘',
      description: '你避开了骗局，也稳住了学习节奏。大学第一课不只是高数，还有在诱惑、压力和熟人建议之间守住自己的时间。',
      level: 'good',
      scammed: false,
      routeTags: ['学习节奏', '机会成本', '正规求助'],
      npcReview: '林雨薇：能把注意力收回来，是很重要的能力。你已经开始找到自己的节奏了。',
      pitfallTip: '高收益机会常常会挤占学习和休息。判断一件事值不值得做，也要算时间成本、情绪成本和退出条件。',
      handbookAdvice: ['保持课程任务清单', '把兼职和社团放进时间预算', '遇到高收益机会先问来源和风险'],
      nextActions: ['继续使用正规学习资源', '建立低状态延迟决策习惯', '定期复盘学业压力'],
      schoolContacts
    })
  }

  if (endingId === 'academic_tradeoff') {
    return withGrowth(state, {
      title: '独立思考的代价',
      typeLabel: '阶段复盘',
      description: '你靠自己查清骗局，但牺牲了期中复习。判断力提升了，时间管理也给你上了一课：自查重要，但不必把所有风险都扛成一个人的深夜战斗。',
      level: 'normal',
      scammed: false,
      routeTags: ['独立核验', '时间管理', '求助边界'],
      npcReview: '周小明：下次可以一起查，别把所有事都憋到凌晨。',
      pitfallTip: '自查很重要，但遇到诈骗风险时，学校老师、平台举报和警方渠道比单打独斗更可靠。',
      handbookAdvice: ['补回被挤占的复习时间', '把证据交给专业老师处理', '下次遇到风险时更早拉入可信同伴'],
      nextActions: ['恢复复习计划', '沉淀核验清单', '学会把专业风险交给专业渠道'],
      schoolContacts
    })
  }

  return withGrowth(state, {
    title: '及时求助',
    typeLabel: isFinal ? '最终人生结局' : '阶段复盘',
    description: '你在关键节点停了下来，把风险交给更专业的人处理。这不是退缩，而是成熟的安全选择。',
    level: 'normal',
    scammed: false,
    routeTags: ['转账前暂停', '留证求助', '新生判断力'],
    npcReview: '王老师：能在最后一步停住，就是一次胜利。',
    pitfallTip: '面对不确定风险，最稳妥的选择是暂停、留证、求助，而不是立刻证明自己判断没错。能回头也是能力。',
    handbookAdvice: ['建立转账前二次确认习惯', '保存学校求助电话', '把可疑信息交给辅导员或保卫处核验'],
    nextActions: ['整理本局复盘', '更新自己的求助联系人', '把经验转成可执行清单'],
    schoolContacts
  })
}

function finalReport(title: string, description: string, routeTags: string[], npcReview: string, schoolContacts: EndingReport['schoolContacts']): EndingReport {
  return {
    title,
    typeLabel: '最终人生结局',
    description,
    level: 'good',
    scammed: false,
    routeTags,
    npcReview,
    pitfallTip: '大学人生结局不是一份 offer 或录取通知，而是四年里形成的判断力、关系网络和自我修复能力。',
    handbookAdvice: ['整理作品和复盘材料', '识别自己的长期能力', '允许自己选择深造、工作、服务或恢复'],
    nextActions: ['沉淀个人成长报告', '保留关键项目材料', '把经验反馈给下一届新生'],
    schoolContacts,
    growthSummary: ''
  }
}

function withFinalScamStatus(report: EndingReport, state: GameState): EndingReport {
  return {
    ...report,
    scammed: Boolean(state.flags.gotScammed || state.endingId === 'survival_crisis')
  }
}

function withGrowth(state: GameState, report: EndingReportDraft): EndingReport {
  const strengths: string[] = []
  if (state.playerStatus.antiFraudAwareness >= 70 || state.flags.reportedScam) strengths.push('风险识别')
  if (state.playerStatus.gpa >= 3.3 || state.flags.stableStudyRhythm) strengths.push('学习节奏')
  if (state.playerStatus.social >= 70 || state.flags.helpedClassmatesAvoidScam) strengths.push('同伴协作')
  if (state.flags.healthyAIToolUse) strengths.push('AI 工具边界')
  if (state.flags.weeklyReviewHabit || state.flags.usedFeedbackTable) strengths.push('复盘能力')
  if (state.flags.deepBondWithXuejie || state.flags.dazhiOpenedUp || state.flags.xiaojieRevealedPast || state.flags.supportedXiaomingBreakdown) strengths.push('人物羁绊')
  if (state.flags.wroteWinterReflection || state.flags.admittedImposterSyndrome) strengths.push('情感韧性')

  return {
    ...report,
    growthSummary: strengths.length > 0
      ? `你的关键成长能力集中在：${strengths.join('、')}。`
      : '你已经开始建立大学生活的判断力，下一步是把求助、复盘和风险核验变成稳定习惯。'
  }
}
