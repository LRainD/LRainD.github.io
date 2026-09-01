/**
 * @name 检查任务详情
 * @description 承载检查执行、整改、复核和历史查看的单次检查任务记录详情。
 */

import React, { useMemo, useState } from 'react';
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  ConfigProvider,
  Descriptions,
  Divider,
  Input,
  Radio,
  Space,
  Table,
  Tag,
  Timeline,
  message
} from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { ArrowLeftOutlined, CheckCircleOutlined, SaveOutlined } from '@ant-design/icons';
import CentralizedProcurementLayout from '../../components/centralized-procurement-layout';
import './style.css';

const { TextArea } = Input;

const taskRecords: Record<string, { type: string; status: string; bidName: string; contractName: string; contractNo: string }> = {
  'TASK-20260901-001': { type: '自查', status: '自查待处置', bidName: '某办公楼建设项目钢材采购招标', contractName: '某办公楼建设项目钢材采购合同', contractNo: 'HT-2026-001' },
  'TASK-20260901-002': { type: '互查', status: '互查待复核', bidName: '某高速公路工程水泥供应采购招标', contractName: '某高速公路工程水泥供应合同', contractNo: 'HT-2026-002' },
  'TASK-20260901-003': { type: '稽查', status: '稽查复核不通过', bidName: '某大型场馆机电安装分包项目招标', contractName: '某大型场馆机电安装分包合同', contractNo: 'HT-2026-003' },
  'TASK-20260901-004': { type: '自查', status: '自查待处理', bidName: '某住宅小区园林绿化工程项目采购', contractName: '某住宅小区园林绿化工程合同', contractNo: 'HT-2026-004' },
  'TASK-20260901-005': { type: '自查', status: '自查中', bidName: '某商业综合体消防工程采购招标', contractName: '某商业综合体消防工程采购合同', contractNo: 'HT-2026-005' },
  'TASK-20260901-006': { type: '自查', status: '自查申诉中', bidName: '某研发中心弱电智能化采购招标', contractName: '某研发中心弱电智能化采购合同', contractNo: 'HT-2026-006' },
  'TASK-20260901-007': { type: '互查', status: '互查待处理', bidName: '某医院综合大楼精装修采购招标', contractName: '某医院综合大楼精装修采购合同', contractNo: 'HT-2026-007' },
  'TASK-20260901-008': { type: '互查', status: '互查待处置', bidName: '某保障房项目混凝土采购招标', contractName: '某保障房项目混凝土采购合同', contractNo: 'HT-2026-008' },
  'TASK-20260901-009': { type: '稽查', status: '稽查待处理', bidName: '某轨道交通项目盾构机租赁采购招标', contractName: '某轨道交通项目盾构机租赁采购合同', contractNo: 'HT-2026-009' },
  'TASK-20260901-010': { type: '稽查', status: '检查已完成', bidName: '某市政道路沥青采购招标', contractName: '某市政道路沥青采购合同', contractNo: 'HT-2026-010' }
};

const checkItems = [
  { key: '1', item: '采购方式适用性', standard: '采购方式与项目金额、采购类别相匹配，并完成审批。', result: '不合规', reason: '未见采购方式变更审批记录', round: '第 1 轮' },
  { key: '2', item: '供应商准入资料', standard: '供应商资质、准入审批及黑名单校验资料完整有效。', result: '合规', reason: '资料齐全', round: '-' },
  { key: '3', item: '合同关键条款', standard: '合同价款、履约期限、付款条件与中标文件保持一致。', result: '不合规', reason: '付款节点与中标文件不一致', round: '第 1 轮' }
];

const TaskExecution: React.FC = () => {
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const taskId = searchParams.get('taskId') || 'TASK-20260901-004';
  const mode = searchParams.get('mode') || '查看';
  const task = taskRecords[taskId] || taskRecords['TASK-20260901-004'];
  const [results, setResults] = useState<Record<string, string>>({});
  const [remark, setRemark] = useState('');
  const isInspection = mode === '检查';
  const isRectification = mode === '整改';
  const isReview = mode === '复核';

  const actionTitle = useMemo(() => `${task.type}${mode}`, [mode, task.type]);

  const handleSubmit = () => {
    if ((isInspection || isReview) && Object.keys(results).length === 0) {
      message.warning('请先完成至少一个检查项的处理结论');
      return;
    }
    if (isRectification && !remark.trim()) {
      message.warning('请填写整改说明');
      return;
    }
    message.success(`${actionTitle}已提交`);
  };

  const columns = [
    { title: '检查项', dataIndex: 'item', key: 'item', width: 180 },
    { title: '检查标准', dataIndex: 'standard', key: 'standard', width: 310 },
    { title: '原始判定', dataIndex: 'result', key: 'result', width: 110, render: (value: string) => <Tag color={value === '不合规' ? 'error' : 'success'}>{value}</Tag> },
    { title: '问题原因', dataIndex: 'reason', key: 'reason', width: 210 },
    { title: '整改轮次', dataIndex: 'round', key: 'round', width: 100 },
    {
      title: isInspection ? '检查结论' : isReview ? '复核结论' : '处置说明',
      key: 'handling',
      width: 250,
      render: (_: unknown, record: typeof checkItems[number]) => {
        if (isInspection) return <Radio.Group value={results[record.key]} onChange={event => setResults(current => ({ ...current, [record.key]: event.target.value }))}><Radio value="合规">合规</Radio><Radio value="不合规">不合规</Radio></Radio.Group>;
        if (isReview && record.result === '不合规') return <Radio.Group value={results[record.key]} onChange={event => setResults(current => ({ ...current, [record.key]: event.target.value }))}><Radio value="通过">通过</Radio><Radio value="不通过">不通过</Radio></Radio.Group>;
        if (record.result === '不合规') return <span>{isRectification ? '请在下方填写整改说明并提交材料' : '整改材料已提交，等待复核'}</span>;
        return <span>-</span>;
      }
    }
  ];

  return (
    <ConfigProvider locale={zhCN}>
      <CentralizedProcurementLayout activeMenuKey="my-tasks">
        <div className="task-execution-page">
          <Breadcrumb items={[{ title: '首页' }, { title: '招标采购' }, { title: '一单一检' }, { title: '我的任务' }, { title: '任务详情' }]} />
          <div className="task-execution-header">
            <Space size={16}>
              <Button icon={<ArrowLeftOutlined />} onClick={() => window.history.back()}>返回任务列表</Button>
              <div><div className="task-execution-title">{actionTitle}</div><div className="task-execution-subtitle">任务编号：{taskId}</div></div>
            </Space>
            <Tag color={task.status.includes('处置') || task.status.includes('不通过') ? 'warning' : 'processing'}>{task.status}</Tag>
          </div>
          <Card className="task-execution-card" title="任务信息">
            <Descriptions column={3} size="small">
              <Descriptions.Item label="检查类型">{task.type}</Descriptions.Item>
              <Descriptions.Item label="招标/采购名称">{task.bidName}</Descriptions.Item>
              <Descriptions.Item label="合同编号">{task.contractNo}</Descriptions.Item>
              <Descriptions.Item label="合同名称" span={2}>{task.contractName}</Descriptions.Item>
              <Descriptions.Item label="当前办理事项">{actionTitle}</Descriptions.Item>
            </Descriptions>
          </Card>
          <Card className="task-execution-card" title={isInspection ? '检查执行' : '检查项处置明细'}>
            {isRectification && <Alert className="task-execution-alert" type="warning" showIcon message="请仅对当前允许处置的不合规检查项提交整改，提交后将生成原检查人的复核待办。" />}
            {isReview && <Alert className="task-execution-alert" type="info" showIcon message="请逐项复核整改材料；复核不通过时应填写明确的复核意见。" />}
            <Table columns={columns} dataSource={checkItems} rowKey="key" pagination={false} scroll={{ x: 1300 }} />
            {isRectification && <div className="task-textarea"><div className="task-field-label">整改说明</div><TextArea value={remark} onChange={event => setRemark(event.target.value)} rows={4} placeholder="请说明整改措施、完成情况及相关材料。" /></div>}
            {isReview && <div className="task-textarea"><div className="task-field-label">复核意见</div><TextArea value={remark} onChange={event => setRemark(event.target.value)} rows={3} placeholder="复核不通过时，请填写具体原因。" /></div>}
            {isInspection && <div className="task-textarea"><div className="task-field-label">检查备注</div><TextArea value={remark} onChange={event => setRemark(event.target.value)} rows={3} placeholder="可补充本次检查说明。" /></div>}
            {(isInspection || isRectification || isReview) && <div className="task-execution-actions"><Space><Button icon={<SaveOutlined />} onClick={() => message.success('草稿已保存')}>保存草稿</Button><Button type="primary" icon={<CheckCircleOutlined />} onClick={handleSubmit}>{isInspection ? '提交检查' : isRectification ? '提交整改' : '提交复核'}</Button></Space></div>}
          </Card>
          <Card className="task-execution-card" title="任务流转记录">
            <Timeline items={[
              { color: 'blue', children: <><div className="timeline-title">任务生成并派发</div><div className="timeline-detail">系统 · 2026-09-01 08:30 · 任务进入 {task.type} 环节</div></> },
              { color: 'blue', children: <><div className="timeline-title">检查已提交</div><div className="timeline-detail">检查人 · 2026-09-01 09:20 · 发现不合规检查项</div></> },
              { color: 'orange', children: <><div className="timeline-title">当前状态：{task.status}</div><div className="timeline-detail">系统 · 2026-09-01 10:00 · 等待当前办理人处理</div></> }
            ]} />
          </Card>
        </div>
      </CentralizedProcurementLayout>
    </ConfigProvider>
  );
};

export default TaskExecution;
