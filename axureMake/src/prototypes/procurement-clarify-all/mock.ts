// --- 静态数据 ---

/** 澄清记录中的分供商阅读状态行 */
export interface ReadRow {
  text: string;
  /** 行右侧操作链接 */
  actions?: string[];
}

/** 澄清记录 */
export interface ClarifyRecord {
  key: string;
  question: string;
  /** 澄清时间 */
  time: string;
  /** 回答截止时间 */
  replyDeadline: string;
  readRows: ReadRow[];
  /** 记录状态（如：已撤回） */
  status?: string;
}

/** 澄清记录列表 */
export const RECORDS: ClarifyRecord[] = [
  {
    key: '1',
    question: '根据股份管理要求，进行澄清',
    time: '2026-10-20 09:33:13',
    replyDeadline: '2026-10-23 18:00:00',
    readRows: [
      {
        text: '未读分供商(2)：重庆蓝雄科技有限公司、sup203',
        actions: ['撤回', '查看详情']
      }
    ]
  },
  {
    key: '2',
    question: '问题已撤回',
    time: '2026-10-20 09:30:27',
    replyDeadline: '2026-10-23 18:00:00',
    readRows: [{ text: '未读分供商(2)：重庆蓝雄科技有限公司、sup203' }],
    status: '已撤回'
  },
  {
    key: '3',
    question: '123',
    time: '2026-10-20 09:29:36',
    replyDeadline: '2026-10-22 12:00:00',
    readRows: [
      { text: '已读未回分供商(1)：sup203', actions: ['查看详情'] },
      { text: '未读分供商(1)：sup205-qi变更测试one', actions: ['查看详情'] }
    ]
  }
];

/** 已选分供商 */
export const SELECTED_SUPPLIERS: string[] = ['sup203', '重庆蓝雄科技有限公司'];

/** 默认回答截止时间 */
export const REPLY_DEADLINE = '2026-10-23 18:00:00';
