/**
 * @name 检查模板列表与编辑
 * @mode axure
 * 
 * 参考资料：
 * - /Users/liurundong/Desktop/remote_demo_project/LRainD.github.io/axureMake/docs/四局一单一检/prd.md
 * - /Users/liurundong/Desktop/remote_demo_project/LRainD.github.io/axureMake/src/prototypes/check-template-mgmt/spec.md
 */

import './style.css';
import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import {
  Form,
  Input,
  Button,
  Table,
  Space,
  Tag,
  Popconfirm,
  message,
  Select,
  TreeSelect,
  DatePicker,
  Breadcrumb,
  Modal,
  Radio,
  Tooltip,
  Cascader
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  CopyOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  MenuOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import type {
  AxureProps,
  AxureHandle
} from '../../common/axure-types';

import CentralizedProcurementLayout from '../../components/centralized-procurement-layout';
import TopActionBar from '../../components/top-action-bar';

const { RangePicker } = DatePicker;

// --- Constants ---

const STAGE_OPTIONS = [
  {
    value: '招标/采购阶段',
    label: '招标/采购阶段',
    children: [
      { value: '约标阶段', label: '约标阶段' },
      { value: '发标阶段', label: '发标阶段' },
      { value: '开标阶段', label: '开标阶段' },
      { value: '评标阶段', label: '评标阶段' },
      { value: '定标阶段', label: '定标阶段' },
    ],
  },
  {
    value: '合同阶段',
    label: '合同阶段',
  },
];

const ORGANIZATION_TREE = [
  {
    title: '中国建筑股份有限公司',
    value: '中国建筑股份有限公司',
    children: [
      {
        title: '中国建筑第四工程局有限公司',
        value: '中国建筑第四工程局有限公司',
        children: [
          { title: '第一建设有限公司', value: '中建四局第一建设有限公司' },
          { title: '第二建设有限公司', value: '中建四局第二建设有限公司' },
          { title: '安装工程有限公司', value: '中建四局安装工程有限公司' },
          { title: '建设发展有限公司', value: '中建四局建设发展有限公司' },
        ],
      },
      {
        title: '中国建筑第二工程局有限公司',
        value: '中国建筑第二工程局有限公司',
        children: [
          { title: '北京分公司', value: '中建二局北京分公司' },
          { title: '华东分公司', value: '中建二局华东分公司' },
        ],
      },
      {
        title: '中国建筑第三工程局有限公司',
        value: '中国建筑第三工程局有限公司',
        children: [
          { title: '总承包公司', value: '中建三局总承包公司' },
          { title: '基础设施公司', value: '中建三局基础设施公司' },
        ],
      },
    ],
  },
];

const CHECK_TYPE_OPTIONS = ['自查', '互查', '稽查'].map(value => ({ label: value, value }));

const SYSTEM_RULE_OPTIONS = [
  { label: '投标时间过短', value: 'rule_bidding_duration_check' },
  { label: '报名时间过短', value: 'rule_registration_duration_check' },
  { label: '采购项目关联性检测', value: 'rule_procurement_association' },
  { label: '合同金额与中标金额一致性', value: 'rule_contract_amount_check' },
];

const getSystemRuleLabel = (rule: string) => (
  SYSTEM_RULE_OPTIONS.find(option => option.value === rule)?.label || rule
);

const createScopeConfig = (types: string[] = ['自查']) => ({
  id: `scope_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  organizations: ['中国建筑第四工程局有限公司'],
  checkTypes: types,
});

const getTemplateTypes = (scopeConfigs: any[] = [], fallbackTypes: string[] = []) => {
  const types = scopeConfigs.flatMap(scope => scope.checkTypes || []);
  return Array.from(new Set(types.length > 0 ? types : fallbackTypes));
};

// --- Mock Data ---

const initialTemplates = [
  {
    id: 'tpl_1',
    name: '四局普通合同检查模板',
    version: 'V1.0',
    types: ['自查', '互查', '稽查'],
    status: '已发布', // 已发布, 草稿, 已停用
    itemCount: 8,
    systemItemCount: 2,
    effectiveTime: '2026-01-01 00:00:00',
    updateTime: '2026-08-20 10:00:00',
    updater: 'admin',
    remark: '适用于四局范围内所有普通合同的合规性检查，包含约标、发标、合同签订等阶段。',
    items: [
      {
        id: 'item_1_1_1',
        stage: ['招标/采购阶段', '约标阶段'],
        name: '采购项目关联性检测',
        standard: '检查合同是否正确关联了经审批的采购项目，项目编号与名称需完全一致。',
        type: '系统识别',
        risk: '高',
        required: true,
        status: true,
        remarkRule: '不合规时必填',
        fileRule: '不合规时必填',
        systemRule: 'rule_procurement_association'
      },
      {
        id: 'item_1_1_2',
        stage: ['招标/采购阶段', '约标阶段'],
        name: '约标文件合规性审查',
        standard: '审查约标文件是否包含完整的技术规格书、商务条款及合规承诺书。',
        type: '人工检查',
        risk: '中',
        required: true,
        status: true,
        remarkRule: '非必填',
        fileRule: '始终必填'
      },
      {
        id: 'item_1_2_1',
        stage: ['招标/采购阶段', '发标阶段'],
        name: '招标文件发布时限校验',
        standard: '自招标文件开始发出之日起至投标人提交投标文件截止之日止，最短不得少于二十日。',
        type: '系统识别',
        risk: '高',
        required: true,
        status: true,
        remarkRule: '不合规时必填',
        fileRule: '非必填',
        systemRule: 'rule_bidding_duration_check'
      },
      {
        id: 'item_1_2_2',
        stage: ['招标/采购阶段', '发标阶段'],
        name: '投标人资格条件设置审查',
        standard: '检查是否设置了排他性、歧视性的资格条件，是否限定了特定的专利、品牌或特定行政区域。',
        type: '人工检查',
        risk: '高',
        required: true,
        status: true,
        remarkRule: '不合规时必填',
        fileRule: '不合规时必填'
      },
      {
        id: 'item_1_3_1',
        stage: ['合同阶段'],
        name: '合同主体资格审查',
        standard: '签约对方必须是依法成立的法人、其他组织或具有完全民事行为能力的个人，需提供最新营业执照。',
        type: '人工检查',
        risk: '高',
        required: true,
        status: true,
        remarkRule: '始终必填',
        fileRule: '始终必填'
      },
      {
        id: 'item_1_3_2',
        stage: ['合同阶段'],
        name: '合同金额与中标金额一致性',
        standard: '合同约定的价款、履行期限、违约责任等实质性内容应当与招标文件和中标人的投标文件一致。',
        type: '人工检查',
        risk: '高',
        required: true,
        status: true,
        remarkRule: '不合规时必填',
        fileRule: '非必填'
      },
      {
        id: 'item_1_3_3',
        stage: ['合同阶段'],
        name: '采购前置共享事项引用',
        standard: '引用采购项目前置审批结果，如采购方案审批、单一来源论证等。',
        type: '共享引用',
        risk: '低',
        required: false,
        status: true,
        remarkRule: '非必填',
        fileRule: '非必填'
      }
    ]
  },
  {
    id: 'tpl_2',
    name: '两阶段采购项目稽查模板',
    version: 'V2.1 (草稿)',
    types: ['稽查'],
    status: '草稿',
    itemCount: 4,
    systemItemCount: 0,
    effectiveTime: '-',
    updateTime: '2026-08-25 14:30:00',
    updater: 'admin',
    remark: '专门用于两阶段招标采购项目的局级稽查，重点关注第一阶段技术方案和第二阶段商务报价。',
    items: [
      {
        id: 'item_2_1_1',
        stage: ['招标/采购阶段', '评标阶段'],
        name: '技术方案评审记录完整性',
        standard: '检查是否组织了专家对各投标人提交的技术方案进行评审，并形成完整的评审报告。',
        type: '人工检查',
        risk: '高',
        required: true,
        status: true,
        remarkRule: '始终必填',
        fileRule: '始终必填'
      },
      {
        id: 'item_2_2_1',
        stage: ['招标/采购阶段', '定标阶段'],
        name: '商务招标文件发放范围一致性',
        standard: '第二阶段商务招标文件只能向在第一阶段提交了技术方案并符合要求的投标人发放。',
        type: '人工检查',
        risk: '高',
        required: true,
        status: true,
        remarkRule: '不合规时必填',
        fileRule: '始终必填'
      }
    ]
  },
  {
    id: 'tpl_3',
    name: '框架协议专项检查模板',
    version: 'V0.8',
    types: ['自查', '互查'],
    status: '已停用',
    itemCount: 3,
    systemItemCount: 1,
    effectiveTime: '2025-01-01 00:00:00',
    updateTime: '2026-05-20 11:20:00',
    updater: 'admin',
    remark: '历史使用的框架协议专项检查模板，现已被新版普通合同模板替代。',
    items: [
      {
        id: 'item_3_1_1',
        stage: ['合同阶段'],
        name: '协议有效期限制检测',
        standard: '框架协议有效期原则上不得超过两年。',
        type: '系统识别',
        risk: '中',
        required: true,
        status: true,
        remarkRule: '不合规时必填',
        fileRule: '非必填',
        systemRule: 'rule_framework_duration_check'
      }
    ]
  }
];

const Component = forwardRef<AxureHandle, AxureProps>((props, ref) => {
  const [view, setView] = useState<'list' | 'form' | 'preview'>('list');
  const [templates, setTemplates] = useState(initialTemplates);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [form] = Form.useForm();

  // --- 列表页操作 ---

  const handleSearch = useCallback(() => {
    message.info('执行查询操作');
  }, []);

  const handleReset = useCallback(() => {
    message.info('重置查询条件');
  }, []);

  const goList = useCallback(() => {
    setView('list');
    setEditingTemplate(null);
  }, []);

  const goForm = useCallback((template: any = null) => {
    if (template) {
      // 深度拷贝，避免直接修改原数据
      const copy = JSON.parse(JSON.stringify(template));
      form.setFieldsValue({
        name: copy.name,
        remark: copy.remark
      });
      copy.scopeConfigs = (copy.scopeConfigs || [createScopeConfig(copy.types)]).map((scope: any) => ({
        ...scope,
        organizations: scope.organizations || (scope.organization ? [scope.organization] : ['中国建筑第四工程局有限公司']),
      }));
      copy.types = getTemplateTypes(copy.scopeConfigs, copy.types);
      setEditingTemplate(copy);
    } else {
      // 新建模板
      const newTpl = {
        id: 'tpl_' + Date.now(),
        name: '',
        version: 'V1.0 (草稿)',
        types: ['自查'],
        scopeConfigs: [createScopeConfig(['自查'])],
        status: '草稿',
        itemCount: 0,
        systemItemCount: 0,
        effectiveTime: '-',
        updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updater: 'admin',
        remark: '',
        items: []
      };
      setEditingTemplate(newTpl);
      form.resetFields();
    }
    setView('form');
  }, [form]);

  const goPreview = useCallback((template: any) => {
    setEditingTemplate(template);
    setView('preview');
  }, []);

  const handleCopy = useCallback((template: any) => {
    const newTpl = JSON.parse(JSON.stringify(template));
    newTpl.id = 'tpl_' + Date.now();
    newTpl.version = 'V1.0 (草稿)';
    newTpl.status = '草稿';
    newTpl.effectiveTime = '-';
    newTpl.updateTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
    newTpl.updater = 'admin';
    goForm(newTpl);
  }, [goForm]);

  const handleStop = useCallback((id: string) => {
    setTemplates(templates.map(t => t.id === id ? { ...t, status: '已停用' } : t));
    message.success('模板已停用');
  }, [templates]);

  const handleDelete = useCallback((id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    message.success('删除成功');
  }, [templates]);

  // --- 编辑页操作 ---

  // 检查项管理
  const handleAddItem = () => {
    const newItem = {
      id: 'item_' + Date.now(),
      stage: ['招标/采购阶段', '约标阶段'],
      name: '新检查项',
      standard: '请填写检查标准',
      type: '人工检查',
      risk: '中',
      required: true,
      status: true,
      remarkRule: '不合规时必填',
      fileRule: '非必填'
    };
    setEditingTemplate({
      ...editingTemplate,
      items: [...(editingTemplate.items || []), newItem]
    });
    message.success('已添加新检查项');
  };

  const handleCopyItem = (item: any) => {
    const newItem = {
      ...JSON.parse(JSON.stringify(item)),
      id: 'item_' + Date.now(),
      name: `${item.name} - 副本`
    };
    setEditingTemplate({
      ...editingTemplate,
      items: [...(editingTemplate.items || []), newItem]
    });
    message.success('已复制检查项');
  };

  const handleDeleteItem = (itemId: string) => {
    setEditingTemplate({
      ...editingTemplate,
      items: editingTemplate.items.filter((i: any) => i.id !== itemId)
    });
    message.success('检查项已删除');
  };

  const handleUpdateItemField = (itemId: string, field: string, value: any) => {
    const updatedItems = editingTemplate.items.map((i: any) => 
      i.id === itemId ? { ...i, [field]: value } : i
    );
    setEditingTemplate({
      ...editingTemplate,
      items: updatedItems
    });
  };

  const handleAddScopeConfig = () => {
    const scopeConfigs = [...(editingTemplate.scopeConfigs || []), createScopeConfig()];
    setEditingTemplate({
      ...editingTemplate,
      scopeConfigs,
      types: getTemplateTypes(scopeConfigs, editingTemplate.types)
    });
  };

  const handleUpdateScopeConfig = (scopeId: string, field: string, value: any) => {
    const scopeConfigs = (editingTemplate.scopeConfigs || []).map((scope: any) => (
      scope.id === scopeId ? { ...scope, [field]: value } : scope
    ));
    setEditingTemplate({
      ...editingTemplate,
      scopeConfigs,
      types: getTemplateTypes(scopeConfigs, editingTemplate.types)
    });
  };

  const handleDeleteScopeConfig = (scopeId: string) => {
    const scopeConfigs = (editingTemplate.scopeConfigs || []).filter((scope: any) => scope.id !== scopeId);
    if (scopeConfigs.length === 0) {
      message.warning('请至少保留一条适用范围配置');
      return;
    }
    setEditingTemplate({
      ...editingTemplate,
      scopeConfigs,
      types: getTemplateTypes(scopeConfigs, editingTemplate.types)
    });
  };

  // 保存整个模板
  const handleSaveTemplate = () => {
    form.validateFields().then(values => {
      // 计算数量
      const totalItems = editingTemplate.items?.length || 0;
      const systemItems = editingTemplate.items?.filter((i: any) => i.type === '系统识别').length || 0;

      const templateTypes = getTemplateTypes(editingTemplate.scopeConfigs, editingTemplate.types);
      if (templateTypes.length === 0) {
        message.error('请至少为一条适用范围配置选择适用检查类型');
        return;
      }

      const updatedTpl = {
        ...editingTemplate,
        name: values.name,
        types: templateTypes,
        remark: values.remark,
        itemCount: totalItems,
        systemItemCount: systemItems,
        updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
      };

      const hasDuplicateName = templates.some(template => (
        template.id !== updatedTpl.id && template.name.trim() === updatedTpl.name.trim()
      ));
      if (hasDuplicateName) {
        message.error('模板名称重复，请修改后再保存');
        return;
      }

      const exists = templates.some(t => t.id === updatedTpl.id);
      if (exists) {
        setTemplates(templates.map(t => t.id === updatedTpl.id ? updatedTpl : t));
      } else {
        setTemplates([updatedTpl, ...templates]);
      }
      message.success('模板草稿保存成功');
      goList();
    });
  };

  // 发布校验与发布
  const handlePublishTemplate = (tpl: any) => {
    const publishTemplate = (template: any) => {
      const hasDuplicateName = templates.some(item => (
        item.id !== template.id && item.name.trim() === template.name.trim()
      ));
      if (hasDuplicateName) {
        message.error('模板名称重复，请修改后再提交');
        return;
      }

    // 校验规则：
    // 1. 必须至少存在一个检查项
    if (!template.items || template.items.length === 0) {
      Modal.error({
        title: '发布校验失败',
        icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
        content: '模板发布前，必须至少配置一个检查项。'
      });
      return;
    }

    const errors: string[] = [];
    // 2. 系统识别项发布前必须关联具体的系统规则
    template.items?.forEach((i: any) => {
      if (i.type === '系统识别' && !i.systemRule) {
        errors.push(`系统识别项 [${i.name}] 缺少具体系统规则配置`);
      }
    });

    if (errors.length > 0) {
      Modal.error({
        title: '发布校验失败',
        width: 600,
        content: (
          <div>
            <p>系统检测到以下配置不符合发布要求，请修改后再试：</p>
            <ul style={{ paddingLeft: 20, color: '#ff4d4f' }}>
              {errors.map((err, idx) => <li key={idx} style={{ marginBottom: 6 }}>{err}</li>)}
            </ul>
          </div>
        )
      });
      return;
    }

    // 校验通过，执行发布
    Modal.confirm({
      title: '确认发布模板版本吗？',
      content: `发布后将更新模板状态为“已发布”`,
      onOk: () => {
        const publishedTpl = {
          ...template,
          status: '已发布',
          version: template.version.replace(' (草稿)', ''),
          effectiveTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        };
        const exists = templates.some(item => item.id === template.id);
        setTemplates(exists
          ? templates.map(item => item.id === template.id ? publishedTpl : item)
          : [publishedTpl, ...templates]
        );
        message.success('模板发布成功！');
        if (view !== 'list') {
          goList();
        }
      }
    });
    };

    if (view === 'form') {
      form.validateFields().then(values => {
        publishTemplate({
          ...tpl,
          name: values.name,
          remark: values.remark,
          types: getTemplateTypes(tpl.scopeConfigs, tpl.types),
          itemCount: tpl.items?.length || 0,
          systemItemCount: tpl.items?.filter((item: any) => item.type === '系统识别').length || 0,
          updateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        });
      });
      return;
    }

    publishTemplate(tpl);
  };

  // --- Expose actions ---
  useImperativeHandle(ref, () => ({
    executeAction: (actionName: string, params?: any) => {
      console.log('Action:', actionName, params);
    },
    getVars: () => ({ view, templates }),
    setVars: (vars: any) => {
      if (vars.view) setView(vars.view);
    }
  }));
  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 70,
      render: (_: any, __: any, index: number) => index + 1
    },
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text: string, record: any) => (
        <div style={{ fontWeight: 500, color: '#1890ff', cursor: 'pointer' }} onClick={() => goPreview(record)}>{text}</div>
      )
    },
    {
      title: '模板说明/适用范围',
      dataIndex: 'remark',
      key: 'remark',
      width: 280,
      render: (remark: string) => <span className="template-remark-cell">{remark || '暂无描述'}</span>
    },
    {
      title: '适用组织',
      key: 'organizations',
      width: 220,
      render: (_: any, record: any) => {
        const organizations = Array.from(new Set(
          (record.scopeConfigs || []).flatMap((scope: any) => scope.organizations || [])
        )) as string[];
        const displayOrganizations = organizations.length > 0 ? organizations : ['中国建筑第四工程局有限公司'];
        return <span className="template-organization-cell">{displayOrganizations.join('、')}</span>;
      }
    },
    {
      title: '适用检查类型',
      dataIndex: 'types',
      key: 'types',
      width: 180,
      render: (types: string[]) => (
        <Space size={[0, 4]} wrap>
          {types.map(t => {
            let color = 'blue';
            if (t === '互查') color = 'purple';
            if (t === '稽查') color = 'orange';
            return <Tag color={color} key={t}>{t}</Tag>;
          })}
        </Space>
      )
    },
    {
      title: '检查项总数',
      key: 'itemCount',
      width: 150,
      render: (_: any, record: any) => {
        const systemCount = record.systemItemCount || 0;
        const totalCount = record.itemCount || 0;
        const manualCount = totalCount - systemCount;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div>人工项：{manualCount} 项</div>
            <div>系统项：{systemCount} 项</div>
          </div>
        );
      }
    },
    {
      title: '生效时间',
      dataIndex: 'effectiveTime',
      key: 'effectiveTime',
      width: 180,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        let color = 'default';
        if (status === '已发布') color = 'success';
        if (status === '已停用') color = 'error';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: '更新人',
      dataIndex: 'updater',
      key: 'updater',
      width: 100,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      width: 220,
      render: (_: any, record: any) => (
        <Space size="middle">
          {record.status === '草稿' && (
            <>
              <a onClick={() => goForm(record)}>编辑</a>
              <a onClick={() => handlePublishTemplate(record)} style={{ color: '#52c41a' }}>发布</a>
              <Popconfirm title="确定删除该模板草稿吗？" onConfirm={() => handleDelete(record.id)}>
                <a style={{ color: '#ff4d4f' }}>删除</a>
              </Popconfirm>
            </>
          )}
          {record.status === '已发布' && (
            <>
              <Popconfirm title="确定停用该模板吗？停用后新任务将无法匹配此模板。" onConfirm={() => handleStop(record.id)}>
                <a style={{ color: '#faad14' }}>停用</a>
              </Popconfirm>
            </>
          )}
          {record.status === '已停用' && (
            <>
              <a onClick={() => handleCopy(record)}>复制</a>
              <Popconfirm title="确定删除该停用模板吗？" onConfirm={() => handleDelete(record.id)}>
                <a style={{ color: '#ff4d4f' }}>删除</a>
              </Popconfirm>
            </>
          )}
          <a onClick={() => goPreview(record)}>预览</a>
        </Space>
      )
    }
  ];

  return ( <CentralizedProcurementLayout
      username="jctest1"
      activeMenuKey="check-template-mgmt"
    >
      <div className="check-template-mgmt-page">
        {view === 'list' && (
          <>
            <div className="breadcrumb-bar template-form-breadcrumb">
              <Breadcrumb items={[
                { title: '首页' },
                { title: '招标采购' },
                { title: '一单一检' },
                { title: '检查模板' }
              ]} />
            </div>

            <div className="content-wrapper">
              <div className="filter-card" style={{ background: '#fff', padding: 24, borderRadius: 8, marginBottom: 16, border: '1px solid #f0f0f0' }}>
                <div className="filter-title" style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>查询条件</div>
                <Form className="template-filter-form" layout="inline" onFinish={handleSearch}>
                  <Form.Item label="模板名称">
                    <Input placeholder="请输入" style={{ width: 200 }} />
                  </Form.Item>
                  <Form.Item label="适用检查类型">
                    <Select
                      mode="multiple"
                      placeholder="请选择"
                      style={{ width: 220 }}
                      options={[
                        { label: '自查', value: '自查' },
                        { label: '互查', value: '互查' },
                        { label: '稽查', value: '稽查' },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item label="模板状态">
                    <Select
                      placeholder="请选择"
                      style={{ width: 150 }}
                      allowClear
                      options={[
                        { label: '草稿', value: '草稿' },
                        { label: '已发布', value: '已发布' },
                        { label: '已停用', value: '已停用' },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item label="生效时间">
                    <RangePicker style={{ width: 240 }} />
                  </Form.Item>
                  <Form.Item className="template-filter-actions">
                    <Space>
                      <Button type="primary" icon={<SearchOutlined />} htmlType="submit">查询</Button>
                      <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
                    </Space>
                  </Form.Item>
                </Form>
              </div>

              <div style={{ background: '#fff', padding: 24, borderRadius: 8, border: '1px solid #f0f0f0' }}>
                <div className="table-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>模板列表</div>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => goForm()}>
                    新增检查模板
                  </Button>
                </div>
                <Table
                  columns={columns}
                  dataSource={templates}
                  rowKey="id"
                  scroll={{ x: 1800 }}
                  pagination={{
                    showTotal: (total) => `共 ${total} 条记录`,
                    showSizeChanger: true,
                    showQuickJumper: true,
                  }}
                />
              </div>
            </div>
          </>
        )}

        {view === 'form' && editingTemplate && (
          <>
            <div className="breadcrumb-bar template-form-breadcrumb">
              <Breadcrumb items={[
                { title: '首页' },
                { title: '招标采购' },
                { title: '一单一检' },
                { title: '检查模板', onClick: goList, className: 'clickable-breadcrumb' },
                { title: editingTemplate.id.startsWith('tpl_1') || editingTemplate.id.startsWith('tpl_2') || editingTemplate.id.startsWith('tpl_3') ? '编辑检查模板' : '新增检查模板' }
              ]} />
            </div>

            <TopActionBar
              className="template-detail-header"
              title={editingTemplate.id.startsWith('tpl_1') || editingTemplate.id.startsWith('tpl_2') || editingTemplate.id.startsWith('tpl_3') ? '编辑检查模板' : '新增检查模板'}
              actions={(
                <Space className="template-detail-header-actions">
                  <Button onClick={handleSaveTemplate}>保存草稿</Button>
                  <Button type="primary" onClick={() => handlePublishTemplate(editingTemplate)}>发布</Button>
                  <Button onClick={goList}>取消</Button>
                </Space>
              )}
            />

            <div className="content-wrapper">
              <div className="template-detail-content">

                <Form
                  form={form}
                  layout="vertical"
                >
                  <div className="form-section-title">基础配置</div>
                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <Form.Item
                      label="模板名称"
                      name="name"
                      rules={[{ required: true, message: '请输入模板名称' }]}
                      style={{ width: 'calc(50% - 12px)' }}
                    >
                      <Input placeholder="例如：四局普通合同检查模板" />
                    </Form.Item>
                    <Form.Item
                      label="模板说明/适用范围"
                      name="remark"
                      style={{ width: '100%' }}
                    >
                      <Input.TextArea rows={2} placeholder="请输入模板的适用范围和说明" />
                    </Form.Item>
                  </div>
                </Form>

                <div className="form-section-title" style={{ marginTop: 24 }}>适用范围配置</div>
                <div className="scope-config-table">
                  <Table
                    dataSource={editingTemplate.scopeConfigs || []}
                    rowKey="id"
                    pagination={false}
                    bordered
                    size="middle"
                    locale={{ emptyText: '暂无适用范围配置' }}
                  >
                    <Table.Column
                      title="组织"
                      dataIndex="organizations"
                      width={220}
                      render={(value, record: any) => (
                        <TreeSelect
                          treeData={ORGANIZATION_TREE}
                          treeCheckable
                          showCheckedStrategy={TreeSelect.SHOW_PARENT}
                          value={value}
                          placeholder="请选择组织"
                          onChange={(val) => handleUpdateScopeConfig(record.id, 'organizations', val)}
                          style={{ width: '100%' }}
                        />
                      )}
                    />
                    <Table.Column
                      title="适用检查类型"
                      dataIndex="checkTypes"
                      width={210}
                      render={(value, record: any) => (
                        <Select
                          mode="multiple"
                          value={value}
                          options={CHECK_TYPE_OPTIONS}
                          placeholder="请选择检查类型"
                          onChange={(val) => handleUpdateScopeConfig(record.id, 'checkTypes', val)}
                          style={{ width: '100%' }}
                        />
                      )}
                    />
                    <Table.Column
                      title="操作"
                      width={76}
                      fixed="right"
                      render={(_, record: any) => (
                        <Button type="link" danger onClick={() => handleDeleteScopeConfig(record.id)}>删除</Button>
                      )}
                    />
                  </Table>
                  <div className="scope-config-add">
                    <Button icon={<PlusOutlined />} onClick={handleAddScopeConfig}>添加</Button>
                  </div>
                </div>

                <div className="form-section-title" style={{ marginTop: 24 }}>检查项配置</div>
                
                <div className="template-edit-list">
                  <div className="pane-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span>检查项明细</span>
                    <Button 
                      type="primary" 
                      size="small" 
                      icon={<PlusOutlined />}
                      onClick={handleAddItem}
                    >
                      添加检查项
                    </Button>
                  </div>

                  <Table
                    dataSource={editingTemplate.items || []}
                    rowKey="id"
                    pagination={false}
                    size="middle"
                    bordered
                    locale={{ emptyText: '暂无检查项，请点击右上角添加' }}
                  >
                    <Table.Column
                      title="序号"
                      key="index"
                      width={60}
                      render={(_, __, idx) => idx + 1}
                    />
                    <Table.Column
                      title="检查阶段"
                      dataIndex="stage"
                      key="stage"
                      width={200}
                      render={(value, record: any) => (
                        <Cascader
                          options={STAGE_OPTIONS}
                          value={value}
                          onChange={(val) => handleUpdateItemField(record.id, 'stage', val || [])}
                          placeholder="请选择阶段"
                          style={{ width: '100%' }}
                          allowClear
                        />
                      )}
                    />
                    <Table.Column
                      title="检查项"
                      dataIndex="name"
                      key="name"
                      width={220}
                      render={(text, record: any) => (
                        record.type === '系统识别' ? (
                          <Select
                            value={record.systemRule}
                            options={SYSTEM_RULE_OPTIONS}
                            placeholder="请选择系统检查规则"
                            onChange={(val) => {
                              handleUpdateItemField(record.id, 'systemRule', val);
                              handleUpdateItemField(record.id, 'name', getSystemRuleLabel(val));
                            }}
                            style={{ width: '100%' }}
                            allowClear
                          />
                        ) : (
                          <Input 
                            value={text} 
                            onChange={(e) => handleUpdateItemField(record.id, 'name', e.target.value)}
                            placeholder="请输入检查项名称"
                            allowClear
                          />
                        )
                      )}
                    />
                    <Table.Column
                      title="检查标准"
                      dataIndex="standard"
                      key="standard"
                      width={250}
                      render={(text, record: any) => (
                        <Input.TextArea 
                          rows={1} 
                          autoSize={{ minRows: 1, maxRows: 3 }}
                          value={text} 
                          onChange={(e) => handleUpdateItemField(record.id, 'standard', e.target.value)}
                          placeholder="请输入检查标准"
                          allowClear
                        />
                      )}
                    />
                    <Table.Column
                      title="检查方式"
                      dataIndex="type"
                      key="type"
                      width={120}
                      render={(text, record: any) => (
                        <Select
                          value={text}
                          onChange={(val) => {
                            handleUpdateItemField(record.id, 'type', val);
                            if (val !== '系统识别') {
                              handleUpdateItemField(record.id, 'systemRule', undefined);
                            } else if (record.systemRule) {
                              handleUpdateItemField(record.id, 'name', getSystemRuleLabel(record.systemRule));
                            }
                          }}
                          options={[
                            { label: '人工检查', value: '人工检查' },
                            { label: '系统识别', value: '系统识别' },
                          ]}
                        />
                      )}
                    />
                    <Table.Column
                      title="风险等级"
                      dataIndex="risk"
                      key="risk"
                      width={100}
                      render={(text, record: any) => (
                        <Select
                          value={text}
                          onChange={(val) => handleUpdateItemField(record.id, 'risk', val)}
                          options={[
                            { label: '高', value: '高' },
                            { label: '中', value: '中' },
                            { label: '低', value: '低' },
                          ]}
                        />
                      )}
                    />
                    <Table.Column
                      title="操作"
                      key="action"
                      width={100}
                      render={(_, record: any) => (
                        <Space size="small">
                          <Tooltip title="复制">
                            <Button 
                              type="text" 
                              size="small" 
                              icon={<CopyOutlined />} 
                              onClick={() => handleCopyItem(record)}
                            />
                          </Tooltip>
                          <Popconfirm title="确定删除该检查项吗？" onConfirm={() => handleDeleteItem(record.id)}>
                            <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                          </Popconfirm>
                        </Space>
                      )}
                    />
                  </Table>
                </div>
              </div>
            </div>
          </>
        )}

        {view === 'preview' && editingTemplate && (
          <>
            <div className="preview-title-bar">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size="middle">
                  <Button icon={<ArrowLeftOutlined />} onClick={goList}>返回列表</Button>
                  <span style={{ fontSize: 18, fontWeight: 600, color: 'rgba(0,0,0,0.85)' }}>
                    模板效果预览
                  </span>
                </Space>
                {editingTemplate.status === '草稿' && (
                  <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handlePublishTemplate(editingTemplate)}>
                    发布此版本
                  </Button>
                )}
              </div>
              <div className="preview-template-info">
                <span>模板名称：<strong>{editingTemplate.name}</strong></span>
                <span>版本号：<strong>{editingTemplate.version}</strong></span>
                <span>适用检查类型：
                  <strong>
                    {editingTemplate.types.map((t: string) => (
                      <Tag color="blue" key={t} style={{ margin: '0 2px' }}>{t}</Tag>
                    ))}
                  </strong>
                </span>
                <span>状态：<strong>{editingTemplate.status}</strong></span>
              </div>
            </div>

            <div className="content-wrapper" style={{ paddingBottom: 40 }}>
              <div style={{ background: '#fff', padding: 24, borderRadius: 8, border: '1px solid #f0f0f0', marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>模拟执行视图 (所见即所得)</div>
                <div style={{ padding: '12px 16px', background: '#f6faff', border: '1px solid #e6f7ff', borderRadius: 2, marginBottom: 24, fontSize: 13, color: 'rgba(0,0,0,0.65)' }}>
                  <InfoCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                  提示：以下为该模板在“我的任务 &gt; 检查执行”页面中的实际渲染效果。判定结果、备注和附件控件仅作交互演示，不保存数据。
                </div>

                <Table
                  dataSource={editingTemplate.items || []}
                  rowKey="id"
                  pagination={false}
                  bordered
                  size="middle"
                >
                  <Table.Column
                    title="序号"
                    key="index"
                    width={60}
                    render={(_, __, idx) => idx + 1}
                  />
                  <Table.Column
                    title="检查阶段"
                    dataIndex="stage"
                    key="stage"
                    width={150}
                    render={(stage: string[]) => stage ? stage[stage.length - 1] : '/'}
                  />
                  <Table.Column
                    title="检查项"
                    dataIndex="name"
                    key="name"
                    width={220}
                    render={(text, record: any) => (
                      <Space direction="vertical" size={0}>
                        <span style={{ fontWeight: 500 }}>
                          {text}
                        </span>
                        <Space size={4} style={{ marginTop: 4 }}>
                          <Tag color={record.type === '系统识别' ? 'cyan' : 'blue'} size="small">
                            {record.type}
                          </Tag>
                          <Tag color={record.risk === '高' ? 'red' : record.risk === '中' ? 'orange' : 'green'} size="small">
                            {record.risk}风险
                          </Tag>
                        </Space>
                      </Space>
                    )}
                  />
                  <Table.Column
                    title="检查标准"
                    dataIndex="standard"
                    key="standard"
                    width={300}
                    render={(text) => <span style={{ color: 'rgba(0,0,0,0.65)', fontSize: 13 }}>{text || '/'}</span>}
                  />
                  <Table.Column
                    title="判定结果"
                    key="result"
                    width={180}
                    render={(_, record: any) => {
                      if (record.type === '系统识别') {
                        return (
                          <Space direction="vertical" size={4}>
                            <Button size="small" type="dashed">发起系统检测</Button>
                            <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>能力标识: {record.systemRule}</span>
                          </Space>
                        );
                      }
                      return (
                        <Radio.Group size="small">
                          <Radio.Button value="pass">合规</Radio.Button>
                          <Radio.Button value="fail">不合规</Radio.Button>
                        </Radio.Group>
                      );
                    }}
                  />
                  <Table.Column
                    title="检查备注"
                    key="remark"
                    width={200}
                    render={(_, record: any) => (
                      <Input 
                        placeholder={
                          record.remarkRule === '始终必填' ? '必填' : 
                          record.remarkRule === '不合规时必填' ? '不合规时必填' : '选填'
                        } 
                      />
                    )}
                  />
                  <Table.Column
                    title="检查附件"
                    key="file"
                    width={150}
                    render={(_, record: any) => (
                      <Button size="small" icon={<PlusOutlined />}>
                        {record.fileRule === '始终必填' ? '上传(必填)' : '上传'}
                      </Button>
                    )}
                  />
                </Table>

                {(!editingTemplate.items || editingTemplate.items.length === 0) && (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: 'rgba(0,0,0,0.25)' }}>
                    该模板暂无检查项，无法预览效果。
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

    </CentralizedProcurementLayout>
  );
});

Component.displayName = 'CheckTemplateMgmt';

export default Component;
