import type { EducationCard, GameState, PlayerChoice, StoryNode } from '../types'

const EDUCATION_CARDS: Record<string, EducationCard> = {
  first_week_review: {
    id: 'first_week_review',
    title: '第一周适应复盘',
    category: '学习适应',
    body: '大学适应不是一次性完成的。学习节奏、室友边界、社团选择和求助意识，会一起影响新生的安全感。',
    checklist: ['把课程任务写进日程', '和室友约定基本作息边界', '遇到不确定情况先找可靠渠道确认'],
    campusAction: '建议把辅导员、班委、学院官网和校内服务入口保存到手机常用联系人或书签。'
  },
  dorm_boundary: {
    id: 'dorm_boundary',
    title: '宿舍沟通不是站队',
    category: '宿舍生活',
    body: '长期共同生活需要可执行的规则，而不是靠忍耐或情绪爆发解决问题。',
    checklist: ['描述具体行为，不评价人格', '把规则写清楚，例如安静时间和外放边界', '冲突升级前寻求宿管或辅导员协助'],
    campusAction: '学校可以把宿舍公约模板作为新生入住宿舍的第一份协作任务。'
  },
  academic_integrity: {
    id: 'academic_integrity',
    title: '学术诚信也是风险教育',
    category: '学习适应',
    body: '抄作业看似节省时间，但会削弱真实能力，也会让新生习惯用捷径处理压力。',
    checklist: ['不会做时先标记问题', '使用老师、助教、学习小组等正规求助渠道', '提交前确认答案来自自己的理解'],
    campusAction: '建议在入学教育中把作业诚信、AI 工具边界和课程求助路径放在同一页说明。'
  },
  academic_pressure: {
    id: 'academic_pressure',
    title: '第一次波动很正常',
    category: '心理支持',
    body: '新生第一次小测或作业失利，常常会放大自我怀疑。越是在低落时，越不要用高风险机会证明自己。',
    checklist: ['把失利拆成具体问题', '找老师、助教或学习小组求助', '情绪低落时延迟兼职、转账和合同决定'],
    campusAction: '新生手册可以把学业支持、心理支持和风险决策提醒放在同一个场景里讲。'
  },
  budget_work_study: {
    id: 'budget_work_study',
    title: '缺钱时先找正规渠道',
    category: '求助路径',
    body: '生活费压力会放大兼职诱惑。越焦虑，越需要把选择放回学校认证渠道里核验。',
    checklist: ['先做基础预算', '优先查询校内勤工助学', '任何先交钱的兼职都暂停处理'],
    campusAction: '学校可在新生手册中固定展示勤工助学、资助中心和心理支持入口。'
  },
  privacy_minimization: {
    id: 'privacy_minimization',
    title: '问卷不该索要过量隐私',
    category: '反诈安全',
    body: '真实校园活动通常能说明主办方、备案信息和用途。身份证、银行卡、家庭经济情况等敏感信息不应随手填写。',
    checklist: ['核对主办方和活动备案', '不在陌生问卷里填写证件和银行卡', '对方催促补全隐私时立即提高警惕'],
    campusAction: '学校可以统一活动备案查询入口，让学生能快速判断问卷和招募是否真实。'
  },
  verify_before_trust: {
    id: 'verify_before_trust',
    title: '信任需要证据',
    category: '反诈安全',
    body: '到账截图、熟人推荐、营业执照照片都可能被设计成降低警惕的道具。判断兼职要看主体、合同、账户和支付逻辑是否一致。',
    checklist: ['用官方企业查询渠道核验主体', '保存聊天记录和文件原图', '不要被第一次小额到账解除警惕'],
    campusAction: '反诈课程可把“先给甜头再收费”作为高频校园案例重点讲解。'
  },
  stop_before_transfer: {
    id: 'stop_before_transfer',
    title: '转账前停一下',
    category: '反诈安全',
    body: '保证金、押金、解锁费、培训费是校园兼职骗局的高危信号。已经投入时间并不代表必须继续投入金钱。',
    checklist: ['凡是先交钱，一律暂停', '保留对方收款账户和聊天记录', '找辅导员、保卫处或反诈平台核验'],
    campusAction: '入学手册应把“转账前求助”做成醒目的固定流程，而不是藏在长篇说明里。'
  },
  help_is_strength: {
    id: 'help_is_strength',
    title: '求助是成熟选择',
    category: '心理支持',
    body: '差点被骗或已经被骗都不丢脸。拖延、隐瞒和自责会扩大损失，及时求助才是止损。',
    checklist: ['截图保存证据', '第一时间联系辅导员或保卫处', '涉及转账时同步咨询警方或反诈平台'],
    campusAction: '学校合作版本应支持把本校辅导员、保卫处、资助中心电话配置到结局复盘页。'
  },
  evidence_after_scam: {
    id: 'evidence_after_scam',
    title: '被骗后先保留证据',
    category: '求助路径',
    body: '被骗后的羞耻感会让人想删除记录、独自承担，但证据越完整，止损和提醒他人的机会越大。',
    checklist: ['不要删除聊天和群记录', '保存转账截图、收款账户和推荐链条', '尽快联系辅导员、保卫处或警方反诈渠道'],
    campusAction: '学校应把“被骗后怎么办”写成清晰流程，避免学生因为害怕被责备而拖延求助。'
  },
  recovery_after_risk: {
    id: 'recovery_after_risk',
    title: '风险事件后的修复',
    category: '心理支持',
    body: '风险教育不能停在“你做错了”。真正的教育还要帮助学生修复学习节奏、人际关系和自我评价。',
    checklist: ['复盘原因而不是责备人格', '把学习缺口拆成可补救任务', '照顾当事人的羞耻感和隐私边界'],
    campusAction: '学校合作版本可以把事件后辅导、学业补救和同伴支持做成连续流程。'
  },
  peer_education_boundary: {
    id: 'peer_education_boundary',
    title: '分享案例也要保护人',
    category: '宿舍生活',
    body: '真实案例有教育价值，但公开分享时要尊重当事人的隐私、情绪和选择权。',
    checklist: ['优先匿名化处理', '不把差点被骗的人当反面教材', '分享方法和流程，而不是传播羞耻'],
    campusAction: '班会和入学教育可使用匿名案例模板，避免二次伤害。'
  },
  secondary_spread_boundary: {
    id: 'secondary_spread_boundary',
    title: '防止二次伤害',
    category: '宿舍生活',
    body: '安全提醒在传播过程中容易变成猜测、围观和玩梗。教育内容应当保留方法，去掉可识别个人的信息。',
    checklist: ['删除姓名、头像、宿舍号和可识别截图', '制止猜人名和羞辱性玩笑', '把转发重点放在求助流程和核验方法'],
    campusAction: '学校可提供统一的匿名案例发布模板，帮助班级传播提醒时保护当事人。'
  },
  final_exam_integrity: {
    id: 'final_exam_integrity',
    title: '期末资料也要核验',
    category: '学习适应',
    body: '期末压力下，“保过资料包”“代写报告”“内部答案”会变成新的风险入口，也可能触碰学术诚信红线。',
    checklist: ['不购买来源不明资料包', '不找代写和保过服务', '优先使用老师、助教和正规学习小组资源'],
    campusAction: '新生手册应把反诈和学术诚信放在同一套期末风险提醒里。'
  },
  ai_tool_boundary: {
    id: 'ai_tool_boundary',
    title: 'AI 工具也需要边界',
    category: '学习适应',
    body: 'AI 可以帮助解释概念、整理提纲和练习表达，但不能替代真实理解，也不能变成代写作业的捷径。',
    checklist: ['用 AI 问思路，不直接提交生成答案', '回到教材、课堂和助教渠道核对结论', '了解课程对 AI 使用的具体要求'],
    campusAction: '学校合作版可把 AI 使用规范、学术诚信和课程求助入口放进同一组互动任务。'
  },
  family_pressure_support: {
    id: 'family_pressure_support',
    title: '和家人谈压力也需要方法',
    category: '心理支持',
    body: '新生常常把压力藏起来，担心家人失望。更健康的沟通，是同时说出现状、计划和已经使用的求助资源。',
    checklist: ['描述具体困难而不是只说“我不行”', '同步自己的下一步计划', '必要时请辅导员协助说明学校支持渠道'],
    campusAction: '入学手册可加入“如何向家人说明学业、生活费和心理压力”的沟通模板。'
  },
  handbook_transfer: {
    id: 'handbook_transfer',
    title: '把经历变成可执行手册',
    category: '求助路径',
    body: '好的入学手册不是喊口号，而是把真实场景拆成学生能马上照做的步骤。',
    checklist: ['使用场景化流程', '给出明确求助入口', '把“不要做什么”改成“下一步做什么”'],
    campusAction: '后续学校合作时，可把每个学院的真实电话、网站和服务点配置进手册。'
  },
  long_term_direction: {
    id: 'long_term_direction',
    title: '能力会长成方向',
    category: '学习适应',
    body: '大学的方向不是一次选出来的，而是由长期投入、复盘和取舍慢慢长出来的。',
    checklist: ['记录自己反复投入的事情', '区分真实兴趣和短期焦虑', '把能力迁移到更长期的项目里'],
    campusAction: '入学教育后续版本可以加入“大二方向复盘”，帮助学生把新生经验转成长期路径。'
  },
  feedback_iteration: {
    id: 'feedback_iteration',
    title: '反馈不是否定',
    category: '学习适应',
    body: '从新生到成熟学习者的重要变化，是能把老师和同伴的反馈拆成可执行的下一步，而不是只感到受挫。',
    checklist: ['记录反馈对应的证据', '把模糊批评改写成具体问题', '约定下一版的完成标准和截止时间'],
    campusAction: '学校可在项目制课程和入学教育中训练学生使用“问题、证据、下一步”的反馈表。'
  },
  opportunity_verification: {
    id: 'opportunity_verification',
    title: '机会越大越要核验',
    category: '反诈安全',
    body: '大三以后，风险不只来自明显骗局，也来自包装精美但交付模糊的训练营、内推和项目机会。',
    checklist: ['核验主体和合同', '警惕高额预付费和过度承诺', '把机会成本也写进判断表'],
    campusAction: '学校可在就业指导中加入“机会核验清单”，连接反诈教育和职业发展教育。'
  },
  expectation_management: {
    id: 'expectation_management',
    title: '别人的时间线不是判决书',
    category: '心理支持',
    body: '升学就业阶段最容易被同辈比较和家庭期待推着走。清晰的路线需要把主线、备选、风险和退出条件写出来。',
    checklist: ['区分自己的目标和外界期待', '为每条路线写出成本和备选方案', '在高焦虑状态下延迟高额付费决定'],
    campusAction: '生涯教育可以把家庭沟通、就业指导和机会核验合并成一套路线咨询流程。'
  },
  sustainable_choice: {
    id: 'sustainable_choice',
    title: '取舍是成年能力',
    category: '心理支持',
    body: '长期成长不是把所有机会抓住，而是能判断哪些值得深耕、哪些需要放下。',
    checklist: ['确认本阶段主线目标', '把不可持续的任务删掉', '用睡眠和情绪状态校验计划是否过载'],
    campusAction: '生涯教育应把“如何拒绝”和“如何缩小范围”纳入训练。'
  },
  graduation_reflection: {
    id: 'graduation_reflection',
    title: '毕业不是单点结局',
    category: '求助路径',
    body: '大学人生结局不是一份 offer 或录取通知，而是四年里形成的判断力、关系网络和自我修复能力。',
    checklist: ['整理作品和复盘材料', '识别自己的长期能力', '允许自己选择深造、工作、服务或恢复'],
    campusAction: '学校合作版可在毕业季生成个人成长报告，连接入学教育与毕业发展。'
  },
  graduation_safety: {
    id: 'graduation_safety',
    title: '毕业季也有风险入口',
    category: '反诈安全',
    body: '毕业季的签约、租房、档案、离校手续和培训机会都可能被包装成“内部渠道”。越临近截止，越要回到官方入口核验。',
    checklist: ['通过学校官网确认手续入口', '不把证件和费用交给陌生代办', '签约、租房和培训付款前保留合同并找可信渠道核对'],
    campusAction: '学校可在毕业季提供官方手续清单和风险提醒，把安全教育延伸到离校阶段。'
  }
}

const NODE_CARD_MAP: Record<string, string> = {
  act1_node6: 'dorm_boundary',
  act1_node8: 'academic_integrity',
  act1_node9: 'academic_integrity',
  act1_end: 'first_week_review',
  act2_first_quiz: 'academic_pressure',
  act2_living_expense: 'budget_work_study',
  act3_contract: 'privacy_minimization',
  act3_paid_once: 'verify_before_trust',
  act3_deposit: 'stop_before_transfer',
  act3_after_scam: 'evidence_after_scam',
  act4_rebuild_week: 'recovery_after_risk',
  act4_peer_pressure: 'peer_education_boundary',
  act4_second_wave: 'secondary_spread_boundary',
  act4_dazhi_confession: 'budget_work_study',
  act4_xiaojie_secret: 'evidence_after_scam',
  act4_xuejie_tired: 'help_is_strength',
  act5_final_month: 'final_exam_integrity',
  act5_exam_pressure: 'ai_tool_boundary',
  act5_winter_loneliness: 'family_pressure_support',
  act5_xuejie_farewell: 'help_is_strength',
  act5_family_call: 'family_pressure_support',
  act5_manual_review: 'handbook_transfer',
  act6_sophomore_crossroads: 'long_term_direction',
  act6_roommate_drift: 'family_pressure_support',
  act6_xiaoming_breakdown: 'help_is_strength',
  act6_midterm_feedback: 'feedback_iteration',
  act7_family_expectation: 'expectation_management',
  act7_imposter_syndrome: 'help_is_strength',
  act7_quiet_connection: 'sustainable_choice',
  act7_internship_offer: 'opportunity_verification',
  act7_value_conflict: 'sustainable_choice',
  act8_graduation_pressure: 'graduation_safety',
  act8_final_choice: 'graduation_reflection',
  ending_survival_crisis: 'help_is_strength',
  ending_growth: 'help_is_strength'
}

const CHOICE_CARD_MAP: Record<string, string> = {
  a2_c1c_counselor: 'budget_work_study',
  a3_c1_fill: 'privacy_minimization',
  a3_c1_partial: 'privacy_minimization',
  a3_c1_refuse: 'privacy_minimization',
  a3_c2_verify: 'verify_before_trust',
  a3_c3_check: 'verify_before_trust',
  a3_c5_pay: 'stop_before_transfer',
  a3_c5_report: 'stop_before_transfer',
  a3_c5_ask_help: 'help_is_strength'
}

export function getEducationCardForProgress(
  choice: PlayerChoice,
  nextNode: StoryNode,
  state: GameState
): EducationCard | null {
  const cardId = CHOICE_CARD_MAP[choice.id] ?? NODE_CARD_MAP[nextNode.id]
  if (!cardId) {
    return null
  }

  const visitedKey = `education:${cardId}`
  if (state.flags[visitedKey]) {
    return null
  }

  return EDUCATION_CARDS[cardId] ?? null
}
