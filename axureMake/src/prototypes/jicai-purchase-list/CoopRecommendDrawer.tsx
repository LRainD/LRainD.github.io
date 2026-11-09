import React, { useState } from 'react';
import { X } from 'lucide-react';

/* ──────────────────────────  推荐逻辑（纯本地演示，不调模型）  ────────────────────────── */

type CoopRule = { coop: string; keywords: string[] };

const COOP_RULES: CoopRule[] = [
  {
    coop: '钢材及金属制品',
    keywords: ['钢筋', '钢材', '钢板', '型钢', '钢管', '螺纹', '钢结构', '金属', '铁件', '止水钢板'],
  },
  {
    coop: '模板脚手架及周材',
    keywords: ['模板', '木方', '脚手架', '周材', '盘扣', '铝模', '木模', '支撑架', '安全网'],
  },
  {
    coop: '机电设备',
    keywords: ['电缆', '电线', '配电', '桥架', '母线', '机电', '电梯', '空调', '水泵', '风机', '变压器', '设备'],
  },
  {
    coop: '装饰装修材料',
    keywords: ['装修', '装饰', '涂料', '瓷砖', '石材', '门窗', '吊顶', '乳胶漆', '地板', '幕墙'],
  },
  {
    coop: '混凝土及砂浆',
    keywords: ['混凝土', '砂浆', '砼', '搅拌站', '湿拌', '干混', '外加剂'],
  },
];

export type CoopRecommendResult = { matched: true; coop: string; reason: string } | { matched: false };

/** 按招采名称里的关键词给出一个合作品类；命中不了就返回未匹配 */
export function recommendCoop(raw: string): CoopRecommendResult {
  const text = raw.trim();
  let bestCoop = '';
  let bestHits: string[] = [];
  let bestWeight = 0;

  COOP_RULES.forEach((rule) => {
    const hits = rule.keywords.filter((k) => text.includes(k));
    // 长词更有辨识度（「混凝土」比「设备」更能说明品类），按词长加权
    const weight = hits.reduce((n, k) => n + k.length, 0);
    if (weight > bestWeight) {
      bestCoop = rule.coop;
      bestHits = hits;
      bestWeight = weight;
    }
  });

  if (!bestCoop || bestHits.length === 0) return { matched: false };

  return {
    matched: true,
    coop: bestCoop,
    reason: `招采名称包含关键词「${bestHits.slice(0, 3).join('」「')}」`,
  };
}

const SAMPLE_NAME = 'XX项目2026年度商品混凝土及砂浆集中采购';

/* ──────────────────────────  浮窗  ────────────────────────── */

const CoopRecommendDrawer: React.FC<{
  onClose: () => void;
  onApply: (coop: string) => void;
  /** 未匹配到时点击「可点击申请添加 >>>」，弹出「申请新增合作品类」弹窗 */
  onApplyNewCoop: () => void;
}> = ({ onClose, onApply, onApplyNewCoop }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<CoopRecommendResult | null>(null);
  /* 演示用开关：真实系统由后端判定命中与否，这里可以手动指定看两种形态 */
  const [demoUnmatched, setDemoUnmatched] = useState(false);

  const handleRecommend = () => {
    if (!name.trim()) {
      setError('请先输入招采名称');
      setResult(null);
      return;
    }
    setError('');
    setResult(null);
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setResult(demoUnmatched ? { matched: false } : recommendCoop(name));
    }, 900);
  };

  return (
    <aside className="jc-drawer jc-drawer-narrow" role="dialog" aria-modal="true" aria-label="智能推荐合作品类">
      <div className="jc-drawer-head">
        <button type="button" className="jc-drawer-x" onClick={onClose} aria-label="关闭">
          <X size={16} strokeWidth={1.8} />
        </button>
        <h3>智能推荐合作品类</h3>
      </div>

      <div className="jc-drawer-body">
        <div className="jc-drawer-tip">通过填写招采名称 系统智能推荐合适的合作品类</div>

        <div className="jc-drawer-row">
          <div className="jc-drawer-label">
            <span>
              <i className="jc-req">*</i>招采名称<span className="jc-colon">：</span>
            </span>
          </div>
          <div className="jc-drawer-ctl">
            <input
              className="jc-drawer-input"
              value={name}
              maxLength={100}
              placeholder="请输入招采名称"
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
                if (result) setResult(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading) handleRecommend();
              }}
            />
            <p className="jc-drawer-example">
              示例：{SAMPLE_NAME}
              <button type="button" onClick={() => setName(SAMPLE_NAME)}>
                填入示例
              </button>
            </p>
          </div>
        </div>

        {error && <p className="jc-drawer-err">{error}</p>}

        <div className="jc-drawer-actions jc-actions-split">
          <div className="jc-demo">
            <span className="jc-demo-label">演示</span>
            <div className="jc-demo-seg" role="group" aria-label="演示结果">
              <button
                type="button"
                className={demoUnmatched ? '' : 'is-on'}
                onClick={() => {
                  setDemoUnmatched(false);
                  setResult(null);
                }}
              >
                匹配到
              </button>
              <button
                type="button"
                className={demoUnmatched ? 'is-on' : ''}
                onClick={() => {
                  setDemoUnmatched(true);
                  setResult(null);
                }}
              >
                未匹配到
              </button>
            </div>
          </div>

          <button
            type="button"
            className="jc-btn jc-btn-primary jc-btn-recommend"
            onClick={handleRecommend}
            disabled={loading}
          >
            {loading ? '推荐中…' : '立即推荐'}
          </button>
        </div>

        {result && result.matched && (
          <div className="jc-coop-result">
            <div className="jc-coop-line">
              <span className="jc-coop-label">推荐结果</span>
              <span className="jc-coop-name">{result.coop}</span>
              <button type="button" className="jc-btn jc-btn-primary jc-btn-use" onClick={() => onApply(result.coop)}>
                立即使用
              </button>
            </div>
            <p className="jc-coop-reason">{result.reason}</p>
          </div>
        )}

        {result && !result.matched && (
          <div className="jc-coop-result">
            <div className="jc-coop-line">
              <span className="jc-coop-label">推荐结果</span>
              <span className="jc-coop-none">未匹配到</span>
            </div>
            <p className="jc-coop-reason">
              合作品类库中暂无与本次招采名称匹配的品类，可先
              <button type="button" className="jc-coop-link" onClick={onApplyNewCoop}>
                可点击申请添加 &gt;&gt;&gt;
              </button>
              ，审核通过后即可选用。
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default CoopRecommendDrawer;
