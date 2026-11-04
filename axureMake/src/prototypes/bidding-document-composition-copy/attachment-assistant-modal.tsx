import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Search,
  FileText,
  FileImage,
  Check,
  Loader2,
  Sparkles,
  Plus,
} from 'lucide-react';

export interface AssistantFile {
  id: number;
  name: string;
  type: string;
  signingStatus?: 'signing' | 'signed' | 'failed';
  isRecommended?: boolean;
}

export interface AssistantGroup {
  id: string;
  title: string;
  subtitle?: string;
  files: AssistantFile[];
}

export interface RecommendationFile {
  id: number;
  fileName: string;
  type: string;
  size: string;
  reason: string;
}

interface LibraryFile {
  id: number;
  name: string;
  type: string;
  size: string;
  date: string;
}

interface AttachmentAssistantModalProps {
  isOpen: boolean;
  mode: 'import' | 'add';
  groups: AssistantGroup[];
  activeGroupId?: string | null;
  recommendationMap?: Record<string, RecommendationFile[]>;
  onClose: () => void;
  onConfirm: (groups: AssistantGroup[]) => void;
}

// 模拟用户文件库
const libraryFiles: LibraryFile[] = [
  { id: 1, name: '企业营业执照副本.pdf', type: 'pdf', size: '2.4MB', date: '2024-03-15' },
  { id: 2, name: '2023年度财务审计报告.pdf', type: 'pdf', size: '15.8MB', date: '2024-02-20' },
  { id: 3, name: '企业信用等级证书_AAA级.pdf', type: 'pdf', size: '1.3MB', date: '2024-03-12' },
  { id: 4, name: '技术方案响应书_v1.0.pdf', type: 'pdf', size: '6.2MB', date: '2024-03-08' },
  { id: 5, name: '商务偏差表_盖章版.pdf', type: 'pdf', size: '2.8MB', date: '2024-03-09' },
  { id: 6, name: '企业资质汇编.pdf', type: 'pdf', size: '12.4MB', date: '2024-03-05' },
  { id: 7, name: '近三年类似项目业绩.pdf', type: 'pdf', size: '8.5MB', date: '2024-03-01' },
  { id: 8, name: '法定代表人身份证明.pdf', type: 'pdf', size: '1.1MB', date: '2024-03-15' },
];

const isPdf = (name: string) => name.toLowerCase().endsWith('.pdf');

export const AttachmentAssistantModal: React.FC<AttachmentAssistantModalProps> = ({
  isOpen,
  mode,
  groups,
  activeGroupId = null,
  recommendationMap = {},
  onClose,
  onConfirm,
}) => {
  const [draft, setDraft] = useState<AssistantGroup[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeTarget, setActiveTarget] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const base = groups.map(group => ({ ...group, files: group.files.map(file => ({ ...file })) }));
    setDraft(base);
    setSelectedIds([]);
    setQuery('');
    setActiveTarget(mode === 'add' ? activeGroupId : null);

    if (mode === 'import') {
      setIsMatching(true);
      const timer = setTimeout(() => {
        setDraft(() => base.map(group => {
          const recommendations = recommendationMap[group.id] || [];
          const newFiles = recommendations
            .filter(rec => !group.files.some(file => file.id === rec.id))
            .map(rec => ({
              id: rec.id,
              name: rec.fileName,
              type: rec.type,
              isRecommended: true,
              signingStatus: undefined,
            }));
          return newFiles.length > 0 ? { ...group, files: [...group.files, ...newFiles] } : group;
        }));
        setIsMatching(false);
      }, 900);
      return () => clearTimeout(timer);
    }

    setIsMatching(false);
  }, [isOpen, mode, activeGroupId]);

  const totalFiles = useMemo(() => draft.reduce((sum, group) => sum + group.files.length, 0), [draft]);

  const filteredFiles = useMemo(
    () => libraryFiles.filter(file => file.name.toLowerCase().includes(query.trim().toLowerCase())),
    [query]
  );

  const activeGroup = draft.find(group => group.id === activeTarget) || null;

  if (!isOpen) return null;

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]));
  };

  const removeFile = (groupId: string, fileId: number) => {
    setDraft(prev => prev.map(group => (
      group.id === groupId ? { ...group, files: group.files.filter(file => file.id !== fileId) } : group
    )));
  };

  const addSelectedToTarget = () => {
    if (!activeTarget || selectedIds.length === 0) return;
    const picked = libraryFiles.filter(file => selectedIds.includes(file.id));
    setDraft(prev => prev.map(group => (
      group.id === activeTarget
        ? {
            ...group,
            files: [
              ...group.files,
              ...picked.map((file, index) => ({
                id: Date.now() + index + file.id,
                name: file.name,
                type: file.type,
              })),
            ],
          }
        : group
    )));
    setSelectedIds([]);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 animate-in fade-in duration-200">
      <div className="flex max-h-[84vh] w-[880px] flex-col overflow-hidden rounded-lg bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        {/* 头部 */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-primary" />
            <h3 className="text-base font-bold text-gray-800">文件助手</h3>
            <span className="rounded-sm bg-[#fff7e6] px-1.5 py-0.5 text-[11px] text-[#b76a00]">
              {mode === 'import' ? '一键导入' : '添加附件'}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 transition-colors hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* 说明条 */}
        <div className="px-6 pt-4">
          <div className="flex items-start gap-2 rounded border border-[#ffe1b8] bg-[#fff7e6] px-3 py-2 text-xs leading-relaxed text-[#b76a00]">
            <Sparkles size={14} className="mt-0.5 flex-shrink-0" />
            <p>
              {mode === 'import'
                ? '已根据本次投标文件要求，从您的文件库中智能匹配附件。您可以在这里直接核对、删除或补充文件，确认后一次性带入页面。'
                : '左侧为当前投标文件组成，可在文件库中勾选文件后加入指定分类，确认后一次性带回页面。'}
            </p>
          </div>
        </div>

        {isMatching ? (
          <div className="flex h-[340px] flex-col items-center justify-center">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-primary">正在根据投标文件组成智能匹配附件…</p>
            <p className="mt-1 text-xs text-gray-400">从您的文件库中查找与文件组成匹配的附件</p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 gap-5 px-6 py-4">
            {/* 左：文件组成 */}
            <div className="flex w-[352px] flex-shrink-0 flex-col overflow-hidden rounded border border-gray-200">
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-3 py-2">
                <span className="text-xs font-medium text-gray-600">文件组成</span>
                <span className="text-[11px] text-gray-400">共 {totalFiles} 个附件</span>
              </div>
              <div className="min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto">
                {draft.map(group => (
                  <div
                    key={group.id}
                    className={`px-3 py-2.5 transition-colors ${activeTarget === group.id ? 'bg-[#fff7e6]' : ''}`}
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="truncate text-xs font-medium text-gray-700">{group.title}</span>
                      <button
                        onClick={() => setActiveTarget(group.id)}
                        className="ml-2 flex flex-shrink-0 items-center text-[11px] text-primary hover:underline"
                      >
                        <Plus className="mr-0.5 h-3 w-3" /> 添加
                      </button>
                    </div>

                    {group.files.length > 0 ? (
                      <div className="flex flex-col items-start gap-1">
                        {group.files.map(file => (
                          <div
                            key={file.id}
                            className="inline-flex max-w-full items-center gap-1.5 rounded border border-gray-200 bg-white px-2 py-1"
                          >
                            {isPdf(file.name) ? (
                              <FileText size={12} className="flex-shrink-0 text-[#e5484d]" />
                            ) : (
                              <FileImage size={12} className="flex-shrink-0 text-[#52a320]" />
                            )}
                            <span className="truncate text-[11px] text-gray-700">{file.name}</span>
                            <button
                              onClick={() => removeFile(group.id, file.id)}
                              className="flex-shrink-0 text-gray-400 transition-colors hover:text-[#e5484d]"
                            >
                              <X size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-gray-400">
                        {mode === 'import' ? '未匹配到附件，可手动补充' : '暂无附件'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 右：文件库 */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded border border-gray-200">
              <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    type="text"
                    placeholder="搜索文件名"
                    className="w-full rounded border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-xs text-gray-700 transition-all focus:border-primary focus:bg-white focus:outline-none"
                  />
                </div>
                <span className="flex-shrink-0 text-[11px] text-gray-400">我的文件库</span>
              </div>

              {activeGroup && (
                <div className="flex items-center gap-2 border-b border-[#ffe1b8] bg-[#fff7e6] px-3 py-1.5 text-[11px] text-[#b76a00]">
                  <span className="truncate">正在为「{activeGroup.title}」添加附件</span>
                  <button
                    onClick={() => setActiveTarget(null)}
                    className="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-600"
                  >
                    取消指定
                  </button>
                </div>
              )}

              <div className="min-h-0 flex-1 overflow-y-auto">
                {filteredFiles.length > 0 ? (
                  filteredFiles.map(file => {
                    const checked = selectedIds.includes(file.id);
                    return (
                      <div
                        key={file.id}
                        onClick={() => toggleSelect(file.id)}
                        className={`flex cursor-pointer items-center gap-3 border-b border-gray-50 px-3 py-2 text-xs transition-colors ${
                          checked ? 'bg-orange-50/60' : 'hover:bg-gray-50'
                        }`}
                      >
                        <span
                          className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-sm border transition-colors ${
                            checked ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
                          }`}
                        >
                          {checked && <Check size={10} className="text-white" />}
                        </span>
                        <FileText size={14} className="flex-shrink-0 text-gray-400" />
                        <span className="min-w-0 flex-1 truncate text-gray-700">{file.name}</span>
                        <span className="w-14 flex-shrink-0 text-right text-gray-400">{file.size}</span>
                        <span className="w-20 flex-shrink-0 text-right text-gray-400">{file.date}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-10 text-center text-xs text-gray-400">未找到相关文件</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 底部 */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
          <div className="text-xs text-gray-500">
            已选择 <span className="font-bold text-primary">{selectedIds.length}</span> 个文件
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded border border-gray-200 px-5 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50"
            >
              取消
            </button>
            {activeGroup && (
              <button
                onClick={addSelectedToTarget}
                disabled={selectedIds.length === 0 || isMatching}
                className={`rounded border px-4 py-1.5 text-sm transition-colors ${
                  selectedIds.length > 0 && !isMatching
                    ? 'border-primary text-primary hover:bg-[#fff7e6]'
                    : 'cursor-not-allowed border-gray-200 text-gray-300'
                }`}
              >
                加入该分类
              </button>
            )}
            <button
              onClick={() => onConfirm(draft)}
              disabled={isMatching}
              className={`rounded px-6 py-1.5 text-sm font-medium text-white shadow-sm transition-colors ${
                isMatching ? 'cursor-not-allowed bg-gray-300' : 'bg-primary hover:bg-[#e68a00]'
              }`}
            >
              {mode === 'import' ? '确认带入页面' : '确定'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttachmentAssistantModal;
