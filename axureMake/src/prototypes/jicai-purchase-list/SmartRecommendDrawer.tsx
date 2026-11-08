import React, { useState } from 'react';
import { FileText, Plus, X } from 'lucide-react';

/** 把用户填写的清单文本/附件名，映射到一条推荐品类（纯本地演示，不调模型） */
export function recommendCategory(text: string, fileName: string): string {
  const raw = `${text} ${fileName}`;
  if (/钢筋|钢材|钢板|型钢|螺纹钢|钢构/.test(raw)) return '钢筋';
  if (/模板|木方|脚手架|周材/.test(raw)) return '模板';
  if (/电缆|配电箱|桥架|母线/.test(raw)) return '电缆';
  if (/外加剂|减水剂|膨胀剂|早强|抗渗|细石/.test(raw)) return '混凝土外加剂';
  if (/混凝土|砂浆|砼/.test(raw)) return '预拌混凝土';
  return '预拌混凝土';
}

const SmartRecommendDrawer: React.FC<{
  onClose: () => void;
  onApply: (category: string) => void;
}> = ({ onClose, onApply }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile({ name: f.name, size: f.size });
    setError('');
    e.target.value = '';
  };

  const handleRecommend = () => {
    if (!file && !text.trim()) {
      setError('请先填写采购清单，或上传清单附件');
      return;
    }
    setError('');
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      onApply(recommendCategory(text, file?.name ?? ''));
    }, 1100);
  };

  return (
    <aside className="jc-drawer" role="dialog" aria-modal="true" aria-label="智能推荐品类">
      <div className="jc-drawer-head">
        <button type="button" className="jc-drawer-x" onClick={onClose} aria-label="关闭">
          <X size={16} strokeWidth={1.8} />
        </button>
        <h3>智能推荐品类</h3>
      </div>

      <div className="jc-drawer-body">
        <div className="jc-drawer-tip">通过填写采购清单或清单附件 系统智能推荐合适的采购品类</div>

        <div className="jc-drawer-row">
          <div className="jc-drawer-label">
            <span>
              清单附件<span className="jc-colon">：</span>
            </span>
            <em>（可选）</em>
          </div>
          <div className="jc-drawer-ctl">
            <p className="jc-drawer-hint">
              大小限制：500M<span className="jc-hint-gap" />
              支持格式：.xls.xlsx.pdf
            </p>
            {file && (
              <span className="jc-file-chip">
                <FileText size={13} strokeWidth={1.7} />
                <span className="jc-file-name">{file.name}</span>
                <em>{(file.size / 1024).toFixed(0)}KB</em>
                <button type="button" onClick={() => setFile(null)} aria-label="移除附件">
                  <X size={12} strokeWidth={2} />
                </button>
              </span>
            )}
            <label className="jc-file-add">
              <Plus size={13} strokeWidth={2} />
              添加附件
              <input type="file" accept=".xls,.xlsx,.pdf" onChange={handleFile} />
            </label>
          </div>
        </div>

        <div className="jc-drawer-row">
          <div className="jc-drawer-label">
            <span>
              采购清单<span className="jc-colon">：</span>
            </span>
            <em>（可选）</em>
          </div>
          <div className="jc-drawer-ctl">
            <textarea
              className="jc-drawer-textarea"
              maxLength={5000}
              value={text}
              placeholder="请输入本次采购的物料，多个用、隔开。示例：预拌混凝土【C15】、混凝土外加剂【细石】、混凝土外加剂【微膨胀】、混凝土外加剂【早强】、混凝土外加剂【抗渗】"
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError('');
              }}
            />
            <div className="jc-drawer-count">
              {text.length} / 5000
            </div>
          </div>
        </div>

        {error && <p className="jc-drawer-err">{error}</p>}

        <div className="jc-drawer-actions">
          <button
            type="button"
            className="jc-btn jc-btn-primary jc-btn-recommend"
            onClick={handleRecommend}
            disabled={loading}
          >
            {loading ? '推荐中…' : '立即推荐'}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SmartRecommendDrawer;
