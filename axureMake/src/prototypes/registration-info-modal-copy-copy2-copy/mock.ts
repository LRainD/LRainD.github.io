export interface Attachment {
  id: number;
  name: string;
  signingStatus?: 'signing' | 'signed' | 'failed';
  size?: string;
  isAiRecommended?: boolean;
  recommendationReason?: string;
}

export interface AttachmentCategory {
  id: string;
  title: string;
  required: boolean;
  hasTemplate: boolean;
  files: Attachment[];
  noRecommendationReason?: string;
}

export interface RecommendationMock {
  id: number;
  fileName: string;
  size: string;
  reason: string;
}

/** 联系方式默认值 */
export const defaultContact = {
  contactName: 'sup200',
  phone: '18716574377',
  email: '15623615623@139.com'
};

/** 纸质扫描件模式的附件分类初始数据 */
export const createInitialCategories = (): AttachmentCategory[] => [
  {
    id: 'health',
    title: '职业健康安全认证体系证书',
    required: false,
    hasTemplate: true,
    files: []
  },
  {
    id: 'credit',
    title: '工商企业信用等级',
    required: false,
    hasTemplate: true,
    files: [{ id: 102, name: '工商登记信息证明.pdf', size: '920KB' }]
  },
  {
    id: 'other',
    title: '其他附件',
    required: false,
    hasTemplate: false,
    files: []
  },
  {
    id: 'idcard',
    title: '法人身份证',
    required: true,
    hasTemplate: false,
    files: [{ id: 101, name: '58052193124060022401088623860.jpg', size: '1.2MB' }]
  }
];

/** 电子签章模式的附件分类初始数据（无附件） */
export const createEmptyCategories = (): AttachmentCategory[] =>
  createInitialCategories().map((cat) => ({ ...cat, files: [] }));

/** 一键导入的智能推荐结果 */
export const recommendationMap: Record<string, RecommendationMock[]> = {
  health: [
    {
      id: 201,
      fileName: '职业健康安全管理体系认证证书_2024.pdf',
      size: '1.5MB',
      reason: '文件名称包含“职业健康安全”，且证书类型与当前附件要求匹配'
    },
    {
      id: 202,
      fileName: '职业健康安全认证证书_有效期.pdf',
      size: '1.8MB',
      reason: '文件库标签标记为“体系认证”，并匹配当前报名项目的资质要求'
    }
  ],
  credit: [
    {
      id: 203,
      fileName: '企业信用等级证书_AAA级.pdf',
      size: '1.3MB',
      reason: '文件名称包含“企业信用等级”，与附件组成类型关键词匹配'
    }
  ],
  other: [],
  idcard: []
};
