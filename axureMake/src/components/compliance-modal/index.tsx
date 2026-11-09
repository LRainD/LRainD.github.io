/**
 * @name 合规风险处理组件
 * @mode component
 *
 * 组件说明：
 * 包含“数字合规官检测中”的加载弹窗以及“风控预警”的处理结果弹窗。
 */

import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { Modal, Button, Popover, Input } from 'antd';
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
import { initialRiskData, initialRules, type RiskItem, type RiskRule } from './mock';
import './style.css';

export interface ComplianceHandle {
  startFlow: (options?: { withInitialData?: boolean }) => void;
  showDetection: (options?: { withInitialData?: boolean }) => void;
  hideDetection: () => void;
  /**
   * 打开风控预警弹窗
   * @param withInitialData 是否展示「初次判定数据」列
   * @param withReleaseActions 是否展示右侧固定「操作」列（解除风险）。
   *   仅在「右侧 AI 浮窗」入口传入；「提交审批」入口不传，避免在审批提交链路上出现解除入口。
   */
  showRiskWarning: (options?: { withInitialData?: boolean; withReleaseActions?: boolean }) => void;
  hideRiskWarning: () => void;
}

export interface ComplianceProps {
  onDetectionComplete?: () => void;
  /** 是否需要展示处置相关操作（勾选框、处置状态、处置模式、处置说明、处置附件），默认为 true */
  showDisposalFields?: boolean;
  /** 是否展示风险状态列，默认为 false（「当前数据描述」「初次判定数据」列由打开入口的 withInitialData 决定） */
  showReleaseFields?: boolean;
  /** 点击「跳过演示」时是否弹出演示分支选择（有未解除 / 无未解除），默认为 false */
  demoBranchSelect?: boolean;
  /** 自定义风险数据 */
  riskData?: RiskItem[];
}

const ComplianceModal = forwardRef<ComplianceHandle, ComplianceProps>((props, ref) => {
  const { onDetectionComplete, showDisposalFields = true, showReleaseFields = false, demoBranchSelect = false, riskData: externalRiskData } = props;
  const [detectionVisible, setDetectionVisible] = useState(false);
  const [warningVisible, setWarningVisible] = useState(false);
  /** 演示分支：有未解除（全部数据）/ 无未解除（仅已解除数据） */
  const [branchVisible, setBranchVisible] = useState(false);
  const [demoBranch, setDemoBranch] = useState<'has-unreleased' | 'all-released'>('has-unreleased');
  /** 是否展示「初次判定数据」列，由打开弹窗的入口决定 */
  const [showInitialData, setShowInitialData] = useState(false);
  /** 是否展示右侧固定「操作」列（解除风险），仅右侧 AI 浮窗入口开启 */
  const [releaseActionsVisible, setReleaseActionsVisible] = useState(false);

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
  const [problemDesc, setProblemDesc] = useState<string>('');
  /** 解除风险弹窗 */
  const [releaseModal, setReleaseModal] = useState<{ isOpen: boolean; item: RiskItem | null }>({
    isOpen: false,
    item: null
  });
  const [releaseNote, setReleaseNote] = useState('');
  const [releaseError, setReleaseError] = useState('');
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
    startFlow: (options) => {
      setShowInitialData(!!options?.withInitialData);
      setReleaseActionsVisible(false);
      setDemoBranch('has-unreleased');
      setDetectionVisible(true);
      initRules();
    },
    showDetection: (options) => {
      setShowInitialData(!!options?.withInitialData);
      setReleaseActionsVisible(false);
      setDemoBranch('has-unreleased');
      setDetectionVisible(true);
      initRules();
    },
    hideDetection: () => setDetectionVisible(false),
    showRiskWarning: (options) => {
      setShowInitialData(!!options?.withInitialData);
      setReleaseActionsVisible(!!options?.withReleaseActions);
      setDemoBranch('has-unreleased');
      setBranchVisible(false);
      setWarningVisible(true);
    },
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

  /** 风险状态展示顺序：未解除 → 已解除 → 未命中 → 计算中 */
  const releaseStatusOrder: Record<string, number> = {
    未解除: 0,
    已解除: 1,
    未命中: 2,
    计算中: 3
  };

  /** 风险状态文字颜色：按严重程度递减 */
  const releaseStatusClass: Record<string, string> = {
    未解除: 'text-[#e5484d] font-medium',
    已解除: 'text-[#52a320]',
    未命中: 'text-text-tertiary',
    计算中: 'text-[#f5a623]'
  };

  const getReleaseStatus = (item: RiskItem) => item.releaseStatus || '未解除';

  /** 风险状态展示文案：「计算中」按「计算超时」展示 */
  const getReleaseStatusText = (item: RiskItem) => {
    const status = getReleaseStatus(item);
    return status === '计算中' ? '计算超时' : status;
  };

  /** 按演示分支过滤后的预警数据：无未解除时仅展示已解除数据 */
  const filteredRiskData =
    demoBranch === 'all-released'
      ? riskData.filter(item => item.releaseStatus === '已解除')
      : riskData;

  /** 按风险状态严重程度排序展示 */
  const displayRiskData = [...filteredRiskData].sort(
    (a, b) => releaseStatusOrder[getReleaseStatus(a)] - releaseStatusOrder[getReleaseStatus(b)]
  );

  /** 风险状态为「未命中」「计算超时」时，其余列展示占位符（当前数据描述列仅右侧 AI 浮窗入口展示） */
  const isEmptyRiskRow = (item: RiskItem) =>
    item.releaseStatus === '未命中' || item.releaseStatus === '计算中';

  /** 是否为「合规自查」场景下的大模型规则（只有这类规则允许合规官解除风险，用于纠正模型误判） */
  const isSelfCheckLLM = (item: RiskItem) => !!item.isLLM && (item.scene || '').includes('合规自查');

  /** 是否可执行「解除风险」 */
  const canReleaseRisk = (item: RiskItem) =>
    !isEmptyRiskRow(item) && item.releaseStatus !== '已解除' && isSelfCheckLLM(item);

  /** 当前时间（YYYY-MM-DD HH:mm:ss） */
  const nowText = () => {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(
      d.getMinutes()
    )}:${p(d.getSeconds())}`;
  };

  /** 确认解除风险：必须填写解除说明 */
  const handleConfirmRelease = () => {
    const item = releaseModal.item;
    if (!item) return;
    if (!releaseNote.trim()) {
      setReleaseError('请填写解除说明，便于后续审计追溯');
      return;
    }
    setRiskData(prev =>
      prev.map(row =>
        row.id === item.id
          ? {
              ...row,
              releaseStatus: '已解除' as const,
              releaseInfo: { note: releaseNote.trim(), operator: 'jctest1（合规官）', time: nowText() }
            }
          : row
      )
    );
    setReleaseModal({ isOpen: false, item: null });
    setReleaseNote('');
    setReleaseError('');
    showToast('风险已解除');
  };

  /** 风险检测统计 */
  const totalCount = displayRiskData.length;
  const calculatingCount = displayRiskData.filter(item => item.releaseStatus === '计算中').length;
  const missedCount = displayRiskData.filter(item => item.releaseStatus === '未命中').length;
  const releasedCount = displayRiskData.filter(item => item.releaseStatus === '已解除').length;
  const unreleasedCount = displayRiskData.filter(item => item.releaseStatus === '未解除').length;
  /** 解除比例（已解除 / 检测项总数） */
  const releasedRate = totalCount ? Math.round((releasedCount / totalCount) * 100) : 0;

  const handleSkipDemo = () => {
    if (demoBranchSelect) {
      setBranchVisible(true);
      return;
    }
    setDetectionVisible(false);
    setWarningVisible(true);
  };

  const handleChooseBranch = (branch: 'has-unreleased' | 'all-released') => {
    setDemoBranch(branch);
    setBranchVisible(false);
    setDetectionVisible(false);
    setWarningVisible(true);
  };

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
              onClick={handleSkipDemo}
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

      {/* 演示分支选择 Modal */}
      <Modal
        title="选择演示分支"
        open={branchVisible}
        footer={null}
        width={480}
        centered
        onCancel={() => setBranchVisible(false)}
        className="compliance-branch-modal"
        mask={{ closable: false }}
      >
        <p className="branch-tip">请选择本次演示的风控预警数据场景：</p>
        <div className="branch-options">
          <button
            type="button"
            className="branch-option"
            onClick={() => handleChooseBranch('has-unreleased')}
          >
            <span className="branch-option-title">有未解除</span>
            <span className="branch-option-desc">预警数据中包含「未解除」项，展示完整预警列表</span>
          </button>
          <button
            type="button"
            className="branch-option"
            onClick={() => handleChooseBranch('all-released')}
          >
            <span className="branch-option-title">无未解除</span>
            <span className="branch-option-desc">所有预警均为「已解除」状态，仅展示已解除数据</span>
          </button>
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
                  本次共完成 <span className="text-orange-500 font-medium">{totalCount}</span> 个业务风险项检测，
                  <span className="text-orange-500 font-medium">{calculatingCount}</span> 个检测项计算超时，
                  <span className="text-orange-500 font-medium">{missedCount}</span> 个检测项未命中，
                  <span className="text-orange-500 font-medium">{releasedCount}</span> 个检测项已解除，
                  <span className="text-orange-500 font-medium">{unreleasedCount}</span> 个检测项未解除，解除比例 {releasedRate}%。
                </div>
                <button className="flex items-center gap-1 text-primary text-sm font-medium border border-primary/20 px-3 py-1 rounded-sm hover:bg-primary/5 transition-colors">
                  <Download className="w-4 h-4" />
                  下载风险明细
                </button>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-sm">
                <table
                  className={`risk-table ${
                    showReleaseFields
                      ? showInitialData
                        ? 'risk-table-with-release-initial'
                        : 'risk-table-with-release'
                      : ''
                  } ${releaseActionsVisible ? 'risk-table-has-actions' : ''}`}
                >
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
                      {showReleaseFields && <th className="w-[100px] text-center">风险状态</th>}
                      {showDisposalFields && <th className="w-[100px]">处置状态</th>}
                      <th className="w-[400px]">风险预警信息</th>
                      {showReleaseFields && showInitialData && <th className="w-[260px]">当前数据描述</th>}
                      {showReleaseFields && showInitialData && <th className="w-[260px]">初次判定数据</th>}
                      <th className="w-[100px]">审查依据</th>
                      <th className="w-[280px]">处置建议</th>
                      {showDisposalFields && <th className="w-[120px]">处置模式</th>}
                      {showDisposalFields && <th className="w-[320px]"><span className="text-red-500 mr-1">*</span>处置说明</th>}
                      {showDisposalFields && <th className="w-[160px]">处置附件</th>}
                      <th className="w-[140px]">反馈评价</th>
                      {releaseActionsVisible && (
                        <th className="w-[150px] risk-col-action">操作</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {displayRiskData.map((item, index) => (
                      <tr key={item.id} className={item.selected ? 'bg-blue-50/20 risk-row-selected' : ''}>
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
                        <td className="text-center text-text-secondary">{index + 1}</td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <span className="status-tag status-tag-warning shrink-0">预警</span>
                            <span className="text-text leading-snug">{item.name}</span>
                          </div>
                        </td>
                        <td className="text-text-secondary">{item.scene}</td>
                        {showReleaseFields && (
                          <td className="text-center">
                            {item.releaseInfo ? (
                              <Popover
                                trigger="hover"
                                placement="top"
                                content={
                                  <div className="text-xs leading-relaxed max-w-[260px]">
                                    <div className="mb-1">
                                      <span className="text-text-tertiary">解除说明：</span>
                                      {item.releaseInfo.note}
                                    </div>
                                    <div className="text-text-tertiary">
                                      操作人：{item.releaseInfo.operator} · {item.releaseInfo.time}
                                    </div>
                                  </div>
                                }
                              >
                                <span
                                  className={`${releaseStatusClass[getReleaseStatus(item)]} cursor-help underline decoration-dotted`}
                                >
                                  {getReleaseStatusText(item)}
                                </span>
                              </Popover>
                            ) : (
                              <span className={releaseStatusClass[getReleaseStatus(item)]}>
                                {getReleaseStatusText(item)}
                              </span>
                            )}
                          </td>
                        )}
                        {showDisposalFields && (
                          <td>
                            {isEmptyRiskRow(item) ? (
                              <span className="text-text-tertiary text-xs">-</span>
                            ) : (
                              <span className={item.status === '无需处置' ? 'text-text-tertiary font-medium' : 'text-text font-medium'}>
                                {item.status}
                              </span>
                            )}
                          </td>
                        )}
                        <td>
                          {isEmptyRiskRow(item) || (showReleaseFields && item.releaseStatus === '已解除') ? (
                            <span className="text-text-tertiary text-xs">-</span>
                          ) : (
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
                          )}
                        </td>
                        {showReleaseFields && showInitialData && (
                          <td className="text-text-secondary leading-relaxed text-xs break-words pr-4">
                            {item.currentData || '-'}
                          </td>
                        )}
                        {showReleaseFields && showInitialData && (
                          <td className="text-text-secondary leading-relaxed text-xs break-words pr-4">
                            {item.initialData || '-'}
                          </td>
                        )}
                        <td>
                          {isEmptyRiskRow(item) ? (
                            <span className="text-text-tertiary text-xs">-</span>
                          ) : item.suppliers || item.reasoning ? (
                            <button
                              onClick={() => handleOpenReasoning(item)}
                              className="text-primary hover:underline text-xs font-medium"
                            >
                              {item.suppliers ? '查看详情' : '查看依据'}
                            </button>
                          ) : (
                            <span className="text-text-tertiary text-xs">-</span>
                          )}
                        </td>
                        <td className="text-text-secondary leading-relaxed text-xs pr-4">
                          {isEmptyRiskRow(item) ? <span className="text-text-tertiary text-xs">-</span> : item.suggestion}
                        </td>
                        {showDisposalFields && (
                          <td className="text-text-secondary text-xs">
                            {isEmptyRiskRow(item) ? <span className="text-text-tertiary text-xs">-</span> : item.mode}
                          </td>
                        )}
                        {showDisposalFields && (
                          <td className="pr-4">
                            {isEmptyRiskRow(item) ? (
                              <span className="text-text-tertiary text-xs">-</span>
                            ) : item.status === '无需处置' ? (
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
                            {isEmptyRiskRow(item) ? (
                              <span className="text-text-tertiary text-xs">-</span>
                            ) : item.status === '无需处置' ? (
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
                          {isEmptyRiskRow(item) ? (
                            <span className="text-text-tertiary text-xs">-</span>
                          ) : (
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
                          )}
                        </td>
                        {releaseActionsVisible && (
                          <td className="risk-col-action">
                            {canReleaseRisk(item) ? (
                              <Button
                                type="link"
                                size="small"
                                danger
                                className="risk-op-btn"
                                onClick={() => {
                                  setReleaseNote('');
                                  setReleaseError('');
                                  setReleaseModal({ isOpen: true, item });
                                }}
                              >
                                解除风险
                              </Button>
                            ) : (
                              <span className="text-text-tertiary text-xs">-</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="risk-warning-modal-footer">
                <div className="flex items-center gap-3 ml-auto">
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
                  value={problemDesc}
                  onChange={(e) => setProblemDesc(e.target.value)}
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
                  const targetId = feedbackModal.itemId;
                  if (targetId !== null) {
                    setRiskData(prev =>
                      prev.map(row =>
                        row.id === targetId
                          ? {
                              ...row,
                              feedbacks: [
                                ...(row.feedbacks || []),
                                {
                                  id: `f-${Date.now()}`,
                                  time: nowText(),
                                  type: problemType,
                                  description: problemDesc.trim(),
                                  attachments: []
                                }
                              ]
                            }
                          : row
                      )
                    );
                  }
                  setFeedbackModal({ isOpen: false, itemId: null });
                  showToast('提交成功');
                  setProblemType('');
                  setProblemDesc('');
                }}
                className="action-btn action-btn-primary px-8"
              >
                提交反馈
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 解除风险 Modal */}
      {releaseModal.isOpen && releaseModal.item && (
        <div
          className="feedback-modal-overlay"
          onClick={() => setReleaseModal({ isOpen: false, item: null })}
        >
          <div
            className="feedback-modal-container"
            style={{ maxWidth: '580px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center">
                <div className="w-1 h-4 bg-primary rounded-sm mr-2" />
                <span className="font-medium text-text text-base">解除风险</span>
              </div>
              <button
                onClick={() => setReleaseModal({ isOpen: false, item: null })}
                className="text-text-tertiary hover:text-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh] bg-white flex-1">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  <span className="text-red-500 mr-1">*</span>解除说明
                </label>
                <div className="cm-release-field">
                  <Input.TextArea
                    rows={4}
                    maxLength={200}
                    showCount
                    value={releaseNote}
                    status={releaseError ? 'error' : undefined}
                    placeholder="请填写解除理由，例如：该分供商已补充上传有效期内的施工劳务资质证书，模型识别为误判，人工复核通过。"
                    onChange={(e) => {
                      setReleaseNote(e.target.value);
                      if (e.target.value.trim()) setReleaseError('');
                    }}
                  />
                </div>
                {releaseError && <div className="text-xs text-red-500 mt-1">{releaseError}</div>}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50 shrink-0">
              <button
                onClick={() => setReleaseModal({ isOpen: false, item: null })}
                className="action-btn action-btn-ghost px-6"
              >
                取消
              </button>
              <button onClick={handleConfirmRelease} className="action-btn action-btn-primary px-8">
                确认解除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default ComplianceModal;
