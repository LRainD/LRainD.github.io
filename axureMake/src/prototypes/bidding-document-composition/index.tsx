/**
 * @name 投标文件组成评审原型
 */
import React, { useState } from 'react';
import { 
  ChevronDown, HelpCircle, 
  ChevronUp, Plus, 
  X, Pencil, FileText,
  AlertCircle, Info, CheckCircle,
  Loader2
} from 'lucide-react';
import BiddingLayout from '../../components/bidding-layout';
import { FileAssistantModal } from '../../components/file-assistant-modal';
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
  const [isFileAssistantOpen, setIsFileAssistantOpen] = useState(false);
  const [isEsignConfirmOpen, setIsEsignConfirmOpen] = useState(false);
  const [isSuccessToastOpen, setIsSuccessToastOpen] = useState(false);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [isRecommendationModalOpen, setIsRecommendationModalOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<{groupId: string, groupTitle: string, fileName: string, selected: boolean}[]>([]);

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
    setCurrentGroupId(groupId);
    if (sealMethod === 'esign') {
      setIsFileAssistantOpen(true);
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

  const handleFileAssistantConfirm = (selectedFiles: any[]) => {
    if (!currentGroupId) return;
    
    const newFiles = selectedFiles.map(f => ({
      id: Date.now() + f.id,
      name: f.name,
      type: 'pdf'
    }));

    setCurrentGroups(prev => prev.map(group => {
      if (group.id === currentGroupId) {
        return {
          ...group,
          files: [...group.files, ...newFiles]
        };
      }
      return group;
    }));
    
    setIsFileAssistantOpen(false);
    setCurrentGroupId(null);
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

  const handleAutoFill = () => {
    setIsAutoFilling(true);
    
    // 模拟网络延迟，获取推荐列表
    setTimeout(() => {
      const recommendationMap: Record<string, string> = {
        'financial-credit': '2023年度财务审计报告.pdf',
        'technical-bid': '技术方案响应书_v1.0.pdf',
        'business-bid': '商务偏差表_盖章版.pdf',
        'other': '企业资质汇编.zip'
      };

      const list: {groupId: string, groupTitle: string, fileName: string, selected: boolean}[] = [];
      currentGroups.forEach(group => {
        // 只有当文件列表为空且有推荐配置时才推荐
        if (group.files.length === 0 && recommendationMap[group.id]) {
          list.push({
            groupId: group.id,
            groupTitle: group.title,
            fileName: recommendationMap[group.id],
            selected: true // 默认勾选
          });
        }
      });

      setRecommendations(list);
      setIsAutoFilling(false);
      setIsRecommendationModalOpen(true);
    }, 1000);
  };

  const handleConfirmRecommendation = () => {
    const selectedRecs = recommendations.filter(r => r.selected);
    if (selectedRecs.length === 0) {
      setIsRecommendationModalOpen(false);
      return;
    }

    setCurrentGroups(prev => prev.map(group => {
      const rec = selectedRecs.find(r => r.groupId === group.id);
      if (rec) {
        return {
          ...group,
          files: [{
            id: Date.now() + Math.random(),
            name: rec.fileName,
            type: rec.fileName.split('.').pop() || 'pdf',
            isRecommended: true
          }]
        };
      }
      return group;
    }));

    setIsRecommendationModalOpen(false);
  };

  const toggleRecommendationSelect = (groupId: string) => {
    setRecommendations(prev => prev.map(r => {
      if (r.groupId === groupId) {
        return { ...r, selected: !r.selected };
      }
      return r;
    }));
  };

  const toggleAllRecommendations = (checked: boolean) => {
    setRecommendations(prev => prev.map(r => ({ ...r, selected: checked })));
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
                        <div className="flex items-center">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAutoFill();
                            }}
                            disabled={isAutoFilling}
                            className="bg-primary text-white text-xs px-4 py-1.5 rounded flex items-center gap-2 hover:bg-[#e68a00] transition-colors disabled:opacity-50 relative shadow-sm"
                          >
                            {isAutoFilling && <Loader2 size={14} className="animate-spin mr-1" />}
                            <span className="font-medium">一键导入</span>
                            <div className="group relative">
                              <Info size={16} className="text-white cursor-help" />
                              <div className="absolute top-full right-0 mt-2 w-64 p-2 bg-gray-800 text-white text-[11px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] font-normal">
                                文件助手将根据投标文件组成，推荐匹配的附件并自动填充当前为空的附件项。
                                <div className="absolute bottom-full right-2 border-8 border-transparent border-b-gray-800"></div>
                              </div>
                            </div>
                          </button>
                        </div>
                      )}

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
                      {/* 附件盖章方式 */}
                      <div className="flex items-center mb-6">
                        <div className="flex-shrink-0 text-right pr-1">
                          <span className="text-red-500 text-xs">*</span>
                          <span className="text-sm text-gray-700 whitespace-nowrap">附件盖章方式</span>
                        </div>
                        <span className="text-gray-700 mr-1">:</span>
                        <div className="flex items-center gap-6 flex-shrink-0">
                          <label className="flex items-center cursor-pointer" onClick={() => setSealMethod('esign')}>
                            <div
                              className={`w-4 h-4 rounded-full border-2 mr-2 flex items-center justify-center transition-colors ${
                                sealMethod === 'esign' ? 'border-primary' : 'border-gray-300'
                              }`}
                            >
                              {sealMethod === 'esign' && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                            </div>
                            <span className="text-sm text-gray-700">电子签章</span>
                          </label>
                          <label className="flex items-center cursor-pointer" onClick={() => setSealMethod('scan')}>
                            <div
                              className={`w-4 h-4 rounded-full border-2 mr-2 flex items-center justify-center transition-colors ${
                                sealMethod === 'scan' ? 'border-primary' : 'border-gray-300'
                              }`}
                            >
                              {sealMethod === 'scan' && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                            </div>
                            <span className="text-sm text-gray-700">纸质扫描件</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 mb-4">
                        <span className="shrink-0 text-sm text-gray-700">附件：</span>
                        <div className="flex-1 text-xs text-gray-400">
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
                      </div>

                      {/* Grouped Attachments List */}
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
                                    className={`inline-flex items-center border rounded px-3 py-1.5 bg-white group relative ${file.isRecommended ? 'border-primary/30' : 'border-border-base'}`}
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

                      {/* 底部提示 */}
                      {sealMethod === 'esign' && (
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

      <FileAssistantModal 
        isOpen={isFileAssistantOpen}
        onClose={() => setIsFileAssistantOpen(false)}
        onConfirm={handleFileAssistantConfirm}
      />

      {/* 智能填充推荐列表弹窗 */}
      {isRecommendationModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[110]">
          <div className="bg-white w-[600px] rounded shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center px-6 py-4 border-b border-gray-100">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                <FileText className="text-primary" size={18} />
              </div>
              <h3 className="text-base font-bold text-gray-800">智能推荐附件</h3>
              <button onClick={() => setIsRecommendationModalOpen(false)} className="ml-auto text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 max-h-[400px] overflow-y-auto">
              <p className="text-sm text-gray-500 mb-6">
                文件助手已为您在“我的文件库”中匹配到以下附件，请确认是否一键导入：
              </p>
              
              <div className="border border-gray-100 rounded">
                <div className="grid grid-cols-[48px_1fr_1fr] bg-gray-50 border-b border-gray-100 px-4 py-2 text-xs font-medium text-gray-500">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="accent-primary w-4 h-4 cursor-pointer"
                      checked={recommendations.length > 0 && recommendations.every(r => r.selected)}
                      onChange={(e) => toggleAllRecommendations(e.target.checked)}
                    />
                  </div>
                  <div>对应附件组</div>
                  <div>推荐引用的文件</div>
                </div>
                
                {recommendations.length > 0 ? (
                  recommendations.map(rec => (
                    <div key={rec.groupId} className="grid grid-cols-[48px_1fr_1fr] px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors items-center">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="accent-primary w-4 h-4 cursor-pointer"
                          checked={rec.selected}
                          onChange={() => toggleRecommendationSelect(rec.groupId)}
                        />
                      </div>
                      <div className="text-sm text-gray-700 font-medium">{rec.groupTitle}</div>
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="flex-shrink-0 w-6 h-6 bg-red-50 rounded flex items-center justify-center">
                          <FileText size={12} className="text-red-500" />
                        </div>
                        <span className="text-xs text-gray-600 truncate" title={rec.fileName}>{rec.fileName}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-gray-400 text-sm">
                    未发现可推荐的附件
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50">
              <button 
                onClick={() => setIsRecommendationModalOpen(false)}
                className="px-6 py-2 border border-gray-200 rounded text-sm text-gray-600 hover:bg-white transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleConfirmRecommendation}
                disabled={recommendations.filter(r => r.selected).length === 0}
                className="px-8 py-2 bg-primary text-white rounded text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                一键导入
              </button>
            </div>
          </div>
        </div>
      )}
    </BiddingLayout>

  );
};

export default Component;
