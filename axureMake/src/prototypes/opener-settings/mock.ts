/* 开启人设置页 - Mock 数据 */

/* ================= 步骤条数据 ================= */

export const SUB_STEPS = [
  '设置报价格式',
  '开启人设置',
  '编制采购文件',
  '保证金设置',
  '发布采购文件',
  '查看报价情况'
];

/* ================= 采购信息 ================= */

export interface ProcurementInfoItem {
  label: string;
  value: string;
  link?: boolean;
}

export const PROCUREMENT_INFO: ProcurementInfoItem[] = [
  { label: '采购编号', value: 'cscec202610130000021437', link: true },
  { label: '组织机构', value: '中国建筑股份有限公司' },
  { label: '采购方式', value: '询比采购' },
  { label: '项目', value: '测试项目71704', link: true },
  { label: '品类', value: '物资-钢材' },
  { label: '经办人', value: 'admin11' }
];

/* ================= 开启人表格 ================= */

export interface OpenerRow {
  key: string;
  opener: string;
  account: string;
  phone: string;
  org: string;
  encrypted: string;
}

/* ================= 智能推荐结果 ================= */

export const RECOMMEND_OPEN_METHOD = '密码+密钥';

export const RECOMMEND_OPENERS: OpenerRow[] = [
  {
    key: '1',
    opener: 'admin11',
    account: 'jcadmin',
    phone: '18215655467',
    org: '中国建筑股份有限公司',
    encrypted: '否'
  },
  {
    key: '2',
    opener: 'admin12',
    account: 'jcadmin2',
    phone: '13800001111',
    org: '中国建筑股份有限公司',
    encrypted: '否'
  },
  {
    key: '3',
    opener: 'admin13',
    account: 'jcadmin3',
    phone: '13900002222',
    org: '中国建筑股份有限公司',
    encrypted: '是'
  }
];

/* ================= 智能推荐字段配置 ================= */

export const AI_FIELDS = [
  { id: 'openMethod', label: '开启方式' },
  { id: 'openers', label: '开启人员' }
];
