/**
 * @name 合规风险处理组件
 * @mode component
 *
 * 组件说明：
 * 包含“数字合规官检测中”的加载弹窗以及“风控预警”的处理结果弹窗。
 */

import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { Modal, Button } from 'antd';
import {
  CheckCircleOutlined,
  LoadingOutlined,
  ClockCircleOutlined,
  DownOutlined,
  RightOutlined
} from '@ant-design/icons';
import {
  AlertCircle,
  X,
  Plus,
  Download,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  CheckCircle2,
  Paperclip
} from 'lucide-react';
import complianceImage from '../../../assets/images/数字合规官检测中.png';
import './style.css';

export interface ComplianceHandle {
  startFlow: () => void;
  showDetection: () => void;
  hideDetection: () => void;
  showRiskWarning: () => void;
  hideRiskWarning: () => void;
}

export interface ComplianceProps {
  onDetectionComplete?: () => void;
  /** 是否需要展示处置相关操作（勾选框、处置状态、处置模式、处置说明、处置附件），默认为 true */
  showDisposalFields?: boolean;
  /** 自定义风险数据 */
  riskData?: RiskItem[];
}

interface RiskRule {
  id: string;
  name: string;
  isLLM: boolean;
  status: 'pending' | 'loading' | 'thinking' | 'passed' | 'failed';
  thoughts?: string[];
  currentThought?: string;
  suppliers?: SupplierThought[];
  currentSupplierIndex?: number;
  currentSupplierThought?: string;
}

interface SupplierThought {
  id: string;
  name: string;
  thoughts: string[];
  conclusion: 'passed' | 'failed';
  conclusionText: string;
}

interface SupplierReasoning {
  supplierName: string;
  reasoning: string;
}

interface RiskItem {
  id: number;
  displayIndex: number;
  name: string;
  scene: string;
  status: string;
  info: string;
  suggestion: string;
  mode: string;
  description: string;
  attachments: string[];
  selected?: boolean;
  satisfaction?: 'like' | 'dislike' | null;
  ruleName: string;
  reasoning: string;
  suppliers?: SupplierReasoning[];
  detailLinkText?: string;
  onDetailClick?: () => void;
}

const initialRules: RiskRule[] = [
  {
    id: 'rule_1',
    name: '分供商资质合规性校验',
    isLLM: false,
    status: 'pending'
  },
  {
    id: 'rule_2',
    name: '报名文件检测',
    isLLM: true,
    status: 'pending',
    suppliers: [
      {
        id: 'supplier_1',
        name: '华东建设有限公司',
        thoughts: [
          '正在核验营业执照、资质证书及安全生产许可证...',
          '检测完成：资质证书在有效期内，报名材料齐全。',
          '正在比对法定代表人授权委托书与报名信息...',
          '检测结论：报名文件符合要求，建议进入后续评审。'
        ],
        conclusion: 'passed',
        conclusionText: '审查结论：检测完成'
      },
      {
        id: 'supplier_2',
        name: '中源机电设备有限公司',
        thoughts: [
          '正在识别报名文件中的签章、授权及资质附件...',
          '分析发现：授权委托书缺少法定代表人签章。',
          '正在检查项目负责人社保证明与岗位资格证书...',
          '检测结论：存在1项材料缺失，建议补正后重新提交。'
        ],
        conclusion: 'failed',
        conclusionText: '审查结论：检测完成'
      },
      {
        id: 'supplier_3',
        name: '新城供应链服务有限公司',
        thoughts: [
          '正在解析报名承诺函、报价文件及关联证明材料...',
          '检测完成：文件签署完整，报价文件格式符合要求。',
          '正在校验联合体协议与成员单位资质信息...',
          '检测结论：报名文件无异常，可参与本次报名。'
        ],
        conclusion: 'passed',
        conclusionText: '审查结论：检测完成'
      }
    ],
    currentSupplierIndex: 0,
    currentSupplierThought: ''
  },
  {
    id: 'rule_3',
    name: '合同核心条款大模型深度审计',
    isLLM: true,
    status: 'pending',
    thoughts: [
      '正在提取合同文本中的付款条款、违约责任及争议解决机制...',
      '分析发现：付款比例约定为“发货后付90%，验收后付10%”，存在垫资风险。',
      '分析发现：违约金上限未约定，可能导致我方承担无限赔偿责任。',
      '正在检索集团标准合同库及历史判例...',
      '审计结论：合同条款存在2项高风险偏差，建议调整付款比例并增加违约金上限条款。'
    ],
    currentThought: ''
  },
  {
    id: 'rule_4',
    name: '关联交易与利益输送排查',
    isLLM: false,
    status: 'pending'
  },
  {
    id: 'rule_5',
    name: '历史履约信用大模型综合评估',
    isLLM: true,
    status: 'pending',
    thoughts: [
      '正在检索该分供商在全网及集团内部的历史履约记录...',
      '分析发现：近三年承接同类项目12个，其中10个优秀，2个良好，无逾期交付记录。',
      '正在分析司法诉讼及工商舆情数据...',
      '舆情分析：存在1起轻微劳动争议纠纷，已结案，无重大失信或行政处罚记录。',
      '综合评估：该分供商履约信用极佳，履约风险评级为：低风险。'
    ],
    currentThought: ''
  }
];

const initialRiskData: RiskItem[] = [
  {
    id: 0,
    displayIndex: 1,
    name: '负面清单分供商换马甲',
    scene: '风控预警',
    status: '待处置',
    info: '经大模型与关联关系排查，检测到报名供应商“钟犁sup200”疑似与负面清单中的分供商存在“换马甲”嫌疑。',
    suggestion: '建议查看关系图谱及重叠详情，核实企业高级管理人员、股东关系及历史重叠信息。',
    mode: '及时处置',
    description: '',
    attachments: [],
    selected: true,
    ruleName: '负面清单分供商“换马甲”识别规则 v1.0',
    reasoning: '系统自动比对分供商股权穿透图、高管履历及负面清单库，发现该供应商与历史黑名单企业存在高比例高管重叠与同地址注册特征。',
    suppliers: [
      {
        supplierName: '钟犁sup200',
        reasoning: '【关联特征】企业法人/董监高（含历史董监高）与负面清单企业“aaa公司”相同成员股权占比之和超过50%。\n【邮箱关联】检测到联系人邮箱与黑名单企业“bbb商贸”完全重叠。'
      }
    ]
  },
  {
    id: 1,
    displayIndex: 2,
    name: '报名附件是否满足公告要求',
    scene: '风控预警',
    status: '待处置',
    info: '经大模型深度解析，发现有3家供应商上传的报名附件不满足招标公告中的硬性资质与业绩要求。',
    suggestion: '建议进入审查依据查看各供应商的具体缺失项，并要求其限期重新上传或予以淘汰。',
    mode: '及时处置',
    description: '',
    attachments: [],
    selected: true,
    ruleName: '报名附件合规性大模型深度审查规则 v1.0',
    reasoning: '系统调用大模型对所有已报名供应商上传的PDF附件进行OCR及语义解析，并与招标公告中的“第三章 供应商资质要求”进行逐项比对，发现部分供应商存在严重缺失。',
    suppliers: [
      {
        supplierName: 'sup101 (中建某某建设有限公司)',
        reasoning: '【营业执照】有效。\n【资质证书】公告要求“建筑工程施工总承包一级”，实际上传资质为“建筑工程施工总承包二级”，资质等级不达标。\n【安全生产许可证】有效。\n【财务审计报告】缺失 2024 年度的审计报告，仅提供了 2023 年度报告。'
      },
      {
        supplierName: 'sup105 (北京某某装饰工程有限公司)',
        reasoning: '【营业执照】有效。\n【资质证书】未上传“建筑装修装饰工程专业承包一级”证书，仅上传了营业执照。\n【业绩证明】公告要求“近三年具有单项合同额 500 万以上的同类项目业绩不少于 2 个”，实际上传的业绩合同额分别为 320 万和 410 万，均未达到 500 万门槛。'
      },
      {
        supplierName: 'sup203 (上海某某实业发展有限公司)',
        reasoning: '【营业执照】有效。\n【安全生产许可证】已于 2026 年 6 月 30 日到期，当前处于失效状态，不满足“在有效期内”的硬性要求。\n【信誉要求】经大模型检索信用中国，该企业无严重失信记录。'
      }
    ]
  },
  {
    id: 2,
    displayIndex: 3,
    name: '法人失信被执行人',
    scene: '风控预警',
    status: '待处置',
    info: '经系统检测，以下供应商法人存在失信被执行记录：sup101 (李华)，请核实风险。',
    suggestion: '建议根据组织管理要求进行处理，必要时要求供应商提供合规证明。',
    mode: '及时处置',
    description: '',
    attachments: [],
    selected: false,
    ruleName: '法人信用准入限制规则 v2.1',
    reasoning: '【数据检索】系统自动检索到供应商 sup101 的法人代表为“李华”。\n【外部校验】调用最高人民法院失信被执行人名单接口，匹配到身份证号与姓名一致的失信记录，立案时间为 2025-11-12，执行标的为 1,200,000 元。\n【风险评估】法人代表存在失信记录，可能导致企业合同履约风险、资金链断裂风险，属于高风险事件。\n【规则判定】触发“法人失信一票否决/限制准入”规则，处置状态设为“待处置”，处置模式为“及时处置”。'
  },
  {
    id: 3,
    displayIndex: 4,
    name: '工商状态变更预警',
    scene: '风控预警',
    status: '待处置',
    info: '发现供应商 sup105 工商状态变更为“经营异常”，可能影响履约能力。',
    suggestion: '核实异常原因，评估对当前采购项目的风险影响。',
    mode: '事后处置',
    description: '',
    attachments: [],
    selected: false,
    ruleName: '工商存续状态实时监控规则 v1.0',
    reasoning: '【数据检索】监控到供应商 sup105 的工商登记状态发生变更。\n【变更识别】状态由“存续”变更为“经营异常”，异常原因为“未按规定期限公示年度报告”。\n【风险评估】经营异常可能意味着企业内部管理混乱或经营出现困难，会间接影响采购履约。\n【规则判定】触发“工商状态异常预警”规则，处置状态设为“待处置”，处置模式为“事后处置”。'
  },
  {
    id: 4,
    displayIndex: 5,
    name: '信息重叠',
    scene: '风控预警',
    status: '待处置',
    info: '当前供应商存在多项信息重叠，是否继续当前操作？涉及信息重叠的供应商如下：sup203, 彭才林, 钟莉, sup201, sup300, sup247, sup330, sup332',
    suggestion: '建议根据组织管理要求进行处理',
    mode: '事后处置',
    description: '',
    attachments: [],
    selected: false,
    ruleName: '关联关系与信息重叠审计规则 v3.2',
    reasoning: '【关系挖掘】分析当前投标供应商的工商背景、历史投标记录、联系电话、邮箱及IP地址。\n【重叠识别】发现 sup203, 彭才林, 钟莉, sup201, sup300, sup247, sup330, sup332 之间存在电话号码重叠、IP地址重叠或高管交叉任职。\n【风险评估】存在围标、串标或关联交易的潜在风险，严重违反招投标公平公正原则。\n【规则判定】触发“多方信息重叠预警”规则，处置状态设为“待处置”，处置模式为“事后处置”。'
  },
  {
    id: 5,
    displayIndex: 6,
    name: '严重失信违法企业',
    scene: '风控预警',
    status: '待处置',
    info: '有1个供应商存在严重违法或失信被执行人，如下：sup330;',
    suggestion: '建议根据组织管理要求进行处理',
    mode: '事后处置',
    description: '',
    attachments: [],
    selected: false,
    ruleName: '企业严重违法失信名单筛查规则 v2.0',
    reasoning: '【数据检索】检索供应商 sup330 的企业信用信息公示系统记录。\n【违法识别】该企业被列入“严重违法失信企业名单（黑名单）”。\n【风险评估】严重违法失信企业在法律、行政、金融等多方面受到联合惩戒，履约能力极低，合作风险极大。\n【规则判定】触发“严重失信违法企业禁入”规则，处置状态设为“待处置”，处置模式为“事后处置”。'
  },
  {
    id: 6,
    displayIndex: 7,
    name: '企业经营状态异常',
    scene: '风控预警',
    status: '待处置',
    info: '有2个供应商企业经营状态异常，如下：sup247, sup330;',
    suggestion: '建议根据组织管理要求进行处理',
    mode: '事后处置',
    description: '',
    attachments: [],
    selected: false,
    ruleName: '企业经营异常名录筛查规则 v1.5',
    reasoning: '【数据检索】检索供应商 sup247 和 sup330 的最新工商数据。\n【异常识别】两家企业均被列入工商部门的经营异常名录。\n【风险评估】经营异常可能导致企业无法正常开具发票、账户被冻结等，影响项目进度。\n【规则判定】触发“企业经营状态异常预警”规则，处置状态设为“待处置”，处置模式为“事后处置”。'
  },
  {
    id: 7,
    displayIndex: 8,
    name: '招标企业资质校验',
    scene: '风控预警',
    status: '待处置',
    info: '您勾选的供应商有2个不满足企业资质承接范围校验，如下：彭才林, sup300; 查看企业资质承接范围校验规则',
    suggestion: '建议根据组织管理要求进行处理',
    mode: '及时处置',
    description: '',
    attachments: [],
    selected: false,
    ruleName: '招标资质与承接范围匹配规则 v4.0',
    reasoning: '【资质比对】读取本次招标项目要求的资质等级（如：建筑工程施工总承包一级）。\n【供应商校验】校验供应商 彭才林 和 sup300 的资质证书。\n【不匹配识别】发现其资质等级为二级，或承接范围不包含本项目所属专业。\n【风险评估】资质不符属于合规性硬伤，可能导致项目无法通过政府审批或面临安全质量风险。\n【规则判定】触发“资质不满足承接范围”规则，处置状态设为“待处置”，处置模式为“及时处置”。'
  }
];

const ComplianceModal = forwardRef<ComplianceHandle, ComplianceProps>((props, ref) => {
  const { onDetectionComplete, showDisposalFields = true, riskData: externalRiskData } = props;
  const [detectionVisible, setDetectionVisible] = useState(false);
  const [warningVisible, setWarningVisible] = useState(false);

  // 检测中规则状态
  const [rules, setRules] = useState<RiskRule[]>([]);
  const [activeRuleIndex, setActiveRuleIndex] = useState<number>(0);
  const [expandedRuleIds, setExpandedRuleIds] = useState<string[]>([]);
  const [expandedSupplierIds, setExpandedSupplierIds] = useState<string[]>([]);

  // 风控结果弹窗状态
  const [riskData, setRiskData] = useState<RiskItem[]>(externalRiskData || initialRiskData);

  useEffect(() => {
    if (externalRiskData) {
      setRiskData(externalRiskData);
    }
  }, [externalRiskData]);
  const [toast, setToast] = useState<string | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean; itemId: number | null }>({
    isOpen: false,
    itemId: null
  });
  const [problemType, setProblemType] = useState<string>('');
  const [reasoningModal, setReasoningModal] = useState<{ isOpen: boolean; item: RiskItem | null }>({
    isOpen: false,
    item: null
  });
  const [expandedSuppliers, setExpandedSuppliers] = useState<number[]>([0]);

  const initRules = () => {
    setRules(JSON.parse(JSON.stringify(initialRules)));
    setActiveRuleIndex(0);
    setExpandedRuleIds([]);
    setExpandedSupplierIds([]);
  };

  useImperativeHandle(ref, () => ({
    startFlow: () => {
      setDetectionVisible(true);
      initRules();
    },
    showDetection: () => {
      setDetectionVisible(true);
      initRules();
    },
    hideDetection: () => setDetectionVisible(false),
    showRiskWarning: () => setWarningVisible(true),
    hideRiskWarning: () => setWarningVisible(false)
  }));

  // 执行检测流
  useEffect(() => {
    if (!detectionVisible || rules.length === 0) return;

    if (activeRuleIndex >= rules.length) {
      // 全部规则执行完毕，关闭检测弹窗，打开风控提醒弹窗
      const timer = setTimeout(() => {
        setDetectionVisible(false);
        setWarningVisible(true);
        if (props.onDetectionComplete) {
          props.onDetectionComplete();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }

    const currentRule = rules[activeRuleIndex];

    if (currentRule.status === 'pending') {
      setRules(prev => {
        const newRules = [...prev];
        if (newRules[activeRuleIndex]) {
          newRules[activeRuleIndex] = { ...newRules[activeRuleIndex], status: 'loading' };
        }
        return newRules;
      });
      return;
    }

    if (currentRule.status === 'loading') {
      const timer = setTimeout(() => {
        const nextStatus = currentRule.isLLM ? 'thinking' : 'passed';
        setRules(prev => {
          const newRules = [...prev];
          if (newRules[activeRuleIndex]) {
            newRules[activeRuleIndex] = { ...newRules[activeRuleIndex], status: nextStatus };
          }
          return newRules;
        });

        if (!currentRule.isLLM) {
          setTimeout(() => {
            setActiveRuleIndex(prev => prev + 1);
          }, 800);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }

    if (currentRule.status === 'thinking' && (currentRule.thoughts || currentRule.suppliers)) {
      let thoughtIndex = 0;
      let charIndex = 0;
      let currentText = '';
      let supplierIndex = 0;
      let timerId: any = null;

      if (currentRule.suppliers?.[supplierIndex]) {
        const supplierId = currentRule.suppliers[supplierIndex].id;
        setExpandedSupplierIds(prev => prev.includes(supplierId) ? prev : [...prev, supplierId]);
      }

      const runStream = () => {
        if (!detectionVisible) return;
        const supplier = currentRule.suppliers?.[supplierIndex];
        const thoughtsList = supplier ? supplier.thoughts : currentRule.thoughts!;

        if (thoughtIndex >= thoughtsList.length) {
          if (supplier && supplierIndex < currentRule.suppliers!.length - 1) {
            supplierIndex++;
            thoughtIndex = 0;
            charIndex = 0;
            currentText = '';
            const nextSupplierId = currentRule.suppliers![supplierIndex].id;
            setExpandedSupplierIds(prev => prev.includes(nextSupplierId) ? prev : [...prev, nextSupplierId]);
            setRules(prev => {
              const newRules = [...prev];
              if (newRules[activeRuleIndex]) {
                newRules[activeRuleIndex] = {
                  ...newRules[activeRuleIndex],
                  currentSupplierIndex: supplierIndex,
                  currentSupplierThought: ''
                };
              }
              return newRules;
            });
            timerId = setTimeout(runStream, 300);
            return;
          }

          const finalStatus = currentRule.suppliers
            ? currentRule.suppliers.some(supplier => supplier.conclusion === 'failed') ? 'failed' : 'passed'
            : currentRule.id === 'rule_3' ? 'failed' : 'passed';

          setRules(prev => {
            const newRules = [...prev];
            if (newRules[activeRuleIndex]) {
              newRules[activeRuleIndex] = {
                ...newRules[activeRuleIndex],
                status: finalStatus,
                currentSupplierThought: currentText
              };
            }
            return newRules;
          });

          return;
        }

        const targetLine = thoughtsList[thoughtIndex];

        if (charIndex < targetLine.length) {
          currentText += targetLine[charIndex];

          setRules(prev => {
            const newRules = [...prev];
            if (newRules[activeRuleIndex]) {
              newRules[activeRuleIndex] = supplier
                ? { ...newRules[activeRuleIndex], currentSupplierIndex: supplierIndex, currentSupplierThought: currentText }
                : { ...newRules[activeRuleIndex], currentThought: currentText };
            }
            return newRules;
          });

          charIndex++;
          timerId = setTimeout(runStream, 20);
        } else {
          currentText += '\n';
          thoughtIndex++;
          charIndex = 0;
          timerId = setTimeout(runStream, 300);
        }
      };

      timerId = setTimeout(runStream, 300);
      return () => clearTimeout(timerId);
    }

    if (currentRule.isLLM && (currentRule.status === 'passed' || currentRule.status === 'failed')) {
      const timer = setTimeout(() => {
        setActiveRuleIndex(prev => prev + 1);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [detectionVisible, activeRuleIndex, rules[activeRuleIndex]?.status]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const handleSatisfaction = (id: number, type: 'like' | 'dislike') => {
    setRiskData(prev => prev.map(item => {
      if (item.id === id) {
        const newValue = item.satisfaction === type ? null : type;
        if (newValue) {
          showToast(type === 'like' ? '感谢您的好评！' : '感谢您的反馈，我们会持续改进。');
        }
        return { ...item, satisfaction: newValue };
      }
      return item;
    }));
  };

  const toggleSelect = (id: number) => {
    setRiskData(prev => prev.map(item =>
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const handleToggleSupplier = (index: number) => {
    setExpandedSuppliers(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleOpenReasoning = (item: RiskItem) => {
    setExpandedSuppliers([0]);
    setReasoningModal({ isOpen: true, item });
  };

  const selectedCount = riskData.filter(item => item.selected).length;

  const renderRuleItem = (rule: RiskRule) => {
    let statusClass = 'rule-pending';
    let icon = <ClockCircleOutlined className="rule-icon-pending" />;
    let statusLabel = null;

    if (rule.status === 'passed' || rule.status === 'failed') {
      statusClass = 'rule-passed';
      icon = <CheckCircleOutlined className="rule-icon-passed" />;
      statusLabel = <span className="status-label passed">检测完成</span>;
    } else if (rule.status === 'loading' || rule.status === 'thinking') {
      statusClass = 'rule-active';
      icon = <LoadingOutlined className="rule-icon-active" spin />;
    }

    return (
      <div key={rule.id} className={`rule-item-wrapper ${statusClass}`}>
        <div className="rule-item-header">
          <div className="rule-icon-box">{icon}</div>
          <div className="rule-info">
            <span className="rule-name">{rule.name}</span>
            {statusLabel}
            {rule.isLLM && <span className="llm-tag">AI大模型</span>}
          </div>
        </div>

        {rule.isLLM && (rule.status === 'thinking' || rule.status === 'passed' || rule.status === 'failed') && (() => {
          const isThinking = rule.status === 'thinking';
          const isExpanded = isThinking || expandedRuleIds.includes(rule.id);
          return (
            <div className="llm-thought-container">
              {!isThinking && (
                <button
                  type="button"
                  className="thought-toggle"
                  onClick={() => setExpandedRuleIds(prev => isExpanded ? prev.filter(id => id !== rule.id) : [...prev, rule.id])}
                >
                  {isExpanded ? <DownOutlined /> : <RightOutlined />}
                  <span>{isExpanded ? '收起思考过程' : '查看思考过程'}</span>
                </button>
              )}
              {isExpanded && (
                <div className="thought-detail">
                  <div className="thought-header">
                    <span className="thought-dot"></span>
                    <span>{isThinking ? 'AI 思考分析中...' : 'AI 思考分析完成'}</span>
                  </div>
                  {rule.suppliers ? (
                    <div className="supplier-thought-list">
                      {rule.suppliers.map((supplier, supplierIndex) => {
                        const isCurrentSupplier = rule.currentSupplierIndex === supplierIndex;
                        const isCompletedSupplier = rule.status !== 'thinking' || (rule.currentSupplierIndex ?? 0) > supplierIndex;
                        const isSupplierExpanded = expandedSupplierIds.includes(supplier.id);
                        const content = isCurrentSupplier && rule.status === 'thinking'
                          ? rule.currentSupplierThought
                          : isCompletedSupplier
                            ? supplier.thoughts.join('\n')
                            : '等待检测中...';
                        return (
                          <div key={supplier.id} className={`supplier-thought-item ${isCurrentSupplier && isThinking ? 'is-thinking' : ''}`}>
                            <button
                              type="button"
                              className="supplier-thought-toggle"
                              onClick={() => setExpandedSupplierIds(prev => isSupplierExpanded ? prev.filter(id => id !== supplier.id) : [...prev, supplier.id])}
                            >
                              <span className="supplier-toggle-main">
                                {isSupplierExpanded ? <DownOutlined /> : <RightOutlined />}
                                <span className="supplier-name">{supplier.name}</span>
                              </span>
                              {isCompletedSupplier && (
                                <span className="supplier-conclusion passed">
                                  检测完成
                                </span>
                              )}
                            </button>
                            {isSupplierExpanded && <div className="thought-content-box">{content}</div>}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="thought-content-box">
                      {rule.currentThought || (rule.thoughts && rule.thoughts.join('\n'))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    );
  };

  return (
    <>
      {/* 数字合规官检测中 Modal */}
      <Modal
        title={null}
        open={detectionVisible}
        footer={null}
        closable={true}
        onCancel={() => setDetectionVisible(false)}
        width={800}
        centered
        className="compliance-modal"
        mask={{ closable: false }}
      >
        <div className="compliance-modal-content">
          <div className="compliance-header">
            <h2>合规检测</h2>
            <Button
              size="small"
              type="link"
              onClick={() => {
                setDetectionVisible(false);
                setWarningVisible(true);
              }}
              style={{ padding: 0 }}
            >
              跳过演示
            </Button>
          </div>

          <div className="compliance-tips-section">
            <h1 className="main-tip">数字合规官正在检测中，请稍等……</h1>
            <p className="sub-tip">开始检测时间：2026-08-21 15:53:03，系统正在进行业务风险分析，预计10分钟后结束</p>
            <p className="warning-tip">检测可能需要较长时间，请耐心等待(最晚2026-08-21 15:53:03结束)</p>
          </div>

          <div className="compliance-body">
            <div className="compliance-left-image">
              <img
                src={complianceImage}
                alt="数字合规官检测中"
                className="officer-img"
              />
            </div>
            <div className="compliance-right-rules">
              <div className="rules-timeline">
                <div className="timeline-line-vertical"></div>
                {rules.map(renderRuleItem)}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* 风控预警结果 Modal */}
      {warningVisible && (
        <div className="risk-warning-modal-overlay">
          <div className="risk-warning-modal-container">
            <div className="risk-warning-modal-header">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-medium text-text text-base">风控预警提醒</span>
              </div>
              <button onClick={() => setWarningVisible(false)} className="text-text-tertiary hover:text-text transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="risk-warning-modal-body">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-text-secondary">
                  本次未通过 <span className="text-orange-500 font-medium">{riskData.length}</span> 项风险预警，详情如下：
                </div>
                <button className="flex items-center gap-1 text-primary text-sm font-medium border border-primary/20 px-3 py-1 rounded-sm hover:bg-primary/5 transition-colors">
                  <Download className="w-4 h-4" />
                  下载风险明细
                </button>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-sm">
                <table className="risk-table">
                  <thead>
                    <tr>
                      {showDisposalFields && (
                        <th className="w-[48px] text-center">
                          <input type="checkbox" className="rounded-sm border-gray-300" />
                        </th>
                      )}
                      <th className="w-[60px] text-center">序号</th>
                      <th className="w-[180px]">风险预警名称</th>
                      <th className="w-[140px]">检测场景</th>
                      {showDisposalFields && <th className="w-[100px]">处置状态</th>}
                      <th className="w-[400px]">风险预警信息</th>
                      <th className="w-[100px]">审查依据</th>
                      <th className="w-[280px]">处置建议</th>
                      {showDisposalFields && <th className="w-[120px]">处置模式</th>}
                      {showDisposalFields && <th className="w-[320px]"><span className="text-red-500 mr-1">*</span>处置说明</th>}
                      {showDisposalFields && <th className="w-[160px]">处置附件</th>}
                      <th className="w-[140px]">反馈评价</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riskData.map((item) => (
                      <tr key={item.id} className={item.selected ? 'bg-blue-50/20' : ''}>
                        {showDisposalFields && (
                          <td className="text-center">
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={() => toggleSelect(item.id)}
                              className="rounded-sm border-gray-300 text-primary focus:ring-primary"
                            />
                          </td>
                        )}
                        <td className="text-center text-text-secondary">{item.displayIndex}</td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <span className="status-tag status-tag-warning shrink-0">预警</span>
                            <span className="text-text font-medium leading-snug">{item.name}</span>
                          </div>
                        </td>
                        <td className="text-text-secondary">{item.scene}</td>
                        {showDisposalFields && (
                          <td>
                            <span className={item.status === '无需处置' ? 'text-text-tertiary font-medium' : 'text-text font-medium'}>
                              {item.status}
                            </span>
                          </td>
                        )}
                        <td>
                          <div className="text-text-secondary leading-relaxed text-xs break-words pr-4">
                            {item.info}
                            {item.detailLinkText && (
                              <button
                                onClick={item.onDetailClick}
                                className="text-primary hover:underline ml-1 font-medium"
                              >
                                {item.detailLinkText}
                              </button>
                            )}
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={() => handleOpenReasoning(item)}
                            className="text-primary hover:underline text-xs font-medium"
                          >
                            {item.suppliers ? '查看详情' : '查看依据'}
                          </button>
                        </td>
                        <td className="text-text-secondary leading-relaxed text-xs pr-4">{item.suggestion}</td>
                        {showDisposalFields && <td className="text-text-secondary text-xs">{item.mode}</td>}
                        {showDisposalFields && (
                          <td className="pr-4">
                            {item.status === '无需处置' ? (
                              <span className="text-text-tertiary">无需处置</span>
                            ) : (
                              <div className="relative">
                                <textarea
                                  placeholder="请输入处置说明"
                                  className="w-full border border-gray-200 rounded-sm p-2 text-xs h-20 focus:border-primary focus:outline-none resize-none bg-gray-50/30"
                                />
                                <span className="absolute bottom-1 right-2 text-[10px] text-text-tertiary bg-white/80 px-1">0 / 1000</span>
                              </div>
                            )}
                          </td>
                        )}
                        {showDisposalFields && (
                          <td>
                            {item.status === '无需处置' ? (
                              <span className="text-text-tertiary">无需处置</span>
                            ) : (
                              <button className="upload-btn">
                                <Plus className="w-3 h-3" />
                                添加附件
                              </button>
                            )}
                          </td>
                        )}
                        <td>
                          <div className="flex items-center gap-2 relative">
                            <button
                              onClick={() => handleSatisfaction(item.id, 'like')}
                              className={`feedback-icon-btn ${item.satisfaction === 'like' ? 'active-like' : 'text-text-tertiary'}`}
                              title="满意"
                            >
                              <ThumbsUp className={`w-4 h-4 ${item.satisfaction === 'like' ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={() => handleSatisfaction(item.id, 'dislike')}
                              className={`feedback-icon-btn ${item.satisfaction === 'dislike' ? 'active-dislike' : 'text-text-tertiary'}`}
                              title="不满意"
                            >
                              <ThumbsDown className={`w-4 h-4 ${item.satisfaction === 'dislike' ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={() => setFeedbackModal({ isOpen: true, itemId: item.id })}
                              className="flex items-center gap-0.5 text-primary hover:underline text-xs ml-1"
                            >
                              <MessageSquare className="w-3 h-3" />
                              反馈
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="risk-warning-modal-footer">
                <div className="bg-gray-50 px-3 py-1.5 rounded-sm text-sm text-text-secondary border border-gray-100">
                  已选 <span className="font-medium text-text">{selectedCount}</span> 条
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setWarningVisible(false)}
                    className="action-btn action-btn-ghost px-6"
                  >
                    取消
                  </button>
                  <button className="action-btn action-btn-primary bg-blue-500 px-6">
                    查看风险解析报告
                  </button>
                  <button
                    onClick={() => setWarningVisible(false)}
                    className="action-btn action-btn-primary px-8"
                  >
                    {showDisposalFields ? '提交审核' : '确定'}
                  </button>
                </div>
              </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10001,
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              padding: '10px 20px',
              borderRadius: '4px',
              boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              color: 'rgba(0, 0, 0, 0.88)'
            }}
          >
            <CheckCircle2 style={{ width: '16px', height: '16px', color: '#52c41a' }} />
            {toast}
          </div>
        </div>
      )}

      {/* 审查依据 Modal */}
      {reasoningModal.isOpen && reasoningModal.item && (
        <div
          className="feedback-modal-overlay"
          onClick={() => setReasoningModal({ isOpen: false, item: null })}
        >
          <div
            className="feedback-modal-container"
            style={{
              maxWidth: reasoningModal.item.suppliers ? '750px' : '500px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <span className="font-medium text-text text-base">审查依据</span>
              <button
                onClick={() => setReasoningModal({ isOpen: false, item: null })}
                className="text-text-tertiary hover:text-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh] bg-white flex-1">
              {reasoningModal.item.suppliers ? (
                <div className="space-y-4">
                  {reasoningModal.item.suppliers.map((sup, idx) => {
                    const isExpanded = expandedSuppliers.includes(idx);
                    return (
                      <div key={idx} className="border border-gray-200 rounded-sm overflow-hidden">
                        <div
                          onClick={() => handleToggleSupplier(idx)}
                          className="px-4 py-3 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100/80 transition-colors select-none"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-4 bg-primary rounded-full" />
                            <span className="text-sm font-medium text-text">{sup.supplierName}</span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-text-tertiary" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-text-tertiary" />
                          )}
                        </div>
                        {isExpanded && (
                          <div className="p-4 bg-white border-t border-gray-100 text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
                            {sup.reasoning}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-text leading-relaxed whitespace-pre-wrap">
                  {reasoningModal.item.reasoning}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end bg-gray-50/50 shrink-0">
              <button
                onClick={() => setReasoningModal({ isOpen: false, item: null })}
                className="action-btn action-btn-primary px-8"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 反馈 Modal */}
      {feedbackModal.isOpen && (
        <div
          className="feedback-modal-overlay"
          onClick={() => setFeedbackModal({ isOpen: false, itemId: null })}
        >
          <div
            className="feedback-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center">
                <div style={{ width: '4px', height: '16px', backgroundColor: '#1677ff', borderRadius: '2px', marginRight: '8px' }} />
                <span className="font-medium text-text text-base">问题反馈</span>
              </div>
              <button
                onClick={() => setFeedbackModal({ isOpen: false, itemId: null })}
                className="text-text-tertiary hover:text-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh] bg-white flex-1">
              <div className="mb-6">
                <label className="block text-sm font-medium text-text mb-3">
                  <span className="text-red-500 mr-1">*</span>请选择您遇到的问题类型
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    '预警信息不准确',
                    '处置建议不合理',
                    '规则逻辑有误',
                    '数据同步延迟',
                    '其他问题'
                  ].map(option => (
                    <div
                      key={option}
                      onClick={() => setProblemType(option)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        border: '1px solid #d9d9d9',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        backgroundColor: problemType === option ? '#e6f4ff' : '#fff',
                        borderColor: problemType === option ? '#1677ff' : '#d9d9d9'
                      }}
                    >
                      <span style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.88)' }}>{option}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-text mb-3">
                  问题说明
                </label>
                <textarea
                  placeholder="请详细描述您遇到的问题，以便我们更好地为您解决"
                  className="w-full border border-gray-200 rounded-sm p-3 text-sm h-32 focus:border-primary focus:outline-none resize-none bg-gray-50/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-3">
                  附件上传
                </label>
                <div className="border border-dashed border-gray-200 rounded-sm p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors">
                  <Paperclip className="w-6 h-6 text-text-tertiary" />
                  <span className="text-xs text-text-tertiary">点击或将文件拖拽到此处上传</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50 shrink-0">
              <button
                onClick={() => setFeedbackModal({ isOpen: false, itemId: null })}
                className="action-btn action-btn-ghost px-6"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (!problemType) {
                    showToast('请选择问题类型');
                    return;
                  }
                  setFeedbackModal({ isOpen: false, itemId: null });
                  showToast('提交成功');
                  setProblemType('');
                }}
                className="action-btn action-btn-primary px-8"
              >
                提交反馈
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default ComplianceModal;
