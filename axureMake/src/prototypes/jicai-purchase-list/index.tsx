import React, { useEffect, useMemo, useState } from 'react';
import {
  House,
  ShoppingCart,
  Store,
  History,
  Gavel,
  Briefcase,
  ShoppingBag,
  FileText,
  Monitor,
  ShieldCheck,
  IdCard,
  ClipboardList,
  Settings,
  Folder,
  UserCheck,
  RefreshCcw,
  BookOpen,
  Truck,
  Menu,
  Ellipsis,
  Search,
  ChevronDown,
  ChevronUp,
  Star,
  Download,
  CircleQuestionMark,
  Bell,
  Building2,
  Send,
  Repeat,
  CircleCheck,
} from 'lucide-react';
import logo from '../../../assets/media/集采工作台logo图标.png';
import OpenPurchaseModal, {
  EMPTY_PURCHASE_FORM,
  type PurchaseForm,
  type PurchaseFormErrors,
  type PurchaseMethodKey,
} from './OpenPurchaseModal';
import SmartRecommendDrawer from './SmartRecommendDrawer';
import CoopRecommendDrawer from './CoopRecommendDrawer';
import './style.css';

/* ──────────────────────────  静态数据  ────────────────────────── */

type Row = {
  key: string;
  status: string;
  code: string;
  name: string;
  toolCount: number;
  org: string;
  project: string;
  region: string;
  orgForm: string;
  buyWay: string;
  tags?: Array<'qi' | 'dot'>;
  contractFile?: string;
};

const ROWS: Row[] = [
  {
    key: 'r1',
    status: '采购任务编制中',
    code: 'cscsec20261106000000195',
    name: '基础信息审批',
    toolCount: 1,
    org: '中国建筑股份有限公司',
    project: '集中采购',
    region: '全国',
    orgForm: '集中采购',
    buyWay: '竞价采购',
  },
  {
    key: 'r2',
    status: '采购任务审批通过',
    code: 'cscsec202611050000021364',
    name: '区域',
    toolCount: 1,
    org: '中国建筑股份有限公司',
    project: '集中采购',
    region: '全国',
    orgForm: '集中采购',
    buyWay: '竞价采购',
  },
  {
    key: 'r3',
    status: '采购文件编制中',
    code: 'cscsec202611040000003485',
    name: '直接采购回退',
    toolCount: 0,
    org: '中国建筑第一工程局有限公司',
    project: '测试项目10196',
    region: '四川省',
    orgForm: '分散采购',
    buyWay: '直接采购',
  },
  {
    key: 'r4',
    status: '报价中',
    code: 'cscsec202611040000003413',
    name: '直接采购回退',
    toolCount: 0,
    org: '中国建筑第一工程局有限公司',
    project: '测试项目10196',
    region: '四川省',
    orgForm: '分散采购',
    buyWay: '直接采购',
  },
  {
    key: 'r5',
    status: '采购任务编制中',
    code: 'cscsec202611040000023479',
    name: '测试基础信息审批',
    toolCount: 0,
    org: '中国建筑第一工程局有限公司',
    project: '测试项目10196',
    region: '四川省',
    orgForm: '分散采购',
    buyWay: '竞价采购',
  },
  {
    key: 'r6',
    status: '采购(资格预审)公告待发布',
    code: 'cscsec202611040000042160',
    name: '测试公告',
    toolCount: 1,
    org: '中国建筑第一工程局有限公司',
    project: '测试项目10196',
    region: '四川省',
    orgForm: '分散采购',
    buyWay: '竞价采购',
  },
  {
    key: 'r7',
    status: '采购文件待发布',
    code: 'cscsec202611040000040280',
    name: '测试',
    toolCount: 2,
    org: '中国建筑第一工程局有限公司',
    project: '测试项目10196',
    region: '四川省',
    orgForm: '分散采购',
    buyWay: '竞价采购',
  },
  {
    key: 'r8',
    status: '采购文件编制中',
    code: 'cscsec202611030000020364',
    name: '协作人04',
    toolCount: 1,
    org: '中国建筑第二工程局有限公司',
    project: '集中采购',
    region: '全国',
    orgForm: '集中采购',
    buyWay: '竞价采购',
    tags: ['qi'],
  },
  {
    key: 'r9',
    status: '成交审批不通过',
    code: 'cscsec202611030000000312',
    name: '协作人03',
    toolCount: 3,
    org: '中国建筑第二工程局有限公司',
    project: '测试项目91629',
    region: '四川省',
    orgForm: '分散采购',
    buyWay: '竞价采购',
    tags: ['qi', 'dot'],
    contractFile: 'dx测试模板分类01',
  },
  {
    key: 'r10',
    status: '采购任务编制中',
    code: 'cscsec202611020000041146',
    name: 'test',
    toolCount: 0,
    org: '中国建筑股份有限公司',
    project: '测试项目91629',
    region: '四川省',
    orgForm: '分散采购',
    buyWay: '竞价采购',
  },
];

const MODEL_ITEMS = ['采购公告', '采购文件', '报价文件', '采购合同文件', '执行合同文件', '框架协议', '成交报告'];

const RAIL_ITEMS: Array<{ key: string; label: string; icon: React.ElementType }> = [
  { key: 'home', label: '首页', icon: House },
  { key: 'purchase', label: '采购', icon: ShoppingCart },
  { key: 'supplier', label: '分供', icon: Store },
  { key: 'plan', label: '采购', icon: History },
  { key: 'bid', label: '招标', icon: Gavel },
  { key: 'project', label: '工程', icon: Briefcase },
  { key: 'joint', label: '联采', icon: ShoppingBag },
  { key: 'contract', label: '合同', icon: FileText },
  { key: 'complain', label: '投诉', icon: Monitor },
  { key: 'settle', label: '清欠', icon: ShieldCheck },
  { key: 'perform', label: '履约', icon: IdCard },
  { key: 'accept', label: '验收', icon: ClipboardList },
  { key: 'config', label: '配置', icon: Settings },
  { key: 'material', label: '物料', icon: Folder },
  { key: 'approve', label: '审批', icon: UserCheck },
  { key: 'data', label: '数据', icon: RefreshCcw },
  { key: 'template', label: '范本', icon: BookOpen },
  { key: 'logistics', label: '物流', icon: Truck },
];

const STATUS_OPTIONS = ['全部', '采购任务编制中', '采购任务审批通过', '采购文件编制中', '采购文件待发布', '报价中', '成交审批不通过'];
const ORG_FORM_OPTIONS = ['全部', '集中采购', '分散采购'];
const BUY_WAY_OPTIONS = ['全部', '竞价采购', '直接采购'];
const REGION_OPTIONS = ['全部', '全国', '四川省'];
const ORG_OPTIONS = ['全部', '中国建筑股份有限公司', '中国建筑第一工程局有限公司', '中国建筑第二工程局有限公司'];

const METHOD_LABEL: Record<PurchaseMethodKey, string> = {
  xunbi: '询比采购',
  jingjia: '竞价采购',
  tanpan: '谈判采购',
  zhijie: '直接采购',
};

/* ──────────────────────────  小组件  ────────────────────────── */

const Checkbox: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}> = ({ checked, onChange, label }) => (
  <label className={`jc-check${checked ? ' is-checked' : ''}`}>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <span className="jc-check-box" aria-hidden />
    {label}
  </label>
);

const Select: React.FC<{
  value: string;
  options: string[];
  onChange: (v: string) => void;
  width?: number | string;
}> = ({ value, options, onChange, width }) => (
  <span className={`jc-select${value ? '' : ' is-empty'}`} style={{ width }}>
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
    <ChevronDown className="jc-select-arrow" size={12} strokeWidth={1.6} />
  </span>
);

/* ──────────────────────────  页面  ────────────────────────── */

const JicaiPurchaseList: React.FC = () => {
  const [railActive, setRailActive] = useState('bid');
  const [filtersOpen, setFiltersOpen] = useState(true);

  const [org, setOrg] = useState('全部');
  const [includeSub, setIncludeSub] = useState(true);
  const [code, setCode] = useState('');
  const [codeExact, setCodeExact] = useState(false);
  const [purchaseName, setPurchaseName] = useState('');
  const [status, setStatus] = useState('全部');
  const [includeRemoved, setIncludeRemoved] = useState(true);
  const [orgForm, setOrgForm] = useState('全部');
  const [buyWay, setBuyWay] = useState('全部');
  const [coopCategory, setCoopCategory] = useState('全部');
  const [purchaseCategory, setPurchaseCategory] = useState('全部');
  const [agent, setAgent] = useState('');
  const [selfAgent, setSelfAgent] = useState(true);
  const [starter, setStarter] = useState('');
  const [selfStarter, setSelfStarter] = useState(false);
  const [projectName, setProjectName] = useState('');

  const [page, setPage] = useState(1);

  /* 开启采购弹窗 */
  const [modalOpen, setModalOpen] = useState(false);
  const [drawer, setDrawer] = useState<'category' | 'coop' | null>(null);
  const [form, setForm] = useState<PurchaseForm>(EMPTY_PURCHASE_FORM);
  const [formErrors, setFormErrors] = useState<PurchaseFormErrors>({});
  const [flashCoop, setFlashCoop] = useState(false);
  const [flashCategory, setFlashCategory] = useState(false);
  const [toast, setToast] = useState('');
  const [createdRows, setCreatedRows] = useState<Row[]>([]);

  /* 查询条件（点「查询」后才生效，符合原系统交互） */
  const [applied, setApplied] = useState({ org, status, orgForm, buyWay, name: '', code: '', project: '' });

  const rows = useMemo(() => {
    return [...createdRows, ...ROWS].filter((r) => {
      if (applied.org !== '全部' && r.org !== applied.org) return false;
      if (applied.status !== '全部' && r.status !== applied.status) return false;
      if (applied.orgForm !== '全部' && r.orgForm !== applied.orgForm) return false;
      if (applied.buyWay !== '全部' && r.buyWay !== applied.buyWay) return false;
      if (applied.name && !r.name.includes(applied.name)) return false;
      if (applied.project && !r.project.includes(applied.project)) return false;
      if (applied.code) {
        const ok = applied.code
          ? r.code.includes(applied.code.trim()) || r.code.toUpperCase().includes(applied.code.trim().toUpperCase())
          : true;
        if (!ok) return false;
      }
      return true;
    });
  }, [applied, createdRows]);

  const handleSearch = () =>
    setApplied({ org, status, orgForm, buyWay, name: purchaseName.trim(), code, project: projectName.trim() });

  const handleReset = () => {
    setOrg('全部');
    setIncludeSub(true);
    setCode('');
    setCodeExact(false);
    setPurchaseName('');
    setStatus('全部');
    setIncludeRemoved(true);
    setOrgForm('全部');
    setBuyWay('全部');
    setCoopCategory('全部');
    setPurchaseCategory('全部');
    setAgent('');
    setSelfAgent(true);
    setStarter('');
    setSelfStarter(false);
    setProjectName('');
    setApplied({ org: '全部', status: '全部', orgForm: '全部', buyWay: '全部', name: '', code: '', project: '' });
    setPage(1);
  };

  /* ── 开启采购：弹窗 + 智能推荐浮窗 ── */

  const openPurchaseModal = () => {
    setForm(EMPTY_PURCHASE_FORM);
    setFormErrors({});
    setDrawer(null);
    setModalOpen(true);
  };

  const closePurchaseModal = () => {
    setDrawer(null);
    setModalOpen(false);
  };

  const patchForm = (patch: Partial<PurchaseForm>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setFormErrors((prev) => {
      const next = { ...prev };
      (Object.keys(patch) as Array<keyof PurchaseForm>).forEach((k) => {
        delete next[k];
      });
      return next;
    });
  };

  const applyRecommendedCategory = (category: string) => {
    setForm((prev) => ({ ...prev, category }));
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.category;
      return next;
    });
    setDrawer(null);
    setFlashCategory(true);
    setToast(`已采用推荐采购品类：${category}`);
  };

  const applyRecommendedCoop = (coop: string) => {
    setForm((prev) => ({ ...prev, coop }));
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.coop;
      return next;
    });
    setDrawer(null);
    setFlashCoop(true);
    setToast(`已采用推荐合作品类：${coop}`);
  };

  const submitPurchase = () => {
    const errs: PurchaseFormErrors = {};
    if (!form.coop) errs.coop = '请选择合作品类';
    if (!form.category) errs.category = '请选择采购品类';
    if (!form.org) errs.org = '请选择组织机构';
    if (!form.orgForm) errs.orgForm = '请选择组织形式';
    if (!form.method) errs.method = '请选择采购方式';
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const seq = String(900 + createdRows.length * 7);
    const newRow: Row = {
      key: `created-${createdRows.length + 1}`,
      status: '采购任务编制中',
      code: `cscsec2026110600000${seq}`,
      name: `${form.category}采购`,
      toolCount: 0,
      org: form.org,
      project: '集中采购',
      region: '全国',
      orgForm: form.orgForm,
      buyWay: METHOD_LABEL[form.method as PurchaseMethodKey],
    };
    setCreatedRows((prev) => [newRow, ...prev]);
    setModalOpen(false);
    setDrawer(null);
    setToast(`采购已开启：${newRow.code}`);
  };

  /* 提示条自动消失 */
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  /* Esc 优先关浮窗，再关弹窗 */
  useEffect(() => {
    if (!modalOpen) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (drawer) setDrawer(null);
      else setModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen, drawer]);

  useEffect(() => {
    if (!flashCategory) return undefined;
    const timer = window.setTimeout(() => setFlashCategory(false), 1600);
    return () => window.clearTimeout(timer);
  }, [flashCategory]);

  useEffect(() => {
    if (!flashCoop) return undefined;
    const timer = window.setTimeout(() => setFlashCoop(false), 1600);
    return () => window.clearTimeout(timer);
  }, [flashCoop]);

  return (
    <div className="jc-app">
      {/* ── 顶部栏 ── */}
      <header className="jc-topbar">
        <div className="jc-brand">
          <img src={logo} alt="集采工作台" />
        </div>

        <div className="jc-topbar-right">
          <div className="jc-org-select">
            <select defaultValue="中国建筑股份有限公司">
              <option>中国建筑股份有限公司</option>
              <option>中国建筑第一工程局有限公司</option>
              <option>中国建筑第二工程局有限公司</option>
            </select>
            <ChevronDown size={12} strokeWidth={1.6} />
          </div>

          <div className="jc-menu-search">
            <input placeholder="支持通过关键字搜索菜单" />
            <Search size={13} strokeWidth={1.8} />
          </div>

          <div className="jc-lang">
            <span className="jc-flag" aria-hidden />
            简体中文
            <ChevronDown size={12} strokeWidth={1.6} />
          </div>

          <nav className="jc-topnav">
            <span className="jc-topnav-item">
              <Building2 size={15} strokeWidth={1.7} />
              云筑首页
            </span>
            <span className="jc-topnav-item">
              <ShoppingBag size={15} strokeWidth={1.7} />
              寻源工作台
            </span>
            <span className="jc-topnav-item">
              <Send size={15} strokeWidth={1.7} />
              发布招募需求
            </span>
            <span className="jc-topnav-item">
              <Repeat size={15} strokeWidth={1.7} />
              切换新版
            </span>
          </nav>

          <div className="jc-topicons">
            <Star size={16} strokeWidth={1.7} />
            <Download size={16} strokeWidth={1.7} />
            <CircleQuestionMark size={16} strokeWidth={1.7} />
            <span className="jc-bell">
              <Bell size={16} strokeWidth={1.7} />
              <em>99+</em>
            </span>
          </div>

          <div className="jc-user">
            <span className="jc-avatar" aria-hidden>
              <svg viewBox="0 0 24 24" width="11" height="11">
                <circle cx="12" cy="8.4" r="3.4" fill="#4b93d6" />
                <path d="M4.4 20.4c0-4 3.4-6.3 7.6-6.3s7.6 2.3 7.6 6.3z" fill="#4b93d6" />
              </svg>
            </span>
            奥巴马
            <ChevronDown size={12} strokeWidth={1.6} />
          </div>
        </div>
      </header>

      <div className="jc-body">
        {/* ── 侧边导航（收起态） ── */}
        <aside className="jc-rail">
          <div className="jc-rail-list">
            {RAIL_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`jc-rail-item${railActive === item.key ? ' is-active' : ''}`}
                  onClick={() => setRailActive(item.key)}
                >
                  <Icon size={16} strokeWidth={1.8} />
                  <span>
                    {item.label.split('').map((ch, i) => (
                      <i key={i}>{ch}</i>
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="jc-rail-more">
            <Ellipsis size={14} strokeWidth={2} className="jc-rail-dots" />
            <Menu size={16} strokeWidth={1.8} />
          </div>
        </aside>

        {/* ── 主内容 ── */}
        <main className="jc-main">
          {/* 筛选区 */}
          <section className="jc-filter">
            <div className={`jc-filter-grid${filtersOpen ? '' : ' is-collapsed'}`}>
              <div className="jc-field">
                <span className="jc-label">组织机构</span>
                <Select value={org} options={ORG_OPTIONS} onChange={setOrg} width={148} />
                <Checkbox checked={includeSub} onChange={setIncludeSub} label="包含下级" />
              </div>
              <div className="jc-field">
                <span className="jc-label">采购编号</span>
                <span className="jc-input" style={{ width: 178 }}>
                  <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="请输入" />
                </span>
                <Checkbox checked={codeExact} onChange={setCodeExact} label="精确搜索" />
              </div>
              <div className="jc-field">
                <span className="jc-label">采购名称</span>
                <span className="jc-input" style={{ width: 200 }}>
                  <input
                    value={purchaseName}
                    onChange={(e) => setPurchaseName(e.target.value)}
                    placeholder="请输入"
                  />
                </span>
                <em className="jc-field-spacer" />
              </div>
              <div className="jc-field">
                <span className="jc-label">采购状态</span>
                <Select value={status} options={STATUS_OPTIONS} onChange={setStatus} width={132} />
                <Checkbox checked={includeRemoved} onChange={setIncludeRemoved} label="包含已废除" />
              </div>

              <div className="jc-field jc-row-2">
                <span className="jc-label">组织形式</span>
                <Select value={orgForm} options={ORG_FORM_OPTIONS} onChange={setOrgForm} width={148} />
              </div>
              <div className="jc-field jc-row-2">
                <span className="jc-label">采购方式</span>
                <Select value={buyWay} options={BUY_WAY_OPTIONS} onChange={setBuyWay} width={148} />
              </div>
              <div className="jc-field jc-row-2">
                <span className="jc-label">合作品类</span>
                <Select value={coopCategory} options={['全部']} onChange={setCoopCategory} width={148} />
              </div>
              <div className="jc-field jc-row-2">
                <span className="jc-label">采购品类</span>
                <Select value={purchaseCategory} options={['全部']} onChange={setPurchaseCategory} width={132} />
              </div>

              <div className="jc-field jc-row-3">
                <span className="jc-label">经办人</span>
                <span className="jc-input" style={{ width: 148 }}>
                  <input value={agent} onChange={(e) => setAgent(e.target.value)} placeholder="请输入" />
                </span>
                <Checkbox checked={selfAgent} onChange={setSelfAgent} label="本人经办" />
              </div>
              <div className="jc-field jc-row-3">
                <span className="jc-label">发起人</span>
                <span className="jc-input" style={{ width: 148 }}>
                  <input value={starter} onChange={(e) => setStarter(e.target.value)} placeholder="请输入" />
                </span>
                <Checkbox checked={selfStarter} onChange={setSelfStarter} label="本人发起" />
              </div>
              <div className="jc-field jc-row-3">
                <span className="jc-label">使用项目名称</span>
                <span className="jc-input" style={{ width: 200 }}>
                  <input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="请输入"
                  />
                </span>
                <em className="jc-field-spacer" />
              </div>
              <div className="jc-field jc-field-actions">
                <button type="button" className="jc-btn jc-btn-primary" onClick={handleSearch}>
                  查询
                </button>
                <button type="button" className="jc-btn" onClick={handleReset}>
                  重置
                </button>
                <button
                  type="button"
                  className="jc-btn jc-btn-text"
                  onClick={() => setFiltersOpen((v) => !v)}
                >
                  筛选条件
                  {filtersOpen ? <ChevronUp size={12} strokeWidth={2} /> : <ChevronDown size={12} strokeWidth={2} />}
                </button>
              </div>
            </div>
          </section>

          {/* 列表区 */}
          <section className="jc-panel">
            <div className="jc-toolbar">
              <div className="jc-toolbar-left">
                <button type="button" className="jc-btn jc-btn-primary" onClick={openPurchaseModal}>
                  开启采购
                </button>
                <button type="button" className="jc-btn jc-btn-primary">
                  开启海外采购
                </button>
                <button type="button" className="jc-btn jc-btn-outline">
                  导出
                </button>
                <button type="button" className="jc-icon-btn" aria-label="列表设置">
                  <Settings size={15} strokeWidth={1.8} />
                </button>
              </div>
              <div className="jc-toolbar-right">
                本页：{rows.length}条&nbsp;&nbsp;总计：1177条
              </div>
            </div>

            <div className="jc-table-wrap">
              <table className="jc-table">
                <colgroup>
                  <col style={{ width: 120 }} />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 116 }} />
                  <col style={{ width: 104 }} />
                  <col style={{ width: 214 }} />
                  <col style={{ width: 150 }} />
                  <col style={{ width: 104 }} />
                  <col style={{ width: 70 }} />
                  <col style={{ width: 84 }} />
                  <col />
                  <col style={{ width: 80 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>状态</th>
                    <th>采购编号</th>
                    <th>采购名称</th>
                    <th className="jc-th-tool">智能工具使用数</th>
                    <th>范本情况</th>
                    <th>组织机构</th>
                    <th>使用项目</th>
                    <th>区域</th>
                    <th>组织形式</th>
                    <th>采购方式</th>
                    <th className="jc-th-op">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.key}>
                      <td className="jc-td-status">{r.status}</td>
                      <td className="jc-td-code">
                        {r.tags?.map((t) =>
                          t === 'qi' ? (
                            <span key={t} className="jc-tag-qi">
                              企
                            </span>
                          ) : (
                            <span key={t} className="jc-tag-dot" />
                          ),
                        )}
                        <a href="#" onClick={(e) => e.preventDefault()}>
                          {r.code}
                        </a>
                      </td>
                      <td>{r.name}</td>
                      <td className="jc-td-num">{r.toolCount}</td>
                      <td className="jc-td-model">
                        {MODEL_ITEMS.map((item) => (
                          <div key={item}>
                            {item}：
                            {item === '采购合同文件' && r.contractFile ? (
                              <span className="jc-model-value">{r.contractFile}</span>
                            ) : (
                              <span className="jc-model-empty">--</span>
                            )}
                          </div>
                        ))}
                      </td>
                      <td>{r.org}</td>
                      <td>{r.project}</td>
                      <td>{r.region}</td>
                      <td>{r.orgForm}</td>
                      <td>{r.buyWay}</td>
                      <td className="jc-td-op">
                        <a href="#" onClick={(e) => e.preventDefault()}>
                          查看
                        </a>
                        <a href="#" onClick={(e) => e.preventDefault()}>
                          更多
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="jc-pager">
              <span className="jc-pager-total">第 1-{rows.length} 条/总共 1177 条</span>
              <button type="button" className="jc-page-btn jc-page-prev" aria-label="上一页">
                <ChevronDown size={12} strokeWidth={2} />
              </button>
              {[1, 2, 3, 4, 5].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`jc-page-btn${page === p ? ' is-current' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <span className="jc-page-ellipsis">···</span>
              <button type="button" className="jc-page-btn" onClick={() => setPage(118)}>
                118
              </button>
              <button type="button" className="jc-page-btn jc-page-next" aria-label="下一页">
                <ChevronDown size={12} strokeWidth={2} />
              </button>
              <span className="jc-pager-size">
                10 条/页
                <ChevronDown size={12} strokeWidth={1.6} />
              </span>
              <span className="jc-pager-jump">
                跳至
                <input defaultValue="" />
                页
              </span>
            </div>
          </section>
        </main>
      </div>

      {/* ── 开启采购弹窗 ── */}
      {modalOpen && (
        <OpenPurchaseModal
          form={form}
          errors={formErrors}
          flashCoop={flashCoop}
          flashCategory={flashCategory}
          onChange={patchForm}
          onClose={closePurchaseModal}
          onMaskClick={() => (drawer ? setDrawer(null) : setModalOpen(false))}
          onSubmit={submitPurchase}
          onSmartRecommendCoop={() => setDrawer('coop')}
          onSmartRecommend={() => setDrawer('category')}
        />
      )}

      {/* ── 智能推荐品类浮窗 ── */}
      {modalOpen && drawer === 'category' && (
        <SmartRecommendDrawer onClose={() => setDrawer(null)} onApply={applyRecommendedCategory} />
      )}

      {/* ── 智能推荐合作品类浮窗 ── */}
      {modalOpen && drawer === 'coop' && (
        <CoopRecommendDrawer
          onClose={() => setDrawer(null)}
          onApply={applyRecommendedCoop}
          onApplyNewCoop={() => setToast('前往「合作品类库」申请添加合作品类（示意跳转）')}
        />
      )}

      {/* ── 轻提示 ── */}
      {toast && (
        <div className="jc-toast" role="status">
          <CircleCheck size={15} strokeWidth={2} className="jc-toast-icon" />
          {toast}
        </div>
      )}
    </div>
  );
};

export default JicaiPurchaseList;
