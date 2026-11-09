import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  Search,
  FileText,
  FileImage,
  Check,
  Loader2,
  Upload,
} from 'lucide-react';

export interface AssistantFile {
  id: number;
  name: string;
  size?: string;
  signingStatus?: 'signing' | 'signed' | 'failed';
  isAiRecommended?: boolean;
  recommendationReason?: string;
}

export interface AssistantCategory {
  id: string;
  title: string;
  required: boolean;
  hasTemplate: boolean;
  files: AssistantFile[];
}

interface LibraryFile {
  id: number;
  name: string;
  size: string;
  date: string;
  /** 大类：文件 / 图片 */
  kind: string;
  /** 文件分类：投标文件 / 报名文件 等 */
  fileType: string;
  /** 资质类型 */
  qualification: string;
}

interface RecommendationFile {
  id: number;
  fileName: string;
  size: string;
  reason: string;
}

interface AttachmentAssistantModalProps {
  isOpen: boolean;
  mode: 'import' | 'add';
  categories: AssistantCategory[];
  activeCategoryId?: string | null;
  recommendationMap?: Record<string, RecommendationFile[]>;
  onClose: () => void;
  onConfirm: (categories: AssistantCategory[]) => void;
}

// 模拟用户文件库
const libraryFiles: LibraryFile[] = [
  { id: 1, name: '企业营业执照副本.pdf', size: '2.4MB', date: '2024-03-15', kind: '文件', fileType: '投标文件', qualification: '营业执照' },
  { id: 2, name: '法人代表身份证明.pdf', size: '1.1MB', date: '2024-03-15', kind: '文件', fileType: '投标文件', qualification: '—' },
  { id: 3, name: '近三年财务审计报告.pdf', size: '15.8MB', date: '2024-02-20', kind: '文件', fileType: '报名文件', qualification: '—' },
  { id: 4, name: '类似项目业绩证明材料.pdf', size: '8.5MB', date: '2024-03-01', kind: '文件', fileType: '投标文件', qualification: '—' },
  { id: 5, name: '职业健康安全管理体系认证证书.pdf', size: '1.5MB', date: '2024-03-10', kind: '文件', fileType: '投标文件', qualification: '职业健康安全' },
  { id: 6, name: '企业信用等级证书_AAA级.pdf', size: '1.3MB', date: '2024-03-12', kind: '文件', fileType: '投标文件', qualification: '企业信用' },
  { id: 7, name: '法人身份证正反面.jpg', size: '1.2MB', date: '2024-03-14', kind: '图片', fileType: '报名文件', qualification: '—' },
];

const isPdf = (name: string) => name.toLowerCase().endsWith('.pdf');

const formatSize = (bytes: number) => {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
};

const uniqueOptions = (values: string[]) => Array.from(new Set(values));

export const AttachmentAssistantModal: React.FC<AttachmentAssistantModalProps> = ({
  isOpen,
  mode,
  categories,
  activeCategoryId = null,
  recommendationMap = {},
  onClose,
  onConfirm,
}) => {
  const [draft, setDraft] = useState<AssistantCategory[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeTarget, setActiveTarget] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('全部');
  const [qualificationFilter, setQualificationFilter] = useState('全部');
  const [isMatching, setIsMatching] = useState(false);
  const [previewName, setPreviewName] = useState<string | null>(null);
  const localFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const base = categories.map(cat => ({ ...cat, files: cat.files.map(file => ({ ...file })) }));
    setDraft(base);
    setSelectedIds([]);
    setQuery('');
    setFileTypeFilter('全部');
    setQualificationFilter('全部');
    setPreviewName(null);
    setActiveTarget(activeCategoryId ?? base[0]?.id ?? null);

    if (mode === 'import') {
      setIsMatching(true);
      const timer = setTimeout(() => {
        setDraft(() => base.map(cat => {
          const recommendations = recommendationMap[cat.id] || [];
          const newFiles = recommendations
            .filter(rec => !cat.files.some(file => file.id === rec.id))
            .map(rec => ({
              id: rec.id,
              name: rec.fileName,
              size: rec.size,
              isAiRecommended: true,
              recommendationReason: rec.reason,
              signingStatus: undefined,
            }));
          return newFiles.length > 0 ? { ...cat, files: [...cat.files, ...newFiles] } : cat;
        }));
        setIsMatching(false);
      }, 900);
      return () => clearTimeout(timer);
    }

    setIsMatching(false);
  }, [isOpen, mode, activeCategoryId]);

  const fileTypeOptions = useMemo(
    () => ['全部', ...uniqueOptions(libraryFiles.map(file => file.fileType))],
    []
  );
  const qualificationOptions = useMemo(
    () => ['全部', ...uniqueOptions(libraryFiles.map(file => file.qualification).filter(item => item !== '—'))],
    []
  );

  const filteredFiles = useMemo(
    () => libraryFiles.filter(file => {
      const keywordMatched = file.name.toLowerCase().includes(query.trim().toLowerCase());
      const fileTypeMatched = fileTypeFilter === '全部' || file.fileType === fileTypeFilter;
      const qualificationMatched = qualificationFilter === '全部' || file.qualification === qualificationFilter;
      return keywordMatched && fileTypeMatched && qualificationMatched;
    }),
    [query, fileTypeFilter, qualificationFilter]
  );

  const activeCategory = draft.find(cat => cat.id === activeTarget) || null;

  if (!isOpen) return null;

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]));
  };

  const removeFile = (categoryId: string, fileId: number) => {
    setDraft(prev => prev.map(cat => (
      cat.id === categoryId ? { ...cat, files: cat.files.filter(file => file.id !== fileId) } : cat
    )));
  };

  const addSelectedToTarget = () => {
    if (!activeTarget || selectedIds.length === 0) return;
    const picked = libraryFiles.filter(file => selectedIds.includes(file.id));
    setDraft(prev => prev.map(cat => (
      cat.id === activeTarget
        ? {
            ...cat,
            files: [
              ...cat.files,
              ...picked.map((file, index) => ({
                id: Date.now() + index + file.id,
                name: file.name,
                size: file.size,
              })),
            ],
          }
        : cat
    )));
    setSelectedIds([]);
  };

  // 添加本地文件：优先加入当前选中的报名材料分类，否则加入「其他附件」
  const handleLocalUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const targetId = activeTarget
        ?? draft.find(cat => cat.title.includes('其他'))?.id
        ?? draft[draft.length - 1]?.id
        ?? null;
      if (targetId) {
        setDraft(prev => prev.map(cat => (
          cat.id === targetId
            ? {
                ...cat,
                files: [
                  ...cat.files,
                  ...files.map((file, index) => ({
                    id: Date.now() + index,
                    name: file.name,
                    size: formatSize(file.size),
                  })),
                ],
              }
            : cat
        )));
        setActiveTarget(targetId);
      }
    }
    event.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 animate-in fade-in duration-200">
      <div className="flex max-h-[86vh] w-[1120px] flex-col overflow-hidden rounded-lg bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        {/* 头部 */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-[#f5a623]" />
            <h3 className="text-base font-bold text-gray-800">文件助手</h3>
            <span className="rounded-sm bg-[#fff8ee] px-1.5 py-0.5 text-[11px] text-[#b76a00]">
              {mode === 'import' ? '一键导入' : '添加附件'}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 transition-colors hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {isMatching ? (
          <div className="flex h-[420px] flex-col items-center justify-center">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#f5a623]" />
            <p className="text-sm font-medium text-[#f5a623]">正在根据报名要求智能匹配附件…</p>
            <p className="mt-1 text-xs text-gray-400">从您的文件库中查找与报名材料匹配的附件</p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 gap-6 px-6 py-4">
            {/* 左：报名材料 */}
            <div className="flex w-[400px] flex-shrink-0 flex-col overflow-hidden">
              <h4 className="mb-3 text-lg font-bold text-gray-800">报名材料</h4>
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                {draft.map(cat => (
                  <div
                    key={cat.id}
                    onClick={() => setActiveTarget(cat.id)}
                    className={`cursor-pointer rounded-md px-2 pb-2 pt-1.5 transition-colors ${
                      activeTarget === cat.id
                        ? 'bg-[#fff8ee] shadow-[0_0_0_1px_rgba(245,166,35,0.35)]'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="mb-1.5 truncate px-1 text-sm font-semibold text-gray-800">
                      {cat.required && <span className="mr-0.5 text-red-500">*</span>}
                      {cat.title}
                    </div>

                    <div className="grid grid-cols-[minmax(0,1fr)_64px] rounded-sm bg-gray-50 px-2 py-1.5 text-[11px] text-gray-500">
                      <span>文件名称</span>
                      <span>操作</span>
                    </div>

                    {cat.files.length > 0 ? (
                      cat.files.map(file => (
                        <div
                          key={file.id}
                          className="grid grid-cols-[minmax(0,1fr)_64px] items-center px-2 py-1.5 text-xs"
                        >
                          <span className="truncate pr-2 text-gray-700">{file.name}</span>
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <button
                              onClick={event => {
                                event.stopPropagation();
                                setPreviewName(file.name);
                              }}
                              className="text-[#f5a623] transition-colors hover:underline"
                            >
                              预览
                            </button>
                            <button
                              onClick={event => {
                                event.stopPropagation();
                                removeFile(cat.id, file.id);
                              }}
                              className="text-[#e5484d] transition-colors hover:underline"
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-2 py-2 text-[11px] text-gray-400">
                        {mode === 'import' ? '未匹配到附件，可从右侧加入或上传本地文件' : '暂无附件'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 右：文件助手已有附件 */}
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="mb-3 flex items-baseline gap-3">
                <h4 className="text-lg font-bold text-gray-800">文件助手已有附件</h4>
                <span className="text-[11px] text-gray-400">所选文件为未签署文件原件</span>
              </div>

              {/* 筛选条件 */}
              <div className="mb-3 flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <span className="flex-shrink-0">文件名称</span>
                  <div className="relative">
                    <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={query}
                      onChange={event => setQuery(event.target.value)}
                      type="text"
                      placeholder="请输入"
                      className="w-[136px] rounded border border-gray-300 py-1 pl-6 pr-2 text-xs text-gray-700 transition-colors focus:border-[#f5a623] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex-shrink-0">文件分类</span>
                  <select
                    value={fileTypeFilter}
                    onChange={event => setFileTypeFilter(event.target.value)}
                    className="w-[104px] rounded border border-gray-300 bg-white px-1.5 py-1 text-xs text-gray-700 focus:border-[#f5a623] focus:outline-none"
                  >
                    {fileTypeOptions.map(option => <option key={option}>{option}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex-shrink-0">资质类型</span>
                  <select
                    value={qualificationFilter}
                    onChange={event => setQualificationFilter(event.target.value)}
                    className="w-[112px] rounded border border-gray-300 bg-white px-1.5 py-1 text-xs text-gray-700 focus:border-[#f5a623] focus:outline-none"
                  >
                    {qualificationOptions.map(option => <option key={option}>{option}</option>)}
                  </select>
                </div>
              </div>

              {/* 文件列表 */}
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded border border-gray-200">
                <div className="grid grid-cols-[32px_minmax(0,1fr)_56px_76px_92px_56px] items-center gap-1 border-b border-gray-100 bg-gray-50 px-3 py-2 text-[11px] text-gray-500">
                  <span />
                  <span>文件名称</span>
                  <span>大类</span>
                  <span>文件分类</span>
                  <span>资质类型</span>
                  <span>操作</span>
                </div>

                <div className="min-h-[188px] flex-1 overflow-y-auto">
                  {filteredFiles.length > 0 ? (
                    filteredFiles.map((file, index) => {
                      const checked = selectedIds.includes(file.id);
                      return (
                        <div
                          key={file.id}
                          onClick={() => toggleSelect(file.id)}
                          className={`grid cursor-pointer grid-cols-[32px_minmax(0,1fr)_56px_76px_92px_56px] items-center gap-1 border-b border-gray-50 px-3 py-2 text-xs transition-colors ${
                            checked
                              ? 'bg-[#fff8ee]'
                              : index % 2 === 1
                                ? 'bg-gray-50/60 hover:bg-gray-100/60'
                                : 'hover:bg-gray-50'
                          }`}
                        >
                          <span
                            className={`flex h-3.5 w-3.5 items-center justify-center rounded-sm border transition-colors ${
                              checked ? 'border-[#f5a623] bg-[#f5a623]' : 'border-gray-300 bg-white'
                            }`}
                          >
                            {checked && <Check size={10} className="text-white" />}
                          </span>
                          <span className="truncate text-gray-700" title={file.name}>{file.name}</span>
                          <span className="text-gray-600">{file.kind}</span>
                          <span className="truncate text-gray-600">{file.fileType}</span>
                          <span className="truncate text-gray-600">{file.qualification}</span>
                          <button
                            onClick={event => {
                              event.stopPropagation();
                              setPreviewName(file.name);
                            }}
                            className="text-[#f5a623] transition-colors hover:underline"
                          >
                            预览
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-10 text-center text-xs text-gray-400">未找到相关文件</div>
                  )}
                </div>
              </div>

              {/* 加入本类 */}
              <div className="mt-3">
                <button
                  onClick={addSelectedToTarget}
                  disabled={!activeTarget || selectedIds.length === 0}
                  className={`rounded border px-5 py-1.5 text-xs transition-colors ${
                    activeTarget && selectedIds.length > 0
                      ? 'border-[#f5a623] text-[#f5a623] hover:bg-[#fff8ee]'
                      : 'cursor-not-allowed border-gray-200 text-gray-300'
                  }`}
                >
                  加入本类
                </button>
                {activeTarget && (
                  <span className="ml-2 text-[11px] text-gray-400">
                    将加入「{activeCategory?.title}」
                  </span>
                )}
              </div>

              {/* 上传本地文件 */}
              <div className="mt-4 flex items-center gap-3">
                <h4 className="text-lg font-bold text-gray-800">上传本地文件</h4>
                <button
                  onClick={() => localFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-[#f5a623] hover:text-[#f5a623]"
                >
                  <Upload size={13} />
                  上传文件
                </button>
                <input
                  ref={localFileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleLocalUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* 底部 */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
          <div className="text-xs text-gray-500">
            已选择 <span className="font-bold text-[#f5a623]">{selectedIds.length}</span> 个文件
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded border border-gray-200 px-6 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={() => onConfirm(draft)}
              disabled={isMatching}
              className={`rounded px-6 py-1.5 text-sm font-medium text-white shadow-sm transition-colors ${
                isMatching ? 'cursor-not-allowed bg-gray-300' : 'bg-[#f5a623] hover:bg-[#e09513]'
              }`}
            >
              {mode === 'import' ? '确认带入页面' : '确定'}
            </button>
          </div>
        </div>
      </div>

      {/* 文件预览 */}
      {previewName && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40"
          onClick={() => setPreviewName(null)}
        >
          <div
            className="w-[640px] rounded-lg bg-white p-5 shadow-2xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-2">
                {isPdf(previewName) ? (
                  <FileText size={16} className="flex-shrink-0 text-[#e5484d]" />
                ) : (
                  <FileImage size={16} className="flex-shrink-0 text-[#52a320]" />
                )}
                <span className="truncate text-sm font-medium text-gray-800">{previewName}</span>
              </div>
              <button
                onClick={() => setPreviewName(null)}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex h-[320px] flex-col items-center justify-center gap-2 rounded border border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400">
              <FileText size={36} />
              文件预览区域
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentAssistantModal;
