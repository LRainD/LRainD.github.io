import React, { useState } from 'react';
import {
  X,
  ChevronUp,
  FileText,
  Edit3,
  Info,
  Plus,
  AlertCircle,
  CheckSquare,
  Square,
  CheckCircle,
  ImageIcon,
  Loader2
} from 'lucide-react';

import { FileAssistantModal } from '../../components/file-assistant-modal';
import './style.css';

interface Attachment {
  id: number;
  name: string;
  signingStatus?: 'signing' | 'signed' | 'failed';
  size?: string;
}

interface AttachmentCategory {
  id: string;
  title: string;
  required: boolean;
  hasTemplate: boolean;
  files: Attachment[];
}

type UploadMethod = 'scan' | 'esign' | null;

/**
 * @name 报名信息弹窗 第二版
 *
 * 参考资料：
 * - /rules/development-guide.md
 */
const Component = () => {
  const [isContactExpanded, setIsContactExpanded] = useState(true);
  const [isAttachmentExpanded, setIsAttachmentExpanded] = useState(true);
  const [contactName, setContactName] = useState('sup200');
  const [phone, setPhone] = useState('18716574377');
  const [email, setEmail] = useState('15623615623@139.com');

  // 附件上传方式，默认使用纸质扫描件以演示图片效果
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('scan');

  const initialCategories: AttachmentCategory[] = [
    {
      id: 'health',
      title: '职业健康安全认证体系证书',
      required: false,
      hasTemplate: true,
      files: []
    },
    {
      id: 'credit',
      title: '工商企业信用等级',
      required: false,
      hasTemplate: true,
      files: []
    },
    {
      id: 'other',
      title: '其他附件',
      required: false,
      hasTemplate: false,
      files: []
    },
    {
      id: 'idcard',
      title: '法人身份证',
      required: true,
      hasTemplate: false,
      files: [
        { id: 101, name: '58052193124060022401088623860.jpg', size: '1.2MB' }
      ]
    }
  ];

  // 分类附件状态 - 分别存储
  const [scanCategories, setScanCategories] = useState<AttachmentCategory[]>(initialCategories);
  const [esignCategories, setEsignCategories] = useState<AttachmentCategory[]>(initialCategories.map(cat => ({
    ...cat,
    files: cat.id === 'other' ? [{ id: 1, name: '项目采购文件评审.pdf', size: '2.4MB' }] : cat.files
  })));

  // 当前激活的分类状态
  const categories = uploadMethod === 'esign' ? esignCategories : scanCategories;
  const setCategories = uploadMethod === 'esign' ? setEsignCategories : setScanCategories;

  // 电子签章记录状态（仅用于发起按钮的逻辑）
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // 处理分类附件删除
  const handleRemoveCategoryFile = (categoryId: string, fileId: number) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, files: cat.files.filter(f => f.id !== fileId) };
      }
      return cat;
    }));
  };

  // 处理分类附件添加
  const handleAddCategoryFile = (categoryId: string) => {
    if (uploadMethod === 'esign') {
      setActiveCategoryId(categoryId);
      setIsFileSelectOpen(true);
    } else {
      const newId = Date.now();
      setCategories(prev => prev.map(cat => {
        if (cat.id === categoryId) {
          return { 
            ...cat, 
            files: [...cat.files, { id: newId, name: `新上传文件_${newId}.jpg`, size: '800KB' }] 
          };
        }
        return cat;
      }));
    }
  };

  const handleFileAssistantConfirm = (selectedFiles: any[]) => {
    if (activeCategoryId) {
      const newAttachments = selectedFiles.map(f => ({
        ...f,
        id: Date.now() + f.id,
        signingStatus: 'signed' as const // 模拟签章完成
      }));
      setCategories(prev => prev.map(cat => {
        if (cat.id === activeCategoryId) {
          return { ...cat, files: [...cat.files, ...newAttachments] };
        }
        return cat;
      }));
      setIsFileSelectOpen(false);
      setActiveCategoryId(null);
    }
  };

  // 原有电子签章逻辑保留用于处理 footer 逻辑
  const handleRemoveAttachment = (id: number) => {
    // 适配新的结构，删除逻辑已在 handleRemoveCategoryFile 处理
  };

  // 选择文件弹窗状态
  const [isFileSelectOpen, setIsFileSelectOpen] = useState(false);

  // 提交失败弹窗状态
  const [isSubmitFailOpen, setIsSubmitFailOpen] = useState(false);

  // 报名成功提示状态
  const [isSuccessToastOpen, setIsSuccessToastOpen] = useState(false);

  // 一键导入相关状态
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [isRecommendationModalOpen, setIsRecommendationModalOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<{ id: string, title: string, fileName: string, selected: boolean }[]>([]);

  // 检查是否有签署中的附件
  const hasSigningAttachments = esignCategories.some(cat => 
    cat.files.some(att => att.signingStatus === 'signing')
  );

  // 处理提交报名
  const handleSubmit = () => {
    if (hasSigningAttachments) {
      setIsSubmitFailOpen(true);
    } else {
      setIsSuccessToastOpen(true);
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        setIsSuccessToastOpen(false);
      }, 3000);
    }
  };

  // 一键导入逻辑
  const handleAutoFill = () => {
    setIsAutoFilling(true);
    setTimeout(() => {
      const recommendationMap: Record<string, string> = {
        'health': '职业健康安全管理体系认证证书_2024.pdf',
        'credit': '企业信用等级证书_AAA级.pdf',
        'other': '其他补充证明材料.pdf'
      };

      const list: { id: string, title: string, fileName: string, selected: boolean }[] = [];
      categories.forEach(cat => {
        if (cat.files.length === 0 && recommendationMap[cat.id]) {
          list.push({
            id: cat.id,
            title: cat.title,
            fileName: recommendationMap[cat.id],
            selected: true
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

    setCategories(prev => prev.map(cat => {
      const rec = selectedRecs.find(r => r.id === cat.id);
      if (rec) {
        return {
          ...cat,
          files: [{
            id: Date.now() + Math.random(),
            name: rec.fileName,
            size: '1.5MB',
            signingStatus: uploadMethod === 'esign' ? 'signed' : undefined
          }]
        };
      }
      return cat;
    }));

    setIsRecommendationModalOpen(false);
  };

  const toggleRecommendationSelect = (id: string) => {
    setRecommendations(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, selected: !r.selected };
      }
      return r;
    }));
  };

  const toggleAllRecommendations = (checked: boolean) => {
    setRecommendations(prev => prev.map(r => ({ ...r, selected: checked })));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      {/* 触发按钮 */}
      <button
        className="bg-primary text-white px-6 py-2.5 rounded text-sm hover:bg-primary-dark shadow-sm transition-colors"
        onClick={() => document.getElementById('modal-overlay')?.classList.remove('hidden')}
      >
        打开报名信息弹窗
      </button>

      {/* Modal Overlay */}
      <div id="modal-overlay" className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        {/* Modal Content */}
        <div className="bg-white w-full max-w-[720px] rounded shadow-xl flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-1 h-5 bg-[#f5a623] mr-3"></div>
              <h2 className="text-base font-bold text-gray-800">报名信息</h2>
            </div>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => document.getElementById('modal-overlay')?.classList.add('hidden')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {/* 联系方式 Section */}
            <div className="mb-5">
              {/* Section Header */}
              <div
                className="flex items-center justify-between cursor-pointer select-none mb-4"
                onClick={() => setIsContactExpanded(!isContactExpanded)}
              >
                <div className="flex items-center">
                  <div className="w-1 h-4 bg-[#f5a623] mr-2"></div>
                  <span className="text-sm font-bold text-gray-800">联系方式</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-400 mr-3">
                    采购过程中可更新联系方式，请点击报价详情页【联系方式】及时更新
                  </span>
                  <ChevronUp
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isContactExpanded ? '' : 'rotate-180'}`}
                  />
                </div>
              </div>

              {isContactExpanded && (
                <div className="space-y-4 pl-1">
                  {/* 联系人 */}
                  <div className="flex items-center">
                    <div className="w-24 flex-shrink-0 text-right pr-1">
                      <span className="text-red-500 mr-0.5">*</span>
                      <span className="text-sm text-gray-700">联系人</span>
                    </div>
                    <span className="text-gray-700 mr-1">:</span>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="flex-1 border border-[#d9d9d9] rounded px-3 py-2 text-sm text-gray-800 focus:border-[#f5a623] focus:outline-none focus:ring-1 focus:ring-[#f5a623]/30 transition-colors"
                    />
                  </div>

                  {/* 手机号 */}
                  <div className="flex items-center">
                    <div className="w-24 flex-shrink-0 text-right pr-1">
                      <span className="text-red-500 mr-0.5">*</span>
                      <span className="text-sm text-gray-700">手机号</span>
                    </div>
                    <span className="text-gray-700 mr-1">:</span>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex-1 border border-[#d9d9d9] rounded px-3 py-2 text-sm text-gray-800 focus:border-[#f5a623] focus:outline-none focus:ring-1 focus:ring-[#f5a623]/30 transition-colors"
                    />
                  </div>

                  {/* 邮箱 */}
                  <div className="flex items-center">
                    <div className="w-24 flex-shrink-0 text-right pr-1">
                      <span className="text-red-500 mr-0.5">*</span>
                      <span className="text-sm text-gray-700">邮　箱</span>
                    </div>
                    <span className="text-gray-700 mr-1">:</span>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 border border-[#d9d9d9] rounded px-3 py-2 text-sm text-gray-800 focus:border-[#f5a623] focus:outline-none focus:ring-1 focus:ring-[#f5a623]/30 transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-4"></div>

            {/* 报名附件 Section */}
            <div className="mb-4">
              {/* Section Header */}
              <div
                className="flex items-center justify-between cursor-pointer select-none mb-4"
                onClick={() => setIsAttachmentExpanded(!isAttachmentExpanded)}
              >
                <div className="flex items-center">
                  <div className="w-1 h-4 bg-[#f5a623] mr-2"></div>
                  <span className="text-sm font-bold text-gray-800">报名附件</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-400 mr-3">
                    报名截止前可修改报名附件，请点击报价详情页【报名附件】修改
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAutoFill();
                    }}
                    disabled={isAutoFilling}
                    className="bg-[#f5a623] text-white text-xs px-3 py-1.5 rounded flex items-center gap-1.5 hover:bg-[#e09513] transition-colors disabled:opacity-50 mr-3 shadow-sm"
                  >
                    {isAutoFilling && <Loader2 size={12} className="animate-spin" />}
                    <span className="font-medium">一键导入</span>
                    <div className="group relative">
                      <Info size={14} className="text-white cursor-help" />
                      <div className="absolute top-full right-0 mt-2 w-64 p-2 bg-gray-800 text-white text-[11px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] font-normal">
                        文件助手将根据报名附件要求，推荐匹配的附件并自动填充当前为空的附件项。
                        <div className="absolute bottom-full right-2 border-8 border-transparent border-b-gray-800"></div>
                      </div>
                    </div>
                  </button>
                  <ChevronUp
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isAttachmentExpanded ? '' : 'rotate-180'}`}
                  />
                </div>
              </div>

              {isAttachmentExpanded && (
                <div className="pl-1 space-y-4">
                  {/* 附件是否使用电子签章 */}
                  <div className="flex items-center">
                    <div className="flex-shrink-0 text-right pr-1">
                      <span className="text-red-500 text-xs">*</span>
                      <span className="text-sm text-gray-700 whitespace-nowrap">附件盖章方式</span>
                    </div>
                    <span className="text-gray-700 mr-1">:</span>
                    <div className="flex items-center gap-6 flex-shrink-0">
                      <label className="flex items-center cursor-pointer">
                        <div
                          className={`w-4 h-4 rounded-full border-2 mr-2 flex items-center justify-center transition-colors ${
                            uploadMethod === 'esign'
                              ? 'border-[#f5a623]'
                              : 'border-gray-300'
                          }`}
                          onClick={() => setUploadMethod('esign')}
                        >
                          {uploadMethod === 'esign' && (
                            <div className="w-2 h-2 rounded-full bg-[#f5a623]"></div>
                          )}
                        </div>
                        <span className="text-sm text-gray-700">电子签章</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <div
                          className={`w-4 h-4 rounded-full border-2 mr-2 flex items-center justify-center transition-colors ${
                            uploadMethod === 'scan'
                              ? 'border-[#f5a623]'
                              : 'border-gray-300'
                          }`}
                          onClick={() => setUploadMethod('scan')}
                        >
                          {uploadMethod === 'scan' && (
                            <div className="w-2 h-2 rounded-full bg-[#f5a623]"></div>
                          )}
                        </div>
                        <span className="text-sm text-gray-700">纸质扫描件</span>
                      </label>
                    </div>
                  </div>

                  {/* 附件字段 - 仅在选择了上传方式后显示 */}
                  {uploadMethod && (
                    <>
                      {/* 附件说明 */}
                      <div className="flex items-start">
                        <div className="w-24 flex-shrink-0 text-right pr-1">
                          <span className="text-red-500 mr-0.5">*</span>
                          <span className="text-sm text-gray-700">附件</span>
                        </div>
                        <span className="text-gray-700 mr-1 mt-0.5">:</span>
                        <div className="flex-1">
                          {uploadMethod === 'esign' ? (
                            <>
                              <p className="text-xs text-gray-400 leading-relaxed">
                                大小限制：100M　支持格式：.pdf
                              </p>
                              <p className="text-xs text-gray-400 leading-relaxed">
                                （电子签功能仅支持最多20个100M以内的pdf文件，若不满足需求，请选择纸质扫描件方式上传附件报名）
                              </p>
                            </>
                          ) : (
                            <p className="text-xs text-gray-400 leading-relaxed">
                              <span className="text-red-500 mr-1">*</span>附件： 大小限制：500M　支持格式：.jpeg、.jpg、.gif、.png、.doc、.doc_、.docx、.xl...
                              <br />
                              <span className="text-gray-400 pl-12">（如需使用电子签功能，请上传100M以内的pdf文件）</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 附件列表/分类展示 */}
                      <div className="ml-[100px] border border-gray-200 rounded bg-white divide-y divide-gray-100">
                        {categories.map((cat) => (
                          <div key={cat.id} className="p-4">
                            {/* 分类标题与模板下载 */}
                            <div className="flex items-center mb-3">
                              <span className="text-sm text-gray-800 font-medium">
                                {cat.required && <span className="text-red-500 mr-1">*</span>}
                                {cat.title}
                              </span>
                              {cat.hasTemplate && (
                                <button className="ml-3 text-xs text-[#f5a623] hover:underline">
                                  模板下载
                                </button>
                              )}
                            </div>

                            {/* 已上传文件列表 */}
                            {cat.files.length > 0 && (
                              <div className="space-y-2 mb-3">
                                {cat.files.map((file) => (
                                  <div
                                    key={file.id}
                                    className="inline-flex items-center border border-gray-200 rounded px-3 py-1.5 bg-white group max-w-full relative"
                                  >
                                    {/* 签署状态标签 - 仅在电子签章模式且有状态时显示 */}
                                    {uploadMethod === 'esign' && file.signingStatus === 'signing' && (
                                      <div className="absolute -top-2 left-2 bg-[#f5a623] text-white text-[10px] px-1.5 py-0.5 rounded-sm leading-none z-10">
                                        签署中
                                      </div>
                                    )}
                                    {uploadMethod === 'esign' && file.signingStatus === 'signed' && (
                                      <div className="absolute -top-2 left-2 bg-[#52c41a] text-white text-[10px] px-1.5 py-0.5 rounded-sm leading-none z-10">
                                        签章完成
                                      </div>
                                    )}
                                    
                                    {file.name.toLowerCase().endsWith('.pdf') ? (
                                      <div className="flex-shrink-0 w-4 h-4 bg-red-50 rounded flex items-center justify-center mr-2">
                                        <span className="text-[8px] font-bold text-red-500 leading-none">PDF</span>
                                      </div>
                                    ) : (
                                      <ImageIcon className="w-4 h-4 text-[#f5a623] mr-2 flex-shrink-0" />
                                    )}
                                    
                                    <div className="flex flex-col">
                                      <span className="text-sm text-gray-700 truncate max-w-[300px] mr-3">
                                        {file.name}
                                      </span>
                                      {file.size && <span className="text-[10px] text-gray-400">{file.size}</span>}
                                    </div>

                                    <div className="flex items-center gap-2 ml-auto">
                                      <button className="text-gray-400 hover:text-gray-600">
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        className="text-gray-400 hover:text-red-500"
                                        onClick={() => handleRemoveCategoryFile(cat.id, file.id)}
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* 添加附件按钮 */}
                            <div>
                              <button
                                className="inline-flex items-center border border-gray-200 rounded px-3 py-1.5 text-xs text-gray-600 hover:border-[#f5a623] hover:text-[#f5a623] transition-colors bg-white"
                                onClick={() => handleAddCategoryFile(cat.id)}
                              >
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                添加附件
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 建议提示 */}
                      <div className="ml-[100px]">
                        <p className="text-xs">
                          <span className="text-[#f5a623]">建议：</span>
                          <span className="text-[#f5a623]">请先检测报名文件完善性，再提交报名</span>
                        </p>
                      </div>

                    </>
                  )}
                </div>
              )}
            </div>

            {/* 底部提示 - 仅在电子签章上传时显示 */}
            {uploadMethod === 'esign' && (
              <div className="mt-6 mb-2">
                <p className="text-sm text-gray-600 text-center">
                  存在 <span className="font-medium text-gray-800">签章中/签章失败</span> 的文件时，请先点击"发起电子签后报名"完成电子签章。
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-5 py-4 border-t border-gray-100 gap-3">
            <button
              className="px-6 py-2 border border-[#d9d9d9] rounded text-sm text-gray-700 hover:border-gray-400 transition-colors"
              onClick={() => document.getElementById('modal-overlay')?.classList.add('hidden')}
            >
              取 消
            </button>
            {uploadMethod === 'scan' && (
              <button
                className="px-6 py-2 bg-[#f5a623] rounded text-sm text-white hover:bg-[#e09513] transition-colors"
                onClick={handleSubmit}
              >
                提交报名
              </button>
            )}
            {uploadMethod === 'esign' && (
              <button
                className="px-6 py-2 bg-[#f5a623] rounded text-sm text-white hover:bg-[#e09513] transition-colors flex items-center"
                onClick={() => {
                  // 模拟发起电子签逻辑：将所有电子签附件标记为已完成
                  setEsignCategories(prev => prev.map(cat => ({
                    ...cat,
                    files: cat.files.map(a => ({ ...a, signingStatus: 'signed' }))
                  })));
                  handleSubmit();
                }}
              >
                发起电子签后报名
                <Info className="w-4 h-4 ml-1.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <FileAssistantModal 
        isOpen={isFileSelectOpen}
        onClose={() => setIsFileSelectOpen(false)}
        onConfirm={handleFileAssistantConfirm}
      />

      {/* 提交失败弹窗 */}
      {isSubmitFailOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]">
          <div className="bg-white w-full max-w-[520px] rounded shadow-xl">
            {/* 弹窗头部 */}
            <div className="flex items-center px-5 pt-5 pb-3">
              <div className="w-8 h-8 bg-[#f5a623] rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-800">提交失败</h3>
            </div>

            {/* 弹窗内容 */}
            <div className="px-5 pb-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                存在附件为签章失败/签章中状态，已为您暂存页面信息。签章中文件均签章成功时会自动为您完成报名（如果您已报名则会为您更新联系方式，但注意及时完成签章，否则报名截止时文件签章中/签章失败可能影响您的参与。如需撤销签章或签章附件错误您可删除文件后重新上传）
              </p>
            </div>

            {/* 弹窗底部 */}
            <div className="flex items-center justify-end px-5 py-4">
              <button
                className="px-6 py-2 bg-[#f5a623] rounded text-sm text-white hover:bg-[#e09513] transition-colors"
                onClick={() => setIsSubmitFailOpen(false)}
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 报名成功提示 */}
      {isSuccessToastOpen && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] animate-fade-in-down">
          <div className="bg-white rounded shadow-lg flex items-center px-4 py-3 min-w-[200px]">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-gray-800 font-medium">报名成功</span>
            <button
              className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setIsSuccessToastOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 智能填充推荐列表弹窗 */}
      {isRecommendationModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[110]">
          <div className="bg-white w-[600px] rounded shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center px-6 py-4 border-b border-gray-100">
              <div className="w-8 h-8 bg-[#f5a623]/10 rounded-full flex items-center justify-center mr-3">
                <FileText className="text-[#f5a623]" size={18} />
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
                <div className="grid grid-cols-[48px_1fr_1fr] bg-gray-50 border-b border-gray-100 px-4 py-2 text-[12px] font-medium text-gray-500">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="accent-[#f5a623] w-4 h-4 cursor-pointer"
                      checked={recommendations.length > 0 && recommendations.every(r => r.selected)}
                      onChange={(e) => toggleAllRecommendations(e.target.checked)}
                    />
                  </div>
                  <div>对应附件组</div>
                  <div>推荐引用的文件</div>
                </div>
                
                {recommendations.length > 0 ? (
                  recommendations.map(rec => (
                    <div key={rec.id} className="grid grid-cols-[48px_1fr_1fr] px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors items-center">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="accent-[#f5a623] w-4 h-4 cursor-pointer"
                          checked={rec.selected}
                          onChange={() => toggleRecommendationSelect(rec.id)}
                        />
                      </div>
                      <div className="text-sm text-gray-700 font-medium">{rec.title}</div>
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
                className="px-8 py-2 bg-[#f5a623] text-white rounded text-sm hover:bg-[#e09513] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                一键导入
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Component;
