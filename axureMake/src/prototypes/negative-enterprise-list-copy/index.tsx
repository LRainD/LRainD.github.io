/**
 * @name 采方-负面企业清单维护
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
import 'dayjs/locale/zh-cn';
import {
  Plus,
  Search,
  RotateCcw,
  Edit3,
  Trash2,
  Eye,
  Upload as UploadIcon,
  Download,
  FileSpreadsheet,
  CircleCheck,
  CircleX
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
  Checkbox,
  Popconfirm,
  Spin,
  Row,
  Col,
  Breadcrumb
} from 'antd';
import zhCN from 'antd/locale/zh_CN';
import type {
  AxureProps,
  AxureHandle,
  EventItem
} from '../../common/axure-types';
import {
  currentUser,
  sourceOptions,
  organizationOptions,
  controlCategoryMap,
  controlSituationOptions,
  enterpriseRegistry,
  TEMPLATE_COLUMNS,
  TEMPLATE_SAMPLE_ROWS,
  TEMPLATE_TYPE_OPTIONS,
  GENERAL_TEMPLATE_COLUMNS,
  TEMPLATE_FILE_NAMES,
  initialData
} from './mock';

import CentralizedProcurementLayout, {
  DEFAULT_SIDEBAR_ITEMS
} from '../../components/centralized-procurement-layout';
import type { MenuItem } from '../../components/centralized-procurement-layout';
import './style.css';

dayjs.locale('zh-cn');

const { TextArea } = Input;

// 在「风控预警中心」下补充「棱镜识别系统」菜单
const sidebarItems: MenuItem[] = DEFAULT_SIDEBAR_ITEMS.map((item) => {
  if (item.key === 'risk-control') {
    return {
      ...item,
      children: [
        ...(item.children || []),
        { key: 'prism_identification', label: '棱镜识别分供商' },
      ],
    };
  }
  return item;
});

// --- Component ---

// 单个企业最多可上传的附件数量
const MAX_ATTACHMENT_COUNT = 20;

// 结束时间输入：勾选「长期」后不设置具体结束时间
const EndTimeField = ({ value, onChange, disabled }: any) => {
  const isLongTerm = value === '长期';
  return (
    <Space align="center" size={8}>
      <DatePicker
        format="YYYY-MM-DD"
        style={{ width: 320 }}
        value={isLongTerm || !value ? undefined : value}
        onChange={(val: any) => onChange?.(val)}
        disabled={disabled || isLongTerm}
        placeholder="请选择结束时间"
      />
      <Checkbox
        checked={isLongTerm}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked ? '长期' : undefined)}
      >
        长期
      </Checkbox>
    </Space>
  );
};

const Component = forwardRef<AxureHandle, AxureProps>((props, ref) => {
  const { eventList = [] } = props as AxureProps & { eventList?: EventItem[] };

  // State
  const [dataSource, setDataSource] = useState(initialData);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [attachmentFileList, setAttachmentFileList] = useState<any[]>([]);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [previewAttachments, setPreviewAttachments] = useState<string[]>([]);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'failure'>('idle');
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [templateType, setTemplateType] = useState('cscecInstall');
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const selectedControlSituation = Form.useWatch('controlSituation', form);

  const getCurrentTime = () => dayjs().format('YYYY-MM-DD');

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
      setSelectedRowKeys((prev) => prev.filter((key) => key !== id));
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
    setImportStatus('idle');
    setIsImportOpen(true);
  }, []);

  const closeImportModal = useCallback(() => {
    setIsImportOpen(false);
    setImportStatus('idle');
  }, []);

  const startImportLoading = useCallback(() => {
    setImportStatus('loading');
  }, []);

  const handleImportSuccess = useCallback(() => {
    setImportStatus('success');
  }, []);

  const handleImportConfirm = useCallback(() => {
    message.success('导入成功');
    closeImportModal();
  }, [closeImportModal]);

  const handleImportFailure = useCallback(() => {
    setImportStatus('failure');
  }, []);

  // 上传文件不是规定的导入模板：仅轻提示，不提供失败原因下载
  const handleInvalidTemplate = useCallback(() => {
    message.error('导入模板不正确，请下载标准导入模板后重新上传');
    setImportStatus('idle');
  }, []);

  const handleDownloadFailure = useCallback(() => {
    message.success('失败原因下载中：负面企业清单导入失败原因.xlsx');
  }, []);

  const handleDownloadTemplate = useCallback(() => {
    message.success(`模板下载中：${TEMPLATE_FILE_NAMES[templateType]}`);
    setIsTemplateOpen(false);
  }, [templateType]);

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
          controlSituation: record.controlSituation,
          controlCategory: record.controlCategory,
          includeDate: record.includeDate ? dayjs(record.includeDate) : undefined,
          effectiveTime: record.effectiveTime ? dayjs(record.effectiveTime) : undefined,
          endTime: record.isLongTerm ? '长期' : record.endTime ? dayjs(record.endTime) : undefined,
          reason: record.reason,
          involvedPerson: record.involvedPerson,
          contact: record.contact,
          remark: record.remark,
        });
        setAttachmentFileList(
          (record.attachments || []).map((name: string, index: number) => ({
            uid: `${record.id}-${index}`,
            name,
            status: 'done',
          }))
        );
      } else {
        setEditingRecord(null);
        setAttachmentFileList([]);
        form.resetFields();
        form.setFieldsValue({
          source: '人工录入',
          organization: '中建五洲工程装备有限公司',
          includeDate: dayjs(),
        });
      }
      setIsModalOpen(true);
    },
    [form]
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingRecord(null);
    setAttachmentFileList([]);
    form.resetFields();
  }, [form]);

  const openAttachmentModal = useCallback((attachments: string[]) => {
    setPreviewAttachments(attachments);
    setIsAttachmentOpen(true);
  }, []);

  // 手动修改企业名称或统一社会信用代码时，清空另一项，避免两项信息不一致
  const handleEnterpriseFieldChange = useCallback(
    (field: 'enterpriseName' | 'creditCode') => {
      const otherField = field === 'enterpriseName' ? 'creditCode' : 'enterpriseName';
      if (form.getFieldValue(otherField)) {
        form.setFieldValue(otherField, '');
      }
    },
    [form]
  );

  // 按企业名称或统一社会信用代码查询企业信息，并带出另一项
  const handleQueryEnterprise = useCallback(
    (field: 'enterpriseName' | 'creditCode') => {
      const name = (form.getFieldValue('enterpriseName') || '').trim();
      const code = (form.getFieldValue('creditCode') || '').trim();
      const keyword = field === 'enterpriseName' ? name : code;

      if (!keyword) {
        message.warning(
          field === 'enterpriseName'
            ? '请先输入企业名称或统一社会信用代码'
            : '请先输入统一社会信用代码或企业名称'
        );
        return;
      }

      const matched = enterpriseRegistry.find((item) =>
        field === 'enterpriseName'
          ? item.enterpriseName.includes(keyword)
          : item.creditCode.toUpperCase() === keyword.toUpperCase()
      );

      if (!matched) {
        message.error('未查询到该企业信息，请核对企业名称或统一社会信用代码');
        return;
      }

      form.setFieldsValue({
        enterpriseName: matched.enterpriseName,
        creditCode: matched.creditCode,
      });
      message.success('已查询到企业信息，已自动带出企业名称和统一社会信用代码');
    },
    [form]
  );

  const onFinish = useCallback(
    (values: any) => {
      const currentTime = getCurrentTime();
      const isLongTerm = values.endTime === '长期';
      const commonFields = {
        source: values.source,
        organization: values.organization,
        controlSituation: values.controlSituation,
        controlCategory: values.controlCategory,
        includeDate: values.includeDate ? dayjs(values.includeDate).format('YYYY-MM-DD') : '',
        effectiveTime: values.effectiveTime
          ? dayjs(values.effectiveTime).format('YYYY-MM-DD')
          : '',
        endTime:
          isLongTerm || !values.endTime
            ? ''
            : dayjs(values.endTime).format('YYYY-MM-DD'),
        isLongTerm,
        attachments: attachmentFileList.map((file) => file.name),
        reason: values.reason,
        involvedPerson: values.involvedPerson || '',
        contact: values.contact || '',
        remark: values.remark || '',
      };

      if (modalType === 'add') {
        // 校验统一社会信用代码是否已存在
        if (
          values.creditCode &&
          dataSource.some((item: any) => item.creditCode === values.creditCode)
        ) {
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
    [modalType, dataSource, editingRecord, eventList, attachmentFileList, closeModal]
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
    { title: '录入来源', dataIndex: 'source', key: 'source', width: 120 },
    { title: '列入组织', dataIndex: 'organization', key: 'organization', width: 120 },
    { title: '管控情形', dataIndex: 'controlSituation', key: 'controlSituation', width: 150 },
    { title: '管控类别', dataIndex: 'controlCategory', key: 'controlCategory', width: 220 },
    { title: '列入日期', dataIndex: 'includeDate', key: 'includeDate', width: 120 },
    { title: '生效日期', dataIndex: 'effectiveTime', key: 'effectiveTime', width: 120 },
    {
      title: '结束日期',
      key: 'endTime',
      width: 180,
      render: (_: any, record: any) => (record.isLongTerm ? '长期' : record.endTime || ''),
    },
    {
      title: '涉及人员',
      dataIndex: 'involvedPerson',
      key: 'involvedPerson',
      width: 120,
      render: (value: string) => value || '-',
    },
    {
      title: '涉及人员联系方式',
      dataIndex: 'contact',
      key: 'contact',
      width: 160,
      render: (value: string) => value || '-',
    },
    {
      title: '附件',
      dataIndex: 'attachments',
      key: 'attachments',
      width: 110,
      render: (attachments: string[]) =>
        attachments?.length ? (
          <Button type="link" size="small" onClick={() => openAttachmentModal(attachments)}>
            查看附件
          </Button>
        ) : '-',
    },
    { title: '列入人', dataIndex: 'creator', key: 'creator', width: 140 },
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
    if (filters.controlSituation && item.controlSituation !== filters.controlSituation) {
      return false;
    }
    const creditCodeKeyword = String(filters.creditCode || '').trim().toLowerCase();
    if (creditCodeKeyword && !item.creditCode.toLowerCase().includes(creditCodeKeyword)) {
      return false;
    }
    // 日期范围过滤（YYYY-MM-DD 字符串可直接比较；长期记录无结束日期，筛结束日期时不计入）
    const includeDateRange = filters.includeDateRange;
    if (includeDateRange?.length === 2) {
      const d = item.includeDate;
      if (!d || d < includeDateRange[0].format('YYYY-MM-DD') || d > includeDateRange[1].format('YYYY-MM-DD')) {
        return false;
      }
    }
    const effectiveTimeRange = filters.effectiveTimeRange;
    if (effectiveTimeRange?.length === 2) {
      const d = item.effectiveTime;
      if (!d || d < effectiveTimeRange[0].format('YYYY-MM-DD') || d > effectiveTimeRange[1].format('YYYY-MM-DD')) {
        return false;
      }
    }
    const endTimeRange = filters.endTimeRange;
    if (endTimeRange?.length === 2) {
      const d = item.endTime;
      if (!d || d < endTimeRange[0].format('YYYY-MM-DD') || d > endTimeRange[1].format('YYYY-MM-DD')) {
        return false;
      }
    }
    // 更新时间范围（精确到时分秒）
    const updateTimeRange = filters.updateTimeRange;
    if (updateTimeRange?.length === 2) {
      const t = item.updateTime;
      if (!t || dayjs(t).isBefore(updateTimeRange[0]) || dayjs(t).isAfter(updateTimeRange[1])) {
        return false;
      }
    }
    const creatorKeyword = String(filters.creator || '').trim().toLowerCase();
    if (creatorKeyword && !String(item.creator || '').toLowerCase().includes(creatorKeyword)) {
      return false;
    }
    const updaterKeyword = String(filters.updater || '').trim().toLowerCase();
    if (updaterKeyword && !String(item.updater || '').toLowerCase().includes(updaterKeyword)) {
      return false;
    }
    return true;
  });

  // 表格行选择
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: any[]) => setSelectedRowKeys(keys),
  };

  // 批量删除确认
  const confirmBatchDelete = useCallback(() => {
    const count = selectedRowKeys.length;
    if (!count) return;
    Modal.confirm({
      title: '确认批量删除？',
      content: `已选中 ${count} 条负面企业清单数据，删除后将无法恢复，请确认是否继续。`,
      okText: '确认删除',
      okButtonProps: { danger: true },
      cancelText: '再想想',
      centered: true,
      onOk: () => {
        setDataSource((prev) => prev.filter((item) => !selectedRowKeys.includes(item.id)));
        setSelectedRowKeys([]);
        message.success(`已删除 ${count} 条数据`);
      },
    });
  }, [selectedRowKeys]);

  // 按所选模板类型切换模板列与文件名称
  const templateColumns = templateType === 'cscecInstall' ? TEMPLATE_COLUMNS : GENERAL_TEMPLATE_COLUMNS;
  const templateFileName = TEMPLATE_FILE_NAMES[templateType];

  return (
    <CentralizedProcurementLayout
      username={currentUser.name}
      activeMenuKey="prism_identification"
      sidebarItems={sidebarItems}
      defaultOpenGroupKeys={['risk-control']}
    >
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: '风控预警中心' },
          { title: '棱镜识别系统' },
        ]}
      />

      {/* 查询区域 */}
      <div className="filter-card">
        <div className="filter-title">查询条件</div>
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Row className="filter-form" gutter={[16, 16]}>
            <Col span={8}>
              <div className="filter-item">
                <span className="filter-label">企业关键字：</span>
                <Form.Item name="keyword" noStyle>
                  <Input placeholder="请输入企业名称" allowClear />
                </Form.Item>
              </div>
            </Col>
            <Col span={8}>
              <div className="filter-item">
                <span className="filter-label">统一社会信用代码：</span>
                <Form.Item name="creditCode" noStyle>
                  <Input placeholder="请输入统一社会信用代码" allowClear />
                </Form.Item>
              </div>
            </Col>
            <Col span={8}>
              <div className="filter-item">
                <span className="filter-label">列入组织：</span>
                <Form.Item name="organization" noStyle>
                  <Select placeholder="请选择列入组织" allowClear options={organizationOptions} />
                </Form.Item>
              </div>
            </Col>
            <Col span={8}>
              <div className="filter-item">
                <span className="filter-label">管控情形：</span>
                <Form.Item name="controlSituation" noStyle>
                  <Select placeholder="请选择管控情形" allowClear options={controlSituationOptions} />
                </Form.Item>
              </div>
            </Col>
            <Col span={8}>
              <div className="filter-item">
                <span className="filter-label">列入日期：</span>
                <Form.Item name="includeDateRange" noStyle>
                  <DatePicker.RangePicker locale={zhCN.DatePicker} />
                </Form.Item>
              </div>
            </Col>
            <Col span={8}>
              <div className="filter-item">
                <span className="filter-label">生效日期：</span>
                <Form.Item name="effectiveTimeRange" noStyle>
                  <DatePicker.RangePicker locale={zhCN.DatePicker} />
                </Form.Item>
              </div>
            </Col>
            <Col span={8}>
              <div className="filter-item">
                <span className="filter-label">结束日期：</span>
                <Form.Item name="endTimeRange" noStyle>
                  <DatePicker.RangePicker locale={zhCN.DatePicker} />
                </Form.Item>
              </div>
            </Col>
            <Col span={8}>
              <div className="filter-item">
                <span className="filter-label">更新时间：</span>
                <Form.Item name="updateTimeRange" noStyle>
                  <DatePicker.RangePicker locale={zhCN.DatePicker} showTime />
                </Form.Item>
              </div>
            </Col>
            <Col span={8}>
              <div className="filter-item">
                <span className="filter-label">列入人：</span>
                <Form.Item name="creator" noStyle>
                  <Input placeholder="请输入列入人" allowClear />
                </Form.Item>
              </div>
            </Col>
            <Col span={8}>
              <div className="filter-item">
                <span className="filter-label">更新人：</span>
                <Form.Item name="updater" noStyle>
                  <Input placeholder="请输入更新人" allowClear />
                </Form.Item>
              </div>
            </Col>
            <Col span={24}>
              <Space className="filter-actions">
                <Button type="primary" htmlType="submit" icon={<Search size={14} />} onClick={handleSearch}>
                  查询
                </Button>
                <Button icon={<RotateCcw size={14} />} onClick={handleResetSearch}>
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </div>

      {/* 数据表格 */}
      <Card>
        <div className="table-toolbar">
          <div className="toolbar-left">
            <span className="toolbar-title">负面企业清单</span>
            <span className="toolbar-count">共 {filteredData.length} 条</span>
            <span className="toolbar-selected">共选中 {selectedRowKeys.length} 条数据</span>
          </div>
          <div className="toolbar-right">
            <Button
              danger
              icon={<Trash2 size={14} />}
              disabled={selectedRowKeys.length === 0}
              onClick={confirmBatchDelete}
            >
              批量删除
            </Button>
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
          rowSelection={rowSelection}
          pagination={{
            total: filteredData.length,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
            defaultPageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          scroll={{ x: 2660 }}
        />
      </Card>

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
        width={680}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 24 }}>
          <Form.Item
            label="企业名称"
            name="enterpriseName"
            rules={[{ required: true, message: '请输入企业名称' }]}
          >
            <Input
              placeholder="请输入企业全称，或填写统一社会信用代码后查询"
              disabled={modalType !== 'add'}
              maxLength={100}
              onChange={() => handleEnterpriseFieldChange('enterpriseName')}
              suffix={
                modalType === 'add' ? (
                  <Search
                    size={16}
                    className="enterprise-query-icon"
                    onClick={() => handleQueryEnterprise('enterpriseName')}
                  />
                ) : undefined
              }
            />
          </Form.Item>

          <Form.Item
            label="统一社会信用代码"
            name="creditCode"
            rules={[
              { pattern: /^[0-9A-Z]{18}$/, message: '统一社会信用代码为 18 位数字或大写字母' },
            ]}
          >
            <Input
              placeholder="请输入 18 位统一社会信用代码，或填写企业名称后查询"
              disabled={modalType !== 'add'}
              maxLength={18}
              onChange={() => handleEnterpriseFieldChange('creditCode')}
              suffix={
                modalType === 'add' ? (
                  <Search
                    size={16}
                    className="enterprise-query-icon"
                    onClick={() => handleQueryEnterprise('creditCode')}
                  />
                ) : undefined
              }
            />
          </Form.Item>

          <Form.Item
            label="录入来源"
            name="source"
            rules={[{ required: true, message: '请选择录入来源' }]}
          >
            <Select placeholder="请选择录入来源" options={sourceOptions} disabled />
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
            label="管控情形"
            name="controlSituation"
            rules={[{ required: true, message: '请选择管控情形' }]}
          >
            <Select
              placeholder="请选择管控情形"
              options={controlSituationOptions}
              disabled={modalType === 'view'}
              onChange={(value) => {
                form.setFieldValue('controlCategory', controlCategoryMap[value]);
              }}
            />
          </Form.Item>

          <Form.Item
            label="管控类别"
            name="controlCategory"
            rules={
              selectedControlSituation
                ? [{ required: true, message: '请输入管控类别' }]
                : []
            }
          >
            <Input
              placeholder={
                selectedControlSituation === '其他管控情形'
                  ? '请输入管控类别'
                  : '选择管控情形后自动带出'
              }
              disabled={modalType === 'view' || selectedControlSituation !== '其他管控情形'}
              maxLength={100}
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
              disabled
            />
          </Form.Item>

          <Form.Item
            label="生效日期"
            name="effectiveTime"
            dependencies={['endTime']}
            rules={[
              { required: true, message: '请选择生效日期' },
              ({ getFieldValue }) => ({
                validator: (_, value) => {
                  const end = getFieldValue('endTime');
                  if (!value || !end || end === '长期') return Promise.resolve();
                  if (dayjs(end).isBefore(dayjs(value), 'day')) {
                    return Promise.reject(new Error('结束日期不得早于生效日期'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker
              placeholder="请选择生效日期"
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
              disabled={modalType === 'view'}
            />
          </Form.Item>

          <Form.Item
            label="结束日期"
            name="endTime"
            dependencies={['effectiveTime']}
            rules={[
              { required: true, message: '请选择结束日期，或勾选「长期」' },
              ({ getFieldValue }) => ({
                validator: (_, value) => {
                  const effective = getFieldValue('effectiveTime');
                  if (!value || value === '长期' || !effective) return Promise.resolve();
                  if (dayjs(value).isBefore(dayjs(effective), 'day')) {
                    return Promise.reject(new Error('结束日期不得早于生效日期'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <EndTimeField disabled={modalType === 'view'} />
          </Form.Item>

          <Form.Item
            label="列入原因"
            name="reason"
            rules={[{ required: true, message: '请输入列入原因' }]}
          >
            <TextArea
              placeholder="请填写列入负面清单的原因，如处罚决定、失信行为等"
              rows={3}
              maxLength={2000}
              showCount
              disabled={modalType === 'view'}
            />
          </Form.Item>

          <Form.Item label="涉及人员" name="involvedPerson">
            <Input
              placeholder="请输入涉及人员姓名（选填）"
              maxLength={2000}
              disabled={modalType === 'view'}
            />
          </Form.Item>

          <Form.Item label="涉及人员联系方式" name="contact">
            <Input
              placeholder="请输入涉及人员联系方式（选填）"
              maxLength={2000}
              disabled={modalType === 'view'}
            />
          </Form.Item>

          <Form.Item label="备注" name="remark">
            <TextArea
              placeholder="请输入备注信息（选填）"
              rows={2}
              maxLength={2000}
              showCount
              disabled={modalType === 'view'}
            />
          </Form.Item>

          <Form.Item label="附件">
            <Upload
              multiple
              fileList={attachmentFileList}
              beforeUpload={() => false}
              onChange={({ fileList }) => {
                if (fileList.length > MAX_ATTACHMENT_COUNT) {
                  message.warning(`附件数量最多 ${MAX_ATTACHMENT_COUNT} 个`);
                  setAttachmentFileList(fileList.slice(0, MAX_ATTACHMENT_COUNT));
                  return;
                }
                setAttachmentFileList(fileList);
              }}
              disabled={modalType === 'view'}
            >
              {modalType !== 'view' && (
                <Button icon={<UploadIcon size={14} />}>上传附件</Button>
              )}
            </Upload>
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

      <Modal
        title="附件列表"
        open={isAttachmentOpen}
        onCancel={() => setIsAttachmentOpen(false)}
        footer={
          <Button onClick={() => setIsAttachmentOpen(false)}>关闭</Button>
        }
        width={520}
        destroyOnHidden
      >
        <div className="attachment-list">
          {previewAttachments.map((name, index) => (
            <Button
              key={`${name}-${index}`}
              type="link"
              icon={<Download size={14} />}
              onClick={() => message.success(`开始下载：${name}`)}
            >
              {name}
            </Button>
          ))}
        </div>
      </Modal>

      {/* 导入弹窗 */}
      <Modal
        title="导入负面企业清单"
        open={isImportOpen}
        onCancel={closeImportModal}
        footer={
          <Space>
            <Button onClick={closeImportModal}>关闭</Button>
            {importStatus === 'success' && (
              <Popconfirm
                title="确认导入"
                description="确认后将导入本次校验通过的数据。"
                okText="确认导入"
                cancelText="取消"
                onConfirm={handleImportConfirm}
              >
                <Button type="primary">确认导入</Button>
              </Popconfirm>
            )}
          </Space>
        }
        width={560}
        destroyOnHidden
      >
        <div className="import-tip">
          <span>1、请先下载导入模板，按模板要求填写企业信息后再上传；</span>
          <span>3、请注意！导入不会校验重复数据，请谨慎操作，避免重复导入过多数据。</span>
        </div>
        <div className="import-template-action">
          <span className="import-template-label">导入模板：</span>
          <Select
            className="import-template-select"
            value={templateType}
            onChange={setTemplateType}
            options={TEMPLATE_TYPE_OPTIONS}
          />
          <Button type="link" icon={<Download size={14} />} onClick={openTemplatePreview}>
            下载导入模板
          </Button>
        </div>

        {importStatus === 'success' && (
          <div className="import-result import-result-success">
            <CircleCheck size={40} />
            <strong>校验成功</strong>
            <span>本次共校验通过 3 条数据</span>
          </div>
        )}

        {importStatus === 'failure' && (
          <div className="import-result import-result-failure">
            <CircleX size={40} />
            <strong>导入失败</strong>
            <span>文件中存在不符合要求的数据，请下载失败原因查看</span>
            <Button
              className="import-failure-download"
              type="link"
              size="small"
              icon={<Download size={14} />}
              onClick={handleDownloadFailure}
            >
              下载失败原因
            </Button>
          </div>
        )}

        {(importStatus === 'idle' || importStatus === 'failure') && (
          <button type="button" className="import-upload-box" onClick={startImportLoading}>
            <UploadIcon size={28} />
            <span className="import-upload-title">点击或拖拽文件到此区域上传</span>
            <span className="import-upload-hint">仅支持单个文件，文件大小不超过 10MB</span>
          </button>
        )}

        {importStatus === 'loading' && (
          <div className="import-loading">
            <Spin size="large" />
            <strong>文件上传解析中...</strong>
            <span>请稍候，正在读取导入数据</span>
            <Space size={8}>
              <Button size="small" type="primary" onClick={handleImportSuccess}>成功</Button>
              <Button size="small" danger onClick={handleImportFailure}>失败</Button>
              <Button size="small" onClick={handleInvalidTemplate}>模板不符</Button>
            </Space>
          </div>
        )}
      </Modal>

      {/* 导入模板预览弹窗（模拟下载到的 Excel 内容） */}
      <Modal
        title={templateFileName}
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
            <span className="excel-file-name">{templateFileName}</span>
          </div>
          <div className="excel-sheet">
            <table className="excel-table">
              <colgroup>
                <col style={{ width: 40 }} />
                {templateColumns.map((col) => (
                  <col key={col.key} style={{ width: col.width }} />
                ))}
              </colgroup>
              <thead>
                <tr className="excel-col-letter-row">
                  <th className="excel-row-no" />
                  {templateColumns.map((col, index) => (
                    <th key={col.key}>{String.fromCharCode(65 + index)}</th>
                  ))}
                </tr>
                <tr className="excel-header-row">
                  <th className="excel-row-no">1</th>
                  {templateColumns.map((col) => (
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
                    {templateColumns.map((col) => (
                      <td key={col.key}>{(row as any)[col.key] || ''}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="excel-tip">
            <span>带 <span className="excel-required">*</span> 的列为必填项；</span>
            <span>「统一社会信用代码」为选填，填写时须为 18 位数字或大写字母；</span>
            <span>「生效时间」「结束时间」格式为 YYYY-MM-DD，如 2026-03-12；结束时间可填写「长期」，且不得早于生效时间；</span>
            <span>请勿修改模板表头，第 1 行为表头行，示例数据请在导入前删除。</span>
          </div>
        </div>
      </Modal>
    </CentralizedProcurementLayout>
  );
});

Component.displayName = 'NegativeEnterpriseList';

export default Component;
