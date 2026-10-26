import React, { useEffect, useMemo, useState } from 'react';
import { Button, Empty, Input, Modal, Space, Tag, Tooltip, message } from 'antd';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
  UndoOutlined
} from '@ant-design/icons';
import { PageHeader, Surface } from './shared';
import { useDemo } from './context';
import { defaultAtomSynonyms, type StandardMaterial } from './data';

/** 一条规格型号：名称 + 值（值可以为空）+ 该属性名自己的历史叫法 */
type SpecRow = { key: string; label: string; value: string; synonyms: string[] };

type StandardForm = {
  code: string;
  name: string;
  category: string;
  specs: SpecRow[];
  synonyms: string[];
};

/** 「牌号：HRB400E」→ { label: '牌号', value: 'HRB400E' }，半角冒号也认 */
const splitSpec = (raw: string, index: number): SpecRow => {
  const at = raw.search(/[：:]/);
  const label = at >= 0 ? raw.slice(0, at) : raw;
  const value = at >= 0 ? raw.slice(at + 1) : '';
  return { key: `sp-${index}`, label: label.trim(), value: value.trim(), synonyms: [] };
};

const toForm = (item: StandardMaterial): StandardForm => ({
  code: item.code,
  name: item.name,
  category: item.category,
  specs: item.attributes.map((raw, index) => {
    const row = splitSpec(raw, index);
    // 属性级同义词按属性名对齐；老数据没有 attributeSynonyms 就是空数组
    return { ...row, synonyms: [...(item.attributeSynonyms?.[row.label] ?? [])] };
  }),
  synonyms: [...item.synonyms]
});

/** 规范化后再比较，避免「空值 ↔ 待补充」造成的假未保存 */
const normalize = (form: StandardForm) =>
  JSON.stringify({
    code: form.code.trim(),
    name: form.name.trim(),
    category: form.category.trim(),
    specs: form.specs
      .filter(row => row.label.trim())
      .map(row => `${row.label.trim()}：${row.value.trim() || '待补充'}`),
    // 规格行改名时同义词跟着走，所以按当前属性名对齐比较
    specSynonyms: form.specs
      .filter(row => row.label.trim())
      .map(row => [row.label.trim(), row.synonyms.filter(Boolean)]),
    synonyms: form.synonyms.filter(Boolean)
  });

/** 常用规格项，点一下就追加一行空值 */
const QUICK_SPECS = ['牌号', '规格型号', '材质', '执行标准', '强度等级', '功率', '灯头口径', '色温'];

export const StandardsEditPage: React.FC = () => {
  const { standards, editingStandardKey, updateStandard, setPage } = useDemo();

  const current = useMemo(
    () => standards.find(item => item.key === editingStandardKey) ?? standards[0],
    [standards, editingStandardKey]
  );

  const [form, setForm] = useState<StandardForm | null>(current ? toForm(current) : null);
  const [synonymDraft, setSynonymDraft] = useState('');
  /** 正在输入的规格级历史叫法：key 是规格行，text 是草稿 */
  const [specDraft, setSpecDraft] = useState<{ key: string; text: string } | null>(null);

  // 切换物料时重置表单
  useEffect(() => {
    setForm(current ? toForm(current) : null);
    setSynonymDraft('');
    setSpecDraft(null);
    // 只跟随物料 key 变化，保存后（standards 更新）不能把用户正在编辑的内容冲掉
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.key]);

  const baseline = useMemo(() => (current ? toForm(current) : null), [current]);
  const dirty = Boolean(form && baseline && normalize(form) !== normalize(baseline));

  const patch = (next: Partial<StandardForm>) => setForm(prev => (prev ? { ...prev, ...next } : prev));

  const patchSpec = (key: string, next: Partial<SpecRow>) =>
    setForm(prev =>
      prev ? { ...prev, specs: prev.specs.map(row => (row.key === key ? { ...row, ...next } : row)) } : prev
    );

  const addSpec = (label = '') =>
    setForm(prev =>
      prev
        ? {
            ...prev,
            specs: [
              ...prev.specs,
              {
                key: `sn${Date.now().toString(36)}`,
                label,
                value: '',
                // 从「快速添加」点进来的已知属性名，直接带出常见历史写法
                synonyms: label ? [...(defaultAtomSynonyms[label] ?? [])] : []
              }
            ]
          }
        : prev
    );

  const removeSpec = (key: string) =>
    setForm(prev =>
      prev
        ? {
            ...prev,
            specs: prev.specs.filter(row => row.key !== key)
          }
        : prev
    );

  const removeSpecSynonym = (key: string, word: string) =>
    setForm(prev =>
      prev
        ? {
            ...prev,
            specs: prev.specs.map(row =>
              row.key === key ? { ...row, synonyms: (row.synonyms ?? []).filter(item => item !== word) } : row
            )
          }
        : prev
    );

  /** 提交某条规格的历史叫法：去重；已登记在别的规格下时先确认，避免误归并 */
  const addSpecSynonym = (row: SpecRow) => {
    if (!specDraft || specDraft.key !== row.key) return;
    const text = specDraft.text.trim();
    setSpecDraft(null);
    if (!text || !form) return;
    const own = row.synonyms ?? [];
    if (own.includes(text)) {
      message.warning(`「${text}」已在该规格的历史叫法里`);
      return;
    }
    const write = () => patchSpec(row.key, { synonyms: [...own, text] });
    const owner = form.specs.find(other => other.key !== row.key && (other.synonyms ?? []).includes(text));
    if (owner) {
      Modal.confirm({
        title: '该叫法已登记在其它规格下',
        content: `「${text}」目前属于「${owner.label.trim() || '未命名规格'}」。继续添加表示历史文件里的这个写法也要归并到「${row.label.trim() || '当前规格'}」。`,
        okText: '仍然添加',
        cancelText: '取消',
        onOk: write
      });
      return;
    }
    write();
  };

  const addSynonym = () => {
    const value = synonymDraft.trim();
    if (!value) return;
    if (form?.synonyms.includes(value)) {
      message.warning('该叫法已存在');
      return;
    }
    patch({ synonyms: [...(form?.synonyms ?? []), value] });
    setSynonymDraft('');
  };

  const handleReset = () => {
    if (!current) return;
    setForm(toForm(current));
    message.info('已还原为上次保存的内容');
  };

  const handleSave = () => {
    if (!form || !current) return;
    const code = form.code.trim();
    const name = form.name.trim();
    if (!code) {
      message.warning('标准物料编码不能为空');
      return;
    }
    if (!name) {
      message.warning('标准名称不能为空');
      return;
    }
    const specs = form.specs.filter(row => row.label.trim());
    if (!specs.length) {
      message.warning('请至少保留一条规格型号');
      return;
    }
    const labels = specs.map(row => row.label.trim());
    const duplicated = labels.find((label, index) => labels.indexOf(label) !== index);
    if (duplicated) {
      message.warning(`规格型号「${duplicated}」重复，请合并后再保存`);
      return;
    }
    // 属性级同义词按当前属性名重建整个映射：
    // 规格行改名后旧键自然消失，删光叫法后该属性也不再留空数组
    const attributeSynonyms: Record<string, string[]> = {};
    specs.forEach(row => {
      const words = (row.synonyms ?? []).filter(Boolean);
      if (words.length) attributeSynonyms[row.label.trim()] = words;
    });
    updateStandard(current.key, {
      code,
      name,
      category: form.category.trim(),
      // 与治理工作台一致：值允许为空，标准库里记为「待补充」
      attributes: specs.map(row => `${row.label.trim()}：${row.value.trim() || '待补充'}`),
      synonyms: form.synonyms.filter(Boolean),
      attributeSynonyms
    });
  };

  const handleBack = () => {
    if (!dirty) {
      setPage('standards');
      return;
    }
    Modal.confirm({
      title: '还有未保存的修改',
      content: '直接返回标准物料库将丢失这些修改。',
      okText: '放弃并返回',
      cancelText: '继续编辑',
      onOk: () => setPage('standards')
    });
  };

  if (!current || !form) {
    return (
      <>
        <PageHeader title="编辑标准物料" subtitle="逐条维护标准名称、规格型号与历史叫法" />
        <Surface>
          <Empty description="标准物料库还没有数据" />
          <div style={{ textAlign: 'center' }}>
            <Button type="primary" onClick={() => setPage('standards')}>返回标准物料库</Button>
          </div>
        </Surface>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="编辑标准物料"
        subtitle="逐条维护标准名称、规格型号与历史叫法，保存后立即生效"
        action={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>返回列表</Button>
            <Button icon={<UndoOutlined />} disabled={!dirty} onClick={handleReset}>还原</Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>保存</Button>
          </Space>
        }
      />

      <section className="pg-governance-panel">
        <div className="pg-panel-title">
          <span>物料基础信息</span>
          {dirty ? <Tag color="warning">未保存</Tag> : <Tag color="success">已保存</Tag>}
        </div>
        <div className="pg-panel-body">
          <div className="pg-form-grid">
            <div className="pg-form-item">
              <div className="pg-attribute-label">
                标准物料编码 <span className="pg-required-mark">必填</span>
              </div>
              <Input
                value={form.code}
                onChange={event => patch({ code: event.target.value })}
                placeholder="例如：STD-GJ-000128"
              />
            </div>
            <div className="pg-form-item">
              <div className="pg-attribute-label">最近更新</div>
              <Input value={current.updatedAt} disabled />
            </div>
          </div>

          <div className="pg-form-item">
            <div className="pg-attribute-label">
              标准名称 <span className="pg-required-mark">必填</span>
            </div>
            <Input
              value={form.name}
              onChange={event => patch({ name: event.target.value })}
              placeholder="例如：HRB400E 热轧带肋抗震钢筋 Φ20mm"
            />
          </div>

          <div className="pg-form-grid">
            <div className="pg-form-item">
              <div className="pg-attribute-label">品类路径</div>
              <Input
                value={form.category}
                onChange={event => patch({ category: event.target.value })}
                placeholder="例如：建材 / 钢材 / 钢筋"
              />
            </div>
            <div className="pg-form-item">
              <div className="pg-attribute-label">关联价格</div>
              <div className="pg-field-static">
                <span>{current.prices} 条已审核价格</span>
                <a onClick={() => setPage('review')}>查看入库审核记录</a>
              </div>
            </div>
          </div>

          <div className="pg-form-divider" />

          <div className="pg-form-item">
            <div className="pg-panel-title pg-panel-title-inline">
              <span>
                规格型号 <Tag className="pg-soft-tag">{form.specs.length} 项</Tag>
              </span>
              <Button type="link" size="small" icon={<PlusOutlined />} onClick={() => addSpec()}>
                添加一项
              </Button>
            </div>
            <div className="pg-ai-sub" style={{ marginBottom: 10 }}>
              规格型号是价格匹配与询价的依据，属性值可以留空（保存后记为「待补充」），名称不能为空且不能重复。
              每条规格还可以登记自己的历史叫法，历史文件里写法不同、其实是同一属性的会归并到这里。
            </div>

            {form.specs.length === 0 && (
              <div className="pg-std-empty-spec">还没有规格型号，点「添加一项」开始补充</div>
            )}

            {form.specs.map((row, index) => {
              const words = row.synonyms ?? [];
              const hint = defaultAtomSynonyms[row.label.trim()];
              return (
                <div className="pg-spec-item" key={row.key}>
                  <div className="pg-spec-row">
                    <span className="pg-spec-index">{index + 1}</span>
                    <Input
                      className="pg-spec-label"
                      value={row.label}
                      placeholder="规格名称，如 牌号"
                      onChange={event => patchSpec(row.key, { label: event.target.value })}
                    />
                    <span className="pg-atom-eq">：</span>
                    <Input
                      className="pg-spec-value"
                      value={row.value}
                      placeholder="规格值，可留空"
                      onChange={event => patchSpec(row.key, { value: event.target.value })}
                    />
                    <Tooltip title="删除该规格型号">
                      <Button
                        className="pg-spec-delete"
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeSpec(row.key)}
                      />
                    </Tooltip>
                  </div>
                  <div className="pg-spec-syn">
                    <span className="pg-spec-syn-label">历史叫法</span>
                    {words.length === 0 && <span className="pg-spec-syn-empty">暂无</span>}
                    {words.map(word => (
                      <Tag
                        key={word}
                        closable
                        onClose={event => {
                          event.preventDefault();
                          removeSpecSynonym(row.key, word);
                        }}
                      >
                        {word}
                      </Tag>
                    ))}
                    {specDraft?.key === row.key ? (
                      <Input
                        size="small"
                        autoFocus
                        className="pg-spec-syn-input"
                        value={specDraft.text}
                        placeholder={hint?.length ? `如 ${hint[0]}` : '回车添加'}
                        onChange={event => setSpecDraft({ key: row.key, text: event.target.value })}
                        onPressEnter={() => addSpecSynonym(row)}
                        onBlur={() => addSpecSynonym(row)}
                      />
                    ) : (
                      <Tooltip
                        title={
                          hint?.length
                            ? `历史文件里常写作：${hint.join(' / ')}`
                            : '登记该规格在历史文件里的其它写法'
                        }
                      >
                        <button
                          type="button"
                          className="pg-spec-syn-add"
                          onClick={() => setSpecDraft({ key: row.key, text: '' })}
                        >
                          + 添加
                        </button>
                      </Tooltip>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="pg-quick-labels" style={{ marginTop: 10 }}>
              <span className="pg-ai-sub" style={{ marginRight: 4 }}>快速添加：</span>
              {QUICK_SPECS.filter(label => !form.specs.some(row => row.label.trim() === label)).map(label => (
                <Tag key={label} className="pg-quick-tag" onClick={() => addSpec(label)}>
                  + {label}
                </Tag>
              ))}
            </div>
          </div>

          <div className="pg-form-divider" />

          <div className="pg-form-item">
            <div className="pg-attribute-label">商品名称的历史叫法</div>
            <div className="pg-ai-sub" style={{ marginBottom: 8 }}>
              整条物料在历史文件里的其它叫法（可以有多条），与上面每条规格的历史叫法分开维护。
            </div>
            <div className="pg-synonym-box">
              {form.synonyms.length === 0 && <span className="pg-ai-sub">暂无历史叫法</span>}
              {form.synonyms.map(word => (
                <Tag
                  key={word}
                  closable
                  onClose={event => {
                    event.preventDefault();
                    patch({ synonyms: form.synonyms.filter(item => item !== word) });
                  }}
                >
                  {word}
                </Tag>
              ))}
            </div>
            <Space.Compact style={{ width: '100%', marginTop: 10 }}>
              <Input
                value={synonymDraft}
                onChange={event => setSynonymDraft(event.target.value)}
                onPressEnter={addSynonym}
                placeholder="输入新的历史叫法，回车添加"
              />
              <Button onClick={addSynonym}>添加</Button>
            </Space.Compact>
          </div>
        </div>

        <div className="pg-governance-actions">
          <span className="pg-save-hint">
            {dirty ? '有未保存的修改' : '内容与已保存版本一致'}
          </span>
          <Button onClick={handleReset} disabled={!dirty}>还原</Button>
          <Button onClick={handleBack}>返回列表</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>保存</Button>
        </div>
      </section>
    </>
  );
};
