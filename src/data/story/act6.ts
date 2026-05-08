import type { StoryNode } from '../types'

export const ACT6_NODES: Record<string, StoryNode> = {
  act6_sophomore_crossroads: {
    id: 'act6_sophomore_crossroads',
    actId: 'act6',
    title: '大二分岔口',
    description: '大二开学，你不再是走到哪里都要找路的新生。校门口换了一批拖着行李的人，迎新棚下贴着你们更新过的新生手册二维码。林雨薇准备保研材料，小明参加算法训练，大志加入学生会，小杰在帮学院维护反诈知识库。王老师问你："第一年你学会了避坑，第二年你想把能力用在哪里？"这一次，问题不再是怎样活下来，而是怎样把活下来的经验变成能力。',
    location: '学院大厅',
    week: 20,
    day: 1,
    npcId: 'wang_laoshi',
    imagePrompt: '大学学院大厅，大二开学，学生站在不同社团和科研招募海报前，人生分岔感',
    playerChoices: [
      {
        id: 'a6_c1_academic',
        text: '把重心放到专业学习和科研训练',
        nextNodeId: 'act6_first_project',
        statusChanges: { gpa: 0.24, energy: -12, social: -2, mood: 4 },
        affectionChanges: { xuejie: 12, xiaoming: 10, wang_laoshi: 4 },
        setFlags: { choseAcademicTrack: true },
        narrativeText: '你报名了导师开放课题，也开始固定参加学习小组。小明把竞赛训练表发给你，林雨薇提醒："不要只追成果，先学会做可靠的人。"你发现可靠比聪明更难，因为它需要长期兑现。'
      },
      {
        id: 'a6_c1_safety',
        text: '继续推进校园安全和新生手册项目',
        nextNodeId: 'act6_first_project',
        statusChanges: { reputation: 14, social: 8, antiFraudAwareness: 12, energy: -10 },
        affectionChanges: { wang_laoshi: 12, xiaojie: 10, dazhi: 6 },
        setFlags: { choseCampusSafetyTrack: true },
        narrativeText: '王老师把你拉进学院安全教育小组。你第一次参加正式会议，发现把一个好点子做成制度，比写一份清单难得多。制度不喜欢热血，它只相信流程、责任人和可持续维护。'
      },
      {
        id: 'a6_c1_social',
        text: '加入学生会和社团管理，锻炼组织能力',
        nextNodeId: 'act6_first_project',
        statusChanges: { social: 14, reputation: 8, energy: -10, gpa: -0.04 },
        affectionChanges: { dazhi: 12, wang_laoshi: 5, xuejie: -2 },
        setFlags: { choseLeadershipTrack: true },
        narrativeText: '大志兴奋地把你拉进活动策划群。你很快发现，组织能力不是"会说话"，而是能把混乱的需求变成可执行的安排，还要在别人情绪上来时稳住场面。'
      },
      {
        id: 'a6_c1_lost',
        text: '先不确定方向，继续观察和尝试',
        nextNodeId: 'act6_first_project',
        statusChanges: { mood: -6, energy: 4, trust: -2, antiFraudAwareness: 4 },
        affectionChanges: { wang_laoshi: 4, xiaojie: 4 },
        setFlags: { uncertainDirection: true },
        narrativeText: '你没有立刻选定路线。王老师没有催你，只让你每月写一次复盘："迷茫不是问题，长期不看见自己才是。"这句话听起来温和，却要求你不能把漂着当成自由。'
      }
    ]
  },

  act6_first_project: {
    id: 'act6_first_project',
    actId: 'act6',
    title: '第一次独立项目',
    description: '学期中，你接到一个真正需要负责到底的项目：可能是科研小模块、学院安全活动、社团迎新，也可能只是你给自己定下的探索计划。事情不像第一年那样有明确选项，更多时候，你要自己定义问题。没有骗子催你转账，也没有老师替你画好路线，但模糊本身就是另一种压力。',
    location: '图书馆讨论室',
    week: 24,
    day: 4,
    npcId: 'xuejie',
    imagePrompt: '大学讨论室，白板、项目计划、电脑和便签，大二学生第一次独立负责项目',
    playerChoices: [
      {
        id: 'a6_c2_deep_work',
        text: '减少活动，集中把项目做扎实',
        nextNodeId: 'act6_midterm_feedback',
        statusChanges: { gpa: 0.18, reputation: 6, social: -4, energy: -10 },
        affectionChanges: { xiaoming: 10, xuejie: 8, dazhi: -4 },
        setFlags: { projectDeepWork: true },
        narrativeText: '你推掉了几次临时活动，把项目文档写到第三版。成果不炫，但导师第一次认真问你："下学期愿不愿意继续做？"你知道这是认可，也是一份更长的责任。'
      },
      {
        id: 'a6_c2_collaborate',
        text: '拉上室友和同学一起做成团队项目',
        nextNodeId: 'act6_midterm_feedback',
        statusChanges: { social: 12, reputation: 10, energy: -14, mood: 6 },
        affectionChanges: { dazhi: 10, xiaojie: 10, xiaoming: 6 },
        setFlags: { projectTeamBuilt: true },
        narrativeText: '大志负责沟通，小杰负责核验资料，小明负责技术细节。你第一次发现，一个人的优点有限，团队的边界却可以互相补上。前提是大家愿意把边界说出来，而不是假装自己什么都行。'
      },
      {
        id: 'a6_c2_overpromise',
        text: '答应太多任务，试图证明自己全能',
        nextNodeId: 'act6_midterm_feedback',
        statusChanges: { reputation: -4, energy: -22, mood: -14, gpa: -0.08 },
        affectionChanges: { xuejie: -4, xiaoming: -3, dazhi: 2 },
        setFlags: { overpromisedProject: true },
        narrativeText: '你同时接了三个任务，消息列表像雪片一样压下来。到了截止日前夜，你终于承认：忙碌不等于可靠。很多过载不是被别人强加的，而是自己舍不得说不。'
      }
    ]
  },

  act6_midterm_feedback: {
    id: 'act6_midterm_feedback',
    actId: 'act6',
    title: '第一次中期反馈',
    description: '项目中期汇报没有你想象中顺利。导师指出你的问题定义还不够清楚，安全教育小组觉得落地流程太重，社团同学抱怨沟通太频繁。你第一次发现，成长不是"我努力了"就自动被认可。反馈像一面镜子，照出成果，也照出盲区。你必须决定，是把镜子摔掉，还是把自己看清楚。',
    location: '学院会议室',
    week: 26,
    day: 3,
    npcId: 'wang_laoshi',
    imagePrompt: '学院会议室，中期汇报投影、反馈便签、学生面对老师和同伴意见，真实成长压力',
    playerChoices: [
      {
        id: 'a6_c2b_feedback_table',
        text: '把反馈整理成问题表，逐项修正',
        nextNodeId: 'act6_public_launch',
        statusChanges: { reputation: 10, gpa: 0.12, energy: -10, mood: 3 },
        affectionChanges: { xuejie: 8, xiaoming: 6, wang_laoshi: 6 },
        setFlags: { usedFeedbackTable: true },
        narrativeText: '你把每条反馈写成"问题、证据、下一步"。导师看见第二版文档时说："你开始像项目负责人了。"负责人不是永远正确的人，而是愿意让问题有去处的人。'
      },
      {
        id: 'a6_c2b_user_visit',
        text: '去访谈新生，确认他们真正需要什么',
        nextNodeId: 'act6_public_launch',
        statusChanges: { social: 10, antiFraudAwareness: 8, reputation: 8, energy: -12 },
        affectionChanges: { wang_laoshi: 8, dazhi: 6, xiaojie: 6 },
        setFlags: { interviewedFreshmen: true },
        narrativeText: '你问了十几个新生，才发现他们最需要的不是更长的说明，而是在关键时刻知道下一步点哪里、找谁、怎么说。那天晚上，你把手册里三页长文删成了三张流程卡。'
      },
      {
        id: 'a6_c2b_defensive',
        text: '觉得大家不理解你，先按原计划推进',
        nextNodeId: 'act6_public_launch',
        statusChanges: { mood: -10, reputation: -6, social: -4, energy: -8 },
        affectionChanges: { xuejie: -4, wang_laoshi: -3, dazhi: -2 },
        setFlags: { ignoredProjectFeedback: true },
        narrativeText: '你把反馈当成否定，继续按原方案推进。项目没有立刻失败，但团队开始变得沉默，因为大家发现说了也没用。一个项目最危险的时刻，不是争吵，而是所有人都放弃提醒。'
      }
    ]
  },

  act6_public_launch: {
    id: 'act6_public_launch',
    actId: 'act6',
    title: '项目上线日',
    description: '十一月，你们把项目第一次推到真实新生面前。报告厅里没有想象中的掌声，只有很多具体而琐碎的问题："如果辅导员晚上没回怎么办？""兼职群里是同班同学拉我进去的也要怀疑吗？""我已经转了钱，还能不能找老师？"这些问题比任何评审都锋利。你忽然意识到，教育产品不是把你们觉得重要的东西讲出去，而是要接住别人真的会问出口的害怕。',
    location: '学院报告厅',
    week: 27,
    day: 5,
    npcId: 'wang_laoshi',
    imagePrompt: '学院报告厅，安全教育项目第一次面对新生，台下学生举手提问，真实产品上线压力',
    playerChoices: [
      {
        id: 'a6_c2c_answer_process',
        text: '把回答改成“下一步流程”，现场补进手册',
        nextNodeId: 'act6_relationship_test',
        statusChanges: { reputation: 10, antiFraudAwareness: 8, energy: -8, mood: 5 },
        affectionChanges: { wang_laoshi: 10, xiaojie: 8, xuejie: 5 },
        setFlags: { improvedManualWithFreshmenQuestions: true },
        narrativeText: '你没有用"提高警惕"糊弄过去，而是把每个问题改成一个动作：截图、停止转账、找谁、怎么说、带什么材料。王老师在旁边点头。你第一次觉得这份手册开始像一个真正的产品。'
      },
      {
        id: 'a6_c2c_chase_applause',
        text: '更在意展示效果，强调项目亮点',
        nextNodeId: 'act6_relationship_test',
        statusChanges: { reputation: 2, social: 4, mood: -6, antiFraudAwareness: -2 },
        affectionChanges: { wang_laoshi: -3, xiaojie: -4, dazhi: 2 },
        setFlags: { chasedProjectShowcase: true },
        narrativeText: '展示页很漂亮，但几个新生的问题被你轻轻带过。小杰会后说："他们问的是救命按钮在哪里，不是我们做得多完整。"这句话让你有点难堪，也让你知道下一版该从哪里改。'
      },
      {
        id: 'a6_c2c_invite_feedback',
        text: '邀请新生匿名提交真实问题',
        nextNodeId: 'act6_relationship_test',
        statusChanges: { social: 8, reputation: 8, mood: 4, energy: -8 },
        affectionChanges: { dazhi: 8, wang_laoshi: 8, xiaojie: 6 },
        setFlags: { openedAnonymousFeedbackBox: true },
        narrativeText: '匿名表单很快收到几十条内容：恋爱借钱、校园贷、二手交易、家里催成绩、AI 代写。你看着那些问题，突然明白新生手册不该只有一条主线。真实校园生活永远比剧本更复杂。'
      }
    ]
  },

  act6_relationship_test: {
    id: 'act6_relationship_test',
    actId: 'act6',
    title: '关系的压力测试',
    description: '项目推进到最忙时，宿舍和团队矛盾又冒了出来。有人觉得你太强势，有人觉得你不够负责，也有人只是累了。第一年你学会了"及时求助"，现在你要学的是长期合作：让问题在爆炸前被看见，让责任在压垮人前被重新分配。',
    location: '宿舍楼 308',
    week: 28,
    day: 6,
    npcId: 'dazhi',
    imagePrompt: '大学宿舍夜晚，团队项目冲突，白板计划和疲惫学生，真实合作压力',
    playerChoices: [
      {
        id: 'a6_c3_repair',
        text: '开一次复盘会，把分工和边界说清楚',
        nextNodeId: 'act6_bridge_to_act7',
        statusChanges: { social: 8, reputation: 8, mood: 6, energy: -8 },
        affectionChanges: { dazhi: 10, xiaojie: 8, xiaoming: 6 },
        setFlags: { repairedTeamProcess: true },
        narrativeText: '你们把"谁负责什么、什么时候求助、什么算完成"写在白板上。气氛不算轻松，但终于不再靠猜。大志说这比吵架累，小杰说至少比沉默有效。'
      },
      {
        id: 'a6_c3_take_all',
        text: '自己扛下所有收尾，避免继续冲突',
        nextNodeId: 'act6_bridge_to_act7',
        statusChanges: { reputation: 3, energy: -24, mood: -12, social: -6 },
        affectionChanges: { xiaoming: 2, dazhi: -6, xiaojie: -4 },
        setFlags: { tookAllBurden: true },
        narrativeText: '项目最后交上去了，但你累到在图书馆睡着。大志想道歉，却不知道怎么开口。你保住了结果，却消耗了关系，也让别人失去了参与修正的机会。'
      },
      {
        id: 'a6_c3_quit',
        text: '承认做不完，主动缩小项目范围',
        nextNodeId: 'act6_bridge_to_act7',
        statusChanges: { mood: 8, energy: 6, reputation: -2, antiFraudAwareness: 4 },
        affectionChanges: { wang_laoshi: 8, xiaojie: 5, xuejie: 4 },
        setFlags: { scopedProjectDown: true },
        narrativeText: '你向老师说明风险，把项目范围缩小。结果没那么漂亮，但你学会了一个很成年人的能力：及时止损不是失败。它和转账前停下是同一种能力，只是换了场景。'
      }
    ]
  },

  act6_bridge_to_act7: {
    id: 'act6_bridge_to_act7',
    actId: 'act6',
    title: '幕间：项目之后',
    description: '大二结束时，项目没有成为你想象中的完美作品。它有遗漏，有维护成本，有人热情下降，也有人在匿名表单里留下了很长的感谢。你开始接受一件事：长期有用的东西，往往不会一直让人兴奋，它需要交接、复盘、删减和继续修补。林雨薇开始准备保研，小明的竞赛进了省赛，大志在学生会第一次独立带新人，小杰把知识库迁到了学院服务器。每个人都在往更长的路上走，而你也必须面对自己的下一道选择题。',
    location: '图书馆外阶梯',
    week: 32,
    day: 7,
    npcId: 'xuejie',
    imagePrompt: '大二结束的图书馆外阶梯，学生带着项目材料和书包走向不同方向，时间推进感',
    playerChoices: [
      {
        id: 'a6_bridge_next_year',
        text: '进入大三，面对未来路线',
        nextNodeId: 'act7_junior_choice',
        statusChanges: { mood: 4, reputation: 2 },
        setFlags: { sophomoreYearClosed: true },
        narrativeText: '暑假前的校园又热了起来。你收起项目复盘表，打开新的路线清单。上面不是"防骗"两个字，而是升学、实习、公益、家庭期待和自我怀疑。你知道，判断力要去更远的地方接受检验了。'
      }
    ]
  }
}
