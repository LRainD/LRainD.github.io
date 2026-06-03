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
  CheckCircle
} from 'lucide-react';
import './style.css';

interface Attachment {
  id: number;
  name: string;
  signingStatus?: 'signing' | 'signed' | 'failed';
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
  const [attachments, setAttachments] = useState<Attachment[]>([
    { id: 1, name: '项目采购文件评审.pdf' }
  ]);

  // 附件上传方式，默认使用电子签章
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('esign');

  // 选择文件弹窗状态
  const [isFileSelectOpen, setIsFileSelectOpen] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);

  // 提交失败弹窗状态
  const [isSubmitFailOpen, setIsSubmitFailOpen] = useState(false);

  // 报名成功提示状态
  const [isSuccessToastOpen, setIsSuccessToastOpen] = useState(false);

  const handleRemoveAttachment = (id: number) => {
    setAttachments(prev => prev.filter(item => item.id !== id));
  };

  const handleAddAttachment = () => {
    const newId = attachments.length > 0 ? Math.max(...attachments.map(a => a.id)) + 1 : 1;
    setAttachments(prev => [...prev, { id: newId, name: `新附件${newId}.pdf` }]);
  };

  // 打开选择文件弹窗
  const handleOpenFileSelect = () => {
    setSelectedFileIds(attachments.map(a => a.id));
    setIsFileSelectOpen(true);
  };

  // 切换文件选中状态
  const toggleFileSelection = (id: number) => {
    setSelectedFileIds(prev =>
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  // 确认选择文件 - 将选中的文件标记为签署中
  const handleConfirmFileSelect = () => {
    setAttachments(prev =>
      prev.map(att =>
        selectedFileIds.includes(att.id)
          ? { ...att, signingStatus: 'signing' as const }
          : att
      )
    );
    setIsFileSelectOpen(false);
  };

  // 检查是否有签署中的附件
  const hasSigningAttachments = attachments.some(att => att.signingStatus === 'signing');

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
                                （电子签功能仅支持最多20个100M以内的pdf文件）
                              </p>
                            </>
                          ) : (
                            <p className="text-xs text-gray-400 leading-relaxed">
                              大小限制：500M　支持格式：.jpeg、.jpg、.gif、.png、.doc、.doc_、.docx、.xl...
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 附件列表 */}
                      <div className="ml-[100px] space-y-2">
                        {attachments.map((file) => (
                          <div
                            key={file.id}
                            className="inline-flex items-center border border-[#e8e8e8] rounded px-3 py-2 bg-white relative"
                          >
                            {/* 签署中标签 */}
                            {file.signingStatus === 'signing' && (
                              <div className="absolute -top-2 left-2 bg-[#f5a623] text-white text-[10px] px-1.5 py-0.5 rounded-sm leading-none">
                                签署中
                              </div>
                            )}
                            <div className="flex-shrink-0 w-[34px] h-[34px] bg-red-50 rounded flex flex-col items-center justify-center mr-2">
                              <span className="text-[9px] font-bold text-red-500 leading-none">PDF</span>
                            </div>
                            <span className="text-sm text-gray-700 mr-3">{file.name}</span>
                            <button className="text-gray-400 hover:text-gray-600 mr-2 transition-colors">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              onClick={() => handleRemoveAttachment(file.id)}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* 添加附件按钮 */}
                      <div className="ml-[100px]">
                        <button
                          className="inline-flex items-center border border-[#d9d9d9] rounded px-4 py-2 text-sm text-gray-700 hover:border-[#f5a623] hover:text-[#f5a623] transition-colors"
                          onClick={handleAddAttachment}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          添加附件
                        </button>
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
                onClick={handleOpenFileSelect}
              >
                发起电子签后报名
                <Info className="w-4 h-4 ml-1.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 选择文件弹窗 */}
      {isFileSelectOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]">
          <div className="bg-white w-full max-w-[480px] rounded shadow-xl">
            {/* 弹窗头部 */}
            <div className="flex items-center px-5 py-4">
              <div className="w-8 h-8 bg-[#f5a623] rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-800">提示</h3>
            </div>

            {/* 弹窗内容 */}
            <div className="px-5 pb-4">
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                以下附件将发起电子签章，签章完成后自动报名，最多支持20个文件发起签章
              </p>

              {/* 文件列表 */}
              <div className="space-y-2 mb-4">
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center"
                  >
                    <CheckSquare className="w-4 h-4 text-[#f5a623] mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                  </div>
                ))}
              </div>

              {/* 已选数量 */}
              <p className="text-sm text-gray-600">
                已选{selectedFileIds.length}条（最多20条）
              </p>
            </div>

            {/* 弹窗底部 */}
            <div className="flex items-center justify-end px-5 py-4 border-t border-gray-100 gap-3">
              <button
                className="px-6 py-2 border border-[#d9d9d9] rounded text-sm text-gray-700 hover:border-gray-400 transition-colors"
                onClick={() => setIsFileSelectOpen(false)}
              >
                取 消
              </button>
              <button
                className="px-6 py-2 bg-[#f5a623] rounded text-sm text-white hover:bg-[#e09513] transition-colors"
                onClick={handleConfirmFileSelect}
              >
                确 定
              </button>
            </div>
          </div>
        </div>
      )}

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
