import React, { useMemo, useState } from 'react';
import { Button, Input, Space, Table, Tooltip, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DeleteOutlined,
  DownOutlined,
  DownloadOutlined,
  InboxOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  UpOutlined,
  UploadOutlined
} from '@ant-design/icons';
import StepBar from '../../components/step-bar';

type PurchaseRow = {
  key: string;
  name: string;
  spec: string;
  basis: string;
  taxPrice: string;
  quantity: string;
  unit: string;
  amount: string;
  taxRate: string;
  noTaxPrice: string;
  noTaxAmount: string;
  tax: string;
  brand: string;
};

const demoRow = (index: number): PurchaseRow => ({
  key: `row-${Date.now()}-${index}`,
  name: ['HRB400E Φ25mm 热轧带肋抗震钢筋', 'P.O 42.5 普通硅酸盐水泥'][index % 2],
  spec: ['Φ25mm / HRB400E', '袋装 / 42.5'][index % 2],
  basis: index % 2 === 0 ? '历史价' : '信息价',
  taxPrice: index % 2 === 0 ? '3860.000000' : '468.000000',
  quantity: index % 2 === 0 ? '120' : '800',
  unit: index % 2 === 0 ? '吨' : '吨',
  amount: index % 2 === 0 ? '463200.000000' : '374400.000000',
  taxRate: '13%',
  noTaxPrice: index % 2 === 0 ? '3415.929203' : '414.159292',
  noTaxAmount: index % 2 === 0 ? '409911.504425' : '331327.433628',
  tax: index % 2 === 0 ? '53288.495575' : '43072.566372',
  brand: index % 2 === 0 ? '安钢' : '海螺'
});

const headerCell = (title: string, note?: string, required?: boolean) => (
  <div className="pl-th">
    <span className="pl-th-title">
      {required && <em className="pl-required">*</em>}
      {title}
      {note && <QuestionCircleOutlined className="pl-th-icon" />}
    </span>
    {note && <span className="pl-th-note">（{note}）</span>}
  </div>
);

const columns: ColumnsType<PurchaseRow> = [
  { title: '序号', key: 'index', width: 62, align: 'center', render: (_value, _row, index) => index + 1 },
  { title: headerCell('商品名称', undefined, true), dataIndex: 'name', key: 'name', width: 232 },
  { title: headerCell('规格型号', undefined, true), dataIndex: 'spec', key: 'spec', width: 178 },
  { title: '报价依据', dataIndex: 'basis', key: 'basis', width: 108 },
  { title: headerCell('含税单价', '最多6位小数'), dataIndex: 'taxPrice', key: 'taxPrice', width: 118, align: 'right' },
  { title: headerCell('数量', '只支持整数', true), dataIndex: 'quantity', key: 'quantity', width: 118, align: 'right' },
  { title: headerCell('单位', undefined, true), dataIndex: 'unit', key: 'unit', width: 82, align: 'center' },
  { title: headerCell('合价', '最多6位小数'), dataIndex: 'amount', key: 'amount', width: 128, align: 'right' },
  { title: '税率', dataIndex: 'taxRate', key: 'taxRate', width: 80, align: 'right' },
  { title: headerCell('不含税单价', '最多6位小数'), dataIndex: 'noTaxPrice', key: 'noTaxPrice', width: 128, align: 'right' },
  { title: headerCell('不含税合价', '最多6位小数'), dataIndex: 'noTaxAmount', key: 'noTaxAmount', width: 128, align: 'right' },
  { title: headerCell('税额', '最多6位小数'), dataIndex: 'tax', key: 'tax', width: 118, align: 'right' },
  { title: '品牌名', dataIndex: 'brand', key: 'brand', width: 96 },
  {
    title: <Tooltip title="自定义列"><span className="pl-column-setting">⇕</span></Tooltip>,
    key: 'setting',
    width: 44,
    align: 'center'
  }
];

const MAIN_STEPS = ['采购发起', '采购响应', '文件开启', '采购评审', '采购成交'];
const SUB_STEPS = ['采购基本信息', '编制采购清单', '编制采购(资格预审)公告', '发布采购(资格预审)公告', '报名与资审汇总', '资审结果通知'];

const Panel: React.FC<{
  title: React.ReactNode;
  extra?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}> = ({ title, extra, open, onToggle, children, className = '' }) => (
  <section className={`pl-card ${className}`}>
    <header className="pl-card-header">
      <div className="pl-card-title"><i className="pl-bar" />{title}</div>
      <div className="pl-card-extra">
        {extra}
        <button type="button" className="pl-collapse" onClick={onToggle} aria-label="收起/展开">
          {open ? <UpOutlined /> : <DownOutlined />}
        </button>
      </div>
    </header>
    {open && <div className="pl-card-body">{children}</div>}
  </section>
);

export const PurchaseListPage: React.FC = () => {
  const [listName, setListName] = useState('测试模板');
  const [rows, setRows] = useState<PurchaseRow[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [listOpen, setListOpen] = useState(true);
  const [suggestOpen, setSuggestOpen] = useState(true);
  const [quoteOpen, setQuoteOpen] = useState(true);
  const [suggest, setSuggest] = useState('');
  const [quoteNote, setQuoteNote] = useState('');

  const selectedCount = useMemo(() => selectedKeys.length, [selectedKeys]);

  const addItem = () => {
    setRows(current => [...current, demoRow(current.length)]);
    message.success('已添加 1 条商品明细');
  };

  const removeSelected = () => {
    if (!selectedCount) {
      message.warning('请先勾选需要删除的商品');
      return;
    }
    setRows(current => current.filter(row => !selectedKeys.includes(row.key)));
    setSelectedKeys([]);
    message.success(`已删除 ${selectedCount} 条商品明细`);
  };

  return (
    <div className="pl-page">
      <div className="pl-breadcrumb">
        <span className="pl-breadcrumb-link">采购列表</span>
        <span className="pl-breadcrumb-sep">›</span>
        <span>编制采购清单</span>
      </div>

      <div className="pl-bill-header">
        <div className="pl-bill-title">
          <span className="pl-bill-tag">物资</span>
          <span className="pl-bill-name">中国建筑股份有限公司-物资-分散采购-询比采购采购AA</span>
        </div>
        <Space size={8}>
          <Button className="pl-plain-btn" onClick={() => message.info('已切换到上一步：采购基本信息')}>上一步</Button>
          <Button type="primary" onClick={() => message.success('采购清单已保存')}>保存</Button>
          <Button type="primary" onClick={() => message.success('已进入下一步：采购响应')}>下一步</Button>
        </Space>
      </div>

      <section className="pl-card pl-bill">
        <div className="pl-bill-meta">
          <div className="pl-countdown">
            <span className="pl-countdown-label">距响应截止还剩:</span>
            <span className="pl-countdown-box">999996</span>
            <span className="pl-countdown-unit">天</span>
            <span className="pl-countdown-box">23</span>
            <span className="pl-countdown-unit">时</span>
            <span className="pl-countdown-box">59</span>
            <span className="pl-countdown-unit">分</span>
            <span className="pl-countdown-box">03</span>
            <span className="pl-countdown-unit">秒</span>
          </div>
          <div className="pl-meta-grid">
            <div className="pl-meta-item"><span className="pl-meta-label">采购编号:</span><span className="pl-meta-value">cscec202610240000040247</span></div>
            <div className="pl-meta-item"><span className="pl-meta-label">组织机构:</span><span className="pl-meta-value">中国建筑股份有限公司</span></div>
            <div className="pl-meta-item"><span className="pl-meta-label">采购方式:</span><span className="pl-meta-value">询比采购</span></div>
            <div className="pl-meta-item"><span className="pl-meta-label">项目:</span><a className="pl-meta-link">测试项目45414</a></div>
            <div className="pl-meta-item"><span className="pl-meta-label">品类:</span><span className="pl-meta-value">物资-钢材</span></div>
            <div className="pl-meta-item"><span className="pl-meta-label">经办人:</span><span className="pl-meta-value">奥巴马</span></div>
          </div>
        </div>

      </section>

      <section className="pl-card pl-stepper-card">
        <div className="pl-stepper">
          <StepBar
            className="pl-stepbar"
            mainSteps={MAIN_STEPS}
            currentMainStep="采购发起"
            subSteps={SUB_STEPS}
            currentSubStep="编制采购清单"
          />
        </div>
      </section>

      <Panel
        title="采购清单"
        className="pl-list-card"
        open={listOpen}
        onToggle={() => setListOpen(current => !current)}
        extra={<Button type="primary" icon={<DownloadOutlined />} onClick={() => message.success('清单导出任务已创建')}>导出清单</Button>}
      >
        <div className="pl-template-row">
          <Button type="primary" onClick={() => message.info('打开清单模板库')}>选择清单模板</Button>
          <UpOutlined className="pl-row-caret" />
        </div>

        <div className="pl-name-row">
          <i className="pl-name-bar" />
          <span className="pl-name-label"><em className="pl-required">*</em> 清单名称:</span>
          <Input
            className="pl-name-input"
            variant="borderless"
            value={listName}
            placeholder="请输入清单名称"
            onChange={event => setListName(event.target.value)}
          />
          <UpOutlined className="pl-row-caret" />
        </div>

        <div className="pl-toolbar">
          <Button type="link" icon={<SearchOutlined />} onClick={() => message.info('正在查询历史价格')}>查询历史价格</Button>
          <Button type="link" icon={<PlusOutlined />} onClick={addItem}>添加商品</Button>
          <Button type="link" icon={<UploadOutlined />} onClick={() => message.info('支持 Excel 批量导入商品明细')}>批量导入</Button>
          <Button type="link" icon={<DeleteOutlined />} onClick={removeSelected} disabled={!selectedCount}>删除行</Button>
          <span className="pl-toolbar-gap" />
          <Button className="pl-plain-btn" onClick={() => message.warning('请确认后删除整张清单')}>删除清单</Button>
          <Button className="pl-plain-btn" onClick={() => message.success('清单已收藏')}>收藏清单</Button>
          <Button className="pl-plain-btn" onClick={() => message.success('已创建清单副本')}>创建副本</Button>
        </div>

        <Table
          className="pl-table"
          rowKey="key"
          columns={columns}
          dataSource={rows}
          pagination={false}
          scroll={{ x: 1480 }}
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: keys => setSelectedKeys(keys)
          }}
          locale={{
            emptyText: (
              <div className="pl-empty">
                <InboxOutlined className="pl-empty-icon" />
                <span className="pl-empty-text">暂无数据</span>
              </div>
            )
          }}
        />

        <div className="pl-selected-bar">共选中 {selectedCount} 条数据</div>

        <div className="pl-attachment">
          <div className="pl-attachment-label">
            <span>清单附件:</span>
            <span className="pl-attachment-sub">(仅内部可见)</span>
          </div>
          <div className="pl-attachment-main">
            <div className="pl-attachment-tip">
              大小限制: 500M 支持格式: jpeg.jpg.gif.png.doc.docx.xls.xlsx.xlsb.txt.pdf.rar.zip.7z.tar.jar.dwg.dws.dwt.dxf.csv
            </div>
            <Button className="pl-attachment-btn" icon={<PlusOutlined />} onClick={() => message.info('请选择需要上传的附件')}>添加附件</Button>
          </div>
        </div>
      </Panel>

      <Panel
        title="私有库建议栏"
        open={suggestOpen}
        onToggle={() => setSuggestOpen(current => !current)}
        className="pl-note-card"
      >
        <Input.TextArea
          className="pl-textarea"
          rows={5}
          maxLength={4000}
          showCount
          value={suggest}
          onChange={event => setSuggest(event.target.value)}
        />
      </Panel>

      <Panel
        title={<>分供商报价说明（仅在采购文件发布后，分供商才可见该内容）<QuestionCircleOutlined className="pl-title-icon" /></>}
        open={quoteOpen}
        onToggle={() => setQuoteOpen(current => !current)}
        className="pl-note-card"
      >
        <Input.TextArea
          className="pl-textarea"
          rows={5}
          maxLength={4000}
          showCount
          value={quoteNote}
          onChange={event => setQuoteNote(event.target.value)}
        />
      </Panel>
    </div>
  );
};
