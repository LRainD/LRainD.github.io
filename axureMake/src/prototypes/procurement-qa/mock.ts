/**
 * 简版-发起澄清 页面模拟数据
 */

export interface ClarifyRecord {
  key: string;
  index: number;
  clarifyTime: string;
  questionDeadline: string;
  clarifyDesc: string;
  attachCount: string;
  attach: string;
  status: string;
  action: string;
}

export interface AskRecord {
  key: string;
  index: number;
  supplier: string;
  contact: string;
  askTime: string;
  askDesc: string;
  attachCount: string;
  attach: string;
  status: string;
  action: string;
}

export interface ClarifyPageInfo {
  category: string;
  title: string;
  countdown: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  items: {
    procurementNo: string;
    organization: string;
    procurementMethod: string;
    projectName: string;
    categoryName: string;
    operator: string;
  };
}

export const clarifyPageInfo: ClarifyPageInfo = {
  category: '物资',
  title: '澄清功能测试',
  countdown: {
    days: 999996,
    hours: 22,
    minutes: 32,
    seconds: 21
  },
  items: {
    procurementNo: 'cscec202610150000020997',
    organization: '中国建筑股份有限公司',
    procurementMethod: '询比采购',
    projectName: '测试项目71704',
    categoryName: '物资-钢材',
    operator: '奥巴马'
  }
};

export const clarifyListData: ClarifyRecord[] = [
  {
    key: '1',
    index: 1,
    clarifyTime: '2026-10-15 16:53:21',
    questionDeadline: '-',
    clarifyDesc: '23',
    attachCount: '0',
    attach: '--',
    status: '已澄清',
    action: '查看审批记录'
  },
  {
    key: '2',
    index: 2,
    clarifyTime: '2026-10-14 10:08:47',
    questionDeadline: '2026-10-20 18:00:00',
    clarifyDesc: '明确 HRB400E 螺纹钢的抗震性能指标要求，详见附件说明',
    attachCount: '1',
    attach: '澄清函.pdf',
    status: '已澄清',
    action: '查看审批记录'
  },
  {
    key: '3',
    index: 3,
    clarifyTime: '2026-10-13 09:32:15',
    questionDeadline: '-',
    clarifyDesc: '交货地点统一为天津港仓库，运输费用由采购方承担',
    attachCount: '0',
    attach: '--',
    status: '已澄清',
    action: '查看审批记录'
  },
  {
    key: '4',
    index: 4,
    clarifyTime: '2026-10-11 14:45:02',
    questionDeadline: '2026-10-18 12:00:00',
    clarifyDesc: '投标保证金缴纳方式调整为银行保函或电汇',
    attachCount: '2',
    attach: '保函模板.docx、付款说明.pdf',
    status: '审批中',
    action: '查看审批记录'
  }
];

export const askListData: AskRecord[] = [
  {
    key: '1',
    index: 1,
    supplier: '北京中铁建材有限公司 (ACC2026001)',
    contact: '张经理 13800138000',
    askTime: '2026-04-16 09:12:45',
    askDesc: '请问HRB400E螺纹钢的抗震性能具体指标要求是怎样的？',
    attachCount: '1',
    attach: '疑问咨询函.pdf',
    status: '待回答 (限期：2026-04-18 18:00)',
    action: '回答 | 转发'
  },
  {
    key: '2',
    index: 2,
    supplier: '上海华东钢铁销售有限公司 (ACC2026002)',
    contact: '李工 13911223344',
    askTime: '2026-04-16 10:25:11',
    askDesc: '交货地点是否可以变更为天津港口仓库？',
    attachCount: '0',
    attach: '-',
    status: '已回答 (已于 2026-04-16 11:00 回答)',
    action: '查看详情'
  }
];
