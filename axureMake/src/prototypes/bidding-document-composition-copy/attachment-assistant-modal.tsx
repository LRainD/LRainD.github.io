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
  /** 大类：文件 / 图片 */
  kind: string;
  /** 文件分类：投标文件 / 技术标 等 */
  fileType: string;
  /** 资质类型 */
  qualification: string;
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
  { id: 1, name: '企业营业执照副本.pdf', type: 'pdf', size: '2.4MB', date: '2024-03-15', kind: '文件', fileType: '投标文件', qualification: '营业执照' },
  { id: 2, name: '2023年度财务审计报告.pdf', type: 'pdf', size: '15.8MB', date: '2024-02-20', kind: '文件', fileType: '投标文件', qualification: '财务审计' },
  { id: 3, name: '企业信用等级证书_AAA级.pdf', type: 'pdf', size: '1.3MB', date: '2024-03-12', kind: '文件', fileType: '投标文件', qualification: '企业信用' },
  { id: 4, name: '技术方案响应书_v1.0.pdf', type: 'pdf', size: '6.2MB', date: '2024-03-08', kind: '文件', fileType: '技术标', qualification: '—' },
  { id: 5, name: '商务偏差表_盖章版.pdf', type: 'pdf', size: '2.8MB', date: '2024-03-09', kind: '文件', fileType: '商务标', qualification: '—' },
  { id: 6, name: '企业资质汇编.pdf', type: 'pdf', size: '12.4MB', date: '2024-03-05', kind: '文件', fileType: '投标文件', qualification: '企业资质' },
  { id: 7, name: '近三年类似项目业绩.pdf', type: 'pdf', size: '8.5MB', date: '2024-03-01', kind: '文件', fileType: '投标文件', qualification: '业绩证明' },
  { id: 8, name: '法定代表人身份证明.pdf', type: 'pdf', size: '1.1MB', date: '2024-03-15', kind: '文件', fileType: '投标文件', qualification: '—' },
];

const isPdf = (name: string) => name.toLowerCase().endsWith('.pdf');

const uniqueOptions = (values: string[]) => Array.from(new Set(values));

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
  const [fileTypeFilter, setFileTypeFilter] = useState('全部');
  const [qualificationFilter, setQualificationFilter] = useState('全部');
  const [isMatching, setIsMatching] = useState(false);
  const [previewName, setPreviewName] = useState<string | null>(null);
  const localFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const base = groups.map(group => ({ ...group, files: group.files.map(file => ({ ...file })) }));
    setDraft(base);
    setSelectedIds([]);
    setQuery('');
    setFileTypeFilter('全部');
    setQualificationFilter('全部');
    setPreviewName(null);
    setActiveTarget(activeGroupId ?? base[0]?.id ?? null);

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

  // 添加本地文件：优先加入当前高亮的文件组成分类，否则加入「其他附件」
  const handleLocalUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []) as File[];
    if (files.length > 0) {
      const targetId = activeTarget
        ?? draft.find(group => group.title.includes('其他'))?.id
        ?? draft[draft.length - 1]?.id
        ?? null;
      if (targetId) {
        setDraft(prev => prev.map(group => (
          group.id === targetId
            ? {
                ...group,
                files: [
                  ...group.files,
                  ...files.map((file, index) => ({
                    id: Date.now() + index,
                    name: file.name,
                    type: isPdf(file.name) ? 'pdf' : 'other',
                  })),
                ],
              }
            : group
        )));
        setActiveTarget(targetId);
      }
    }
    input.value = '';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 animate-in fade-in duration-200">
      <div className="flex max-h-[86vh] w-[1120px] flex-col overflow-hidden rounded-lg bg-white shadow-2xl animate-in zoom-in-95 duration-200">
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

        {isMatching ? (
          <div className="flex h-[420px] flex-col items-center justify-center">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-primary">正在根据投标文件组成智能匹配附件…</p>
            <p className="mt-1 text-xs text-gray-400">从您的文件库中查找与文件组成匹配的附件</p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 gap-6 px-6 py-4">
            {/* 左：投标文件组成 */}
            <div className="flex w-[400px] flex-shrink-0 flex-col overflow-hidden">
              <div className="mb-3 flex items-baseline justify-between">
                <h4 className="text-lg font-bold text-gray-800">投标文件组成</h4>
                <span className="text-[11px] text-gray-400">共 {totalFiles} 个附件</span>
              </div>
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                {draft.map(group => (
                  <div
                    key={group.id}
                    onClick={() => setActiveTarget(group.id)}
                    className={`cursor-pointer rounded-md px-2 pb-2 pt-1.5 transition-colors ${
                      activeTarget === group.id
                        ? 'bg-[#fff7e6] shadow-[0_0_0_1px_rgba(255,153,0,0.35)]'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="mb-1.5 flex items-center gap-2 px-1">
                      <span className="truncate text-sm font-semibold text-gray-800">{group.title}</span>
                      {group.subtitle && (
                        <span className="flex-shrink-0 text-[11px] text-primary hover:underline">{group.subtitle}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-[minmax(0,1fr)_64px] rounded-sm bg-gray-50 px-2 py-1.5 text-[11px] text-gray-500">
                      <span>文件名称</span>
                      <span>操作</span>
                    </div>

                    {group.files.length > 0 ? (
                      group.files.map(file => (
                        <div
                          key={file.id}
                          className="grid grid-cols-[minmax(0,1fr)_64px] items-center px-2 py-1.5 text-xs"
                        >
                          <span className="truncate pr-2 text-gray-700" title={file.name}>{file.name}</span>
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <button
                              onClick={event => {
                                event.stopPropagation();
                                setPreviewName(file.name);
                              }}
                              className="text-primary transition-colors hover:underline"
                            >
                              预览
                            </button>
                            <button
                              onClick={event => {
                                event.stopPropagation();
                                removeFile(group.id, file.id);
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
                      className="w-[136px] rounded border border-gray-300 py-1 pl-6 pr-2 text-xs text-gray-700 transition-colors focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex-shrink-0">文件分类</span>
                  <select
                    value={fileTypeFilter}
                    onChange={event => setFileTypeFilter(event.target.value)}
                    className="w-[104px] rounded border border-gray-300 bg-white px-1.5 py-1 text-xs text-gray-700 focus:border-primary focus:outline-none"
                  >
                    {fileTypeOptions.map(option => <option key={option}>{option}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex-shrink-0">资质类型</span>
                  <select
                    value={qualificationFilter}
                    onChange={event => setQualificationFilter(event.target.value)}
                    className="w-[112px] rounded border border-gray-300 bg-white px-1.5 py-1 text-xs text-gray-700 focus:border-primary focus:outline-none"
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

                <div className="min-h-[152px] flex-1 overflow-y-auto">
                  {filteredFiles.length > 0 ? (
                    filteredFiles.map((file, index) => {
                      const checked = selectedIds.includes(file.id);
                      return (
                        <div
                          key={file.id}
                          onClick={() => toggleSelect(file.id)}
                          className={`grid cursor-pointer grid-cols-[32px_minmax(0,1fr)_56px_76px_92px_56px] items-center gap-1 border-b border-gray-50 px-3 py-2 text-xs transition-colors ${
                            checked
                              ? 'bg-[#fff7e6]'
                              : index % 2 === 1
                                ? 'bg-gray-50/60 hover:bg-gray-100/60'
                                : 'hover:bg-gray-50'
                          }`}
                        >
                          <span
                            className={`flex h-3.5 w-3.5 items-center justify-center rounded-sm border transition-colors ${
                              checked ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
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
                            className="text-primary transition-colors hover:underline"
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
                      ? 'border-primary text-primary hover:bg-[#fff7e6]'
                      : 'cursor-not-allowed border-gray-200 text-gray-300'
                  }`}
                >
                  加入本类
                </button>
                {activeGroup && (
                  <span className="ml-2 text-[11px] text-gray-400">
                    将加入「{activeGroup.title}」
                  </span>
                )}
              </div>

              {/* 上传本地文件 */}
              <div className="mt-4 flex items-center gap-3">
                <h4 className="text-lg font-bold text-gray-800">上传本地文件</h4>
                <button
                  onClick={() => localFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-primary hover:text-primary"
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
            已选择 <span className="font-bold text-primary">{selectedIds.length}</span> 个文件
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
                isMatching ? 'cursor-not-allowed bg-gray-300' : 'bg-primary hover:bg-[#e68a00]'
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
