/**
 * @name 数字合规官检测中
 * @mode axure
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /rules/axure-api-guide.md
 */

import './style.css';
import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
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
      id: 'rule_3',
      name: '关联交易与利益输送排查',
      isLLM: false,
      status: 'pending'
    },
    {
      id: 'rule_4',
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
    if (currentRule.status === 'thinking' && currentRule.thoughts) {
      let thoughtIndex = 0;
      let charIndex = 0;
      let currentText = '';
      let timerId: any = null;

      const runStream = () => {
        if (!visible) return;
        
        const thoughtsList = currentRule.thoughts!;
        if (thoughtIndex >= thoughtsList.length) {
          // 思考过程展示完毕，得出结论
          const finalStatus = currentRule.id === 'rule_2' ? 'failed' : 'passed';
          
          setRules(prev => {
            const newRules = [...prev];
            if (newRules[activeRuleIndex]) {
              newRules[activeRuleIndex] = { ...newRules[activeRuleIndex], status: finalStatus };
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
              newRules[activeRuleIndex] = { ...newRules[activeRuleIndex], currentThought: currentText };
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

  // 辅助方法：更新规则状态
  const updateRuleStatus = (index: number, status: RiskRule['status']) => {
    setRules(prev => {
      const newRules = [...prev];
      if (newRules[index]) {
        newRules[index] = { ...newRules[index], status };
      }
      return newRules;
    });
  };

  // 辅助方法：更新大模型思考文本
  const updateRuleThought = (index: number, text: string) => {
    setRules(prev => {
      const newRules = [...prev];
      if (newRules[index]) {
        newRules[index] = { ...newRules[index], currentThought: text };
      }
      return newRules;
    });
  };

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
          const isExpanded = expandedRuleIds.includes(rule.id);
          return (
            <div className="llm-thought-container">
              <button
                type="button"
                className="thought-toggle"
                onClick={() => setExpandedRuleIds(prev => isExpanded ? prev.filter(id => id !== rule.id) : [...prev, rule.id])}
              >
                {isExpanded ? <DownOutlined /> : <RightOutlined />}
                <span>{isExpanded ? '收起思考过程' : '查看思考过程'}</span>
              </button>
              {isExpanded && (
                <div className="thought-detail">
                  <div className="thought-header">
                    <span className="thought-dot"></span>
                    <span>{rule.status === 'thinking' ? 'AI 思考分析中...' : 'AI 思考分析完成'}</span>
                  </div>
                  <div className="thought-content-box">
                    {rule.currentThought || (rule.thoughts && rule.thoughts.join('\n'))}
                  </div>
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
        width={720}
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
