/**
 * @name 开启人设置
 * @description 集采工作台 - 采购响应阶段「开启人设置」页面：复用通用布局（菜单+顶部导航）与步骤条组件，还原开启人设置卡片，并支持「智能推荐」为开启方式与开启人员自动推荐。
 *
 * 参考资料：
 * - 用户提供的页面截图
 * - /src/docs/ai-recommendation-pattern.md
 * - /src/prototypes/procurement-list-copy2-copy5/index.tsx
 */

import React, { useState } from 'react';
import { ConfigProvider, Select, Table } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import type { ColumnsType } from 'antd/es/table';
import { AlertCircle, ChevronUp, Loader2, Lock, RefreshCcw, Sparkles, X } from 'lucide-react';

import aiTag from '../../../assets/picture/image copy.png';
import CentralizedProcurementLayout from '../../components/centralized-procurement-layout';
import StepBar from '../../components/step-bar';
import './style.css';

/* ================= 步骤条数据 ================= */

const SUB_STEPS = [
  '设置报价格式',
  '开启人设置',
  '编制采购文件',
  '保证金设置',
  '发布采购文件',
  '查看报价情况'
];

/* ================= 采购信息 ================= */

const PROCUREMENT_INFO = [
  { label: '采购编号', value: 'cscec202610130000021437', link: true },
  { label: '组织机构', value: '中国建筑股份有限公司' },
  { label: '采购方式', value: '询比采购' },
  { label: '项目', value: '测试项目71704', link: true },
  { label: '品类', value: '物资-钢材' },
  { label: '经办人', value: 'admin11' }
];

/* ================= 开启人表格 ================= */

interface OpenerRow {
  key: string;
  opener: string;
  account: string;
  phone: string;
  org: string;
  encrypted: string;
}

/* 智能推荐结果 */
const RECOMMEND_OPEN_METHOD = '密码+密钥';
const RECOMMEND_OPENERS: OpenerRow[] = [
  {
    key: '1',
    opener: 'admin11',
    account: 'jcadmin',
    phone: '18215655467',
    org: '中国建筑股份有限公司',
    encrypted: '否'
  },
  {
    key: '2',
    opener: 'admin12',
    account: 'jcadmin2',
    phone: '13800001111',
    org: '中国建筑股份有限公司',
    encrypted: '否'
  },
  {
    key: '3',
    opener: 'admin13',
    account: 'jcadmin3',
    phone: '13900002222',
    org: '中国建筑股份有限公司',
    encrypted: '是'
  }
];

/* 智能推荐字段配置 */
const AI_FIELDS = [
  { id: 'openMethod', label: '开启方式' },
  { id: 'openers', label: '开启人员' }
];

const Component: React.FC = () => {
  const [openMethod, setOpenMethod] = useState<string | undefined>(undefined);

  const [openers, setOpeners] = useState<OpenerRow[]>([]);

  /* ================= 智能推荐状态 ================= */
  const [isAIRecommending, setIsAIRecommending] = useState(false);
  const [currentHighlightField, setCurrentHighlightField] = useState<string | null>(null);
  const [aiRecommendationProgress, setAiRecommendationProgress] = useState(0);
  const [showAIBubble, setShowAIBubble] = useState(false);
  const [aiBubblePosition, setAiBubblePosition] = useState({ x: 0, y: 0 });
  const [aiRecommendedFields, setAiRecommendedFields] = useState<{ [key: string]: boolean }>({});
  /* 被智能推荐出来的开启人行（用于在行上显示 AI 标识） */
  const [aiRecommendedOpenerKeys, setAiRecommendedOpenerKeys] = useState<string[]>([]);
  const [isCurrentFieldSkipped, setIsCurrentFieldSkipped] = useState(false);
  const [skippedFieldsCount, setSkippedFieldsCount] = useState(0);
  const [showAIConfirmPopover, setShowAIConfirmPopover] = useState(false);

  /* 计算 AI 小人位置，避免被屏幕边缘遮挡 */
  const calculateAIBubblePosition = (fieldElement: HTMLElement) => {
    const rect = fieldElement.getBoundingClientRect();
    const bubbleWidth = 240;
    const bubbleHeight = 100;
    const padding = 20;

    let x = rect.right + padding;
    let y = rect.top;

    if (x + bubbleWidth > window.innerWidth) {
      x = rect.left - bubbleWidth - padding;
    }
    if (y + bubbleHeight > window.innerHeight) {
      y = window.innerHeight - bubbleHeight - padding;
    }
    if (x < padding) {
      x = padding;
    }
    if (y < padding) {
      y = padding;
    }

    return { x, y };
  };

  const handleAIRecommendClick = () => {
    setShowAIConfirmPopover(true);
  };

  const handleCancelAIRecommend = () => {
    setShowAIConfirmPopover(false);
  };

  const handleConfirmAIRecommend = () => {
    setShowAIConfirmPopover(false);
    setIsAIRecommending(true);
    setShowAIBubble(true);
    setAiRecommendationProgress(0);
    setIsCurrentFieldSkipped(false);
    setSkippedFieldsCount(0);
    setAiRecommendedFields({});
    setAiRecommendedOpenerKeys([]);

    const firstField = document.getElementById('field-openMethod');
    if (firstField) {
      setAiBubblePosition(calculateAIBubblePosition(firstField));
    }

    let currentIndex = 0;
    let skipped = 0;

    const interval = setInterval(() => {
      if (currentIndex >= AI_FIELDS.length) {
        clearInterval(interval);
        setIsAIRecommending(false);
        setCurrentHighlightField(null);
        setIsCurrentFieldSkipped(false);
        setSkippedFieldsCount(skipped);
        return;
      }

      const field = AI_FIELDS[currentIndex];
      setCurrentHighlightField(field.id);

      // 已填写（非本次推荐）的字段跳过
      let isSkipped = false;

      if (field.id === 'openMethod') {
        if (openMethod && openMethod.trim() !== '') {
          isSkipped = true;
        } else {
          setOpenMethod(RECOMMEND_OPEN_METHOD);
        }
      }

      if (field.id === 'openers') {
        if (openers.length > 0) {
          isSkipped = true;
        } else {
          setOpeners(RECOMMEND_OPENERS);
          setAiRecommendedOpenerKeys(RECOMMEND_OPENERS.map((row) => row.key));
        }
      }

      setIsCurrentFieldSkipped(isSkipped);
      if (isSkipped) {
        skipped += 1;
      }

      const fieldElement = document.getElementById(`field-${field.id}`);
      if (fieldElement) {
        setAiBubblePosition(calculateAIBubblePosition(fieldElement));
      }

      if (!isSkipped) {
        setAiRecommendedFields((prev) => ({ ...prev, [field.id]: true }));
      }

      setAiRecommendationProgress(((currentIndex + 1) / AI_FIELDS.length) * 100);
      currentIndex++;
    }, 1500);
  };

  const handleCloseAIBubble = () => {
    setShowAIBubble(false);
  };

  /* 用户手动修改字段后，移除该字段的 AI 标识 */
  const clearAIRecommendedField = (fieldId: string) => {
    if (aiRecommendedFields[fieldId]) {
      setAiRecommendedFields((prev) => ({ ...prev, [fieldId]: false }));
    }
  };

  const handleDelete = (key: string) => {
    setOpeners((prev) => prev.filter((item) => item.key !== key));
    setAiRecommendedOpenerKeys((prev) => prev.filter((k) => k !== key));
  };

  const openerColumns: ColumnsType<OpenerRow> = [
    {
      title: '开启人',
      dataIndex: 'opener',
      render: (text: string, record: OpenerRow) => (
        <span className="inline-flex items-center gap-1">
          {text}
          {/* AI 推荐标识：打在推荐出来的行上 */}
          {aiRecommendedOpenerKeys.includes(record.key) && (
            <img src={aiTag} alt="AI推荐" className="h-4 w-auto inline-block" />
          )}
        </span>
      )
    },
    { title: '账号', dataIndex: 'account' },
    { title: '开启人电话', dataIndex: 'phone' },
    { title: '所属组织', dataIndex: 'org' },
    { title: '是否已加密', dataIndex: 'encrypted' },
    {
      title: '操作',
      width: 140,
      render: (_: unknown, record: OpenerRow) => (
        <span className="opener-delete" onClick={() => handleDelete(record.key)}>
          删除
        </span>
      )
    }
  ];

  return (
    <ConfigProvider locale={zhCN}>
      <CentralizedProcurementLayout
        username="admin11"
        activeMenuKey="procurement-list"
        defaultOpenGroupKeys={['bidding-procurement']}
      >
        {/* 面包屑 */}
        <div className="opener-breadcrumb">
          <span>采购列表</span>
          <span className="sep">&gt;</span>
          <span className="current">开启人设置</span>
        </div>

        {/* 标题与操作 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-sm mr-2">物资</span>
            <h1 className="text-lg font-bold text-gray-800">测试协作人</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm hover:bg-gray-50">
              上一步
            </button>
            <button className="bg-primary text-white px-4 py-1.5 rounded text-sm hover:bg-primary-dark shadow-sm">
              保存
            </button>
            <button className="bg-primary text-white px-4 py-1.5 rounded text-sm hover:bg-primary-dark shadow-sm">
              下一步
            </button>
          </div>
        </div>

        {/* 采购信息卡片 */}
        <div className="bg-white rounded-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center mb-4 text-sm">
            <span className="text-gray-600 mr-2">距废除截止还剩：</span>
            <div className="flex items-center space-x-1">
              <span className="countdown-box">9998</span>
              <span className="text-gray-600 text-xs">天</span>
              <span className="countdown-box">01</span>
              <span className="text-gray-500">:</span>
              <span className="countdown-box">07</span>
              <span className="text-gray-500">:</span>
              <span className="countdown-box">01</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-y-3 text-xs text-gray-600">
            {PROCUREMENT_INFO.map((item) => (
              <div key={item.label}>
                {item.label}：
                <span className={item.link ? 'text-primary cursor-pointer hover:underline' : ''}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 步骤条 */}
        <StepBar
          currentMainStep="采购响应"
          subSteps={SUB_STEPS}
          currentSubStep="开启人设置"
          completedSubSteps={[0]}
        />

        {/* 开启人设置 */}
        <div className="bg-white rounded-sm border border-gray-200 mb-4">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-1 h-4 bg-primary mr-2"></div>
              <h2 className="font-bold text-gray-800 text-sm">开启人设置</h2>
            </div>
            <div className="flex items-center space-x-2 relative">
              <button
                onClick={handleAIRecommendClick}
                disabled={isAIRecommending}
                className={`smart-recommend-btn ${isAIRecommending ? 'is-loading' : ''}`}
              >
                {isAIRecommending ? (
                  <>
                    <Loader2 className="w-[14px] h-[14px] animate-spin" />
                    <span>智能推荐中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-[14px] h-[14px]" />
                    <span>智能推荐</span>
                    <RefreshCcw className="w-[13px] h-[13px] opacity-90" />
                  </>
                )}
              </button>

              {/* 智能推荐二次确认弹窗 */}
              {showAIConfirmPopover && (
                <div className="absolute top-full right-0 mt-2 z-50">
                  <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-64">
                    <div className="flex items-center mb-3">
                      <AlertCircle className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />
                      <span className="font-medium text-gray-800 text-sm">提示</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">是否确认使用智能推荐？</p>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={handleCancelAIRecommend}
                        className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleConfirmAIRecommend}
                        className="px-3 py-1.5 text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded hover:from-purple-600 hover:to-blue-600 transition-all"
                      >
                        确认
                      </button>
                    </div>
                  </div>
                  <div className="absolute -top-1 right-20 w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                </div>
              )}

              <button className="bg-white border border-gray-300 text-gray-700 text-xs px-3 py-1.5 rounded hover:bg-gray-50">
                添加开启人员
              </button>
              <ChevronUp className="w-5 h-5 text-gray-400 cursor-pointer" />
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div
                id="field-openMethod"
                className={`flex items-center p-2 rounded-lg transition-all duration-500 ${
                  currentHighlightField === 'openMethod'
                    ? 'bg-yellow-100 ring-2 ring-yellow-400 shadow-lg scale-[1.02]'
                    : ''
                }`}
              >
                <span className="text-red-500 mr-1">*</span>
                <span className="text-gray-700 text-sm mr-3">开启方式：</span>
                <div className="relative">
                  <Select
                    value={openMethod}
                    onChange={(val) => {
                      setOpenMethod(val);
                      clearAIRecommendedField('openMethod');
                    }}
                    placeholder="请选择开启方式"
                    style={{ width: 180 }}
                    prefix={<Lock className="w-[14px] h-[14px] text-gray-400" />}
                    options={[
                      { label: '密码+密钥', value: '密码+密钥' },
                      { label: '密码', value: '密码' },
                      { label: '密钥', value: '密钥' }
                    ]}
                  />
                  {/* AI 推荐标识 */}
                  {aiRecommendedFields['openMethod'] && (
                    <img src={aiTag} alt="AI推荐" className="h-4 inline-block absolute -top-1 -right-0.5" />
                  )}
                </div>
              </div>
              <span className="opener-hint">按管理办法要求，开启人员数量至少为1位</span>
            </div>

            <div
              id="field-openers"
              className={`relative p-2 rounded-lg transition-all duration-500 ${
                currentHighlightField === 'openers'
                  ? 'bg-yellow-100 ring-2 ring-yellow-400 shadow-lg scale-[1.02]'
                  : ''
              }`}
            >
              <Table
                rowKey="key"
                size="middle"
                pagination={false}
                dataSource={openers}
                columns={openerColumns}
              />
            </div>
          </div>
        </div>
      </CentralizedProcurementLayout>

      {/* AI 智能推荐 - 漫游式引导遮罩层 */}
      {isAIRecommending && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 bg-black/20 transition-opacity duration-500"></div>
        </div>
      )}

      {/* AI 小人形象和气泡提示 */}
      {showAIBubble && (
        <div
          className="fixed z-50 transition-all duration-500 ease-in-out"
          style={{
            left: `${aiBubblePosition.x}px`,
            top: `${aiBubblePosition.y}px`
          }}
        >
          <div className="flex items-start gap-3">
            {/* AI 小人形象 */}
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 via-blue-400 to-cyan-400 p-0.5 shadow-lg animate-bounce">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <img
                    src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cute%20AI%20robot%20mascot%20avatar%20friendly%20smiling%20blue%20purple%20gradient&image_size=square"
                    alt="AI小云"
                    className="w-12 h-12 object-cover"
                  />
                </div>
              </div>
              {/* 进度条 */}
              {isAIRecommending && (
                <div className="mt-2 w-14 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${aiRecommendationProgress}%` }}
                  ></div>
                </div>
              )}
            </div>

            {/* 气泡提示 */}
            <div className="relative">
              <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-xl border border-purple-100 max-w-[220px]">
                {!isAIRecommending && (
                  <button
                    onClick={handleCloseAIBubble}
                    className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-semibold text-purple-600">AI智能推荐</span>
                </div>
                <p className="text-sm text-gray-700">
                  {isAIRecommending
                    ? '小云正在帮您生成中...'
                    : `小云已为您推荐 ${AI_FIELDS.length - skippedFieldsCount} 个字段，跳过 ${skippedFieldsCount} 个已填写字段`}
                </p>
                {currentHighlightField && isAIRecommending && (
                  <p className="text-xs text-gray-500 mt-1">
                    {isCurrentFieldSkipped
                      ? `正在填充：${AI_FIELDS.find((f) => f.id === currentHighlightField)?.label}，检测到已填写，跳过`
                      : `正在填充：${AI_FIELDS.find((f) => f.id === currentHighlightField)?.label}`}
                  </p>
                )}
              </div>
              {/* 气泡小三角 */}
              <div className="absolute left-[-6px] top-4 w-3 h-3 bg-white border-l border-b border-purple-100 transform rotate-45"></div>
            </div>
          </div>
        </div>
      )}
    </ConfigProvider>
  );
};

export default Component;
