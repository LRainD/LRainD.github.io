/**
 * @name 详版-分供商回答
 * @mode axure
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /src/components/bidding-layout/index.tsx
 * - /src/prototypes/bidding-clarify-detail/index.tsx
 */

import React, { useState } from 'react';
import { ConfigProvider, Input } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { ChevronDown, ChevronUp, HelpCircle, MessageSquarePlus, Plus } from 'lucide-react';
import BiddingLayout from '../../components/bidding-layout';
import './style.css';

const TABS = ['采购(资格预审)公告', '联系方式', '报名附件', '采购文件', '澄清', '答疑'];

const FILE_TIP =
  '大小限制：500M 支持格式：jpeg、jpg、gif、png、doc、doc_、docx、xls、xls_、xlsx、txt、pdf、rar、zip、7z、tar、jar、dwg、dws、dwt、dxf、csv';
const SIGN_TIP = '（如需使用电子签功能，请上传100M以内的pdf文件）';

type Answer = {
  content: string;
  time: string;
};

type ClarifyRecord = {
  key: string;
  question: string;
  /** 澄清时间 */
  time: string;
  /** 回答截止时间 */
  deadline: string;
  answers: Answer[];
  /** 是否展示补充回答表单（尚无回答的记录） */
  replyable?: boolean;
  /** 是否已超过回答截止时间（超时后不再展示补充回答表单） */
  expired?: boolean;
};

const RECORDS: ClarifyRecord[] = [
  {
    key: '1',
    question: '123',
    time: '2026-10-20 09:29:36',
    deadline: '2026-10-22 09:29:36',
    answers: [
      { content: '我提问一些内容', time: '2026-10-20 09:41:04' },
      { content: '补充回答一些问题', time: '2026-10-20 09:41:24' }
    ]
  },
  {
    key: '2',
    question: '根据股份管理要求，进行澄清',
    time: '2026-10-20 09:33:13',
    deadline: '2026-10-22 09:33:13',
    answers: [],
    replyable: true
  },
  {
    key: '3',
    question: '关于投标保证金缴纳方式的澄清',
    time: '2026-10-18 10:12:30',
    deadline: '2026-10-19 10:12:30',
    answers: [],
    replyable: true,
    expired: true
  }
];

const Component = () => {
  const [activeTab, setActiveTab] = useState('澄清');
  const [open, setOpen] = useState(true);
  const [replyText, setReplyText] = useState('');

  return (
    <ConfigProvider locale={zhCN}>
      <BiddingLayout activeNav="投标工作台" activeSidebar="投标">
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-bg-page">
          {/* 面包屑 */}
          <div className="bz-breadcrumb">
            <span className="bz-crumb-link">投标/报价管理</span>
            <span className="bz-crumb-sep">{'>'}</span>
            <span className="bz-crumb-link">投标/报价列表</span>
            <span className="bz-crumb-sep">{'>'}</span>
            <span className="bz-crumb-current">投标/报价详情</span>
          </div>

          {/* 标题 + 采购信息 + 报名状态 */}
          <div className="bz-head">
            <div className="bz-head-left">
              <div className="bz-title-row">
                <span className="bz-tag">竞价采购</span>
                <h1 className="bz-title">斯里兰卡卢比</h1>
              </div>

              <div className="bz-info-grid">
                <div className="bz-info-item">
                  采购编号：<span className="bz-info-val">cscec202608210000063225</span>
                </div>
                <div className="bz-info-item">
                  采购品类：<span className="bz-info-val">物资 钢材</span>
                </div>
                <div className="bz-info-item">
                  采购单位：<span className="bz-info-val">中国建筑股份有限公司</span>
                </div>
                <div className="bz-info-item">
                  发布时间：<span className="bz-info-val">2026-08-21 17:28:31</span>
                </div>
                <div className="bz-info-item">
                  地区：<span className="bz-info-region">四川省</span>
                </div>
                {/* 占位：使电子签字段独占一行，与设计稿一致 */}
                <div />
                <div className="bz-info-item">
                  是否接受附件文件使用电子签：<span className="bz-info-val">接受电子签且推荐使用</span>
                  <HelpCircle size={13} className="bz-info-icon" />
                </div>
              </div>
            </div>

            <div className="bz-head-right">
              <div className="bz-status">报名截止</div>
              <div className="bz-status-note">采购报名已结束，您已报名，请等待采购方确认</div>
            </div>
          </div>

          {/* Tab + 澄清记录 */}
          <div className="bz-body">
            <div className="bz-panel">
              <div className="bz-tabs">
                {TABS.map(tab => (
                  <div
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`bz-tab${activeTab === tab ? ' is-active' : ''}`}
                  >
                    {tab}
                    {tab === '澄清' && <span className="bz-tab-badge">9</span>}
                    {activeTab === tab && <span className="bz-tab-line" />}
                  </div>
                ))}
              </div>

              <div className="bz-content">
                <div className="bz-card">
                  <div className="bz-card-head">
                    <div className="bz-card-head-left">
                      <span className="bz-title-bar" />
                      <span className="bz-card-title">澄清记录({RECORDS.length})</span>
                    </div>
                    <span className="bz-collapse" onClick={() => setOpen(!open)}>
                      {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </div>

                  {open && (
                    <div className="bz-card-body">
                      {RECORDS.map(record => (
                        <div className="bz-record" key={record.key}>
                          <div className="bz-label">采购单位 问题：</div>
                          <div className="bz-question-text">{record.question}</div>
                          <div className="bz-time">澄清时间：{record.time}</div>
                          <div className="bz-time">回答截止时间：{record.deadline}</div>

                          {record.answers.length > 0 && <div className="bz-divider" />}

                          {record.answers.map((answer, index) => (
                            <div className="bz-answer" key={index}>
                              <div className="bz-label">回答：</div>
                              <div className="bz-answer-bubble">{answer.content}</div>
                              <div className="bz-time">{answer.time}</div>
                            </div>
                          ))}

                          {record.answers.length > 0 && (
                            <button className="bz-reply-btn" type="button">
                              <MessageSquarePlus size={15} />
                              补充回答
                            </button>
                          )}

                          {record.replyable && !record.expired && (
                            <div className="bz-reply-form">
                              <Input.TextArea
                                className="bz-textarea"
                                rows={4}
                                maxLength={500}
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                              />
                              <div className="bz-count">{replyText.length} / 500</div>

                              <div className="bz-file-tip">
                                {FILE_TIP}
                                <br />
                                {SIGN_TIP}
                              </div>

                              <div className="bz-form-footer">
                                <button className="bz-add-attach" type="button">
                                  <Plus size={14} />
                                  添加附件
                                </button>
                                <button className="bz-sign-submit" type="button">
                                  发起电子签章并提交
                                  <HelpCircle size={14} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </BiddingLayout>
    </ConfigProvider>
  );
};

Component.displayName = 'BiddingClarifyRecord';

export default Component;
