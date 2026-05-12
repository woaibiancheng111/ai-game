import type { StoryNode } from '../types'

export const ACT7_NODES: Record<string, StoryNode> = {
  act7_junior_choice: {
    id: 'act7_junior_choice',
    actId: 'act7',
    title: '大三选择题',
    description: '大三的选择不像大一那样热闹，却更沉。保研、实习、考公、创业、公益项目、出国申请，每条路都有人说好，也都有人后悔。李学长的事情已经过去很久，但"别人说这条路很好"这句话，仍然会让你警惕。你开始明白，机会判断不是只用于防骗，它会贯穿整个人生。',
    location: '学院走廊',
    week: 45,
    day: 2,
    npcId: 'xuejie',
    imagePrompt: '大三学院走廊，多张升学就业海报，学生面对未来选择，成熟校园氛围',
    playerChoices: [
      {
        id: 'a7_c1_research',
        text: '申请导师课题，冲刺保研或科研路线',
        nextNodeId: 'act7_family_expectation',
        statusChanges: { gpa: 0.22, reputation: 8, energy: -16, mood: 3 },
        affectionChanges: { xuejie: 12, xiaoming: 8, wang_laoshi: 4 },
        setFlags: { juniorResearchRoute: true },
        narrativeText: '你开始读论文、做实验、写周报。科研没有想象中浪漫，更多时候是承认自己不会，然后一点点把问题问清楚。你想研究的，仍然是那个旧问题：为什么人在压力下会相信危险的承诺。'
      },
      {
        id: 'a7_c1_industry',
        text: '寻找正规实习，提前接触社会',
        nextNodeId: 'act7_family_expectation',
        statusChanges: { money: 600, social: 8, reputation: 6, energy: -14 },
        affectionChanges: { dazhi: 8, xiaojie: 6, wang_laoshi: 4 },
        setFlags: { juniorIndustryRoute: true },
        narrativeText: '你开始改简历、查公司、投递岗位。每看到一个"高薪内推"，你都会先查主体和招聘渠道，这已经变成肌肉记忆。小杰说你现在打开企业查询网站的速度比打开外卖还快。'
      },
      {
        id: 'a7_c1_public_service',
        text: '把校园安全项目做成长期公益方向',
        nextNodeId: 'act7_family_expectation',
        statusChanges: { reputation: 14, social: 10, antiFraudAwareness: 10, energy: -12 },
        affectionChanges: { wang_laoshi: 12, xiaojie: 10, dazhi: 6 },
        setFlags: { juniorPublicServiceRoute: true },
        narrativeText: '你把新生手册升级成工作坊，邀请保卫处和心理中心一起参与。你第一次感觉，教育不是"讲一遍"，而是陪人练一次：怎么拒绝，怎么截图，怎么向老师开口。'
      },
      {
        id: 'a7_c1_drift',
        text: '看着大家向前走，自己越来越焦虑',
        nextNodeId: 'act7_family_expectation',
        statusChanges: { mood: -16, energy: -8, gpa: -0.06, trust: -4 },
        affectionChanges: { wang_laoshi: 4, xuejie: 2, dazhi: -2 },
        setFlags: { juniorAnxiety: true },
        narrativeText: '你开始频繁刷经验帖，越刷越觉得自己落后。王老师提醒你："别人的时间线不是你的判决书。"可你还是忍不住把每一条成功经验都当作自己错过的路。'
      }
    ]
  },

  act7_family_expectation: {
    id: 'act7_family_expectation',
    actId: 'act7',
    title: '期待的重量',
    description: '暑假前，家里、同学和社交平台像同时打开了音量。有人说考研才稳，有人说先进大厂才不亏，也有人劝你别把时间浪费在"校园项目"上。你发现，机会判断不只来自骗局识别，也来自能不能分清"别人的期待"和"自己的路线"。很多焦虑不会骗钱，却会偷走人的方向感。',
    location: '校园湖边',
    week: 48,
    day: 4,
    npcId: 'wang_laoshi',
    imagePrompt: '大学湖边傍晚，学生看着手机里的家庭消息和升学就业经验帖，未来压力浓重但克制',
    playerChoices: [
      {
        id: 'a7_c1b_talk_family',
        text: '和家里认真谈一次路线和成本',
        nextNodeId: 'act7_rejection_week',
        statusChanges: { mood: 8, reputation: 3, trust: -2, energy: -6 },
        affectionChanges: { wang_laoshi: 6, xuejie: 5 },
        setFlags: { discussedFutureWithFamily: true },
        narrativeText: '你没有只说"我想这样"，而是把时间、费用、风险和备选方案讲清楚。家里未必完全理解，但对话终于从催促变成了商量。你发现成熟不是让所有人满意，而是让选择经得起说明。'
      },
      {
        id: 'a7_c1b_peer_compare',
        text: '继续刷经验帖，拿自己和别人比较',
        nextNodeId: 'act7_rejection_week',
        statusChanges: { mood: -14, energy: -8, trust: 5, gpa: -0.04 },
        affectionChanges: { wang_laoshi: -2, xuejie: -2, dazhi: 2 },
        setFlags: { trappedInPeerComparison: true },
        narrativeText: '你收藏了很多"上岸路径"，却越来越难开始。每个人的成功经验都像一把尺子，量得你哪里都不够。你没有被骗，却被比较困住了。'
      },
      {
        id: 'a7_c1b_career_center',
        text: '去就业指导中心做一次路线咨询',
        nextNodeId: 'act7_rejection_week',
        statusChanges: { antiFraudAwareness: 8, reputation: 6, mood: 5, energy: -7 },
        affectionChanges: { wang_laoshi: 8, xiaojie: 5 },
        setFlags: { usedCareerCenter: true },
        narrativeText: '老师让你把路线写成"主线、备选、风险信号、退出条件"。你突然发现，生涯规划和反诈判断有同一件底层能力：先把模糊承诺变成可核验的信息。'
      }
    ]
  },

  act7_rejection_week: {
    id: 'act7_rejection_week',
    actId: 'act7',
    title: '被拒绝的一周',
    description: '大三下的某一周，拒信集中到来。导师课题名额满了，实习一面没过，公益项目让你等候补，连你精心准备的简历也被系统自动退回。你以为自己已经很会做判断，可被拒绝时，旧的冲动还是会回来：想买包装课，想找所谓内部推荐，想证明自己并没有落后。林雨薇说，拒绝不是命运判决，只是信息。小杰则把一个"付费保 offer"广告截图发给你，备注：越低落越要慢点点。',
    location: '图书馆自习区',
    week: 49,
    day: 2,
    npcId: 'xuejie',
    imagePrompt: '图书馆自习区，电脑邮箱里几封拒信，手机弹出付费保 offer 广告，学生低落但思考',
    playerChoices: [
      {
        id: 'a7_c1c_review_rejections',
        text: '把拒信当反馈，修改材料和路线',
        nextNodeId: 'act7_imposter_syndrome',
        statusChanges: { gpa: 0.08, reputation: 6, mood: 4, energy: -8 },
        affectionChanges: { xuejie: 8, wang_laoshi: 5, xiaoming: 4 },
        setFlags: { reviewedRejections: true },
        narrativeText: '你把每次失败拆成材料问题、能力缺口、运气因素和不适配。这样做并没有让拒绝变好受，但它把"我不行"改写成了"下一版可以改哪里"。'
      },
      {
        id: 'a7_c1c_pay_polish',
        text: '差点购买包装课，先查口碑和合同',
        nextNodeId: 'act7_imposter_syndrome',
        statusChanges: { antiFraudAwareness: 10, money: -100, mood: -2, trust: -4 },
        affectionChanges: { xiaojie: 8, wang_laoshi: 4 },
        setFlags: { checkedCareerPolishCourse: true },
        narrativeText: '你发现课程不是完全没用，但"保 offer"只是营销话术，退款条款也很模糊。你没有冲动付款，只买了一次正规的简历咨询。成熟的判断不是永远不花钱，而是知道自己到底在买什么。'
      },
      {
        id: 'a7_c1c_escape_scroll',
        text: '陷进经验帖和短视频，拖延真正行动',
        nextNodeId: 'act7_imposter_syndrome',
        statusChanges: { mood: -10, energy: -10, gpa: -0.04, trust: 4 },
        affectionChanges: { wang_laoshi: -2, xuejie: -3, dazhi: 2 },
        setFlags: { avoidedAfterRejection: true },
        narrativeText: '你刷到凌晨，像在用别人的进度麻醉自己的停滞。第二天醒来，拒信还在那里，简历也没有变。焦虑最会伪装成信息收集，让你感觉忙了很久，却没有真正前进一步。'
      }
    ]
  },

  act7_imposter_syndrome: {
    id: 'act7_imposter_syndrome',
    actId: 'act7',
    title: '冒名顶替',
    description: '某天开组会，你发现自己是唯一一个说不出论文进展的人。旁边的同学讲实验数据、讲文献综述、讲导师反馈，语气平静得像在报天气。你坐在角落里，PPT 打开了十五页，脑子里却只有一句话：\"我是怎么混进来的。\"这种感觉不是第一次出现。每次被夸\"你做得不错\"的时候，你心里总有一个声音说：他们早晚会发现我其实不行。你开始怀疑自己的每一次进步是不是都只是运气，而运气迟早会用完。',
    location: '学院会议室',
    week: 49,
    day: 4,
    npcId: 'wang_laoshi',
    imagePrompt: '学院会议室组会，一个学生坐在角落看着别人做汇报，PPT打开但手没动，自我怀疑的安静压力',
    playerChoices: [
      {
        id: 'a7_imposter_admit',
        text: '会后找王老师，坦白说自己觉得不配在这里',
        nextNodeId: 'act7_quiet_connection',
        statusChanges: { mood: 10, reputation: 4, energy: -4 },
        affectionChanges: { wang_laoshi: 14 },
        setFlags: { admittedImposterSyndrome: true },
        narrativeText: '王老师听完没有立刻安慰你，而是问了一句你没想到的话：\"你觉得这个房间里，有几个人也在想同样的事？\"你说不知道。她说：\"我当年读研的时候，每次组会都觉得自己是最差的那个。后来我发现，觉得自己不够好的人反而最认真。\"她又补了一句：\"冒名顶替感不是真相，它只是你对自己过于严格的副产品。\"那天你没有立刻好起来，但至少知道了这种感觉有名字，也有很多人跟你一样。'
      },
      {
        id: 'a7_imposter_push',
        text: '硬逼自己加班赶进度，用忙碌盖住不安',
        nextNodeId: 'act7_quiet_connection',
        statusChanges: { gpa: 0.06, energy: -18, mood: -10 },
        affectionChanges: { xiaoming: 2, xuejie: -3 },
        setFlags: { overworkedFromImposter: true },
        narrativeText: '你在实验室待到凌晨两点，第二天早上八点又到。三天后，数据跑出来了，但你的眼圈黑得像被打了一拳。小明看着你说：\"你这不叫努力，叫自我惩罚。\"你想反驳，可嘴张开之后什么也说不出来。也许他是对的——你不是在追进度，你是在用过劳证明自己有资格待在这里。'
      },
      {
        id: 'a7_imposter_compare',
        text: '继续和别人比较，越比越焦虑',
        nextNodeId: 'act7_quiet_connection',
        statusChanges: { mood: -14, energy: -8, social: -4 },
        affectionChanges: { wang_laoshi: -2, xuejie: -2 },
        setFlags: { deepImposterSpiral: true },
        narrativeText: '你开始统计每个同学的论文数量、实习经历和获奖列表。每一条都像一根尺子，量出你和\"应该成为的样子\"之间的距离。你知道这样不健康，可你停不下来——比较已经变成了一种强迫性的自我审判。后来你在手册的心理支持页加了一条：\"如果你发现自己在数别人有多少成果，停下来。数自己走了多远。\"'
      }
    ]
  },

  act7_quiet_connection: {
    id: 'act7_quiet_connection',
    actId: 'act7',
    title: '无声的默契',
    description: '大三最后一次期末考试结束的那个傍晚，你在湖边长椅上发呆。夕阳把水面染成橘红色，远处有人在跑步，更远处的教学楼开始一层一层亮灯。林雨薇不知道什么时候也走到了湖边，在你旁边坐下来。她没有问你考得怎么样，你也没有问她研究进展。你们就那样坐了很久，看着天色一点点暗下去。你想起第一次在图书馆见到她的时候，她递给你一本习题册；想起她靠在走廊墙上发呆的样子；想起冬天台阶上被风吹散的保研材料。三年了，她从\"学姐\"慢慢变成了一个你真正在意的人——不是因为她帮过你很多，而是因为你见过她不完美的样子，她也见过你的。',
    location: '校园湖边',
    week: 50,
    day: 3,
    npcId: 'xuejie',
    imagePrompt: '大学湖边长椅黄昏，两个人并排坐着看夕阳，安静默契不说话，橘红色光线温柔洒在水面上',
    playerChoices: [
      {
        id: 'a7_quiet_honest',
        text: '轻声说：学姐，这三年谢谢你。不只是学习上的',
        nextNodeId: 'act7_internship_offer',
        statusChanges: { mood: 14, social: 6 },
        affectionChanges: { xuejie: 24 },
        setFlags: { expressedGratitudeToXuejie: true, deepEmotionalBond: true },
        narrativeText: '林雨薇转头看你，夕阳在她镜片上晃了一下。她沉默了几秒，然后说了一句让你心跳漏了半拍的话：\"我也是。不只是因为你肯学。\"你没有追问\"那是因为什么\"，她也没有说。但那句未完成的话悬在你们之间，像湖面上的倒影——看得见形状，碰不到边。你不确定那是什么，也不急着定义。有些感情不需要名字，只需要在某个安静的傍晚，知道对方也在。'
      },
      {
        id: 'a7_quiet_joke',
        text: '笑着说：毕业之前你还欠我一杯奶茶',
        nextNodeId: 'act7_internship_offer',
        statusChanges: { mood: 10, social: 8 },
        affectionChanges: { xuejie: 18 },
        setFlags: { lightenedMoodWithXuejie: true },
        narrativeText: '林雨薇笑出了声，那种笑很轻松，不像她平时在学习群里的从容，更像一个卸下了什么的人。\"好啊，但你得等我论文过了再说。\"你们因为一杯奶茶聊了很多本来不会聊的话题：她小时候想当画家、你曾经怕黑到小学三年级、大一那个差点被骗的夏天。等天完全黑下来的时候，你才发现自己已经很久没有这么放松地跟一个人说话了。你不确定这算什么，但走回宿舍的路上，你的步子比来时轻了很多。'
      },
      {
        id: 'a7_quiet_silence',
        text: '什么也不说，就这样安静地坐着',
        nextNodeId: 'act7_internship_offer',
        statusChanges: { mood: 8 },
        affectionChanges: { xuejie: 14 },
        setFlags: { sharedSilenceWithXuejie: true },
        narrativeText: '你们谁也没有先开口。风从湖面吹过来，有点凉，但你没有动。她也没有。那大概是你整个大学里最安静的二十分钟——没有手机提醒、没有群消息、没有人需要你做什么决定。你后来试着在日记里描述那个傍晚，可写了几次都删掉了。有些时刻不适合被文字装进去，它只存在于当时的光线和空气里。你唯一能确定的是，那二十分钟之后，你心里有一个很小的地方变得不一样了。'
      }
    ]
  },

  act7_internship_offer: {
    id: 'act7_internship_offer',
    actId: 'act7',
    title: '实习与机会',
    description: '暑假前，你收到几条不同的机会：一家正规公司的实习面试，一个校友推荐的高薪远程项目，一个公益组织的安全教育营，还有一个收费昂贵的"名企直通训练营"。机会越多，判断越重要。你已经不会被粗糙骗局轻易骗到，但成年后的坑常常更精致：它可能合法、可能有效，只是未必适合你。',
    location: '咖啡厅',
    week: 50,
    day: 5,
    npcId: 'xiaojie',
    imagePrompt: '大学附近咖啡厅，电脑打开实习邮件和项目邀请，学生分析机会真假和成本',
    playerChoices: [
      {
        id: 'a7_c2_verify_offer',
        text: '逐项核验合同、公司主体和收费项目',
        nextNodeId: 'act7_value_conflict',
        statusChanges: { antiFraudAwareness: 12, reputation: 6, energy: -8, trust: -4 },
        affectionChanges: { xiaojie: 12, wang_laoshi: 6 },
        setFlags: { verifiedCareerOffers: true },
        narrativeText: '你把所有机会列成表：是否收费、主体是否一致、合同是否清楚、是否占用学业。小杰看完只说："现在你比我还像风控。"你笑了笑，心里却知道这份冷静来得并不轻松。'
      },
      {
        id: 'a7_c2_high_pay',
        text: '优先选择校友推荐的高薪远程项目',
        nextNodeId: 'act7_value_conflict',
        statusChanges: { money: 1000, trust: 8, energy: -16, antiFraudAwareness: -2 },
        affectionChanges: { dazhi: 8, xiaojie: -3, wang_laoshi: -2 },
        setFlags: { choseHighPayRemoteProject: true },
        narrativeText: '项目确实给了预付款，但任务边界越来越模糊。你没有被骗，却开始意识到：不违法不代表健康，不是骗局也可能消耗你。风险有时不是损失一笔钱，而是让你长期失去节奏。'
      },
      {
        id: 'a7_c2_public_camp',
        text: '参加安全教育营，把经验带到更多学校',
        nextNodeId: 'act7_value_conflict',
        statusChanges: { reputation: 12, social: 10, money: -200, mood: 8 },
        affectionChanges: { wang_laoshi: 10, xiaojie: 8, dazhi: 4 },
        setFlags: { joinedSafetyCamp: true },
        narrativeText: '你去到另一所学校，面对一群刚入学的学生讲"转账前停一下"。有人下课后悄悄问你："被骗过是不是就完了？"你回答得很认真："不是。真正要紧的是别一个人停在那一刻。"'
      },
      {
        id: 'a7_c2_training_camp',
        text: '报名昂贵训练营，赌一次名企机会',
        nextNodeId: 'act7_value_conflict',
        statusChanges: { money: -1200, mood: -8, trust: 6, antiFraudAwareness: 4 },
        affectionChanges: { xiaojie: -5, wang_laoshi: -3, xuejie: -2 },
        setFlags: { boughtCareerCamp: true },
        narrativeText: '训练营并非彻底虚假，但承诺远比交付漂亮。你再一次体会到：成年后的坑，不总是"骗光你"，也可能是让你为焦虑付高价。你把这条写进手册的高年级补充页。'
      }
    ]
  },

  act7_value_conflict: {
    id: 'act7_value_conflict',
    actId: 'act7',
    title: '价值冲突',
    description: '大三结束前，你必须承认一件事：时间不够。你不能同时拥有最高绩点、最多活动、最好实习、最稳定关系和最轻松心情。选择不只是拿到什么，也是放下什么。你曾经以为判断力是识别假的东西，现在才知道，它也包括放下那些真的、好的、却不属于此刻的东西。',
    location: '湖边长椅',
    week: 56,
    day: 7,
    npcId: 'wang_laoshi',
    imagePrompt: '大学湖边长椅，夕阳，学生和辅导员谈未来选择，成熟安静的氛围',
    playerChoices: [
      {
        id: 'a7_c3_choose_depth',
        text: '承认取舍，选择一个主方向深耕',
        nextNodeId: 'act7_bridge_to_act8',
        statusChanges: { reputation: 8, gpa: 0.12, mood: 6, energy: -8 },
        affectionChanges: { xuejie: 8, wang_laoshi: 8, xiaoming: 6 },
        setFlags: { choseDeepPath: true },
        narrativeText: '你删掉了几个看起来很厉害、实际消耗很大的计划。清单变短后，你反而第一次看清自己真正想做的事。深耕不是缩小人生，而是给重要的东西留出氧气。'
      },
      {
        id: 'a7_c3_choose_people',
        text: '把同伴和项目影响力放在第一位',
        nextNodeId: 'act7_bridge_to_act8',
        statusChanges: { social: 12, reputation: 10, mood: 6, gpa: -0.04 },
        affectionChanges: { dazhi: 10, xiaojie: 10, wang_laoshi: 8 },
        setFlags: { chosePeopleImpact: true },
        narrativeText: '你决定继续做安全教育项目。它不是最能写进简历的选择，但每当新生说"我知道该找谁了"，你都会觉得值得。有些影响不响亮，却会在某个转账页面前救下一个人。'
      },
      {
        id: 'a7_c3_keep_all',
        text: '什么都不想放弃，继续硬撑',
        nextNodeId: 'act7_bridge_to_act8',
        statusChanges: { energy: -26, mood: -18, reputation: -4, gpa: -0.08 },
        affectionChanges: { wang_laoshi: -2, xuejie: -4, dazhi: -3 },
        setFlags: { seniorBurnoutRisk: true },
        narrativeText: '你把所有任务都留在日程里，却开始频繁迟到、忘事、失眠。你不是不努力，你只是把努力当成了唯一答案。可努力如果没有边界，也会变成对自己的消耗。'
      }
    ]
  },

  act7_bridge_to_act8: {
    id: 'act7_bridge_to_act8',
    actId: 'act7',
    title: '幕间：最后一个暑假',
    description: '大三结束后的暑假不像从前那么轻。有人在实习城市租房，有人在实验室赶数据，有人回家备考，也有人突然从群聊里安静下来。你把这一年的路线表翻到最后一页，发现上面写满了被划掉的计划。划掉并不总是失败，有时是你终于承认时间、身体和关系都有边界。那份新生手册也多了一章：高年级机会判断。你写下第一句：越接近毕业，越要警惕把焦虑包装成机会的东西。',
    location: '暑假返校的高铁站',
    week: 60,
    day: 7,
    npcId: 'wang_laoshi',
    imagePrompt: '暑假返校高铁站，学生带着行李和电脑包，手机里打开未来路线表，毕业前过渡氛围',
    playerChoices: [
      {
        id: 'a7_bridge_senior',
        text: '带着取舍，进入大四',
        nextNodeId: 'act8_senior_year',
        statusChanges: { mood: 3, energy: 2 },
        setFlags: { juniorYearClosed: true },
        narrativeText: '列车进站时，你把路线表收进包里。大四还没有开始，离别却已经提前露面。你知道最后一年不会只是领奖或收尾，它会再次逼你回答：你到底想把自己交给什么样的未来。'
      }
    ]
  }
}
