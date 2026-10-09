/**
 * @name 规则管理
 * @mode axure
 *
 * 参考资料：
 * - /skills/axure-export-workflow/SKILL.md
 */
import React, { useState } from 'react';
import OperationAdminLayout from '../../components/operation-admin-layout';
import {
  Form,
  Input,
  Select,
  Button,
  Table,
  Space,
  DatePicker,
  Pagination,
  Empty,
  Cascader
} from 'antd';
import {
  UpOutlined,
  DownOutlined,
  SettingOutlined,
  PlusOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { mockRuleData, type RuleRecord, checkStageOptions } from './mock';
import './style.css';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const Component: React.FC = () => {
  // 视图切换状态：'list' 表示规则列表，'add' 表示新增规则页面
  const [viewMode, setViewMode] = useState<'list' | 'add'>('list');

  // 列表筛选表单
  const [filterForm] = Form.useForm();
  const [isQueryExpanded, setIsQueryExpanded] = useState(true);

  // 新增规则基本信息表单
  const [addForm] = Form.useForm();
  const checkType = Form.useWatch('checkType', addForm);
  const [isBasicInfoExpanded, setIsBasicInfoExpanded] = useState(true);
  const [isRuleFieldsExpanded, setIsRuleFieldsExpanded] = useState(true);
  const [expandedRemarkKeys, setExpandedRemarkKeys] = useState<Set<string>>(new Set());

  const toggleRemark = (key: string) => {
    setExpandedRemarkKeys((currentKeys: Set<string>) => {
      const nextKeys = new Set(currentKeys);
      if (nextKeys.has(key)) {
        nextKeys.delete(key);
      } else {
        nextKeys.add(key);
      }
      return nextKeys;
    });
  };

  // ------------------ 规则列表 Columns ------------------
  const listColumns: ColumnsType<RuleRecord> = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      align: 'center'
    },
    {
      title: '规则编号',
      dataIndex: 'ruleCode',
      key: 'ruleCode',
      width: 170,
      render: (text) => <div className="break-all">{text}</div>
    },
    {
      title: '规则名称',
      dataIndex: 'ruleName',
      key: 'ruleName',
      width: 150
    },
    {
      title: '业务域',
      dataIndex: 'businessDomain',
      key: 'businessDomain',
      width: 90
    },
    {
      title: '业务类型',
      dataIndex: 'businessType',
      key: 'businessType',
      width: 90
    },
    {
      title: '检查类型',
      dataIndex: 'checkType',
      key: 'checkType',
      width: 90,
      render: (val) => (val === 'manual' ? '人工检查' : '系统识别')
    },
    {
      title: '检查标准',
      dataIndex: 'checkStandard',
      key: 'checkStandard',
      width: 180,
      render: (text) => text || '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 70
    },
    {
      title: '规则等级',
      dataIndex: 'ruleLevel',
      key: 'ruleLevel',
      width: 90
    },
    {
      title: '规则类型',
      dataIndex: 'ruleType',
      key: 'ruleType',
      width: 90
    },
    {
      title: '操作人信息',
      dataIndex: 'creator',
      key: 'creator',
      width: 100
    },
    {
      title: '操作时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 140
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      render: (text, record) => {
        const remark = String(text || '');
        const isLongRemark = remark.length > 80;
        const isExpanded = expandedRemarkKeys.has(record.key);

        return (
          <div className="remark-text-cell">
            <div className={isExpanded ? 'remark-text-expanded' : 'remark-text-collapsed'}>
              {remark}
            </div>
            {isLongRemark && (
              <button
                type="button"
                className="remark-toggle-btn"
                onClick={() => toggleRemark(record.key)}
              >
                {isExpanded ? '收起' : '展开'}
              </button>
            )}
          </div>
        );
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 170,
      fixed: 'right',
      render: () => (
        <Space size={8} className="table-action-links">
          <a className="action-link-blue">查看</a>
          <a className="action-link-blue">编辑</a>
          <a className="action-link-blue">禁用</a>
          <a className="action-link-red">删除</a>
        </Space>
      )
    }
  ];

  // ------------------ 新增页面“规则字段”表格 Columns ------------------
  const fieldColumns: ColumnsType<any> = [
    { title: '排序', dataIndex: 'sort', key: 'sort', width: 60, align: 'center' },
    { title: '字段名称', dataIndex: 'fieldName', key: 'fieldName', width: 110 },
    { title: '字段编码', dataIndex: 'fieldCode', key: 'fieldCode', width: 110 },
    { title: '来源', dataIndex: 'source', key: 'source', width: 80 },
    { title: '字段类型', dataIndex: 'fieldType', key: 'fieldType', width: 90 },
    { title: '是否必填', dataIndex: 'isRequired', key: 'isRequired', width: 85 },
    { title: '填写规则', dataIndex: 'fillRule', key: 'fillRule', width: 90 },
    { title: '是否为查询字段', dataIndex: 'isQueryField', key: 'isQueryField', width: 110 },
    { title: '安全表达式', dataIndex: 'safeExpression', key: 'safeExpression', width: 100 },
    { title: '安全字段类型', dataIndex: 'safeFieldType', key: 'safeFieldType', width: 100 },
    { title: '是否计算列', dataIndex: 'isCalcColumn', key: 'isCalcColumn', width: 95 },
    { title: '计算表达式', dataIndex: 'calcExpression', key: 'calcExpression', width: 100 },
    { title: '是否显示', dataIndex: 'isVisible', key: 'isVisible', width: 85 },
    { title: '操作', dataIndex: 'action', key: 'action', width: 80 }
  ];

  return (
    <OperationAdminLayout
      activeMenuKey="rule_mgmt"
      defaultOpenKeys={['risk_warning_center']}
      breadcrumbItems={
        viewMode === 'list'
          ? [
              { label: '风控预警中心', active: false },
              { label: '规则管理', active: true }
            ]
          : [
              { label: '风控预警中心', active: false },
              { label: '规则配置', active: false },
              { label: '新增', active: true }
            ]
      }
      showOrgBar={false}
    >
      <div className="rule-mgmt-container">
        {viewMode === 'list' ? (
          /* ==================== 1. 规则列表视图 ==================== */
          <>
            {/* 查询区域 Card */}
            <div className="rule-query-card">
              <div className="query-card-header">
                <div className="query-card-title">
                  <span className="title-blue-bar"></span>
                  <span className="title-text">查询</span>
                </div>
                <div
                  className="query-collapse-trigger"
                  onClick={() => setIsQueryExpanded(!isQueryExpanded)}
                >
                  {isQueryExpanded ? <UpOutlined /> : <DownOutlined />}
                </div>
              </div>

              {isQueryExpanded && (
                <div className="query-card-body">
                  <Form
                    form={filterForm}
                    layout="horizontal"
                    labelAlign="right"
                    initialValues={{ businessDomain: 'yunjucai' }}
                  >
                    <div className="query-form-grid">
                      <Form.Item label="规则名称" name="ruleName">
                        <Input placeholder="请输入规则名称" allowClear />
                      </Form.Item>

                      <Form.Item label="规则编号" name="ruleCode">
                        <Input placeholder="请输入规则编号" allowClear />
                      </Form.Item>

                      <Form.Item label="检查类型" name="checkType">
                        <Select
                          placeholder="请选择"
                          allowClear
                          options={[
                            { label: '系统识别', value: 'system' },
                            { label: '人工检查', value: 'manual' }
                          ]}
                        />
                      </Form.Item>

                      <Form.Item label="业务域" name="businessDomain">
                        <Select
                          defaultValue="yunjucai"
                          options={[{ label: '云筑集采', value: 'yunjucai' }]}
                        />
                      </Form.Item>

                      <Form.Item label="业务类型" name="businessType">
                        <Select placeholder="请选择" allowClear options={[]} />
                      </Form.Item>

                      <Form.Item label="操作人" name="creator">
                        <Input placeholder="请输入操作人" allowClear />
                      </Form.Item>

                      <Form.Item label="操作时间" name="createTime">
                        <RangePicker
                          placeholder={['开始时间', '结束时间']}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>

                      <Form.Item label="规则等级" name="ruleLevel">
                        <Select placeholder="请选择" allowClear options={[]} />
                      </Form.Item>

                      <Form.Item label="规则类型" name="ruleType">
                        <Select placeholder="请选择规则类型" allowClear options={[]} />
                      </Form.Item>

                      <Form.Item label="状态" name="status">
                        <Select placeholder="请选择状态" allowClear options={[]} />
                      </Form.Item>

                      <div className="query-form-actions">
                        <Button type="primary" className="btn-search">
                          查询
                        </Button>
                        <Button className="btn-reset">重置</Button>
                      </div>
                    </div>
                  </Form>
                </div>
              )}
            </div>

            {/* 规则数据列表 Card */}
            <div className="rule-list-card">
              <div className="rule-list-toolbar">
                <div className="toolbar-left">
                  <div className="setting-icon-box">
                    <SettingOutlined />
                  </div>
                </div>
                <div className="toolbar-right">
                  <span
                    className="add-rule-btn"
                    onClick={() => setViewMode('add')}
                  >
                    <PlusOutlined style={{ fontSize: 13, marginRight: 4 }} />
                    新增
                  </span>
                </div>
              </div>

              <Table
                columns={listColumns}
                dataSource={mockRuleData}
                pagination={false}
                rowKey="key"
                size="middle"
                className="rule-management-table"
              />

              <div className="rule-list-pagination">
                <div className="pagination-info">第 1-10 条/总共 78 条</div>
                <Pagination
                  total={78}
                  pageSize={10}
                  defaultCurrent={1}
                  showSizeChanger
                  pageSizeOptions={['10', '20', '50']}
                  showQuickJumper
                  locale={{
                    items_per_page: '条/页',
                    jump_to: '跳至',
                    page: '页'
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          /* ==================== 2. 新增规则页面视图 ==================== */
          <div className="rule-add-container">
            {/* 基本信息 Card */}
            <div className="rule-query-card">
              <div className="query-card-header">
                <div className="query-card-title">
                  <span className="title-blue-bar"></span>
                  <span className="title-text">基本信息</span>
                </div>
                <div
                  className="query-collapse-trigger"
                  onClick={() => setIsBasicInfoExpanded(!isBasicInfoExpanded)}
                >
                  {isBasicInfoExpanded ? <UpOutlined /> : <DownOutlined />}
                </div>
              </div>

              {isBasicInfoExpanded && (
                <div className="query-card-body">
                  <Form form={addForm} layout="horizontal" labelAlign="right">
                    <div className="add-form-grid">
                      {/* 第一行 */}
                      <Form.Item label="检查类型" name="checkType" required className="form-item-required">
                        <Select
                          placeholder="请选择"
                          options={[
                            { label: '系统识别', value: 'system' },
                            { label: '人工检查', value: 'manual' }
                          ]}
                        />
                      </Form.Item>

                      <Form.Item label="业务域" name="domain" required className="form-item-required">
                        <Select placeholder="请选择" />
                      </Form.Item>

                      <Form.Item label="业务类型" name="businessType" required className="form-item-required">
                        <Select placeholder="请选择" />
                      </Form.Item>

                      {/* 规则名称 / 规则编号 */}
                      <Form.Item label="规则名称" name="ruleName" required className="form-item-required">
                        <Input placeholder="请输入规则名称" />
                      </Form.Item>

                      <Form.Item label="规则编号" name="ruleCode" required className="form-item-required">
                        <Input placeholder="请输入规则编号" />
                      </Form.Item>

                      {checkType === 'manual' ? (
                        <>
                          <Form.Item label="检查标准" name="checkStandard">
                            <Input placeholder="请输入检查标准" />
                          </Form.Item>

                          <Form.Item
                            label="检查阶段"
                            name="checkStage"
                            required
                            className="form-item-required"
                          >
                            <Cascader
                              options={checkStageOptions}
                              placeholder="请选择检查阶段"
                              expandTrigger="hover"
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                        </>
                      ) : (
                        <>
                          <Form.Item label="安全规则" name="safeRule" required className="form-item-required">
                            <Select placeholder="请选择" />
                          </Form.Item>

                          <Form.Item label="处置建议" name="disposalSuggestion">
                            <TextArea
                              placeholder="请输入处置建议描述信息"
                              autoSize={{ minRows: 1, maxRows: 3 }}
                            />
                          </Form.Item>

                          <Form.Item label="规则等级" name="ruleLevel" required className="form-item-required">
                            <Select placeholder="请选择" />
                          </Form.Item>

                          <Form.Item label="规则类型" name="ruleType" required className="form-item-required">
                            <Select placeholder="请选择" />
                          </Form.Item>

                          <Form.Item label="是否大模型" name="isLLM" required className="form-item-required">
                            <Select placeholder="请选择" />
                          </Form.Item>
                        </>
                      )}

                      <Form.Item label="规则描述" name="ruleDesc">
                        <span className="action-link-blue cursor-pointer">编辑</span>
                      </Form.Item>

                      <Form.Item label="当前规则描述" name="currentRuleDesc">
                        <span className="action-link-blue cursor-pointer">编辑</span>
                      </Form.Item>

                      <Form.Item label="法律法规" name="laws">
                        <span className="action-link-blue cursor-pointer">编辑</span>
                      </Form.Item>

                      {/* 第四行：备注 */}
                      <Form.Item label="备注" name="remark" className="grid-col-span-1">
                        <Input placeholder="请输入备注" />
                      </Form.Item>
                    </div>
                  </Form>
                </div>
              )}
            </div>

            {/* 规则字段 Card (仅系统识别时展示) */}
            {checkType !== 'manual' && (
              <div className="rule-list-card" style={{ marginTop: 16 }}>
                <div className="rule-list-toolbar">
                  <div className="toolbar-left">
                    <div className="query-card-title">
                      <span className="title-blue-bar"></span>
                      <span className="title-text">规则字段</span>
                    </div>
                  </div>
                  <div className="toolbar-right">
                    <span
                      className="query-collapse-trigger"
                      onClick={() => setIsRuleFieldsExpanded(!isRuleFieldsExpanded)}
                    >
                      {isRuleFieldsExpanded ? <UpOutlined /> : <DownOutlined />}
                    </span>
                  </div>
                </div>

                {isRuleFieldsExpanded && (
                  <div className="p-4">
                    <Table
                      columns={fieldColumns}
                      dataSource={[]}
                      pagination={false}
                      className="rule-management-table"
                      locale={{
                        emptyText: (
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={<span style={{ color: '#999' }}>暂无数据</span>}
                          />
                        )
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* 底部确定/返回按钮 */}
            <div className="add-page-footer-actions">
              <Button
                type="primary"
                className="btn-confirm-submit"
                onClick={() => setViewMode('list')}
              >
                确定
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                onClick={() => setViewMode('list')}
              >
                返回
              </Button>
            </div>
          </div>
        )}
      </div>
    </OperationAdminLayout>
  );
};

export default Component;
