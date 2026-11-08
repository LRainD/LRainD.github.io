/**
 * 预警核查-初始判定数据 - Mock 数据与类型定义
 *
 * 参考资料：
 * - /rules/design-guide.md
 * - /src/prototypes/risk-warning-feedback-copy/spec.md
 */

export type Satisfaction = '满意' | '不满意' | '未评价';
export type SatisfactionFilter = '是' | '否';
export type FeedbackStatus = '是' | '否';
export type DetectionScene = '合规自查' | '合规自查、风控预警' | '风控预警';

export interface FeedbackRecord {
  id: string;
  time: string;
  type: string;
  description: string;
  attachments: string[];
}

export interface ReviewSupplier {
  supplierName: string;
  reasoning: string;
}

export interface WarningRow {
  id: string;
  businessDomain: string;
  businessNo: string;
  businessName: string;
  businessType: string;
  organization: string;
  bureauOrg: string;
  bureauSubOrg: string;
  operator: string;
  businessStage: string;
  warningRule: string;
  warningLevel: string;
  detectionScene: DetectionScene;
  warningType: string;
  warningTime: string;
  initialData: string;
  currentData: string;
  releaseStatus: '已解除' | '未解除';
  /** 解除人（人工解除时的操作人） */
  releaser?: string;
  /** 解除说明（人工解除时填写的说明） */
  releaseNote?: string;
  reviewBasis?: string;
  reviewSuppliers?: ReviewSupplier[];
  satisfaction: Satisfaction;
  feedbacks: FeedbackRecord[];
}

export const feedbackData: WarningRow[] = [
  {
    id: '5', businessDomain: '云筑集采', businessNo: 'cscec20260826000081234', businessName: '华东分公司办公楼...', businessType: '招投标-公开招标', organization: '华东分公司', bureauOrg: '中建二局', bureauSubOrg: '二局华东公司', operator: '张明', businessStage: '报名', warningRule: '报名附件检测', warningLevel: '高风险', detectionScene: '合规自查', warningType: '预警', warningTime: '2026-08-26 10:18:36', initialData: '不合格附件：3份', currentData: '不合格附件：3份', releaseStatus: '未解除', reviewBasis: '【审查范围】系统对报名供应商提交的营业执照、资质证书及业绩证明进行解析与核验。\n【核验结果】发现 3 家供应商的附件存在资质等级不符、业绩证明缺失或证照已过期情形。\n【判定结果】报名附件未完全满足招标公告要求，触发报名附件检测预警。', reviewSuppliers: [{ supplierName: 'sup101（中建某某建设有限公司）', reasoning: '【营业执照】有效。\n【资质证书】实际上传资质为建筑工程施工总承包二级，未满足公告要求的一级资质。' }, { supplierName: 'sup105（北京某某装饰工程有限公司）', reasoning: '【营业执照】有效。\n【业绩证明】未提供近三年同类项目业绩证明材料。' }, { supplierName: 'sup203（上海某某实业发展有限公司）', reasoning: '【安全生产许可证】已于 2026 年 6 月 30 日到期，当前处于失效状态。' }], satisfaction: '未评价',
    feedbacks: []
  },
  {
    id: '1', businessDomain: '云筑集采', businessNo: 'cscec202608013000396247', businessName: '一局发展四川间...', businessType: '招投标-非招采购', organization: '发展公司西南分公司', bureauOrg: '中建一局', bureauSubOrg: '建设发展公司', operator: '许必展', businessStage: '均标', warningRule: '最小有效投标供应商数量', warningLevel: '高风险', detectionScene: '合规自查、风控预警', warningType: '拦截', warningTime: '2026-08-16 22:43:05', initialData: '有效投标供应商：2家', currentData: '有效投标供应商：2家', releaseStatus: '未解除', satisfaction: '不满意',
    feedbacks: [
      { id: 'f-11', time: '2026-08-16 22:45:18', type: '预警信息不准确', description: '该项目为专项采购，已有审批记录，供应商数量符合实际业务要求。', attachments: ['专项采购审批单.pdf'] },
      { id: 'f-12', time: '2026-08-16 22:49:36', type: '处置建议不合理', description: '建议增加专项采购场景的豁免说明入口，避免重复提交材料。', attachments: [] }
    ]
  },
  {
    id: '2', businessDomain: '云筑集采', businessNo: '2021-13-CC037-000000207', businessName: '二局三华中标看...', businessType: '合同', organization: '中建二局三公司华中分公司', bureauOrg: '中建二局', bureauSubOrg: '二局三公司', operator: '王馨阳', businessStage: '合同', warningRule: '合同总额超招标预算', warningLevel: '中风险', detectionScene: '风控预警', warningType: '预警', warningTime: '2026-08-16 22:29:44', initialData: '合同金额：1,286万元', currentData: '合同金额：1,286万元', releaseStatus: '已解除', releaser: '李伟（liwei03）', releaseNote: '人工解除：经核实合同金额 1,286 万元已包含变更签证部分，未超出招标预算上限，判定为误报，予以解除。', satisfaction: '满意',
    feedbacks: [
      { id: 'f-21', time: '2026-08-16 22:31:03', type: '其他问题', description: '预警内容清晰，已按提示完成复核。', attachments: [] }
    ]
  },
  {
    id: '3', businessDomain: '云筑集采', businessNo: 'cscec20260804000065984', businessName: '广安人民医院医...', businessType: '招投标-非招采购', organization: '华西分公司', bureauOrg: '中建二局', bureauSubOrg: '二局华西公司', operator: '董洁方', businessStage: '发标', warningRule: '采购-总短报价时间', warningLevel: '高风险', detectionScene: '合规自查、风控预警', warningType: '拦截', warningTime: '2026-08-16 22:15:48', initialData: '报价时长：18小时', currentData: '报价时长：18小时', releaseStatus: '未解除', satisfaction: '不满意',
    feedbacks: [
      { id: 'f-31', time: '2026-08-16 22:19:42', type: '数据同步延迟', description: '采购计划已调整，但预警仍显示旧的报价时间，请协助核实。', attachments: ['计划调整截图.png', '采购计划说明.docx'] },
      { id: 'f-32', time: '2026-08-16 22:25:10', type: '规则逻辑有误', description: '紧急采购不适用该报价时长规则，建议按照采购方式区分处理。', attachments: [] },
      { id: 'f-33', time: '2026-08-16 22:27:51', type: '其他问题', description: '希望能在预警页直接查看该规则的适用范围。', attachments: [] }
    ]
  },
  {
    id: '4', businessDomain: '云筑集采', businessNo: 'cscec202608040000201590', businessName: '潍坊公交新能源...', businessType: '招投标-非招采购', organization: '科工湖北公司', bureauOrg: '中建科工', bureauSubOrg: '科工湖北公司', operator: '胡臣', businessStage: '发标', warningRule: '采购-总短报价时间', warningLevel: '高风险', detectionScene: '风控预警', warningType: '拦截', warningTime: '2026-08-16 22:07:44', initialData: '报价时长：24小时', currentData: '报价时长：24小时', releaseStatus: '已解除', releaser: '周婷（zhouting02）', releaseNote: '人工解除：该项目采用紧急采购方式，报价时长规则不适用，业务部门已提交说明材料，予以解除。', satisfaction: '未评价',
    feedbacks: []
  }
];
