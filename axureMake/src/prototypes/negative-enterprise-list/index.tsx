/**
 * @name 负面企业清单
 * @mode axure
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /skills/axure-export-workflow/SKILL.md
 * - /rules/axure-api-guide.md
 * - /src/prototypes/digital-compliance-settings/index.tsx
 */

import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import dayjs from 'dayjs';
import {
  Plus,
  Search,
  RotateCcw,
  Edit3,
  Trash2,
  Eye,
  Upload as UploadIcon,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import {
  Button,
  Table,
  Modal,
  Form,
  Select,
  Input,
  DatePicker,
  message,
  Space,
  Card,
  Upload,
  Popconfirm
} from 'antd';
import type {
  AxureProps,
  AxureHandle,
  EventItem
} from '../../common/axure-types';

import CentralizedProcurementLayout from '../../components/centralized-procurement-layout';
import './style.css';

const { TextArea } = Input;

// --- Mock Data ---

// 模拟当前登录用户
const currentUser = {
  name: 'jctest1',
};

// 列入来源选项
const sourceOptions = [
  { label: '外部数据同步', value: '外部数据同步' },
  { label: '人工录入', value: '人工录入' },
  { label: '系统检测', value: '系统检测' },
];

// 组织机构选项
const organizationOptions = [
  { label: '中建一局', value: '中建一局' },
  { label: '中建二局', value: '中建二局' },
  { label: '中建三局', value: '中建三局' },
  { label: '中建四局', value: '中建四局' },
  { label: '中建八局', value: '中建八局' },
];

// 导入模板列定义（用于模板下载预览）
const TEMPLATE_COLUMNS = [
  { key: 'enterpriseName', title: '企业名称', required: true, width: 190 },
  { key: 'creditCode', title: '统一社会信用代码', required: true, width: 175 },
  { key: 'source', title: '列入来源', required: true, width: 105 },
  { key: 'organization', title: '列入组织', required: true, width: 105 },
  { key: 'includeDate', title: '列入日期', required: true, width: 100 },
  { key: 'reason', title: '列入原因', required: true, width: 210 },
  { key: 'remark', title: '备注', required: false, width: 120 },
];

// 导入模板示例数据
const TEMPLATE_SAMPLE_ROWS = [
  {
    enterpriseName: '中建云筑建材贸易有限公司',
    creditCode: '91110108MA01W2XY3K',
    source: '外部数据同步',
    organization: '中建一局',
    includeDate: '2026-03-12',
    reason: '被列为失信被执行人，未履行生效法律文书确定的义务',
    remark: '来源：中国执行信息公开网',
  },
  {
    enterpriseName: '江苏宏图建设集团有限公司',
    creditCode: '91320100704917283X',
    source: '外部数据同步',
    organization: '中建二局',
    includeDate: '2026-02-08',
    reason: '存在重大税收违法失信行为',
    remark: '',
  },
  {
    enterpriseName: '河北诚信劳务分包有限公司',
    creditCode: '91130105782011564M',
    source: '系统检测',
    organization: '中建三局',
    includeDate: '2026-05-19',
    reason: '近一年内 3 次中标后无故放弃中标资格',
    remark: '',
  },
];

// 初始负面企业清单数据
const initialData = [
  {
    id: '1',
    enterpriseName: '中建云筑建材贸易有限公司',
    creditCode: '91110108MA01W2XY3K',
    source: '外部数据同步',
    organization: '中建一局',
    includeDate: '2026-03-12',
    reason: '企业被列为失信被执行人，未履行生效法律文书确定的义务',
    remark: '来源：中国执行信息公开网',
    creator: '系统同步',
    updater: 'jctest1',
    createTime: '2026-03-12 08:30:00',
    updateTime: '2026-05-27 13:01:08',
  },
  {
    id: '2',
    enterpriseName: '江苏宏图建设集团有限公司',
    creditCode: '91320100704917283X',
    source: '外部数据同步',
    organization: '中建二局',
    includeDate: '2026-02-08',
    reason: '存在重大税收违法失信行为，被税务部门列入黑名单',
    remark: '长期有效，需人工复核后移出',
    creator: '系统同步',
    updater: 'jctest1',
    createTime: '2026-02-08 10:12:00',
    updateTime: '2026-05-26 17:59:22',
  },
  {
    id: '3',
    enterpriseName: '河北诚信劳务分包有限公司',
    creditCode: '91130105782011564M',
    source: '系统检测',
    organization: '中建三局',
    includeDate: '2026-05-19',
    reason: '近一年内发生 3 次中标后无故放弃中标资格',
    remark: '',
    creator: 'jctest1',
    updater: 'jctest1',
    createTime: '2026-05-19 15:40:00',
    updateTime: '2026-05-19 15:40:00',
  },
  {
    id: '4',
    enterpriseName: '山东金鼎工程机械租赁有限公司',
    creditCode: '91370100MA3D5K9L2P',
    source: '人工录入',
    organization: '中建四局',
    includeDate: '2026-01-15',
    reason: '因安全生产责任事故被主管部门行政处罚',
    remark: '处罚决定书编号：鲁建安监〔2026〕012 号',
    creator: '王管理(wangguanli)',
    updater: 'jctest1',
    createTime: '2026-01-15 09:20:00',
    updateTime: '2026-04-02 11:08:35',
  },
  {
    id: '5',
    enterpriseName: '北京华信电力设备有限公司',
    creditCode: '91110105MA01Y7QR8T',
    source: '外部数据同步',
    organization: '中建八局',
    includeDate: '2025-11-06',
    reason: '存在向评标专家行贿的犯罪记录',
    remark: '企业已完成整改并通过复核',
    creator: '系统同步',
    updater: 'admin',
    createTime: '2025-11-06 14:05:00',
    updateTime: '2026-05-20 09:15:00',
  },
  {
    id: '6',
    enterpriseName: '深圳市恒泰消防工程有限公司',
    creditCode: '91440300MA5EK3M4X7',
    source: '外部数据同步',
    organization: '中建八局',
    includeDate: '2025-12-24',
    reason: '被市场监管部门列入严重违法失信企业名单',
    remark: '',
    creator: '系统同步',
    updater: 'admin',
    createTime: '2025-12-24 16:45:00',
    updateTime: '2026-03-18 10:22:41',
  },
];

// --- Component ---

const Component = forwardRef<AxureHandle, AxureProps>((props, ref) => {
  const { eventList = [] } = props as AxureProps & { eventList?: EventItem[] };

  // State
  const [dataSource, setDataSource] = useState(initialData);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFileList, setImportFileList] = useState<any[]>([]);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();

  // Helper: 生成 "YYYY-MM-DD HH:mm:ss" 格式的当前时间
  const getCurrentTime = () =>
    new Date()
      .toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      .replace(/\//g, '-');

  // 查询
  const handleSearch = useCallback(() => {
    setFilters(searchForm.getFieldsValue());
  }, [searchForm]);

  const handleResetSearch = useCallback(() => {
    searchForm.resetFields();
    setFilters({});
  }, [searchForm]);

  // 移出清单
  const handleRemove = useCallback(
    (id: string) => {
      setDataSource((prev) => prev.filter((item: any) => item.id !== id));
      message.success('已移出负面企业清单');

      const event = eventList.find((e: any) => e.name === 'onEnterpriseRemove');
      if (event) {
        console.log('Trigger event:', event.name, { id });
      }
    },
    [eventList]
  );

  // 导入清单
  const openImportModal = useCallback(() => {
    setImportFileList([]);
    setIsImportOpen(true);
  }, []);

  const closeImportModal = useCallback(() => {
    setIsImportOpen(false);
    setImportFileList([]);
  }, []);

  const handleImportConfirm = useCallback(() => {
    if (importFileList.length === 0) {
      message.warning('请先选择需要导入的文件');
      return;
    }
    message.success('导入任务已提交，系统正在解析校验，请稍后刷新列表查看结果');
    setIsImportOpen(false);
    setImportFileList([]);
  }, [importFileList]);

  const handleDownloadTemplate = useCallback(() => {
    message.success('模板下载中：负面企业清单导入模板.xlsx');
    setIsTemplateOpen(false);
  }, []);

  const openTemplatePreview = useCallback(() => {
    setIsTemplateOpen(true);
  }, []);

  const closeTemplatePreview = useCallback(() => {
    setIsTemplateOpen(false);
  }, []);

  const openModal = useCallback(
    (type: 'add' | 'edit' | 'view', record: any = null) => {
      setModalType(type);
      if (record) {
        setEditingRecord(record);
        form.setFieldsValue({
          enterpriseName: record.enterpriseName,
          creditCode: record.creditCode,
          source: record.source,
          organization: record.organization,
          includeDate: record.includeDate ? dayjs(record.includeDate) : undefined,
          reason: record.reason,
          remark: record.remark,
        });
      } else {
        setEditingRecord(null);
        form.resetFields();
        form.setFieldsValue({ source: '人工录入', organization: '中建一局' });
      }
      setIsModalOpen(true);
    },
    [form]
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingRecord(null);
    form.resetFields();
  }, [form]);

  const onFinish = useCallback(
    (values: any) => {
      const currentTime = getCurrentTime();
      const commonFields = {
        source: values.source,
        organization: values.organization,
        includeDate: values.includeDate ? dayjs(values.includeDate).format('YYYY-MM-DD') : '',
        reason: values.reason,
        remark: values.remark || '',
      };

      if (modalType === 'add') {
        // 校验统一社会信用代码是否已存在
        if (dataSource.some((item: any) => item.creditCode === values.creditCode)) {
          message.error('该统一社会信用代码已存在负面清单中，请勿重复添加');
          return;
        }

        const newRecord = {
          id: Date.now().toString(),
          enterpriseName: values.enterpriseName,
          creditCode: values.creditCode,
          ...commonFields,
          creator: currentUser.name,
          updater: currentUser.name,
          createTime: currentTime,
          updateTime: currentTime,
        };
        setDataSource([newRecord, ...dataSource]);
        message.success('新增成功');

        const event = eventList.find((e: any) => e.name === 'onEnterpriseAdd');
        if (event) {
          console.log('Trigger event:', event.name, { record: newRecord });
        }
      } else {
        setDataSource((prev) =>
          prev.map((item: any) =>
            item.id === editingRecord.id
              ? {
                  ...item,
                  ...commonFields,
                  updateTime: currentTime,
                  updater: currentUser.name,
                }
              : item
          )
        );
        message.success('更新成功');

        const event = eventList.find((e: any) => e.name === 'onEnterpriseEdit');
        if (event) {
          console.log('Trigger event:', event.name, { record: editingRecord });
        }
      }
      closeModal();
    },
    [modalType, dataSource, editingRecord, eventList, closeModal]
  );

  // Expose actions via ref
  useImperativeHandle(ref, () => ({
    executeAction: (actionName: string, params?: any) => {
      switch (actionName) {
        case 'refreshList':
          console.log('Action: refreshList');
          break;
        case 'openAddModal':
          openModal('add');
          break;
        case 'openEditModal': {
          const record = dataSource.find((item: any) => item.id === params?.id);
          if (record) openModal('edit', record);
          break;
        }
        case 'openImportModal':
          openImportModal();
          break;
        default:
          console.warn('Unknown action:', actionName);
      }
    },
    getVars: () => ({
      dataSource,
      isModalOpen,
      modalType,
      editingRecord,
    }),
    setVars: (vars: Record<string, any>) => {
      if (vars.dataSource) setDataSource(vars.dataSource);
      if (vars.isModalOpen !== undefined) setIsModalOpen(vars.isModalOpen);
    },
  }));

  // Table columns
  const columns: any[] = [
    {
      title: '序号',
      key: 'index',
      width: 70,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: '企业名称',
      dataIndex: 'enterpriseName',
      key: 'enterpriseName',
      width: 240,
    },
    { title: '统一社会信用代码', dataIndex: 'creditCode', key: 'creditCode', width: 200 },
    { title: '列入来源', dataIndex: 'source', key: 'source', width: 120 },
    { title: '列入组织', dataIndex: 'organization', key: 'organization', width: 120 },
    { title: '列入日期', dataIndex: 'includeDate', key: 'includeDate', width: 120 },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 180 },
    { title: '更新人', dataIndex: 'updater', key: 'updater', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="link" size="small" icon={<Eye size={14} />} onClick={() => openModal('view', record)}>
            查看
          </Button>
          <Button type="link" size="small" icon={<Edit3 size={14} />} onClick={() => openModal('edit', record)}>
            编辑
          </Button>
          <Popconfirm
            title="移出负面企业清单"
            description="移出后该企业将不再命中负面清单校验，是否继续？"
            okText="确认移出"
            cancelText="取消"
            onConfirm={() => handleRemove(record.id)}
          >
            <Button type="link" size="small" danger icon={<Trash2 size={14} />}>
              移除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 筛选后的数据
  const keyword = String(filters.keyword || '').trim().toLowerCase();
  const organizationFilter = filters.organization;
  const filteredData = dataSource.filter((item: any) => {
    if (
      keyword &&
      !item.enterpriseName.toLowerCase().includes(keyword) &&
      !item.creditCode.toLowerCase().includes(keyword)
    ) {
      return false;
    }
    if (organizationFilter && item.organization !== organizationFilter) {
      return false;
    }
    return true;
  });

  return (
    <CentralizedProcurementLayout
      username={currentUser.name}
      activeMenuKey="negative-enterprise-list"
      defaultOpenGroupKeys={['risk-control']}
    >
      {/* 面包屑 */}
      <div className="breadcrumb">
        <span>风控预警中心</span>
        <span className="separator">&gt;</span>
        <span className="current">负面企业清单</span>
      </div>

      {/* 查询区域 */}
      <Card className="search-card" size="small">
        <Form form={searchForm} layout="inline" className="search-form">
          <Form.Item label="企业关键字" name="keyword">
            <Input placeholder="请输入企业名称或统一社会信用代码" allowClear style={{ width: 300 }} />
          </Form.Item>
          <Form.Item label="列入组织" name="organization">
            <Select placeholder="请选择列入组织" allowClear style={{ width: 160 }} options={organizationOptions} />
          </Form.Item>
          <Form.Item className="search-actions">
            <Space>
              <Button type="primary" icon={<Search size={14} />} onClick={handleSearch}>
                查询
              </Button>
              <Button icon={<RotateCcw size={14} />} onClick={handleResetSearch}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 数据表格 */}
      <Card>
        <div className="table-toolbar">
          <div className="toolbar-left">
            <span className="toolbar-title">负面企业清单</span>
            <span className="toolbar-count">共 {filteredData.length} 条</span>
          </div>
          <div className="toolbar-right">
            <Button icon={<UploadIcon size={14} />} onClick={openImportModal}>
              导入
            </Button>
            <Button type="primary" icon={<Plus size={14} />} onClick={() => openModal('add')}>
              新增企业
            </Button>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            total: filteredData.length,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
            defaultPageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          scroll={{ x: 1250 }}
        />
      </Card>

      {/* 新增/编辑/查看弹窗 */}
      <Modal
        title={
          modalType === 'add'
            ? '新增负面企业'
            : modalType === 'view'
              ? '查看负面企业'
              : '编辑负面企业'
        }
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width={620}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 24 }}>
          <Form.Item
            label="企业名称"
            name="enterpriseName"
            rules={[{ required: true, message: '请输入企业名称' }]}
          >
            <Input
              placeholder="请输入企业全称"
              disabled={modalType !== 'add'}
              maxLength={100}
            />
          </Form.Item>

          <Form.Item
            label="统一社会信用代码"
            name="creditCode"
            rules={[
              { required: true, message: '请输入统一社会信用代码' },
              { pattern: /^[0-9A-Z]{18}$/, message: '统一社会信用代码为 18 位数字或大写字母' },
            ]}
          >
            <Input
              placeholder="请输入 18 位统一社会信用代码"
              disabled={modalType !== 'add'}
              maxLength={18}
            />
          </Form.Item>

          <Form.Item
            label="列入来源"
            name="source"
            rules={[{ required: true, message: '请选择列入来源' }]}
          >
            <Select
              placeholder="请选择列入来源"
              options={sourceOptions}
              disabled={modalType === 'view'}
            />
          </Form.Item>

          <Form.Item
            label="列入组织"
            name="organization"
            rules={[{ required: true, message: '请选择列入组织' }]}
          >
            <Select
              placeholder="请选择列入组织"
              options={organizationOptions}
              disabled={modalType === 'view'}
            />
          </Form.Item>

          <Form.Item
            label="列入日期"
            name="includeDate"
            rules={[{ required: true, message: '请选择列入日期' }]}
          >
            <DatePicker
              placeholder="请选择列入日期"
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
              disabled={modalType === 'view'}
            />
          </Form.Item>

          <Form.Item
            label="列入原因"
            name="reason"
            rules={[{ required: true, message: '请输入列入原因' }]}
          >
            <TextArea
              placeholder="请填写列入负面清单的原因，如处罚决定、失信行为等"
              rows={3}
              maxLength={200}
              showCount
              disabled={modalType === 'view'}
            />
          </Form.Item>

          <Form.Item label="备注" name="remark">
            <TextArea
              placeholder="请输入备注信息（选填）"
              rows={2}
              maxLength={200}
              showCount
              disabled={modalType === 'view'}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={closeModal}>{modalType === 'view' ? '关闭' : '取消'}</Button>
              {modalType !== 'view' && (
                <Button type="primary" htmlType="submit">
                  {modalType === 'edit' ? '提交' : '保存'}
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 导入弹窗 */}
      <Modal
        title="导入负面企业清单"
        open={isImportOpen}
        onCancel={closeImportModal}
        onOk={handleImportConfirm}
        okText="确认导入"
        cancelText="取消"
        width={560}
        destroyOnHidden
      >
        <div className="import-tip">
          <span>1、请先下载导入模板，按模板要求填写企业信息后再上传；</span>
          <span>2、支持 .xlsx / .xls / .csv 格式，单次最多导入 500 条；</span>
          <span>3、统一社会信用代码重复的数据将被自动跳过，不覆盖已有记录。</span>
        </div>
        <Upload.Dragger
          accept=".xlsx,.xls,.csv"
          maxCount={1}
          fileList={importFileList}
          beforeUpload={() => false}
          onChange={({ fileList }) => setImportFileList(fileList)}
        >
          <p className="ant-upload-drag-icon">
            <UploadIcon size={28} color="#3a7fc3" />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">仅支持单个文件，文件大小不超过 10MB</p>
        </Upload.Dragger>
        <Button type="link" icon={<Download size={14} />} onClick={openTemplatePreview}>
          下载导入模板
        </Button>
      </Modal>

      {/* 导入模板预览弹窗（模拟下载到的 Excel 内容） */}
      <Modal
        title="负面企业清单导入模板.xlsx"
        open={isTemplateOpen}
        onCancel={closeTemplatePreview}
        width={1000}
        footer={
          <Space>
            <Button onClick={closeTemplatePreview}>关闭</Button>
            <Button type="primary" onClick={handleDownloadTemplate}>
              确认下载
            </Button>
          </Space>
        }
        destroyOnHidden
      >
        <div className="excel-preview">
          <div className="excel-preview-header">
            <FileSpreadsheet size={16} color="#1d6f42" />
            <span className="excel-file-name">负面企业清单导入模板.xlsx</span>
          </div>
          <div className="excel-sheet">
            <table className="excel-table">
              <colgroup>
                <col style={{ width: 40 }} />
                {TEMPLATE_COLUMNS.map((col) => (
                  <col key={col.key} style={{ width: col.width }} />
                ))}
              </colgroup>
              <thead>
                <tr className="excel-col-letter-row">
                  <th className="excel-row-no" />
                  {TEMPLATE_COLUMNS.map((col, index) => (
                    <th key={col.key}>{String.fromCharCode(65 + index)}</th>
                  ))}
                </tr>
                <tr className="excel-header-row">
                  <th className="excel-row-no">1</th>
                  {TEMPLATE_COLUMNS.map((col) => (
                    <th key={col.key}>
                      {col.title}
                      {col.required && <span className="excel-required">*</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TEMPLATE_SAMPLE_ROWS.map((row, index) => (
                  <tr key={index}>
                    <td className="excel-row-no">{index + 2}</td>
                    {TEMPLATE_COLUMNS.map((col) => (
                      <td key={col.key}>{(row as any)[col.key] || ''}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="excel-tip">
            <span>
              带 <span className="excel-required">*</span> 的列为必填项；
            </span>
            <span>「列入来源」仅可填写：外部数据同步 / 人工录入 / 系统检测；</span>
            <span>「列入日期」格式为 YYYY-MM-DD，如 2026-03-12；</span>
            <span>请勿修改模板表头，第 1 行为表头行，示例数据请在导入前删除。</span>
          </div>
        </div>
      </Modal>
    </CentralizedProcurementLayout>
  );
});

Component.displayName = 'NegativeEnterpriseList';

export default Component;
