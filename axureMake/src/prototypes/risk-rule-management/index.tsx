/**
 * @name 风控规则模板
 */
import React, { useState } from 'react';
import OperationAdminLayout from '@/components/operation-admin-layout';
import {
  Alert,
  Radio,
  Checkbox,
  Table,
  Button,
  Select,
  Input,
  Tag,
  Space,
  Switch,
  Tree
} from 'antd';
import { PlusOutlined, SearchOutlined, QuestionCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import './style.css';

const warningLevelColors: Record<string, string> = {
  high: '#ff4d4f',
  medium_high: '#ff7a45',
  medium: '#faad14',
  low: '#52c41a'
};

const fullRuleTreeData = [
  {
    title: '招投标',
    key: 'bidding',
    children: [
      { title: '供应商规律报价', key: 'rule_1', level: 'high', type: '股', status: '启', isGuest: false, iconType: 'red' },
      { title: '最少评标/评审人数', key: 'rule_2', level: 'low', type: '股', status: '启', isGuest: true, iconType: 'green' },
      { title: '组织最低在线评标率', key: 'rule_3', level: 'high', type: '局', status: '禁', isGuest: true, iconType: 'red' },
      { title: '保证金超概算金额', key: 'rule_4', level: 'medium', type: '局', status: '禁', isGuest: true, iconType: 'orange' },
      { title: '招标-最短投标时间', key: 'bid_time_limit', level: 'high', type: '股', status: '禁', isGuest: true, iconType: 'pink' },
      { title: '供应商工商关联', key: 'rule_5', level: 'medium_high', type: '股', status: '禁', isGuest: true, iconType: 'red' },
      { title: '最少有效报名供应商数量', key: 'rule_6', level: 'medium', type: '股', status: '禁', isGuest: false, iconType: 'orange' },
      { title: '信息重叠', key: 'rule_7', level: 'high', type: '股', status: '禁', isGuest: false, iconType: 'orange' },
      { title: '股份禁止交易名单', key: 'rule_8', level: 'low', type: '股', status: '禁', isGuest: false, iconType: 'green' },
      { title: '招标-报名时间过短', key: 'rule_9', level: 'high', type: '股', status: '禁', isGuest: true, iconType: 'red' },
      { title: '组织最低集中采购率', key: 'rule_10', level: 'high', type: '股', status: '禁', isGuest: false, iconType: 'red' },
      { title: '组织最低公开采购率', key: 'rule_11', level: 'low', type: '股', status: '禁', isGuest: false, iconType: 'green' },
      { title: '资审报告上传', key: 'rule_12', level: 'medium', type: '股', status: '禁', isGuest: true, iconType: 'orange' },
      { title: '招标公告、招标/报价文件使用范本', key: 'rule_13', level: 'low', type: '局', status: '禁', isGuest: true, iconType: 'green' },
      { title: '招标时长过短', key: 'rule_14', level: 'low', type: '局', status: '禁', isGuest: true, iconType: 'green' }
    ]
  },
  {
    title: '合同',
    key: 'contract',
    children: [
      { title: '联采执行合同单价超中标单价', key: 'c_rule_1', level: 'high', type: '局', status: '启', isGuest: true, iconType: 'red' },
      { title: '合同总金额超招标概算', key: 'c_rule_2', level: 'high', type: '局', status: '启', isGuest: false, iconType: 'red' },
      { title: '(合同) 严重失信违法企业参标', key: 'c_rule_3', level: 'medium', type: '局', status: '启', isGuest: true, iconType: 'orange' },
      { title: '(合同) 股份禁止交易名单', key: 'c_rule_4', level: 'high', type: '股', status: '启', isGuest: false, iconType: 'pink' },
      { title: '(合同)保证金过高', key: 'c_rule_5', level: 'medium', type: '局', status: '启', isGuest: true, iconType: 'orange' },
      { title: '合同金额超中标金额校验', key: 'c_rule_6', level: 'high', type: '局', status: '启', isGuest: true, iconType: 'red' },
      { title: '企业资质校验', key: 'c_rule_7', level: 'medium', type: '局', status: '禁', isGuest: false, iconType: 'orange' },
      { title: '合同内容校验', key: 'c_rule_8', level: 'medium', type: '企', status: '启', isGuest: false, iconType: 'orange' },
      { title: '合同交底校验', key: 'c_rule_9', level: 'medium', type: '企', status: '启', isGuest: false, iconType: 'orange' },
      { title: '合同评审记录校验', key: 'c_rule_10', level: 'medium', type: '企', status: '启', isGuest: false, iconType: 'orange' }
    ]
  },
  {
    title: '履约',
    key: 'performance',
    children: [
      { title: '履约（订单金额）超合同总金额', key: 'p_rule_1', level: 'high', type: '局', status: '禁', isGuest: true, iconType: 'red' },
      { title: '履约企业资质校验', key: 'p_rule_2', level: 'medium', type: '局', status: '禁', isGuest: false, iconType: 'orange' }
    ]
  },
  {
    title: '分供商',
    key: 'supplier',
    children: [
      { title: '(供应商准入) 严重失信违法企业', key: 's_rule_1', level: 'high', type: '局', status: '启', isGuest: false, iconType: 'red' }
    ]
  }
];

const Component = function RuleManagementPage() {
  const [selectedRuleKey, setSelectedRuleKey] = useState('bid_time_limit');
  const [activeTab, setActiveTab] = useState('plan');

  const renderIcon = (type: string) => {
    switch (type) {
      case 'red':
        return <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 13, marginRight: 4 }} />;
      case 'green':
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 13, marginRight: 4 }} />;
      case 'orange':
        return <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 13, marginRight: 4 }} />;
      case 'pink':
        return <CheckCircleOutlined style={{ color: '#eb2f96', fontSize: 13, marginRight: 4 }} />;
      default:
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 13, marginRight: 4 }} />;
    }
  };

  const columns = [
    { 
      title: <span><span style={{ color: '#ff4d4f' }}>*</span>采购品类</span>, 
      dataIndex: 'category', 
      key: 'category',
      width: 200,
      render: () => (
        <Select 
          mode="multiple" 
          placeholder="请选择" 
          style={{ width: '100%' }} 
          defaultValue={['物资', '专业分包']} 
          options={[
            { label: '物资', value: '物资' },
            { label: '劳务分包', value: '劳务分包' },
            { label: '专业分包', value: '专业分包' },
            { label: '专业服务', value: '专业服务' },
            { label: '租赁', value: '租赁' },
            { label: '设备', value: '设备' }
          ]} 
        />
      )
    },
    { 
      title: <span><span style={{ color: '#ff4d4f' }}>*</span>采购类型&组织形式</span>, 
      dataIndex: 'type', 
      key: 'type',
      width: 200,
      render: () => (
        <Select 
          mode="multiple" 
          placeholder="请选择" 
          style={{ width: '100%' }} 
          defaultValue={['招标采购', '区域联采', '战略采购', '集中采购', '分散采购']} 
          options={[
            { label: '招标采购', value: '招标采购' },
            { label: '区域联采', value: '区域联采' },
            { label: '战略采购', value: '战略采购' },
            { label: '集中采购', value: '集中采购' },
            { label: '分散采购', value: '分散采购' },
            { label: '电子商城采购', value: '电子商城采购' }
          ]} 
        />
      )
    },
    { 
      title: <span><span style={{ color: '#ff4d4f' }}>*</span>招标方式&采购方式</span>, 
      dataIndex: 'method', 
      key: 'method',
      width: 200,
      render: () => (
        <Select 
          mode="multiple" 
          placeholder="请选择" 
          style={{ width: '100%' }} 
          defaultValue={['公开招标', '直接采购', '谈判采购', '竞价采购', '询比采购', '邀请招标', '询价采购', '竞争性谈判', '单一来源...', '紧急采购']} 
          options={[
            { label: '公开招标', value: '公开招标' },
            { label: '直接采购', value: '直接采购' },
            { label: '谈判采购', value: '谈判采购' },
            { label: '竞价采购', value: '竞价采购' },
            { label: '询比采购', value: '询比采购' },
            { label: '邀请招标', value: '邀请招标' },
            { label: '询价采购', value: '询价采购' },
            { label: '竞争性谈判', value: '竞争性谈判' },
            { label: '单一来源...', value: '单一来源...' },
            { label: '紧急采购', value: '紧急采购' }
          ]} 
        />
      )
    },
    { 
      title: <span><span style={{ color: '#ff4d4f' }}>*</span>预警类型</span>, 
      dataIndex: 'warningType', 
      key: 'warningType',
      width: 150,
      render: () => <Select defaultValue="预警" style={{ width: '100%' }} options={[{ label: '预警', value: '预警' }]} />
    },
    { 
      title: '预警方式', 
      dataIndex: 'warningMethod', 
      key: 'warningMethod',
      width: 150,
      render: () => <Select defaultValue="常显+对话框" style={{ width: '100%' }} options={[{ label: '常显+对话框', value: '1' }]} />
    },
    { 
      title: '通知方式', 
      dataIndex: 'notifyMethod', 
      key: 'notifyMethod',
      width: 150,
      render: () => <Select defaultValue="短信" style={{ width: '100%' }} options={[{ label: '短信', value: '1' }]} />
    },
    { 
      title: '通知对象', 
      dataIndex: 'notifyTarget', 
      key: 'notifyTarget',
      width: 150,
      render: () => <Select defaultValue="资审经办..." style={{ width: '100%' }} options={[{ label: '资审经办...', value: '1' }]} />
    },
    { 
      title: <span><span style={{ color: '#ff4d4f' }}>*</span>最短回标/报价天数</span>, 
      dataIndex: 'days', 
      key: 'days',
      width: 150,
      render: () => (
        <div className="flex items-center gap-1">
          <Input defaultValue="5" style={{ flex: 1 }} />
          <span>天</span>
        </div>
      )
    },
    { 
      title: '操作', 
      key: 'action', 
      width: 100,
      fixed: 'right',
      render: (_: any, record: any) => (
        <Space>
          <a style={{ color: '#1677ff', fontSize: 13 }} onClick={() => console.log('Edit', record.key)}>编辑</a>
          <a style={{ color: '#ff4d4f', fontSize: 13 }} onClick={() => setDataSource(dataSource.filter(item => item.key !== record.key))}>删除</a>
        </Space>
      ) 
    }
  ];

  const [dataSource, setDataSource] = useState([
    { key: '1' }
  ]);

  const handleAdd = () => {
    const newData = { key: Date.now().toString() };
    setDataSource([...dataSource, newData]);
  };

  return (
    <OperationAdminLayout
      activeMenuKey="risk_warning_center/rule_mgmt"
      defaultOpenKeys={['risk_warning_center']}
      breadcrumbItems={[
        { label: '风控预警中心' },
        { label: '规则管理', active: true }
      ]}
      platform="测试组织-股份公司"
      orgCode="00010104"
      parentOrg="平台"
    >
      <div className="rule-config-container bg-white" style={{ minHeight: 'calc(100vh - 120px)' }}>
        {/* 顶部线型导航与 Tab */}
        <div className="mb-4 p-4 pb-0">
          <div className="flex gap-2">
            {['云筑集采', '云筑商城', '云筑劳务', '云筑金服'].map((name, i) => (
              <div
                key={i}
                className={`px-6 py-2 text-sm cursor-pointer border border-b-0 ${
                  i === 0 
                    ? 'text-blue-600 bg-white border-gray-200 relative -mb-[1px] border-t-2 border-t-blue-500' 
                    : 'text-gray-600 bg-gray-50 border-gray-200 border-l-0'
                }`}
              >
                {name}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 items-stretch">
          {/* 左侧规则树：外层仅负责与右侧等高，内部绝对定位，展开树不会撑高页面 */}
          <div className="relative w-80 flex-shrink-0 self-stretch" style={{ minWidth: 280, minHeight: 'calc(100vh - 160px)' }}>
            <div className="absolute inset-0 border border-gray-200 rounded p-2 bg-white flex flex-col overflow-hidden">
              <Input
                prefix={<SearchOutlined style={{ color: '#ccc' }} />}
                placeholder="输入规则名称"
                className="mb-2"
              />
              <div className="flex-1 overflow-y-auto pr-1">
                <Tree
                defaultExpandAll
                selectedKeys={[selectedRuleKey]}
                onSelect={(keys) => keys.length && setSelectedRuleKey(keys[0] as string)}
                treeData={fullRuleTreeData.map(group => ({
                  title: <span className="font-bold text-gray-800 text-sm">{group.title}</span>,
                  key: group.key,
                  children: group.children.map(item => ({
                    key: item.key,
                    title: (
                      <div className="flex items-center text-xs py-0.5" style={{ lineHeight: '20px' }}>
                        <span
                          className="px-1 mr-1 rounded"
                          style={{
                            fontSize: 10,
                            backgroundColor: item.type === '股' ? '#fff0f6' : item.type === '局' ? '#fff7e6' : '#feffe6',
                            color: item.type === '股' ? '#eb2f96' : item.type === '局' ? '#fa8c16' : '#a0d911',
                            border: `1px solid ${item.type === '股' ? '#ffadd2' : item.type === '局' ? '#ffd591' : '#eaff8f'}`
                          }}
                        >
                          {item.type}
                        </span>
                        <span
                          className="px-1 mr-1 rounded"
                          style={{
                            fontSize: 10,
                            backgroundColor: item.status === '启' ? '#f6ffed' : '#fff1f0',
                            color: item.status === '启' ? '#52c41a' : '#ff4d4f',
                            border: `1px solid ${item.status === '启' ? '#b7eb8f' : '#ffa39e'}`
                          }}
                        >
                          {item.status}
                        </span>
                        {renderIcon(item.iconType)}
                        <span className="truncate flex-1 text-gray-700">{item.title}</span>
                        {item.isGuest && (
                          <span className="ml-1 px-1 text-blue-500 bg-blue-50 rounded" style={{ fontSize: 10 }}>
                            客
                          </span>
                        )}
                      </div>
                    )
                  }))
                }))}
              />
              </div>
            </div>
          </div>
          
          {/* 右侧内容 */}
          <div className="flex-1 border border-gray-200 rounded p-6 bg-white overflow-hidden">
            <div className="flex gap-8 mb-6 border-b border-gray-200 pb-0">
              {['方案配置', '配置下发', '操作日志'].map((t, i) => (
                <div 
                  key={i} 
                  className={`pb-3 text-sm cursor-pointer ${
                    i === 0 
                      ? 'text-blue-600 font-bold border-b-2 border-blue-500 -mb-[1px]' 
                      : 'text-gray-700 hover:text-blue-500'
                  }`}
                >
                  {t}
                </div>
              ))}
            </div>

            <div 
              className="mb-6 p-3 px-4 text-xs flex items-center gap-2 rounded-sm"
              style={{ backgroundColor: '#fff7e6', border: '1px solid #ffe58f', color: '#d46b08' }}
            >
              <ExclamationCircleOutlined style={{ color: '#fa8c16', fontSize: 14 }} />
              <span>
                该风控规则以本组织 <span className="font-bold">测试组织-股份公司</span> 配置为准，您可以根据组织要求修改配置
              </span>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-gray-900">招标-最短投标时间</h2>
                <Switch 
                  checkedChildren="开" 
                  unCheckedChildren="关" 
                  defaultChecked={false} 
                />
              </div>
              <Button type="primary" className="bg-blue-600 hover:bg-blue-500 flex items-center gap-1 text-xs h-8 px-4">
                一键复制 <QuestionCircleOutlined />
              </Button>
            </div>

            <div className="text-xs text-gray-500 mb-4">
              规则说明：支持配置供应商最短投标/报价时间（比如2天），若经办人设置时间少于配置的天数，系统根据配置进行业务预警或拦截
            </div>

            <div className="space-y-3 text-xs mb-6">
              <div className="flex items-center">
                <span className="text-red-500 mr-1">*</span>
                <span className="w-24 text-gray-600">适用组织范围：</span>
                <Radio.Group defaultValue="subordinate" size="small">
                  <Radio value="current"><span className="text-xs">本级</span></Radio>
                  <Radio value="subordinate"><span className="text-xs">本下级</span></Radio>
                </Radio.Group>
              </div>
              <div className="flex items-center">
                <span className="text-red-500 mr-1">*</span>
                <span className="w-24 text-gray-600">下级独立配置：</span>
                <Radio.Group defaultValue="allow" size="small">
                  <Radio value="allow"><span className="text-xs">允许</span></Radio>
                  <Radio value="disallow"><span className="text-xs">不允许</span></Radio>
                </Radio.Group>
              </div>
              <div className="flex items-center">
                <span className="text-red-500 mr-1">*</span>
                <span className="w-24 text-gray-600">预警级别：</span>
                <Radio.Group defaultValue="medium" size="small">
                  <Radio value="high"><span className="text-xs">高风险</span></Radio>
                  <Radio value="medium_high"><span className="text-xs">中高风险</span></Radio>
                  <Radio value="medium"><span className="text-xs">中风险</span></Radio>
                  <Radio value="low"><span className="text-xs">低风险</span></Radio>
                </Radio.Group>
              </div>
              <div className="flex items-center">
                <span className="text-red-500 mr-1">*</span>
                <span className="w-24 text-gray-600">检测场景：</span>
                <Checkbox.Group defaultValue={['warning']}>
                  <Checkbox value="self"><span className="text-xs">合规自查</span></Checkbox>
                  <Checkbox value="warning"><span className="text-xs">风控预警</span></Checkbox>
                </Checkbox.Group>
              </div>
              <div className="flex items-center">
                <span className="text-red-500 mr-1">*</span>
                <span className="w-24 text-gray-600">是否去重：</span>
                <Radio.Group defaultValue="no" size="small">
                  <Radio value="yes"><span className="text-xs">去重</span></Radio>
                  <Radio value="no"><span className="text-xs">不去重</span></Radio>
                </Radio.Group>
              </div>
              <div className="flex items-center">
                <span className="w-24 text-gray-600 ml-2">规则类型：</span>
                <span className="text-gray-800">管理要求</span>
              </div>
            </div>

            <Table 
              columns={columns} 
              dataSource={dataSource} 
              pagination={false} 
              bordered 
              size="small"
              className="mb-4" 
              scroll={{ x: 1200 }}
            />
            
            <div className="flex justify-center mb-6">
              <Button type="dashed" icon={<PlusOutlined />} size="small" style={{ width: 120 }} onClick={handleAdd}>
                添加一项
              </Button>
            </div>
            
            <div className="flex justify-center">
              <Button type="primary" className="bg-blue-500" style={{ width: 80 }}>
                提交
              </Button>
            </div>
          </div>
        </div>
      </div>
    </OperationAdminLayout>
  );
};

export default Component;
