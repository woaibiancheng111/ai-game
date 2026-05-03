import type { StoryNode } from '../types'

export const ACT1_NODES: Record<string, StoryNode> = {
  // === 节点 1: 入学报到 ===
  act1_start: {
    id: 'act1_start',
    title: '入学报到',
    description: '九月的阳光洒在大学校门上，你拖着行李箱站在校门口，看着熙熙攘攘的新生人群。这时，一个温柔的声音从旁边传来——"这位同学，需要帮忙吗？" 你转头，看到一位戴眼镜的学姐正微笑着看着你。她胸前挂着学习委员的牌子。',
    location: '校门口',
    npcId: 'xuejie',
    playerChoices: [
      {
        id: 'c1_enthusiastic',
        text: '热情地打招呼："学姐好！请多关照！"',
        nextNodeId: 'act1_node2',
        statusChanges: { social: 5, reputation: 3 },
        affectionChanges: { xuejie: 8 },
        narrativeText: '你热情地伸出手，学姐被你的活力感染，笑着递给你一张新生手册："我叫林雨薇，计算机系大三的。有什么不懂的尽管问我，先去报到处吧，我带你去。"'
      },
      {
        id: 'c1_polite',
        text: '礼貌地点头："谢谢学姐，我自己去就好。"',
        nextNodeId: 'act1_node2',
        statusChanges: { reputation: 1 },
        affectionChanges: { xuejie: 3 },
        narrativeText: '你礼貌地接过新生手册，学姐微笑着点头："好的，报到处往前走右转。有问题随时问。"'
      },
      {
        id: 'c1_cold',
        text: '点点头，径直往里走',
        nextNodeId: 'act1_node2',
        statusChanges: { reputation: -2 },
        affectionChanges: { xuejie: -5 },
        narrativeText: '你径直走开，学姐微微皱眉，轻声叹气。看着周围其他热络的新生，你开始有点怀疑自己的态度是否太过冷淡了。'
      }
    ]
  },

  // === 节点 2: 宿舍分配 ===
  act1_node2: {
    id: 'act1_node2',
    title: '宿舍分配',
    description: '报到处办完后，你来到宿舍楼。推开 308 室的门，里面已经有人在整理床铺。一个戴着耳机的男生在角落低头玩手机，另一个微胖的男生正热情地跟你打招呼："嗨！我是陈浩，这是赵明。我们以后就是室友了！" 赵明指了指那个戴耳机的男生。',
    location: '宿舍楼',
    playerChoices: [
      {
        id: 'c2_proactive',
        text: '主动和赵明握手，介绍自己',
        nextNodeId: 'act1_node3',
        statusChanges: { social: 5, energy: -5 },
        affectionChanges: { xuejie: 0 },
        narrativeText: '赵明热情地拍着你的肩膀："太好了！我们宿舍终于齐了！走，一起去食堂吃午饭？" 你们的对话引来旁边床铺的一个同学好奇地侧目。'
      },
      {
        id: 'c2_lowkey',
        text: '简单回应后默默整理行李',
        nextNodeId: 'act1_node3',
        statusChanges: { energy: 0 },
        affectionChanges: { xuejie: 0 },
        narrativeText: '你礼貌地回应后开始整理行李。赵明似乎有点尴尬，但没有再打扰你。戴耳机的赵明依然沉浸在自己的世界里。'
      },
      {
        id: 'c2_competitive',
        text: '扫了一眼室友，心里暗暗比较',
        nextNodeId: 'act1_node3',
        statusChanges: { reputation: -3 },
        affectionChanges: { xuejie: 0 },
        narrativeText: '你心里暗暗评估着室友们的"档次"——这种行为很快就被敏感的陈浩察觉了，气氛变得微妙起来。'
      }
    ]
  },

  // === 节点 3: 第一节课 ===
  act1_node3: {
    id: 'act1_node3',
    title: '第一节课',
    description: '高数课开始了。讲台上老师讲得很快，周围同学都在奋笔疾书。窗外的阳光晒得人昏昏欲睡，手机屏幕在口袋里似乎在微微发烫。你发现，坐在前排的林雨薇学姐也在认真听课，偶尔做笔记。',
    location: '教学楼',
    npcId: 'xuejie',
    playerChoices: [
      {
        id: 'c3_attentive',
        text: '收起手机，全神贯注地听讲',
        nextNodeId: 'act1_node4',
        statusChanges: { gpa: 0.1, energy: -10 },
        affectionChanges: { xuejie: 5 },
        narrativeText: '你努力跟上老师的节奏，虽然有些吃力但总算听懂了大部分内容。下课后，学姐经过你身边时点了点头："高数开头会难，坚持下去就好了。"'
      },
      {
        id: 'c3_phone',
        text: '偷偷看一下手机消息',
        nextNodeId: 'act1_node4',
        statusChanges: { energy: 0 },
        affectionChanges: { xuejie: -3 },
        narrativeText: '你刚拿出手机，就感觉有目光扫过来——是学姐。她轻轻皱了皱眉，没有说话，但那份失望让你的罪恶感油然而生。'
      },
      {
        id: 'c3_ask',
        text: '大胆举手提问，引起老师注意',
        nextNodeId: 'act1_node4',
        statusChanges: { gpa: 0.15, reputation: 5, energy: -15 },
        affectionChanges: { xuejie: 10 },
        narrativeText: '你的提问让老师眼前一亮。"好！问得好！" 老师赞许地点点头。学姐也忍不住回头看了你一眼，眼里带着一丝欣赏的笑意。'
      }
    ]
  },

  // === 节点 4: 食堂偶遇 ===
  act1_node4: {
    id: 'act1_node4',
    title: '食堂偶遇',
    description: '中午的食堂人声鼎沸。你端着餐盘找位置，发现学姐林雨薇正独自坐在角落，面前摊着一本厚厚的算法书。她似乎没怎么吃，眉头微皱，似乎在思考什么。旁边还有一张空椅子。',
    location: '食堂',
    npcId: 'xuejie',
    playerChoices: [
      {
        id: 'c4_sit_together',
        text: '走过去询问是否可以坐在旁边',
        nextNodeId: 'act1_node5',
        statusChanges: { social: 5, energy: 5 },
        affectionChanges: { xuejie: 10 },
        narrativeText: '"当然可以，坐吧。"学姐微微一笑，往旁边挪了挪。"你吃了吗？高数课跟上了吗？"她关心地问。"我正好在看这道题，你要不要一起想想？"她的算法书摊开着，上面密密麻麻的笔记让你暗暗吃惊。'
      },
      {
        id: 'c4_other_seat',
        text: '礼貌地笑笑，去别处找位置',
        nextNodeId: 'act1_node5',
        statusChanges: { energy: 0 },
        affectionChanges: { xuejie: 2 },
        narrativeText: '你礼貌地点点头，在另一张桌子坐下。远远地，你看到学姐依然独自专注地看书，偶尔用笔在纸上写写画画。你心里暗暗佩服她的自律。'
      },
      {
        id: 'c4_ignore',
        text: '假装没看见，找了个离她最远的位置',
        nextNodeId: 'act1_node5',
        statusChanges: { reputation: -1 },
        affectionChanges: { xuejie: -5 },
        narrativeText: '你刻意回避，独自坐在食堂最角落。你用余光瞥见学姐抬头看了你一眼，眼神中闪过一丝疑惑，然后继续低头看书了。'
      }
    ]
  },

  // === 节点 5: 社团招新 ===
  act1_node5: {
    id: 'act1_node5',
    title: '社团招新',
    description: '操场上彩旗飘扬，各个社团的招新摊位热闹非凡。学业促进协会、辩论社、编程竞赛队、街舞社……每个摊位前都围满了人。你在人群中看到了学姐林雨薇，她正在学业促进协会的摊位前帮忙。',
    location: '操场',
    npcId: 'xuejie',
    playerChoices: [
      {
        id: 'c5_academic',
        text: '走向学业促进协会，找学姐聊聊',
        nextNodeId: 'act1_node6',
        statusChanges: { gpa: 0.1, social: 3 },
        affectionChanges: { xuejie: 12 },
        narrativeText: '学姐看到你，眼睛一亮："你也考虑加入学促会吗？我们可以一起学习，互相帮助。"她热情地介绍着社团活动，眼里满是真诚。你决定报名参加本周六的学习小组活动。'
      },
      {
        id: 'c5_debate',
        text: '被辩论社的精彩演讲吸引',
        nextNodeId: 'act1_node6',
        statusChanges: { reputation: 5, social: 5 },
        affectionChanges: { xuejie: -3 },
        narrativeText: '辩论社的即兴表演让你热血沸腾，你当场报名了辩论社。远远地，学姐看着你加入辩论社的队伍，有些惊讶，但没有说什么。'
      },
      {
        id: 'c5_competition',
        text: '对编程竞赛队的展位感兴趣',
        nextNodeId: 'act1_node6',
        statusChanges: { gpa: 0.15, reputation: 8 },
        affectionChanges: { xuejie: 5 },
        narrativeText: '竞赛队的老学长给你展示了往年的获奖作品，你两眼放光。"欢迎加入，我们会组织算法集训。"学姐在一旁默默点头："这个方向不错，好好努力。"'
      }
    ]
  },

  // === 节点 6: 室友冲突 ===
  act1_node6: {
    id: 'act1_node6',
    title: '室友冲突',
    description: '深夜，室友陈浩还在大声打电话，丝毫没有要挂断的意思。已经凌晨一点了，明天还有早课。你躺在床上翻来覆去睡不着。另外一个室友赵明也明显被吵到了，但什么都没说。',
    location: '宿舍',
    playerChoices: [
      {
        id: 'c6_direct',
        text: '直接提醒陈浩该休息了',
        nextNodeId: 'act1_node7',
        statusChanges: { social: 3, reputation: 2, energy: 5 },
        affectionChanges: { xuejie: 0 },
        narrativeText: '"陈浩，不好意思，我明天有早课，能小声点吗？"你平静但坚定地说。陈浩愣了一下，道歉后挂断了电话。赵明朝你竖起大拇指。'
      },
      {
        id: 'c6_quiet',
        text: '默默忍受，戴上耳塞',
        nextNodeId: 'act1_node7',
        statusChanges: { energy: -15 },
        affectionChanges: { xuejie: 0 },
        narrativeText: '你强忍着没有出声，但这一晚你几乎没有睡好。第二天上课时昏昏沉沉，精神状态很差。'
      },
      {
        id: 'c6_complain',
        text: '大声抱怨，口气很冲',
        nextNodeId: 'act1_node7',
        statusChanges: { reputation: -5, social: -5, energy: 0 },
        affectionChanges: { xuejie: 0 },
        narrativeText: '"能不能小点声！没看到都几点了！"你的语气很冲，陈浩也来了火气，两人争执了起来。赵明夹在中间，气氛一时非常尴尬。'
      }
    ]
  },

  // === 节点 7: 期中作业 ===
  act1_node7: {
    id: 'act1_node7',
    title: '期中作业',
    description: '高数期中作业截止日期临近。你发现有一道大题完全不会做，而网上有很多解题答案。室友陈浩在"分享"自己的作业，暗示你可以参考。学姐林雨薇则在学习群里发了她自己整理的笔记，问有没有人需要。',
    location: '宿舍',
    npcId: 'xuejie',
    playerChoices: [
      {
        id: 'c7_copy',
        text: '参考室友的答案',
        nextNodeId: 'act1_node8',
        statusChanges: { gpa: 0.05, reputation: -5, energy: 10 },
        affectionChanges: { xuejie: -8 },
        narrativeText: '你抄完了作业，但心里总觉得空落落的。学姐在群里发的笔记你也没好意思要。'
      },
      {
        id: 'c7_study',
        text: '认真研究学姐的笔记，独立完成',
        nextNodeId: 'act1_node8',
        statusChanges: { gpa: 0.2, energy: -20 },
        affectionChanges: { xuejie: 15 },
        narrativeText: '你熬夜啃完了学姐的笔记，虽然过程很痛苦，但你对这道题的理解深入了很多。第二天交作业时，你发现很多同学都在抄答案，而你已经真正弄懂了。学姐看了你的作业后，微笑着点了点头。'
      },
      {
        id: 'c7_plagiarism',
        text: '从网上复制粘贴',
        nextNodeId: 'act1_node8',
        statusChanges: { gpa: -0.1, reputation: -8 },
        affectionChanges: { xuejie: -12 },
        narrativeText: '你从网上找了个答案交了。然而第二天课上，老师突然宣布要讲评作业——当老师看到你那道题时，脸色变了。原来你的答案和网上的一模一样，还带着那个网站的水印。学姐看向你的眼神里，满是失望。'
      }
    ]
  },

  // === 节点 8: 周末邀约 ===
  act1_node8: {
    id: 'act1_node8',
    title: '周末邀约',
    description: '周五晚上，你收到了学姐的消息："这周学习小组的活动改到周日了，你要来吗？我整理了一些高数重点，难的地方我可以教你。另外周日早上我会在图书馆自习，你要不要一起？"',
    location: '未知',
    npcId: 'xuejie',
    playerChoices: [
      {
        id: 'c8_accept',
        text: '欣然答应，约好时间和地点',
        nextNodeId: 'act1_node9',
        statusChanges: { gpa: 0.15, social: 8, energy: -10 },
        affectionChanges: { xuejie: 18 },
        narrativeText: '"太好了！早上8点图书馆二楼东侧见，我给你占座。"学姐秒回，还发了一个小小的表情包。周日一早，你准时到达。学姐已经在了，桌上摆着两份热腾腾的豆浆和包子。"给你带的，趁热吃。"她的笑容让你心里一暖。那天的学习效率出奇地高。'
      },
      {
        id: 'c8_say_no',
        text: '婉拒，说有事要忙',
        nextNodeId: 'act1_node9',
        statusChanges: { energy: 5 },
        affectionChanges: { xuejie: -5 },
        narrativeText: '你找了个借口婉拒了。学姐回了一句"好的，那下次有机会再说吧"，语气中带着淡淡的失落。'
      },
      {
        id: 'c8_half',
        text: '说周日上午有事，周六可以',
        nextNodeId: 'act1_node9',
        statusChanges: { gpa: 0.08, social: 3, energy: -5 },
        affectionChanges: { xuejie: 8 },
        narrativeText: '学姐很快回复："好呀，那周六下午两点图书馆见。"周六你准时赴约，虽然没有周日的完整学习时间，但学姐的耐心讲解让你对那些难题有了更清晰的理解。'
      }
    ]
  },

  // === 节点 9: 校园危机 ===
  act1_node9: {
    id: 'act1_node9',
    title: '校园危机',
    description: '周日晚上，宿舍楼突然停电了！整个楼道陷入黑暗，同学们的抱怨声此起彼伏。手机信号也变得很差。室友陈浩开始抱怨，赵明不知所措地翻着手机。正在这时，你收到学姐的消息："停电了，你还好吗？小心点别摔着，我这里有手电筒，需要的话可以来拿。"',
    location: '宿舍',
    npcId: 'xuejie',
    playerChoices: [
      {
        id: 'c9_help',
        text: '去学姐那里拿手电筒，顺便帮忙安抚同学',
        nextNodeId: 'act1_node10',
        statusChanges: { reputation: 10, social: 8 },
        affectionChanges: { xuejie: 15 },
        narrativeText: '你拿着学姐的手电筒，组织了几个同学一起在楼道里维持秩序，安抚大家情绪。黑暗中，你的行动力让很多人记住了你。学姐听说了你的表现后，主动发来消息："做得好，很高兴认识你这样的学弟。"'
      },
      {
        id: 'c9_stay_calm',
        text: '留在宿舍，用手机手电筒照明',
        nextNodeId: 'act1_node10',
        statusChanges: { reputation: 2, energy: -5 },
        affectionChanges: { xuejie: 3 },
        narrativeText: '你保持着冷静，用手机照明。室友们也跟着安定下来。学姐过了一会儿发来消息确认你没事，你回复说一切都好。'
      },
      {
        id: 'c9_blind',
        text: '黑暗中摸黑行动',
        nextNodeId: 'act1_node10',
        statusChanges: { energy: -20, reputation: -5 },
        affectionChanges: { xuejie: -3 },
        narrativeText: '你摸黑想去洗手间，结果一脚踩空摔了一跤，膝盖蹭破了皮。室友们把你扶回床上，学姐得知后担心地问你是否需要去医务室。'
      }
    ]
  },

  // === 节点 10: 阶段结算 ===
  act1_node10: {
    id: 'act1_node10',
    title: '第一周结束',
    description: '忙碌的第一周终于结束了。站在宿舍阳台上，你回想着这几天经历的一切——初入校门的紧张、与室友的相处、上课的选择、社团活动、室友冲突、期中作业、周末的学习、停电夜……每一个选择都在悄悄地改变着你的轨迹。学姐林雨薇也在这周里成为了你大学生活中一个重要的存在。',
    location: '宿舍阳台',
    isEnding: true,
    playerChoices: [
      {
        id: 'c10_continue',
        text: '继续第二周的冒险',
        nextNodeId: 'act1_end',
        statusChanges: {},
        affectionChanges: {}
      }
    ]
  },

  // === 节点 11: 第一章完 ===
  act1_end: {
    id: 'act1_end',
    title: '第一章完',
    description: '你回到宿舍，翻开笔记本写下第一周的总结。大学生活才刚刚开始，而你已经在学习、社交与选择中迈出了第一步。下一周，会有新的挑战，也会有新的机会。',
    location: '宿舍',
    isEnding: true
  }
}
