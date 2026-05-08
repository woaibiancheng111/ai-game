import type { StoryNode } from '../types'

export const ACT2_NODES: Record<string, StoryNode> = {
  act2_military_training: {
    id: 'act2_military_training',
    actId: 'act2',
    title: '军训与破冰',
    description: '第二周的操场被太阳烤得发白。军训服贴在背上，口号一遍遍从队伍里滚过去。大志已经和隔壁连队交换了三个群二维码，小明把休息时间拿来背单词，小杰默默把你的水瓶挪到树荫里。你开始看见每个人面对压力的方式：有人用热闹抵抗陌生，有人用秩序抵抗失控，也有人把关心藏得很轻。',
    location: '操场',
    week: 2,
    day: 2,
    npcId: 'dazhi',
    imagePrompt: '大学军训操场，新生队列，炎热阳光，休息区水瓶和迷彩服',
    playerChoices: [
      {
        id: 'a2_c1_social',
        text: '跟大志一起组织连队破冰小游戏',
        nextNodeId: 'act2_dorm_conflict',
        statusChanges: { social: 10, reputation: 6, energy: -12, mood: 6, trust: 4 },
        affectionChanges: { dazhi: 9, xiaojie: 2 },
        setFlags: { knownByClassmates: true },
        narrativeText: '你们把尴尬的休息时间变成了小型见面会。大志兴奋得满头是汗："你有当组织者的天赋啊！"你被夸得有点飘，也第一次尝到被人需要的滋味。'
      },
      {
        id: 'a2_c1_endure',
        text: '保存体力，训练结束后去图书馆',
        nextNodeId: 'act2_dorm_conflict',
        statusChanges: { gpa: 0.12, energy: -6, social: -2, mood: -2 },
        affectionChanges: { xiaoming: 8, xuejie: 4, dazhi: -2 },
        setFlags: { disciplinedRoutine: true },
        narrativeText: '训练结束后，你带着一身疲惫去了图书馆。林雨薇没有夸你自律，只把一本习题册推过来："如果你想把生活稳住，先从可重复的小事开始。"'
      },
      {
        id: 'a2_c1_help',
        text: '注意到有人中暑，主动找教官和辅导员',
        nextNodeId: 'act2_dorm_conflict',
        statusChanges: { reputation: 9, social: 4, energy: -8, antiFraudAwareness: 3 },
        affectionChanges: { wang_laoshi: 10, xiaojie: 5 },
        setFlags: { helpedClassmate: true },
        narrativeText: '王老师很快赶来处理。她没有把这件事说成英雄行为，只认真告诉你："发现风险、及时求助，比逞强更难，也更重要。"这句话和你第一周笔记里的"求助"悄悄连上了。'
      }
    ]
  },

  act2_dorm_conflict: {
    id: 'act2_dorm_conflict',
    actId: 'act2',
    title: '宿舍小风暴',
    description: '军训后的夜晚，疲惫像没拧干的毛巾挂在每个人身上。大志外放短视频，说这样才有宿舍气氛；小明皱着眉背单词，背错两次后把书合上；小杰戴着耳机，音量却开得越来越大。你发现真正难的不是认识室友，而是在大家都很累的时候，还记得对方也是人。',
    location: '宿舍楼 308',
    week: 3,
    day: 3,
    npcId: 'xiaoming',
    imagePrompt: '大学宿舍夜晚，外放手机、摊开的单词书、戴耳机的室友，生活矛盾开始浮现',
    playerChoices: [
      {
        id: 'a2_c1b_coordinate',
        text: '提议定一个宿舍安静时间',
        nextNodeId: 'act2_living_expense',
        statusChanges: { social: 4, reputation: 4, mood: 2 },
        affectionChanges: { xiaoming: 8, xiaojie: 5, dazhi: -2 },
        setFlags: { dormQuietRule: true },
        narrativeText: '你没有站队，只把情绪翻译成规则：十一点后戴耳机、早课前不外放、谁需要早睡提前说。大志嘴上嫌麻烦，最后还是答应了。小明小声说："规则比忍着好。"'
      },
      {
        id: 'a2_c1b_party',
        text: '站在大志这边，觉得大学就该热闹',
        nextNodeId: 'act2_living_expense',
        statusChanges: { social: 6, mood: 4, gpa: -0.05, trust: 3 },
        affectionChanges: { dazhi: 8, xiaoming: -7, xiaojie: -2 },
        setFlags: { dormNoiseIssue: true },
        narrativeText: '宿舍气氛一时热闹起来，你也享受被大志当成"自己人"的感觉。可第二天小明明显没睡好。你隐约感觉，有些关系不能只靠一起开心维持，也需要照顾没出声的人。'
      },
      {
        id: 'a2_c1b_silent',
        text: '不插手，假装睡着',
        nextNodeId: 'act2_living_expense',
        statusChanges: { mood: -5, energy: -8, social: -2 },
        affectionChanges: { xiaojie: 2, xiaoming: -2, dazhi: -1 },
        setFlags: { avoidedDormConflict: true },
        narrativeText: '你躲过了冲突，也把问题留到了下一次。半夜醒来时，宿舍终于安静，却安静得有点僵。你听见小杰键盘轻响，像有人在替这间屋子记录未解决的裂缝。'
      }
    ]
  },

  act2_living_expense: {
    id: 'act2_living_expense',
    actId: 'act2',
    title: '生活费告急',
    description: '月底还没到，校园卡余额已经比预期少了一截。教材费、军训用品、社团聚餐、给家里报平安时没说出口的小开销，一笔笔让"独立生活"变得具体。你以前以为缺钱是一种数字，现在才知道它会改变人的眼神：让人更容易相信一个看起来及时的机会。',
    location: '校园卡服务中心',
    week: 3,
    day: 6,
    npcId: 'dazhi',
    imagePrompt: '校园卡服务中心，自助机余额页面，学生看着消费记录发愣，生活压力出现',
    playerChoices: [
      {
        id: 'a2_c1c_budget',
        text: '认真做预算，减少非必要开销',
        nextNodeId: 'act2_course_pick',
        statusChanges: { money: 200, mood: -2, antiFraudAwareness: 5, trust: -2 },
        affectionChanges: { xiaoming: 5, xuejie: 4 },
        setFlags: { madeBudget: true },
        narrativeText: '你把消费记录分成教材、吃饭、社交三类，发现最贵的不是某一笔，而是每次"就这一次"。预算表不浪漫，却让你重新拿回一点主动权。'
      },
      {
        id: 'a2_c1c_borrow',
        text: '向大志吐槽缺钱，听他说找兼职',
        nextNodeId: 'act2_course_pick',
        statusChanges: { social: 4, trust: 6, mood: 3, antiFraudAwareness: -2 },
        affectionChanges: { dazhi: 6, li_xuezhang: 2 },
        setFlags: { moneyPressure: true, askedAboutPartTime: true },
        narrativeText: '大志拍着胸口说："别慌，我认识的学长渠道多。"他说得真诚，甚至有点替你着急。这句话像一颗小钩子，轻轻挂住了你的压力，也挂住了你想证明自己能解决问题的心。'
      },
      {
        id: 'a2_c1c_counselor',
        text: '去问王老师有没有校内勤工助学',
        nextNodeId: 'act2_course_pick',
        statusChanges: { antiFraudAwareness: 8, reputation: 3, energy: -4 },
        affectionChanges: { wang_laoshi: 9, xiaojie: 3 },
        setFlags: { askedWorkStudy: true },
        narrativeText: '王老师给你看学校官网的勤工助学申请页，又把资助中心电话写在纸上："缺钱不是羞耻，走错渠道才危险。正规岗位不会要求先交钱。"你把那张纸夹进新生手册。'
      }
    ]
  },

  act2_course_pick: {
    id: 'act2_course_pick',
    actId: 'act2',
    title: '选课决策',
    description: '第四周，选课系统开放。页面卡得像所有人的未来都挤在同一个服务器里。林雨薇建议你稳住基础课，李学长发来一份排版精美的"高分水课清单"，大志在群里疯狂转发。你第一次发现，建议也分重量：有的建议让你轻松一周，有的建议让你少还几年债。',
    location: '图书馆',
    week: 4,
    day: 1,
    npcId: 'li_xuezhang',
    imagePrompt: '大学图书馆，自习桌上打开选课系统，手机聊天消息弹窗，学习和机会的拉扯',
    playerChoices: [
      {
        id: 'a2_c2_solid',
        text: '按学姐建议选择基础课和适量兴趣课',
        nextNodeId: 'act2_first_quiz',
        statusChanges: { gpa: 0.18, mood: 4, energy: -8 },
        affectionChanges: { xuejie: 10, li_xuezhang: -2 },
        setFlags: { solidCoursePlan: true },
        narrativeText: '你的课表不算轻松，但结构稳定。林雨薇看完后说："这份课表不是最舒服的，但能让你以后少还债。"你把这句话记住，虽然当下并不完全喜欢。'
      },
      {
        id: 'a2_c2_easy',
        text: '相信李学长，优先选择高分水课',
        nextNodeId: 'act2_first_quiz',
        statusChanges: { gpa: -0.04, mood: 8, trust: 8, energy: 6 },
        affectionChanges: { li_xuezhang: 8, xuejie: -4, xiaoming: -3 },
        setFlags: { trustedLiAdvice: true },
        narrativeText: '李学长的清单确实省心，你的课表空出不少时间。他很自然地接了一句："空出来的时间可以做点兼职，新生早点接触社会没坏处。"这句话没有威胁，却让你觉得自己好像该更成熟一点。'
      },
      {
        id: 'a2_c2_verify',
        text: '把水课清单逐门核验，再决定',
        nextNodeId: 'act2_first_quiz',
        statusChanges: { antiFraudAwareness: 8, gpa: 0.08, energy: -10, trust: -3 },
        affectionChanges: { xiaojie: 6, xuejie: 5 },
        setFlags: { verifiedAdvice: true },
        narrativeText: '你查到其中两门课评价并不稳定，截图里的"稳赚"也有夸大。小杰看了你的检索记录，难得评价："比只看截图靠谱。"你发现核验不是怀疑所有人，而是不给自己偷懒的理由。'
      }
    ]
  },

  act2_first_quiz: {
    id: 'act2_first_quiz',
    actId: 'act2',
    title: '第一次小测',
    description: '选课后的第一场高数小测来得比你想象中更快。题目不难，却像一面镜子：有人发现自己还没进入状态，有人开始熬夜补课，也有人把焦虑转向"找点来钱快的事情"。小明把错题本摊在桌上，林雨薇在学习群里发复盘模板。分数本身没有声音，但它能把人的不安放大。',
    location: '教学楼',
    week: 4,
    day: 4,
    npcId: 'xiaoming',
    imagePrompt: '大学教学楼小测后，试卷、错题本、学习群消息，新生第一次学业压力',
    playerChoices: [
      {
        id: 'a2_c2b_review',
        text: '认真复盘错题，调整学习计划',
        nextNodeId: 'act2_club_fair',
        statusChanges: { gpa: 0.16, energy: -10, mood: 3, antiFraudAwareness: 3 },
        affectionChanges: { xiaoming: 10, xuejie: 8 },
        setFlags: { reviewedFirstQuiz: true, stableStudyRhythm: true },
        narrativeText: '你没有把分数当成审判，而是把错题分成概念不清、计算粗心、复习不到位三类。小明看完你的表格，默默把自己的错题本挪过来："一起改？"这大概就是他的表达友情的方式。'
      },
      {
        id: 'a2_c2b_escape',
        text: '成绩不理想，想靠社团和兼职找回存在感',
        nextNodeId: 'act2_club_fair',
        statusChanges: { mood: -6, social: 6, trust: 6, gpa: -0.06 },
        affectionChanges: { dazhi: 7, li_xuezhang: 4, xiaoming: -3 },
        setFlags: { quizFrustrated: true, seekingQuickReward: true },
        narrativeText: '你把试卷塞进书包最底层，好像这样分数就不会继续看着你。大志说创业社今晚有分享会，"听说能接项目，来钱也快。"这句话刚好撞上你的失落，让它听起来不像诱惑，像补偿。'
      },
      {
        id: 'a2_c2b_ask_help',
        text: '去找林雨薇和王老师聊聊压力',
        nextNodeId: 'act2_club_fair',
        statusChanges: { mood: 8, reputation: 3, antiFraudAwareness: 6, energy: -5 },
        affectionChanges: { xuejie: 10, wang_laoshi: 8, xiaojie: 3 },
        setFlags: { askedAcademicHelp: true, knowsSupportPath: true },
        narrativeText: '林雨薇帮你把学习任务拆成一周计划，王老师提醒你："刚入学的波动很正常，别在低落的时候做高风险决定。"你把这句话记进备忘录，却还不知道它很快会派上用场。'
      }
    ]
  },

  act2_club_fair: {
    id: 'act2_club_fair',
    actId: 'act2',
    title: '社团招新',
    description: '社团招新像一场小型集市，也像一场关于未来的试衣间。学业促进协会承认基础很慢，编程队展示漂亮项目，学生会许诺组织经验，创业社把"人脉"和"资源"写得很大。大志拉着你去创业社展台，李学长在那里帮忙，笑容熟练得像每一句话都提前练过。',
    location: '社团广场',
    week: 5,
    day: 2,
    npcId: 'dazhi',
    imagePrompt: '大学社团招新广场，摊位、彩旗、学生围观，创业社和学习社对比鲜明',
    playerChoices: [
      {
        id: 'a2_c3_study_club',
        text: '加入学业促进协会，继续跟学姐学习',
        nextNodeId: 'act2_xiaojie_warning',
        statusChanges: { gpa: 0.15, social: 4, energy: -8, mood: 2 },
        affectionChanges: { xuejie: 12, xiaoming: 5, dazhi: -2 },
        setFlags: { joinedStudyClub: true },
        narrativeText: '林雨薇把你拉进学习小组，群公告第一条就是"不懂就问，不要假装懂"。你突然觉得踏实了些。踏实不刺激，但很能救命。'
      },
      {
        id: 'a2_c3_entrepreneur',
        text: '被创业社吸引，听李学长讲兼职项目',
        nextNodeId: 'act2_part_time_hook',
        statusChanges: { social: 8, trust: 10, mood: 6, antiFraudAwareness: -4 },
        affectionChanges: { dazhi: 8, li_xuezhang: 8, xuejie: -3 },
        setFlags: { joinedEntrepreneurClub: true, internshipHooked: true },
        narrativeText: '李学长讲得很真诚："不是让你赚大钱，就是早点接触社会。"他没有催你，只把一个看似成熟的入口放到你面前。大志在旁边疯狂点头，你很难不被这种确定感感染。'
      },
      {
        id: 'a2_c3_security',
        text: '先去听辅导员的反诈宣讲',
        nextNodeId: 'act2_xiaojie_warning',
        statusChanges: { antiFraudAwareness: 15, trust: -6, reputation: 4, social: -1 },
        affectionChanges: { wang_laoshi: 10, xiaojie: 6 },
        setFlags: { attendedAntiFraudTalk: true },
        narrativeText: '王老师展示了几个真实案例：高薪兼职、保证金、虚假合同、到账诱饵。没有血淋淋的夸张，只有一张张普通聊天截图。你发现风险不是藏在黑暗里，它经常穿着校园外套站在阳光下。'
      }
    ]
  },

  act2_part_time_hook: {
    id: 'act2_part_time_hook',
    actId: 'act2',
    title: '兼职机会',
    description: '李学长把你和大志拉进一个"线上文字录入兼职"群。群公告写着时间自由、按单结算、不影响上课，语气克制得不像广告。阿强刚晒出到账截图，小美也说新生问卷可以匹配适合的兼职方向。一切都太像真的了，甚至连谨慎都显得有点不合群。',
    location: '创业社展台',
    week: 5,
    day: 3,
    npcId: 'li_xuezhang',
    imagePrompt: '手机群聊里出现兼职到账截图，创业社展台背景，新生犹豫地看着屏幕',
    playerChoices: [
      {
        id: 'a2_c4_join',
        text: '加入兼职群，先看看机会',
        nextNodeId: 'act2_bridge_to_act3',
        statusChanges: { trust: 12, mood: 5, antiFraudAwareness: -3 },
        affectionChanges: { li_xuezhang: 7, dazhi: 5, xiaojie: -2 },
        setFlags: { joinedPartTimeGroup: true, trustedInternship: true },
        narrativeText: '群里气氛热闹得像普通班群，有人问宿舍网速，有人晒奶茶，还有阿强的到账截图。大志眼睛发亮："一周几百，真不亏啊。"你没有立刻心动，却也没有退出。'
      },
      {
        id: 'a2_c4_ask_proof',
        text: '要求看公司信息和合同细节',
        nextNodeId: 'act2_bridge_to_act3',
        statusChanges: { antiFraudAwareness: 10, trust: -4, social: -1 },
        affectionChanges: { xiaojie: 8, li_xuezhang: -3 },
        setFlags: { askedForProof: true, savedScreenshots: true },
        narrativeText: '李学长笑着说你太谨慎，但还是发来营业执照照片。那张图边角很清晰，公章也很红。你顺手保存截图，不是因为已经怀疑，而是因为小杰说过：证据最好在还没出事时就留下。'
      },
      {
        id: 'a2_c4_refuse',
        text: '暂时拒绝，把重心放回课程',
        nextNodeId: 'act2_bridge_to_act3',
        statusChanges: { gpa: 0.12, trust: -8, antiFraudAwareness: 8, mood: -1 },
        affectionChanges: { xuejie: 6, xiaojie: 6, dazhi: -4 },
        setFlags: { refusedEarlyInternship: true },
        narrativeText: '大志有点失望，李学长也没再劝，只说机会以后不一定有。你听见那句话时心里动了一下。小杰低头敲键盘，像是在查什么，屏幕光照得他表情很冷静。'
      }
    ]
  },

  act2_xiaojie_warning: {
    id: 'act2_xiaojie_warning',
    actId: 'act2',
    title: '微弱提醒',
    description: '晚上，小杰突然把电脑屏幕转向你。屏幕上不是结论，而是几条被他并排打开的线索：兼职避坑帖、企业查询结果、图片反搜页面，关键词都指向"高薪文字录入"和"先到账再收费"。小杰说话很轻："我不是说它一定是假的，但它很会利用新生的压力。"',
    location: '宿舍楼 308',
    week: 5,
    day: 4,
    npcId: 'xiaojie',
    imagePrompt: '夜晚宿舍电脑屏幕显示反诈帖子，沉默室友指向关键词，悬疑校园气氛',
    playerChoices: [
      {
        id: 'a2_c5_listen',
        text: '认真听小杰分析，保存相关证据',
        nextNodeId: 'act2_bridge_to_act3',
        statusChanges: { antiFraudAwareness: 14, trust: -7, energy: -4 },
        affectionChanges: { xiaojie: 12, wang_laoshi: 2 },
        setFlags: { listenedToXiaojie: true, savedScreenshots: true },
        narrativeText: '小杰没有下结论，只教你怎么查公司主体、图片来源和群成员关系。你第一次觉得"谨慎"不是胆小，而是一种需要练习的能力。'
      },
      {
        id: 'a2_c5_ignore',
        text: '觉得他想太多，机会来了先抓住',
        nextNodeId: 'act2_bridge_to_act3',
        statusChanges: { trust: 12, mood: 3, antiFraudAwareness: -6 },
        affectionChanges: { dazhi: 5, xiaojie: -7, li_xuezhang: 4 },
        setFlags: { ignoredXiaojie: true, trustedInternship: true },
        narrativeText: '小杰沉默几秒，只说："那至少别转钱。"你随口答应，心里却更在意那张到账截图。真正危险的不是你完全相信，而是你开始替它解释每一个疑点。'
      },
      {
        id: 'a2_c5_go_talk',
        text: '和小杰一起去问王老师',
        nextNodeId: 'act2_bridge_to_act3',
        statusChanges: { antiFraudAwareness: 18, trust: -10, reputation: 4, energy: -6 },
        affectionChanges: { xiaojie: 10, wang_laoshi: 12 },
        setFlags: { askedCounselorEarly: true, listenedToXiaojie: true },
        narrativeText: '王老师没有否定兼职本身，只把判断标准写给你："先交钱、押证件、透露隐私、催你立刻决定，任意一条出现都要停下来。"你把这四条复制到手机备忘录，像给未来的自己留一条绳子。'
      }
    ]
  },

  act2_bridge_to_act3: {
    id: 'act2_bridge_to_act3',
    actId: 'act2',
    title: '幕间：机会靠近',
    description: '第五周末，校园从军训的整齐口号里退出来，重新变得松散而热闹。你在图书馆门口看见勤工助学公告，也在手机里看见兼职群不断弹出的消息：有人问任务时间，有人晒到账截图，有人说"新生先做问卷，系统会分配适合岗位"。大志兴奋，小杰沉默，林雨薇只提醒你别在低落和缺钱的时候急着证明自己。你忽然发现，风险不是突然从黑暗里扑出来的，它会先把自己打扮成一个刚好解决你烦恼的机会。',
    location: '图书馆门口',
    week: 5,
    day: 7,
    npcId: 'xiaojie',
    imagePrompt: '大学图书馆门口，勤工助学公告栏和手机兼职群消息同时出现，学生站在两种选择之间',
    playerChoices: [
      {
        id: 'a2_bridge_note',
        text: '把疑点和心动都记下来，再往前看',
        nextNodeId: 'act3_honey_trap',
        statusChanges: { antiFraudAwareness: 4, mood: 1 },
        affectionChanges: { xiaojie: 3 },
        narrativeText: '你在备忘录写下两列：为什么心动，哪里不对劲。小杰看了一眼，说："能把心动也写下来，就不容易被它牵着走。"你收起手机，走向食堂。有人正拿着问卷站在门口。'
      }
    ]
  }
}
