/**
 * @name 我的任务
 * @description 集采工作台核心办理入口，统一承载检查执行、不合规处置、整改复核和申诉处理任务。
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Table,
  Tabs,
  Tag,
  Space,
  Button,
  Input,
  Select,
  DatePicker,
  Breadcrumb,
  Badge,
  Checkbox,
  Card,
  ConfigProvider,
  Descriptions,
  Radio,
  Timeline,
  Upload,
  message
} from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import {
  SearchOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  PaperClipOutlined,
  SaveOutlined,
  UploadOutlined,
  PushpinFilled
} from '@ant-design/icons';

dayjs.locale('zh-cn');
import CentralizedProcurementLayout from '../../components/centralized-procurement-layout';
import TopActionBar from '../../components/top-action-bar';
import './style.css';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const taskStatusesByType = {
  自查: ['自查待处理', '自查中', '自查回退审批中', '自查已收回', '自查待处置', '自查待复核', '自查复核不通过', '自查申诉中', '已自查'],
  互查: ['互查待处理', '互查中', '互查回退审批中', '互查待处置', '互查待复核', '互查复核不通过', '互查申诉中', '已互查'],
  稽查: ['稽查待处理', '稽查中', '稽查回退审批中', '稽查待处置', '稽查待复核', '稽查复核不通过', '稽查申诉中', '已稽查']
};

type TaskType = keyof typeof taskStatusesByType;
type TransitionRecord = {
  eventType: string;
  description: string;
  fromStatus: string;
  toStatus: string;
  operator: string;
  operatedAt: string;
  remark: string;
  relatedBusinessNo: string;
};

const getStageStart = (type: TaskType) => type === '自查' ? '合同评审完成' : type === '互查' ? '已自查' : '已互查';
const getInspector = (type: TaskType) => type === '自查' ? '李敏（合规专员）' : type === '互查' ? '张磊（合规专家）' : '王璐（稽查专家）';
const hasProcessingTimeLimit = (status: string) => status.endsWith('待处理') || (status.endsWith('中') && !status.includes('申诉')) || status.includes('回退审批中');
type TransitionDraft = Omit<TransitionRecord, 'operatedAt' | 'relatedBusinessNo'>;

const createTransitionRecords = (type: TaskType, status: string, sequence: number): TransitionRecord[] => {
  const drafts: TransitionDraft[] = [];
  const add = (eventType: string, description: string, fromStatus: string, toStatus: string, operator: string, remark: string) => {
    drafts.push({ eventType, description, fromStatus, toStatus, operator, remark });
  };
  const addCompletedStage = (stage: TaskType, withIssues: boolean) => {
    const pendingStatus = `${stage}待处理`;
    const processingStatus = `${stage}中`;
    const dispositionStatus = `${stage}待处置`;
    const reviewStatus = `${stage}待复核`;
    const completeStatus = `已${stage}`;
    const inspector = getInspector(stage);
    add(stage === '自查' ? '任务生成并派发' : `发起${stage}并派发`, `${stage}任务已派发至检查人`, getStageStart(stage), pendingStatus, '系统', '自动派发成功，已生成检查待办。');
    add('开始办理', `检查人开始办理${stage}任务`, pendingStatus, processingStatus, inspector, '已开始执行检查。');
    const hidesSelfCheckResult = type === '互查' && stage === '自查';
    if (!withIssues) {
      add('检查提交', hidesSelfCheckResult ? '自查检查已提交' : `${stage}检查结论为合规`, processingStatus, completeStatus, inspector, hidesSelfCheckResult ? '自查检查流程已完成。' : '全部检查项判定合规。');
      return;
    }
    add('检查提交', hidesSelfCheckResult ? '自查检查已提交' : `${stage}检查发现不合规项`, processingStatus, dispositionStatus, inspector, hidesSelfCheckResult ? '自查检查流程已进入后续处理。' : '发现不合规检查项，已生成处置待办。');
    add('整改提交', '合同经办人提交整改材料', dispositionStatus, reviewStatus, '周晨（合同经办人）', '已补充审批记录及说明材料。');
    add('全部问题闭环', `${stage}问题整改复核通过`, reviewStatus, completeStatus, inspector, '全部问题已闭环。');
  };
  const addPredecessors = () => {
    if (type === '互查' || type === '稽查') addCompletedStage('自查', sequence % 2 === 0);
    if (type === '稽查') addCompletedStage('互查', sequence % 3 === 0);
  };
  const pendingStatus = `${type}待处理`;
  const processingStatus = `${type}中`;
  const dispositionStatus = `${type}待处置`;
  const reviewStatus = `${type}待复核`;
  const rejectedStatus = `${type}复核不通过`;
  const appealStatus = `${type}申诉中`;
  const completeStatus = `已${type}`;
  const inspector = getInspector(type);

  addPredecessors();
  add(type === '自查' ? '任务生成并派发' : `发起${type}并派发`, `${type}任务已派发至检查人`, getStageStart(type), pendingStatus, '系统', '自动派发成功，已生成检查待办。');
  if (status === pendingStatus) return finalizeTransitionRecords(drafts, sequence);

  if (status === `${type}回退审批中`) {
    if (sequence % 2 === 0) add('开始办理', `检查人开始办理${type}任务`, pendingStatus, processingStatus, inspector, '已开始执行检查。');
    const fromStatus = sequence % 2 === 0 ? processingStatus : pendingStatus;
    add('回退申请', `检查人申请回退${type}任务`, fromStatus, status, inspector, '当前任务资料不完整，申请退回重新派发。');
    return finalizeTransitionRecords(drafts, sequence);
  }

  if (status === '自查已收回') {
    const fromStatus = sequence % 2 === 0 ? processingStatus : pendingStatus;
    if (fromStatus === processingStatus) add('开始办理', '检查人开始办理自查任务', pendingStatus, processingStatus, inspector, '已开始执行检查。');
    add('超时提醒', '自查任务超过办结时限', fromStatus, fromStatus, '系统', '已向当前检查人发送超时提醒。');
    add('自动收回', '系统自动收回超时自查任务', fromStatus, status, '系统', '任务已收回，等待重新派发。');
    return finalizeTransitionRecords(drafts, sequence);
  }

  add('开始办理', `检查人开始办理${type}任务`, pendingStatus, processingStatus, inspector, '已开始执行检查。');
  if (status === processingStatus) return finalizeTransitionRecords(drafts, sequence);

  if (status === completeStatus) {
    if (sequence % 2 === 0) add('检查提交', `${type}检查结论为合规`, processingStatus, completeStatus, inspector, '全部检查项判定合规。');
    else {
      add('检查提交', `${type}检查发现不合规项`, processingStatus, dispositionStatus, inspector, '发现不合规检查项，已生成处置待办。');
      add('整改提交', '合同经办人提交整改材料', dispositionStatus, reviewStatus, '周晨（合同经办人）', '已补充审批记录及说明材料。');
      add('全部问题闭环', `${type}问题整改复核通过`, reviewStatus, completeStatus, inspector, '全部问题已闭环。');
    }
    return finalizeTransitionRecords(drafts, sequence);
  }

  add('检查提交', `${type}检查发现不合规项`, processingStatus, dispositionStatus, inspector, '发现不合规检查项，已生成处置待办。');
  if (status === dispositionStatus) return finalizeTransitionRecords(drafts, sequence);
  if (status === appealStatus) {
    add('申诉提交', '合同经办人按检查项提交申诉', dispositionStatus, appealStatus, '周晨（合同经办人）', '已提交申诉理由及佐证材料，等待局管理员处理。');
    return finalizeTransitionRecords(drafts, sequence);
  }
  add('整改提交', '合同经办人提交整改材料', dispositionStatus, reviewStatus, '周晨（合同经办人）', '已补充审批记录及说明材料。');
  if (status === reviewStatus) return finalizeTransitionRecords(drafts, sequence);
  add('整改复核', '原检查人复核整改材料不通过', reviewStatus, rejectedStatus, inspector, '整改材料未覆盖全部问题，请继续处置。');
  return finalizeTransitionRecords(drafts, sequence);
};

const finalizeTransitionRecords = (drafts: TransitionDraft[], sequence: number): TransitionRecord[] => {
  const startTime = dayjs('2026-08-20 08:30:00').add(sequence * 11, 'minute');
  const relatedBusinessNo = `YDJ-${String(sequence).padStart(6, '0')}`;
  return drafts.map((draft, index) => ({
    ...draft,
    operatedAt: startTime.add((index + 1) * 95, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    relatedBusinessNo
  }));
};

const mockTasks = (Object.entries(taskStatusesByType) as Array<[keyof typeof taskStatusesByType, string[]]>).flatMap(([type, statuses], typeIndex) =>
  statuses.map((status, statusIndex) => {
    const sequence = typeIndex * 10 + statusIndex + 1;
    const isInspection = status.endsWith('待处理') || status.endsWith('中');
    const isRectification = status.includes('待处置') || status.includes('复核不通过');
    const isReview = status.endsWith('待复核');
    const isAppeal = status.includes('申诉');
    const hasUnqualifiedResult = isRectification || isReview || isAppeal;
    const hasTimeLimit = hasProcessingTimeLimit(status);
    const selfMutualConclusionInconsistent = type === '稽查' && [1, 3, 5].includes(statusIndex);
    const highRiskIssueCount = selfMutualConclusionInconsistent ? [4, 2, 5][[1, 3, 5].indexOf(statusIndex)] : sequence % 3;
    const isAuditPrioritySupervision = type === '稽查' && selfMutualConclusionInconsistent && highRiskIssueCount > 3;
    return {
      id: `TASK-20260901-${String(sequence).padStart(3, '0')}`,
      type,
      bidNo: `cscec202608${String(31 - (sequence % 4)).padStart(2, '0')}000000${String(4850 + sequence).padStart(4, '0')}`,
      bidName: `${['办公楼建设项目钢材采购', '高速公路工程水泥供应采购', '大型场馆机电安装分包', '商业综合体消防工程采购'][sequence % 4]}招标`,
      contractName: `${['办公楼建设项目钢材采购', '高速公路工程水泥供应采购', '大型场馆机电安装分包', '商业综合体消防工程采购'][sequence % 4]}合同`,
      contractNo: `HT-2026-${String(sequence).padStart(3, '0')}`,
      reviewCompleteTime: `2026-08-${String(31 - (sequence % 5)).padStart(2, '0')} ${String(9 + (sequence % 8)).padStart(2, '0')}:00:00`,
      inspector: getInspector(type),
      checkCompletedAt: hasUnqualifiedResult ? dayjs().subtract(status.includes('复核不通过') ? 4 : 2, 'day').subtract(sequence, 'minute').format('YYYY-MM-DD HH:mm:ss') : '-',
      status,
      pendingAction: isInspection ? '执行检查' : isRectification ? '不合规项整改' : isReview ? '整改材料复核' : isAppeal ? '查看申诉进度' : '查看任务记录',
      issueCount: isRectification || isReview || isAppeal ? (sequence % 3) + 1 : 0,
      timeLeft: hasTimeLimit ? `${sequence % 4 + 1}天 ${sequence + 1}小时` : '-',
      isNearDeadline: hasTimeLimit && sequence % 4 === 0,
      selfMutualConclusionInconsistent,
      highRiskIssueCount,
      isAuditPrioritySupervision,
      updateTime: `2026-09-01 ${String(8 + (sequence % 5)).padStart(2, '0')}:${String(sequence).padStart(2, '0')}:00`,
      transitionRecords: createTransitionRecords(type, status, sequence),
    };
  })
);

const simulatedAppealPassTask = {
  id: 'TASK-20260901-030',
  type: '自查' as const,
  bidNo: 'cscec202608310000004880',
  bidName: '重点办公楼建设项目钢材采购招标',
  contractName: '模拟申诉通过',
  contractNo: 'HT-2026-030',
  reviewCompleteTime: '2026-08-31 15:00:00',
  inspector: getInspector('自查'),
  checkCompletedAt: '2026-08-31 10:20:00',
  status: '自查待处置',
  pendingAction: '不合规项整改',
  issueCount: 1,
  timeLeft: '-',
  isNearDeadline: false,
  selfMutualConclusionInconsistent: false,
  highRiskIssueCount: 0,
  isAuditPrioritySupervision: false,
  updateTime: '2026-09-01 10:30:00',
  transitionRecords: [
    ...createTransitionRecords('自查', '自查申诉中', 30),
    {
      eventType: '申诉处理',
      description: '已完成第1轮申诉处理，1项通过、1项不通过，继续整改不通过项',
      fromStatus: '自查申诉中',
      toStatus: '自查待处置',
      operator: '局管理员',
      operatedAt: '2026-09-01 10:30:00',
      remark: '申诉通过项已视为合规；申诉不通过项由合同经办人继续整改并提交复核。',
      relatedBusinessNo: 'YDJ-000030'
    }
  ]
};

const allMockTasks = [...mockTasks, simulatedAppealPassTask];

const statusTabLabels = {
  all: '全部',
  inspection: '待检查',
  review: '待复核',
  rectification: '待整改',
  appeal: '待处理申诉'
};

const getStatusTabStatuses = (type: keyof typeof taskStatusesByType, statusTab: keyof typeof statusTabLabels) => {
  const statuses = taskStatusesByType[type];
  if (statusTab === 'inspection') return statuses.filter(status => status === `${type}待处理` || status === `${type}中`);
  if (statusTab === 'review') return statuses.filter(status => status === `${type}待复核`);
  if (statusTab === 'rectification') return statuses.filter(status => status === `${type}待处置` || status === `${type}复核不通过`);
  if (statusTab === 'appeal') return statuses.filter(status => status === `${type}申诉中`);
  return statuses;
};

const getTaskAction = (status: string) => {
  if (status.includes('申诉')) return '处理申诉';
  if (['自查待处理', '自查中', '互查待处理', '互查中', '稽查待处理', '稽查中'].includes(status)) return '检查';
  if (['自查待处置', '自查复核不通过', '互查待处置', '互查复核不通过', '稽查待处置', '稽查复核不通过'].includes(status)) return '整改';
  if (['自查待复核', '互查待复核', '稽查待复核'].includes(status)) return '复核';
  return '查看';
};

const getTaskDecisionResult = (task: { type: TaskType; status: string; transitionRecords: TransitionRecord[] }) => {
  const checkSubmission = task.transitionRecords.find(record => record.eventType === '检查提交' && record.fromStatus === `${task.type}中`);
  if (!checkSubmission) return '-';
  return checkSubmission.toStatus === `已${task.type}` ? '合规' : '不合规';
};

const getTaskRectificationResult = (task: { type: TaskType; status: string; transitionRecords: TransitionRecord[] }) => {
  if (getTaskDecisionResult(task) !== '不合规') return '-';
  return task.status === `已${task.type}` ? '已整改' : '未整改';
};

type RectificationRound = { content: string; attachments: string[]; reviewResult: string; reviewOpinion: string };
type AppealRound = { content: string; attachments: string[]; decision?: '通过' | '不通过'; opinion?: string };
type CheckItem = { key: string; stage: string; item: string; standard: string; source: '系统识别' | '人工检查'; result: string; remark: string; attachment: string; rounds: RectificationRound[] };
type CompletedBidCheckItem = CheckItem & { checker: string; checkedAt: string };

const initialAppealsByTask: Record<string, Record<string, AppealRound[]>> = {
  'TASK-20260901-030': {
    '1': [{ content: '采购项目关联关系已在审批流程中确认，申请复核该检查结论。', attachments: ['采购项目关联审批记录.pdf'], decision: '通过', opinion: '佐证材料充分，申诉通过，该项视为合规。' }],
    '4': [{ content: '合同付款节点已取得专项审批，申请撤销该不合规结论。', attachments: ['付款节点调整审批单.pdf'], decision: '不通过', opinion: '现有材料不足以证明付款节点已完成合规调整，请继续整改。' }]
  },
  'TASK-20260901-008': {
    '1': [{ content: '采购项目关联关系已在审批流程中确认，本次系统识别结果与实际业务关系不符，申请复核。', attachments: ['采购项目关联审批记录.pdf', '项目关联关系说明.pdf'] }]
  },
  'TASK-20260901-018': {
    '4': [{ content: '付款节点调整已取得专项审批，并已同步至补充协议，申请撤销该不合规结论。', attachments: ['付款节点调整审批单.pdf', '补充协议.pdf'] }]
  },
  'TASK-20260901-028': {
    '1': [{ content: '采购项目编号变更已完成系统迁移，合同关联关系正确，申请核实并调整检查结论。', attachments: ['项目编号变更通知.pdf', '系统迁移记录.pdf'] }]
  }
};

const defaultCheckItems: CheckItem[] = [
  { key: '1', stage: '招标/采购阶段 - 约标阶段', item: '采购项目关联性检测', standard: '检查合同是否正确关联了经审批的采购项目，项目编号与名称需完全一致。', source: '系统识别', result: '不合规', remark: '系统识别：合同关联的采购项目编号与审批记录不一致', attachment: '采购项目关联校验结果.pdf', rounds: [] },
  { key: '2', stage: '招标/采购阶段 - 发标阶段', item: '招标文件发布时限校验', standard: '自招标文件开始发出之日起至投标人提交投标文件截止之日止，最短不得少于二十日。', source: '系统识别', result: '合规', remark: '系统识别通过：投标截止时间满足时限要求', attachment: '', rounds: [] },
  { key: '3', stage: '招标/采购阶段 - 发标阶段', item: '投标人资格条件设置审查', standard: '检查是否设置排他性、歧视性的资格条件，是否限定特定专利、品牌或行政区域。', source: '人工检查', result: '合规', remark: '未发现限制性资格条件', attachment: '', rounds: [] },
  { key: '4', stage: '合同阶段', item: '合同关键条款', standard: '合同价款、履约期限、付款条件与中标文件保持一致。', source: '人工检查', result: '不合规', remark: '付款节点与中标文件不一致', attachment: '合同付款条款对比表.xlsx', rounds: [] }
];

const precedingCheckItems: Record<'自查' | '互查', CheckItem[]> = {
  自查: defaultCheckItems.map(item => ({
    ...item,
    remark: item.key === '1' ? '已完成整改复核：采购项目关联信息已更正。' : item.key === '4' ? '已完成整改复核：付款节点与中标文件一致。' : item.remark
  })),
  互查: defaultCheckItems.map(item => ({
    ...item,
    result: item.key === '4' ? '合规' : item.result,
    remark: item.key === '1' ? '复核确认：采购项目关联信息与审批记录一致。' : item.key === '4' ? '复核确认：付款节点设置符合中标文件要求。' : item.remark
  }))
};

const taskCheckItems: Record<string, CheckItem[]> = {
  'TASK-20260901-030': [
    defaultCheckItems[0],
    { ...defaultCheckItems[1] },
    { ...defaultCheckItems[3], rounds: [] }
  ],
  'TASK-20260901-001': [
    { ...defaultCheckItems[0], rounds: [{ content: '已补充采购方式变更说明，但未附完整审批单。', attachments: ['采购方式变更说明.pdf'], reviewResult: '不通过', reviewOpinion: '请补充完整审批单及审批流程记录。' }] },
    defaultCheckItems[1],
    { ...defaultCheckItems[2], rounds: [{ content: '已补充付款节点变更审批单及对比说明。', attachments: ['付款节点变更审批单.pdf'], reviewResult: '通过', reviewOpinion: '材料齐全，复核通过。' }] }
  ],
  'TASK-20260901-002': [
    { ...defaultCheckItems[0], rounds: [
      { content: '已补充采购方式变更说明。', attachments: ['采购方式变更说明.pdf'], reviewResult: '不通过', reviewOpinion: '缺少审批单，请继续补充。' },
      { content: '已补充变更审批单、会签记录及采购方案。', attachments: ['采购方式变更审批单.pdf', '会签记录.pdf'], reviewResult: '待复核', reviewOpinion: '' }
    ] },
    defaultCheckItems[1],
    defaultCheckItems[2],
    defaultCheckItems[3]
  ],
  'TASK-20260901-003': [
    { ...defaultCheckItems[2], rounds: [
      { content: '已提交付款比例调整说明。', attachments: ['付款比例调整说明.pdf'], reviewResult: '不通过', reviewOpinion: '未附中标文件差异审批手续。' },
      { content: '已补充差异审批单及与中标文件的一致性说明。', attachments: ['差异审批单.pdf', '一致性说明.pdf'], reviewResult: '不通过', reviewOpinion: '审批单未覆盖全部付款节点，请再次整改。' }
    ] }
  ],
  ...['TASK-20260901-006', 'TASK-20260901-015', 'TASK-20260901-025'].reduce<Record<string, CheckItem[]>>((itemsByTask, taskId) => {
    itemsByTask[taskId] = [
      {
        ...defaultCheckItems[0],
        rounds: [{
          content: '已补充采购方式变更说明、变更审批单及会签记录。',
          attachments: ['采购方式变更说明.pdf', '采购方式变更审批单.pdf', '会签记录.pdf'],
          reviewResult: '待复核',
          reviewOpinion: ''
        }]
      },
      defaultCheckItems[1],
      defaultCheckItems[2],
      {
        ...defaultCheckItems[3],
        rounds: [{
          content: '已补充付款节点差异审批单及与中标文件的对比说明。',
          attachments: ['付款节点差异审批单.pdf', '付款条款对比说明.pdf'],
          reviewResult: '待复核',
          reviewOpinion: ''
        }]
      }
    ];
    return itemsByTask;
  }, {})
};

const completedBidCheckItemsByTask: Record<string, CompletedBidCheckItem[]> = {
  'TASK-20260901-002': [
    { ...defaultCheckItems[0], result: '合规', remark: '系统识别通过：采购项目关联信息与审批记录一致。', attachment: '采购项目关联校验结果.pdf', checker: '李敏（合规专员）', checkedAt: '2026-08-28 10:16:24' },
    { ...defaultCheckItems[1], checker: '李敏（合规专员）', checkedAt: '2026-08-28 10:16:24' },
    { ...defaultCheckItems[2], remark: '未发现限制性资格条件，已完成检查。', checker: '李敏（合规专员）', checkedAt: '2026-08-28 10:22:41' }
  ]
};

const MyTasks: React.FC = () => {
  const [activeTab, setActiveTab] = useState('self');
  const [currentTime, setCurrentTime] = useState(() => dayjs());
  const [tasks, setTasks] = useState(allMockTasks);
  const [checkItemsByTask, setCheckItemsByTask] = useState(taskCheckItems);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState('查看');
  const [results, setResults] = useState<Record<string, string>>({});
  const [itemRemarks, setItemRemarks] = useState<Record<string, string>>({});
  const [itemAttachments, setItemAttachments] = useState<Record<string, string>>({});
  const [rectificationDrafts, setRectificationDrafts] = useState<Record<string, string>>({});
  const [rectificationAttachments, setRectificationAttachments] = useState<Record<string, string>>({});
  const [appealItemKeys, setAppealItemKeys] = useState<string[]>([]);
  const [appealDrafts, setAppealDrafts] = useState<Record<string, string>>({});
  const [appealAttachments, setAppealAttachments] = useState<Record<string, string>>({});
  const [appealDecisions, setAppealDecisions] = useState<Record<string, '通过' | '不通过'>>({});
  const [appealOpinions, setAppealOpinions] = useState<Record<string, string>>({});
  const [appealsByTask, setAppealsByTask] = useState(initialAppealsByTask);
  const [reviewOpinions, setReviewOpinions] = useState<Record<string, string>>({});
  const [systemCalculationStatus, setSystemCalculationStatus] = useState<'idle' | 'calculating' | 'completed'>('idle');
  const [systemResults, setSystemResults] = useState<Record<string, string>>({});
  const [activeStatusTabs, setActiveStatusTabs] = useState({
    self: 'all',
    mutual: 'all',
    audit: 'all'
  });

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // 实际生效的筛选条件（针对各页签分别管理其筛选状态）
  const [filterValues, setFilterValues] = useState({
    self: {
      id: '',
      bidNo: '',
      bidName: '',
      contractName: '',
      contractNo: '',
      status: undefined as string | undefined,
      dateRange: null as any
    },
    mutual: {
      id: '',
      bidNo: '',
      bidName: '',
      contractName: '',
      contractNo: '',
      status: undefined as string | undefined,
      dateRange: null as any
    },
    audit: {
      id: '',
      bidNo: '',
      bidName: '',
      contractName: '',
      contractNo: '',
      status: undefined as string | undefined,
      dateRange: null as any,
      selfMutualConclusionInconsistent: undefined as boolean | undefined
    }
  });

  // 输入框状态管理也针对页签隔离，不同页签有独立的搜索输入状态
  const [searchStates, setSearchStates] = useState({
    self: { id: '', bidNo: '', bidName: '', contractName: '', contractNo: '', status: undefined as string | undefined, dateRange: null as any },
    mutual: { id: '', bidNo: '', bidName: '', contractName: '', contractNo: '', status: undefined as string | undefined, dateRange: null as any },
    audit: { id: '', bidNo: '', bidName: '', contractName: '', contractNo: '', status: undefined as string | undefined, dateRange: null as any, selfMutualConclusionInconsistent: undefined as boolean | undefined }
  });

  const getSearchState = (tab: string) => {
    return searchStates[tab as keyof typeof searchStates] || searchStates.self;
  };

  const updateSearchState = (tab: string, key: string, value: any) => {
    setSearchStates(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab as keyof typeof searchStates],
        [key]: value
      }
    }));
  };

  const handleSearch = () => {
    const currentSearch = searchStates[activeTab as keyof typeof searchStates];
    setFilterValues(prev => ({
      ...prev,
      [activeTab]: { ...currentSearch }
    }));
  };

  const handleReset = () => {
    setSearchStates(prev => ({
      ...prev,
      [activeTab]: {
        id: '',
        bidNo: '',
        bidName: '',
        contractName: '',
        contractNo: '',
        status: undefined,
        dateRange: null,
        ...(activeTab === 'audit' ? { selfMutualConclusionInconsistent: undefined } : {})
      }
    }));
    setFilterValues(prev => ({
      ...prev,
      [activeTab]: {
        id: '',
        bidNo: '',
        bidName: '',
        contractName: '',
        contractNo: '',
        status: undefined,
        dateRange: null,
        ...(activeTab === 'audit' ? { selfMutualConclusionInconsistent: undefined } : {})
      }
    }));
  };

  const currentSearchState = getSearchState(activeTab);
  const currentFilter = filterValues[activeTab as keyof typeof filterValues] || filterValues.self;
  const currentType = activeTab === 'self' ? '自查' : activeTab === 'mutual' ? '互查' : '稽查';
  const currentStatusTab = activeStatusTabs[activeTab as keyof typeof activeStatusTabs] as keyof typeof statusTabLabels;
  const statusTabStatuses = getStatusTabStatuses(currentType, currentStatusTab);
  const filteredTasks = tasks.filter(t => {
    if (t.type !== currentType) return false;
    if (currentStatusTab !== 'all' && !statusTabStatuses.includes(t.status)) return false;
    if (currentFilter.id && !t.id.toLowerCase().includes(currentFilter.id.toLowerCase())) return false;
    if (currentFilter.bidNo && !t.bidNo.toLowerCase().includes(currentFilter.bidNo.toLowerCase())) return false;
    if (currentFilter.bidName && !t.bidName.toLowerCase().includes(currentFilter.bidName.toLowerCase())) return false;
    if (currentFilter.contractName && !t.contractName.toLowerCase().includes(currentFilter.contractName.toLowerCase())) return false;
    if (currentFilter.contractNo && !t.contractNo.toLowerCase().includes(currentFilter.contractNo.toLowerCase())) return false;
    if (currentFilter.status && t.status !== currentFilter.status) return false;
    if (currentType === '稽查' && currentFilter.selfMutualConclusionInconsistent !== undefined && t.selfMutualConclusionInconsistent !== currentFilter.selfMutualConclusionInconsistent) return false;
    if (currentFilter.dateRange && currentFilter.dateRange[0] && currentFilter.dateRange[1]) {
      const updateDate = new Date(t.updateTime);
      const startDate = currentFilter.dateRange[0].toDate();
      const endDate = currentFilter.dateRange[1].toDate();
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      if (updateDate < startDate || updateDate > endDate) return false;
    }
    return true;
  }).sort((first, second) => Number(second.isAuditPrioritySupervision) - Number(first.isAuditPrioritySupervision));

  const handleTaskAction = (record: typeof mockTasks[number]) => {
    setSelectedTaskId(record.id);
    setSelectedMode(record.status.includes('申诉') ? '申诉处理' : getTaskAction(record.status));
    setResults({});
    setItemRemarks({});
    setItemAttachments({});
    setRectificationDrafts({});
    setRectificationAttachments({});
    setAppealItemKeys([]);
    setAppealDrafts({});
    setAppealAttachments({});
    setAppealDecisions({});
    setAppealOpinions({});
    setReviewOpinions({});
    setSystemResults({});
    setSystemCalculationStatus('idle');
  };

  const selectedTask = tasks.find(task => task.id === selectedTaskId);
  const isInspection = selectedMode === '检查';
  const isRectification = selectedMode === '整改';
  const isReview = selectedMode === '复核';
  const isAppealing = selectedMode === '申诉';
  const isAppealProcessing = selectedMode === '申诉处理';
  const checkItems = selectedTaskId ? checkItemsByTask[selectedTaskId] || defaultCheckItems : defaultCheckItems;
  const completedBidCheckItems = selectedTaskId ? completedBidCheckItemsByTask[selectedTaskId] || [] : [];
  const usesCompletedBidChecks = isInspection && completedBidCheckItems.length > 0;
  const currentCheckItems = usesCompletedBidChecks ? checkItems.filter(item => item.stage === '合同阶段') : checkItems;
  const systemCheckItems = currentCheckItems.filter(item => item.source === '系统识别');
  const manualCheckItems = currentCheckItems.filter(item => item.source === '人工检查');
  const roundCount = Math.max(0, ...currentCheckItems.map(item => item.rounds.length));
  const actionTitle = useMemo(() => selectedTask ? `${selectedTask.type}${isAppealProcessing ? '申诉处理' : selectedMode}` : '', [isAppealProcessing, selectedMode, selectedTask]);
  const appealDeadline = selectedTask?.checkCompletedAt && selectedTask.checkCompletedAt !== '-' ? dayjs(selectedTask.checkCompletedAt).add(3, 'day') : null;
  const appealRemainingSeconds = appealDeadline ? Math.max(0, appealDeadline.diff(currentTime, 'second')) : 0;
  const canAppeal = isRectification && (selectedTask?.issueCount || 0) > 0 && appealRemainingSeconds > 0;
  const appealCountdown = `${Math.floor(appealRemainingSeconds / 86400)}天 ${String(Math.floor(appealRemainingSeconds % 86400 / 3600)).padStart(2, '0')}时 ${String(Math.floor(appealRemainingSeconds % 3600 / 60)).padStart(2, '0')}分 ${String(appealRemainingSeconds % 60).padStart(2, '0')}秒`;
  const currentAppeals = selectedTaskId ? appealsByTask[selectedTaskId] || {} : {};
  const hasAppealRecords = Object.keys(currentAppeals).length > 0;
  const getAppealDecision = (key: string) => currentAppeals[key]?.[0]?.decision;
  const needsRectification = (item: CheckItem) => item.result === '不合规' && getAppealDecision(item.key) !== '通过' && item.rounds[item.rounds.length - 1]?.reviewResult !== '通过';
  const detailDecisionResult = (() => {
    if (isInspection) {
      if (systemCheckItems.some(item => !systemResults[item.key]) || manualCheckItems.some(item => !results[item.key])) return '待判定';
      return currentCheckItems.some(item => (item.source === '系统识别' ? systemResults[item.key] : results[item.key]) === '不合规') ? '不合规' : '合规';
    }
    return checkItems.some(item => {
      const appealDecision = isAppealProcessing ? appealDecisions[item.key] || getAppealDecision(item.key) : getAppealDecision(item.key);
      return item.result === '不合规' && appealDecision !== '通过';
    }) ? '不合规' : '合规';
  })();

  const handleSystemCalculation = () => {
    setSystemCalculationStatus('calculating');
    window.setTimeout(() => {
      setSystemResults(Object.fromEntries(systemCheckItems.map(item => [item.key, item.result])));
      setSystemCalculationStatus('completed');
      message.success(`已完成 ${systemCheckItems.length} 个系统识别项的计算`);
    }, 1200);
  };

  const handleSubmit = () => {
    if (isInspection) {
      if (systemCheckItems.length > 0 && systemCalculationStatus !== 'completed') {
        message.warning('请先计算系统识别项');
        return;
      }
      if (manualCheckItems.some(item => !results[item.key])) {
        message.warning('请完成全部人工检查项的判定');
        return;
      }
      if (!selectedTask) return;
      const submittedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const submittedItems = currentCheckItems.map(item => ({
        ...item,
        result: item.source === '系统识别' ? systemResults[item.key] : results[item.key],
        remark: item.source === '系统识别' ? item.remark : itemRemarks[item.key] || item.remark,
        attachment: itemAttachments[item.key] || item.attachment
      }));
      const submittedItemMap = new Map(submittedItems.map(item => [item.key, item]));
      const updatedCheckItems = checkItems.map(item => submittedItemMap.get(item.key) || item);
      const issueCount = submittedItems.filter(item => item.result === '不合规').length;
      const nextStatus = issueCount > 0 ? `${selectedTask.type}待处置` : `已${selectedTask.type}`;
      setCheckItemsByTask(current => ({ ...current, [selectedTask.id]: updatedCheckItems }));
      setTasks(current => current.map(task => task.id === selectedTask.id ? {
        ...task,
        status: nextStatus,
        pendingAction: issueCount > 0 ? '不合规项整改' : '查看任务记录',
        issueCount,
        checkCompletedAt: submittedAt,
        updateTime: submittedAt,
        transitionRecords: [...task.transitionRecords, {
          eventType: '检查提交',
          description: issueCount > 0 ? `${task.type}检查发现不合规项` : `${task.type}检查结论为合规`,
          fromStatus: task.status,
          toStatus: nextStatus,
          operator: task.inspector,
          operatedAt: submittedAt,
          remark: issueCount > 0 ? `发现 ${issueCount} 个不合规检查项，已生成处置待办。` : '全部检查项判定合规。',
          relatedBusinessNo: `YDJ-${task.id.slice(-6)}`
        }]
      } : task));
      setSelectedMode(issueCount > 0 ? '整改' : '查看');
      message.success('检查结果已提交');
      return;
    }
    if (isReview && checkItems.some(item => item.rounds.some(round => round.reviewResult === '待复核') && !results[item.key])) {
      message.warning('请完成全部待复核检查项的复核判定');
      return;
    }
    if (isReview && checkItems.some(item => item.rounds.some(round => round.reviewResult === '待复核') && !reviewOpinions[item.key]?.trim())) {
      message.warning('请填写全部待复核检查项的复核意见');
      return;
    }
    if (isRectification && checkItems.filter(needsRectification).every(item => !rectificationDrafts[item.key]?.trim())) {
      message.warning('请至少填写一个检查项的整改说明');
      return;
    }
    if (isRectification) {
      if (!selectedTask) return;
      const submittedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const rectifiedKeys = checkItems.filter(item => needsRectification(item) && rectificationDrafts[item.key]?.trim()).map(item => item.key);
      setCheckItemsByTask(current => ({
        ...current,
        [selectedTask.id]: checkItems.map(item => rectifiedKeys.includes(item.key) ? {
          ...item,
          rounds: [...item.rounds, {
            content: rectificationDrafts[item.key].trim(),
            attachments: rectificationAttachments[item.key] ? [rectificationAttachments[item.key]] : [],
            reviewResult: '待复核',
            reviewOpinion: ''
          }]
        } : item)
      }));
      setTasks(current => current.map(task => task.id === selectedTask.id ? {
        ...task,
        status: `${task.type}待复核`,
        pendingAction: '整改材料复核',
        updateTime: submittedAt,
        transitionRecords: [...task.transitionRecords, {
          eventType: '整改提交',
          description: '合同经办人提交申诉不通过项整改材料',
          fromStatus: task.status,
          toStatus: `${task.type}待复核`,
          operator: '周晨（合同经办人）',
          operatedAt: submittedAt,
          remark: `已提交 ${rectifiedKeys.length} 个申诉不通过检查项的整改材料。`,
          relatedBusinessNo: `YDJ-${task.id.slice(-6)}`
        }]
      } : task));
      setSelectedMode('复核');
      message.success('整改已提交，进入复核');
      return;
    }
    if (isReview) {
      if (!selectedTask) return;
      const reviewedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const reviewKeys = checkItems.filter(item => item.rounds.some(round => round.reviewResult === '待复核')).map(item => item.key);
      const rejectedKeys = reviewKeys.filter(key => results[key] === '不通过');
      const nextStatus = rejectedKeys.length > 0 ? `${selectedTask.type}复核不通过` : `已${selectedTask.type}`;
      setCheckItemsByTask(current => ({
        ...current,
        [selectedTask.id]: checkItems.map(item => reviewKeys.includes(item.key) ? {
          ...item,
          rounds: item.rounds.map(round => round.reviewResult === '待复核' ? { ...round, reviewResult: results[item.key], reviewOpinion: reviewOpinions[item.key].trim() } : round)
        } : item)
      }));
      setTasks(current => current.map(task => task.id === selectedTask.id ? {
        ...task,
        status: nextStatus,
        pendingAction: rejectedKeys.length > 0 ? '不合规项整改' : '查看任务记录',
        issueCount: rejectedKeys.length,
        updateTime: reviewedAt,
        transitionRecords: [...task.transitionRecords, {
          eventType: '整改复核',
          description: rejectedKeys.length > 0 ? '整改复核存在不通过项，退回继续整改' : '申诉不通过项整改复核通过，任务闭环',
          fromStatus: task.status,
          toStatus: nextStatus,
          operator: selectedTask.inspector,
          operatedAt: reviewedAt,
          remark: `已复核 ${reviewKeys.length} 个整改检查项。`,
          relatedBusinessNo: `YDJ-${task.id.slice(-6)}`
        }]
      } : task));
      setSelectedMode('查看');
      message.success('复核结果已提交');
      return;
    }
    if (isAppealing) {
      if (appealRemainingSeconds <= 0) {
        message.warning('申诉时限已超过3天，无法提交申诉');
        return;
      }
      if (appealItemKeys.length === 0) {
        message.warning('请选择需要申诉的检查项');
        return;
      }
      if (!selectedTask) return;
      const submittedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const appealRounds = Object.fromEntries(appealItemKeys.map(key => [key, [{ content: appealDrafts[key], attachments: appealAttachments[key] ? [appealAttachments[key]] : [] }]]));
      setAppealsByTask(current => ({ ...current, [selectedTask.id]: appealRounds }));
      setTasks(current => current.map(task => task.id === selectedTask.id ? {
        ...task,
        status: `${task.type}申诉中`,
        pendingAction: '查看申诉进度',
        updateTime: submittedAt,
        transitionRecords: [...task.transitionRecords, {
          eventType: '申诉提交',
          description: '合同经办人按检查项提交申诉',
          fromStatus: task.status,
          toStatus: `${task.type}申诉中`,
          operator: '周晨（合同经办人）',
          operatedAt: submittedAt,
          remark: `已提交 ${appealItemKeys.length} 个检查项的申诉说明及佐证材料，等待处理。`,
          relatedBusinessNo: `YDJ-${task.id.slice(-6)}`
        }]
      } : task));
      setSelectedMode('申诉处理');
      message.success('申诉已提交');
      return;
    }
    if (isAppealProcessing) {
      if (!selectedTask) return;
      const appeals = appealsByTask[selectedTask.id] || {};
      const appealKeys = Object.keys(appeals);
      if (appealKeys.some(key => !appealDecisions[key])) {
        message.warning('请完成全部第1轮申诉结果的处理');
        return;
      }
      if (appealKeys.some(key => appealDecisions[key] === '不通过' && !appealOpinions[key]?.trim())) {
        message.warning('申诉不通过时请填写处理意见');
        return;
      }
      const processedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const rejectedAppealKeys = appealKeys.filter(key => appealDecisions[key] === '不通过');
      const hasRejectedAppeal = rejectedAppealKeys.length > 0;
      const nextStatus = hasRejectedAppeal ? `${selectedTask.type}待处置` : `已${selectedTask.type}`;
      setAppealsByTask(current => ({
        ...current,
        [selectedTask.id]: Object.fromEntries(Object.entries(current[selectedTask.id] || {}).map(([key, rounds]) => [key, (rounds as AppealRound[]).map((round, index) => index === 0 ? { ...round, decision: appealDecisions[key], opinion: appealOpinions[key] || '' } : round)]))
      }));
      setTasks(current => current.map(task => task.id === selectedTask.id ? {
        ...task,
        status: nextStatus,
        pendingAction: hasRejectedAppeal ? '不合规项整改' : '查看任务记录',
        issueCount: rejectedAppealKeys.length,
        updateTime: processedAt,
        transitionRecords: [...task.transitionRecords, {
          eventType: '申诉处理',
          description: `已完成第1轮申诉处理，${hasRejectedAppeal ? '存在申诉不通过项，需继续整改' : '全部申诉通过，任务闭环'}`,
          fromStatus: task.status,
          toStatus: nextStatus,
          operator: '局管理员',
          operatedAt: processedAt,
          remark: `已处理 ${appealKeys.length} 个申诉检查项。`,
          relatedBusinessNo: `YDJ-${task.id.slice(-6)}`
        }]
      } : task));
      setSelectedMode('查看');
      message.success('申诉处理结果已提交');
      return;
    }
    message.success(`${actionTitle}已提交`);
  };

  const executionColumns = [
    ...(isAppealing || isAppealProcessing ? [{
      title: '申诉选择', key: 'appeal-select', width: 90,
      render: (_: unknown, record: CheckItem) => {
        const existingAppeal = appealsByTask[selectedTaskId || '']?.[record.key]?.[0];
        if (isAppealProcessing) return existingAppeal ? <Checkbox checked disabled /> : <span>-</span>;
        if (record.result !== '不合规') return <span>-</span>;
        return <Checkbox checked={appealItemKeys.includes(record.key)} onChange={event => setAppealItemKeys(current => event.target.checked ? [...current, record.key] : current.filter(key => key !== record.key))} />;
      }
    }] : []),
    { title: '序号', key: 'index', width: 70, align: 'center' as const, render: (_: unknown, __: CheckItem, index: number) => index + 1 },
    { title: '检查阶段', dataIndex: 'stage', key: 'stage', width: 190 },
    { title: '检查项', dataIndex: 'item', key: 'item', width: 180 },
    { title: '检查方式', dataIndex: 'source', key: 'source', width: 110, render: (source: CheckItem['source']) => <Tag color={source === '系统识别' ? 'blue' : 'default'}>{source}</Tag> },
    { title: '检查标准', dataIndex: 'standard', key: 'standard', width: 310 },
    {
      title: <><span className="task-required-mark">*</span>判定结果</>,
      key: 'result',
      width: 180,
      render: (_: unknown, record: CheckItem) => {
        if (isInspection && record.source === '人工检查') return <Radio.Group value={results[record.key]} onChange={event => setResults(current => ({ ...current, [record.key]: event.target.value }))}><Radio value="合规">合规</Radio><Radio value="不合规">不合规</Radio></Radio.Group>;
        if (isInspection && systemCalculationStatus === 'idle') return <Tag>待计算</Tag>;
        if (isInspection && systemCalculationStatus === 'calculating') return <Tag color="processing">计算中</Tag>;
        const result = isInspection ? systemResults[record.key] : getAppealDecision(record.key) === '通过' ? '合规' : record.result;
        return <Tag color={result === '不合规' ? 'error' : 'success'}>{result}</Tag>;
      }
    },
    {
      title: selectedTask?.type === '自查' ? '自查备注' : `${selectedTask?.type}备注`,
      key: 'remark',
      width: 260,
      render: (_: unknown, record: CheckItem) => isInspection
        ? record.source === '人工检查'
          ? <TextArea value={itemRemarks[record.key]} onChange={event => setItemRemarks(current => ({ ...current, [record.key]: event.target.value }))} rows={2} placeholder="请输入" />
          : <span>{systemCalculationStatus === 'idle' ? '等待系统计算' : systemCalculationStatus === 'calculating' ? '系统正在计算识别结果' : record.remark}</span>
        : <span>{record.remark || '-'}</span>
    },
    {
      title: selectedTask?.type === '自查' ? '自查附件' : `${selectedTask?.type}附件`,
      key: 'attachment',
      width: 180,
      render: (_: unknown, record: CheckItem) => {
        if (isInspection) return <Upload showUploadList={false} beforeUpload={file => { setItemAttachments(current => ({ ...current, [record.key]: file.name })); return false; }}><Button icon={<UploadOutlined />}>{itemAttachments[record.key] || '添加附件'}</Button></Upload>;
        return record.attachment ? <Button type="link" icon={<PaperClipOutlined />}>{record.attachment}</Button> : <span>-</span>;
      }
    },
    ...(isAppealing || isAppealProcessing || hasAppealRecords ? [
      {
        title: '第1轮申诉说明', key: 'appeal-content', width: 280,
        render: (_: unknown, record: CheckItem) => {
          const appeal = appealsByTask[selectedTaskId || '']?.[record.key]?.[0];
          if (isAppealProcessing || !isAppealing) return <span>{appeal?.content || '-'}</span>;
          if (record.result !== '不合规') return <span>-</span>;
          return <TextArea value={appealDrafts[record.key]} onChange={event => setAppealDrafts(current => ({ ...current, [record.key]: event.target.value }))} rows={2} placeholder="请填写第1轮申诉说明" />;
        }
      },
      {
        title: '申诉附件', key: 'appeal-attachment', width: 200,
        render: (_: unknown, record: CheckItem) => {
          const appeal = appealsByTask[selectedTaskId || '']?.[record.key]?.[0];
          if (isAppealProcessing || !isAppealing) return appeal?.attachments.length ? <Space direction="vertical" size={0}>{appeal.attachments.map(file => <Button key={file} type="link" icon={<PaperClipOutlined />}>{file}</Button>)}</Space> : <span>-</span>;
          if (record.result !== '不合规') return <span>-</span>;
          return <Upload showUploadList={false} beforeUpload={file => { setAppealAttachments(current => ({ ...current, [record.key]: file.name })); return false; }}><Button icon={<UploadOutlined />}>{appealAttachments[record.key] || '添加附件'}</Button></Upload>;
        }
      },
      ...(isAppealProcessing || hasAppealRecords ? [
        {
          title: '第1轮申诉结果', key: 'appeal-decision', width: 210,
          render: (_: unknown, record: CheckItem) => {
            const appeal = appealsByTask[selectedTaskId || '']?.[record.key]?.[0];
            if (!appeal) return <span>-</span>;
            if (!isAppealProcessing) return <Tag color={appeal.decision === '通过' ? 'success' : 'error'}>{appeal.decision || '-'}</Tag>;
            return <Radio.Group value={appealDecisions[record.key]} onChange={event => setAppealDecisions(current => ({ ...current, [record.key]: event.target.value }))}><Radio value="通过">通过</Radio><Radio value="不通过">不通过</Radio></Radio.Group>;
          }
        },
        {
          title: '处理意见', key: 'appeal-opinion', width: 280,
          render: (_: unknown, record: CheckItem) => {
            const appeal = appealsByTask[selectedTaskId || '']?.[record.key]?.[0];
            if (!appeal) return <span>-</span>;
            if (!isAppealProcessing) return <span>{appeal.opinion || '-'}</span>;
            return <TextArea value={appealOpinions[record.key]} onChange={event => setAppealOpinions(current => ({ ...current, [record.key]: event.target.value }))} rows={2} placeholder="申诉不通过时请填写处理意见" />;
          }
        }
      ] : [])
    ] : []),
    ...(!isInspection && !isAppealing && !isAppealProcessing ? Array.from({ length: roundCount + (isRectification ? 1 : 0) }, (_, index) => {
      const roundNo = index + 1;
      const isCurrentRectification = isRectification && roundNo === roundCount + 1;
      return [
        {
          title: `第 ${roundNo} 轮整改说明`, key: `rectification-${roundNo}`, width: 260,
          render: (_: unknown, record: CheckItem) => {
            const round = record.rounds[index];
            const needsNextRectification = needsRectification(record);
            if (isCurrentRectification && needsNextRectification) return <TextArea value={rectificationDrafts[record.key]} onChange={event => setRectificationDrafts(current => ({ ...current, [record.key]: event.target.value }))} rows={2} placeholder="请填写本轮整改说明" />;
            return <span>{round?.content || '-'}</span>;
          }
        },
        {
          title: `第 ${roundNo} 轮整改材料`, key: `rectification-attachment-${roundNo}`, width: 180,
          render: (_: unknown, record: CheckItem) => {
            const round = record.rounds[index];
            const needsNextRectification = needsRectification(record);
            if (isCurrentRectification && needsNextRectification) return <Upload showUploadList={false} beforeUpload={file => { setRectificationAttachments(current => ({ ...current, [record.key]: file.name })); return false; }}><Button icon={<UploadOutlined />}>{rectificationAttachments[record.key] || '添加附件'}</Button></Upload>;
            return round?.attachments.length ? <Space direction="vertical" size={0}>{round.attachments.map(file => <Button key={file} type="link" icon={<PaperClipOutlined />}>{file}</Button>)}</Space> : <span>-</span>;
          }
        },
        {
          title: `第 ${roundNo} 轮复核判定结果`, key: `review-${roundNo}`, width: 190,
          render: (_: unknown, record: CheckItem) => {
            const round = record.rounds[index];
            const isCurrentReview = isReview && index === record.rounds.length - 1 && round?.reviewResult === '待复核';
            if (isCurrentReview) return <Radio.Group value={results[record.key]} onChange={event => setResults(current => ({ ...current, [record.key]: event.target.value }))}><Radio value="通过">通过</Radio><Radio value="不通过">不通过</Radio></Radio.Group>;
            if (!round) return <span>-</span>;
            return <Tag color={round.reviewResult === '通过' ? 'success' : round.reviewResult === '不通过' ? 'error' : 'processing'}>{round.reviewResult}</Tag>;
          }
        },
        {
          title: `第 ${roundNo} 轮复核意见`, key: `review-opinion-${roundNo}`, width: 240,
          render: (_: unknown, record: CheckItem) => {
            const round = record.rounds[index];
            const isCurrentReview = isReview && index === record.rounds.length - 1 && round?.reviewResult === '待复核';
            if (isCurrentReview) return <TextArea value={reviewOpinions[record.key]} onChange={event => setReviewOpinions(current => ({ ...current, [record.key]: event.target.value }))} rows={2} placeholder="请填写复核意见" />;
            return <span>{round?.reviewOpinion || '-'}</span>;
          }
        }
      ];
    }).flat() : [])
  ];

  const precedingExecutionColumns = [
    { title: '序号', key: 'index', width: 70, align: 'center' as const, render: (_: unknown, __: CheckItem, index: number) => index + 1 },
    { title: '检查阶段', dataIndex: 'stage', key: 'stage', width: 190 },
    { title: '检查项', dataIndex: 'item', key: 'item', width: 180 },
    { title: '检查方式', dataIndex: 'source', key: 'source', width: 110, render: (source: CheckItem['source']) => <Tag color={source === '系统识别' ? 'blue' : 'default'}>{source}</Tag> },
    { title: '检查标准', dataIndex: 'standard', key: 'standard', width: 310 },
    { title: '判定结果', dataIndex: 'result', key: 'result', width: 130, render: (result: string) => <Tag color={result === '不合规' ? 'error' : 'success'}>{result}</Tag> },
    { title: '检查备注', dataIndex: 'remark', key: 'remark', width: 280, render: (remark: string) => <span>{remark || '-'}</span> },
    { title: '检查附件', dataIndex: 'attachment', key: 'attachment', width: 180, render: (attachment: string) => attachment ? <Button type="link" icon={<PaperClipOutlined />}>{attachment}</Button> : <span>-</span> }
  ];

  const completedBidCheckColumns = [
    ...precedingExecutionColumns,
    { title: '检查人', dataIndex: 'checker', key: 'checker', width: 160 },
    { title: '检查时间', dataIndex: 'checkedAt', key: 'checkedAt', width: 180 }
  ];

  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 70,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    ...(currentType === '稽查' ? [
      {
        title: '自查互查结论',
        dataIndex: 'selfMutualConclusionInconsistent',
        key: 'selfMutualConclusionInconsistent',
        width: 150,
        render: (inconsistent: boolean) => <Tag color={inconsistent ? 'error' : 'success'}>{inconsistent ? '不一致' : '一致'}</Tag>
      },
      {
        title: '督办标识',
        dataIndex: 'isAuditPrioritySupervision',
        key: 'isAuditPrioritySupervision',
        width: 180,
        render: (isPriority: boolean) => isPriority
          ? <Space size={4}><PushpinFilled style={{ color: '#fa8c16' }} /><Tag color="orange">稽查优先督办项</Tag></Space>
          : <span>-</span>
      }
    ] : []),
    {
      title: '任务编号',
      dataIndex: 'id',
      key: 'id',
      width: 180,
    },
    {
      title: '任务类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        let color = 'blue';
        if (type === '互查') color = 'orange';
        if (type === '稽查') color = 'purple';
        return <Tag color={color}>{type}</Tag>;
      }
    },
    {
      title: '招标/采购编号',
      dataIndex: 'bidNo',
      key: 'bidNo',
      width: 220,
    },
    {
      title: '招标/采购名称',
      dataIndex: 'bidName',
      key: 'bidName',
      width: 250,
      ellipsis: true,
    },
    {
      title: '合同名称',
      dataIndex: 'contractName',
      key: 'contractName',
      width: 250,
      ellipsis: true,
    },
    {
      title: '合同编号',
      dataIndex: 'contractNo',
      key: 'contractNo',
      width: 150,
    },
    {
      title: '评审完成时间',
      dataIndex: 'reviewCompleteTime',
      key: 'reviewCompleteTime',
      width: 180,
    },
    {
      title: '当前状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        let color = 'default';
        if (status.endsWith('待处理') || status.endsWith('中')) color = 'processing';
        if (status.includes('待处置') || status.includes('复核不通过')) color = 'warning';
        if (status.includes('申诉') || status.includes('回退')) color = 'error';
        if (['已自查', '已互查', '已稽查'].includes(status)) color = 'success';
        return <Badge status={color as any} text={status} />;
      }
    },
    {
      title: '判定结果',
      key: 'decisionResult',
      width: 110,
      render: (_: unknown, record: typeof allMockTasks[number]) => {
        const result = getTaskDecisionResult(record);
        return result === '-' ? <span>-</span> : <Tag color={result === '合规' ? 'success' : 'error'}>{result}</Tag>;
      }
    },
    {
      title: '整改结果',
      key: 'rectificationResult',
      width: 110,
      render: (_: unknown, record: typeof allMockTasks[number]) => {
        const result = getTaskRectificationResult(record);
        return result === '-' ? <span>-</span> : <Tag color={result === '已整改' ? 'success' : 'warning'}>{result}</Tag>;
      }
    },
    {
      title: '待本人处理事项',
      dataIndex: 'pendingAction',
      key: 'pendingAction',
      width: 150,
    },
    {
      title: '问题统计',
      dataIndex: 'issueCount',
      key: 'issueCount',
      width: 100,
      render: (count: number) => (
        <span style={{ color: count > 0 ? '#ff4d4f' : 'inherit', fontWeight: count > 0 ? 600 : 400 }}>
          {count} 个不合规项
        </span>
      )
    },
    {
      title: '检查剩余时限',
      key: 'timeLeft',
      width: 180,
      render: (_: any, record: any) => (
        <Space>
          <ClockCircleOutlined style={{ color: record.isNearDeadline ? '#fa8c16' : '#8c8c8c' }} />
          <span style={{ color: record.isNearDeadline ? '#d46b08' : 'inherit' }}>
            {record.timeLeft}
            {record.isNearDeadline && <Tag color="orange" style={{ marginLeft: 8 }}>临近超时</Tag>}
          </span>
        </Space>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="link" size="small" onClick={() => handleTaskAction(record)}>{getTaskAction(record.status)}</Button>
        </Space>
      ),
    },
  ];

  const tabItems = [
    { key: 'self', label: '自查任务' },
    { key: 'mutual', label: '互查任务' },
    { key: 'audit', label: '稽查任务' },
  ];

  return (
    <ConfigProvider locale={zhCN}>
      <CentralizedProcurementLayout activeMenuKey="my-tasks">
        <div className="my-tasks-page">
          {selectedTask ? <>
            <Breadcrumb items={[{ title: '首页' }, { title: '招标采购' }, { title: '一单一检' }, { title: '我的任务' }, { title: '任务详情' }]} />
            <TopActionBar
              title={<Space size={16}><Button icon={<ArrowLeftOutlined />} onClick={() => setSelectedTaskId(null)}>返回任务列表</Button><div><div className="task-execution-title">{actionTitle}</div><div className="task-execution-subtitle">任务编号：{selectedTask.id}</div></div><Tag color={selectedTask.status.includes('处置') || selectedTask.status.includes('不通过') ? 'warning' : 'processing'}>{selectedTask.status}</Tag></Space>}
              actions={(isInspection || isRectification || isReview || isAppealing || isAppealProcessing) && <Space>{isRectification && <Button type="default" disabled={!canAppeal} onClick={() => setSelectedMode('申诉')}>申诉</Button>}{isAppealing && <Button onClick={() => setSelectedMode('整改')}>退出申诉</Button>}{isInspection && <Button onClick={() => message.success('回退申请已提交')}>申请回退</Button>}<Button icon={<SaveOutlined />} onClick={() => message.success('草稿已保存')}>保存草稿</Button><Button type="primary" icon={<CheckCircleOutlined />} onClick={handleSubmit}>{isInspection ? '提交检查' : isRectification ? '提交整改' : isAppealing ? '提交申诉' : isAppealProcessing ? '提交处理结果' : '提交复核'}</Button></Space>}
            />
            <Card className="task-execution-card" title="任务信息">
              <Descriptions column={3} size="small">
                <Descriptions.Item label="检查类型">{selectedTask.type}</Descriptions.Item>
                <Descriptions.Item label="招标/采购名称">{selectedTask.bidName}</Descriptions.Item>
                <Descriptions.Item label="合同编号">{selectedTask.contractNo}</Descriptions.Item>
                <Descriptions.Item label="合同名称" span={2}>{selectedTask.contractName}</Descriptions.Item>
                <Descriptions.Item label="当前办理事项">{actionTitle}</Descriptions.Item>
                <Descriptions.Item label="检查人信息">{selectedTask.inspector}</Descriptions.Item>
                <Descriptions.Item label="检查完成时间">{selectedTask.checkCompletedAt}</Descriptions.Item>
                {selectedTask.issueCount > 0 && <Descriptions.Item label="申诉倒计时"><span style={{ color: appealRemainingSeconds > 0 ? '#d46b08' : '#ff4d4f', fontWeight: 600 }}>{appealRemainingSeconds > 0 ? appealCountdown : '已超过3天，不可申诉'}</span></Descriptions.Item>}
              </Descriptions>
            </Card>
            <Card className="task-execution-card" title={isInspection ? '检查执行' : isAppealing || isAppealProcessing ? '申诉相关信息' : '检查项处置明细'}>
              {usesCompletedBidChecks && <Alert className="task-execution-alert" type="info" showIcon message="当前合同与已检查合同属于同一招标，招标阶段检查项已复用首位检查人的检查结果；请仅完成下方合同阶段检查项。" />}
              {isInspection && systemCheckItems.length > 0 && <Alert className="task-execution-alert" type="info" showIcon message="系统识别项需统一计算，计算完成后自动展示识别结果；人工检查项由检查人判定。" action={<Button type="primary" loading={systemCalculationStatus === 'calculating'} disabled={systemCalculationStatus === 'completed'} onClick={handleSystemCalculation}>{systemCalculationStatus === 'completed' ? '系统识别已完成' : '计算系统识别项'}</Button>} />}
              {isRectification && <Alert className="task-execution-alert" type="warning" showIcon message={canAppeal ? `请仅对当前允许处置的不合规检查项提交整改；如需申诉，请在检查完成后3天内提交，剩余 ${appealCountdown}。` : '请仅对当前允许处置的不合规检查项提交整改；申诉时限已超过3天，无法申诉。'} />}
              {isReview && <Alert className="task-execution-alert" type="info" showIcon message="请逐项复核整改材料；复核不通过时应填写明确的复核意见。" />}
              {isAppealing && <Alert className="task-execution-alert" type="warning" showIcon message="请选择需要申诉的不合规检查项；第1轮申诉说明和申诉附件均可按需填写或上传。" />}
              {isAppealProcessing && <Alert className="task-execution-alert" type="info" showIcon message="请对已提交申诉的检查项逐项选择第1轮申诉结果；申诉不通过时必须填写处理意见。" />}
              <Descriptions size="small" column={1} style={{ marginBottom: 16 }}>
                <Descriptions.Item label="判定结果">
                  <Tag color={detailDecisionResult === '待判定' ? 'processing' : detailDecisionResult === '合规' ? 'success' : 'error'}>{detailDecisionResult}</Tag>
                </Descriptions.Item>
              </Descriptions>
              {usesCompletedBidChecks && <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Card type="inner" title="招标阶段检查项（已完成）">
                  <Table columns={completedBidCheckColumns} dataSource={completedBidCheckItems} rowKey="key" pagination={false} scroll={{ x: 1650 }} />
                </Card>
                <Card type="inner" title="合同阶段检查项">
                  <Table columns={executionColumns} dataSource={currentCheckItems} rowKey="key" pagination={false} scroll={{ x: 2250 }} />
                </Card>
              </Space>}
              {!usesCompletedBidChecks && isInspection && selectedTask.type === '稽查' ? <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Card type="inner" title="自查检查数据">
                  <Table columns={precedingExecutionColumns} dataSource={precedingCheckItems.自查} rowKey="key" pagination={false} scroll={{ x: 1450 }} />
                </Card>
                <Card type="inner" title="互查检查数据">
                  <Table columns={precedingExecutionColumns} dataSource={precedingCheckItems.互查} rowKey="key" pagination={false} scroll={{ x: 1450 }} />
                </Card>
                <Card type="inner" title="稽查检查数据">
                  <Table columns={executionColumns} dataSource={checkItems} rowKey="key" pagination={false} scroll={{ x: 2250 }} />
                </Card>
              </Space> : !usesCompletedBidChecks && <Table columns={executionColumns} dataSource={checkItems} rowKey="key" pagination={false} scroll={{ x: 2250 }} />}
            </Card>
            <Card className="task-execution-card" title="任务流转记录">
              <Timeline items={[...selectedTask.transitionRecords].reverse().map(record => ({
                color: record.toStatus === selectedTask.status ? 'orange' : record.toStatus.startsWith('已') ? 'green' : 'blue',
                content: <><div className="timeline-title">{record.eventType}：{record.description}</div><div className="timeline-detail">{record.operator} · {record.operatedAt} · {record.fromStatus} → {record.toStatus}</div><div className="timeline-detail">处理意见：{record.remark} · 关联单号：{record.relatedBusinessNo}</div></>
              }))} />
            </Card>
          </> : <>
            <div className="page-header">
              <Breadcrumb items={[
                { title: '首页' },
                { title: '招标采购' },
                { title: '一单一检' },
                { title: '我的任务' },
              ]} />
            </div>

            <div className="list-card" style={{ background: '#fff', padding: 24, borderRadius: 4, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)' }}>
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab} 
              items={tabItems.map(tab => ({
                ...tab,
                children: (
                  <div className="tab-content-wrapper">
                    <div className="search-filters" style={{ marginBottom: 16, padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <Space wrap size={[16, 16]}>
                        <div className="filter-item">
                          <span className="filter-label">任务搜索：</span>
                          <Input 
                            placeholder="搜索任务编号" 
                            prefix={<SearchOutlined />} 
                            style={{ width: 200 }} 
                            value={currentSearchState.id}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSearchState(activeTab, 'id', e.target.value)}
                          />
                        </div>
                        {activeTab === 'audit' && <div className="filter-item">
                          <span className="filter-label">自查互查结论：</span>
                          <Select
                            placeholder="全部"
                            style={{ width: 160 }}
                            allowClear
                            value={currentSearchState.selfMutualConclusionInconsistent}
                            onChange={(val: boolean | undefined) => {
                              updateSearchState(activeTab, 'selfMutualConclusionInconsistent', val);
                              setFilterValues(prev => ({
                                ...prev,
                                audit: {
                                  ...prev.audit,
                                  selfMutualConclusionInconsistent: val
                                }
                              }));
                            }}
                            options={[{ value: true, label: '不一致' }, { value: false, label: '一致' }]}
                          />
                        </div>}
                        <div className="filter-item">
                          <span className="filter-label">招标/采购编号：</span>
                          <Input 
                            placeholder="请输入编号" 
                            style={{ width: 200 }} 
                            value={currentSearchState.bidNo}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSearchState(activeTab, 'bidNo', e.target.value)}
                          />
                        </div>
                        <div className="filter-item">
                          <span className="filter-label">招标/采购名称：</span>
                          <Input 
                            placeholder="请输入名称" 
                            style={{ width: 200 }} 
                            value={currentSearchState.bidName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSearchState(activeTab, 'bidName', e.target.value)}
                          />
                        </div>
                        <div className="filter-item">
                          <span className="filter-label">合同名称：</span>
                          <Input 
                            placeholder="请输入合同名称" 
                            style={{ width: 200 }} 
                            value={currentSearchState.contractName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSearchState(activeTab, 'contractName', e.target.value)}
                          />
                        </div>
                        <div className="filter-item">
                          <span className="filter-label">合同编号：</span>
                          <Input 
                            placeholder="请输入合同编号" 
                            style={{ width: 200 }} 
                            value={currentSearchState.contractNo}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSearchState(activeTab, 'contractNo', e.target.value)}
                          />
                        </div>
                        <div className="filter-item">
                          <span className="filter-label">任务状态：</span>
                          <Select 
                            placeholder="全部状态" 
                            style={{ width: 160 }} 
                            allowClear
                            value={currentSearchState.status}
                            onChange={(val: string | undefined) => updateSearchState(activeTab, 'status', val)}
                            options={taskStatusesByType[currentType].map(status => ({ value: status, label: status }))}
                          />
                        </div>
                        <div className="filter-item">
                          <span className="filter-label">更新时间：</span>
                          <RangePicker 
                            style={{ width: 260 }} 
                            value={currentSearchState.dateRange}
                            onChange={(val: any) => updateSearchState(activeTab, 'dateRange', val)}
                            placeholder={['开始日期', '结束日期']}
                          />
                        </div>
                        <div className="filter-actions">
                          <Space>
                            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
                            <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
                          </Space>
                        </div>
                      </Space>
                    </div>
                    <Tabs
                      activeKey={currentStatusTab}
                      onChange={(key) => setActiveStatusTabs(prev => ({ ...prev, [activeTab]: key }))}
                      items={(Object.keys(statusTabLabels) as Array<keyof typeof statusTabLabels>).map(key => ({
                        key,
                        label: `${statusTabLabels[key]} (${key === 'all' ? tasks.filter(task => task.type === currentType).length : tasks.filter(task => task.type === currentType && getStatusTabStatuses(currentType, key).includes(task.status)).length})`
                      }))}
                    />
                    <Table 
                      columns={columns} 
                      dataSource={filteredTasks}
                      rowKey="id"
                      scroll={{ x: 2070 }}
                      pagination={{
                        total: filteredTasks.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total: number) => `共 ${total} 条记录`,
                      }}
                    />
                  </div>
                )
              }))}
              className="task-tabs"
            />
            </div>
          </>}
        </div>
      </CentralizedProcurementLayout>
    </ConfigProvider>
  );
};

export default MyTasks;
