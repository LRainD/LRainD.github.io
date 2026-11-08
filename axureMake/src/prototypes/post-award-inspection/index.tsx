/**
 * @name 标后巡检宣传页
 * @mode axure
 *
 * 参考资料：
 * - /rules/design-guide.md
 * - /rules/development-guide.md
 * - /src/prototypes/digital-compliance-officer/spec.md（事中合规能力，用于对齐「事中 / 事后」分工）
 * - /src/prototypes/post-award-inspection/spec.md
 */

import './style.css';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'antd';
import {
  ShieldCheck,
  ShieldAlert,
  FileSignature,
  PackageSearch,
  HardHat,
  Users,
  Wallet,
  ArrowRight,
  CircleCheck,
  TriangleAlert,
  Layers,
  Sparkles,
  ChevronRight,
  X,
  Clock,
  Building2,
  Radar,
  ArrowUpRight,
  GitCompare,
  TrendingUp,
  FileSearch,
  ScanEye,
  ListChecks,
  ScanSearch,
  ClipboardCheck
} from 'lucide-react';

/* ---------------------------------- 数据 ---------------------------------- */

const heroIssues = [
  {
    id: 'staff' as const,
    label: '关键人员到岗',
    detail: '项目经理近 30 天未打卡',
    score: 92,
    risk: 'high' as const
  },
  {
    id: 'material' as const,
    label: '材料品牌降配',
    detail: '进场电缆品牌与承诺不一致',
    score: 87,
    risk: 'high' as const
  },
  {
    id: 'change' as const,
    label: '变更签证超阈值',
    detail: '累计变更 12.4%，超合同约定',
    score: 76,
    risk: 'mid' as const
  }
];

const stages = [
  {
    key: 'plan',
    index: '01',
    name: '采购策划',
    desc: '需求、预算与采购方式确定',
    tag: '规则前置'
  },
  {
    key: 'in',
    index: '02',
    name: '招标全过程',
    desc: '文件、评审、公示实时校验',
    tag: '数字合规官 · 事中'
  },
  {
    key: 'post',
    index: '03',
    name: '合同与履约',
    desc: '承诺、人员、材料、变更回溯核查',
    tag: '标后巡检 · 事后',
    active: true
  },
  {
    key: 'credit',
    index: '04',
    name: '信用沉淀',
    desc: '履约结论回写供应商档案',
    tag: '结果复用'
  }
];

const inspectItems = [
  {
    no: '01',
    icon: GitCompare,
    title: '合同与投标承诺一致性',
    desc: '中标价、工期、质保、付款条件逐条比对，识别「中标一套、签约一套」。',
    sample: '付款条件由「验收后 30 日」改为「竣工后 180 日」'
  },
  {
    no: '02',
    icon: Users,
    title: '转包与违法分包',
    desc: '合同主体、现场施工队伍、资金流向三方交叉，识别「人在现场、账在别处」。',
    sample: '现场施工班组与中标人无社保关联'
  },
  {
    no: '03',
    icon: HardHat,
    title: '关键人员到岗',
    desc: '项目经理、总监、安全员与投标文件比对，考勤、社保、变更手续三查。',
    sample: '投标承诺的项目经理 30 天未在岗'
  },
  {
    no: '04',
    icon: PackageSearch,
    title: '材料设备降配',
    desc: '品牌、规格、型号与承诺清单及进场验收单比对，识别「同型号不同档次」。',
    sample: '承诺 A 品牌电缆，进场为同名低端系列'
  },
  {
    no: '05',
    icon: FileSignature,
    title: '变更与签证合规',
    desc: '变更金额占比、审批链完整性、先干后签，识别「以变代招」。',
    sample: '累计变更 12.4%，未见审批记录'
  },
  {
    no: '06',
    icon: Wallet,
    title: '结算与支付异常',
    desc: '结算超合同、付款对象与合同主体不一致、超进度付款，识别资金风险。',
    sample: '收款账户与中标人账户不一致'
  }
];

const steps = [
  {
    no: '①',
    icon: Layers,
    title: '数据接入',
    desc: '招标与投标文件、合同、履约与验收资料、财务支付流水，支持系统对接与批量导入。',
    output: '输出：项目履约基线'
  },
  {
    no: '②',
    icon: ScanSearch,
    title: '规则 + AI 双引擎',
    desc: '结构化字段按规则比对；文档用语义模型抽取承诺条款，识别「换了说法」的规避表述。',
    output: '输出：候选疑点'
  },
  {
    no: '③',
    icon: ShieldAlert,
    title: '疑点定级与证据链',
    desc: '按金额、频次、影响定高 / 中 / 低，每条疑点自动挂接原文位置与现场影像。',
    output: '输出：疑点清单'
  },
  {
    no: '④',
    icon: ClipboardCheck,
    title: '派单整改与归档',
    desc: '派发责任单位、限期反馈、复核销项，全程留痕，形成项目合规档案。',
    output: '输出：整改台账'
  }
];

const capabilities = [
  {
    icon: FileSearch,
    title: '承诺基线',
    desc: '把投标文件变成可计算的清单——自动抽取价格、工期、人员、品牌、服务承诺，形成每个项目独有的比对基线。没有基线，巡检只能靠人眼看。'
  },
  {
    icon: Radar,
    title: '证据链',
    desc: '每条疑点不只是一个结论，还带原文条款、页码定位、现场影像与时间戳，可以直接用于约谈、追责与结算谈判。'
  },
  {
    icon: TrendingUp,
    title: '横向画像',
    desc: '同一供应商在不同项目、不同区域的疑点自动聚合，识别「换个项目接着来」的惯性风险，而不只是单个项目的一次异常。'
  },
  {
    icon: CircleCheck,
    title: '信用沉淀',
    desc: '巡检结论回写供应商履约档案，成为下一次资格审查、评分与约谈的依据，让事后检查真正作用到事前。'
  }
];

const stats = [
  { value: '2', unit: '小时', label: '单项目首轮巡检', note: '人工约 3 天' },
  { value: '82', unit: '%', label: '疑点识别准确率', note: '含人工复核确认' },
  { value: '100', unit: '%', label: '重点项目材料覆盖', note: '合同 / 人员 / 材料 / 结算' },
  { value: '1.2', unit: '亿', label: '累计识别偏差金额', note: '可追回或纠偏' }
];

type SampleKey = 'staff' | 'material' | 'change';

type Sample = {
  key: SampleKey;
  title: string;
  risk: 'high' | 'mid';
  project: string;
  conclusion: string;
  evidences: { source: string; text: string }[];
  actions: string[];
  related: string;
};

const samples: Record<SampleKey, Sample> = {
  staff: {
    key: 'staff',
    title: '关键人员未按承诺到岗',
    risk: 'high',
    project: '贵安数据中心机电安装工程（一标段）· 合同额 ¥8,642 万',
    conclusion: '投标承诺的项目经理近 30 天无考勤记录，现场实际负责人为投标文件之外的人员，存在人员替换未履行变更手续的嫌疑。',
    evidences: [
      { source: '投标文件 · 技术标 P42', text: '拟派项目经理：张某（一级建造师），承诺全程在场，每月在场不少于 22 天。' },
      { source: '项目考勤 · 2026-10-01 至 10-30', text: '张某打卡 0 天；现场签证与例会纪要签字人为李某，李某未出现在投标人员名单中。' },
      { source: '合同专用条款 8.2', text: '未经采购人书面同意，承包人不得更换项目经理及主要管理人员。' }
    ],
    actions: ['派单承包人，5 个工作日内书面说明', '核验李某用工关系与社保缴纳主体', '如确认擅自更换，按合同违约条款处理并计入履约评价'],
    related: '该项目另有 2 条疑点：材料品牌降配、变更签证超阈值'
  },
  material: {
    key: 'material',
    title: '进场材料品牌与投标承诺不一致',
    risk: 'high',
    project: '贵安数据中心机电安装工程（一标段）· 合同额 ¥8,642 万',
    conclusion: '进场电缆为承诺品牌的低端系列，型号后缀不同、单价低约 18%，进场验收单未标注系列差异。',
    evidences: [
      { source: '投标文件 · 主要材料表', text: '低压电缆：A 品牌 YJV-4×185，阻燃 A 类，单价 268 元/米。' },
      { source: '进场验收单 · 10-18', text: '到货型号 YJV-4×185（普通阻燃），未注明系列，验收结论为「合格」。' },
      { source: '价格库比对', text: '同规格普通系列市场均价 219 元/米，与承诺型号价差 18.3%，涉及金额约 96 万元。' }
    ],
    actions: ['暂停该批次材料使用并复检', '要求承包人说明型号差异并补差价或换货', '同步核查同项目其他批次材料是否同样降配'],
    related: '该项目另有 2 条疑点：关键人员未到岗、变更签证超阈值'
  },
  change: {
    key: 'change',
    title: '变更金额占比超过合同约定阈值',
    risk: 'mid',
    project: '贵安数据中心机电安装工程（一标段）· 合同额 ¥8,642 万',
    conclusion: '累计变更金额 1,072 万元，占合同额 12.4%，超过合同约定的 10% 上限，且其中 3 项为「先施工后补签」。',
    evidences: [
      { source: '合同协议书 第 6 条', text: '累计变更金额超过合同价 10% 的，须经采购人上级单位审批。' },
      { source: '变更台账 · 共 11 项', text: '累计 1,072 万元（12.4%）；3 项签证日期晚于施工日志记载的开工日期。' },
      { source: '审批记录', text: '未见上级单位审批单据；其中 2 项仅有监理签认。' }
    ],
    actions: ['要求补充上级审批手续，未批部分暂不纳入结算', '核查「先干后签」项目的必要性与计价依据', '纳入项目结算审计重点清单'],
    related: '该项目另有 2 条疑点：关键人员未到岗、材料品牌降配'
  }
};

/* ---------------------------------- 工具 ---------------------------------- */

const useReveal = () => {
  useEffect(() => {
    const page = document.querySelector('.pai-page');
    if (!page) return;
    page.classList.add('is-ready');

    const targets = Array.from(page.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-in'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    targets.forEach((el) => io.observe(el));

    // 兜底：若观察器在该环境（隐藏标签页 / 特殊嵌入）一次都没回调，2.4 秒后强制显示，避免整页不可见
    const failsafe = window.setTimeout(() => {
      const revealed = page.querySelectorAll('[data-reveal].is-in').length;
      if (revealed === 0) targets.forEach((el) => el.classList.add('is-in'));
    }, 2400);

    return () => {
      window.clearTimeout(failsafe);
      io.disconnect();
    };
  }, []);
};

/* --------------------------------- 子组件 --------------------------------- */

const BrandMark = () => (
  <span className="pai-brand-mark" aria-hidden="true">
    <ScanEye size={17} strokeWidth={2.2} />
  </span>
);

const Nav: React.FC<{ onSample: () => void }> = ({ onSample }) => {
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState('why');

  useEffect(() => {
    // 兼容多种滚动容器（window / body / 预览宿主的滚动面板）
    const readTop = () =>
      Math.max(
        window.scrollY || 0,
        document.documentElement.scrollTop || 0,
        document.body.scrollTop || 0
      );
    const onScroll = () => setSolid(readTop() > 24);
    onScroll();
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
    let io2: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      io2 = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActive(entry.target.getAttribute('data-section') || 'why');
          });
        },
        { rootMargin: '-46% 0px -48% 0px', threshold: 0 }
      );
      sections.forEach((s) => io2!.observe(s));
    }

    return () => {
      document.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('scroll', onScroll);
      io2?.disconnect();
    };
  }, []);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const links = [
    { id: 'why', label: '为什么做' },
    { id: 'what', label: '巡什么' },
    { id: 'how', label: '怎么巡' },
    { id: 'ability', label: '能力' },
    { id: 'launch', label: '落地' }
  ];

  return (
    <header className={`pai-nav${solid ? ' is-solid' : ''}`}>
      <div className="pai-wrap pai-nav-inner">
        <div className="pai-brand">
          <BrandMark />
          <span className="pai-brand-name">标后巡检</span>
          <span className="pai-brand-split" />
          <span className="pai-brand-sub">履约合规</span>
        </div>

        <nav className="pai-nav-links">
          {links.map((l) => (
            <button
              key={l.id}
              type="button"
              className={`pai-nav-link${active === l.id ? ' is-active' : ''}`}
              onClick={() => go(l.id)}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="pai-nav-actions">
          <button type="button" className="pai-nav-text" onClick={onSample}>
            看一份巡检样本
          </button>
          <Button className="pai-btn pai-btn--nav" onClick={() => go('launch')}>
            预约演示
          </Button>
        </div>
      </div>
    </header>
  );
};

const HeroCard: React.FC<{ onPick: (k: SampleKey) => void }> = ({ onPick }) => {
  const pct = 96 / 128;
  const r = 34;
  const c = 2 * Math.PI * r;

  return (
    <div className="pai-hero-card">
      <div className="pai-hc-head">
        <span className="pai-hc-live">
          <i />
          巡检任务 · 进行中
        </span>
        <span className="pai-hc-round">第 2 轮</span>
      </div>

      <div className="pai-hc-title">贵安数据中心机电安装工程（一标段）</div>
      <div className="pai-hc-meta">合同额 ¥8,642 万 · 中标人：中建××局第×公司</div>

      <div className="pai-hc-progress">
        <div className="pai-hc-ring">
          <svg viewBox="0 0 80 80" width="80" height="80">
            <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,.13)" strokeWidth="6" />
            <circle
              cx="40"
              cy="40"
              r={r}
              fill="none"
              stroke="url(#paiRing)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${c * pct} ${c}`}
              transform="rotate(-90 40 40)"
            />
            <defs>
              <linearGradient id="paiRing" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#5C9BFF" />
                <stop offset="100%" stopColor="#25D3BE" />
              </linearGradient>
            </defs>
          </svg>
          <div className="pai-hc-ring-text">
            <b>96</b>
            <span>/ 128 项</span>
          </div>
        </div>
        <div className="pai-hc-progress-info">
          <div className="pai-hc-progress-label">巡检完成度 75%</div>
          <div className="pai-hc-progress-note">剩余 32 项待核查：材料与结算模块</div>
          <div className="pai-hc-progress-bar">
            <i style={{ width: '75%' }} />
          </div>
        </div>
      </div>

      <div className="pai-hc-issues">
        <div className="pai-hc-issues-title">
          命中疑点 <b>3</b> 条
          <span>按风险排序</span>
        </div>
        {heroIssues.map((it) => (
          <button key={it.id} type="button" className="pai-hc-issue" onClick={() => onPick(it.id)}>
            <span className={`pai-hc-dot is-${it.risk}`} />
            <span className="pai-hc-issue-main">
              <b>{it.label}</b>
              <em>{it.detail}</em>
            </span>
            <span className={`pai-hc-score is-${it.risk}`}>{it.score}%</span>
            <ChevronRight size={14} className="pai-hc-arrow" />
          </button>
        ))}
      </div>

      <div className="pai-hc-foot">
        <span>
          <CircleCheck size={13} /> 证据链已归档 12 份材料
        </span>
        <span className="pai-hc-foot-time">
          用时 <b>1 小时 48 分</b>
          <em>人工约 3 天</em>
        </span>
      </div>
    </div>
  );
};

const Hero: React.FC<{ onSample: (k: SampleKey) => void }> = ({ onSample }) => {
  const go = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="pai-hero">
      <div className="pai-hero-grid" aria-hidden="true" />
      <div className="pai-hero-glow" aria-hidden="true" />

      <div className="pai-wrap pai-hero-inner">
        <div className="pai-hero-copy">
          <div className="pai-eyebrow">
            <span />
            事后合规 · POST-AWARD INSPECTION
          </div>

          <h1 className="pai-h1">
            招标结束，
            <br />
            合规才走到最难的一段
          </h1>

          <p className="pai-hero-lead">
            数字合规官守的是招标过程中的每一道程序；<b>标后巡检</b>守的是中标之后的每一份合同、每一次变更、每一批进场材料。
            让投标时的承诺，在工地上真的兑现。
          </p>

          <div className="pai-hero-cta">
            <Button className="pai-btn pai-btn--primary" onClick={() => onSample('staff')}>
              看一份巡检样本
              <ArrowRight size={16} />
            </Button>
            <Button className="pai-btn pai-btn--ghost" onClick={() => go('what')}>
              巡检什么
            </Button>
          </div>

          <ul className="pai-hero-meta">
            {['覆盖合同 / 人员 / 材料 / 变更 / 结算', '规则 + AI 双引擎', '疑点直连整改闭环'].map((t) => (
              <li key={t}>
                <CircleCheck size={14} />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="pai-hero-visual">
          <HeroCard onPick={onSample} />
        </div>
      </div>

      <div className="pai-wrap">
        <div className="pai-hero-bottom">
          <div>
            <span className="pai-hero-bottom-num">128</span>
            <span className="pai-hero-bottom-label">类巡检规则</span>
          </div>
          <div>
            <span className="pai-hero-bottom-num">5</span>
            <span className="pai-hero-bottom-label">大履约维度</span>
          </div>
          <div>
            <span className="pai-hero-bottom-num">3</span>
            <span className="pai-hero-bottom-label">级风险定级</span>
          </div>
          <p className="pai-hero-bottom-note">
            与「数字合规官」共用规则库与证据链：事中校验，事后回溯。
          </p>
        </div>
      </div>
    </section>
  );
};

const Why: React.FC = () => (
  <section className="pai-section" id="why" data-section="why">
    <div className="pai-wrap">
      <div className="pai-sec-head" data-reveal>
        <div className="pai-eyebrow pai-eyebrow--dark">
          <span />
          两个哨位，一条防线
        </div>
        <h2 className="pai-h2">事中拦得住，事后查得回</h2>
        <p className="pai-lead">
          同一个采购项目，风险出现两次：一次在程序里，一次在履约现场。前者靠数字合规官实时拦截，后者靠标后巡检回溯核查——两者不是替代关系，而是接力。
        </p>
      </div>

      <div className="pai-rail" data-reveal>
        {stages.map((s) => (
          <div key={s.key} className={`pai-rail-item${s.active ? ' is-active' : ''}`}>
            <span className="pai-rail-dot" />
            <span className="pai-rail-index">{s.index}</span>
            <div className="pai-rail-name">{s.name}</div>
            <div className="pai-rail-desc">{s.desc}</div>
            <span className="pai-rail-tag">{s.tag}</span>
          </div>
        ))}
      </div>

      <div className="pai-duo" data-reveal>
        <article className="pai-duo-card">
          <div className="pai-duo-head">
            <span className="pai-duo-icon">
              <ShieldCheck size={19} />
            </span>
            <div>
              <h3>数字合规官 · 事中</h3>
              <p>看的是「程序对不对」</p>
            </div>
            <span className="pai-duo-badge">已在用</span>
          </div>
          <ul>
            <li>在公告、文件编制、评审、公示节点实时校验</li>
            <li>命中风险即提示整改，问题不出流程</li>
            <li>把「不该发出去的公告」拦在发出之前</li>
          </ul>
        </article>

        <div className="pai-duo-link" aria-hidden="true">
          <ArrowRight size={18} />
        </div>

        <article className="pai-duo-card is-focus">
          <div className="pai-duo-head">
            <span className="pai-duo-icon">
              <ScanEye size={19} />
            </span>
            <div>
              <h3>标后巡检 · 事后</h3>
              <p>看的是「承诺做没做」</p>
            </div>
            <span className="pai-duo-badge is-focus">本页主角</span>
          </div>
          <ul>
            <li>在合同签订、进场施工、变更结算环节回溯比对</li>
            <li>偏差即生成疑点，附带原文与现场证据</li>
            <li>把「中标后就没人管」的那一段补上</li>
          </ul>
        </article>
      </div>

      <p className="pai-note-line" data-reveal>
        共用同一套规则库、同一份证据链、同一个整改台账——不是两套系统，是同一条防线的两段。
      </p>
    </div>
  </section>
);

const What: React.FC<{ onPick: (k: SampleKey) => void }> = ({ onPick }) => (
  <section className="pai-section pai-section--alt" id="what" data-section="what">
    <div className="pai-wrap">
      <div className="pai-sec-head" data-reveal>
        <div className="pai-eyebrow pai-eyebrow--dark">
          <span />
          巡检范围
        </div>
        <h2 className="pai-h2">中标之后，真正需要盯住的六件事</h2>
        <p className="pai-lead">
          标后风险不是抽象的「管理不到位」，而是具体的钱和责。以下六类，是集中采购项目事后检查里命中率最高、金额影响最大的场景。
        </p>
      </div>

      <div className="pai-cards" data-reveal>
        {inspectItems.map((it) => {
          const Icon = it.icon;
          return (
            <article className="pai-card" key={it.no}>
              <div className="pai-card-top">
                <span className="pai-card-icon">
                  <Icon size={18} />
                </span>
                <span className="pai-card-no">{it.no}</span>
              </div>
              <h3>{it.title}</h3>
              <p>{it.desc}</p>
              <div className="pai-card-sample">
                <span>典型疑点</span>
                {it.sample}
              </div>
            </article>
          );
        })}
      </div>

      <div className="pai-inline-cta" data-reveal>
        <span>
          <Sparkles size={15} />
          疑点长什么样？
        </span>
        <button type="button" onClick={() => onPick('material')}>
          打开一份材料降配样本
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  </section>
);

const How: React.FC = () => (
  <section className="pai-section" id="how" data-section="how">
    <div className="pai-wrap">
      <div className="pai-sec-head" data-reveal>
        <div className="pai-eyebrow pai-eyebrow--dark">
          <span />
          工作原理
        </div>
        <h2 className="pai-h2">四步，把一个项目巡一遍</h2>
        <p className="pai-lead">
          不改变现有业务系统的操作习惯：数据从系统里来，结论回到台账里。巡检人员要做的，只剩判断与处置。
        </p>
      </div>

      <div className="pai-steps" data-reveal>
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div className="pai-step" key={s.title}>
              <div className="pai-step-head">
                <span className="pai-step-badge">{s.no}</span>
                <span className="pai-step-icon">
                  <Icon size={17} />
                </span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <span className="pai-step-out">{s.output}</span>
              {i < steps.length - 1 && <span className="pai-step-line" aria-hidden="true" />}
            </div>
          );
        })}
      </div>

      <div className="pai-engines" data-reveal>
        <div className="pai-engine">
          <span className="pai-engine-tag">规则引擎</span>
          <h4>算得准的，交给规则</h4>
          <p>金额、比例、日期、人员名单、品牌型号——凡是有明确口径的，逐项比对，不留给模型猜。</p>
        </div>
        <div className="pai-engine">
          <span className="pai-engine-tag is-ai">语义引擎</span>
          <h4>写得花的，交给模型</h4>
          <p>把「承诺条款」和「实际做法」放进同一语义空间比对，识别换了说法的规避与模糊表述。</p>
        </div>
        <div className="pai-engine">
          <span className="pai-engine-tag is-human">人工确认</span>
          <h4>定性的，交给人</h4>
          <p>模型只给疑点与证据，不给结论。是否违约、如何处置，由业务与合规人员签字确认。</p>
        </div>
      </div>
    </div>
  </section>
);

const Ability: React.FC = () => (
  <section className="pai-section pai-section--alt" id="ability" data-section="ability">
    <div className="pai-wrap pai-cap">
      <div className="pai-cap-left" data-reveal>
        <div className="pai-eyebrow pai-eyebrow--dark">
          <span />
          能力底座
        </div>
        <h2 className="pai-h2">
          人工巡检的盲区
          <br />
          它都补上了
        </h2>
        <p className="pai-lead">
          人工巡检的问题不是不认真，而是看不完、看不穿、留不下。标后巡检把这三点分别交给基线、证据与画像。
        </p>
        <div className="pai-cap-quote">
          <TriangleAlert size={16} />
          没有承诺基线，所有「不一致」都只是感觉。
        </div>
      </div>

      <div className="pai-cap-list">
        {capabilities.map((c, i) => {
          const Icon = c.icon;
          return (
            <div className="pai-cap-row" key={c.title} data-reveal>
              <div className="pai-cap-row-head">
                <span className="pai-cap-row-icon">
                  <Icon size={17} />
                </span>
                <h3>{c.title}</h3>
                <span className="pai-cap-row-no">0{i + 1}</span>
              </div>
              <p>{c.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

const Stats: React.FC = () => (
  <section className="pai-section pai-section--tight">
    <div className="pai-wrap">
      <div className="pai-stats" data-reveal>
        <div className="pai-stats-head">
          <h2>一个项目跑完，大概是这样</h2>
          <span>演示示意数据，用于说明量级</span>
        </div>
        <div className="pai-stats-grid">
          {stats.map((s) => (
            <div className="pai-stat" key={s.label}>
              <div className="pai-stat-value">
                {s.value}
                <em>{s.unit}</em>
              </div>
              <div className="pai-stat-label">{s.label}</div>
              <div className="pai-stat-note">{s.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const Launch: React.FC = () => (
  <section className="pai-section" id="launch" data-section="launch">
    <div className="pai-wrap">
      <div className="pai-launch" data-reveal>
        <div className="pai-launch-copy">
          <div className="pai-eyebrow pai-eyebrow--dark">
            <span />
            落地方式
          </div>
          <h2 className="pai-h2">不用全域上线，先跑一个项目</h2>
          <p className="pai-lead">
            标后巡检最适合从「一个金额大、问题多的在建项目」开始。跑通一次，再谈推广。
          </p>

          <div className="pai-launch-steps">
            {[
              { k: '选项目', v: '挑 1 个在建重点项目，明确巡检范围' },
              { k: '接数据', v: '接入合同、投标文件、履约与支付 4 类数据' },
              { k: '出报告', v: '7 天内产出首份疑点清单与整改建议' }
            ].map((s, i) => (
              <div className="pai-launch-step" key={s.k}>
                <span>{i + 1}</span>
                <div>
                  <b>{s.k}</b>
                  <em>{s.v}</em>
                </div>
              </div>
            ))}
          </div>

          <div className="pai-launch-actions">
            <Button className="pai-btn pai-btn--primary">
              预约演示
              <ArrowRight size={16} />
            </Button>
            <Button className="pai-btn pai-btn--line">
              <Clock size={15} />
              申请试点项目
            </Button>
          </div>
        </div>

        <div className="pai-launch-aside">
          <div className="pai-launch-aside-head">
            <Building2 size={17} />
            试点范围建议
          </div>
          <ul>
            <li>合同额 3,000 万以上，或履约周期超过 6 个月</li>
            <li>涉及专业分包、材料品类较多的机电 / 装饰类项目</li>
            <li>已有较完整的过程资料，便于做首次基线</li>
          </ul>
          <div className="pai-launch-metrics">
            <div>
              <b>7 天</b>
              <span>首份巡检报告</span>
            </div>
            <div>
              <b>2–3 个</b>
              <span>建议试点项目</span>
            </div>
          </div>
          <div className="pai-launch-aside-foot">
            <ListChecks size={15} />
            首批巡检通常能发现 5–15 条可整改疑点
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Footer: React.FC = () => (
  <footer className="pai-footer">
    <div className="pai-wrap pai-footer-inner">
      <div className="pai-footer-brand">
        <BrandMark />
        <div>
          <div className="pai-footer-name">标后巡检</div>
          <div className="pai-footer-desc">中标之后，把合规管到履约现场</div>
        </div>
      </div>
      <div className="pai-footer-links">
        <span>配套能力</span>
        <a href="#why">数字合规官 · 事中</a>
        <a href="#what">巡检范围</a>
        <a href="#how">工作原理</a>
      </div>
      <p className="pai-footer-note">本页为产品宣传原型，页面中的项目、金额与巡检结果均为演示示意数据。</p>
    </div>
  </footer>
);

const SampleDialog: React.FC<{
  value: SampleKey | null;
  onClose: () => void;
  onDispatch: () => void;
}> = ({ value, onClose, onDispatch }) => {
  const sample = value ? samples[value] : null;
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!sample) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [sample, onClose]);

  if (!sample) return null;

  return (
    <div className="pai-dialog-mask" onClick={onClose} role="presentation">
      <div
        className="pai-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={sample.title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pai-dialog-head">
          <div>
            <div className="pai-dialog-eyebrow">巡检样本 · 疑点详情</div>
            <h3>{sample.title}</h3>
            <div className="pai-dialog-project">{sample.project}</div>
          </div>
          <button type="button" className="pai-dialog-close" onClick={onClose} ref={closeRef} aria-label="关闭">
            <X size={18} />
          </button>
        </div>

        <div className="pai-dialog-body">
          <div className={`pai-dialog-risk is-${sample.risk}`}>
            <ShieldAlert size={17} />
            <div>
              <b>{sample.risk === 'high' ? '高风险' : '中风险'} · 建议派单核实</b>
              <p>{sample.conclusion}</p>
            </div>
          </div>

          <div className="pai-dialog-block">
            <div className="pai-dialog-block-title">
              证据链
              <span>{sample.evidences.length} 条</span>
            </div>
            {sample.evidences.map((e, i) => (
              <div className="pai-evidence" key={e.source}>
                <span className="pai-evidence-no">{i + 1}</span>
                <div>
                  <div className="pai-evidence-source">{e.source}</div>
                  <p>{e.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pai-dialog-block">
            <div className="pai-dialog-block-title">处置建议</div>
            <ol className="pai-dialog-actions">
              {sample.actions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ol>
          </div>

          <div className="pai-dialog-related">
            <Sparkles size={14} />
            {sample.related}
          </div>
        </div>

        <div className="pai-dialog-foot">
          <Button className="pai-btn pai-btn--line" onClick={onClose}>
            关闭
          </Button>
          <Button className="pai-btn pai-btn--primary" onClick={onDispatch}>
            派单核实
            <ArrowRight size={15} />
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------- 页面 ---------------------------------- */

const Component: React.FC = () => {
  const [sample, setSample] = useState<SampleKey | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useReveal();

  const onSample = useCallback((k: SampleKey) => setSample(k), []);
  const closeSample = useCallback(() => setSample(null), []);

  const dispatchSample = useCallback(() => {
    setSample(null);
    setToast('已派单至项目部：5 个工作日内反馈核查结果（演示）');
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    []
  );

  const shellClass = useMemo(() => `pai-page${sample ? ' is-locked' : ''}`, [sample]);

  return (
    <div className={shellClass}>
      <Nav onSample={() => setSample('staff')} />
      <Hero onSample={onSample} />
      <Why />
      <What onPick={onSample} />
      <How />
      <Ability />
      <Stats />
      <Launch />
      <Footer />
      <SampleDialog value={sample} onClose={closeSample} onDispatch={dispatchSample} />
      {toast && (
        <div className="pai-toast" role="status">
          <CircleCheck size={16} />
          {toast}
        </div>
      )}
    </div>
  );
};

export default Component;
