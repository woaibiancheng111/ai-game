import type { StoryNode } from '../types'

export const ACT3_NODES: Record<string, StoryNode> = {
  act3_honey_trap: {
    id: 'act3_honey_trap',
    actId: 'act3',
    title: '蜂蜜陷阱',
    description: '第六周，小美在食堂门口拦住你，邀请你做"新生适应问卷"。她穿着浅色志愿者马甲，笑容自然，手里还有一叠校园周边指南。问题听起来都很合理：课业压力、生活费够不够、是否考虑兼职。手机里，兼职群正热闹地讨论第一批任务。你忽然发现，信息被索取时如果披着关心的外衣，很难立刻说不。',
    location: '食堂门口',
    week: 6,
    day: 2,
    npcId: 'xiaomei',
    imagePrompt: '大学食堂门口，热情志愿者拿着问卷和校园周边指南，新生低头看手机兼职群消息',
    setFlags: { scamLineStarted: true },
    playerChoices: [
      {
        id: 'a3_c1_fill',
        text: '填写问卷，顺便留下联系方式',
        nextNodeId: 'act3_contract',
        statusChanges: { trust: 12, mood: 4, antiFraudAwareness: -5 },
        affectionChanges: { xiaomei: 8, li_xuezhang: 3 },
        setFlags: { tookQuestionnaire: true, leakedPersonalInfo: true },
        narrativeText: '问卷问题很普通，你几乎是顺手填完了。小美递来校园指南，笑着说后续会给你匹配适合的兼职方向。你甚至感谢了她，完全没意识到自己刚把压力、需求和联系方式整理成了一份可利用的画像。'
      },
      {
        id: 'a3_c1_partial',
        text: '只填非隐私信息，不留身份证和银行卡',
        nextNodeId: 'act3_contract',
        statusChanges: { antiFraudAwareness: 8, trust: -2, mood: 1 },
        affectionChanges: { xiaojie: 4, xiaomei: -2 },
        setFlags: { tookQuestionnaire: true, protectedPrivateInfo: true },
        narrativeText: '小美笑容没有变，只是轻轻催你补全信息："这样匹配更准。"那一瞬间你心里停了一拍。你把问卷拍照保存，第一次在温柔的语气里听见一点不自然的急。'
      },
      {
        id: 'a3_c1_refuse',
        text: '婉拒问卷，询问活动备案信息',
        nextNodeId: 'act3_verify',
        statusChanges: { antiFraudAwareness: 14, trust: -8, social: -2 },
        affectionChanges: { xiaojie: 8, xiaomei: -6 },
        setFlags: { refusedQuestionnaire: true, askedForFiling: true },
        narrativeText: '小美短暂卡壳，说负责人不在，备案表晚点发。你注意到她胸牌上的学院名称和学校官网写法不一致。这个细节很小，小到如果不是小杰提醒过，你大概会把它归为"可能是临时印错"。'
      }
    ]
  },

  act3_contract: {
    id: 'act3_contract',
    actId: 'act3',
    title: '真假难辨',
    description: '张总加了你的微信，头像是一张商务照，朋友圈只有几条公司团建和招聘海报。他发来线上兼职合同、营业执照照片和结算规则，每一项都像在回答你的担心。李学长说："我上学期也做过，流程差不多。"大志已经开始接第一单。骗局最厉害的地方不是粗糙，而是它知道你需要什么样的真实感。',
    location: '宿舍楼 308',
    week: 7,
    day: 1,
    npcId: 'zhang_zong',
    imagePrompt: '手机聊天界面显示合同和营业执照照片，宿舍桌面上摊着课程资料，真假难辨的氛围',
    playerChoices: [
      {
        id: 'a3_c2_start',
        text: '接下第一单，先试一周',
        nextNodeId: 'act3_first_task',
        statusChanges: { money: 300, trust: 14, mood: 8, energy: -12, antiFraudAwareness: -4 },
        affectionChanges: { dazhi: 8, li_xuezhang: 5, xiaojie: -4 },
        setFlags: { firstTaskDone: true, firstPaymentReceived: true },
        narrativeText: '你熬夜完成任务。三天后，300 元真的到账了。到账提示响起时，你心里的防线不是倒塌，而是悄悄让开了一条缝。群里一片欢呼，大志差点从椅子上跳起来。'
      },
      {
        id: 'a3_c2_verify',
        text: '先核验营业执照和合同图片',
        nextNodeId: 'act3_verify',
        statusChanges: { antiFraudAwareness: 12, trust: -8, energy: -8, gpa: -0.04 },
        affectionChanges: { xiaojie: 10, li_xuezhang: -4 },
        setFlags: { checkedLicense: true, savedScreenshots: true },
        narrativeText: '你用图片搜索和企业查询工具查了半小时，发现执照照片的字体边缘有拼接痕迹，公司名称也查不到。疑点摆在眼前时，你反而有点希望自己查错了。承认风险，意味着承认之前的心动也可能被人设计过。'
      },
      {
        id: 'a3_c2_ask_senior',
        text: '追问李学长具体风险',
        nextNodeId: 'act3_paid_once',
        statusChanges: { trust: 5, antiFraudAwareness: 4, social: 2 },
        affectionChanges: { li_xuezhang: -2, xiaojie: 3 },
        setFlags: { questionedLi: true, firstPaymentReceived: true },
        narrativeText: '李学长笑着转移话题："你别把每件事都想成坏事，第一周到账你就放心了。"他没有直接回答公司全称，也没有说清自己怎么认识张总。你的疑问没有消失，只是被他的熟人身份暂时压低了声音。'
      }
    ]
  },

  act3_first_task: {
    id: 'act3_first_task',
    actId: 'act3',
    title: '第一单任务',
    description: '张总发来的任务很简单：把一批图片里的文字录入表格。任务说明写得正规，群管理员还提醒大家不要泄露客户资料。你盯着那些图片，发现它们既不像机密文件，也不像完全随便拼出来的材料。越是半真半假，人越容易把缺口用自己的期待补上。',
    location: '宿舍楼 308',
    week: 7,
    day: 2,
    npcId: 'zhang_zong',
    imagePrompt: '深夜宿舍书桌，电脑表格、手机任务群、图片文字录入任务，看似正规的兼职细节',
    playerChoices: [
      {
        id: 'a3_c2b_finish_fast',
        text: '熬夜做完，争取第一批结算',
        nextNodeId: 'act3_paid_once',
        statusChanges: { money: 300, trust: 12, mood: 6, energy: -18, antiFraudAwareness: -4 },
        affectionChanges: { dazhi: 6, li_xuezhang: 4, xiaojie: -3 },
        setFlags: { firstTaskDone: true, firstPaymentReceived: true, overworkedForTask: true },
        narrativeText: '凌晨两点，表格终于提交。第二天中午，300 元真的到账，你盯着余额看了好几遍。那不是一笔大钱，却像一句证明：你可以靠自己解决生活里的某些问题。'
      },
      {
        id: 'a3_c2b_ask_sample',
        text: '只做样例任务，要求先看结算规则',
        nextNodeId: 'act3_paid_once',
        statusChanges: { money: 80, antiFraudAwareness: 7, trust: -2, energy: -6 },
        affectionChanges: { xiaojie: 5, li_xuezhang: -2 },
        setFlags: { firstPaymentReceived: true, askedSettlementRules: true },
        narrativeText: '你只做了样例，收到 80 元小额结算。张总说你太谨慎，语气里带着一点失望，像你辜负了一个好机会。接下来他开始频繁私聊催你接正式单，温和地把"选择"推成"别错过"。'
      },
      {
        id: 'a3_c2b_compare',
        text: '把任务截图发给小杰一起看',
        nextNodeId: 'act3_verify',
        statusChanges: { antiFraudAwareness: 12, trust: -8, energy: -6 },
        affectionChanges: { xiaojie: 10, wang_laoshi: 3 },
        setFlags: { sharedTaskWithXiaojie: true, savedScreenshots: true },
        narrativeText: '小杰把几张任务图片反搜出来，来源竟是公开网页，并不是所谓"客户资料"。这份工作突然没那么像工作了。小杰没有得意，只说："骗子不需要编全套，只要让你愿意补齐剩下的逻辑。"'
      }
    ]
  },

  act3_paid_once: {
    id: 'act3_paid_once',
    actId: 'act3',
    title: '第一次到账',
    description: '第一笔兼职工资到账后，世界短暂变得合理。阿强在朋友圈发："感谢张总，第一周就回本。"配图里奶茶、电脑、转账记录一应俱全，像任何一个普通大学生的碎片生活。小杰却提醒你：阿强的朋友圈时间线有删改痕迹，点赞的人也总是那几个。',
    location: '宿舍楼 308',
    week: 7,
    day: 5,
    npcId: 'xiaojie',
    imagePrompt: '手机转账到账提示、朋友圈工资截图、室友在旁边指出疑点，校园诈骗悬疑感',
    playerChoices: [
      {
        id: 'a3_c3_believe',
        text: '到账就是证据，继续相信张总',
        nextNodeId: 'act3_li_slip',
        statusChanges: { trust: 16, mood: 8, antiFraudAwareness: -6 },
        affectionChanges: { dazhi: 7, li_xuezhang: 5, xiaojie: -8 },
        setFlags: { ignoredXiaojie: true, deeplyTrustedScam: true },
        narrativeText: '你把到账截图发给小杰看，像把证据递给法官。他没有争辩，只说："骗子也会先给一点真的。"这句话让你不舒服，因为它不是否认事实，而是提醒你事实可能只是诱饵的一部分。'
      },
      {
        id: 'a3_c3_check',
        text: '和小杰一起查阿强和公司信息',
        nextNodeId: 'act3_verify',
        statusChanges: { antiFraudAwareness: 16, trust: -10, energy: -8, mood: -2 },
        affectionChanges: { xiaojie: 12, wang_laoshi: 4 },
        setFlags: { checkedLicense: true, checkedAqiang: true, listenedToXiaojie: true },
        narrativeText: '你们发现阿强的账号几乎只在兼职群活跃，朋友圈点赞的人高度重合，几张生活照也能在别处找到相似图。证据还不够，但疑点已经排成一列。你第一次明白，怀疑不是一句"我觉得"，而是一排能复查的线索。'
      },
      {
        id: 'a3_c3_wait',
        text: '暂时不扩大投入，只观察下一步',
        nextNodeId: 'act3_li_slip',
        statusChanges: { antiFraudAwareness: 6, trust: -2, mood: 1 },
        affectionChanges: { xiaojie: 5, dazhi: -2 },
        setFlags: { pausedBeforeDeposit: true },
        narrativeText: '你没有退出群，也没有继续投入更多时间。大志觉得你太保守，小杰却明显松了口气。暂停看起来什么都没做，但在被催促的局里，暂停本身就是一种反抗。'
      }
    ]
  },

  act3_verify: {
    id: 'act3_verify',
    actId: 'act3',
    title: '证据拼图',
    description: '你、小杰和王老师把截图、合同、营业执照、朋友圈动态放在一起。办公室的灯很白，所有聊天记录在纸上失去了群里的热闹，只剩下时间、话术和漏洞。单看每一项都像巧合，合起来却指向同一个结论：这很可能是一条专门筛选新生压力的诈骗链。',
    location: '辅导员办公室',
    week: 8,
    day: 2,
    npcId: 'wang_laoshi',
    imagePrompt: '辅导员办公室，桌上摊开截图和打印资料，学生和老师一起分析诈骗证据',
    setFlags: { evidenceBuilt: true },
    playerChoices: [
      {
        id: 'a3_c4_report_now',
        text: '立刻整理证据，准备举报',
        nextNodeId: 'act3_collapse',
        statusChanges: { antiFraudAwareness: 12, reputation: 8, trust: -8, mood: 5 },
        affectionChanges: { wang_laoshi: 12, xiaojie: 8 },
        setFlags: { readyToReport: true, savedScreenshots: true },
        narrativeText: '王老师帮你列出证据清单：聊天记录、转账截图、群成员关系、营业执照来源、引流人说法。你第一次知道求助不是把麻烦丢给别人，而是把混乱整理到可以处理的程度。'
      },
      {
        id: 'a3_c4_counter',
        text: '不急着揭穿，设计一次反向验证',
        nextNodeId: 'act3_counter_trap',
        statusChanges: { antiFraudAwareness: 10, reputation: 4, energy: -10, mood: 4 },
        affectionChanges: { xiaojie: 14, wang_laoshi: 6 },
        requiredFlags: { savedScreenshots: true },
        setFlags: { counterTrapReady: true },
        narrativeText: '小杰提出一个办法：要求对方先用企业账户打验证款，并把所有话术留证。王老师立刻划定边界："不私自冒险，不激怒对方，不转钱。我们只做核验和留证。"冷静不是胆大，是知道哪一步不能跨。'
      },
      {
        id: 'a3_c4_keep_job',
        text: '证据还不够，先继续做兼职看看',
        nextNodeId: 'act3_deposit',
        statusChanges: { trust: 8, antiFraudAwareness: -4, mood: -5 },
        affectionChanges: { xiaojie: -5, wang_laoshi: -4, li_xuezhang: 4 },
        setFlags: { hesitatedDespiteEvidence: true },
        narrativeText: '你害怕误会别人，也舍不得已经到手的钱。更深处，你害怕承认自己已经被人牵着走过一段。王老师没有责备，只让你答应：一旦要交钱，必须先停下来。'
      }
    ]
  },

  act3_li_slip: {
    id: 'act3_li_slip',
    actId: 'act3',
    title: '李学长的破绽',
    description: '你追问李学长张总公司的全称，他先说"我也只是朋友介绍"，又说"之前合作过很多次"。两句话隔得很近，却互相打架。大志听到这里也安静下来。你看见李学长脸上的笑容还在，只是那种熟人式的可靠感，开始像一张贴得不够牢的标签。',
    location: '宿舍楼下',
    week: 8,
    day: 6,
    npcId: 'li_xuezhang',
    imagePrompt: '宿舍楼下夜晚，学长拿着手机闪烁其词，新生和室友察觉破绽，骗局前夜',
    playerChoices: [
      {
        id: 'a3_c4b_press',
        text: '继续追问介绍链条和公司全称',
        nextNodeId: 'act3_collapse',
        statusChanges: { antiFraudAwareness: 12, trust: -10, reputation: 4 },
        affectionChanges: { xiaojie: 8, li_xuezhang: -8, dazhi: 3 },
        setFlags: { liContradicted: true, readyToReport: true },
        narrativeText: '李学长脸上的笑意淡了，最后只说："你要是不信就算了。"这句话没有回答问题，却替问题盖了章。你突然明白，真正可靠的人不会要求你用信任代替核验。'
      },
      {
        id: 'a3_c4b_smooth',
        text: '不想撕破脸，先装作相信',
        nextNodeId: 'act3_deposit',
        statusChanges: { trust: 5, mood: -3, antiFraudAwareness: 4 },
        affectionChanges: { li_xuezhang: 2, xiaojie: -2 },
        setFlags: { noticedLiContradiction: true, stayedPoliteToLi: true },
        narrativeText: '你把疑问压下去，没有当场翻脸。小杰发来一条消息："截图，别删。"这四个字像一根细针，把你从人情的雾里固定到事实面前。'
      },
      {
        id: 'a3_c4b_tell_dazhi',
        text: '先把大志拉到一边，提醒他别转钱',
        nextNodeId: 'act3_deposit',
        statusChanges: { social: 6, antiFraudAwareness: 8, trust: -5 },
        affectionChanges: { dazhi: 12, xiaojie: 5, li_xuezhang: -4 },
        setFlags: { warnedDazhiBeforeDeposit: true },
        narrativeText: '大志嘴上说你疑心重，手却已经把转账页面退了出去。他没有立刻承认害怕，只低声骂了一句脏话。你知道，他不是不懂风险，他只是不想承认自己差点把朋友推向风险。'
      }
    ]
  },

  act3_deposit: {
    id: 'act3_deposit',
    actId: 'act3',
    title: '雪崩时刻',
    description: '张总突然宣布：想解锁后续高额任务，需要缴纳 500 元保证金，一周后连本带利返还。消息发出后，群里先是一阵沉默，随后几个熟悉账号开始刷"已交"和"坐等返款"。与此同时，阿强的朋友圈删空了，李学长也开始不回消息。你看着转账页面，终于听见雪崩前那种细小的裂声。',
    location: '宿舍楼 308',
    week: 9,
    day: 1,
    npcId: 'zhang_zong',
    imagePrompt: '深夜宿舍，手机弹出保证金要求，朋友圈清空，聊天框无人回复，紧张的蓝紫色光影',
    setFlags: { depositRequested: true },
    playerChoices: [
      {
        id: 'a3_c5_pay',
        text: '缴纳 500 元保证金，赌一次大的',
        nextNodeId: 'act3_after_scam',
        statusChanges: { money: -500, mood: -25, trust: -20, reputation: -5, antiFraudAwareness: 12 },
        affectionChanges: { dazhi: -6, xiaojie: -8, wang_laoshi: -2 },
        setFlags: { gotScammed: true, paidDeposit: true },
        narrativeText: '转账后，张总回复越来越慢。你一开始替他解释：可能在忙，可能在统计，可能只是网络不好。第二天群被解散，李学长也把你删除。那一刻，第一次到账曾经带来的安全感彻底碎掉，你才发现自己不是突然被骗，而是一步步被训练着相信。'
      },
      {
        id: 'a3_c5_report',
        text: '拒绝缴费，带证据找王老师举报',
        nextNodeId: 'ending_anti_fraud_star',
        statusChanges: { reputation: 14, antiFraudAwareness: 12, mood: 12, trust: -8 },
        affectionChanges: { wang_laoshi: 16, xiaojie: 12, dazhi: 4 },
        setFlags: { reportedScam: true, avoidedScam: true },
        endingId: 'anti_fraud_star',
        narrativeText: '王老师立刻联系学院和保卫处。你们保住了自己的钱，也提醒了几个差点转账的新生。你没有像电影主角一样揭穿所有坏人，但你让一条链条在继续扩散前被迫停下。'
      },
      {
        id: 'a3_c5_ask_help',
        text: '承认自己差点被骗，向辅导员求助',
        nextNodeId: 'ending_growth',
        statusChanges: { mood: 10, antiFraudAwareness: 16, reputation: 6, trust: -6 },
        affectionChanges: { wang_laoshi: 14, xiaojie: 8, xuejie: 5 },
        setFlags: { askedForHelp: true, avoidedScam: true },
        endingId: 'growth',
        narrativeText: '王老师没有嘲笑你的犹豫，只说："能在转账前停下来，就是一次很重要的胜利。"你这才发现，教育里最需要被允许的，不是永远清醒，而是在快犯错时还能回头。'
      },
      {
        id: 'a3_c5_self_check',
        text: '自己继续调查，错过一部分期中复习',
        nextNodeId: 'ending_academic_tradeoff',
        statusChanges: { gpa: -0.22, antiFraudAwareness: 20, reputation: 8, energy: -18, mood: 2 },
        affectionChanges: { xiaojie: 10, xiaoming: -4, wang_laoshi: 6 },
        setFlags: { investigatedAlone: true, avoidedScam: true },
        endingId: 'academic_tradeoff',
        narrativeText: '你查清了骗局，也错过了两晚复习。期中成绩不算好，你心里并不轻松。可当你把证据交出去时，你知道自己学会了比一门课更贵重的东西：把模糊不安变成可验证的事实。'
      }
    ]
  },

  act3_after_scam: {
    id: 'act3_after_scam',
    actId: 'act3',
    title: '止损时刻',
    description: '被骗后的第一个小时格外漫长。你反复打开转账记录，又反复退出聊天框，好像多看几次钱就会回来。大志也慌了，他说自己差点把室友群都拉进去。小杰没有责备你，只把椅子推近了一点："先别删记录。" 王老师的头像安静地躺在通讯录里。你最想做的是消失，可最需要做的是留下证据。',
    location: '宿舍楼 308',
    week: 9,
    day: 2,
    npcId: 'xiaojie',
    imagePrompt: '宿舍深夜，被骗后的手机转账记录、聊天记录、室友沉默陪伴，止损与求助的关键时刻',
    setFlags: { scamLossRealized: true },
    playerChoices: [
      {
        id: 'a3_c5b_hide',
        text: '觉得太丢脸，先把聊天记录删掉',
        nextNodeId: 'ending_survival_crisis',
        statusChanges: { mood: -18, reputation: -8, antiFraudAwareness: 6, energy: -12 },
        affectionChanges: { xiaojie: -10, wang_laoshi: -4, dazhi: -3 },
        setFlags: { deletedEvidence: true },
        endingId: 'survival_crisis',
        narrativeText: '你删掉聊天记录，以为这样就能把尴尬也一起删掉。可当王老师问起证据时，你才发现自己把最重要的止损机会也删掉了一部分。羞耻没有消失，只变成更难处理的空白。'
      },
      {
        id: 'a3_c5b_preserve',
        text: '听小杰的话，保存证据再找王老师',
        nextNodeId: 'ending_growth',
        statusChanges: { mood: 4, reputation: 5, antiFraudAwareness: 18, trust: -8 },
        affectionChanges: { xiaojie: 16, wang_laoshi: 14, dazhi: 5 },
        setFlags: { preservedEvidenceAfterScam: true, askedForHelp: true },
        endingId: 'growth',
        narrativeText: '你们把聊天记录、转账截图、群二维码和李学长的推荐消息按时间顺序保存。王老师很快回复："先稳住，带着材料来办公室。"这句话没有让钱立刻回来，却让你从孤立无援里退出来一步。'
      },
      {
        id: 'a3_c5b_warn_others',
        text: '立刻提醒班群，防止更多人转账',
        nextNodeId: 'ending_social_leader',
        statusChanges: { social: 10, reputation: 10, mood: 2, antiFraudAwareness: 14 },
        affectionChanges: { dazhi: 14, xiaojie: 9, wang_laoshi: 8 },
        setFlags: { warnedClassAfterScam: true, helpedClassmatesAvoidScam: true },
        endingId: 'social_leader',
        narrativeText: '你的提醒发出后，两个同学私聊说自己也在同一个群里。你仍然心疼那 500 元，也仍然觉得丢脸。但至少雪崩没有继续扩大，你把自己的疼痛变成了别人的刹车。'
      }
    ]
  },

  act3_collapse: {
    id: 'act3_collapse',
    actId: 'act3',
    title: '全面暴露',
    description: '证据越来越清晰：张总公司不存在，阿强是托儿，李学长至少参与了引流。大志脸色发白，他差一点就准备转保证金。办公室里没人说"早就告诉过你"，因为每个人都知道，这条链条最擅长的就是让普通人以为自己只是抓住了一个普通机会。',
    location: '辅导员办公室',
    week: 9,
    day: 2,
    npcId: 'wang_laoshi',
    imagePrompt: '辅导员办公室里学生震惊地看着证据板，骗局链条被连线标出，校园反诈场景',
    playerChoices: [
      {
        id: 'a3_c6_public_report',
        text: '协助王老师发布班级反诈提醒',
        nextNodeId: 'ending_anti_fraud_star',
        statusChanges: { reputation: 16, social: 8, antiFraudAwareness: 10, mood: 8 },
        affectionChanges: { wang_laoshi: 14, xiaojie: 10, dazhi: 8 },
        setFlags: { reportedScam: true, helpedClassmatesAvoidScam: true, avoidedScam: true },
        endingId: 'anti_fraud_star',
        narrativeText: '提醒发出后，几个同学私聊你说自己也收到过类似邀请。你突然意识到，识破骗局不只是保护自己。每一份被保存的证据，都可能替另一个人争取到转账前的三十秒。'
      },
      {
        id: 'a3_c6_comfort_dazhi',
        text: '先安慰大志，陪他一起退出兼职群',
        nextNodeId: 'ending_social_leader',
        statusChanges: { social: 12, reputation: 8, mood: 10, antiFraudAwareness: 6 },
        affectionChanges: { dazhi: 16, xiaojie: 6, wang_laoshi: 6 },
        setFlags: { protectedDazhi: true, avoidedScam: true },
        endingId: 'social_leader',
        narrativeText: '大志第一次没那么吵，只低声说："我差点把你也拉下水。"你拍了拍他，说现在停下就还来得及。你们没有立刻和解成热血兄弟，只是一起退出那个群，像从一条危险的路上慢慢退回来。'
      },
      {
        id: 'a3_c6_focus_exam',
        text: '把证据交给老师，回去准备期中',
        nextNodeId: 'ending_study_growth',
        statusChanges: { gpa: 0.18, mood: 4, antiFraudAwareness: 8, energy: -10 },
        affectionChanges: { xuejie: 10, xiaoming: 8, wang_laoshi: 5 },
        setFlags: { avoidedScam: true, returnedToStudy: true },
        endingId: 'study_growth',
        narrativeText: '你没有把自己变成侦探，而是把专业的事交给专业的人。林雨薇帮你补了落下的两节高数，她说："判断力也要留时间给生活。"这句话比安慰更像提醒。'
      }
    ]
  },

  act3_counter_trap: {
    id: 'act3_counter_trap',
    actId: 'act3',
    title: '反向验证',
    description: '在王老师确认安全边界后，你和小杰要求张总先用企业账户支付一笔"验证款"，并把每一步话术截图留证。对方很快露出破绽：账户主体和合同完全不一致，话术也从职业化变成了催促和威胁。屏幕前的小杰很安静，你却能感觉到自己的心跳正一点点稳下来。',
    location: '宿舍楼 308',
    week: 9,
    day: 2,
    npcId: 'xiaojie',
    imagePrompt: '宿舍电脑前两名学生冷静截图取证，聊天窗口中的骗子露出破绽，反诈胜利感',
    playerChoices: [
      {
        id: 'a3_c7_counter_win',
        text: '把完整证据交给王老师和保卫处',
        nextNodeId: 'ending_anti_fraud_star',
        statusChanges: { reputation: 20, antiFraudAwareness: 8, social: 6, mood: 14, money: 100 },
        affectionChanges: { xiaojie: 18, wang_laoshi: 14, dazhi: 8 },
        setFlags: { counterTrapSucceeded: true, reportedScam: true, avoidedScam: true },
        endingId: 'anti_fraud_star',
        narrativeText: '骗子拉黑你之前，所有证据已经被保存。小杰看着屏幕，难得笑了一下："你是我见过最冷静的新生。"你知道自己并非不害怕，只是这一次，害怕没有替你做决定。'
      }
    ]
  },

  ending_anti_fraud_star: {
    id: 'ending_anti_fraud_star',
    actId: 'act3',
    title: '阶段复盘：反诈骗之星',
    description: '你识破了看似真实的兼职骗局，保住了自己和同学的钱。学院把这条链条拆成一张流程图：压力筛选、熟人引流、首次到账、保证金收割。王老师说，这不是一次"聪明人胜利"，而是一次可以被后来者重复练习的校园学习。',
    location: '学院报告厅',
    week: 10,
    day: 5,
    endingId: 'anti_fraud_star',
    setFlags: { avoidedScam: true, reportedScam: true, completedAntiFraudArc: true },
    playerChoices: [
      {
        id: 'a3_end_star_to_act4',
        text: '进入第四章：风波之后',
        nextNodeId: 'act3_bridge_to_act4',
        statusChanges: { mood: 4, reputation: 4 },
        narrativeText: '反诈事件结束了，但大学生活还在继续。你需要把这次经历真正放回日常里：继续上课，继续面对室友，也继续学习怎样把一次警惕变成长期能力。'
      }
    ]
  },

  ending_social_leader: {
    id: 'ending_social_leader',
    actId: 'act3',
    title: '阶段复盘：社交守望者',
    description: '你没有把被骗风险变成互相指责，而是把身边的人一起拉回安全线。大志仍然爱热闹，仍然会把新消息带回宿舍，但现在转发前会先问一句："这个靠谱吗？" 这句话听起来普通，却是他从羞愧里重新长出的负责。',
    location: '宿舍楼 308',
    week: 10,
    day: 5,
    endingId: 'social_leader',
    setFlags: { completedAntiFraudArc: true },
    playerChoices: [
      {
        id: 'a3_end_social_to_act4',
        text: '进入第四章：风波之后',
        nextNodeId: 'act3_bridge_to_act4',
        statusChanges: { social: 2, mood: 3 },
        narrativeText: '你保住了同伴关系，但有些尴尬和压力还需要慢慢修复。真正的守望不是替别人永远正确，而是在他快跌下去时伸手，又在事后给他保留尊严。'
      }
    ]
  },

  ending_study_growth: {
    id: 'ending_study_growth',
    actId: 'act3',
    title: '阶段复盘：学霸成长线',
    description: '你避开骗局后回到学习节奏，期中成绩稳住了。林雨薇说，大学最难的不是一直正确，而是在诱惑很多、压力很近、别人都说"没事"的时候，还能知道什么最重要。',
    location: '图书馆',
    week: 10,
    day: 5,
    endingId: 'study_growth',
    setFlags: { completedAntiFraudArc: true },
    playerChoices: [
      {
        id: 'a3_end_study_to_act4',
        text: '进入第四章：风波之后',
        nextNodeId: 'act3_bridge_to_act4',
        statusChanges: { gpa: 0.04, mood: 2 },
        narrativeText: '学习节奏稳住了，但你还要面对事件之后的人际和心理余波。知识能补，信任和情绪也需要一点点补。'
      }
    ]
  },

  ending_survival_crisis: {
    id: 'ending_survival_crisis',
    actId: 'act3',
    title: '阶段复盘：生存危机',
    description: '你缴纳保证金后被拉黑，生活费骤降，心情也跌到谷底。王老师帮你报警和申请临时困难补助，小杰陪你补证据，大志不再开玩笑。这次代价足够刺痛，但它不应该成为你独自背着的污点，而应该成为系统、同伴和学校一起补上的漏洞。',
    location: '辅导员办公室',
    week: 10,
    day: 5,
    endingId: 'survival_crisis',
    setFlags: { gotScammed: true, completedAntiFraudArc: true },
    playerChoices: [
      {
        id: 'a3_end_crisis_to_act4',
        text: '进入第四章：风波之后',
        nextNodeId: 'act3_bridge_to_act4',
        statusChanges: { mood: -2, antiFraudAwareness: 4 },
        narrativeText: '这次代价很痛，但故事不能停在被骗那一刻。接下来，你要学习如何止损、修复和重新开始，也要知道：被骗不是你不值得被信任，沉默才会让伤口继续扩大。'
      }
    ]
  },

  ending_growth: {
    id: 'ending_growth',
    actId: 'act3',
    title: '阶段复盘：及时求助',
    description: '你承认自己的犹豫，也在转账前停了下来。辅导员、室友和林雨薇一起帮你复盘：你为什么心动，为什么相信，为什么差点忽略疑点。你把这次差点被骗变成了真正的成长，因为你不再只记住"不要被骗"，而是记住自己在什么情况下最容易被骗。',
    location: '辅导员办公室',
    week: 10,
    day: 5,
    endingId: 'growth',
    setFlags: { completedAntiFraudArc: true },
    playerChoices: [
      {
        id: 'a3_end_growth_to_act4',
        text: '进入第四章：风波之后',
        nextNodeId: 'act3_bridge_to_act4',
        statusChanges: { mood: 4, antiFraudAwareness: 3 },
        narrativeText: '你学会了求助，但真正成熟的开始，是把求助经验变成稳定的生活能力。下一次风险来临时，你希望自己不需要靠运气停下。'
      }
    ]
  },

  ending_academic_tradeoff: {
    id: 'ending_academic_tradeoff',
    actId: 'act3',
    title: '阶段复盘：独立思考的代价',
    description: '你靠自己查清骗局，却牺牲了期中复习。成绩不够漂亮，但你建立起一套查证方法。小明提醒你，下次别一个人扛到最后。独立思考很重要，可大学教你的另一件事是：把专业风险交给专业渠道，并不损害你的判断力。',
    location: '教学楼',
    week: 10,
    day: 5,
    endingId: 'academic_tradeoff',
    setFlags: { completedAntiFraudArc: true },
    playerChoices: [
      {
        id: 'a3_end_tradeoff_to_act4',
        text: '进入第四章：风波之后',
        nextNodeId: 'act3_bridge_to_act4',
        statusChanges: { gpa: -0.02, antiFraudAwareness: 4 },
        narrativeText: '你保住了判断力，却透支了学习节奏。下一步不是后悔，而是把两者重新拉回平衡：既不轻信，也不把所有问题都变成一个人的深夜战斗。'
      }
    ]
  },

  act3_bridge_to_act4: {
    id: 'act3_bridge_to_act4',
    actId: 'act3',
    title: '幕间：风波落下后的声音',
    description: '班会结束后的走廊比你想象中安静。反诈流程图还停在投影幕上，几个同学围着王老师问怎么查企业主体，大志站在门口很久没有说话，小杰把证据文件夹重新命名成"新生风险案例_匿名版"。你以为事情会在真相揭开后立刻结束，可真正留下来的，是每个人心里对自己那一刻心动、犹豫、沉默或逞强的回声。那回声不吵，却会在日常里反复响起。',
    location: '学院走廊',
    week: 10,
    day: 5,
    npcId: 'wang_laoshi',
    imagePrompt: '学院班会后的走廊，反诈流程图投影渐暗，学生和辅导员低声交流，事件后的余波',
    playerChoices: [
      {
        id: 'a3_bridge_breathe',
        text: '带着这份余波，回到日常',
        nextNodeId: 'act4_rebuild_week',
        statusChanges: { mood: 2, energy: 2 },
        narrativeText: '你没有急着给这件事下结论，只把证据、复盘和求助电话都整理好。走出学院楼时，晚风吹过操场，远处还有人在跑步。生活没有为你暂停，但它也给了你重新调整的空间。'
      }
    ]
  }
}
