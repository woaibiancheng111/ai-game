import type { SchoolConfig } from '../types'

export const DEFAULT_SCHOOL_CONFIG: SchoolConfig = {
  schoolName: '示例大学',
  collegeName: '计算机学院',
  antiFraudNotice: '遇到转账、押金、保证金、证件上传等要求时，先暂停操作，保存证据，并联系辅导员或保卫处核验。',
  contacts: [
    {
      id: 'counselor',
      label: '学院办公室 / 辅导员入口',
      value: '请配置本校辅导员或学院办公室电话',
      description: '适用于学业预警、生活困难、被骗风险、突发事件等第一时间求助。'
    },
    {
      id: 'security',
      label: '保卫处',
      value: '请配置本校保卫处电话',
      description: '适用于诈骗线索、校园安全事件、可疑人员和紧急安全协助。'
    },
    {
      id: 'mental_health',
      label: '心理咨询中心',
      value: '请配置心理咨询预约入口',
      description: '适用于持续焦虑、睡眠问题、被骗后的羞耻感和压力支持。'
    },
    {
      id: 'financial_aid',
      label: '资助中心',
      value: '请配置资助中心电话或网站',
      description: '适用于生活费压力、临时困难补助、助学金和绿色通道咨询。'
    }
  ],
  resources: [
    {
      id: 'work_study',
      label: '勤工助学入口',
      url: 'https://example.edu.cn/work-study',
      description: '优先查询学校认证的勤工助学岗位，避免陌生兼职渠道。'
    },
    {
      id: 'academic_affairs',
      label: '教务入口',
      url: 'https://example.edu.cn/jw',
      description: '查询课程、考试、成绩、学业预警和正规学习支持。'
    },
    {
      id: 'anti_fraud',
      label: '反诈提醒',
      url: 'https://example.edu.cn/security',
      description: '查看学校发布的反诈案例、举报流程和安全提醒。'
    }
  ]
}
