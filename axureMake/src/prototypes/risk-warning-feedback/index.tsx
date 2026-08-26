/**
 * @name 预警核查
 */
import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Row,
  Col,
  Checkbox
} from 'antd';
import { DownloadOutlined, PaperClipOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import OperationAdminLayout, { DEFAULT_MENU_ITEMS } from '../../components/operation-admin-layout';
import './style.css';

const { RangePicker } = DatePicker;
const { Text } = Typography;

type Satisfaction = '满意' | '不满意' | '未评价';
type FeedbackStatus = '是' | '否';

interface FeedbackRecord {
  id: string;
  time: string;
  type: string;
  description: string;
  attachments: string[];
}

interface WarningRow {
  id: string;
  businessDomain: string;
  businessNo: string;
  businessName: string;
  businessType: string;
  organization: string;
  operator: string;
  businessStage: string;
  warningRule: string;
  warningLevel: string;
  warningType: string;
  warningTime: string;
  satisfaction: Satisfaction;
  feedbacks: FeedbackRecord[];
}

const feedbackData: WarningRow[] = [
  {
    id: '1', businessDomain: '云筑集采', businessNo: 'cscec202608013000396247', businessName: '一局发展四川间...', businessType: '招投标-非招采购', organization: '发展公司西南分公司', operator: '许必展', businessStage: '均标', warningRule: '最小有效投标供应商数量', warningLevel: '高风险', warningType: '拦截', warningTime: '2026-08-16 22:43:05', satisfaction: '不满意',
    feedbacks: [
      { id: 'f-11', time: '2026-08-16 22:45:18', type: '预警信息不准确', description: '该项目为专项采购，已有审批记录，供应商数量符合实际业务要求。', attachments: ['专项采购审批单.pdf'] },
      { id: 'f-12', time: '2026-08-16 22:49:36', type: '处置建议不合理', description: '建议增加专项采购场景的豁免说明入口，避免重复提交材料。', attachments: [] }
    ]
  },
  {
    id: '2', businessDomain: '云筑集采', businessNo: '2021-13-CC037-000000207', businessName: '二局三华中标看...', businessType: '合同', organization: '中建二局三公司华中分公司', operator: '王馨阳', businessStage: '合同', warningRule: '合同总额超招标预算', warningLevel: '中风险', warningType: '预警', warningTime: '2026-08-16 22:29:44', satisfaction: '满意',
    feedbacks: [
      { id: 'f-21', time: '2026-08-16 22:31:03', type: '其他问题', description: '预警内容清晰，已按提示完成复核。', attachments: [] }
    ]
  },
  {
    id: '3', businessDomain: '云筑集采', businessNo: 'cscec20260804000065984', businessName: '广安人民医院医...', businessType: '招投标-非招采购', organization: '华西分公司', operator: '董洁方', businessStage: '发标', warningRule: '采购-总短报价时间', warningLevel: '高风险', warningType: '拦截', warningTime: '2026-08-16 22:15:48', satisfaction: '不满意',
    feedbacks: [
      { id: 'f-31', time: '2026-08-16 22:19:42', type: '数据同步延迟', description: '采购计划已调整，但预警仍显示旧的报价时间，请协助核实。', attachments: ['计划调整截图.png', '采购计划说明.docx'] },
      { id: 'f-32', time: '2026-08-16 22:25:10', type: '规则逻辑有误', description: '紧急采购不适用该报价时长规则，建议按照采购方式区分处理。', attachments: [] },
      { id: 'f-33', time: '2026-08-16 22:27:51', type: '其他问题', description: '希望能在预警页直接查看该规则的适用范围。', attachments: [] }
    ]
  },
  {
    id: '4', businessDomain: '云筑集采', businessNo: 'cscec202608040000201590', businessName: '潍坊公交新能源...', businessType: '招投标-非招采购', organization: '科工湖北公司', operator: '胡臣', businessStage: '发标', warningRule: '采购-总短报价时间', warningLevel: '高风险', warningType: '拦截', warningTime: '2026-08-16 22:07:44', satisfaction: '未评价',
    feedbacks: []
  }
];

const menuItems = DEFAULT_MENU_ITEMS.map(item => {
  if (item && typeof item === 'object' && 'key' in item && item.key === 'risk_warning_center') {
    return {
      ...item,
      children: [
        { key: 'warning_check', label: '预警核查' },
        ...((item.children as any[]) || []),
        { key: 'business_warning', label: '业务预警' }
      ]
    };
  }
  return item;
});

const satisfactionColor: Record<Satisfaction, string> = { 满意: 'success', 不满意: 'error', 未评价: 'default' };

const Component = () => {
  const [selectedRow, setSelectedRow] = useState<WarningRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filters, setFilters] = useState({
    organization: 'all',
    includeSubOrg: true,
    businessDomain: '云筑集采',
    businessNo: '',
    businessName: '',
    businessType: undefined as string | undefined,
    businessStage: undefined as string | undefined,
    operator: '',
    warningLevel: undefined as string | undefined,
    warningType: undefined as string | undefined,
    warningRule: undefined as string | undefined,
    warningTimeRange: null as any,
    satisfaction: undefined as Satisfaction | undefined,
    feedbackStatus: undefined as FeedbackStatus | undefined,
    includeObsolete: false
  });

  const dataSource = useMemo(() => feedbackData.filter(row => {
    return (!filters.businessName || row.businessName.includes(filters.businessName))
      && (!filters.businessNo || row.businessNo.includes(filters.businessNo))
      && (!filters.satisfaction || row.satisfaction === filters.satisfaction)
      && (!filters.feedbackStatus || (filters.feedbackStatus === '是' ? row.feedbacks.length > 0 : row.feedbacks.length === 0))
      && (!filters.operator || row.operator.includes(filters.operator))
      && (!filters.warningLevel || row.warningLevel === filters.warningLevel)
      && (!filters.warningType || row.warningType === filters.warningType)
      && (!filters.warningRule || row.warningRule === filters.warningRule)
      && (!filters.businessStage || row.businessStage === filters.businessStage)
      && (!filters.businessType || row.businessType === filters.businessType);
  }), [filters]);

  const openFeedback = (row: WarningRow) => {
    setSelectedRow(row);
    setDrawerOpen(true);
  };

  const columns = [
    { title: '序号', width: 64, fixed: 'left' as const, align: 'center' as const, render: (_: unknown, __: WarningRow, index: number) => index + 1 },
    { title: '业务域', dataIndex: 'businessDomain', width: 92 },
    { title: '业务编号', dataIndex: 'businessNo', width: 136, render: (value: string) => <a>{value}</a> },
    { title: '业务名称', dataIndex: 'businessName', width: 130, ellipsis: true },
    { title: '业务类型', dataIndex: 'businessType', width: 140 },
    { title: '组织机构', dataIndex: 'organization', width: 150, ellipsis: true },
    { title: '经办人', dataIndex: 'operator', width: 80 },
    { title: '业务环节', dataIndex: 'businessStage', width: 78 },
    { title: '预警规则', dataIndex: 'warningRule', width: 150, render: (value: string) => <a>{value}</a> },
    { title: '预警级别', dataIndex: 'warningLevel', width: 84 },
    { title: '预警类型', dataIndex: 'warningType', width: 76 },
    {
      title: '预警时间', dataIndex: 'warningTime', width: 132,
      render: (value: string) => <span>{value.replace(' ', '\n')}</span>
    },
    { title: '是否满意', dataIndex: 'satisfaction', width: 90, render: (value: Satisfaction) => <Tag color={satisfactionColor[value]}>{value}</Tag> },
    { title: '反馈次数', width: 82, render: (_: unknown, row: WarningRow) => row.feedbacks.length },
    {
      title: '操作', fixed: 'right' as const, width: 126,
      render: (_: unknown, row: WarningRow) => <Button type="link" size="small" disabled={!row.feedbacks.length} onClick={() => openFeedback(row)}>查看问题反馈</Button>
    }
  ];

  return (
    <OperationAdminLayout
      activeMenuKey="warning_check"
      defaultOpenKeys={['risk_warning_center']}
      menuItems={menuItems as any}
      showOrgBar={false}
      breadcrumbItems={[{ label: '风控预警中心' }, { label: '预警核查', active: true }]}
    >
      <div className="feedback-admin-page">
        <Card className="feedback-filter-card" styles={{ body: { padding: '16px 24px' } }}>
          <div className="feedback-filter-header">
            <div className="feedback-filter-title">查询</div>
            <div className="feedback-filter-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
              {isCollapsed ? <DownOutlined /> : <UpOutlined />}
            </div>
          </div>
          {!isCollapsed && (
            <Form layout="horizontal" className="feedback-filter-form">
              <Row gutter={[24, 12]}>
                {/* 第一行 */}
                <Col span={8}>
                  <Form.Item label="组织机构">
                    <div className="flex items-center gap-2">
                      <Select
                        placeholder="全部"
                        value={filters.organization}
                        onChange={(val: string) => setFilters({ ...filters, organization: val })}
                        options={[{ value: 'all', label: '全部' }, { value: 'southwest', label: '发展公司西南分公司' }]}
                      />
                      <Checkbox
                        checked={filters.includeSubOrg}
                        onChange={(e: any) => setFilters({ ...filters, includeSubOrg: e.target.checked })}
                        className="whitespace-nowrap text-xs"
                      >
                        包含下级
                      </Checkbox>
                    </div>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="业务域">
                    <Select
                      value={filters.businessDomain}
                      onChange={(val: string) => setFilters({ ...filters, businessDomain: val })}
                      options={[{ value: '云筑集采', label: '云筑集采' }]}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="业务编号">
                    <Input
                      placeholder="请输入业务编号"
                      value={filters.businessNo}
                      onChange={(e: any) => setFilters({ ...filters, businessNo: e.target.value })}
                    />
                  </Form.Item>
                </Col>

                {/* 第二行 */}
                <Col span={8}>
                  <Form.Item label="业务名称">
                    <Input
                      placeholder="请输入业务名称"
                      value={filters.businessName}
                      onChange={(e: any) => setFilters({ ...filters, businessName: e.target.value })}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="业务类型">
                    <Select
                      placeholder="请选择"
                      value={filters.businessType}
                      onChange={(val: string) => setFilters({ ...filters, businessType: val })}
                      options={[{ value: '招投标-非招采购', label: '招投标-非招采购' }]}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="业务环节">
                    <Select
                      placeholder="请选择环节"
                      value={filters.businessStage}
                      onChange={(val: string) => setFilters({ ...filters, businessStage: val })}
                      options={[{ value: '均标', label: '均标' }, { value: '发标', label: '发标' }]}
                    />
                  </Form.Item>
                </Col>

                {/* 第三行 */}
                <Col span={8}>
                  <Form.Item label="经办人">
                    <Input
                      placeholder="请输入经办人名称"
                      value={filters.operator}
                      onChange={(e: any) => setFilters({ ...filters, operator: e.target.value })}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="预警级别">
                    <Select
                      placeholder="请选择预警级别"
                      value={filters.warningLevel}
                      onChange={(val: string) => setFilters({ ...filters, warningLevel: val })}
                      options={[{ value: '高风险', label: '高风险' }, { value: '中风险', label: '中风险' }]}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="预警类型">
                    <Select
                      placeholder="请选择预警类型"
                      value={filters.warningType}
                      onChange={(val: string) => setFilters({ ...filters, warningType: val })}
                      options={[{ value: '拦截', label: '拦截' }, { value: '预警', label: '预警' }]}
                    />
                  </Form.Item>
                </Col>

                {/* 第四行 */}
                <Col span={8}>
                  <Form.Item label="预警规则">
                    <Select
                      placeholder="请选择预警规则"
                      value={filters.warningRule}
                      onChange={(val: string) => setFilters({ ...filters, warningRule: val })}
                      options={[{ value: '最小有效投标供应商数量', label: '最小有效投标供应商数量' }]}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="预警时间">
                    <RangePicker
                      className="w-full"
                      placeholder={['开始日期', '结束日期']}
                      value={filters.warningTimeRange}
                      onChange={(val: any) => setFilters({ ...filters, warningTimeRange: val })}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <div className="flex items-center justify-between h-full pb-3">
                    <Checkbox
                      checked={filters.includeObsolete}
                      onChange={(e: any) => setFilters({ ...filters, includeObsolete: e.target.checked })}
                      className="text-xs"
                    >
                      包含已废标/已废除数据
                    </Checkbox>
                    <Space size="middle">
                      <Button type="primary">查询</Button>
                      <Button onClick={() => setFilters({
                        organization: 'all',
                        includeSubOrg: true,
                        businessDomain: '云筑集采',
                        businessNo: '',
                        businessName: '',
                        businessType: undefined,
                        businessStage: undefined,
                        operator: '',
                        warningLevel: undefined,
                        warningType: undefined,
                        warningRule: undefined,
                        warningTimeRange: null,
                        satisfaction: undefined,
                        feedbackStatus: undefined,
                        includeObsolete: false
                      })}>重置</Button>
                      <Button type="link" className="p-0 text-xs flex items-center gap-1" onClick={() => setIsCollapsed(true)}>
                        收起 <UpOutlined />
                      </Button>
                    </Space>
                  </div>
                </Col>
              </Row>
            </Form>
          )}
        </Card>

        <Card className="feedback-table-card" styles={{ body: { padding: 0 } }}>
          <div className="feedback-table-toolbar">
            <Space><Button type="link" icon={<DownloadOutlined />}>导出</Button><Button size="small">⚙</Button></Space>
            <Text type="secondary" className="text-xs">本页: {dataSource.length}条　总计: 25303条</Text>
          </div>
          <Table rowKey="id" columns={columns} dataSource={dataSource} size="small" pagination={{ current: 1, pageSize: 10, total: 25303, showSizeChanger: false, showQuickJumper: true, showTotal: (total: number) => `共 ${total} 条` }} scroll={{ x: 1800 }} />
        </Card>
      </div>

      <Drawer title="问题反馈记录" width={560} open={drawerOpen} onClose={() => setDrawerOpen(false)} destroyOnClose>
        {selectedRow && <>
          <div className="mb-5 rounded-sm bg-[#f7f9fc] p-3 text-xs leading-6">
            <div><Text type="secondary">业务编号：</Text>{selectedRow.businessNo}</div>
            <div><Text type="secondary">业务名称：</Text>{selectedRow.businessName}</div>
            <div><Text type="secondary">预警规则：</Text>{selectedRow.warningRule}</div>
          </div>
          <div className="mb-3 font-medium">共 {selectedRow.feedbacks.length} 条反馈记录</div>
          {selectedRow.feedbacks.map((feedback: FeedbackRecord, index: number) => (
            <Card key={feedback.id} size="small" className="feedback-drawer-item" title={<span>反馈 #{selectedRow.feedbacks.length - index}</span>} extra={<Text type="secondary" className="text-xs">{feedback.time}</Text>}>
              <div className="mb-2 text-sm"><Text type="secondary">问题类型：</Text>{feedback.type}</div>
              <div className="mb-2 text-sm"><Text type="secondary">问题说明：</Text>{feedback.description}</div>
              <div className="text-sm"><Text type="secondary">附件：</Text>{feedback.attachments.length ? feedback.attachments.map((file: string) => <Tag key={file} icon={<PaperClipOutlined />}>{file}</Tag>) : <Text type="secondary">无</Text>}</div>
            </Card>
          ))}
        </>}
      </Drawer>
    </OperationAdminLayout>
  );
};

export default Component;
