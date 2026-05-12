import type { StoryNode } from '../types'

export const ACT5_NODES: Record<string, StoryNode> = {
  act5_final_month: {
    id: 'act5_final_month',
    actId: 'act5',
    title: '期末月',
    description: '十二月的校园突然安静下来。树叶落在教学楼台阶上，图书馆座位比食堂鸡腿还难抢。社团活动收尾，群里却又出现"期末资料包""保过课程""代写报告"的广告。你已经不是刚入学时的你，但新的诱惑换了一张脸：它不再说来钱快，而是说帮你逃过焦虑。',
    location: '图书馆',
    week: 15,
    day: 1,
    npcId: 'xiaoming',
    imagePrompt: '冬季大学图书馆，期末复习、资料包广告弹窗、学生专注自习，紧张但克制的氛围',
    playerChoices: [
      {
        id: 'a5_c1_study_group',
        text: '组织正规复习小组，互相讲题',
        nextNodeId: 'act5_exam_pressure',
        statusChanges: { gpa: 0.22, social: 8, energy: -14, mood: 6 },
        affectionChanges: { xiaoming: 14, xuejie: 8, dazhi: 5 },
        setFlags: { organizedFinalStudyGroup: true },
        narrativeText: '你们约定只讲思路不传答案。大志负责买热豆浆，小明负责错题，林雨薇偶尔进群纠正一道关键概念。那份新生手册的学习适应章节，也在你们的复习桌上慢慢成形。'
      },
      {
        id: 'a5_c1_buy_pack',
        text: '差点购买“保过资料包”，但先核验来源',
        nextNodeId: 'act5_exam_pressure',
        statusChanges: { antiFraudAwareness: 12, gpa: 0.06, mood: -2, trust: -6 },
        affectionChanges: { xiaojie: 10, wang_laoshi: 4 },
        setFlags: { checkedExamPack: true },
        narrativeText: '你查到资料包来自匿名账号，宣传图还是往年其他学校的截图。你没有付款，只把链接发给王老师备案。你越来越熟悉这种动作：心动可以有，但付款前要让证据先说话。'
      },
      {
        id: 'a5_c1_burnout',
        text: '硬撑复习，忽视睡眠和情绪',
        nextNodeId: 'act5_exam_pressure',
        statusChanges: { gpa: 0.08, energy: -24, mood: -16, antiFraudAwareness: -2 },
        affectionChanges: { xiaoming: -2, xuejie: 2, wang_laoshi: 3 },
        setFlags: { finalBurnout: true },
        narrativeText: '你连续几晚熬到凌晨，效率却越来越低。王老师在走廊遇见你，直接问："你现在是在学习，还是在惩罚自己？"你想反驳，却发现自己也分不清了。'
      }
    ]
  },

  act5_exam_pressure: {
    id: 'act5_exam_pressure',
    actId: 'act5',
    title: '考前一周',
    description: '考试周逼近，宿舍灯光常常亮到凌晨。群里开始流传"AI 代写报告""最后三天速成课""老师题库原卷"的链接。你发现，压力不会消失，它只会换成更诱人的按钮出现在屏幕上。小明把错题本放到你桌边，林雨薇也发来一句话：别把工具当捷径。技术本身不邪恶，逃避责任才会让它变危险。',
    location: '宿舍楼 308',
    week: 15,
    day: 5,
    npcId: 'xiaoming',
    imagePrompt: '考试周前的大学宿舍，台灯、错题本、AI 工具页面和资料群消息并列出现，真实期末压力',
    playerChoices: [
      {
        id: 'a5_c1b_sleep_plan',
        text: '按复习表推进，保留睡眠和运动',
        nextNodeId: 'act5_winter_loneliness',
        statusChanges: { gpa: 0.16, energy: -8, mood: 8, antiFraudAwareness: 4 },
        affectionChanges: { xiaoming: 10, xuejie: 6 },
        setFlags: { finalsSleepPlan: true },
        narrativeText: '你把复习任务拆到每一天，也把睡眠写进计划。小明说这看起来不够热血，但你们连续三晚都没有熬到崩溃。稳定不适合被截图炫耀，却最适合把人带过考试周。'
      },
      {
        id: 'a5_c1b_ai_boundary',
        text: '把 AI 当助教，只问思路不代写',
        nextNodeId: 'act5_winter_loneliness',
        statusChanges: { gpa: 0.12, antiFraudAwareness: 6, reputation: 4, energy: -6 },
        affectionChanges: { xuejie: 7, wang_laoshi: 5, xiaoming: 4 },
        setFlags: { healthyAIToolUse: true },
        narrativeText: '你让 AI 帮你解释概念和生成复习提纲，但每个结论都回到教材核对。林雨薇评价得很直接："这叫使用工具，不叫把责任交出去。"你把这句话写进手册的 AI 工具边界页。'
      },
      {
        id: 'a5_c1b_last_minute',
        text: '临时抱佛脚，刷经验帖找捷径',
        nextNodeId: 'act5_winter_loneliness',
        statusChanges: { gpa: -0.06, mood: -10, energy: -18, trust: 6 },
        affectionChanges: { xiaoming: -4, xuejie: -3, dazhi: 3 },
        setFlags: { lastMinutePanic: true },
        narrativeText: '你在经验帖和资料群之间反复横跳，收藏夹越来越满，真正写进脑子里的东西却不多。凌晨三点，你突然意识到焦虑也会伪装成努力，甚至比真正努力更耗电。'
      }
    ]
  },

  act5_winter_loneliness: {
    id: 'act5_winter_loneliness',
    actId: 'act5',
    title: '冬夜独白',
    description: '考试周前的某个周末，宿舍突然空了。大志回家拿冬装，小明去自习室包场，小杰说去网吧但你知道他只是不想待在这里。你第一次独自面对 308，床上的被子卷着，桌上的水杯积了一圈水渍，窗外的梧桐只剩枝丫。安静像一面放大镜，把平时用忙碌盖住的东西一样一样照出来：你到底够不够好？你有没有真的在成长？那些帮过你的人，是把你当朋友还是只是顺手？你抱着手机坐了很久，想发消息却不知道发给谁——直到你意识到，孤独不是没有人在身边，而是不确定自己值不值得被想念。',
    location: '宿舍楼 308',
    week: 15,
    day: 6,
    imagePrompt: '冬日空荡大学宿舍，只有一个人坐在床上抱着手机，窗外枯枝和灰色天空，安静孤独的氛围',
    playerChoices: [
      {
        id: 'a5_lonely_write',
        text: '打开笔记本，把此刻的感受写下来',
        nextNodeId: 'act5_xuejie_farewell',
        statusChanges: { mood: 6, antiFraudAwareness: 4 },
        setFlags: { wroteWinterReflection: true },
        narrativeText: '你写下：\"我不确定自己在变好还是在假装变好。\"写完之后反而松了口气。把不安写出来不会让它消失，但至少让你看清楚它的形状——它没有你以为的那么大。你又翻开新生手册草稿，在心理支持那一页加了一行：\"如果你在某个安静的晚上突然觉得自己不够好，那很正常。这不是真相，只是疲惫在说谎。\"'
      },
      {
        id: 'a5_lonely_call_xuejie',
        text: '犹豫了很久，给学姐发了一条消息',
        nextNodeId: 'act5_xuejie_farewell',
        statusChanges: { social: 6, mood: 8 },
        affectionChanges: { xuejie: 10 },
        setFlags: { reachedOutWhenLonely: true },
        narrativeText: '你编辑了五分钟才发出去一句：\"学姐，你最近还好吗？\"林雨薇回得很快：\"还行，在改论文。你呢？\"你没有说自己很好，而是说：\"有点空。\"她没有发鸡汤，只发来一张图书馆窗边的照片，附了一句：\"我也是。但空的时候想一想自己还在这里，也不错。\"那天晚上你没有再刷手机，而是把那张照片保存了下来。有时候对抗孤独的不是热闹，而是知道某个地方有人也在安静地撑着。'
      },
      {
        id: 'a5_lonely_scroll',
        text: '刷了一整晚朋友圈和短视频',
        nextNodeId: 'act5_xuejie_farewell',
        statusChanges: { mood: -10, energy: -12 },
        setFlags: { escapedLonelinessOnline: true },
        narrativeText: '你从晚上八点刷到凌晨一点。别人的考研上岸、旅行打卡和恋爱撒糖像一条条闪光的绳子，把你绑在屏幕前，也把你的自信一根根抽走。放下手机的时候，眼睛酸得厉害，心里更空。你后来在手册的心理支持页加了一句话：\"低落的时候少刷朋友圈。别人的高光不是你的判决书。\"那是你用一个失眠的夜晚换来的一行字。'
      }
    ]
  },

  act5_xuejie_farewell: {
    id: 'act5_xuejie_farewell',
    actId: 'act5',
    title: '学姐的答案',
    description: '期末考试最后一天，你在教学楼台阶上看见林雨薇。她手里拿着打印出来的保研材料，风把几张纸吹歪了。你想帮她捡，走近了才看见她眼圈有点红——不是哭，更像是很久没有好好睡过。她看见你，先问的不是自己的事：\"最后一科准备得怎么样？\"你忽然觉得很心疼。一个连自己都快撑不住的人，第一反应还是先关心别人。',
    location: '教学楼台阶',
    week: 16,
    day: 4,
    npcId: 'xuejie',
    imagePrompt: '冬日大学教学楼台阶，女生拿着保研材料被风吹散，男生弯腰帮忙捡，温暖又微苦的告别感',
    playerChoices: [
      {
        id: 'a5_xuejie_honest',
        text: '帮她捡纸，然后说：学姐，你先别管我了，你自己呢？',
        nextNodeId: 'act5_family_call',
        statusChanges: { social: 8, mood: 10 },
        affectionChanges: { xuejie: 22 },
        setFlags: { xuejieSharedResult: true, deepBondWithXuejie: true },
        narrativeText: '林雨薇愣了一下，然后笑了——那种笑里有疲惫，也有释然。\"名额够了，但导师希望我换个方向。我还没想好。\"她把纸捏了捏，又说：\"其实我一直很怕，怕自己不够好。我帮你们的时候反而不怕，好像只要有人需要我，我就有理由继续努力。\"你站在风里听着，突然明白她所有的温柔里藏着多少不安。你说了一句不太像你会说的话：\"学姐，你不用一直帮别人才有理由对自己好。\"她没有回答，只是看了你很久，然后说：\"嗯。谢谢你。\"那个\"谢谢\"很轻，却像是她对自己说了很久没能说出口的话。'
      },
      {
        id: 'a5_xuejie_gift',
        text: '把自己手写的感谢卡和手册里她的那一页给她看',
        nextNodeId: 'act5_family_call',
        statusChanges: { social: 6, mood: 8, reputation: 4 },
        affectionChanges: { xuejie: 18 },
        setFlags: { xuejieSharedResult: true, gaveXuejieGift: true },
        narrativeText: '你把手册翻到学习适应那一页——上面写满了她教过你的东西，旁边还歪歪扭扭画了一颗星。林雨薇看了很久，把眼镜摘下来擦了擦。\"你知道吗，我有时候觉得我帮你们，其实也是在帮过去那个害怕的自己。\"她轻声说保研名额拿到了，但实验还要重做。你没有说恭喜，只说了一句：\"学姐加油，这次换我们给你说别急了。\"她笑出了声，那个笑声在冬天的空气里很短，却很暖。'
      },
      {
        id: 'a5_xuejie_nod',
        text: '点点头说准备得还行，然后各自离开',
        nextNodeId: 'act5_family_call',
        statusChanges: { mood: 2 },
        affectionChanges: { xuejie: 4 },
        setFlags: { briefXuejieFarewell: true },
        narrativeText: '你说考得还行，她说保研差不多了。你们都没有展开，像两个已经习惯了把重要的话压在嘴边的人。走远之后你回头看了一眼，她还站在台阶上整理那些被风吹乱的纸。你想折回去说点什么，但脚步没有停下来。后来你在手册的最后一页加了一句：\"如果你遇到一个愿意在自己最忙的时候帮你的人，记得也去问她还好吗。\"那是你写给未来新生的，也是写给此刻的自己的。'
      }
    ]
  },

  act5_family_call: {
    id: 'act5_family_call',
    actId: 'act5',
    title: '家里的一通电话',
    description: '考试前两天，家里打来电话，问你大学适不适应、钱够不够、成绩有没有把握。电话那头的关心很真，也很重，重到你差点本能地说"都挺好"。你忽然明白，新生手册里不该只写"遇到问题找老师"，还要写清楚怎么和家人谈压力，怎么把求助说得不那么像失败。',
    location: '宿舍阳台',
    week: 16,
    day: 1,
    npcId: 'wang_laoshi',
    imagePrompt: '冬夜宿舍阳台，新生接家里电话，远处校园灯光，期末压力和家庭关心交织',
    playerChoices: [
      {
        id: 'a5_c1c_honest',
        text: '坦诚说出压力，也说明自己的计划',
        nextNodeId: 'act5_manual_review',
        statusChanges: { mood: 10, energy: 4, reputation: 2, trust: -2 },
        affectionChanges: { wang_laoshi: 5, xuejie: 4 },
        setFlags: { talkedWithFamilyHonestly: true },
        narrativeText: '你没有把自己包装成"什么都很好"，而是讲了复习计划、生活费安排和已经找过的求助渠道。电话挂断后，你轻了很多。真实不会立刻解决问题，但能让关心找到入口。'
      },
      {
        id: 'a5_c1c_hide',
        text: '报喜不报忧，把压力自己咽下去',
        nextNodeId: 'act5_manual_review',
        statusChanges: { mood: -12, energy: -6, trust: 2 },
        affectionChanges: { wang_laoshi: -2, xiaojie: 2 },
        setFlags: { hidPressureFromFamily: true },
        narrativeText: '你说一切顺利，语气轻快得像提前排练过。挂断后，阳台很安静，你却觉得胸口更闷了。你骗过了电话那头的人，却没能骗过自己。'
      },
      {
        id: 'a5_c1c_support',
        text: '把费用和兼职担忧讲清楚，查询学校支持',
        nextNodeId: 'act5_manual_review',
        statusChanges: { antiFraudAwareness: 8, money: 300, mood: 6, energy: -4 },
        affectionChanges: { wang_laoshi: 10, xiaojie: 5 },
        setFlags: { foundCampusSupport: true },
        narrativeText: '你把之前差点被兼职诱惑的经历讲出来，也和家里一起查学校资助中心和勤工助学。王老师后来帮你确认申请入口。你发现，家庭不是只能承受好消息，也可以成为风险判断的一部分。'
      }
    ]
  },

  act5_manual_review: {
    id: 'act5_manual_review',
    actId: 'act5',
    title: '新生手册复盘',
    description: '期末前的最后一次班会，王老师把你们做的安全清单投到屏幕上。学习适应、宿舍沟通、兼职核验、被骗止损、求助路径、AI 工具边界、家庭沟通，这些不再是冷冰冰的条目，而是你这学期真正走过的路。屏幕上的每一页，都有一个你们曾经差点绕不过去的晚上。',
    location: '学院报告厅',
    week: 16,
    day: 3,
    npcId: 'wang_laoshi',
    imagePrompt: '学院报告厅，新生手册复盘投影，学生认真听讲，温暖、有完成感的校园场景',
    playerChoices: [
      {
        id: 'a5_c2_share_manual',
        text: '把这份清单整理成给下一届新生的手册',
        nextNodeId: 'act5_first_year_close',
        statusChanges: { reputation: 18, social: 8, antiFraudAwareness: 10, mood: 10 },
        affectionChanges: { wang_laoshi: 16, xuejie: 10, xiaojie: 8, dazhi: 8 },
        setFlags: { handbookReady: true },
        narrativeText: '你把自己的经历写成可执行的流程，而不是一句"提高警惕"。王老师说，这样的手册才真的能帮到人。因为人在慌的时候，不需要大道理，需要下一步。'
      },
      {
        id: 'a5_c2_focus_self',
        text: '先完成期末，再把经验留给自己',
        nextNodeId: 'act5_first_year_close',
        statusChanges: { gpa: 0.2, mood: 6, energy: -8, antiFraudAwareness: 6 },
        affectionChanges: { xiaoming: 10, xuejie: 8, wang_laoshi: 4 },
        setFlags: { focusedFinals: true },
        narrativeText: '你没有承担更多展示任务，而是把注意力收回期末。成长不一定要被所有人看见，也可以先稳稳发生在自己身上。你把这句话写在手册草稿的空白处，像写给未来某个过载的新生。'
      },
      {
        id: 'a5_c2_support_others',
        text: '成立一个新生互助小组',
        nextNodeId: 'act5_first_year_close',
        statusChanges: { social: 14, reputation: 14, mood: 8, energy: -10 },
        affectionChanges: { dazhi: 12, xiaojie: 10, wang_laoshi: 10 },
        setFlags: { builtPeerSupportGroup: true },
        narrativeText: '大志负责把群气氛变轻松，小杰负责核验链接，小明负责学习答疑。你们没有变成完美团队，但已经足够可靠。可靠不是每个人都强，而是每个人知道自己能补上哪一块。'
      }
    ]
  },

  act5_first_year_close: {
    id: 'act5_first_year_close',
    actId: 'act5',
    title: '第一学年结束',
    description: '期末结束那天，校园里的风带着一点夏天的味道。你回看这一年：报到、室友、学习、小测、兼职骗局、反诈手册、期末压力。你还谈不上彻底成熟，也仍然会焦虑、会犯懒、会在深夜怀疑自己。但你已经不再把大学看成一连串随机事件，而是一条能被自己慢慢塑形的路。',
    location: '学院报告厅',
    week: 16,
    day: 5,
    npcId: 'wang_laoshi',
    setFlags: { firstYearCompleted: true },
    playerChoices: [
      {
        id: 'a5_to_act6',
        text: '进入第二学年：大二分岔口',
        nextNodeId: 'act5_bridge_to_act6',
        statusChanges: { mood: 6, energy: 8 },
        narrativeText: '暑假过去，大二的课程表和新的招募通知一起到来。你要做的选择开始变得更长远，而那份新生手册，也从一次班会材料变成了一个真正值得继续做下去的项目。'
      }
    ]
  },

  act5_bridge_to_act6: {
    id: 'act5_bridge_to_act6',
    actId: 'act5',
    title: '幕间：暑假之后',
    description: '暑假里，你把新生手册又改了两版。最初它像一份防骗清单，后来慢慢长出学习适应、宿舍沟通、家庭沟通和 AI 工具边界。你偶尔会想起第一周校门口那个拖着行李箱的自己：当时你只想别丢人、别掉队、别让家里担心。现在你知道，大学不会因为你完成第一学年就变简单，它只是把问题换成更长的周期。九月重新开学时，校门口又站满了新生，而你第一次不再只看见自己。',
    location: '校门口',
    week: 19,
    day: 7,
    npcId: 'wang_laoshi',
    imagePrompt: '暑假后大学校门口，新一届新生报到，旧生看着新生手册二维码，成长过渡场景',
    playerChoices: [
      {
        id: 'a5_bridge_return',
        text: '回到学院，开始第二学年',
        nextNodeId: 'act6_sophomore_crossroads',
        statusChanges: { mood: 4, reputation: 2 },
        setFlags: { returnedForSecondYear: true },
        narrativeText: '王老师在迎新棚旁看见你，递来一沓新打印的手册："今年你不是被照顾的新生了，也不是必须照顾所有人的前辈。你要学会把能力放到合适的位置。"'
      }
    ]
  }
}
