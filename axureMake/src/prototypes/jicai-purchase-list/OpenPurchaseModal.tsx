import React from 'react';
import { ChevronDown, X } from 'lucide-react';

/* ──────────────────────────  类型  ────────────────────────── */

export type PurchaseMethodKey = 'xunbi' | 'jingjia' | 'tanpan' | 'zhijie';

export type PurchaseForm = {
  coop: string;
  category: string;
  org: string;
  orgForm: string;
  method: PurchaseMethodKey | '';
};

export type PurchaseFormErrors = Partial<Record<keyof PurchaseForm, string>>;

export const EMPTY_PURCHASE_FORM: PurchaseForm = {
  coop: '',
  category: '',
  org: '',
  orgForm: '',
  method: '',
};

export const COOP_OPTIONS = ['混凝土及砂浆', '钢材及金属制品', '模板脚手架及周材', '机电设备', '装饰装修材料'];
const CATEGORY_OPTIONS = ['预拌混凝土', '混凝土外加剂', '钢筋', '模板', '电缆'];
const ORG_OPTIONS = ['中国建筑股份有限公司', '中国建筑第一工程局有限公司', '中国建筑第二工程局有限公司'];
const ORG_FORM_OPTIONS = ['集中采购', '分散采购', '区域联采'];

const METHODS: Array<{ key: PurchaseMethodKey; chip: string; title: string; desc: string }> = [
  {
    key: 'xunbi',
    chip: '询比',
    title: '询比采购',
    desc: '3家及以上的分供商每一次报价不得更改价格，经评审确定成交分供商',
  },
  {
    key: 'jingjia',
    chip: '竞价',
    title: '竞价采购',
    desc: '3家及以上的分供商在规定时间内多次公开报价，按最终报价确定成交分供商',
  },
  {
    key: 'tanpan',
    chip: '谈判',
    title: '谈判采购',
    desc: '同时和2家及以上的分供商进行一轮或多轮谈判，经评审确定成交分供商',
  },
  {
    key: 'zhijie',
    chip: '直接',
    title: '直接采购',
    desc: '与指定的分供商进行一轮或多轮协商，根据协商情况确定成交分供商',
  },
];

/* ──────────────────────────  小组件  ────────────────────────── */

const FormSelect: React.FC<{
  value: string;
  placeholder: string;
  options: string[];
  error?: boolean;
  flash?: boolean;
  onChange: (v: string) => void;
}> = ({ value, placeholder, options, error, flash, onChange }) => (
  <span className={`jc-form-select${error ? ' is-error' : ''}${flash ? ' is-flash' : ''}`}>
    <select
      value={value}
      className={value ? '' : 'is-empty'}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
    <ChevronDown className="jc-form-arrow" size={12} strokeWidth={1.8} />
  </span>
);

/* ──────────────────────────  弹窗  ────────────────────────── */

const OpenPurchaseModal: React.FC<{
  form: PurchaseForm;
  errors: PurchaseFormErrors;
  flashCoop: boolean;
  flashCategory: boolean;
  onChange: (patch: Partial<PurchaseForm>) => void;
  onClose: () => void;
  onMaskClick: () => void;
  onSubmit: () => void;
  onSmartRecommendCoop: () => void;
  onSmartRecommend: () => void;
}> = ({
  form,
  errors,
  flashCoop,
  flashCategory,
  onChange,
  onClose,
  onMaskClick,
  onSubmit,
  onSmartRecommendCoop,
  onSmartRecommend,
}) => (
  <div className="jc-mask" onMouseDown={onMaskClick}>
    <div
      className="jc-modal"
      role="dialog"
      aria-modal="true"
      aria-label="开启采购"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="jc-modal-head">
        <h3>开启采购</h3>
        <button type="button" className="jc-modal-x" onClick={onClose} aria-label="关闭">
          <X size={16} strokeWidth={1.8} />
        </button>
      </div>

      <div className="jc-modal-body">
        <div className="jc-form-row">
          <span className="jc-form-label">
            <i>*</i>合作品类：
          </span>
          <div className="jc-form-main">
            <div className="jc-form-ctl">
              <FormSelect
                value={form.coop}
                placeholder="请选择合作品类"
                options={COOP_OPTIONS}
                error={!!errors.coop}
                flash={flashCoop}
                onChange={(v) => onChange({ coop: v })}
              />
              <button type="button" className="jc-form-smart" onClick={onSmartRecommendCoop}>
                智能推荐
              </button>
            </div>
            {errors.coop && <p className="jc-form-err">{errors.coop}</p>}
          </div>
        </div>

        <div className="jc-form-row">
          <span className="jc-form-label">
            <i>*</i>采购品类：
          </span>
          <div className="jc-form-main">
            <div className="jc-form-ctl">
              <FormSelect
                value={form.category}
                placeholder="请选择采购品类"
                options={CATEGORY_OPTIONS}
                error={!!errors.category}
                flash={flashCategory}
                onChange={(v) => onChange({ category: v })}
              />
              <button type="button" className="jc-form-smart" onClick={onSmartRecommend}>
                智能推荐
              </button>
            </div>
            {errors.category && <p className="jc-form-err">{errors.category}</p>}
          </div>
        </div>

        <div className="jc-form-row">
          <span className="jc-form-label">
            <i>*</i>组织机构：
          </span>
          <div className="jc-form-main">
            <div className="jc-form-ctl">
              <FormSelect
                value={form.org}
                placeholder="请选择组织机构"
                options={ORG_OPTIONS}
                error={!!errors.org}
                onChange={(v) => onChange({ org: v })}
              />
            </div>
            {errors.org && <p className="jc-form-err">{errors.org}</p>}
          </div>
        </div>

        <div className="jc-form-row">
          <span className="jc-form-label">
            <i>*</i>组织形式：
          </span>
          <div className="jc-form-main">
            <div className="jc-form-ctl">
              <FormSelect
                value={form.orgForm}
                placeholder="请选择组织形式"
                options={ORG_FORM_OPTIONS}
                error={!!errors.orgForm}
                onChange={(v) => onChange({ orgForm: v })}
              />
            </div>
            {errors.orgForm && <p className="jc-form-err">{errors.orgForm}</p>}
          </div>
        </div>

        <div className="jc-form-row is-top">
          <span className="jc-form-label">
            <i>*</i>采购方式：
          </span>
          <div className="jc-form-main">
            <div className={`jc-method-grid${errors.method ? ' is-error' : ''}`}>
              {METHODS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  className={`jc-method${form.method === m.key ? ' is-active' : ''}`}
                  onClick={() => onChange({ method: m.key })}
                >
                  <span className="jc-method-head">
                    <span className="jc-method-chip">{m.chip}</span>
                    <span className="jc-method-title">{m.title}</span>
                  </span>
                  <span className="jc-method-desc">{m.desc}</span>
                </button>
              ))}
            </div>
            {errors.method && <p className="jc-form-err">{errors.method}</p>}
          </div>
        </div>
      </div>

      <div className="jc-modal-foot">
        <button type="button" className="jc-btn" onClick={onClose}>
          关闭
        </button>
        <button type="button" className="jc-btn jc-btn-primary" onClick={onSubmit}>
          开启采购
        </button>
      </div>
    </div>
  </div>
);

export default OpenPurchaseModal;
