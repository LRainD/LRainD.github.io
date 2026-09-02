/**
 * @name 派发任务
 * @description 统一承载自查、互查、稽查的待派发和待发起数据，以及人员选择、批量派发、派发调整和批次结果；三类任务分别执行各自的准入、候选和回避规则。
 */

import React, { useState } from 'react';
import {
  Table,
  Tabs,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Breadcrumb,
  Card,
  Tooltip,
  Badge,
  Row,
  Col,
  message,
  Descriptions,
  Modal,
  InputNumber,
  Alert,
  Divider
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import CentralizedProcurementLayout from '../../components/centralized-procurement-layout';
import TopActionBar from '../../components/top-action-bar';
import './style.css';

// --- Mock Data ---
const mockContractSeedData = [
  {
    key: '1',
    contractNo: 'HT-2026-001',
    contractName: '某办公楼建设项目钢材采购合同',
    bidNo: 'cscec202608310000004851',
    bidName: '某办公楼建设项目钢材采购招标',
    reviewTime: '2026-08-31 15:00:00',
    org: '中建四局一公司',
    orgId: 'org_001',
    agent: '张三',
    procurementAgent: '李敏',
    procurementAgentAccount: 'limin',
    contractAgentAccount: 'zhangsan',
    project: '深圳湾科技生态园项目',
    riskLevel: '高',
    genTime: '2026-09-01 10:00',
    template: '中建四局钢材采购专项模板 V1.2',
    status: '自查待派发',
    timeLeft: '2天',
    mode: '人工指定',
    recentRecord: '首次派发'
  },
  {
    key: '2',
    contractNo: 'HT-2026-002',
    contractName: '某高速公路工程水泥供应合同',
    bidNo: 'cscec202608310000004852',
    bidName: '某高速公路工程水泥采购招标',
    reviewTime: '2026-08-31 16:30:00',
    org: '中建四局二公司',
    orgId: 'org_002',
    agent: '李四',
    procurementAgent: '王莉',
    procurementAgentAccount: 'wangli',
    contractAgentAccount: 'lisi',
    project: '广州至深圳高速改扩建工程',
    riskLevel: '中',
    genTime: '2026-09-01 09:30',
    template: '中建四局水泥采购专项模板 V1.0',
    status: '自查待处理',
    timeLeft: '3天',
    mode: '自动派发',
    recentRecord: '自动派发成功，待合规专员处理'
  },
  {
    key: '3',
    contractNo: 'HT-2026-003',
    contractName: '某大型场馆机电安装分包合同',
    bidNo: 'cscec202608300000004720',
    bidName: '某大型场馆机电安装采购招标',
    reviewTime: '2026-08-30 11:20:00',
    org: '中建四局一公司',
    orgId: 'org_001',
    agent: '王五',
    procurementAgent: '赵强',
    procurementAgentAccount: 'zhaoqiang',
    contractAgentAccount: 'wangwu',
    project: '深圳国际会展中心二期',
    riskLevel: '高',
    genTime: '2026-08-31 16:00',
    template: '中建四局机电分包模板 V2.0',
    status: '已自查',
    timeLeft: '5天',
    mode: '人工指定',
    recentRecord: '自查合规，自动准入互查'
  },
  {
    key: '4',
    contractNo: 'HT-2026-004',
    contractName: '某住宅小区园林绿化工程合同',
    bidNo: 'cscec202608310000004911',
    bidName: '某住宅小区园林绿化采购招标',
    reviewTime: '2026-08-31 17:45:00',
    org: '中建四局三公司',
    orgId: 'org_003',
    agent: '赵六',
    procurementAgent: '陈晨',
    procurementAgentAccount: 'chenchen',
    contractAgentAccount: 'zhaoliu',
    project: '中建阅澜山小区项目',
    riskLevel: '低',
    genTime: '2026-09-01 11:00',
    template: '中建四局园林绿化模板 V1.1',
    status: '已自查',
    timeLeft: '4天',
    mode: '自动派发',
    recentRecord: '自查合规，待进入互查抽取批次'
  },
  {
    key: '5',
    contractNo: 'HT-2026-005',
    contractName: '核心商务区地基与基础工程采购合同',
    bidNo: 'cscec202608290000004510',
    bidName: '核心商务区地基与基础工程采购招标',
    reviewTime: '2026-08-29 10:00:00',
    org: '中建四局一公司',
    orgId: 'org_001',
    agent: '钱七',
    procurementAgent: '孙浩',
    procurementAgentAccount: 'sunhao',
    contractAgentAccount: 'qianqi',
    project: '前海周大福金融大厦',
    riskLevel: '高',
    genTime: '2026-08-30 14:00',
    template: '中建四局地基基础专项模板 V1.5',
    status: '已互查',
    timeLeft: '7天',
    mode: '人工指定',
    recentRecord: '互查闭环，符合稽查准入'
  },
  {
    key: '6',
    contractNo: 'HT-2026-006',
    contractName: '某商业综合体消防工程合同',
    bidNo: 'cscec202608310000004955',
    bidName: '某商业综合体消防工程采购招标',
    reviewTime: '2026-08-31 14:00:00',
    org: '中建四局二公司',
    orgId: 'org_002',
    agent: '周八',
    procurementAgent: '刘洋',
    procurementAgentAccount: 'liuyang',
    contractAgentAccount: 'zhouba',
    project: '深圳湾体育中心配套项目',
    riskLevel: '中',
    genTime: '2026-09-01 08:30',
    template: '中建四局消防工程专项模板 V1.0',
    status: '自查中',
    timeLeft: '1天',
    mode: '人工指定',
    recentRecord: '专员正在自查中'
  },
  {
    key: '7',
    contractNo: 'HT-2026-007',
    contractName: '某研发中心弱电智能化合同',
    bidNo: 'cscec202608300000004811',
    bidName: '某研发中心弱电智能化采购招标',
    reviewTime: '2026-08-30 09:30:00',
    org: '中建四局三公司',
    orgId: 'org_003',
    agent: '吴九',
    procurementAgent: '何静',
    procurementAgentAccount: 'hejing',
    contractAgentAccount: 'wujiu',
    project: '东莞松山湖华为研发中心',
    riskLevel: '中',
    genTime: '2026-08-31 10:00',
    template: '中建四局弱电智能化模板 V1.3',
    status: '自查待处置',
    timeLeft: '4天',
    mode: '自动派发',
    recentRecord: '自查发现2项不合规问题，等待经办人处置'
  },
  {
    key: '8',
    contractNo: 'HT-2026-008',
    contractName: '某医院综合大楼精装修合同',
    bidNo: 'cscec202608290000004455',
    bidName: '某医院综合大楼精装修采购招标',
    reviewTime: '2026-08-29 11:00:00',
    org: '中建四局一公司',
    orgId: 'org_001',
    agent: '郑十',
    procurementAgent: '马超',
    procurementAgentAccount: 'machao',
    contractAgentAccount: 'zhengshi',
    project: '中山大学附属第一医院项目',
    riskLevel: '高',
    genTime: '2026-08-30 09:00',
    template: '中建四局精装修工程模板 V2.1',
    status: '互查中',
    timeLeft: '2天',
    mode: '人工指定',
    recentRecord: '互查专家检查中'
  },
  {
    key: '9',
    contractNo: 'HT-2026-009',
    contractName: '某保障房项目混凝土采购合同',
    bidNo: 'cscec202608280000004312',
    bidName: '某保障房项目混凝土采购招标',
    reviewTime: '2026-08-28 15:30:00',
    org: '中建四局三公司',
    orgId: 'org_003',
    agent: '孙十一',
    procurementAgent: '杨帆',
    procurementAgentAccount: 'yangfan',
    contractAgentAccount: 'sunshiyi',
    project: '深圳坪山保障房项目',
    riskLevel: '低',
    genTime: '2026-08-29 14:00',
    template: '中建四局混凝土采购模板 V1.0',
    status: '稽查中',
    timeLeft: '6天',
    mode: '自动派发',
    recentRecord: '稽查专家正在检查'
  },
  {
    key: '10',
    contractNo: 'HT-2026-010',
    contractName: '某跨海大桥防腐涂料供应合同',
    bidNo: 'cscec202608270000004211',
    bidName: '某跨海大桥防腐涂料采购招标',
    reviewTime: '2026-08-27 10:00:00',
    org: '中建四局一公司',
    orgId: 'org_001',
    agent: '杨十二',
    procurementAgent: '周婷',
    procurementAgentAccount: 'zhouting',
    contractAgentAccount: 'yangshier',
    project: '胶州湾跨海大桥工程',
    riskLevel: '高',
    genTime: '2026-08-28 11:00',
    template: '中建四局防腐涂料采购模板 V1.2',
    status: '已稽查',
    timeLeft: '已办结',
    mode: '自动派发',
    recentRecord: '稽查全部闭环，检查流程已完成'
  }
];

const mockContractStatusSamples = [
  { key: '11', status: '自查回退审批中', contractName: '某产业园幕墙工程采购合同', bidName: '某产业园幕墙工程采购招标', org: '中建四局二公司', orgId: 'org_002', agent: '冯十三', procurementAgent: '宋雨', riskLevel: '中', timeLeft: '1天', recentRecord: '已提交回退审批，等待审批人处理' },
  { key: '12', status: '自查已收回', contractName: '某数据中心暖通设备采购合同', bidName: '某数据中心暖通设备采购招标', org: '中建四局三公司', orgId: 'org_003', agent: '褚十四', procurementAgent: '罗浩', riskLevel: '高', timeLeft: '2天', recentRecord: '原办理人任务已收回，等待重新派发' },
  { key: '13', status: '自查待复核', contractName: '某轨道交通站后工程材料采购合同', bidName: '某轨道交通站后工程材料采购招标', org: '中建四局一公司', orgId: 'org_001', agent: '卫十五', procurementAgent: '高洁', riskLevel: '中', timeLeft: '3天', recentRecord: '经办人已完成问题处置，等待复核' },
  { key: '14', status: '自查复核不通过', contractName: '某城市更新项目电梯采购合同', bidName: '某城市更新项目电梯采购招标', org: '中建四局二公司', orgId: 'org_002', agent: '蒋十六', procurementAgent: '许峰', riskLevel: '高', timeLeft: '1天', recentRecord: '复核未通过，已退回经办人重新处理' },
  { key: '15', status: '自查结论申诉中', contractName: '某学校扩建项目家具采购合同', bidName: '某学校扩建项目家具采购招标', org: '中建四局三公司', orgId: 'org_003', agent: '沈十七', procurementAgent: '邹颖', riskLevel: '低', timeLeft: '4天', recentRecord: '检查结论已提交申诉，等待处理' },
  { key: '16', status: '互查待处理', contractName: '某机场扩建工程钢结构采购合同', bidName: '某机场扩建工程钢结构采购招标', org: '中建四局一公司', orgId: 'org_001', agent: '韩十八', procurementAgent: '曹阳', riskLevel: '高', timeLeft: '2天', recentRecord: '互查任务已派发，等待合规专家处理' },
  { key: '17', status: '互查回退审批中', contractName: '某物流园仓储设备采购合同', bidName: '某物流园仓储设备采购招标', org: '中建四局二公司', orgId: 'org_002', agent: '杨十九', procurementAgent: '唐蕾', riskLevel: '中', timeLeft: '3天', recentRecord: '已提交互查回退审批，等待审批人处理' },
  { key: '18', status: '互查待处置', contractName: '某综合管廊项目管材采购合同', bidName: '某综合管廊项目管材采购招标', org: '中建四局三公司', orgId: 'org_003', agent: '朱二十', procurementAgent: '潘宁', riskLevel: '高', timeLeft: '2天', recentRecord: '互查发现问题，等待经办人处置' },
  { key: '19', status: '互查待复核', contractName: '某新能源厂房组件采购合同', bidName: '某新能源厂房组件采购招标', org: '中建四局一公司', orgId: 'org_001', agent: '秦二一', procurementAgent: '葛婷', riskLevel: '中', timeLeft: '5天', recentRecord: '互查处置完成，等待复核' },
  { key: '20', status: '互查复核不通过', contractName: '某商业街改造项目石材采购合同', bidName: '某商业街改造项目石材采购招标', org: '中建四局二公司', orgId: 'org_002', agent: '尤二二', procurementAgent: '阮飞', riskLevel: '中', timeLeft: '1天', recentRecord: '互查复核未通过，已退回重新处理' },
  { key: '21', status: '互查结论申诉中', contractName: '某市政道路项目沥青采购合同', bidName: '某市政道路项目沥青采购招标', org: '中建四局三公司', orgId: 'org_003', agent: '施二三', procurementAgent: '郝静', riskLevel: '低', timeLeft: '4天', recentRecord: '互查结论已提交申诉，等待处理' },
  { key: '22', status: '已互查', contractName: '某会展中心装饰工程采购合同', bidName: '某会展中心装饰工程采购招标', org: '中建四局一公司', orgId: 'org_001', agent: '张二四', procurementAgent: '吴迪', riskLevel: '高', timeLeft: '2天', recentRecord: '互查合规，待进入稽查抽取批次' },
  { key: '23', status: '稽查待处理', contractName: '某医疗园区净化工程采购合同', bidName: '某医疗园区净化工程采购招标', org: '中建四局二公司', orgId: 'org_002', agent: '孔二五', procurementAgent: '郑琳', riskLevel: '中', timeLeft: '3天', recentRecord: '稽查任务已派发，等待稽查专家处理' },
  { key: '24', status: '稽查回退审批中', contractName: '某体育场改造项目座椅采购合同', bidName: '某体育场改造项目座椅采购招标', org: '中建四局三公司', orgId: 'org_003', agent: '严二六', procurementAgent: '谢宇', riskLevel: '低', timeLeft: '2天', recentRecord: '已提交稽查回退审批，等待审批人处理' },
  { key: '25', status: '稽查待处置', contractName: '某港口码头项目护舷采购合同', bidName: '某港口码头项目护舷采购招标', org: '中建四局一公司', orgId: 'org_001', agent: '华二七', procurementAgent: '吕薇', riskLevel: '高', timeLeft: '1天', recentRecord: '稽查发现问题，等待经办人处置' },
  { key: '26', status: '稽查待复核', contractName: '某科研楼实验设备采购合同', bidName: '某科研楼实验设备采购招标', org: '中建四局二公司', orgId: 'org_002', agent: '金二八', procurementAgent: '魏峰', riskLevel: '中', timeLeft: '4天', recentRecord: '稽查处置完成，等待复核' },
  { key: '27', status: '稽查复核不通过', contractName: '某住宅项目保温材料采购合同', bidName: '某住宅项目保温材料采购招标', org: '中建四局三公司', orgId: 'org_003', agent: '陶二九', procurementAgent: '冉婷', riskLevel: '中', timeLeft: '2天', recentRecord: '稽查复核未通过，已退回重新处理' },
  { key: '28', status: '稽查结论申诉中', contractName: '某水利枢纽项目阀门采购合同', bidName: '某水利枢纽项目阀门采购招标', org: '中建四局一公司', orgId: 'org_001', agent: '姜三十', procurementAgent: '史晨', riskLevel: '高', timeLeft: '5天', recentRecord: '稽查结论已提交申诉，等待处理' },
  { key: '29', status: '互查已收回', contractName: '某城市综合体幕墙工程采购合同', bidName: '某城市综合体幕墙工程采购招标', org: '中建四局二公司', orgId: 'org_002', agent: '范三一', procurementAgent: '谭雪', riskLevel: '中', timeLeft: '2天', recentRecord: '原互查办理人任务已收回，等待调整派发' },
  { key: '30', status: '稽查已收回', contractName: '某轨道交通供电设备采购合同', bidName: '某轨道交通供电设备采购招标', org: '中建四局三公司', orgId: 'org_003', agent: '魏三二', procurementAgent: '乔安', riskLevel: '高', timeLeft: '3天', recentRecord: '原稽查办理人任务已收回，等待调整派发' },
  { key: '31', status: '已自查', contractName: '某总部基地幕墙材料采购合同', bidName: '某总部基地幕墙材料采购招标', org: '中建四局一公司', orgId: 'org_001', agent: '吴三三', procurementAgent: '周扬', riskLevel: '高', timeLeft: '—', recentRecord: '自查合规，待进入互查抽取批次' },
  { key: '32', status: '已自查', contractName: '某机场航站楼机电设备采购合同', bidName: '某机场航站楼机电设备采购招标', org: '中建四局一公司', orgId: 'org_001', agent: '郑三四', procurementAgent: '方琳', riskLevel: '中', timeLeft: '—', recentRecord: '自查问题已闭环，待进入互查抽取批次' },
  { key: '33', status: '已自查', contractName: '某智慧园区弱电系统采购合同', bidName: '某智慧园区弱电系统采购招标', org: '中建四局一公司', orgId: 'org_001', agent: '钱三五', procurementAgent: '杜航', riskLevel: '高', timeLeft: '—', recentRecord: '自查合规，待进入互查抽取批次' },
  { key: '34', status: '已自查', contractName: '某综合医院电梯设备采购合同', bidName: '某综合医院电梯设备采购招标', org: '中建四局一公司', orgId: 'org_001', agent: '孙三六', procurementAgent: '何蕾', riskLevel: '低', timeLeft: '—', recentRecord: '自查问题已闭环，待进入互查抽取批次' },
  { key: '35', status: '已自查', contractName: '某城市更新项目铝合金门窗采购合同', bidName: '某城市更新项目铝合金门窗采购招标', org: '中建四局一公司', orgId: 'org_001', agent: '李三七', procurementAgent: '罗欣', riskLevel: '中', timeLeft: '—', recentRecord: '自查合规，待进入互查抽取批次' },
  { key: '36', status: '已自查', contractName: '某科研中心实验室家具采购合同', bidName: '某科研中心实验室家具采购招标', org: '中建四局一公司', orgId: 'org_001', agent: '周三八', procurementAgent: '高阳', riskLevel: '高', timeLeft: '—', recentRecord: '自查问题已闭环，待进入互查抽取批次' },
  { key: '37', status: '已自查', contractName: '某滨海新区市政管网采购合同', bidName: '某滨海新区市政管网采购招标', org: '中建四局二公司', orgId: 'org_002', agent: '王三九', procurementAgent: '许宁', riskLevel: '高', timeLeft: '4天', recentRecord: '自查合规，待进入互查抽取批次' },
  { key: '38', status: '已自查', contractName: '某产业园消防设备采购合同', bidName: '某产业园消防设备采购招标', org: '中建四局二公司', orgId: 'org_002', agent: '赵四十', procurementAgent: '沈洁', riskLevel: '中', timeLeft: '4天', recentRecord: '自查合规，待进入互查抽取批次' },
  { key: '39', status: '自查待派发', contractName: '某高铁站房装饰材料采购合同', bidName: '某高铁站房装饰材料采购招标', org: '中建四局三公司', orgId: 'org_003', agent: '陈四一', procurementAgent: '冯凯', riskLevel: '高', timeLeft: '2天', recentRecord: '自动派发失败，转人工派发' },
  { key: '40', status: '自查待派发', contractName: '某文旅综合体照明设备采购合同', bidName: '某文旅综合体照明设备采购招标', org: '中建四局三公司', orgId: 'org_003', agent: '褚四二', procurementAgent: '马静', riskLevel: '中', timeLeft: '3天', recentRecord: '任务已生成，等待合规专员指派' },
  { key: '41', status: '已互查', contractName: '某数据中心机柜设备采购合同', bidName: '某数据中心机柜设备采购招标', org: '中建四局二公司', orgId: 'org_002', agent: '卫四三', procurementAgent: '蒋楠', riskLevel: '高', timeLeft: '3天', recentRecord: '互查合规，待进入稽查抽取批次' },
  { key: '42', status: '已互查', contractName: '某高速服务区污水处理设备采购合同', bidName: '某高速服务区污水处理设备采购招标', org: '中建四局二公司', orgId: 'org_002', agent: '沈四四', procurementAgent: '秦川', riskLevel: '中', timeLeft: '5天', recentRecord: '互查合规，待进入稽查抽取批次' }
];

const mockContracts = [
  ...mockContractSeedData.map((contract) => ({
    ...contract,
    templateId: contract.status.includes('自查') ? 'tpl_2' : 'tpl_1'
  })),
  ...mockContractStatusSamples.map((sample) => ({
    ...sample,
    bidNo: `cscec202608${sample.key.padStart(2, '0')}000000${sample.key.padStart(4, '0')}`,
    contractNo: `HT-2026-${sample.key.padStart(3, '0')}`,
    reviewTime: '2026-08-30 14:00:00',
    procurementAgentAccount: `buyer_${sample.key}`,
    contractAgentAccount: `manager_${sample.key}`,
    project: `${sample.contractName.replace('合同', '')}项目`,
    genTime: '2026-09-01 12:00',
    template: '一局普通合同检查模板 V1.0',
    templateId: sample.status.includes('自查') ? 'tpl_2' : 'tpl_1',
    mode: '人工指定'
  }))
];

// 模拟合规专员/专家库
const mockPersonnel = [
  {
    id: 'user_001',
    name: '张专员',
    account: 'zhang_zy',
    org: '中建四局一公司',
    qualOrg: '中建四局一公司',
    type: '合规专员',
    pendingCount: 2,
    activeCount: 1,
    nearTimeoutCount: 0,
    isRecommended: true
  },
  {
    id: 'user_002',
    name: '李专家',
    account: 'li_zj',
    org: '中建四局二公司',
    qualOrg: '中建四局一公司',
    type: '合规专家',
    pendingCount: 0,
    activeCount: 2,
    nearTimeoutCount: 1,
    isRecommended: false
  },
  {
    id: 'user_003',
    name: '王稽查',
    account: 'wang_jc',
    org: '中建四局三公司',
    qualOrg: '中建四局三公司',
    type: '稽查专家',
    pendingCount: 1,
    activeCount: 0,
    nearTimeoutCount: 0,
    isRecommended: true
  },
  {
    id: 'user_004',
    name: '陈专员',
    account: 'chen_zy',
    org: '中建四局一公司',
    qualOrg: '中建四局一公司',
    type: '合规专员',
    pendingCount: 1,
    activeCount: 2,
    nearTimeoutCount: 0,
    isRecommended: false
  },
  {
    id: 'user_005',
    name: '刘专员',
    account: 'liu_zy',
    org: '中建四局二公司',
    qualOrg: '中建四局二公司',
    type: '合规专员',
    pendingCount: 3,
    activeCount: 0,
    nearTimeoutCount: 0,
    isRecommended: true
  },
  {
    id: 'user_006',
    name: '周专员',
    account: 'zhou_zy',
    org: '中建四局三公司',
    qualOrg: '中建四局三公司',
    type: '合规专员',
    pendingCount: 0,
    activeCount: 1,
    nearTimeoutCount: 1,
    isRecommended: false
  },
  {
    id: 'user_007',
    name: '孙专家',
    account: 'sun_zj',
    org: '中建四局三公司',
    qualOrg: '中建四局一公司',
    type: '合规专家',
    pendingCount: 1,
    activeCount: 1,
    nearTimeoutCount: 0,
    isRecommended: true
  },
  {
    id: 'user_008',
    name: '何稽查',
    account: 'he_jc',
    org: '中建四局二公司',
    qualOrg: '中建四局二公司',
    type: '稽查专家',
    pendingCount: 2,
    activeCount: 1,
    nearTimeoutCount: 0,
    isRecommended: false
  },
  {
    id: 'user_009',
    name: '黄专员',
    account: 'huang_zy',
    org: '中建四局一公司',
    qualOrg: '中建四局一公司',
    type: '合规专员',
    pendingCount: 2,
    activeCount: 0,
    nearTimeoutCount: 0,
    isRecommended: false
  },
  {
    id: 'user_010',
    name: '吴专员',
    account: 'wu_zy',
    org: '中建四局二公司',
    qualOrg: '中建四局二公司',
    type: '合规专员',
    pendingCount: 1,
    activeCount: 1,
    nearTimeoutCount: 0,
    isRecommended: true
  },
  {
    id: 'user_011',
    name: '郭专家',
    account: 'guo_zj',
    org: '中建四局二公司',
    qualOrg: '中建四局一公司',
    type: '合规专家',
    pendingCount: 2,
    activeCount: 1,
    nearTimeoutCount: 0,
    isRecommended: false
  },
  {
    id: 'user_012',
    name: '冯专家',
    account: 'feng_zj',
    org: '中建四局三公司',
    qualOrg: '中建四局一公司',
    type: '合规专家',
    pendingCount: 1,
    activeCount: 0,
    nearTimeoutCount: 0,
    isRecommended: true
  },
  {
    id: 'user_013',
    name: '曹专家',
    account: 'cao_zj',
    org: '中建四局二公司',
    qualOrg: '中建四局一公司',
    type: '合规专家',
    pendingCount: 3,
    activeCount: 0,
    nearTimeoutCount: 1,
    isRecommended: false
  },
  {
    id: 'user_014',
    name: '梁专家',
    account: 'liang_zj',
    org: '中建四局总部',
    qualOrg: '中建四局',
    type: '合规专家',
    pendingCount: 0,
    activeCount: 1,
    nearTimeoutCount: 0,
    isRecommended: true
  },
  {
    id: 'user_015',
    name: '郑专家',
    account: 'zheng_zj',
    org: '中建四局五公司',
    qualOrg: '中建四局',
    type: '合规专家',
    pendingCount: 1,
    activeCount: 0,
    nearTimeoutCount: 0,
    isRecommended: true
  },
  {
    id: 'user_016',
    name: '许专家',
    account: 'xu_zj',
    org: '中建四局六公司',
    qualOrg: '中建四局',
    type: '合规专家',
    pendingCount: 2,
    activeCount: 1,
    nearTimeoutCount: 0,
    isRecommended: false
  },
  {
    id: 'user_017',
    name: '唐专家',
    account: 'tang_zj',
    org: '中建四局投资公司',
    qualOrg: '中建四局',
    type: '合规专家',
    pendingCount: 1,
    activeCount: 2,
    nearTimeoutCount: 1,
    isRecommended: false
  },
  {
    id: 'user_018',
    name: '宋专家',
    account: 'song_zj',
    org: '中建四局安装公司',
    qualOrg: '中建四局',
    type: '合规专家',
    pendingCount: 0,
    activeCount: 0,
    nearTimeoutCount: 0,
    isRecommended: true
  }
];

const mockCheckTemplates = [
  {
    id: 'tpl_1',
    name: '一局普通合同检查模板',
    version: 'V1.0',
    types: ['自查', '互查', '稽查'],
    status: '已发布',
    itemCount: 8,
    systemItemCount: 2,
    effectiveTime: '2026-01-01 00:00:00',
    remark: '适用于一局范围内所有普通合同的合规性检查，包含约标、发标、合同签订等阶段。',
    items: [
      { id: 'item_1', stage: '约标阶段', name: '采购项目关联性检测', standard: '检查合同是否正确关联经审批的采购项目。', type: '系统识别', risk: '高', required: true, status: true },
      { id: 'item_2', stage: '约标阶段', name: '约标文件合规性审查', standard: '审查约标文件是否包含完整技术规格书、商务条款及合规承诺书。', type: '人工检查', risk: '中', required: true, status: true },
      { id: 'item_3', stage: '发标阶段', name: '招标文件发布时限校验', standard: '校验招标文件发布至投标截止日的时限要求。', type: '系统识别', risk: '高', required: true, status: true },
      { id: 'item_4', stage: '合同阶段', name: '合同主体资格审查', standard: '检查签约主体资格及营业执照等证明材料。', type: '人工检查', risk: '高', required: true, status: true }
    ]
  },
  {
    id: 'tpl_2',
    name: '常规采购自查模板',
    version: 'V2.0',
    types: ['自查'],
    status: '已发布',
    itemCount: 3,
    systemItemCount: 1,
    effectiveTime: '2026-06-01 00:00:00',
    remark: '适用于常规采购项目的自查。',
    items: [
      { id: 'item_5', stage: '发标阶段', name: '采购方案审批检查', standard: '检查采购方案是否完成审批。', type: '人工检查', risk: '高', required: true, status: true },
      { id: 'item_6', stage: '评标阶段', name: '评标记录完整性检查', standard: '检查评标记录及评审意见是否完整。', type: '人工检查', risk: '中', required: true, status: true },
      { id: 'item_7', stage: '合同阶段', name: '合同金额一致性检测', standard: '检测合同金额与中标金额是否一致。', type: '系统识别', risk: '高', required: true, status: true }
    ]
  },
  {
    id: 'tpl_3',
    name: '工程采购基础自查模板',
    version: 'V1.3',
    types: ['自查'],
    status: '已发布',
    itemCount: 2,
    systemItemCount: 0,
    effectiveTime: '2026-03-01 00:00:00',
    remark: '适用于工程采购项目的基础自查。',
    items: [
      { id: 'item_8', stage: '发标阶段', name: '招标文件审批检查', standard: '检查招标文件审批记录是否完整。', type: '人工检查', risk: '中', required: true, status: true },
      { id: 'item_9', stage: '合同阶段', name: '合同条款完整性审查', standard: '检查合同核心条款是否完整。', type: '人工检查', risk: '中', required: true, status: true }
    ]
  },
  {
    id: 'tpl_4',
    name: '材料采购专项自查模板',
    version: 'V1.1',
    types: ['自查'],
    status: '已发布',
    itemCount: 2,
    systemItemCount: 1,
    effectiveTime: '2026-04-01 00:00:00',
    remark: '适用于材料采购的专项自查。',
    items: [
      { id: 'item_10', stage: '评标阶段', name: '评标专家回避检查', standard: '检查评标专家回避情况。', type: '人工检查', risk: '高', required: true, status: true },
      { id: 'item_11', stage: '合同阶段', name: '供应商资质有效性检测', standard: '检测供应商资质是否在有效期内。', type: '系统识别', risk: '高', required: true, status: true }
    ]
  },
  {
    id: 'tpl_5',
    name: '设备采购合规自查模板',
    version: 'V1.0',
    types: ['自查'],
    status: '已发布',
    itemCount: 2,
    systemItemCount: 0,
    effectiveTime: '2026-05-01 00:00:00',
    remark: '适用于设备采购项目的合规自查。',
    items: [
      { id: 'item_12', stage: '约标阶段', name: '技术参数合规审查', standard: '审查技术参数是否存在排他性设置。', type: '人工检查', risk: '高', required: true, status: true },
      { id: 'item_13', stage: '合同阶段', name: '验收约定审查', standard: '检查合同验收约定是否明确。', type: '人工检查', risk: '中', required: true, status: true }
    ]
  },
  {
    id: 'tpl_6',
    name: '服务采购通用自查模板',
    version: 'V1.2',
    types: ['自查'],
    status: '已发布',
    itemCount: 2,
    systemItemCount: 0,
    effectiveTime: '2026-07-01 00:00:00',
    remark: '适用于服务采购项目的通用自查。',
    items: [
      { id: 'item_14', stage: '发标阶段', name: '服务范围审查', standard: '检查服务范围描述是否明确。', type: '人工检查', risk: '中', required: true, status: true },
      { id: 'item_15', stage: '合同阶段', name: '履约保障审查', standard: '检查履约保障措施是否符合要求。', type: '人工检查', risk: '低', required: false, status: true }
    ]
  }
];

const adjustmentStatuses = [
  '自查待处理', '自查中', '自查已收回',
  '互查待处理', '互查中', '互查已收回',
  '稽查待处理', '稽查中', '稽查已收回'
];

const TaskDispatch: React.FC = () => {
  const [activeTab, setActiveTab] = useState('self');
  const [activeStatusTab, setActiveStatusTab] = useState('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isAssignmentPageOpen, setIsAssignmentPageOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [assignmentMode, setAssignmentMode] = useState<'dispatch' | 'adjust'>('dispatch');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateKeyword, setTemplateKeyword] = useState('');
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const [isProportionalModalOpen, setIsProportionalModalOpen] = useState(false);
  const [extractRatio, setExtractRatio] = useState(100);
  const [proportionalTemplateId, setProportionalTemplateId] = useState<string | undefined>(undefined);
  const [distributionWeights, setDistributionWeights] = useState<Record<string, number>>({
    user_002: 30,
    user_007: 25,
    user_011: 20,
    user_012: 15,
    user_013: 10,
    user_014: 30,
    user_015: 25,
    user_016: 20,
    user_017: 15,
    user_018: 10
  });

  // 筛选状态
  const [bidNoFilter, setBidNoFilter] = useState('');
  const [bidNameFilter, setBidNameFilter] = useState('');
  const [contractNoFilter, setContractNoFilter] = useState('');
  const [contractNameFilter, setContractNameFilter] = useState('');
  const [orgFilter, setOrgFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  // 重置筛选
  const handleReset = () => {
    setBidNoFilter('');
    setBidNameFilter('');
    setContractNoFilter('');
    setContractNameFilter('');
    setOrgFilter(undefined);
    setStatusFilter(undefined);
  };

  // 根据当前Tab获取状态枚举
  const getStatusOptions = () => {
    if (activeTab === 'self') {
      return [
        { value: '自查待派发', label: '自查待派发' },
        { value: '自查待处理', label: '自查待处理' },
        { value: '自查中', label: '自查中' },
        { value: '自查回退审批中', label: '自查回退审批中' },
        { value: '自查已收回', label: '自查已收回' },
        { value: '自查待处置', label: '自查待处置' },
        { value: '自查待复核', label: '自查待复核' },
        { value: '自查复核不通过', label: '自查复核不通过' },
        { value: '自查结论申诉中', label: '自查结论申诉中' },
      ];
    }
    if (activeTab === 'mutual') {
      return [
        { value: '已自查', label: '已自查' },
        { value: '互查待处理', label: '互查待处理' },
        { value: '互查中', label: '互查中' },
        { value: '互查回退审批中', label: '互查回退审批中' },
        { value: '互查已收回', label: '互查已收回' },
        { value: '互查待处置', label: '互查待处置' },
        { value: '互查待复核', label: '互查待复核' },
        { value: '互查复核不通过', label: '互查复核不通过' },
        { value: '互查结论申诉中', label: '互查结论申诉中' },
      ];
    }
    if (activeTab === 'audit') {
      return [
        { value: '已互查', label: '已互查' },
        { value: '稽查待处理', label: '稽查待处理' },
        { value: '稽查中', label: '稽查中' },
        { value: '稽查回退审批中', label: '稽查回退审批中' },
        { value: '稽查已收回', label: '稽查已收回' },
        { value: '稽查待处置', label: '稽查待处置' },
        { value: '稽查待复核', label: '稽查待复核' },
        { value: '稽查复核不通过', label: '稽查复核不通过' },
        { value: '稽查结论申诉中', label: '稽查结论申诉中' },
        { value: '已稽查', label: '已稽查' },
      ];
    }
    return [];
  };

  const handleDispatch = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择需要派发的合同任务');
      return;
    }

    const selectedStatuses = selectedRowKeys.map(key => mockContracts.find(c => c.key === key)?.status);
    const canOperateStatuses = [
      '已自查', '已互查', '自查待派发',
      ...adjustmentStatuses
    ];
    if (selectedStatuses.some(status => !status || !canOperateStatuses.includes(status))) {
      message.warning('当前选中的任务不支持发起或派发操作');
      return;
    }

    const operationTypes = new Set(selectedStatuses.map(status => {
      if (['已自查', '已互查'].includes(status as string)) return 'initiate';
      if (status === '自查待派发') return 'assign';
      return 'adjust';
    }));
    if (operationTypes.size > 1) {
      message.warning('不同派发操作类型不可合并操作');
      return;
    }
    
    // 校验：不能跨组织批量派发
    const firstOrg = mockContracts.find(c => c.key === selectedRowKeys[0])?.orgId;
    const hasCrossOrg = selectedRowKeys.some(key => {
      const contract = mockContracts.find(c => c.key === key);
      return contract?.orgId !== firstOrg;
    });

    if (hasCrossOrg) {
      message.error('禁止跨组织批量勾选派发，请重新选择同一组织下的合同任务');
      return;
    }

    const selectedContracts = mockContracts.filter(contract => selectedRowKeys.includes(contract.key));
    const isAdjustment = selectedStatuses.every(status => adjustmentStatuses.includes(status as string));
    const templateIds = [...new Set(selectedContracts.map(contract => contract.templateId))];
    if (isAdjustment && templateIds.length > 1) {
      message.warning('批量调整派发仅支持原检查项模板相同的任务');
      return;
    }

    setSelectedPersonnel(null);
    setSelectedTemplateId(isAdjustment ? templateIds[0] : null);
    setAssignmentMode(isAdjustment ? 'adjust' : 'dispatch');
    setIsAssignmentPageOpen(true);
  };

  const handleConfirmDispatch = () => {
    if (!selectedTemplateId) {
      message.warning('请选择检查项模板');
      return;
    }

    if (!selectedPersonnel) {
      message.warning('请选择办理人/合规专员');
      return;
    }
    
    message.success('任务派发成功！任务状态已流转至相应办理状态，并已发送待办通知。');
    setIsAssignmentPageOpen(false);
    setSelectedRowKeys([]);
    setSelectedPersonnel(null);
    setSelectedTemplateId(null);
    setAssignmentMode('dispatch');
  };

  const handleBackToList = () => {
    setIsAssignmentPageOpen(false);
    setSelectedPersonnel(null);
    setSelectedTemplateId(null);
    setAssignmentMode('dispatch');
  };

  const getProportionalPreview = () => {
    const candidates = mockPersonnel.filter(person => (
      person.type === '合规专家'
      && selectedContracts.every(contract => person.org !== contract.org)
      && (distributionWeights[person.id] || 0) > 0
    ));
    const totalWeight = candidates.reduce((sum, person) => sum + (distributionWeights[person.id] || 0), 0);
    const extractCount = Math.ceil(selectedContracts.length * extractRatio / 100);
    const extractedContracts = selectedContracts.slice(0, extractCount);
    const preview = candidates.map(person => {
      const ratio = totalWeight ? (distributionWeights[person.id] || 0) / totalWeight : 0;
      const exact = extractedContracts.length * ratio;
      return {
        ...person,
        ratio,
        exact,
        assigned: Math.floor(exact)
      };
    });
    let remaining = extractedContracts.length - preview.reduce((sum, person) => sum + person.assigned, 0);
    [...preview]
      .sort((a, b) => (b.exact - Math.floor(b.exact)) - (a.exact - Math.floor(a.exact)) || a.pendingCount - b.pendingCount)
      .forEach(person => {
        if (remaining > 0) {
          person.assigned += 1;
          remaining -= 1;
        }
      });
    const assignmentQueue = preview.flatMap(person => Array.from({ length: person.assigned }, () => person));
    return {
      candidates: preview,
      extractedContracts,
      assignments: extractedContracts.map((contract, index) => ({ contract, person: assignmentQueue[index] })),
      totalWeight
    };
  };

  const openProportionalDispatch = () => {
    const selectedContracts = mockContracts.filter(contract => selectedRowKeys.includes(contract.key));
    if (!selectedContracts.length) {
      message.warning('请先勾选需要发起互查的合同');
      return;
    }
    if (selectedContracts.some(contract => contract.status !== '已自查')) {
      message.warning('按比例派发仅支持“已自查”的互查候选合同');
      return;
    }
    setProportionalTemplateId(undefined);
    setIsProportionalModalOpen(true);
  };

  const handleProportionalConfirm = () => {
    const preview = getProportionalPreview();
    if (!preview.totalWeight) {
      message.warning('请至少为一名合规专家设置大于 0 的派发比例');
      return;
    }
    if (!preview.extractedContracts.length) {
      message.warning('当前抽取比例未产生可派发任务');
      return;
    }
    if (!proportionalTemplateId) {
      message.warning('请选择检查项模板');
      return;
    }
    message.success(`已按配置比例完成 ${preview.extractedContracts.length} 份合同的互查派发预览，并生成批次结果。`);
    setIsProportionalModalOpen(false);
    setSelectedRowKeys([]);
  };

  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 70,
      align: 'center' as const,
      fixed: 'left' as const,
      render: (_: any, __: any, index: number) => index + 1
    },
    {
      title: '合同编号',
      dataIndex: 'contractNo',
      key: 'contractNo',
      width: 150,
      render: (text: string) => (
        <span style={{ color: '#595959' }}>{text}</span>
      )
    },
    {
      title: '合同名称',
      dataIndex: 'contractName',
      key: 'contractName',
      width: 250,
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span style={{ fontWeight: 500, color: '#262626' }}>{text}</span>
        </Tooltip>
      )
    },
    {
      title: '合同经办人',
      key: 'contractAgent',
      width: 150,
      render: (_: any, record: any) => `${record.agent}（${record.contractAgentAccount}）`
    },
    {
      title: '合同所属组织',
      dataIndex: 'org',
      key: 'org',
      width: 150
    },
    {
      title: '招标/采购编号',
      dataIndex: 'bidNo',
      key: 'bidNo',
      width: 220,
      render: (text: string) => (
        <span style={{ fontFamily: 'monospace', color: '#1890ff' }}>{text}</span>
      )
    },
    {
      title: '招标/采购名称',
      dataIndex: 'bidName',
      key: 'bidName',
      width: 250,
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Tooltip>
      )
    },
    {
      title: '招采经办人',
      key: 'procurementAgent',
      width: 150,
      render: (_: any, record: any) => `${record.procurementAgent}（${record.procurementAgentAccount}）`
    },
    {
      title: '当前状态',
      key: 'status',
      width: 150,
      render: (_: any, record: any) => (
        <Space direction="vertical" size={2}>
          <Badge status="processing" text={record.status} />
          <span style={{ fontSize: '12px', color: '#bfbfbf' }}>{record.recentRecord}</span>
        </Space>
      )
    },
    {
      title: '评审完成时间',
      dataIndex: 'reviewTime',
      key: 'reviewTime',
      width: 180,
      render: (text: string) => (
        <span style={{ color: '#8c8c8c' }}>{text}</span>
      )
    },
    {
      title: '剩余时限',
      key: 'timeLeft',
      width: 120,
      render: (_: any, record: any) => {
        const isProcessing = ['自查待处理', '自查中', '互查待处理', '互查中', '稽查待处理', '稽查中'].includes(record.status);

        return isProcessing ? (
          <Space>
            <ClockCircleOutlined style={{ color: '#faad14' }} />
            <span>{record.timeLeft}</span>
          </Space>
        ) : <span>—</span>;
      }
    },
    {
      title: '派发模式',
      dataIndex: 'mode',
      key: 'mode',
      width: 120,
      render: (mode: string) => (
        <Tag color={mode === '自动派发' ? 'purple' : 'blue'}>{mode}</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: any) => {
        const canInitiate = record.status === '已自查' || record.status === '已互查';
        const canAssign = record.status === '自查待派发';
        const canAdjust = adjustmentStatuses.includes(record.status);
        if (!canInitiate && !canAssign && !canAdjust) return <span>—</span>;
        return (
          <Space>
            <Button type="link" size="small" onClick={() => {
              setSelectedRowKeys([record.key]);
              setSelectedPersonnel(null);
              setSelectedTemplateId(canAdjust ? record.templateId : null);
              setAssignmentMode(canAdjust ? 'adjust' : 'dispatch');
              setIsAssignmentPageOpen(true);
            }}>
              {canInitiate ? '人工指派' : canAssign ? '人工指派' : '调整派发'}
            </Button>
          </Space>
        );
      }
    }
  ];

  const filteredContracts = mockContracts.filter(c => {
    // 1. 页签过滤
    let tabMatch = false;
    if (activeTab === 'self') tabMatch = c.status.includes('自查');
    if (activeTab === 'mutual') tabMatch = c.status.includes('互查') || c.status === '已自查';
    if (activeTab === 'audit') tabMatch = c.status.includes('稽查') || c.status === '已互查' || c.status === '已稽查';
    if (!tabMatch) return false;

    const pendingStatus = activeTab === 'self' ? '自查待派发' : activeTab === 'mutual' ? '已自查' : '已互查';
    if (activeStatusTab === 'pending' && c.status !== pendingStatus) return false;
    if (activeStatusTab === 'dispatched' && (c.status === '自查待派发' || c.status === '已自查' || c.status === '已互查')) return false;

    // 2. 筛选条件过滤
    if (bidNoFilter && !c.bidNo.toLowerCase().includes(bidNoFilter.toLowerCase())) return false;
    if (bidNameFilter && !c.bidName.toLowerCase().includes(bidNameFilter.toLowerCase())) return false;
    if (contractNoFilter && !c.contractNo.toLowerCase().includes(contractNoFilter.toLowerCase())) return false;
    if (contractNameFilter && !c.contractName.toLowerCase().includes(contractNameFilter.toLowerCase())) return false;
    if (orgFilter && c.orgId !== orgFilter) return false;
    if (statusFilter) {
      if (c.status !== statusFilter) return false;
    }

    return true;
  });

  const getStatusTabCount = (statusTab: string) => mockContracts.filter(contract => {
    const typeMatches = activeTab === 'self'
      ? contract.status.includes('自查')
      : activeTab === 'mutual'
        ? contract.status.includes('互查') || contract.status === '已自查'
        : contract.status.includes('稽查') || contract.status === '已互查' || contract.status === '已稽查';
    if (!typeMatches) return false;
    const pendingStatus = activeTab === 'self' ? '自查待派发' : activeTab === 'mutual' ? '已自查' : '已互查';
    if (statusTab === 'pending') return contract.status === pendingStatus;
    if (statusTab === 'dispatched') return contract.status !== '自查待派发' && contract.status !== '已自查' && contract.status !== '已互查';
    return true;
  }).length;

  const rowSelection = {
    selectedRowKeys,
    getCheckboxProps: (record: any) => ({
      disabled: ![
        '已自查', '已互查', '自查待派发',
        ...adjustmentStatuses
      ].includes(record.status)
    }),
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys)
  };

  const selectedContracts = mockContracts.filter(contract => selectedRowKeys.includes(contract.key));
  const checkType = activeTab === 'self' ? '自查' : activeTab === 'mutual' ? '互查' : '稽查';
  const availableCheckTemplates = mockCheckTemplates.filter(template => (
    template.status === '已发布' && template.types.includes(checkType)
  ));
  const filteredCheckTemplates = availableCheckTemplates.filter(template => (
    template.name.includes(templateKeyword.trim())
  ));
  const selectedCheckTemplate = availableCheckTemplates.find(template => template.id === selectedTemplateId);
  const candidatePersonnel = mockPersonnel.filter(person => {
    if (activeTab === 'self') return person.type === '合规专员';
    if (activeTab === 'mutual') return person.type === '合规专家';
    return person.type === '稽查专家';
  });
  const proportionalPreview = getProportionalPreview();

  const personnelColumns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 130,
      render: (name: string, record: any) => (
        <Space>
          <UserOutlined style={{ color: '#1677ff' }} />
          <span style={{ fontWeight: 600 }}>{name}</span>
          {record.isRecommended && <Tag color="green">推荐</Tag>}
        </Space>
      )
    },
    { title: '账号', dataIndex: 'account', key: 'account', width: 140 },
    { title: '人员类型', dataIndex: 'type', key: 'type', width: 130, render: (type: string) => <Tag color="blue">{type}</Tag> },
    { title: '账号所属组织', dataIndex: 'org', key: 'org', width: 180 },
    { title: '资格所属组织', dataIndex: 'qualOrg', key: 'qualOrg', width: 180 },
    { title: '待办任务', dataIndex: 'pendingCount', key: 'pendingCount', align: 'center' as const, width: 110 },
    { title: '执行中', dataIndex: 'activeCount', key: 'activeCount', align: 'center' as const, width: 100 },
    {
      title: '临期超时',
      dataIndex: 'nearTimeoutCount',
      key: 'nearTimeoutCount',
      align: 'center' as const,
      width: 110,
      render: (count: number) => <span style={{ color: count > 0 ? '#ff4d4f' : '#595959' }}>{count}</span>
    }
  ];

  const templateColumns = [
    { title: '模板名称', dataIndex: 'name', key: 'name', width: 240 },
    {
      title: '适用检查类型',
      dataIndex: 'types',
      key: 'types',
      width: 180,
      render: (types: string[]) => <Space size={4}>{types.map(type => <Tag key={type}>{type}</Tag>)}</Space>
    },
    {
      title: '检查项数量',
      key: 'itemCount',
      width: 180,
      render: (_: unknown, record: any) => `人工项 ${record.itemCount - record.systemItemCount} 项，系统项 ${record.systemItemCount} 项`
    },
    { title: '模板说明', dataIndex: 'remark', key: 'remark', ellipsis: true }
  ];

  const checkItemColumns = [
    { title: '序号', key: 'index', width: 70, render: (_: unknown, __: unknown, index: number) => index + 1 },
    { title: '检查阶段', dataIndex: 'stage', key: 'stage', width: 130 },
    { title: '检查项', dataIndex: 'name', key: 'name', width: 220 },
    { title: '检查标准', dataIndex: 'standard', key: 'standard', ellipsis: true },
    {
      title: '检查方式',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => <Tag color={type === '系统识别' ? 'cyan' : 'blue'}>{type}</Tag>
    },
    {
      title: '风险等级',
      dataIndex: 'risk',
      key: 'risk',
      width: 100,
      render: (risk: string) => <Tag color={risk === '高' ? 'red' : risk === '中' ? 'orange' : 'green'}>{`${risk}风险`}</Tag>
    }
  ];

  const renderFilter = () => (
    <Card className="search-card" style={{ marginBottom: 16 }}>
      <Row className="search-filters" gutter={[16, 16]}>
        <Col span={6}>
          <div className="filter-item">
            <span className="filter-label">招标/采购编号：</span>
            <Input 
              placeholder="请输入编号" 
              prefix={<SearchOutlined />} 
              style={{ width: '100%' }} 
              value={bidNoFilter}
              onChange={(e) => setBidNoFilter(e.target.value)}
            />
          </div>
        </Col>
        <Col span={6}>
          <div className="filter-item">
            <span className="filter-label">招标/采购名称：</span>
            <Input 
              placeholder="请输入名称" 
              prefix={<SearchOutlined />} 
              style={{ width: '100%' }} 
              value={bidNameFilter}
              onChange={(e) => setBidNameFilter(e.target.value)}
            />
          </div>
        </Col>
        <Col span={6}>
          <div className="filter-item">
            <span className="filter-label">合同编号：</span>
            <Input 
              placeholder="请输入合同编号" 
              prefix={<SearchOutlined />} 
              style={{ width: '100%' }} 
              value={contractNoFilter}
              onChange={(e) => setContractNoFilter(e.target.value)}
            />
          </div>
        </Col>
        <Col span={6}>
          <div className="filter-item">
            <span className="filter-label">合同名称：</span>
            <Input 
              placeholder="请输入合同名称" 
              prefix={<SearchOutlined />} 
              style={{ width: '100%' }} 
              value={contractNameFilter}
              onChange={(e) => setContractNameFilter(e.target.value)}
            />
          </div>
        </Col>
        <Col span={6}>
          <div className="filter-item">
            <span className="filter-label">合同所属组织：</span>
            <Select 
              placeholder="全部合同所属组织" 
              style={{ width: '100%' }} 
              allowClear
              value={orgFilter}
              onChange={(val) => setOrgFilter(val)}
            >
              <Select.Option value="org_001">中建四局一公司</Select.Option>
              <Select.Option value="org_002">中建四局二公司</Select.Option>
              <Select.Option value="org_003">中建四局三公司</Select.Option>
            </Select>
          </div>
        </Col>
        <Col span={6}>
          <div className="filter-item">
            <span className="filter-label">当前状态：</span>
            <Select 
              placeholder="全部状态" 
              style={{ width: '100%' }} 
              allowClear
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={getStatusOptions()}
            />
          </div>
        </Col>
        <Col span={12}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button type="primary" icon={<SearchOutlined />} onClick={() => {
              // antd 已经通过受控组件状态绑定了，这里只需要触发一下 render
              // 实际生产可能还有真正的 api 调用，这里我们更新一下过滤后的数据即可。
              message.success('查询成功');
            }}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );

  const renderDispatchContent = () => (
    <>
      <Tabs
        className="dispatch-status-tabs"
        activeKey={activeStatusTab}
        onChange={(key) => {
          setActiveStatusTab(key);
          setSelectedRowKeys([]);
          setStatusFilter(undefined);
        }}
        items={[
          { key: 'all', label: `全部 (${getStatusTabCount('all')})` },
          { key: 'pending', label: `待派发 (${getStatusTabCount('pending')})` },
          { key: 'dispatched', label: `已派发 (${getStatusTabCount('dispatched')})` }
        ]}
      />
      {renderFilter()}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button type="primary" disabled={selectedRowKeys.length === 0} onClick={handleDispatch}>
            {selectedRowKeys.some(key => ['已自查', '已互查'].includes(mockContracts.find(c => c.key === key)?.status || ''))
              ? '批量派发'
              : selectedRowKeys.some(key => mockContracts.find(c => c.key === key)?.status === '自查待派发')
                ? '批量人工指派'
                : '批量调整派发'} ({selectedRowKeys.length})
          </Button>
          {activeTab === 'mutual' && <Button disabled={selectedRowKeys.length === 0} onClick={openProportionalDispatch}>系统自动规则抽取</Button>}
        </Space>
      </div>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredContracts}
        rowKey="key"
        scroll={{ x: 2100 }}
        pagination={{ total: filteredContracts.length, pageSize: 10, showTotal: (total) => `共 ${total} 条符合条件任务` }}
      />
    </>
  );

  return (
    <CentralizedProcurementLayout activeMenuKey="task-dispatch">
      <div className="task-dispatch-page">
        {!isAssignmentPageOpen && <>
          <div className="page-header">
            <Breadcrumb items={[
              { title: '首页' },
              { title: '招标采购' },
              { title: '一单一检' },
              { title: '派发任务' },
            ]} />
           
          </div>

          <Card className="list-card">
          <Tabs
            activeKey={activeTab}
            onChange={(key) => {
              setActiveTab(key);
              setActiveStatusTab('all');
              setSelectedRowKeys([]);
              setStatusFilter(undefined);
            }}
            items={[
              { 
                key: 'self', 
                label: '自查发起/派发',
                children: renderDispatchContent()
              },
              { 
                key: 'mutual', 
                label: '互查任务发起/派发',
                children: renderDispatchContent()
              },
              { 
                key: 'audit', 
                label: '稽查任务发起/派发',
                children: renderDispatchContent()
              }
            ]}
          />
          </Card>
        </>}

        {isAssignmentPageOpen && (
          <div className="assignment-page">
            <TopActionBar
              title={assignmentMode === 'adjust' ? '调整派发' : '人工指派'}
              actions={(
                <Space>
                <Button onClick={handleBackToList}>取消</Button>
                <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleConfirmDispatch}>{assignmentMode === 'adjust' ? '确认调整并流转' : '确认指派并流转'}</Button>
                </Space>
              )}
            />

            <Card className="assignment-section" title="所选合同单据" extra={<Tag color="blue">已选 {selectedContracts.length} 份</Tag>}>
              <Table
                columns={columns.filter(column => !['index', 'action'].includes(column.key))}
                dataSource={selectedContracts}
                rowKey="key"
                pagination={false}
                scroll={{ x: 1300 }}
                size="middle"
              />
            </Card>

            <Card
              className="assignment-section"
              title="检查项模板"
              extra={<Tag color="blue">{assignmentMode === 'adjust' ? '调整派发沿用原模板版本' : `仅展示适用于${checkType}且已发布的版本`}</Tag>}
            >
              <Space>
                {assignmentMode === 'dispatch' && <Button type="primary" onClick={() => {
                  setPendingTemplateId(selectedTemplateId);
                  setTemplateKeyword('');
                  setIsTemplateModalOpen(true);
                }}>
                  {selectedCheckTemplate ? '重新选择检查项模板' : '选择检查项模板'}
                </Button>}
                {selectedCheckTemplate && <span>{selectedCheckTemplate.name}</span>}
                {assignmentMode === 'adjust' && <Tag color="gold">已锁定</Tag>}
              </Space>
              {selectedCheckTemplate && (
                <Descriptions className="contract-summary" size="small" column={1} bordered>
                  <Descriptions.Item label="模板名称">{selectedCheckTemplate.name}</Descriptions.Item>
                </Descriptions>
              )}
              {selectedCheckTemplate && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 12 }}>检查项明细</div>
                  <Table
                    columns={checkItemColumns}
                    dataSource={selectedCheckTemplate.items.filter((item: any) => item.status)}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    scroll={{ x: 1100 }}
                  />
                </div>
              )}
            </Card>

            <Card className="assignment-section" title="可选合规人员" extra="已按人员类型、组织资质及回避规则筛选">
              <Table
                rowSelection={{
                  type: 'radio',
                  selectedRowKeys: selectedPersonnel ? [selectedPersonnel] : [],
                  onChange: (keys) => setSelectedPersonnel((keys[0] as string) || null)
                }}
                columns={personnelColumns}
                dataSource={candidatePersonnel}
                rowKey="id"
                onRow={(record: any) => ({
                  onClick: () => setSelectedPersonnel(record.id)
                })}
                scroll={{ x: 1200 }}
                pagination={{
                  pageSize: 5,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 名可选人员`
                }}
              />
            </Card>

            <Modal
              title="选择检查项模板"
              open={isTemplateModalOpen}
              width={1000}
              onCancel={() => setIsTemplateModalOpen(false)}
              onOk={() => {
                if (!pendingTemplateId) {
                  message.warning('请选择检查项模板');
                  return;
                }
                setSelectedTemplateId(pendingTemplateId);
                setIsTemplateModalOpen(false);
              }}
              okText="确定选择"
              cancelText="取消"
            >
              <Input
                placeholder="请输入模板名称"
                value={templateKeyword}
                onChange={(event) => setTemplateKeyword(event.target.value)}
                style={{ width: 280, marginBottom: 16 }}
                allowClear
              />
              <Table
                rowSelection={{
                  type: 'radio',
                  selectedRowKeys: pendingTemplateId ? [pendingTemplateId] : [],
                  onChange: (keys) => setPendingTemplateId((keys[0] as string) || null)
                }}
                columns={templateColumns}
                dataSource={filteredCheckTemplates}
                rowKey="id"
                onRow={(record: any) => ({ onClick: () => setPendingTemplateId(record.id) })}
                pagination={{
                  pageSize: 5,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 个可选模板`
                }}
              />
            </Modal>

          </div>
        )}
        <Modal
          title="系统自动规则抽取与按比例派发"
          open={isProportionalModalOpen}
          width={1080}
          onCancel={() => setIsProportionalModalOpen(false)}
          onOk={handleProportionalConfirm}
          okText="确认生成派发批次"
          cancelText="取消"
        >
          <Alert type="info" showIcon icon={<InfoCircleOutlined />} message="按比例派发会将本次抽取的合同按专家配置权重分配；比例不必相加为 100%，系统会自动归一化，并用最大余数法补齐整数任务数。" style={{ marginBottom: 20 }} />
          <Row gutter={16} className="proportional-summary">
            <Col span={8}><div className="proportional-metric"><span>候选合同</span><strong>{selectedContracts.length} 份</strong></div></Col>
            <Col span={8}><div className="proportional-metric"><span>抽取比例</span><strong>{extractRatio}%</strong></div></Col>
            <Col span={8}><div className="proportional-metric"><span>预计派发</span><strong>{proportionalPreview.extractedContracts.length} 份</strong></div></Col>
          </Row>
          <div className="proportional-controls"><span>本次抽取比例：</span><InputNumber min={1} max={100} value={extractRatio} onChange={(value) => setExtractRatio(Number(value) || 1)} addonAfter="%" /></div>
          <Divider orientation="left">检查项模板</Divider>
          <div className="proportional-template-selector">
            <span>检查项模板：</span>
            <Select
              placeholder="请选择适用于互查的检查项模板"
              value={proportionalTemplateId}
              onChange={setProportionalTemplateId}
              options={availableCheckTemplates.map(template => ({ value: template.id, label: `${template.name} ${template.version}` }))}
              style={{ width: 360 }}
            />
          </div>
          <Divider orientation="left">专家派发比例 <Button type="primary" size="small" onClick={() => message.success(`已按当前比例完成 ${proportionalPreview.extractedContracts.length} 份合同的抽取预览`)}>抽取 <Tooltip title="系统先按本次抽取比例从已勾选合同中依次抽取任务；再将专家配置权重归一化，按“抽取数量 × 个人权重 ÷ 权重总和”计算理论任务数。先分配整数部分，剩余任务按小数余数从高到低补齐；余数相同则优先分配给当前待办量较低的专家。"><QuestionCircleOutlined /></Tooltip></Button></Divider>
          <Table size="small" rowKey="id" pagination={false} dataSource={proportionalPreview.candidates} columns={[
            { title: '合规专家', key: 'name', render: (_: unknown, record: any) => `${record.name}（${record.account}）` },
            { title: '账号所属组织', dataIndex: 'org', key: 'org' },
            { title: '当前待办', dataIndex: 'pendingCount', key: 'pendingCount', align: 'center' as const },
            { title: '配置权重', key: 'weight', render: (_: unknown, record: any) => <InputNumber min={0} value={distributionWeights[record.id] || 0} onChange={(value) => setDistributionWeights({ ...distributionWeights, [record.id]: Number(value) || 0 })} /> },
            { title: '归一后占比', key: 'ratio', render: (_: unknown, record: any) => `${(record.ratio * 100).toFixed(1)}%` },
            { title: '预计派发', key: 'assigned', render: (_: unknown, record: any) => <Tag color="blue">{record.assigned} 份</Tag> }
          ]} />
          <Divider orientation="left">派发结果预览</Divider>
          <Table size="small" rowKey={({ contract }: any) => contract.key} pagination={{ pageSize: 5, showTotal: total => `共 ${total} 份抽中合同` }} dataSource={proportionalPreview.assignments} columns={[
            { title: '合同编号', key: 'contractNo', render: (_: unknown, record: any) => record.contract.contractNo },
            { title: '合同名称', key: 'contractName', ellipsis: true, render: (_: unknown, record: any) => record.contract.contractName },
            { title: '所属合同组织', key: 'org', render: (_: unknown, record: any) => record.contract.org },
            { title: '目标专家', key: 'person', render: (_: unknown, record: any) => `${record.person?.name || '—'}（${record.person?.account || '—'}）` },
            { title: '回避校验', key: 'avoidance', render: () => <Tag color="green">跨单位通过</Tag> }
          ]} />
        </Modal>
      </div>
    </CentralizedProcurementLayout>
  );
};

export default TaskDispatch;
