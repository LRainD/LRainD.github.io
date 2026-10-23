// 报名及资审汇总 页面静态数据

export type SupplierTagType = 'change' | 'small' | 'square';

export interface SupplierTag {
  text: string;
  type: SupplierTagType;
  withInfo?: boolean;
}

export interface SupplierRow {
  /** 表格行唯一标识 */
  key: number;
  /** 展示序号 */
  index: number;
  name: string;
  nameTags: SupplierTag[];
  /** 分供商名称下方的次级标签（变更历史 / 弱 / 本 ...） */
  subTags: SupplierTag[];
  companyType: string;
  address: string;
  adminAccount: string;
  contact: string;
  phone: string;
  status: '已报名' | '未报名';
  /** 报名时间（已报名） */
  applyTime?: string;
  /** 签收公告时间（未报名） */
  signTime?: string;
  ackIp: string;
  applyIp?: string;
  attachText: string;
  remark?: string;
  remarkMax?: number;
  qualified: boolean;
  freeDeposit: boolean;
}

export const SUPPLIER_ROWS: SupplierRow[] = [
  {
    key: 1,
    index: 2,
    name: '重庆蓝桔科技有限公司',
    nameTags: [
      { text: '变更历史', type: 'change', withInfo: true },
      { text: '圈', type: 'square' },
      { text: '本', type: 'square' }
    ],
    subTags: [],
    companyType: '有限责任公司',
    address: '重庆市北碚区北温泉街道安礼路122号大学科技园科技创业中心2楼504',
    adminAccount: 'sup201',
    contact: 'sup201',
    phone: '17535566485',
    status: '已报名',
    applyTime: '2026-08-21 17:28:43',
    ackIp: '172.16.73.107',
    applyIp: '172.16.73.107',
    attachText: '已上传，已启封 (1)',
    qualified: true,
    freeDeposit: false
  },
  {
    key: 2,
    index: 3,
    name: 'sup204中建智慧-改个名字',
    nameTags: [
      { text: '小微企业', type: 'small' },
      { text: '圈', type: 'square' },
      { text: '本', type: 'square' }
    ],
    subTags: [
      { text: '变更历史', type: 'change' },
      { text: '弱', type: 'square' },
      { text: '本', type: 'square' }
    ],
    companyType: 'xxxxxxxxxx',
    address: '民营县野狗乡政府院内',
    adminAccount: 'sup204',
    contact: 'sup204',
    phone: '18399402117',
    status: '已报名',
    applyTime: '2026-08-21 17:28:52',
    ackIp: '172.16.73.107',
    applyIp: '172.16.73.107',
    attachText: '已上传，已启封 (1)',
    remark: '',
    remarkMax: 1000,
    qualified: true,
    freeDeposit: false
  },
  {
    key: 3,
    index: 4,
    name: 'sup203',
    nameTags: [
      { text: '小微企业', type: 'small' },
      { text: '弱', type: 'square' },
      { text: '本', type: 'square' }
    ],
    subTags: [
      { text: '变更历史', type: 'change' },
      { text: '弱', type: 'square' },
      { text: '本', type: 'square' }
    ],
    companyType: '其他',
    address: '--',
    adminAccount: 'sup203',
    contact: 'sup203',
    phone: '18182768906',
    status: '已报名',
    applyTime: '2026-08-21 17:28:52',
    ackIp: '172.16.73.107',
    applyIp: '172.16.73.107',
    attachText: '已上传，已启封 (1)',
    remark: '',
    remarkMax: 1000,
    qualified: true,
    freeDeposit: false
  },
  {
    key: 4,
    index: 5,
    name: 'sup205-q变更测试one',
    nameTags: [
      { text: '变更历史', type: 'change', withInfo: true },
      { text: '弱', type: 'square' },
      { text: '本', type: 'square' },
      { text: '注', type: 'square' }
    ],
    subTags: [
      { text: '变更历史', type: 'change' },
      { text: '弱', type: 'square' },
      { text: '本', type: 'square' }
    ],
    companyType: '有限责任公司(自然人独资)',
    address: '北京市西城区月坛南街26号4号楼221室',
    adminAccount: 'sup205',
    contact: 'sup205',
    phone: '18794113973',
    status: '未报名',
    signTime: '2026-08-21 17:28:56',
    ackIp: '172.16.73.107',
    attachText: '未上传',
    remark: '',
    remarkMax: 1000,
    qualified: false,
    freeDeposit: false
  }
];

export const ATTACH_SUPPORT_FORMAT =
  'jpeg jpg gif png doc docx xls xlsx txt pdf rar zip 7z tar jar dwg dws dwt dxf csv';
