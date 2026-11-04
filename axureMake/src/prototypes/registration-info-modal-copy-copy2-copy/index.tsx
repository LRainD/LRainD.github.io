import React, { useRef, useState } from 'react';
import { Checkbox, Tour } from 'antd';
import {
  X,
  ChevronUp,
  Edit3,
  Info,
  Plus,
  AlertCircle,
  CheckCircle,
  ImageIcon
} from 'lucide-react';

import { AttachmentAssistantModal } from './attachment-assistant-modal';
import {
  AttachmentCategory,
  createEmptyCategories,
  createInitialCategories,
  defaultContact,
  recommendationMap
} from './mock';
import './style.css';

type UploadMethod = 'scan' | 'esign' | null;

/**
 * @name 报名信息弹窗 第三版
 *
 * 参考资料：
 * - /rules/development-guide.md
 */
const Component = () => {
  const [isContactExpanded, setIsContactExpanded] = useState(true);
  const [isAttachmentExpanded, setIsAttachmentExpanded] = useState(true);
  const [contactName, setContactName] = useState(defaultContact.contactName);
  const [phone, setPhone] = useState(defaultContact.phone);
  const [email, setEmail] = useState(defaultContact.email);

  // 附件上传方式，默认使用纸质扫描件以演示图片效果
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('scan');

  // 分类附件状态 - 分别存储
  const [scanCategories, setScanCategories] = useState<AttachmentCategory[]>(createInitialCategories());
  const [esignCategories, setEsignCategories] = useState<AttachmentCategory[]>(createEmptyCategories());

  const [hasImportedEsign, setHasImportedEsign] = useState(false);

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

  // 处理分类附件添加 - 一键导入与手动添加共用同一个文件助手弹窗
  const handleAddCategoryFile = (categoryId: string) => {
    if (uploadMethod === 'esign') {
      setActiveCategoryId(categoryId);
      setAttachmentModalMode('add');
      setIsAttachmentModalOpen(true);
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

  // 文件助手弹窗确认 - 弹窗内调整后的文件组成一次性带回页面
  const handleAttachmentConfirm = (nextCategories: AttachmentCategory[]) => {
    setCategories(nextCategories);
    setIsAttachmentModalOpen(false);
    setActiveCategoryId(null);
    if (attachmentModalMode === 'import') {
      setHasImportedEsign(true);
      setImportSummary('已完成一键导入并填充文件组成');
      setTimeout(() => setImportSummary(''), 3000);
    }
  };

  // 原有电子签章逻辑保留用于处理 footer 逻辑
  const handleRemoveAttachment = (id: number) => {
    // 适配新的结构，删除逻辑已在 handleRemoveCategoryFile 处理
  };

  // 文件助手弹窗状态 - 一键导入与添加附件共用同一个弹窗
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [attachmentModalMode, setAttachmentModalMode] = useState<'import' | 'add'>('import');

  // 提交失败弹窗状态
  const [isSubmitFailOpen, setIsSubmitFailOpen] = useState(false);

  // 报名成功提示状态
  const [isSuccessToastOpen, setIsSuccessToastOpen] = useState(false);

  // 一键导入相关状态
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [isImportGuideOpen, setIsImportGuideOpen] = useState(false); // 修复：改为默认关闭
  const [dontRemindAgain, setDontRemindAgain] = useState(false);
  const [importSummary, setImportSummary] = useState('');
  const importButtonRef = useRef<HTMLButtonElement>(null);

  // 监听模式变化触发引导
  React.useEffect(() => {
    if (uploadMethod === 'esign' && !dontRemindAgain && !hasImportedEsign) {
        setIsImportGuideOpen(true);
    }
  }, [uploadMethod]);

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

  const handleStartImportModal = () => {
    setAttachmentModalMode('import');
    setIsAttachmentModalOpen(true);
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
                  <ChevronUp
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isAttachmentExpanded ? '' : 'rotate-180'}`}
                  />
                </div>
              </div>

              {isAttachmentExpanded && (
                <div className="pl-1 space-y-4">
                  {/* 附件盖章方式 - 卡片式选择，占满整行 */}
                  <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setUploadMethod('esign')}
                        className={`text-left rounded-md border px-3 py-2 transition-all ${
                          uploadMethod === 'esign'
                            ? 'border-[#f5a623] bg-[#fff8ee] shadow-[0_0_0_1px_rgba(245,166,35,0.25)]'
                            : 'border-gray-200 bg-white hover:border-[#f5a623]/60'
                        }`}
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-4 h-4 rounded-full border-2 mr-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              uploadMethod === 'esign' ? 'border-[#f5a623]' : 'border-gray-300'
                            }`}
                          >
                            {uploadMethod === 'esign' && (
                              <div className="w-2 h-2 rounded-full bg-[#f5a623]"></div>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-800">电子签章</span>
                          <span className="ml-1.5 rounded-sm bg-[#f5a623] px-1.5 py-0.5 text-[10px] leading-none text-white">
                            推荐
                          </span>
                        </div>
                        <p
                          className={`mt-1 pl-6 text-[11px] leading-4 ${
                            uploadMethod === 'esign' ? 'text-[#52a320]' : 'text-gray-400'
                          }`}
                        >
                          在线签署，最快10分钟完成，无需打印快递
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMethod('scan')}
                        className={`text-left rounded-md border px-3 py-2 transition-all ${
                          uploadMethod === 'scan'
                            ? 'border-[#f5a623] bg-[#fff8ee] shadow-[0_0_0_1px_rgba(245,166,35,0.25)]'
                            : 'border-gray-200 bg-white hover:border-[#f5a623]/60'
                        }`}
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-4 h-4 rounded-full border-2 mr-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              uploadMethod === 'scan' ? 'border-[#f5a623]' : 'border-gray-300'
                            }`}
                          >
                            {uploadMethod === 'scan' && (
                              <div className="w-2 h-2 rounded-full bg-[#f5a623]"></div>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-800">纸质扫描件</span>
                        </div>
                        <p
                          className={`mt-1 pl-6 text-[11px] leading-4 ${
                            uploadMethod === 'scan' ? 'text-[#52a320]' : 'text-gray-400'
                          }`}
                        >
                          需打印、盖章、扫描上传，约1-2天
                        </p>
                      </button>
                  </div>

                  {/* 附件字段 - 仅在选择了上传方式后显示 */}
                  {uploadMethod && (
                    <>
                  {/* 附件操作区 */}
                    <div className="flex items-start text-xs text-gray-400 leading-relaxed">
                      {/* 左侧字段名，右侧内容整体与之对齐 */}
                      <div className="flex-shrink-0 whitespace-nowrap mr-3">
                        <span className="text-red-500 mr-1">*</span>附件：
                      </div>
                      <div className="flex-1 min-w-0">
                      <div className="mb-3">
                        {uploadMethod === 'esign' ? (
                          <>
                            大小限制：100M　支持格式：.pdf
                            <br />
                            <span>（电子签功能仅支持最多20个100M以内的pdf文件，若不满足需求，请选择纸质扫描件方式上传附件报名）</span>
                          </>
                        ) : (
                          <>
                            大小限制：500M　支持格式：.jpeg、.jpg、.gif、.png、.doc、.doc_、.docx、.xl...
                            <br />
                            <span>（如需使用电子签功能，请上传100M以内的pdf文件）</span>
                          </>
                        )}
                      </div>
                      
                      {uploadMethod === 'esign' && !hasImportedEsign && (
                        <div className="mb-3">
                           <button
                             ref={importButtonRef}
                             onClick={(e) => {
                               e.stopPropagation();
                               handleStartImportModal();
                             }}
                             className="bg-[#f5a623] text-white text-xs px-3 py-1.5 rounded flex items-center gap-1.5 hover:bg-[#e09513] transition-colors shadow-sm"
                           >
                             <span className="font-medium">一键导入</span>
                             <Info size={14} className="text-white" />
                           </button>
                        </div>
                      )}

                      {/* 附件列表/分类展示 */}
                      {/* 附件列表/分类展示 - 仅当有附件或已进行一键导入时显示 */}
                      {(categories.some(cat => cat.files.length > 0) || (uploadMethod === 'esign' && hasImportedEsign)) && (
                        <div className="border border-gray-200 rounded bg-white divide-y divide-gray-100">
                        {categories.map((cat) => (
                          <div key={cat.id} className="p-3">
                            {/* 分类标题与模板下载 */}
                            <div className="flex items-center mb-2">
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
                              <div className="flex flex-col items-start gap-1.5 mb-2">
                                {cat.files.map((file) => (
                                  <div
                                    key={file.id}
                                    className="relative inline-flex items-center rounded border border-gray-200 bg-white pl-2.5 pr-2 py-1"
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

                                    <div className="flex items-center whitespace-nowrap">
                                      {file.name.toLowerCase().endsWith('.pdf') ? (
                                        <div className="flex-shrink-0 w-4 h-4 bg-red-50 rounded flex items-center justify-center mr-2">
                                          <span className="text-[8px] font-bold text-red-500 leading-none">PDF</span>
                                        </div>
                                      ) : (
                                        <ImageIcon className="w-4 h-4 text-[#f5a623] mr-2 flex-shrink-0" />
                                      )}
                                      <span className="text-sm text-gray-700 truncate max-w-[260px]">{file.name}</span>
                                      <div className="flex items-center gap-2 ml-3">
                                        <button className="text-gray-400 hover:text-gray-600">
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button className="text-gray-400 hover:text-red-500" onClick={() => handleRemoveCategoryFile(cat.id, file.id)}>
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
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
                      )}

                      {/* 建议提示 - 一键导入后展示在文件组成下方 */}
                      {uploadMethod === 'esign' && hasImportedEsign && (
                        <div>
                          <p className="mt-2 text-xs text-[#f5a623]">建议：请先检测报名文件完善性，再提交报名</p>
                        </div>
                      )}

                      {/* 导入操作总结提示 */}
                      {importSummary && (
                        <div>
                          <p className="mt-2 text-xs text-[#52a320]">{importSummary}</p>
                        </div>
                      )}
                      </div>
                    </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 底部提示 - 一键导入完成并展示文件组成部分后才展示 */}
            {uploadMethod === 'esign' && hasImportedEsign && (
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

      <AttachmentAssistantModal
        isOpen={isAttachmentModalOpen}
        mode={attachmentModalMode}
        categories={categories}
        activeCategoryId={activeCategoryId}
        recommendationMap={recommendationMap}
        onClose={() => {
          setIsAttachmentModalOpen(false);
          setActiveCategoryId(null);
        }}
        onConfirm={handleAttachmentConfirm}
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
              <p>文件助手会根据当前报名附件要求，从您的文件库中智能匹配相关附件。确认后，推荐附件将自动追加到对应的文件组成中。</p>
              <p className="mt-2 text-xs text-gray-400">推荐结果仅供参考，请确认附件内容及有效期。</p>
              <Checkbox checked={dontRemindAgain} onChange={(event) => setDontRemindAgain(event.target.checked)} className="mt-4 text-xs text-gray-500">
                不再提示
              </Checkbox>
            </div>
          ),
          nextButtonProps: {
            children: '一键导入',
            onClick: () => {
              setIsImportGuideOpen(false);
              handleStartImportModal();
            },
            className: '!bg-[#f5a623] !border-[#f5a623] hover:!bg-[#e09513] hover:!border-[#e09513]'
          }
        }]}
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

    </div>
  );
};

export default Component;
