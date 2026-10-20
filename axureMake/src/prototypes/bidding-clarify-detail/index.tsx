/**
 * @name 简版-分供商查看澄清
 * @mode axure
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /src/components/bidding-layout/index.tsx
 */
import React, { useState } from 'react';
import { ConfigProvider, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import zhCN from 'antd/locale/zh_CN';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import BiddingLayout from '../../components/bidding-layout';
import Breadcrumb from '../../components/breadcrumb';
import './style.css';

// 顶部面包屑文案
const BREADCRUMB_ITEMS = ['投标/报价管理', '投标/报价列表', '投标/报价详情'];

const TABS = ['采购(资格预审)公告', '联系方式', '报名附件', '采购文件', '澄清', '答疑'];

// 回答截止时间（到年月日时分秒）
const ASK_DEADLINE = '2026-10-16 18:00:00';

// 已澄清列表
type ClarifyItem = {
  key: string;
  index: number;
  clarifyTime: string;
  askDeadline: string;
  clarifyDesc: string;
  attachCount: string;
  attach: string;
  status: string;
  action: string;
};

const CLARIFY_DATA: ClarifyItem[] = [
  {
    key: '1',
    index: 1,
    clarifyTime: '2026-10-15 17:58:40',
    askDeadline: ASK_DEADLINE,
    clarifyDesc: '123测试',
    attachCount: '0',
    attach: '--',
    status: '已查看',
    action: '--'
  },
  {
    key: '2',
    index: 2,
    clarifyTime: '2026-10-15 16:53:21',
    askDeadline: ASK_DEADLINE,
    clarifyDesc: '23',
    attachCount: '0',
    attach: '--',
    status: '已查看',
    action: '--'
  }
];

const CLARIFY_COLUMNS: ColumnsType<ClarifyItem> = [
  { title: '', dataIndex: 'index', key: 'index', width: 80, align: 'center' },
  { title: '澄清时间', dataIndex: 'clarifyTime', key: 'clarifyTime', align: 'center' },
  { title: '回答截止时间', dataIndex: 'askDeadline', key: 'askDeadline', width: 200, align: 'center' },
  { title: '澄清说明', dataIndex: 'clarifyDesc', key: 'clarifyDesc', align: 'center' },
  { title: '附件数量', dataIndex: 'attachCount', key: 'attachCount', width: 150, align: 'center' },
  { title: '附件', dataIndex: 'attach', key: 'attach', width: 150, align: 'center' },
  {
    title: (
      <span className="bz-th">
        状态
        <HelpCircle size={13} className="bz-th-icon" />
      </span>
    ),
    dataIndex: 'status',
    key: 'status',
    width: 170,
    align: 'center'
  },
  { title: '操作', dataIndex: 'action', key: 'action', width: 150, align: 'center' }
];

// 回答列表
type AskItem = {
  key: string;
  index: number;
  askTime: string;
  askDesc: string;
  attachCount: string;
  attach: string;
  status: string;
};

const ASK_DATA: AskItem[] = [
  {
    key: '1',
    index: 1,
    askTime: '2026-10-16 14:36:01',
    askDesc: '我有些疑问',
    attachCount: '0',
    attach: '--',
    status: '未查看'
  }
];

const ASK_COLUMNS: ColumnsType<AskItem> = [
  { title: '', dataIndex: 'index', key: 'index', width: 80, align: 'center' },
  { title: '回答时间', dataIndex: 'askTime', key: 'askTime', align: 'center' },
  { title: '回答说明', dataIndex: 'askDesc', key: 'askDesc', align: 'center' },
  { title: '附件数量', dataIndex: 'attachCount', key: 'attachCount', width: 150, align: 'center' },
  { title: '附件', dataIndex: 'attach', key: 'attach', width: 150, align: 'center' },
  { title: '是否已被采购商查看', dataIndex: 'status', key: 'status', width: 260, align: 'center' }
];

const Component = () => {
  const [activeTab, setActiveTab] = useState('澄清');
  const [clarifyOpen, setClarifyOpen] = useState(true);
  const [askOpen, setAskOpen] = useState(true);

  return (
    <ConfigProvider locale={zhCN}>
      <BiddingLayout activeNav="投标工作台" activeSidebar="投标">
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-bg-page">
          {/* 面包屑 + 标题 + 采购信息 */}
          <div className="bg-white mb-3">
            <div className="h-[3px] w-full bg-primary" />

            <Breadcrumb items={BREADCRUMB_ITEMS} />

            <div className="px-6 pt-2 pb-6 flex justify-between items-center gap-10">
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-6">
                  <span className="bz-tag">询比采购</span>
                  <h1 className="text-[24px] font-bold text-gray-900">澄清功能测试</h1>
                </div>

                <div className="bz-info-grid">
                  <div className="bz-info-item">
                    采购编号：<span className="bz-info-val">cscec202610150000020997</span>
                  </div>
                  <div className="bz-info-item">
                    采购品类：<span className="bz-info-val">物资 钢材</span>
                  </div>
                  <div className="bz-info-item">
                    采购单位：<span className="bz-info-val">中国建筑股份有限公司</span>
                  </div>
                  <div className="bz-info-item">
                    发布时间：<span className="bz-info-val">2026-10-15 14:25:53</span>
                  </div>
                  <div className="bz-info-item">
                    地区：<span className="bz-info-region">四川省</span>
                  </div>
                  {/* 占位：使电子签字段独占一行，与设计稿一致 */}
                  <div />
                  <div className="bz-info-item">
                    是否接受附件文件使用电子签：<span className="bz-info-val">接受电子签</span>
                    <HelpCircle size={13} className="bz-info-icon" />
                  </div>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="bz-audit-status text-center">资审通过</div>
                <div className="bz-audit-note">
                  恭喜您，已通过资格审核，待采购商发布采购文件，请注意签收采购文件
                </div>
              </div>
            </div>
          </div>

          {/* Tab 区 + 澄清内容 */}
          <div className="bg-white flex-1">
            <div className="flex border-b border-border-base px-6">
              {TABS.map(tab => (
                <div
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-4 cursor-pointer text-[14px] relative transition-colors ${
                    activeTab === tab ? 'text-primary font-bold' : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                  )}
                </div>
              ))}
            </div>

            <div className="px-6 pt-4 pb-6">
              <div className="bz-tip">
                当前澄清模式为“简版模式”，可以直接对澄清说明进行查看或直接发起回答，回答截止时间以最新的澄清要求的回答截止时间为准
              </div>

              {/* 已澄清列表 */}
              <div className="bz-card">
                <div className="bz-card-head">
                  <div className="bz-card-head-left">
                    <span className="bz-title-bar" />
                    <span className="bz-card-title">已澄清列表</span>
                  </div>
                  <span className="bz-collapse" onClick={() => setClarifyOpen(!clarifyOpen)}>
                    {clarifyOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </div>

                {clarifyOpen && (
                  <div className="bz-card-body">
                    <Table<ClarifyItem>
                      className="bz-table"
                      dataSource={CLARIFY_DATA}
                      columns={CLARIFY_COLUMNS}
                      rowKey="key"
                      pagination={false}
                    />
                  </div>
                )}
              </div>

              {/* 回答列表 */}
              <div className="bz-card bz-card-last">
                <div className="bz-card-head">
                  <div className="bz-card-head-left">
                    <span className="bz-title-bar" />
                    <span className="bz-card-title">回答列表</span>
                  </div>
                  <div className="bz-card-head-right">
                    <span className="bz-ask-tip">已超过回答截止时间{ASK_DEADLINE}</span>
                    <button className="bz-btn-ask" disabled>回答</button>
                    <span className="bz-collapse" onClick={() => setAskOpen(!askOpen)}>
                      {askOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </div>
                </div>

                {askOpen && (
                  <div className="bz-card-body">
                    <Table<AskItem>
                      className="bz-table"
                      dataSource={ASK_DATA}
                      columns={ASK_COLUMNS}
                      rowKey="key"
                      pagination={false}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </BiddingLayout>
    </ConfigProvider>
  );
};

Component.displayName = 'BiddingClarifyDetail';

export default Component;
