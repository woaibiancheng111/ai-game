import type { StoryNode } from '../types'

export const ACT4_NODES: Record<string, StoryNode> = {
  act4_rebuild_week: {
    id: 'act4_rebuild_week',
    actId: 'act4',
    title: '风波之后',
    description: '反诈风波过去后，校园生活没有立刻恢复平静。食堂依旧排队，早八依旧点名，可 308 宿舍里多了一种说不清的安静。大志不再急着转发消息，小杰又缩回屏幕后面，小明开始担心你落下的课程。你发现，识破风险只是第一步，真正难的是把学习、关系和情绪重新扶起来。',
    location: '宿舍楼 308',
    week: 10,
    day: 2,
    npcId: 'wang_laoshi',
    imagePrompt: '宿舍晨光，反诈风波后几名室友重新整理书桌和生活节奏，温和现实主义校园场景',
    playerChoices: [
      {
        id: 'a4_c1_rebuild_plan',
        text: '和小明一起制定两周补课计划',
        nextNodeId: 'act4_campus_routine',
        statusChanges: { gpa: 0.18, energy: -10, mood: 4 },
        affectionChanges: { xiaoming: 12, xuejie: 6 },
        setFlags: { madeRecoveryPlan: true },
        narrativeText: '小明把你的课程缺口列成清单，林雨薇又补了一份重点页码。计划很满，但不像惩罚，更像修桥。你第一次觉得落下的东西可以一点点补回来。'
      },
      {
        id: 'a4_c1_roommates',
        text: '先陪大志和小杰把事情说开',
        nextNodeId: 'act4_campus_routine',
        statusChanges: { social: 10, mood: 8, energy: -6, reputation: 4 },
        affectionChanges: { dazhi: 14, xiaojie: 10, wang_laoshi: 4 },
        setFlags: { repairedDormTrust: true },
        narrativeText: '大志低声承认自己太想证明"有路子"，小杰也说自己不该只在最后才提醒。你们没有立刻变成完美室友，但那晚 308 第一次没有用玩笑盖住问题。'
      },
      {
        id: 'a4_c1_counselor',
        text: '约王老师做一次完整复盘',
        nextNodeId: 'act4_campus_routine',
        statusChanges: { antiFraudAwareness: 10, mood: 6, reputation: 5, energy: -4 },
        affectionChanges: { wang_laoshi: 14, xiaojie: 5 },
        setFlags: { completedCounselorReview: true },
        narrativeText: '王老师让你把"我为什么相信它"写成三行：缺钱、熟人推荐、第一次到账。她说，复盘不是追责，是为了下次更早停下。那张纸后来被你夹进手册草稿第一页。'
      }
    ]
  },

  act4_campus_routine: {
    id: 'act4_campus_routine',
    actId: 'act4',
    title: '日常的修复',
    description: '真正的恢复不是某次谈话后立刻完成的。接下来几周，你重新面对早八、食堂排队、宿舍卫生、社团消息和补不完的笔记。风波留下的影响藏在很小的日常里：看到"兼职"会停一下，听见大志大笑会担心他又在硬撑，收到陌生链接会下意识截图。',
    location: '校园主路',
    week: 10,
    day: 6,
    npcId: 'xuejie',
    imagePrompt: '校园主路，学生穿过教学楼和食堂之间，生活逐渐恢复，温和现实感',
    playerChoices: [
      {
        id: 'a4_c1b_routine',
        text: '建立固定作息，把生活先稳住',
        nextNodeId: 'act4_peer_pressure',
        statusChanges: { mood: 8, energy: 10, gpa: 0.08 },
        affectionChanges: { xuejie: 8, xiaoming: 6 },
        setFlags: { rebuiltDailyRoutine: true },
        narrativeText: '你把起床、吃饭、复习和运动写进一张很普通的表。它不酷，也不适合发朋友圈。但连续执行一周后，你发现自己不再总被情绪推着走。'
      },
      {
        id: 'a4_c1b_escape_fun',
        text: '用聚会和短视频逃开压力',
        nextNodeId: 'act4_peer_pressure',
        statusChanges: { mood: 4, social: 6, energy: -12, gpa: -0.08 },
        affectionChanges: { dazhi: 8, xiaoming: -5 },
        setFlags: { escapedWithEntertainment: true },
        narrativeText: '你确实开心了几晚，但作业提醒开始堆积。大志也意识到不对："我们是不是有点像又在用热闹盖住问题？"你们都笑了，却笑得有点心虚。'
      },
      {
        id: 'a4_c1b_small_help',
        text: '每周做一次小复盘，必要时求助',
        nextNodeId: 'act4_peer_pressure',
        statusChanges: { antiFraudAwareness: 6, mood: 6, reputation: 4 },
        affectionChanges: { wang_laoshi: 8, xiaojie: 5 },
        setFlags: { weeklyReviewHabit: true },
        narrativeText: '你把"本周压力源、我做了什么、下周要找谁帮忙"写成三行。小杰看了你的模板，说这比鸡汤有用。你把这三行命名为"低状态时的求助脚手架"。'
      }
    ]
  },

  act4_peer_pressure: {
    id: 'act4_peer_pressure',
    actId: 'act4',
    title: '同伴压力',
    description: '学院准备让你们在班会上分享这次经历。大志担心丢脸，小杰不想站到台前，李学长的事也在同学间传开。你意识到，教育价值和当事人的感受之间，不是简单的"讲"或"不讲"。一个案例如果只剩下围观，就会从提醒变成第二次伤害。',
    location: '学院活动室',
    week: 11,
    day: 3,
    npcId: 'wang_laoshi',
    imagePrompt: '学院活动室，班会前的空椅子和投影幕，学生犹豫是否分享经历',
    playerChoices: [
      {
        id: 'a4_c2_public',
        text: '公开分享完整经历，提醒更多同学',
        nextNodeId: 'act4_second_wave',
        statusChanges: { reputation: 12, social: 6, mood: -2, antiFraudAwareness: 6 },
        affectionChanges: { wang_laoshi: 10, dazhi: -4, xiaojie: 2 },
        setFlags: { publicAntiFraudShare: true },
        narrativeText: '你的分享让班里安静了很久。几个同学记下了核验方法，但大志始终没抬头。你突然明白，正确的事也可能因为方式粗糙而伤人。教育不是把谁推到台前示众。'
      },
      {
        id: 'a4_c2_anonymous',
        text: '把经历改成匿名案例，由王老师讲',
        nextNodeId: 'act4_second_wave',
        statusChanges: { reputation: 8, mood: 8, antiFraudAwareness: 8 },
        affectionChanges: { wang_laoshi: 12, dazhi: 8, xiaojie: 6 },
        setFlags: { anonymousCaseShared: true },
        narrativeText: '王老师把人名全部隐去，只保留关键节点：熟人推荐、到账诱饵、保证金、证据保存。大志终于松了口气。班里听到的是方法，而不是谁的狼狈。'
      },
      {
        id: 'a4_c2_skip',
        text: '暂时拒绝分享，先保护室友情绪',
        nextNodeId: 'act4_second_wave',
        statusChanges: { mood: 5, social: 4, reputation: -2 },
        affectionChanges: { dazhi: 10, xiaojie: 4, wang_laoshi: -2 },
        setFlags: { delayedPublicShare: true },
        narrativeText: '你没有立刻答应班会分享。王老师尊重你的决定，只提醒你：沉默可以保护人，也可能让其他人错过提醒。你第一次体会到，善意也需要设计。'
      }
    ]
  },

  act4_second_wave: {
    id: 'act4_second_wave',
    actId: 'act4',
    title: '二次传播',
    description: '班会结束后，事情没有完全停在教室里。有人在朋友圈转发"新生兼职被骗链条"，有人在群里猜李学长和大志的名字，还有人把反诈提醒做成夸张表情包。你看见提醒被转发得越来越远，也看见它离当事人的感受越来越远。教育传播如果失去边界，也可能变成新的伤害。',
    location: '学院走廊',
    week: 11,
    day: 5,
    npcId: 'xiaojie',
    imagePrompt: '学院走廊，学生低头看手机群聊和朋友圈转发，反诈案例二次传播引发隐私边界问题',
    playerChoices: [
      {
        id: 'a4_c2b_boundary',
        text: '和王老师一起写一版匿名传播规范',
        nextNodeId: 'act4_dazhi_confession',
        statusChanges: { reputation: 8, antiFraudAwareness: 8, mood: 3, energy: -6 },
        affectionChanges: { wang_laoshi: 10, xiaojie: 7, dazhi: 4 },
        setFlags: { wroteAnonymousSharingRule: true },
        narrativeText: '你们把提醒改成"场景和方法"，删掉姓名、宿舍号和聊天截图里的头像。王老师说，保护人也是教育的一部分。你在手册草稿里加上一节：案例可以公开，羞耻不该被公开。'
      },
      {
        id: 'a4_c2b_stop_rumor',
        text: '在班群里制止猜人名和玩梗',
        nextNodeId: 'act4_dazhi_confession',
        statusChanges: { social: 6, reputation: 6, mood: -2, antiFraudAwareness: 4 },
        affectionChanges: { dazhi: 10, xiaojie: 6, wang_laoshi: 5 },
        setFlags: { stoppedRumorSpread: true },
        narrativeText: '你发了一段话：提醒可以转，猜人名不行。群里短暂安静，随后有人补了一句："确实，重点是别再有人转钱。"那一刻你知道，班级也可以被训练得更温柔一点。'
      },
      {
        id: 'a4_c2b_ignore_rumor',
        text: '不想再卷进去，假装没有看见',
        nextNodeId: 'act4_dazhi_confession',
        statusChanges: { mood: -6, reputation: -3, social: -2 },
        affectionChanges: { dazhi: -4, wang_laoshi: -2, xiaojie: -1 },
        setFlags: { ignoredSecondarySpread: true },
        narrativeText: '你把群聊静音，以为这样就能结束。可第二天大志在宿舍里更沉默了，你才发现沉默有时也会默认伤害继续发生。不是每一次不插手都叫尊重。'
      }
    ]
  },

  act4_dazhi_confession: {
    id: 'act4_dazhi_confession',
    actId: 'act4',
    title: '大志的深夜',
    description: '某天凌晨，你被一阵轻微的声音吵醒。不是大志的外放，而是他坐在床沿打电话，声音压得很低，像在跟谁解释什么。"妈，我没有乱花钱……我知道，我知道爸的店不好做……"电话挂了很久之后，他还坐在那里。你第一次看见大志不笑的样子，那张总是热闹的脸在手机光里显得很年轻，也很疲惫。你忽然明白，他为什么那么急于抓住每一个"机会"——不是贪心，是害怕辜负。',
    location: '宿舍楼 308',
    week: 11,
    day: 6,
    npcId: 'dazhi',
    imagePrompt: '深夜宿舍，一个男生坐在床沿低声打电话，手机光照亮疲惫的脸，其他室友假装睡着，情感张力',
    playerChoices: [
      {
        id: 'a4_dazhi_sit',
        text: '坐到他旁边，不说话，只是陪着',
        nextNodeId: 'act4_xiaojie_secret',
        statusChanges: { social: 8, mood: 6 },
        affectionChanges: { dazhi: 18 },
        setFlags: { dazhiOpenedUp: true },
        narrativeText: '你没有问他在哭什么，只是把水杯递过去。大志沉默了很久，然后说了一句你没想到的话："我爸的五金店今年亏了十几万，我妈让我别担心，可她说\'别担心\'的时候声音在抖。"他擦了擦脸，又说："所以那个兼职……我不是蠢，我只是太想快点赚到钱寄回去。"你第一次听见一个人把"差点被骗"说得这么心酸。你没有安慰他，因为那一刻任何安慰都太轻了。你们只是并排坐着，像两个还不太会当大人的人，在黑暗里分担了一点重量。'
      },
      {
        id: 'a4_dazhi_practical',
        text: '帮他一起查勤工助学和助学金申请',
        nextNodeId: 'act4_xiaojie_secret',
        statusChanges: { social: 6, antiFraudAwareness: 4, mood: 4 },
        affectionChanges: { dazhi: 14, wang_laoshi: 4 },
        setFlags: { helpedDazhiFinance: true },
        narrativeText: '你把学校资助中心页面翻出来，和他一起看条件。大志嘴上说"我又不是申请不起"，手却已经在截图保存。你没有点破他的倔强，只说："先申请着，又不丢人。"第二天，他没有再在群里转那些来路不明的兼职广告。有些改变不是靠道理，是靠有人在你最不想承认困难的时候，安安静静帮你打开一个正规入口。'
      },
      {
        id: 'a4_dazhi_pretend_sleep',
        text: '假装没听见，翻身继续睡',
        nextNodeId: 'act4_xiaojie_secret',
        statusChanges: { mood: -4, social: -3 },
        affectionChanges: { dazhi: -2 },
        setFlags: { missedDazhiMoment: true },
        narrativeText: '你翻了个身，假装呼吸均匀。大志的电话声停了，宿舍重新安静下来。第二天他照常大笑、照常抢食堂最后一个鸡腿。可你总觉得那天晚上错过了什么——不是一次帮忙的机会，而是一次真正了解一个人的窗口。那扇窗很小，错过之后不一定会再打开。'
      }
    ]
  },

  act4_xiaojie_secret: {
    id: 'act4_xiaojie_secret',
    actId: 'act4',
    title: '沉默者的来路',
    description: '讨论手册内容时，小杰负责写"被骗后怎么办"那一页。他写得异常详细：怎么截图、怎么找客服冻结、怎么报警、怎么跟家人开口。你说这也太专业了吧，像亲身经历过。小杰停下打字的手，沉默了几秒——那几秒的沉默，比他平时所有的沉默都更重。',
    location: '图书馆讨论室',
    week: 12,
    day: 1,
    npcId: 'xiaojie',
    imagePrompt: '图书馆讨论室，一个戴帽衫的男生对着电脑屏幕停住，旁边同学安静注视，情感暗涌',
    playerChoices: [
      {
        id: 'a4_xiaojie_ask',
        text: '轻声问他：是不是有什么事想说',
        nextNodeId: 'act4_xuejie_tired',
        statusChanges: { social: 6, mood: 4 },
        affectionChanges: { xiaojie: 20 },
        setFlags: { xiaojieRevealedPast: true },
        narrativeText: '小杰摘下帽子，露出少见的表情——不是冷静，是忍着什么。"我妈……高一那年被电话诈骗骗了八万。"他说得很平，像在念别人的故事。"她不敢告诉我爸，自己扛了半年，头发白了一大片。后来还是我发现转账记录……"他把屏幕转向你，上面写着"被骗后不要独自承受"。"这句话不是我编的，是我从那年开始就想对我妈说的。"你看着他的眼睛，第一次理解为什么他总是第一个说"先截图"。那不是性格冷静，那是一个少年用了三年时间把愤怒和心疼磨成的本能。'
      },
      {
        id: 'a4_xiaojie_space',
        text: '不追问，只说：你写的这页，一定能帮到很多人',
        nextNodeId: 'act4_xuejie_tired',
        statusChanges: { mood: 5, reputation: 3 },
        affectionChanges: { xiaojie: 14 },
        setFlags: { respectedXiaojieBoundary: true },
        narrativeText: '小杰点了点头，重新戴上帽子，继续打字。他没有说更多，但那天"被骗后怎么办"那一页写得比任何部分都扎实。你没有问他为什么，因为有些事不需要被讲出来才存在。他把那一页命名为"给还不敢开口的人"。'
      },
      {
        id: 'a4_xiaojie_joke',
        text: '开玩笑说他是不是看多了反诈纪录片',
        nextNodeId: 'act4_xuejie_tired',
        statusChanges: { mood: -2, social: -2 },
        affectionChanges: { xiaojie: -8 },
        setFlags: { misjudgedXiaojie: true },
        narrativeText: '小杰的笑容很短，像一扇被风吹开又立刻关上的窗。他说"差不多吧"，声音恢复了平时的距离感。你后来才明白，有些玩笑不是伤害，只是把一个人正准备交出的信任轻轻推了回去。他那天之后写完了整页内容，但再也没有主动提起那个停顿。'
      }
    ]
  },

  act4_xuejie_tired: {
    id: 'act4_xuejie_tired',
    actId: 'act4',
    title: '学姐也会累',
    description: '手册讨论结束后，你在图书馆门口碰见林雨薇。她没有像往常一样先递给你学习建议，而是靠在走廊墙上，眼镜推到额头上，盯着手机发呆。屏幕上是一封导师的邮件。你叫她名字时，她愣了一下才回过神来——你第一次看见她反应慢半拍的样子。那个永远温柔、永远稳当的学姐，原来也有被什么东西压着喘不上气的时刻。',
    location: '图书馆走廊',
    week: 12,
    day: 2,
    npcId: 'xuejie',
    imagePrompt: '大学图书馆走廊黄昏，戴眼镜的女生靠墙发呆看手机，旁边学弟犹豫要不要上前，柔和光影',
    playerChoices: [
      {
        id: 'a4_xuejie_care',
        text: '请她喝杯热饮，安静坐一会儿',
        nextNodeId: 'act4_club_project',
        statusChanges: { social: 5, mood: 8, energy: -3 },
        affectionChanges: { xuejie: 20 },
        setFlags: { caredForXuejie: true, sawXuejieVulnerable: true },
        narrativeText: '你去自动贩卖机买了两杯热可可。林雨薇接过来的时候笑了一下，那种笑不是礼貌，是真的松了口气。她说导师让她重做一组实验数据，保研名额可能不够稳。"我跟你们说\'别急\'，其实我自己也很急。"你第一次意识到，那些一直在帮你的人，并不是因为她们不需要帮助，而是没有人停下来问她们还好吗。那杯热可可不贵，但那十分钟的安静，是你第一次从被照顾的人变成照顾别人的人。'
      },
      {
        id: 'a4_xuejie_encourage',
        text: '认真地说：学姐帮了我们很多，轮到我们了',
        nextNodeId: 'act4_club_project',
        statusChanges: { social: 4, mood: 6, reputation: 3 },
        affectionChanges: { xuejie: 16 },
        setFlags: { encouragedXuejie: true, sawXuejieVulnerable: true },
        narrativeText: '林雨薇推了推眼镜，嘴角动了动，像是想说"不用"，但最后只说了一个"嗯"。那是你听过她最短的一句话，也是最诚实的。她后来在学习群里发了一条很少见的消息："最近我也有点累，大家互相照顾。"群里一下子冒出很多人回复"学姐辛苦了"。你忽然明白，承认疲惫有时候不是示弱，是给周围的人一个靠近的入口。'
      },
      {
        id: 'a4_xuejie_miss',
        text: '怕打扰她，假装没看见，走了',
        nextNodeId: 'act4_club_project',
        statusChanges: { mood: -3 },
        affectionChanges: { xuejie: -3 },
        setFlags: { missedXuejieMoment: true },
        narrativeText: '你低头走过，觉得自己不够资格关心一个比你厉害很多的人。可回到宿舍后，你翻来覆去想的不是作业，而是她靠在墙上的样子。你终于承认，回避不总是尊重，有时候它只是害怕自己的关心不够好。可关心本来就不需要够好，只需要在那里。'
      }
    ]
  },

  act4_club_project: {
    id: 'act4_club_project',
    actId: 'act4',
    title: '反诈小项目',
    description: '学生会和学业促进协会准备做一份"新生安全清单"。林雨薇负责学习适应，小杰负责信息核验，大志说自己可以把话写得不那么吓人。白板上写满停一下、查主体、找老师、留证据、保护隐私。你突然意识到，这份清单不是对失败的纪念，而是把一次真实经历磨成后来者能握住的工具。',
    location: '图书馆讨论室',
    week: 12,
    day: 4,
    npcId: 'xuejie',
    imagePrompt: '图书馆讨论室，学生围着白板制作新生安全清单，便签、电脑、温暖灯光',
    playerChoices: [
      {
        id: 'a4_c3_checklist',
        text: '主做“转账前 30 秒检查清单”',
        nextNodeId: 'act4_bridge_to_act5',
        statusChanges: { antiFraudAwareness: 12, reputation: 10, energy: -8 },
        affectionChanges: { xiaojie: 10, wang_laoshi: 8 },
        setFlags: { builtTransferChecklist: true },
        narrativeText: '你们把清单压缩成四句话：停一下、查主体、看是否先交钱、找老师确认。小杰坚持把"截图留证"放在第一屏，因为真正慌的时候，人只能记住最短的动作。'
      },
      {
        id: 'a4_c3_balance',
        text: '主做“学习、社交、兼职平衡表”',
        nextNodeId: 'act4_bridge_to_act5',
        statusChanges: { gpa: 0.12, mood: 6, reputation: 8, energy: -8 },
        affectionChanges: { xuejie: 12, xiaoming: 8, dazhi: 4 },
        setFlags: { builtBalanceGuide: true },
        narrativeText: '林雨薇把课业节奏写得很实用，大志加了一句："缺钱先查勤工助学，别信神秘渠道。"大家都笑了。这句玩笑不再是逃避，而是他把教训重新说出口的方式。'
      },
      {
        id: 'a4_c3_support',
        text: '主做“求助路径地图”',
        nextNodeId: 'act4_bridge_to_act5',
        statusChanges: { mood: 8, reputation: 10, antiFraudAwareness: 8 },
        affectionChanges: { wang_laoshi: 12, xiaojie: 6, dazhi: 6 },
        setFlags: { builtSupportMap: true },
        narrativeText: '你把辅导员、保卫处、资助中心、心理中心和教务入口画成一张图。王老师看了很久，说："这才像真正能用的新生手册。"你忽然想起第一周阳台上写下的那粒种子，它开始发芽了。'
      }
    ]
  },

  act4_bridge_to_act5: {
    id: 'act4_bridge_to_act5',
    actId: 'act4',
    title: '幕间：手册第一次成形',
    description: '十二月前的最后一次讨论，你们把白板上的便签一张张取下来，贴进共享文档。那些词终于有了顺序：先稳住生活，再识别压力；先保护隐私，再核验机会；先留下证据，再寻求帮助。大志坚持把文字写得像人话，小明删掉了几句太空的口号，小杰把所有链接换成学校官网入口。林雨薇看着文档标题，说："这不是反诈宣传，这是新生真正会遇到的生活。"窗外风变冷了，期末月也快到了。',
    location: '图书馆讨论室',
    week: 13,
    day: 5,
    npcId: 'xuejie',
    imagePrompt: '冬日前的图书馆讨论室，学生围着共享文档整理新生手册，窗外天色变冷',
    playerChoices: [
      {
        id: 'a4_bridge_pack_up',
        text: '保存手册初稿，准备进入期末月',
        nextNodeId: 'act5_final_month',
        statusChanges: { reputation: 3, mood: 3, energy: -2 },
        setFlags: { handbookDraftReady: true },
        narrativeText: '你点击保存，文档右上角显示"已同步"。这两个字很轻，却让你有点踏实。接下来，你要面对的不是骗子，而是另一种同样真实的风险：焦虑、捷径和过载。'
      }
    ]
  }
}
