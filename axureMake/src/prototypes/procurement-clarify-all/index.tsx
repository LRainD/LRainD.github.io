/**
 * @name 详版-发起澄清
 * @mode axure
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /src/components/centralized-procurement-layout/index.tsx
 * - /src/prototypes/procurement-clarify-detail/index.tsx
 */

import React, { useState } from 'react';
import { Button, ConfigProvider, DatePicker, Input } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn';
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import CentralizedProcurementLayout from '../../components/centralized-procurement-layout';
import Breadcrumb from '../../components/breadcrumb';
import { RECORDS, REPLY_DEADLINE, SELECTED_SUPPLIERS } from './mock';
import './style.css';

dayjs.locale('zh-cn');

const Component = () => {
  const [bodyOpen, setBodyOpen] = useState(true);
  const [askOpen, setAskOpen] = useState(true);
  const [recordOpen, setRecordOpen] = useState(true);

  // 已选分供商
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>(SELECTED_SUPPLIERS);
  const [questionText, setQuestionText] = useState('');
  // 回答截止时间
  const [replyDeadline, setReplyDeadline] = useState<Dayjs | null>(dayjs(REPLY_DEADLINE));

  const removeSupplier = (name: string) => {
    setSelectedSuppliers(selectedSuppliers.filter(item => item !== name));
  };

  return (
    <ConfigProvider locale={zhCN}>
      <CentralizedProcurementLayout
        username="奥巴马"
        orgName="中国建筑股份..."
        activeMenuKey=""
        defaultCollapsed
      >
        {/* 页头：面包屑 + 标题 + 倒计时 + 采购信息 */}
        <div className="cl-head">
          <Breadcrumb items={['采购列表', '澄清']} className="cl-breadcrumb" />

          <div className="cl-title-row">
            <span className="cl-category-tag">物资</span>
            <h1 className="cl-title">斯里兰卡卢比</h1>
          </div>

          <div className="cl-head-divider" />

          <div className="cl-countdown-row">
            <span className="cl-countdown-label">距废除截止还剩：</span>
            <span className="cl-time-box">999937</span>
            <span className="cl-time-unit">天</span>
            <span className="cl-time-box">07</span>
            <span className="cl-time-unit">:</span>
            <span className="cl-time-box">12</span>
            <span className="cl-time-unit">:</span>
            <span className="cl-time-box">00</span>
          </div>

          <div className="cl-info-grid">
            <div className="cl-info-item">
              采购编号：<span className="cl-link">cscec202608210000063225</span>
            </div>
            <div className="cl-info-item">组织机构：中国建筑股份有限公司</div>
            <div className="cl-info-item">采购方式：竞价采购</div>
            <div className="cl-info-item">
              项目：<span className="cl-link">测试项目89193</span>
            </div>
            <div className="cl-info-item">品类：物资-钢材</div>
            <div className="cl-info-item">经办人：奥巴马</div>
          </div>
        </div>

        {/* 全部澄清 */}
        <div className="cl-card">
          <div className="cl-card-head">
            <div className="cl-card-head-left">
              <span className="cl-card-bar" />
              <span className="cl-card-title">全部澄清</span>
            </div>
            <div className="cl-card-head-right">
              <Button type="primary" className="cl-export-btn">
                导出全部澄清
              </Button>
              <span className="cl-collapse" onClick={() => setBodyOpen(!bodyOpen)}>
                {bodyOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </div>
          </div>

          {bodyOpen && (
            <div className="cl-section-list">
              {/* 提问 */}
              <div className="cl-section">
                <div className="cl-section-head">
                  <div className="cl-section-head-left">
                    <span className="cl-title-bar" />
                    <span className="cl-section-title">提问</span>
                  </div>
                  <span className="cl-collapse" onClick={() => setAskOpen(!askOpen)}>
                    {askOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </div>

                {askOpen && (
                  <div className="cl-ask-body">
                    <div className="cl-deadline-row">
                      <span className="cl-chip-label">
                        <span className="cl-required">*</span>回答截止时间：
                      </span>
                      <DatePicker
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="请选择回答截止时间"
                        value={replyDeadline}
                        onChange={val => setReplyDeadline(val)}
                        className="cl-deadline-picker"
                      />
                    </div>

                    <div className="cl-chip-row">
                      <span className="cl-chip-label">已选分供商：</span>
                      {selectedSuppliers.map(name => (
                        <span className="cl-chip" key={name}>
                          <span className="cl-chip-text">{name}</span>
                          <X size={12} className="cl-chip-close" onClick={() => removeSupplier(name)} />
                        </span>
                      ))}
                      <span className="cl-link cl-select-link">选择分供商</span>
                    </div>

                    <Input.TextArea
                      className="cl-textarea"
                      rows={4}
                      value={questionText}
                      onChange={e => setQuestionText(e.target.value)}
                    />
                    <div className="cl-count">{questionText.length} / 500</div>

                    <div className="cl-ask-footer">
                      <Button icon={<Plus size={14} />} className="cl-attach-btn">
                        添加附件
                      </Button>
                      <Button type="primary" className="cl-submit-btn">
                        提交
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* 澄清记录 */}
              <div className="cl-section">
                <div className="cl-section-head">
                  <div className="cl-section-head-left">
                    <span className="cl-title-bar" />
                    <span className="cl-section-title">澄清记录(3)</span>
                  </div>
                  <span className="cl-collapse" onClick={() => setRecordOpen(!recordOpen)}>
                    {recordOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </div>

                {recordOpen && (
                  <div className="cl-record-list">
                    {RECORDS.map(record => (
                      <div className="cl-record" key={record.key}>
                        <div className="cl-record-label">采购商 提问：</div>
                        <div className="cl-record-question">{record.question}</div>
                        <div className="cl-record-time-row">
                          <span className="cl-record-time">澄清时间：{record.time}</span>
                          <span className="cl-record-time">回答截止时间：{record.replyDeadline}</span>
                        </div>

                        {record.readRows.map((row, index) => (
                          <div className="cl-read-row" key={index}>
                            <span className="cl-read-text">{row.text}</span>
                            {row.actions && (
                              <span className="cl-read-actions">
                                {row.actions.map(action => (
                                  <span className="cl-link" key={action}>
                                    {action}
                                  </span>
                                ))}
                              </span>
                            )}
                            {!row.actions && record.status && index === record.readRows.length - 1 && (
                              <span className="cl-record-status">{record.status}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CentralizedProcurementLayout>
    </ConfigProvider>
  );
};

Component.displayName = 'ProcurementClarifyAll';

export default Component;
