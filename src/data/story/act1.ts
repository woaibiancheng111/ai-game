import type { StoryNode } from '../types'

export const ACT1_NODES: Record<string, StoryNode> = {
  act1_start: {
    id: 'act1_start',
    actId: 'act1',
    title: '入学报到',
    description: '九月的校门像一张刚刚翻开的扉页。你拖着行李箱站在人流边缘，录取通知书、校园卡、家里反复叮嘱的话都挤在背包里。迎新棚下，一个戴眼镜的学姐把矿泉水递给迷路的新生，又低头在表格上划掉一个名字。她抬眼看见你，声音不高，却让嘈杂的人群安静了一点："同学，第一次来？报到处在这边。"她胸牌上写着：林雨薇，学习委员。',
    location: '校门口',
    week: 1,
    day: 1,
    npcId: 'xuejie',
    imagePrompt: '大学校门口，新生报到，人群、行李箱、迎新志愿者，清爽明亮的校园动画场景',
    playerChoices: [
      {
        id: 'c1_enthusiastic',
        text: '热情地打招呼："学姐好！请多关照！"',
        nextNodeId: 'act1_node2',
        statusChanges: { social: 5, reputation: 3, mood: 4 },
        affectionChanges: { xuejie: 8 },
        narrativeText: '你把紧张藏进笑里，主动问好。林雨薇没有夸你外向，只把一张折了角的新生手册递过来："先别急着表现，第一天最重要的是别丢东西、别走错流程。跟我来。"那句"别急"像给你的大学生活按下了第一个缓冲键。'
      },
      {
        id: 'c1_polite',
        text: '礼貌地点头："谢谢学姐，我自己去就好。"',
        nextNodeId: 'act1_node2',
        statusChanges: { reputation: 1, energy: -2 },
        affectionChanges: { xuejie: 3 },
        narrativeText: '你接过手册，礼貌地道谢。林雨薇没有坚持，只在地图上替你圈出报到处、宿舍楼和医务室："自己走也可以，但记住，能求助不是丢脸。"你点头，却还没有真正明白这句话的重量。'
      },
      {
        id: 'c1_cold',
        text: '点点头，径直往里走',
        nextNodeId: 'act1_node2',
        statusChanges: { reputation: -2, trust: -4 },
        affectionChanges: { xuejie: -5 },
        narrativeText: '你点了点头就往里走，像是只要走得够快，就能显得不慌。身后林雨薇没有追上来，只提醒一句："行李箱拉链开了。"你低头一看，耳根发热。大学给你的第一课不是自由，而是承认自己也会狼狈。'
      }
    ]
  },

  act1_node2: {
    id: 'act1_node2',
    actId: 'act1',
    title: '宿舍分配',
    description: '报到处的章盖完，你来到宿舍楼 308。门一推开，夏末的热气、纸箱味和洗衣液味一起涌出来。刘大志正在给每张桌子分零食，像已经在这里住了半个月；周小明把课本按高度排好，连尺子都贴着桌沿；靠窗的沈小杰戴着耳机，屏幕上开着学校官网和几个你看不懂的页面。四张床位像四种大学生活的预告，忽然摆到你面前。',
    location: '宿舍楼',
    week: 1,
    day: 1,
    imagePrompt: '大学四人宿舍，床铺、书桌、行李箱，新室友初次见面，生活感动画场景',
    playerChoices: [
      {
        id: 'c2_proactive',
        text: '主动和大志打招呼，介绍自己',
        nextNodeId: 'act1_node3',
        statusChanges: { social: 5, energy: -5, mood: 3, trust: 3 },
        affectionChanges: { dazhi: 5, xiaojie: 1 },
        setFlags: { closeToRoommates: true },
        narrativeText: '大志把一包薯片塞到你手里："齐活了！以后 308 就靠我们扬名。"小明抬头认真问你有没有早课习惯，小杰只摘下一边耳机说了句"网口在桌子下面"。你第一次感觉，室友不是背景板，而是会长期影响你情绪和节奏的人。'
      },
      {
        id: 'c2_lowkey',
        text: '简单回应后默默整理行李',
        nextNodeId: 'act1_node3',
        statusChanges: { energy: 0, mood: -1 },
        affectionChanges: { xiaojie: 3 },
        narrativeText: '你简单介绍自己，开始铺床。大志的热情在空气里晃了晃，最后落回他自己的笑声里。小杰帮你扶了一下快倒的箱子，没说话。你忽然意识到，沉默也分很多种，有的是拒绝，有的是给彼此留空间。'
      },
      {
        id: 'c2_competitive',
        text: '扫了一眼室友，心里暗暗比较',
        nextNodeId: 'act1_node3',
        statusChanges: { reputation: -3, social: -2, trust: -2 },
        affectionChanges: { dazhi: -3, xiaojie: -1 },
        narrativeText: '你在心里给每个人迅速贴标签：社牛、卷王、怪人。大志的笑声慢了半拍，小明把书往里推了推，小杰的光标停在屏幕上。你没有说出口的比较，还是悄悄改变了房间的温度。'
      }
    ]
  },

  act1_node3: {
    id: 'act1_node3',
    actId: 'act1',
    title: '第一节课',
    description: '第一节高数课比迎新手册里的任何提醒都更冷静。老师写下第一行公式时，粉笔灰像一场细小的雪，落在你还没准备好的大学生活上。周围有人已经翻到第二页，有人低头查群消息。林雨薇坐在前排旁听，笔记写得很稳，像在告诉你：真正的适应不靠热血，靠一页一页跟上。',
    location: '教学楼',
    week: 1,
    day: 2,
    npcId: 'xuejie',
    imagePrompt: '大学阶梯教室，高数课，阳光从窗户照进来，前排认真记笔记的学生',
    playerChoices: [
      {
        id: 'c3_attentive',
        text: '收起手机，全神贯注地听讲',
        nextNodeId: 'act1_node4',
        statusChanges: { gpa: 0.1, energy: -10, mood: -2 },
        affectionChanges: { xuejie: 5, xiaoming: 3 },
        setFlags: { valuesStudy: true },
        narrativeText: '你把手机扣在桌面上，强迫自己追着公式走。听懂的地方不多，但每一次跟上都像在陌生城市认出一条路。下课后，林雨薇经过你身边："开头难很正常，别用第一节课给自己判刑。"'
      },
      {
        id: 'c3_phone',
        text: '偷偷看一下手机消息',
        nextNodeId: 'act1_node4',
        statusChanges: { energy: 0, gpa: -0.05, mood: 2 },
        affectionChanges: { xuejie: -3, xiaoming: -2 },
        setFlags: { distractedInClass: true },
        narrativeText: '你只是想看一眼消息，结果十分钟从指缝里漏掉。抬头时，黑板上的推导已经跨过一大段。林雨薇没有提醒你，沉默反而更刺人。你第一次知道，分心不是突然毁掉生活，而是把生活切成很多回不去的小缺口。'
      },
      {
        id: 'c3_ask',
        text: '大胆举手提问，引起老师注意',
        nextNodeId: 'act1_node4',
        statusChanges: { gpa: 0.15, reputation: 5, energy: -15, mood: 3 },
        affectionChanges: { xuejie: 10, xiaoming: 5 },
        setFlags: { askedGoodQuestion: true },
        narrativeText: '你的声音一出口就有点发抖，但问题确实问到了关键。老师停下粉笔，重新画了一遍图。教室里有人回头看你，你脸热得厉害，却也第一次尝到主动暴露"我不懂"带来的好处。'
      }
    ]
  },

  act1_node4: {
    id: 'act1_node4',
    actId: 'act1',
    title: '食堂偶遇',
    description: '中午的食堂像另一门必修课：窗口排队、找座、判断谁是真的邀请你坐下，谁只是客气。你端着餐盘在人群里转了两圈，看见林雨薇坐在角落，面前摊着算法书，饭却没怎么动。她不是小说里永远从容的学姐，她也会被题目卡住，也会把疲惫藏在眼镜后面。',
    location: '食堂',
    week: 1,
    day: 2,
    npcId: 'xuejie',
    imagePrompt: '大学食堂中午，人声鼎沸，角落里学姐翻着算法书，一张空椅子',
    playerChoices: [
      {
        id: 'c4_sit_together',
        text: '走过去询问是否可以坐在旁边',
        nextNodeId: 'act1_node5',
        statusChanges: { social: 5, energy: 5, mood: 5 },
        affectionChanges: { xuejie: 10 },
        narrativeText: '林雨薇把书往旁边挪了挪："坐吧，但先吃饭，别一上大学就学会把自己耗干。"她问你高数听得怎样，又坦白自己也被一道题卡住。她的坦白让你松了口气：原来优秀不是不会难，而是难的时候还愿意继续。'
      },
      {
        id: 'c4_other_seat',
        text: '礼貌地笑笑，去别处找位置',
        nextNodeId: 'act1_node5',
        statusChanges: { energy: 0 },
        affectionChanges: { xuejie: 2 },
        narrativeText: '你在不远处坐下。隔着几桌人声，你看见林雨薇把饭吃完，才重新翻开书。那种自律并不闪亮，甚至有点笨拙，却让你记住了：照顾自己和追求目标并不是两件相反的事。'
      },
      {
        id: 'c4_ignore',
        text: '假装没看见，找了个离她最远的位置',
        nextNodeId: 'act1_node5',
        statusChanges: { reputation: -1, social: -2, mood: -2 },
        affectionChanges: { xuejie: -5 },
        narrativeText: '你绕到最远的角落坐下，假装没有看见她。可回避并没有让你更自在，反而让整个午饭都像在演一场没人观看的戏。你开始怀疑，自己到底是在保护边界，还是害怕被别人看见不够熟练的样子。'
      }
    ]
  },

  act1_node5: {
    id: 'act1_node5',
    actId: 'act1',
    title: '社团招新',
    description: '社团招新的操场比校门口更像一场盛大的推销。每个摊位都说自己能改变你：辩论社承诺表达力，竞赛队承诺奖项，创业社承诺人脉，学业促进协会的海报反倒朴素，只写着"不会也可以来"。林雨薇站在那张海报旁，给每个犹豫的新生让出说"我不懂"的位置。',
    location: '操场',
    week: 1,
    day: 4,
    npcId: 'xuejie',
    imagePrompt: '大学社团招新，操场彩旗、摊位、人群、学习社与竞赛队展台',
    playerChoices: [
      {
        id: 'c5_academic',
        text: '走向学业促进协会，找学姐聊聊',
        nextNodeId: 'act1_node6',
        statusChanges: { gpa: 0.1, social: 3, energy: -4 },
        affectionChanges: { xuejie: 12, xiaoming: 3 },
        setFlags: { joinedStudyClub: true },
        narrativeText: '林雨薇没有用漂亮话劝你，只给你看往届成员留下的错题墙："这里不保证你立刻变强，只保证你不用一个人卡住。"你在报名表上写下名字，像给未来的自己留了一个求助入口。'
      },
      {
        id: 'c5_debate',
        text: '被辩论社的精彩演讲吸引',
        nextNodeId: 'act1_node6',
        statusChanges: { reputation: 5, social: 5, mood: 4 },
        affectionChanges: { xuejie: -3, dazhi: 4 },
        setFlags: { joinedDebateClub: true },
        narrativeText: '辩论社的即兴表演把人群点燃，你也被那种清晰有力的表达吸引。林雨薇远远看见你排进队伍，只朝你点了点头。她没有替你判断方向，只让你知道，选择热闹也要承担热闹之后的时间账。'
      },
      {
        id: 'c5_competition',
        text: '对编程竞赛队的展位感兴趣',
        nextNodeId: 'act1_node6',
        statusChanges: { gpa: 0.15, reputation: 8, energy: -6 },
        affectionChanges: { xuejie: 5, xiaoming: 5 },
        setFlags: { joinedCompetitionTeam: true },
        narrativeText: '竞赛队展示的奖杯和项目截图让你心跳变快。负责招新的学长说训练会很苦，林雨薇在旁边补了一句："苦不是问题，问题是你知不知道为什么苦。"你在报名表前停了几秒，还是写下了名字。'
      }
    ]
  },

  act1_node6: {
    id: 'act1_node6',
    actId: 'act1',
    title: '室友冲突',
    description: '深夜一点，宿舍终于露出共同生活最锋利的一面。刘大志还在和高中同学语音，笑声时不时撞上床架；周小明在被子里翻了第三次身；沈小杰的耳机漏出一点白噪音。明天早八的闹钟已经设好，你突然明白，大学的自由如果没有边界，很快就会变成别人的负担。',
    location: '宿舍',
    week: 1,
    day: 4,
    imagePrompt: '大学宿舍深夜，手机通话外放，室友睡不着，早课压力',
    playerChoices: [
      {
        id: 'c6_direct',
        text: '直接提醒大志该休息了',
        nextNodeId: 'act1_node7',
        statusChanges: { social: 3, reputation: 2, energy: 5, mood: 2 },
        affectionChanges: { xiaoming: 5, xiaojie: 4, dazhi: -2 },
        setFlags: { dormQuietRule: true },
        narrativeText: '你没有指责，只说："大志，我明天早八，能不能十一点后语音去走廊？我们以后也按这个来。"大志愣了一下，尴尬地比了个抱歉。小明从被子里探出头："这个规则可以写下来。"'
      },
      {
        id: 'c6_quiet',
        text: '默默忍受，戴上耳塞',
        nextNodeId: 'act1_node7',
        statusChanges: { energy: -15, mood: -8 },
        affectionChanges: { xiaojie: 1 },
        setFlags: { avoidedDormConflict: true },
        narrativeText: '你把耳塞塞得更深，假装自己很能忍。可忍耐没有消除声音，只把委屈攒进身体里。第二天早八，你盯着黑板发呆，忽然明白不表达边界也是一种选择，而且常常由自己付费。'
      },
      {
        id: 'c6_complain',
        text: '大声抱怨，口气很冲',
        nextNodeId: 'act1_node7',
        statusChanges: { reputation: -5, social: -5, energy: 0, mood: -5 },
        affectionChanges: { dazhi: -4, xiaojie: -2, xiaoming: 2 },
        setFlags: { dormNoiseIssue: true },
        narrativeText: '你压了一晚的火气突然爆出来。大志也被刺到，两个人的声音都越来越高。小明坐起来想劝，小杰默默打开灯。问题确实被看见了，但你们也多了一层新的尴尬。'
      }
    ]
  },

  act1_node7: {
    id: 'act1_node7',
    actId: 'act1',
    title: '期中作业',
    description: '第一份高数作业像一个小小的审判。最后一道题你盯了二十分钟，纸上只有半行推导。大志说网上有答案，"参考一下不算抄吧"；小明皱着眉把自己的草稿纸压住；林雨薇在学习群里发了一份笔记，附言只有一句："不会可以问，别把不会伪装成会。"',
    location: '宿舍',
    week: 1,
    day: 5,
    npcId: 'xuejie',
    imagePrompt: '宿舍书桌，高数作业、网上答案、学习群笔记，作业选择压力',
    playerChoices: [
      {
        id: 'c7_copy',
        text: '参考室友的答案',
        nextNodeId: 'act1_node8',
        statusChanges: { gpa: 0.05, reputation: -5, energy: 10, trust: 3 },
        affectionChanges: { xuejie: -8, xiaoming: -5 },
        setFlags: { copiedHomework: true },
        narrativeText: '你照着室友的思路把题补完，页面看起来完整了，心里却像空了一块。你没有向林雨薇要笔记，因为那等于承认自己其实没懂。大学里第一种危险，常常不是失败，而是太早学会掩饰失败。'
      },
      {
        id: 'c7_study',
        text: '认真研究学姐的笔记，独立完成',
        nextNodeId: 'act1_node8',
        statusChanges: { gpa: 0.2, energy: -20, mood: 3 },
        affectionChanges: { xuejie: 15, xiaoming: 8 },
        setFlags: { studiedIndependently: true },
        narrativeText: '你把林雨薇的笔记翻到凌晨，还是有两步推不出来。最后你在群里问了一个看起来很基础的问题。没人嘲笑，小明甚至补了一张草图。第二天交作业时，你不确定答案是否最漂亮，但你知道每一行为什么在那里。'
      },
      {
        id: 'c7_plagiarism',
        text: '从网上复制粘贴',
        nextNodeId: 'act1_node8',
        statusChanges: { gpa: -0.1, reputation: -8, antiFraudAwareness: -4 },
        affectionChanges: { xuejie: -12, xiaoming: -8 },
        setFlags: { plagiarizedHomework: true },
        narrativeText: '你复制了网上答案，甚至没注意到格式里残留的水印。第二天老师讲评时，教室里短暂安静。林雨薇没有看你太久，可那一眼让你比被批评更难受。你第一次体会到，捷径有时会把人带到更公开的地方摔倒。'
      }
    ]
  },

  act1_node8: {
    id: 'act1_node8',
    actId: 'act1',
    title: '周末邀约',
    description: '周五晚上，宿舍窗外传来操场的音乐声。你收到林雨薇的消息："学习小组改到周日。我整理了高数重点，你如果来，我们一起把第一周的坑补上。"那不是浪漫邀约，更像一盏按时亮起的灯：不催你优秀，只提醒你可以回来。',
    location: '宿舍楼 308',
    week: 1,
    day: 5,
    npcId: 'xuejie',
    imagePrompt: '手机聊天界面，学姐发来学习小组邀约，周末图书馆自习氛围',
    playerChoices: [
      {
        id: 'c8_accept',
        text: '欣然答应，约好时间和地点',
        nextNodeId: 'act1_node9',
        statusChanges: { gpa: 0.15, social: 8, energy: -10, mood: 8 },
        affectionChanges: { xuejie: 18 },
        narrativeText: '林雨薇很快回复了座位和时间，还补了一句："带上不会的题，不用带面子。"周日早晨，图书馆二楼的灯很白，她给你留了一个靠窗的位置。你们从最卡的地方开始，慢慢把第一周散掉的线头接回去。'
      },
      {
        id: 'c8_say_no',
        text: '婉拒，说有事要忙',
        nextNodeId: 'act1_node9',
        statusChanges: { energy: 5, mood: -2 },
        affectionChanges: { xuejie: -5 },
        narrativeText: '你说自己有事。林雨薇回得很快："好，那你自己也记得复盘。"她没有失望地追问，这反而让你有点心虚。被尊重选择之后，选择本身就更难推给别人。'
      },
      {
        id: 'c8_half',
        text: '说周日上午有事，周六可以',
        nextNodeId: 'act1_node9',
        statusChanges: { gpa: 0.08, social: 3, energy: -5, mood: 3 },
        affectionChanges: { xuejie: 8 },
        narrativeText: '你提出周六下午。林雨薇调整了时间，没有抱怨，只提醒你提前列问题。那次自习不长，却让你学会一件事：求助也需要准备，别人能扶你一把，但不能替你走路。'
      }
    ]
  },

  act1_node9: {
    id: 'act1_node9',
    actId: 'act1',
    title: '校园危机',
    description: '周日晚上，宿舍楼突然停电。楼道里先是一声惊呼，随后是拖鞋声、抱怨声和手机手电筒的白光。大志在门口喊谁有充电宝，小明摸黑找眼镜，小杰第一时间打开学校后勤报修页面。你收到林雨薇的消息："别乱跑，先确认室友都安全。需要手电我这里有。"黑暗让每个人的习惯都显形了。',
    location: '宿舍',
    week: 1,
    day: 7,
    npcId: 'xuejie',
    imagePrompt: '宿舍楼停电，黑暗走廊，手机手电筒，学生们紧张抱怨',
    playerChoices: [
      {
        id: 'c9_help',
        text: '去学姐那里拿手电筒，顺便帮忙安抚同学',
        nextNodeId: 'act1_node10',
        statusChanges: { reputation: 10, social: 8, energy: -4, mood: 6 },
        affectionChanges: { xuejie: 15, wang_laoshi: 4 },
        setFlags: { handledPowerOutage: true },
        narrativeText: '你借来手电，和宿管一起提醒大家别挤楼梯，又帮一个低血糖的同学联系辅导员。事情不大，却让你发现，可靠不是站到最亮的地方，而是在混乱时让别人少一点害怕。'
      },
      {
        id: 'c9_stay_calm',
        text: '留在宿舍，用手机手电筒照明',
        nextNodeId: 'act1_node10',
        statusChanges: { reputation: 2, energy: -5, antiFraudAwareness: 2 },
        affectionChanges: { xuejie: 3, xiaojie: 3 },
        narrativeText: '你留在宿舍，先确认每个人都没事，再把手机电量省着用。小杰把报修链接发给你，大志终于安静下来，小明说："这样处理挺稳。"稳定有时候并不轰动，只是不添乱。'
      },
      {
        id: 'c9_blind',
        text: '黑暗中摸黑行动',
        nextNodeId: 'act1_node10',
        statusChanges: { energy: -20, reputation: -5, mood: -8 },
        affectionChanges: { xuejie: -3 },
        narrativeText: '你摸黑往外走，结果在楼梯口踩空。膝盖破皮不算严重，但那一瞬间的惊慌让你很难堪。室友把你扶回去，林雨薇只问："能走吗？要不要医务室？"她没有责备你，可你已经明白，逞强常常只会制造新的麻烦。'
      }
    ]
  },

  act1_node10: {
    id: 'act1_node10',
    actId: 'act1',
    title: '第一周结束',
    description: '第一周结束时，你站在宿舍阳台上。楼下有人拖着行李迟到报到，有人抱着篮球跑向操场，远处图书馆亮得像一艘船。你回想这一周：校门口的拉链、第一节高数、室友的夜话、作业里的羞耻、停电时的白光。大学没有给你一个宏大的开场，只把很多微小选择放到你手里，让你一次次练习成为什么样的人。',
    location: '宿舍阳台',
    week: 1,
    day: 7,
    imagePrompt: '宿舍阳台夜景，远处教学楼灯光，新生回望第一周经历',
    playerChoices: [
      {
        id: 'c10_continue',
        text: '写下第一周总结',
        nextNodeId: 'act1_end',
        statusChanges: { mood: 3, antiFraudAwareness: 2 },
        narrativeText: '你打开笔记本，写下第一周的关键词：求助、边界、诚实、证据、节奏。最后你又补了一行：给后来的人写一份真正能用的手册。这个念头像一粒很小的种子，暂时还看不出会长成什么。'
      }
    ]
  },

  act1_end: {
    id: 'act1_end',
    actId: 'act1',
    title: '第一章完',
    description: '你把笔记本合上时，宿舍已经安静下来。大志的零食袋压在桌角，小明的错题本摊着，小杰的屏幕还亮着学校通知页面。你终于意识到，所谓入学适应不是变得熟练，而是开始承认自己需要规则、同伴和求助路径。下一周，军训哨声会响起，新的机会也会混在新的风险里抵达。',
    location: '宿舍',
    week: 1,
    day: 7,
    playerChoices: [
      {
        id: 'act1_to_act2',
        text: '进入第二幕：校园适应',
        nextNodeId: 'act1_bridge_to_act2',
        statusChanges: { mood: 2 },
        narrativeText: '你把第一周的总结夹进新生手册，合上台灯。走廊里还有人拖着水桶经过，大学生活像没有真正停下，只是在夜色里换了一口气。'
      }
    ]
  },

  act1_bridge_to_act2: {
    id: 'act1_bridge_to_act2',
    actId: 'act1',
    title: '幕间：第二周前夜',
    description: '周日深夜，308 宿舍难得提前安静。小明在错题本最后一页写下"下周军训，不熬夜"；大志把社团招新传单压在枕头下，睡前还念叨着要认识更多人；小杰把学校反诈公众号置顶，像是给未来的混乱提前留一个入口。你躺在床上，听见远处操场传来教官集合的哨声预演。第一周教会你的不是答案，而是遇到新问题时该先停一下。第二周，就要来了。',
    location: '宿舍楼 308',
    week: 1,
    day: 7,
    imagePrompt: '大学宿舍深夜，四张床位安静，桌上有新生手册、军训服和反诈公众号页面，章节过渡氛围',
    playerChoices: [
      {
        id: 'a1_bridge_continue',
        text: '第二周清晨，去操场集合',
        nextNodeId: 'act2_military_training',
        statusChanges: { energy: 4, mood: 2 },
        narrativeText: '天还没完全亮，宿舍楼下已经有人穿着军训服排队。你背上水壶，跟着人流往操场走。生活没有给你明显的章节标题，但你知道，新的阶段正在靠近。'
      }
    ]
  }
}
