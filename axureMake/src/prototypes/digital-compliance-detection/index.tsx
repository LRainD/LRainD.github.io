/**
 * @name 数字合规官检测中
 * @mode axure
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /rules/axure-api-guide.md
 */

import './style.css';
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Modal, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, ClockCircleOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import complianceImage from '../../../assets/images/数字合规官检测中.png';

import type { AxureProps, AxureHandle } from '../../common/axure-types';

// 定义风控规则的数据结构
interface RiskRule {
  id: string;
  name: string;
  isLLM: boolean; // 是否是大模型规则
  status: 'pending' | 'loading' | 'thinking' | 'passed' | 'failed';
  thoughts?: string[]; // 思考过程的完整文本片段
  currentThought?: string; // 当前流式展示的思考文本
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

const Component = forwardRef<AxureHandle, AxureProps>((props, ref) => {
  const { eventList = [], actionList = [], varList = [], configList = [], dataList = [] } = props;

  // 弹窗显示状态
  const [visible, setVisible] = useState(true);
  
  // 规则列表状态
  const [rules, setRules] = useState<RiskRule[]>([]);
  
  // 当前正在执行的规则索引
  const [activeRuleIndex, setActiveRuleIndex] = useState<number>(0);
  const [expandedRuleIds, setExpandedRuleIds] = useState<string[]>([]);
  const [expandedSupplierIds, setExpandedSupplierIds] = useState<string[]>([]);

  // 规则数据源
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
          conclusionText: '审查结论：已通过'
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
          conclusionText: '审查结论：未通过'
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
          conclusionText: '审查结论：已通过'
        }
      ],
      currentSupplierIndex: 0,
      currentSupplierThought: '',
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
      currentThought: '',
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
      currentThought: '',
    }
  ];

  // 初始化规则
  const initRules = () => {
    setRules(JSON.parse(JSON.stringify(initialRules)));
    setActiveRuleIndex(0);
    setExpandedRuleIds([]);
    setExpandedSupplierIds([]);
  };

  useEffect(() => {
    if (visible) {
      initRules();
    }
  }, [visible]);

  // 核心控制逻辑：顺序执行规则
  useEffect(() => {
    if (!visible || rules.length === 0 || activeRuleIndex >= rules.length) return;

    const currentRule = rules[activeRuleIndex];

    // 1. 如果规则处于 pending，将其置为 loading
    if (currentRule.status === 'pending') {
      // 立即更新状态为 loading
      setRules(prev => {
        const newRules = [...prev];
        if (newRules[activeRuleIndex]) {
          newRules[activeRuleIndex] = { ...newRules[activeRuleIndex], status: 'loading' };
        }
        return newRules;
      });
      
      return;
    }

    // 2. loading 状态单独计时，避免 pending -> loading 时清理掉定时器
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
          }, 1000);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }

    // 3. 如果是大模型规则，且进入了 thinking 状态，开始流式展示思考过程
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
        if (!visible) return;
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
            timerId = setTimeout(runStream, 500);
            return;
          }

          // 思考过程展示完毕，得出结论
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
          timerId = setTimeout(runStream, 30);
        } else {
          currentText += '\n';
          thoughtIndex++;
          charIndex = 0;
          timerId = setTimeout(runStream, 500);
        }
      };

      timerId = setTimeout(runStream, 500);
      return () => clearTimeout(timerId);
    }

    // 4. AI 规则完成后，在稳定的完成状态中推进下一条，避免被状态切换清理
    if (currentRule.isLLM && (currentRule.status === 'passed' || currentRule.status === 'failed')) {
      const timer = setTimeout(() => {
        setActiveRuleIndex(prev => prev + 1);
      }, 2000);

      return () => clearTimeout(timer);
    }

  }, [visible, activeRuleIndex, rules[activeRuleIndex]?.status]); // 移除对 rules 的深度依赖，避免无限循环

  // 暴露给 Axure 的方法
  useImperativeHandle(ref, () => ({
    executeAction: (actionName: string, params?: any) => {
      switch (actionName) {
        case 'showModal':
          setVisible(true);
          break;
        case 'hideModal':
          setVisible(false);
          break;
        default:
          console.warn('Unknown action:', actionName);
      }
    },
    getVars: () => ({
      visible,
      activeRuleIndex
    }),
    setVars: (vars: Record<string, any>) => {
      if (vars.visible !== undefined) setVisible(vars.visible);
    }
  }));

  // 渲染规则项
  const renderRuleItem = (rule: RiskRule, index: number) => {
    let statusClass = 'rule-pending';
    let icon = <ClockCircleOutlined className="rule-icon-pending" />;
    let statusLabel = null;

    if (rule.status === 'passed') {
      statusClass = 'rule-passed';
      icon = <CheckCircleOutlined className="rule-icon-passed" />;
      statusLabel = <span className="status-label passed">已通过</span>;
    } else if (rule.status === 'failed') {
      statusClass = 'rule-failed';
      icon = <CloseCircleOutlined className="rule-icon-failed" />;
      statusLabel = <span className="status-label failed">未通过</span>;
    } else if (rule.status === 'loading' || rule.status === 'thinking') {
      statusClass = 'rule-active';
      icon = <LoadingOutlined className="rule-icon-active" spin />;
    }

    return (
      <div key={rule.id} className={`rule-item-wrapper ${statusClass}`}>
        {/* 规则头部 */}
        <div className="rule-item-header">
          <div className="rule-icon-box">{icon}</div>
          <div className="rule-info">
            <span className="rule-name">{rule.name}</span>
            {statusLabel}
            {rule.isLLM && <span className="llm-tag">AI大模型</span>}
          </div>
        </div>

        {/* 规则内容区：大模型思考过程 */}
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
                                <span className={`supplier-conclusion ${supplier.conclusion}`}>
                                  {supplier.conclusion === 'passed' ? '已通过' : '未通过'}
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
    <div className="compliance-detection-container">
      {/* 背景模拟 */}
      <div className="mock-bg">
        <div className="mock-header">
          <span className="mock-title">业务系统工作台</span>
          <Button type="primary" onClick={() => { setVisible(true); initRules(); }}>
            重新检测
          </Button>
        </div>
        <div className="mock-content-placeholder">
          <p>这里是业务系统背景页面内容...</p>
          <p>点击上方“重新检测”按钮可再次唤起合规检测弹窗。</p>
        </div>
      </div>

      <Modal
        title={null}
        open={visible}
        footer={null}
        closable={true}
        onCancel={() => setVisible(false)}
        width={800}
        centered
        className="compliance-modal"
        mask={{ closable: false }}
      >
        <div className="compliance-modal-content">
          {/* 弹窗头部标题 */}
          <div className="compliance-header">
            <h2>合规检测</h2>
          </div>

          {/* 提示信息 */}
          <div className="compliance-tips-section">
            <h1 className="main-tip">数字合规官正在检测中，请稍等……</h1>
            <p className="sub-tip">开始检测时间：2026-08-21 15:53:03，系统正在进行业务风险分析，预计10分钟后结束</p>
            <p className="warning-tip">检测可能需要较长时间，请耐心等待(最晚2026-08-21 15:53:03结束)</p>
          </div>

          {/* 主体内容：左图右规则 */}
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
    </div>
  );
});

Component.displayName = 'DigitalComplianceDetection';

export default Component;
