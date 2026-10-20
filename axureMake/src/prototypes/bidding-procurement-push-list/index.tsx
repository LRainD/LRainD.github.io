/**
 * @name 招标采购推送列表
 * @mode axure
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /skills/screenshot-page-workflow/prototype-restoration.md
 * - /src/components/centralized-procurement-layout/index.tsx
 */

import React, { useState } from 'react';
import {
  Breadcrumb,
  Button,
  Checkbox,
  ConfigProvider,
  Input,
  Pagination,
  Select,
  Table
} from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { ChevronDown, ChevronUp } from 'lucide-react';
import CentralizedProcurementLayout from '../../components/centralized-procurement-layout';
import './style.css';

interface PushRow {
  key: string;
  receiver: string;
  bizNo: string;
  bizName: string;
  org: string;
  project: string;
  suppliers: string;
  expandable?: boolean;
  category: string;
  createTime: string;
  failReason: string;
  action?: 'push';
}

const ORG_OPTIONS = [
  { value: '中国建筑股份有限公司', label: '中国建筑股份有限公司' },
  { value: '中国建筑五局华南公司广州分公司总部', label: '中国建筑五局华南公司广州分公司总部' },
  { value: '中建五局第三建设有限公司', label: '中建五局第三建设有限公司' }
];

const CATEGORY_OPTIONS = [
  { value: '物资', label: '物资' },
  { value: '劳务分包', label: '劳务分包' }
];

const PUSH_DATA: PushRow[] = [
  {
    key: '1',
    receiver: '136推送',
    bizNo: 'cscec202610150000000413',
    bizName: 'PUSF2',
    org: '中国建筑股份有限公司',
    project: '测试项目71704',
    suppliers: 'sup306-02呵呵呵、sup306有限公司',
    category: '物资',
    createTime: '2026-10-15\n09:29:12',
    failReason: '项目未映射：测试项目71704(652795)'
  },
  {
    key: '2',
    receiver: '136推送',
    bizNo: 'cscec202610150000020326',
    bizName: 'PUSF',
    org: '中国建筑股份有限公司',
    project: '测试项目78584',
    suppliers: 'sup306有限公司、sup306-02呵呵呵',
    category: '物资',
    createTime: '2026-10-15\n09:22:23',
    failReason: '项目未映射：测试项目78584(652797)'
  },
  {
    key: '3',
    receiver: '136推送',
    bizNo: 'cscec202610130000041600',
    bizName: '测试1212',
    org: '中国建筑股份有限公司',
    project: '测试项目71704',
    suppliers: '深圳市华艺阳光建设科技集团有限公司、测广州市独绣绕遍贸易有限...',
    expandable: true,
    category: '物资',
    createTime: '2026-10-13\n17:47:52',
    failReason: '项目未映射：测试项目71704(652795)'
  },
  {
    key: '4',
    receiver: 'DSC推送',
    bizNo: 'cscec202610100000021111',
    bizName: '测试4',
    org: '中国建筑五局华南公司广州分公司总部',
    project: '佛山南海平洲上海村地块项目总承包工程（1标段）',
    suppliers: 'sup205-qi变更testone、sup203、成都永鸿翔建筑机械有限公司、sup202',
    category: '劳务分包',
    createTime: '2026-10-10 15:51:11',
    failReason: '项目未映射：佛山南海平洲上海村地块项目总承包工程（1标段）(652245)'
  },
  {
    key: '5',
    receiver: '136推送',
    bizNo: 'cscec202610100000001215',
    bizName: '测试3',
    org: '中国建筑五局华南公司广州分公司总部',
    project: '集中采购',
    suppliers: 'sup202、sup205-qi变更testone、sup203、成都永鸿翔建筑机械有限公司',
    category: '劳务分包',
    createTime: '2026-10-10 15:47:50',
    failReason: '',
    action: 'push'
  },
  {
    key: '6',
    receiver: '136推送',
    bizNo: 'cscec202610100000000722',
    bizName: '测试2',
    org: '中国建筑五局华南公司广州分公司总部',
    project: '集中采购',
    suppliers: 'sup203、sup205-qi变更testone、sup202、成都永鸿翔建筑机械有限公司',
    category: '物资',
    createTime: '2026-10-10 14:12:33',
    failReason: '',
    action: 'push'
  },
  {
    key: '7',
    receiver: 'DSC推送',
    bizNo: 'cscec202610100000040720',
    bizName: '测试1',
    org: '中国建筑五局华南公司广州分公司总部',
    project: '佛山南海平洲上海村地块项目总承包工程（1标段）',
    suppliers: '成都永鸿翔建筑机械有限公司、sup203、sup202、sup205-...',
    expandable: true,
    category: '物资',
    createTime: '2026-10-10 14:10:21',
    failReason: '项目未映射：佛山南海平洲上海村地块项目总承包工程（1标段）(652245)'
  },
  {
    key: '8',
    receiver: '136推送',
    bizNo: 'cscec202610090000040432',
    bizName: '保证金10091443',
    org: '中建五局第三建设有限公司',
    project: '山东地铁一号线',
    suppliers: 'sup308的公司-cxc测试勿动！！！、镇江源泉建筑工程有限公司、贵...',
    expandable: true,
    category: '物资',
    createTime: '2026-10-09\n14:57:34',
    failReason: '项目未映射：山东地铁一号线(639221)'
  },
  {
    key: '9',
    receiver: 'DSC推送',
    bizNo: 'cscec202610080000020641',
    bizName: '保证金10081145',
    org: '中建五局第三建设有限公司',
    project: '山东地铁一号线',
    suppliers: 'sup205-qi变更testone、sup204中建敏感-改个名字、sup206dsc、...',
    expandable: true,
    category: '物资',
    createTime: '2026-10-08\n11:45:35',
    failReason: '项目未映射：山东地铁一号线(639221)'
  },
  {
    key: '10',
    receiver: '136推送',
    bizNo: 'cscec202609290000045443',
    bizName: '测试6',
    org: '中国建筑五局华南公司广州分公司总部',
    project: '广州国际科技创新城一期总承包工程-土建',
    suppliers: '深圳市华艺阳光建设科技集团有限公司、sup205-qi变更测试one',
    category: '物资',
    createTime: '2026-09-29\n19:54:03',
    failReason: '项目未映射：广州国际科技创新城一期总承包工程-土建(652244)'
  }
];

const Component = () => {
  const [filterOpen, setFilterOpen] = useState(true);

  // 查询条件
  const [org, setOrg] = useState<string | undefined>('中国建筑股份有限公司');
  const [includeChild, setIncludeChild] = useState(true);
  const [bizNo, setBizNo] = useState('');
  const [bizName, setBizName] = useState('');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [project, setProject] = useState('');

  // 列表状态
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleReset = () => {
    setOrg('中国建筑股份有限公司');
    setIncludeChild(true);
    setBizNo('');
    setBizName('');
    setCategory(undefined);
    setProject('');
  };

  const toggleExpand = (key: string) => {
    setExpandedKeys(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]));
  };

  return (
    <ConfigProvider locale={zhCN}>
      <CentralizedProcurementLayout
        username="奥巴马"
        activeMenuKey="push-list"
        defaultOpenGroupKeys={['bidding-procurement']}
      >
        {/* 面包屑 */}
        <Breadcrumb
          className="push-breadcrumb"
          items={[{ title: '招标采购' }, { title: '招标采购推送列表' }]}
        />

        {/* 查询区 */}
        <div className="push-card push-filter-card">
          <div className="push-filter-head">
            <div className="push-filter-head-left">
              <span className="push-title-bar" />
              <span className="push-filter-title">查询</span>
            </div>
            <span className="push-collapse-icon" onClick={() => setFilterOpen(!filterOpen)}>
              {filterOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </div>

          {filterOpen && (
            <div className="push-filter-body">
              <div className="push-filter-row">
                <div className="push-filter-item">
                  <span className="push-filter-label">组织机构</span>
                  <Select
                    className="push-filter-select"
                    value={org}
                    onChange={setOrg}
                    options={ORG_OPTIONS}
                  />
                  <Checkbox
                    className="push-filter-checkbox"
                    checked={includeChild}
                    onChange={(e) => setIncludeChild(e.target.checked)}
                  >
                    包含下级
                  </Checkbox>
                </div>

                <div className="push-filter-item">
                  <span className="push-filter-label">业务单据编号</span>
                  <Input
                    className="push-filter-input"
                    placeholder="请输入"
                    value={bizNo}
                    onChange={(e) => setBizNo(e.target.value)}
                  />
                </div>

                <div className="push-filter-item">
                  <span className="push-filter-label">业务单据名称</span>
                  <Input
                    className="push-filter-input"
                    placeholder="请输入"
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                  />
                </div>

                <div className="push-filter-item">
                  <span className="push-filter-label">采购品类</span>
                  <Select
                    className="push-filter-select"
                    placeholder="全部"
                    allowClear
                    value={category}
                    onChange={setCategory}
                    options={CATEGORY_OPTIONS}
                  />
                </div>
              </div>

              <div className="push-filter-row">
                <div className="push-filter-item">
                  <span className="push-filter-label">使用项目</span>
                  <Input
                    className="push-filter-input push-filter-input-wide"
                    placeholder="请输入"
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                  />
                </div>
                <div className="push-filter-actions">
                  <Button type="primary">查询</Button>
                  <Button onClick={handleReset}>重置</Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 列表区 */}
        <div className="push-card push-table-card">
          <div className="push-tip-bar">
            目前暂时仅支持136、DSC系统的数据推送，推送失败的数据可再进行推送。
          </div>

          <div className="push-toolbar">
            <div className="push-toolbar-left">
              <Button type="link" className="push-toolbar-btn">批量推送</Button>
              <Button type="link" className="push-toolbar-btn">导出</Button>
            </div>
            <div className="push-toolbar-right">
              本页:10条 总计:4446条
            </div>
          </div>

          <Table
            rowKey="key"
            dataSource={PUSH_DATA}
            size="small"
            bordered
            scroll={{ x: 1580 }}
            rowSelection={{
              selectedRowKeys,
              columnWidth: 48,
              onChange: (keys) => setSelectedRowKeys(keys)
            }}
            pagination={false}
            columns={[
              { title: '数据接收方', dataIndex: 'receiver', key: 'receiver', width: 110, align: 'center' },
              {
                title: '业务单据编号',
                dataIndex: 'bizNo',
                key: 'bizNo',
                width: 200,
                render: (text: string) => <span className="push-link">{text}</span>
              },
              { title: '业务单据名称', dataIndex: 'bizName', key: 'bizName', width: 130 },
              { title: '组织机构', dataIndex: 'org', key: 'org', width: 180 },
              { title: '使用项目', dataIndex: 'project', key: 'project', width: 180 },
              {
                title: '中标/成交分供商',
                dataIndex: 'suppliers',
                key: 'suppliers',
                width: 240,
                render: (text: string, record: PushRow) => (
                  <div className="push-suppliers">
                    <span
                      className={`push-suppliers-text ${
                        record.expandable && !expandedKeys.includes(record.key) ? 'is-clamped' : ''
                      }`}
                    >
                      {text}
                    </span>
                    {record.expandable && (
                      <span className="push-link push-expand" onClick={() => toggleExpand(record.key)}>
                        {expandedKeys.includes(record.key) ? '收起' : '展开'}
                      </span>
                    )}
                  </div>
                )
              },
              { title: '品类', dataIndex: 'category', key: 'category', width: 90 },
              {
                title: '创建时间',
                dataIndex: 'createTime',
                key: 'createTime',
                width: 150,
                render: (text: string) => <span className="push-time">{text}</span>
              },
              { title: '失败原因', dataIndex: 'failReason', key: 'failReason', width: 200 },
              {
                title: '操作',
                dataIndex: 'action',
                key: 'action',
                width: 80,
                align: 'center',
                fixed: 'right',
                render: (value?: 'push') =>
                  value === 'push' ? (
                    <span className="push-link">推送</span>
                  ) : (
                    <span className="push-empty">--</span>
                  )
              }
            ]}
          />

          <div className="push-selection-bar">
            共选中 <span className="push-selection-count">{selectedRowKeys.length}</span> 条数据
          </div>

          <div className="push-pagination">
            <Pagination
              current={current}
              pageSize={pageSize}
              total={4446}
              showSizeChanger
              showQuickJumper
              pageSizeOptions={['10', '20', '50', '100']}
              showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`}
              onChange={(page, size) => {
                setCurrent(page);
                setPageSize(size);
              }}
            />
          </div>
        </div>
      </CentralizedProcurementLayout>
    </ConfigProvider>
  );
};

Component.displayName = 'BiddingProcurementPushList';

export default Component;
