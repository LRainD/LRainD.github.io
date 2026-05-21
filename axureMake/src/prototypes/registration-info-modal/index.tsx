import React, { useState } from 'react';
import {
  X,
  ChevronUp,
  FileText,
  Edit3,
  Info,
  Plus
} from 'lucide-react';
import './style.css';

/**
 * @name 报名信息弹窗
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
  const [attachments, setAttachments] = useState([
    { id: 1, name: '项目采购文件评审.pdf' }
  ]);

  const handleRemoveAttachment = (id: number) => {
    setAttachments(prev => prev.filter(item => item.id !== id));
  };

  const handleAddAttachment = () => {
    const newId = attachments.length > 0 ? Math.max(...attachments.map(a => a.id)) + 1 : 1;
    setAttachments(prev => [...prev, { id: newId, name: `新附件${newId}.pdf` }]);
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
                    <div className="w-16 flex-shrink-0 text-right pr-1">
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
                    <div className="w-16 flex-shrink-0 text-right pr-1">
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
                    <div className="w-16 flex-shrink-0 text-right pr-1">
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
                <div className="pl-1">
                  {/* 附件说明 */}
                  <div className="flex items-start mb-3">
                    <div className="w-16 flex-shrink-0 text-right pr-1">
                      <span className="text-red-500 mr-0.5">*</span>
                      <span className="text-sm text-gray-700">附件</span>
                    </div>
                    <span className="text-gray-700 mr-1 mt-0.5">:</span>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 leading-relaxed">
                        大小限制：500M　支持格式：.jpeg、.jpg、.gif、.png、.doc、.doc_、.docx、.xl...
                      </p>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        （如需使用电子签功能，请上传100M以内的pdf文件）
                      </p>
                    </div>
                  </div>

                  {/* 附件列表 */}
                  <div className="ml-[72px] space-y-2 mb-3">
                    {attachments.map((file) => (
                      <div
                        key={file.id}
                        className="inline-flex items-center border border-[#e8e8e8] rounded px-3 py-2 bg-white"
                      >
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
                  <div className="ml-[72px] mb-3">
                    <button
                      className="inline-flex items-center border border-[#d9d9d9] rounded px-4 py-2 text-sm text-gray-700 hover:border-[#f5a623] hover:text-[#f5a623] transition-colors"
                      onClick={handleAddAttachment}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      添加附件
                    </button>
                  </div>

                  {/* 建议提示 */}
                  <div className="ml-[72px] mb-2">
                    <p className="text-xs">
                      <span className="text-[#f5a623]">建议：</span>
                      <span className="text-[#f5a623]">请先检测报名文件完善性，再提交报名</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 底部提示 */}
            <div className="mt-6 mb-2">
              <p className="text-sm text-gray-600 text-center">
                存在 <span className="font-medium text-gray-800">签章中/签章失败</span> 的文件时，请先点击"发起电子签后报名"完成电子签章。
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-5 py-4 border-t border-gray-100 gap-3">
            <button
              className="px-6 py-2 border border-[#d9d9d9] rounded text-sm text-gray-700 hover:border-gray-400 transition-colors"
              onClick={() => document.getElementById('modal-overlay')?.classList.add('hidden')}
            >
              取 消
            </button>
            <button className="px-6 py-2 bg-[#f5a623] rounded text-sm text-white hover:bg-[#e09513] transition-colors">
              直接报名
            </button>
            <button className="px-6 py-2 bg-[#f5a623] rounded text-sm text-white hover:bg-[#e09513] transition-colors flex items-center">
              发起电子签后报名
              <Info className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Component;
