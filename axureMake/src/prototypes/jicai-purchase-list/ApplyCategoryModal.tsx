import React, { useState } from 'react';
import { ChevronDown, FileText, Plus, X } from 'lucide-react';

/* ──────────────────────────  品类层级（原型内置数据）  ────────────────────────── */

const TAXONOMY: Record<string, string[]> = {
  钢材及金属制品: ['钢材', '金属制品'],
  模板脚手架及周材: ['模板', '脚手架', '周材'],
  机电设备: ['电气设备', '给排水设备', '暖通设备'],
  装饰装修材料: ['墙面材料', '地面材料', '吊顶材料'],
  混凝土及砂浆: ['混凝土', '砂浆'],
};

const LEVEL1_OPTIONS = Object.keys(TAXONOMY);

const ATTACH_TIP = '大小限制：50M　支持格式：.pdf .jpeg .jpg .png .xls .xlsx .doc ...';
const MAX_FILE_SIZE = 50 * 1024 * 1024;

type ApplyForm = {
  level1: string;
  level2: string;
  level3: string;
  remark: string;
};

type ApplyFormErrors = Partial<Record<'level1' | 'level2' | 'level3' | 'file', string>>;

const EMPTY_APPLY_FORM: ApplyForm = { level1: '', level2: '', level3: '', remark: '' };

type AttachFile = { name: string; size: number };

/* ──────────────────────────  弹窗  ────────────────────────── */

const ApplyCategoryModal: React.FC<{
  onClose: () => void;
  onSubmit: (form: ApplyForm) => void;
}> = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState<ApplyForm>(EMPTY_APPLY_FORM);
  const [errors, setErrors] = useState<ApplyFormErrors>({});
  const [files, setFiles] = useState<AttachFile[]>([]);

  const patch = (next: Partial<ApplyForm>) => {
    setForm((prev) => ({ ...prev, ...next }));
    setErrors((prev) => {
      const copy = { ...prev };
      (Object.keys(next) as Array<keyof ApplyForm>).forEach((k) => {
        delete copy[k];
      });
      return copy;
    });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length === 0) return;
    const tooLarge = picked.find((f) => f.size > MAX_FILE_SIZE);
    if (tooLarge) {
      setErrors((prev) => ({ ...prev, file: `附件「${tooLarge.name}」超过 50M，请重新上传` }));
      e.target.value = '';
      return;
    }
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.file;
      return copy;
    });
    setFiles((prev) => [...prev, ...picked.map((f) => ({ name: f.name, size: f.size }))]);
    e.target.value = '';
  };

  const handleSubmit = () => {
    const next: ApplyFormErrors = {};
    if (!form.level1) next.level1 = '请选择一级品类';
    if (!form.level2) next.level2 = '请选择二级品类';
    if (!form.level3.trim()) next.level3 = '请输入三级品类';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSubmit(form);
  };

  return (
    <div className="jc-mask jc-mask-top" onMouseDown={onClose}>
      <div
        className="jc-modal jc-modal-sm"
        role="dialog"
        aria-modal="true"
        aria-label="申请新增合作品类"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="jc-modal-head">
          <h3 className="jc-apply-title">申请新增合作品类</h3>
          <button type="button" className="jc-modal-x" onClick={onClose} aria-label="关闭">
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        <div className="jc-modal-body">
          <div className="jc-form-row">
            <span className="jc-form-label">
              <i>*</i>一级品类：
            </span>
            <div className="jc-form-main">
              <div className="jc-form-ctl">
                <span className={`jc-form-select${errors.level1 ? ' is-error' : ''}`}>
                  <select
                    value={form.level1}
                    className={form.level1 ? '' : 'is-empty'}
                    onChange={(e) => patch({ level1: e.target.value, level2: '' })}
                  >
                    <option value="">请选择一级品类</option>
                    {LEVEL1_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="jc-form-arrow" size={12} strokeWidth={1.8} />
                </span>
              </div>
              {errors.level1 && <p className="jc-form-err">{errors.level1}</p>}
            </div>
          </div>

          <div className="jc-form-row">
            <span className="jc-form-label">
              <i>*</i>二级品类：
            </span>
            <div className="jc-form-main">
              <div className="jc-form-ctl">
                <span className={`jc-form-select${errors.level2 ? ' is-error' : ''}`}>
                  <select
                    value={form.level2}
                    className={form.level2 ? '' : 'is-empty'}
                    disabled={!form.level1}
                    onChange={(e) => patch({ level2: e.target.value })}
                  >
                    <option value="">{form.level1 ? '请选择二级品类' : '请先选择一级品类'}</option>
                    {(TAXONOMY[form.level1] ?? []).map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="jc-form-arrow" size={12} strokeWidth={1.8} />
                </span>
              </div>
              {errors.level2 && <p className="jc-form-err">{errors.level2}</p>}
            </div>
          </div>

          <div className="jc-form-row">
            <span className="jc-form-label">
              <i>*</i>三级品类：
            </span>
            <div className="jc-form-main">
              <div className="jc-form-ctl">
                <span className={`jc-form-input${errors.level3 ? ' is-error' : ''}`}>
                  <input
                    value={form.level3}
                    maxLength={50}
                    placeholder="请输入三级品类"
                    onChange={(e) => patch({ level3: e.target.value })}
                  />
                </span>
              </div>
              {errors.level3 && <p className="jc-form-err">{errors.level3}</p>}
            </div>
          </div>

          <div className="jc-form-row">
            <span className="jc-form-label">备注：</span>
            <div className="jc-form-main">
              <div className="jc-form-ctl">
                <span className="jc-form-input">
                  <input
                    value={form.remark}
                    maxLength={200}
                    placeholder="请输入备注"
                    onChange={(e) => patch({ remark: e.target.value })}
                  />
                </span>
              </div>
            </div>
          </div>

          <div className="jc-form-row is-top">
            <span className="jc-form-label">附件：</span>
            <div className="jc-form-main">
              <p className="jc-form-hint">{ATTACH_TIP}</p>
              {files.length > 0 && (
                <div className="jc-form-files">
                  {files.map((f, i) => (
                    <span className="jc-file-chip" key={`${f.name}-${i}`}>
                      <FileText size={13} strokeWidth={1.7} />
                      <span className="jc-file-name">{f.name}</span>
                      <em>{(f.size / 1024).toFixed(0)}KB</em>
                      <button
                        type="button"
                        aria-label="移除附件"
                        onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      >
                        <X size={12} strokeWidth={2} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <label className="jc-file-add">
                <Plus size={13} strokeWidth={2} />
                添加附件
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpeg,.jpg,.png,.xls,.xlsx,.doc,.docx"
                  onChange={handleFile}
                />
              </label>
              {errors.file && <p className="jc-form-err">{errors.file}</p>}
            </div>
          </div>

          <p className="jc-apply-note">提交后可在【我的任务】中查看进展情况</p>
        </div>

        <div className="jc-modal-foot">
          <button type="button" className="jc-btn" onClick={onClose}>
            取消
          </button>
          <button type="button" className="jc-btn jc-btn-primary" onClick={handleSubmit}>
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplyCategoryModal;
