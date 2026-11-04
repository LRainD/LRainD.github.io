/**
 * @name 投标文件组成评审 第三版
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /rules/design-guide.md
 */
import React, { useRef, useState } from 'react';
import { Checkbox, Tour } from 'antd';
import { 
  ChevronDown, HelpCircle, 
  ChevronUp, Plus, 
  X, Pencil, FileText,
  AlertCircle, Info, CheckCircle
} from 'lucide-react';
import BiddingLayout from '../../components/bidding-layout';
import { AttachmentAssistantModal, RecommendationFile } from './attachment-assistant-modal';
import './style.css';

interface AttachmentFile {
  id: number;
  name: string;
  type: string;
  signingStatus?: 'signing' | 'signed' | 'failed';
  isRecommended?: boolean;
}

interface AttachmentGroup {
  id: string;
  title: string;
  subtitle?: string;
  files: AttachmentFile[];
  recommendedInfo?: string;
}

type SealMethod = 'esign' | 'scan';

/** 一键导入的智能推荐结果：仅对当前为空的文件组成推荐 */
const recommendationMap: Record<string, RecommendationFile[]> = {
  'financial-credit': [
    {
      id: 201,
      fileName: '2023年度财务审计报告.pdf',
      type: 'pdf',
      size: '15.8MB',
      reason: '文件名称包含“财务审计报告”，且年份与本次投标要求匹配'
    }
  ],
  'technical-bid': [
    {
      id: 202,
      fileName: '技术方案响应书_v1.0.pdf',
      type: 'pdf',
      size: '6.2MB',
      reason: '文件库标签标记为“技术标”，与当前文件组成关键词匹配'
    }
  ],
  'business-bid': [
    {
      id: 203,
      fileName: '商务偏差表_盖章版.pdf',
      type: 'pdf',
      size: '2.8MB',
      reason: '文件名称包含“商务偏差表”，属于商务标必备附件'
    }
  ],
  other: [
    {
      id: 204,
      fileName: '企业资质汇编.pdf',
      type: 'pdf',
      size: '12.4MB',
      reason: '文件库标签标记为“企业资质”，可补充到其他附件'
    }
  ]
};

const Component = () => {
  const [activeTab, setActiveTab] = useState('投标文件');
  const [expandedSections, setExpandedSections] = useState({
    purchaseList: true,
    businessTerms: true,
    technicalTerms: true,
    biddingInstructions: true,
    attachments: true
  });

  const [sealMethod, setSealMethod] = useState<SealMethod>('esign');
  const [isEsignConfirmOpen, setIsEsignConfirmOpen] = useState(false);
  const [isSuccessToastOpen, setIsSuccessToastOpen] = useState(false);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);

  // 文件助手弹窗：一键导入与添加附件共用同一个弹窗
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantMode, setAssistantMode] = useState<'import' | 'add'>('import');

  // 一键导入相关状态
  const [hasImported, setHasImported] = useState(false);
  const [isImportGuideOpen, setIsImportGuideOpen] = useState(false);
  const [dontRemindAgain, setDontRemindAgain] = useState(false);
  const [importSummary, setImportSummary] = useState('');
  const importButtonRef = useRef<HTMLButtonElement>(null);

  // 切换到电子签章、未导入且未勾选“不再提示”时展示引导
  React.useEffect(() => {
    if (sealMethod === 'esign' && !dontRemindAgain && !hasImported) {
      setIsImportGuideOpen(true);
    }
  }, [sealMethod]);

  // 独立存储两种方式的附件
  const [esignGroups, setEsignGroups] = useState<AttachmentGroup[]>([
    {
      id: 'business-license',
      title: '营业执照',
      files: [
        { id: 1, name: '北京明源建筑工程加固有限公司_二轮报价.pdf', type: 'pdf' },
        { id: 2, name: '北京明源建筑工程加固有限公司_杭政储出.pdf', type: 'pdf' }
      ]
    },
    { id: 'financial-credit', title: '财务会计信用等级', files: [] },
    {
      id: 'aaa',
      title: 'aaa',
      subtitle: '模板下载',
      files: [
        { id: 3, name: '第九赛道通过初审入围决赛工作通知(1)(OC.doc', type: 'doc' }
      ]
    },
    { id: 'technical-bid', title: '技术标', files: [] },
    { id: 'business-bid', title: '商务标', files: [] },
    { id: 'other', title: '其他附件', files: [] }
  ]);

  const [scanGroups, setScanGroups] = useState<AttachmentGroup[]>([
    { id: 'business-license', title: '营业执照', files: [] },
    { id: 'financial-credit', title: '财务会计信用等级', files: [] },
    { id: 'aaa', title: 'aaa', subtitle: '模板下载', files: [] },
    { id: 'technical-bid', title: '技术标', files: [] },
    { id: 'business-bid', title: '商务标', files: [] },
    { id: 'other', title: '其他附件', files: [] }
  ]);

  const currentGroups = sealMethod === 'esign' ? esignGroups : scanGroups;
  const setCurrentGroups = sealMethod === 'esign' ? setEsignGroups : setScanGroups;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      // @ts-ignore
      [section]: !prev[section]
    }));
  };

  const handleRemoveFile = (groupId: string, fileId: number) => {
    setCurrentGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          files: group.files.filter(f => f.id !== fileId)
        };
      }
      return group;
    }));
  };

  const handleAddAttachment = (groupId: string) => {
    if (sealMethod === 'esign') {
      setCurrentGroupId(groupId);
      setAssistantMode('add');
      setIsAssistantOpen(true);
    } else {
      // 模拟本地上传
      const newId = Date.now();
      setCurrentGroups(prev => prev.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            files: [...group.files, { id: newId, name: `本地上传附件_${newId}.pdf`, type: 'pdf' }]
          };
        }
        return group;
      }));
    }
  };

  const handleStartImport = () => {
    setCurrentGroupId(null);
    setAssistantMode('import');
    setIsAssistantOpen(true);
  };

  // 文件助手确认：弹窗内调整后的投标文件组成一次性带回页面
  const handleAssistantConfirm = (nextGroups: AttachmentGroup[]) => {
    setCurrentGroups(nextGroups);
    setIsAssistantOpen(false);
    setCurrentGroupId(null);
    if (assistantMode === 'import') {
      setHasImported(true);
      setImportSummary('已完成一键导入并填充投标文件组成');
      setTimeout(() => setImportSummary(''), 3000);
    }
  };

  const handleInitiateEsign = () => {
    setIsEsignConfirmOpen(true);
  };

  const handleConfirmEsign = () => {
    // 模拟签章过程
    setEsignGroups(prev => prev.map(group => ({
      ...group,
      files: group.files.map(file => ({ ...file, signingStatus: 'signed' }))
    })));
    setIsEsignConfirmOpen(false);
    setIsSuccessToastOpen(true);
    setTimeout(() => setIsSuccessToastOpen(false), 3000);
  };


  return (
    <BiddingLayout activeNav="投标工作台" activeSidebar="投标">
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-bg-page relative">
        {/* Breadcrumb */}
        <div className="px-6 py-3 text-[12px] text-gray-500">
          <span className="cursor-pointer hover:text-primary">投标/报价管理</span>
          <span className="mx-2 text-gray-400">{'>'}</span>
          <span className="cursor-pointer hover:text-primary">投标/报价列表</span>
          <span className="mx-2 text-gray-400">{'>'}</span>
          <span className="text-gray-900">投标/报价详情</span>
        </div>

        <div className="px-6 pb-10 relative">
          {/* Title Section */}
          <div className="bg-white rounded-sm shadow-sm mb-4 relative">
            <div className="h-1 w-full bg-primary rounded-t-sm"></div>
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-[#f0f5ff] text-[#2f54eb] text-xs px-2 py-0.5 rounded border border-[#adc6ff]">公开招标</span>
                    <h1 className="text-xl font-bold text-gray-900">智能投标文件组成评审原型</h1>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 text-[13px]">
                    <div className="flex gap-2">
                      <span className="text-gray-500 w-20">招标编号：</span>
                      <span className="text-gray-900">cscec20260809000001</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-500 w-20">招标品类：</span>
                      <span className="text-gray-900">物资 钢材</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-6 py-1.5 bg-primary text-white rounded hover:bg-[#e68a00] transition-colors">保存</button>
                  <button className="px-6 py-1.5 bg-primary text-white rounded hover:bg-[#e68a00] transition-colors">提交投标</button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="bg-white rounded-sm shadow-sm">
            <div className="flex border-b border-border-base px-6">
              {['招标(资格预审)公告', '联系方式', '报名附件', '招标文件', '投标文件', '澄清', '答疑'].map(tab => (
                <div 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-4 cursor-pointer text-[14px] relative transition-colors ${
                    activeTab === tab ? 'text-primary font-bold' : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary"></div>}
                </div>
              ))}
            </div>

            <div className="p-6 flex gap-6">
              <div className="flex-1 min-w-0">
                {/* Other Sections (Collapsed for focus) */}
                {['采购清单', '商务条款', '技术条款', '投标说明'].map(title => (
                  <div key={title} className="border border-border-base rounded-sm mb-4 overflow-hidden">
                    <div className="bg-[#fafafa] px-4 py-3 flex items-center justify-between cursor-pointer border-b border-border-base">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-primary"></div>
                        <span className="font-bold text-gray-800">{title}</span>
                      </div>
                      <ChevronDown size={16} className="text-gray-400" />
                    </div>
                  </div>
                ))}

                {/* 投标附件 Section - The Focus */}
                <div className="border border-border-base rounded-sm mb-4 overflow-hidden">
                  <div 
                    className="bg-[#fafafa] px-4 py-3 flex items-center justify-between cursor-pointer border-b border-border-base"
                    onClick={() => toggleSection('attachments')}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-primary"></div>
                      <span className="font-bold text-gray-800">投标附件</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {sealMethod === 'esign' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInitiateEsign();
                          }}
                          className="bg-primary text-white text-xs px-3 py-1 rounded flex items-center gap-1"
                        >
                          发起电子签 <HelpCircle size={14} />
                        </button>
                      )}
                      {expandedSections.attachments ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </div>
                  
                  {expandedSections.attachments && (
                    <div className="p-6">
                      {/* 附件盖章方式 - 卡片式选择，占满整行 */}
                      <div className="mb-4">
                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => setSealMethod('esign')}
                            className={`text-left rounded-md border px-3 py-2 transition-all ${
                              sealMethod === 'esign'
                                ? 'border-primary bg-[#fff7e6] shadow-[0_0_0_1px_rgba(255,153,0,0.25)]'
                                : 'border-border-base bg-white hover:border-primary/60'
                            }`}
                          >
                            <div className="flex items-center">
                              <div
                                className={`w-4 h-4 rounded-full border-2 mr-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                  sealMethod === 'esign' ? 'border-primary' : 'border-gray-300'
                                }`}
                              >
                                {sealMethod === 'esign' && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                              </div>
                              <span className="text-sm font-medium text-gray-800">电子签章</span>
                              <span className="ml-1.5 rounded-sm bg-primary px-1.5 py-0.5 text-[10px] leading-none text-white">
                                推荐
                              </span>
                            </div>
                            <p
                              className={`mt-1 pl-6 text-[11px] leading-4 ${
                                sealMethod === 'esign' ? 'text-[#52a320]' : 'text-gray-400'
                              }`}
                            >
                              在线签署，最快10分钟完成，无需打印快递
                            </p>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSealMethod('scan')}
                            className={`text-left rounded-md border px-3 py-2 transition-all ${
                              sealMethod === 'scan'
                                ? 'border-primary bg-[#fff7e6] shadow-[0_0_0_1px_rgba(255,153,0,0.25)]'
                                : 'border-border-base bg-white hover:border-primary/60'
                            }`}
                          >
                            <div className="flex items-center">
                              <div
                                className={`w-4 h-4 rounded-full border-2 mr-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                  sealMethod === 'scan' ? 'border-primary' : 'border-gray-300'
                                }`}
                              >
                                {sealMethod === 'scan' && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                              </div>
                              <span className="text-sm font-medium text-gray-800">纸质扫描件</span>
                            </div>
                            <p
                              className={`mt-1 pl-6 text-[11px] leading-4 ${
                                sealMethod === 'scan' ? 'text-[#52a320]' : 'text-gray-400'
                              }`}
                            >
                              需打印、盖章、扫描上传，约1-2天
                            </p>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 mb-4">
                        <span className="shrink-0 text-sm text-gray-700">附件：</span>
                        <div className="flex-1">
                          <div className="text-xs text-gray-400 leading-relaxed">
                            {sealMethod === 'esign' ? (
                              <>
                                大小限制：100M 支持格式：.pdf
                                <br />
                                (电子签功能仅支持最多20个100M以内的pdf文件，若不满足需求，请选择纸质扫描件方式上传附件报名)
                              </>
                            ) : (
                              <>
                                大小限制：500M 支持格式：.jpeg, .jpg, .gif, .png, .doc, .doc_, .docx, .xls, .xls_, .xlsx, .txt, .pdf, .rar, .zip, .7z, .tar, .jar, .dwg, .dws, .dwt, .dxf, .csv
                              </>
                            )}
                          </div>

                          {/* 一键导入入口：仅电子签章模式且未完成导入时展示 */}
                          {sealMethod === 'esign' && !hasImported && (
                            <div className="mt-3">
                              <button
                                ref={importButtonRef}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartImport();
                                }}
                                className="bg-primary text-white text-xs px-3 py-1.5 rounded flex items-center gap-1.5 hover:bg-[#e68a00] transition-colors shadow-sm"
                              >
                                <span className="font-medium">一键导入</span>
                                <div className="group relative">
                                  <Info size={14} className="text-white cursor-help" />
                                  <div className="absolute top-full left-0 mt-2 w-64 p-2 bg-gray-800 text-white text-[11px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] font-normal">
                                    文件助手将根据投标文件组成，推荐匹配的附件并自动填充当前为空的附件项。
                                    <div className="absolute bottom-full left-2 border-8 border-transparent border-b-gray-800"></div>
                                  </div>
                                </div>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Grouped Attachments List：电子签章模式仅在完成一键导入后展示，避免与文件助手内容重复 */}
                      {(sealMethod !== 'esign' || hasImported) && (
                        <>
                      <div className="border border-border-base rounded-sm">
                        {currentGroups.map((group, index) => (
                          <div 
                            key={group.id} 
                            className={`p-4 ${index !== currentGroups.length - 1 ? 'border-b border-border-base' : ''}`}
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-sm font-bold text-gray-800">{group.title}</span>
                              {group.subtitle && (
                                <span className="text-xs text-primary cursor-pointer hover:underline">{group.subtitle}</span>
                              )}
                            </div>

                            {group.files.length > 0 ? (
                              <div className="flex flex-wrap gap-3 mb-3">
                                {group.files.map(file => (
                                  <div 
                                    key={file.id} 
                                    className="inline-flex items-center border border-border-base rounded px-3 py-1.5 bg-white group relative"
                                  >
                                    {file.signingStatus === 'signed' && (
                                      <div className="absolute -top-2 left-2 bg-[#52c41a] text-white text-[10px] px-1.5 py-0.5 rounded-sm leading-none z-10">
                                        签章完成
                                      </div>
                                    )}
                                    <div className="flex-shrink-0 w-6 h-6 bg-red-50 rounded flex items-center justify-center mr-2">
                                      <FileText size={14} className="text-red-500" />
                                    </div>
                                    <span className="text-xs text-gray-700 max-w-[200px] truncate">{file.name}</span>
                                    <div className="flex items-center ml-4 gap-2">
                                      <button className="text-gray-400 hover:text-primary">
                                        <Pencil size={12} />
                                      </button>
                                      <button 
                                        onClick={() => handleRemoveFile(group.id, file.id)}
                                        className="text-gray-400 hover:text-red-500"
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : null}

                            <div className="flex flex-col items-start gap-2">
                              <button 
                                onClick={() => handleAddAttachment(group.id)}
                                className="flex items-center gap-1 border border-border-base px-3 py-1 rounded text-xs text-gray-600 hover:border-primary hover:text-primary transition-colors"
                              >
                                <Plus size={12} /> 添加附件
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                        </>
                      )}

                      {/* 一键导入后的建议提示 */}
                      {sealMethod === 'esign' && hasImported && (
                        <p className="mt-2 text-xs text-primary">
                          建议：请先检测投标文件完整性，再提交投标
                        </p>
                      )}

                      {/* 导入操作总结提示 */}
                      {importSummary && (
                        <p className="mt-2 text-xs text-[#52a320]">{importSummary}</p>
                      )}

                      {/* 底部提示 */}
                      {sealMethod === 'esign' && hasImported && (
                        <div className="mt-6">
                          <p className="text-sm text-gray-600 text-center">
                            存在 <span className="font-medium text-gray-800">签章中/签章失败</span> 的文件时，请先点击"发起电子签"完成电子签章。
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side Navigation */}
              <div className="w-32 shrink-0">
                <div className="sticky top-4 flex flex-col gap-0 border-l border-gray-100">
                  {['采购清单', '商务条款', '技术条款', '投标说明', '投标附件'].map((label, idx) => (
                    <div 
                      key={label}
                      className={`pl-8 py-2 text-xs cursor-pointer relative transition-colors hover:text-primary group ${
                        label === '投标附件' ? 'text-primary font-bold' : 'text-gray-600'
                      }`}
                    >
                      {label === '投标附件' && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-100 flex items-center justify-center rounded-sm text-gray-400">
                          <span className="scale-75">{'>'}</span>
                        </div>
                      )}
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 电子签确认弹窗 */}
      {isEsignConfirmOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[110]">
          <div className="bg-white w-[520px] rounded shadow-xl overflow-hidden">
            <div className="flex items-center px-6 py-4 border-b border-gray-100">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                <AlertCircle className="text-white" size={20} />
              </div>
              <h3 className="text-base font-bold text-gray-800">提示</h3>
              <button onClick={() => setIsEsignConfirmOpen(false)} className="ml-auto text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                以下附件将发起电子签章，签章完成后自动报名，最多支持20个文件发起签章
              </p>
              <div className="bg-gray-50 rounded p-4 max-h-[200px] overflow-y-auto">
                {esignGroups.flatMap(g => g.files).map(file => (
                  <div key={file.id} className="flex items-center gap-2 py-1.5">
                    <FileText size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-700 truncate">{file.name}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-gray-500">
                已选 <span className="text-primary font-bold">{esignGroups.flatMap(g => g.files).length}</span> 条（最多20条）
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50">
              <button 
                onClick={() => setIsEsignConfirmOpen(false)}
                className="px-6 py-2 border border-gray-200 rounded text-sm text-gray-600 hover:bg-white transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleConfirmEsign}
                className="px-6 py-2 bg-primary text-white rounded text-sm hover:bg-primary/90 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 成功提示 Toast */}
      {isSuccessToastOpen && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[120] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-white rounded shadow-lg flex items-center px-4 py-3 min-w-[200px] border border-gray-100">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-gray-800 font-medium">签章发起成功</span>
            <button onClick={() => setIsSuccessToastOpen(false)} className="ml-auto text-gray-400 hover:text-gray-600 pl-4">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <AttachmentAssistantModal
        isOpen={isAssistantOpen}
        mode={assistantMode}
        groups={currentGroups}
        activeGroupId={currentGroupId}
        recommendationMap={recommendationMap}
        onClose={() => {
          setIsAssistantOpen(false);
          setCurrentGroupId(null);
        }}
        onConfirm={handleAssistantConfirm}
      />

      <Tour
        open={isImportGuideOpen}
        onClose={() => setIsImportGuideOpen(false)}
        mask={{ color: 'rgba(0, 0, 0, 0.45)' }}
        gap={{ offset: 8, radius: 8 }}
        placement="bottomRight"
        indicatorsRender={() => null}
        zIndex={100}
        steps={[{
          target: () => importButtonRef.current,
          title: '一键导入，全新升级',
          description: (
            <div className="text-sm leading-6 text-gray-600">
              <p>文件助手会根据当前投标文件组成要求，从您的文件库中智能匹配相关附件。确认后，推荐附件将自动追加到对应的文件组成中。</p>
              <p className="mt-2 text-xs text-gray-400">推荐结果仅供参考，请确认附件内容及有效期。</p>
              <Checkbox
                checked={dontRemindAgain}
                onChange={(event) => setDontRemindAgain(event.target.checked)}
                className="mt-4 text-xs text-gray-500"
              >
                不再提示
              </Checkbox>
            </div>
          ),
          nextButtonProps: {
            children: '一键导入',
            onClick: () => {
              setIsImportGuideOpen(false);
              handleStartImport();
            },
            className: '!bg-primary !border-primary hover:!bg-[#e68a00] hover:!border-[#e68a00]'
          }
        }]}
      />
    </BiddingLayout>

  );
};

export default Component;
