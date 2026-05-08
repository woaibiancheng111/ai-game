import type { StoryNode } from '../types'

export const ACT8_NODES: Record<string, StoryNode> = {
  act8_senior_year: {
    id: 'act8_senior_year',
    actId: 'act8',
    title: '大四之前',
    description: '大四临近，校园突然变得像一座车站。有人准备保研面试，有人投递秋招，有人考公考研，有人开始告别。你站在公告栏前，看见四年前的新生手册已经更新到第七版，封面从最初的安全清单变成了"大学生活风险与成长手册"。里面有你写下的几行字，也有很多后来者补上的痕迹。你忽然明白，真正有用的东西会被别人继续修改。',
    location: '学院公告栏',
    week: 70,
    day: 1,
    npcId: 'wang_laoshi',
    imagePrompt: '大学学院公告栏，大四临近，升学就业通知和新生手册海报，告别与选择氛围',
    playerChoices: [
      {
        id: 'a8_c1_portfolio',
        text: '整理四年作品、项目和复盘材料',
        nextNodeId: 'act8_graduation_pressure',
        statusChanges: { reputation: 8, gpa: 0.08, energy: -10, mood: 6 },
        affectionChanges: { xuejie: 8, wang_laoshi: 8, xiaoming: 6 },
        setFlags: { builtPortfolio: true },
        narrativeText: '你把课程项目、反诈手册、实习记录和失败复盘整理成一个作品集。它不只是展示"我做成了什么"，也展示"我如何修正自己"。这比一份完美简历更诚实，也更像你。'
      },
      {
        id: 'a8_c1_mentor',
        text: '带最后一届新生训练营',
        nextNodeId: 'act8_graduation_pressure',
        statusChanges: { social: 12, reputation: 12, antiFraudAwareness: 8, energy: -12 },
        affectionChanges: { wang_laoshi: 12, dazhi: 8, xiaojie: 8 },
        setFlags: { mentoredFreshmen: true },
        narrativeText: '你看见一位新生站在校门口，表情像当年的你。你没有急着给答案，只递给他一张地图："先从报到处开始，有问题可以问人。"那一刻，你像把四年前别人递给你的那份温柔还了回去。'
      },
      {
        id: 'a8_c1_recover',
        text: '承认自己太累，先做毕业前的恢复计划',
        nextNodeId: 'act8_graduation_pressure',
        statusChanges: { mood: 12, energy: 12, reputation: -2, antiFraudAwareness: 4 },
        affectionChanges: { wang_laoshi: 10, xiaojie: 6, xuejie: 4 },
        setFlags: { choseRecoveryBeforeGraduation: true },
        narrativeText: '你向老师说明自己需要减少任务。出乎意料的是，没有人因此否定你。王老师说："能及时停下，也是一种毕业能力。"你想起第一次反诈时的那句话，原来它一路跟到了这里。'
      }
    ]
  },

  act8_graduation_pressure: {
    id: 'act8_graduation_pressure',
    actId: 'act8',
    title: '毕业前的最后压力',
    description: '毕业去向还没完全落定，论文、答辩、租房、签约、档案转递和离校手续一起压过来。朋友圈里有人晒录取，有人晒 offer，也有人突然消失。你知道自己已经成长很多，但临近告别时，焦虑仍会把旧问题重新推到面前：想走捷径、怕落后、怕承认自己累。四年过去，风险没有消失，只是更像生活本身。',
    location: '毕业事务中心',
    week: 74,
    day: 3,
    npcId: 'wang_laoshi',
    imagePrompt: '大学毕业事务中心，离校手续、签约材料、论文答辩通知和学生焦虑排队，毕业季现实压力',
    playerChoices: [
      {
        id: 'a8_c1b_checklist',
        text: '列毕业事项清单，逐项确认官方入口',
        nextNodeId: 'act8_last_campus_walk',
        statusChanges: { reputation: 6, antiFraudAwareness: 8, energy: -6, mood: 5 },
        affectionChanges: { wang_laoshi: 8, xiaojie: 6 },
        setFlags: { graduationChecklistReady: true },
        narrativeText: '你把三方协议、档案、住宿、论文和财务手续全部列成表。小杰帮你标出官方入口，提醒你毕业季也会有"代办""内部渠道"的坑。你们笑着说，小杰的毕业礼物大概是一份风险清单。'
      },
      {
        id: 'a8_c1b_say_goodbye',
        text: '和重要的人好好告别，不把一切都留到最后',
        nextNodeId: 'act8_last_campus_walk',
        statusChanges: { mood: 12, social: 8, energy: -5, reputation: 3 },
        affectionChanges: { dazhi: 8, xiaojie: 8, xiaoming: 8, xuejie: 6 },
        setFlags: { saidProperGoodbye: true },
        narrativeText: '你请室友们吃了一顿普通的食堂饭。大志说他以后还是会乱转链接，但会先问一句；小明说别忘了备份错题本；小杰只发来一个压缩包，里面是你们四年的项目材料。你们没有煽情，却都吃得很慢。'
      },
      {
        id: 'a8_c1b_delay_everything',
        text: '拖到最后再处理，靠临场爆发',
        nextNodeId: 'act8_last_campus_walk',
        statusChanges: { mood: -14, energy: -18, reputation: -5, trust: 5 },
        affectionChanges: { wang_laoshi: -3, xuejie: -3, xiaoming: -2 },
        setFlags: { delayedGraduationTasks: true },
        narrativeText: '你把很多事项留到最后一周，结果每个窗口都在排队。焦虑让你差点点开一个"离校手续代办"链接，好在那一秒你停了下来。成长没有让你永远不犯险，只让你在关键处多出一次刹车。'
      }
    ]
  },

  act8_last_campus_walk: {
    id: 'act8_last_campus_walk',
    actId: 'act8',
    title: '最后一次校园夜路',
    description: '毕业典礼前夜，你一个人从图书馆走回宿舍。校门口的迎新棚已经不在，食堂二楼换了招牌，308 的门牌有一点旧，湖边长椅却还在。四年前你在这些地方学会问路、求助、保存证据、拒绝捷径、承认过载。它们不是宏大的成长瞬间，只是很多个差点走偏又慢慢走回来的晚上。手机里，新生互助群仍然有人提问："这个兼职靠谱吗？"你停在路灯下，认真回了一句："先别转钱，把信息发来，我们一起看。"',
    location: '校园主路',
    week: 77,
    day: 6,
    npcId: 'xiaojie',
    imagePrompt: '毕业前夜校园主路，图书馆灯光、旧宿舍楼、手机互助群消息，温柔告别氛围',
    playerChoices: [
      {
        id: 'a8_c1c_leave_note',
        text: '给互助群和下一届新生留下一段话',
        nextNodeId: 'act8_final_choice',
        statusChanges: { reputation: 6, social: 6, mood: 8 },
        affectionChanges: { wang_laoshi: 6, dazhi: 5, xiaojie: 5, xuejie: 4 },
        setFlags: { leftFreshmanNote: true },
        narrativeText: '你写下：大学里最重要的能力之一，是在压力最大的时候还能慢三十秒。慢下来查证，慢下来求助，慢下来承认自己需要别人。发送之后，群里亮起几个"收到"。你忽然觉得，有些告别并不是离开，而是把路标留在原地。'
      },
      {
        id: 'a8_c1c_keep_silent',
        text: '什么也不写，只安静走完这段路',
        nextNodeId: 'act8_final_choice',
        statusChanges: { mood: 5, energy: 4 },
        affectionChanges: { xiaojie: 2 },
        setFlags: { quietGraduationWalk: true },
        narrativeText: '你没有发长文，只把群消息转给负责下一届的同学。夜风穿过树叶，像把四年里许多没说出口的话轻轻翻过去。不是每一次告别都要留下声音，有些东西已经写进你做事的方式里。'
      },
      {
        id: 'a8_c1c_call_teacher',
        text: '给王老师发消息，感谢这一路的求助路径',
        nextNodeId: 'act8_final_choice',
        statusChanges: { mood: 10, reputation: 4, energy: -2 },
        affectionChanges: { wang_laoshi: 12 },
        setFlags: { thankedCounselor: true },
        narrativeText: '王老师过了几分钟回复："以后你也会成为别人的路径之一。"你看着这句话笑了很久。原来大学教你的不是永远独立，而是有一天能把别人曾经给你的帮助，换一种形式递出去。'
      }
    ]
  },

  act8_final_choice: {
    id: 'act8_final_choice',
    actId: 'act8',
    title: '毕业去向',
    description: '毕业季，你收到几份不同的可能：导师推荐的研究生机会、正规企业的产品安全岗位、学校邀请你继续参与新生教育项目，还有一段空白期。四年前，你以为人生结局是一次选择；现在你知道，它更像长期选择的合影。每一条路都不是奖励或惩罚，而是你这些年如何学习、求助、信任、停下、重新开始的结果。',
    location: '毕业典礼后台',
    week: 78,
    day: 5,
    npcId: 'wang_laoshi',
    imagePrompt: '大学毕业典礼后台，学位服、简历、录取通知、工作 offer 和新生手册，人生多结局选择',
    playerChoices: [
      {
        id: 'a8_c2_research_ending',
        text: '继续深造，研究可信 AI 与数字安全教育',
        nextNodeId: 'ending_research_scholar',
        requiredFlags: { choseAcademicTrack: true },
        statusChanges: { gpa: 0.18, reputation: 10, mood: 8 },
        affectionChanges: { xuejie: 12, xiaoming: 8, wang_laoshi: 6 },
        setFlags: { lifePathResearchScholar: true },
        endingId: 'research_scholar',
        narrativeText: '导师问你为什么想研究这个方向。你想起那份兼职群、那张到账截图、那份后来更新了七版的新生手册，然后回答："因为判断力也需要被设计和训练。"'
      },
      {
        id: 'a8_c2_product_ending',
        text: '进入企业，做用户安全与产品风控',
        nextNodeId: 'ending_product_guardian',
        requiredFlags: { juniorIndustryRoute: true },
        statusChanges: { money: 1200, reputation: 8, antiFraudAwareness: 8 },
        affectionChanges: { xiaojie: 10, dazhi: 6, wang_laoshi: 6 },
        setFlags: { lifePathProductGuardian: true },
        endingId: 'product_guardian',
        narrativeText: '面试官问你如何理解风控。你没有只讲模型和规则，而是讲一个新生为什么会相信"第一次到账"。对方沉默几秒，说："这个视角很重要。"'
      },
      {
        id: 'a8_c2_educator_ending',
        text: '加入学校项目，成为新生教育共创者',
        nextNodeId: 'ending_campus_educator',
        requiredFlags: { handbookReady: true },
        statusChanges: { reputation: 14, social: 10, mood: 10 },
        affectionChanges: { wang_laoshi: 16, xuejie: 8, dazhi: 8, xiaojie: 8 },
        setFlags: { lifePathCampusEducator: true },
        endingId: 'campus_educator',
        narrativeText: '学校决定把你的手册做成互动课程。你站在新生面前，没有说"不要被骗"，而是带他们做第一道判断题。你知道教育最好的样子不是替人害怕，而是让人练习在害怕时怎么做。'
      },
      {
        id: 'a8_c2_peer_network_ending',
        text: '把同伴互助小组扩展成跨学院网络',
        nextNodeId: 'ending_peer_network_builder',
        requiredFlags: { builtPeerSupportGroup: true },
        statusChanges: { social: 16, reputation: 12, energy: -8, mood: 10 },
        affectionChanges: { dazhi: 14, xiaojie: 12, wang_laoshi: 8 },
        setFlags: { lifePathPeerNetwork: true },
        endingId: 'peer_network_builder',
        narrativeText: '毕业前，互助群已经有了学习答疑、兼职核验、匿名求助和情绪支持四个频道。你没有解决所有问题，但你让更多人不用一个人面对问题。网络的意义不是永远在线，而是在关键时刻有人回应。'
      },
      {
        id: 'a8_c2_recovery_ending',
        text: '给自己一段恢复期，重新选择下一站',
        nextNodeId: 'ending_resilient_restart',
        statusChanges: { mood: 16, energy: 10, reputation: -2, antiFraudAwareness: 6 },
        affectionChanges: { wang_laoshi: 10, xuejie: 6, xiaojie: 6 },
        setFlags: { lifePathResilientRestart: true },
        endingId: 'resilient_restart',
        narrativeText: '你没有把毕业变成最后期限。你申请了一段实习前缓冲期，修复作息、整理作品、重新思考方向。不是所有成长都要冲刺到终点，有些成长需要先把自己接住。'
      },
      {
        id: 'a8_c2_warning_ending',
        text: '继续硬撑，把所有机会都抓在手里',
        nextNodeId: 'ending_burnout_warning',
        requiredFlags: { seniorBurnoutRisk: true },
        statusChanges: { energy: -30, mood: -20, reputation: -6, gpa: -0.08 },
        affectionChanges: { wang_laoshi: -2, xuejie: -4, dazhi: -4 },
        setFlags: { lifePathBurnoutWarning: true },
        endingId: 'burnout_warning',
        narrativeText: '你同时准备面试、论文、项目答辩和训练营，直到在毕业照前一天发烧。你终于听见身体替你说了一句：够了。那不是失败的声音，而是你长期忽略的求助。'
      }
    ]
  },

  ending_research_scholar: {
    id: 'ending_research_scholar',
    actId: 'act8',
    title: '人生结局：可信技术研究者',
    description: '你继续深造，研究可信 AI、数字安全和学生风险教育。你没有忘记最初的问题：为什么聪明的新生也会被骗。后来你在论文致谢里写，很多判断力不是天生拥有的，而是在一次次被允许停下、核验、求助之后长出来的。',
    location: '研究生实验室',
    week: 80,
    day: 7,
    isEnding: true,
    endingId: 'research_scholar'
  },

  ending_product_guardian: {
    id: 'ending_product_guardian',
    actId: 'act8',
    title: '人生结局：产品安全守护者',
    description: '你进入企业做用户安全和产品风控。你知道真正的安全设计，不只是拦住坏人，也要理解普通人为什么会在压力下做错判断。你在每一个转账提醒、风险弹窗和申诉入口里，都想起曾经盯着到账截图的自己。',
    location: '产品安全团队',
    week: 80,
    day: 7,
    isEnding: true,
    endingId: 'product_guardian'
  },

  ending_campus_educator: {
    id: 'ending_campus_educator',
    actId: 'act8',
    title: '人生结局：校园教育共创者',
    description: '你和学校一起把新生手册做成互动课程。每年九月，你都会看见新的学生站在校门口，而你知道他们会多一条求助路径。那份手册不再属于你一个人，它属于每个愿意把经验留下来的人。',
    location: '迎新课堂',
    week: 80,
    day: 7,
    isEnding: true,
    endingId: 'campus_educator'
  },

  ending_peer_network_builder: {
    id: 'ending_peer_network_builder',
    actId: 'act8',
    title: '人生结局：同伴网络建设者',
    description: '你把互助小组扩展成跨学院网络。它不完美，也不总是热闹，但当有人说"我差点转钱，能帮我看一下吗"，总有人回应。你终于相信，一张可靠的人际网也可以是一种安全基础设施。',
    location: '学生服务中心',
    week: 80,
    day: 7,
    isEnding: true,
    endingId: 'peer_network_builder'
  },

  ending_resilient_restart: {
    id: 'ending_resilient_restart',
    actId: 'act8',
    title: '人生结局：韧性重启',
    description: '你没有用一份漂亮去向证明自己，而是学会在需要时停下、修复、重新选择。你的大学不是爽文结局，却很真实，也很有力量。你带着未完成感离开校园，但这一次，未完成不再让你害怕。',
    location: '校园湖边',
    week: 80,
    day: 7,
    isEnding: true,
    endingId: 'resilient_restart'
  },

  ending_burnout_warning: {
    id: 'ending_burnout_warning',
    actId: 'act8',
    title: '人生结局：过载警告',
    description: '你拿到了不少机会，却几乎透支了自己。毕业不是失败，但它提醒你：如果总用燃烧换结果，迟早需要重新学习怎么生活。你在校医院门口给王老师发消息，第一次不是因为别人遇到风险，而是因为你终于承认自己也需要帮助。',
    location: '校医院门口',
    week: 80,
    day: 7,
    isEnding: true,
    endingId: 'burnout_warning'
  }
}
