import React, { useState } from 'react';
import { X, Search, FileText, CheckSquare, Square } from 'lucide-react';

interface FileItem {
  id: number;
  name: string;
  size: string;
  date: string;
}

interface FileAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedFiles: FileItem[]) => void;
  fileData?: FileItem[];
}

const defaultFileData: FileItem[] = [
  { id: 1, name: '企业营业执照副本.pdf', size: '2.4MB', date: '2024-03-15' },
  { id: 2, name: '法人代表身份证明.pdf', size: '1.1MB', date: '2024-03-15' },
  { id: 3, name: '近三年财务审计报告.pdf', size: '15.8MB', date: '2024-02-20' },
  { id: 4, name: '类似项目业绩证明材料.pdf', size: '8.5MB', date: '2024-03-01' },
  { id: 5, name: '技术负责人资历证明.pdf', size: '3.2MB', date: '2024-03-10' },
];

export const FileAssistantModal: React.FC<FileAssistantModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  fileData = defaultFileData,
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  if (!isOpen) return null;

  const toggleFileSelection = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    const selectedFiles = fileData.filter(f => selectedIds.includes(f.id));
    onConfirm(selectedFiles);
    setSelectedIds([]);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] animate-in fade-in duration-200">
      <div className="bg-white w-[640px] rounded shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-primary rounded-full"></div>
            <h3 className="text-base font-bold text-gray-800">文件助手</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索文件名"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="border border-gray-100 rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="w-12 p-3 text-center">
                    <Square size={16} className="mx-auto text-gray-300" />
                  </th>
                  <th className="p-3 text-left font-medium">文件名</th>
                  <th className="p-3 text-left font-medium">大小</th>
                  <th className="p-3 text-left font-medium">更新时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fileData.map(file => (
                  <tr
                    key={file.id}
                    onClick={() => toggleFileSelection(file.id)}
                    className={`cursor-pointer transition-colors ${selectedIds.includes(file.id) ? 'bg-orange-50/50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="p-3 text-center">
                      {selectedIds.includes(file.id) ? (
                        <CheckSquare size={16} className="mx-auto text-primary" />
                      ) : (
                        <Square size={16} className="mx-auto text-gray-300" />
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-gray-400" />
                        <span className="text-gray-700">{file.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-500">{file.size}</td>
                    <td className="p-3 text-gray-500">{file.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            已选择 <span className="text-primary font-bold">{selectedIds.length}</span> 个文件
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedIds.length === 0}
              className={`px-8 py-2 rounded text-sm text-white transition-all ${
                selectedIds.length > 0 ? 'bg-primary hover:bg-primary/90 shadow-md' : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileAssistantModal;
