import React, { useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Divider, Input, Modal, Progress, Space, Tag, Tooltip, message } from 'antd';
import { CheckCircleOutlined, DeleteOutlined, ScissorOutlined, SwapOutlined } from '@ant-design/icons';
import { governanceMaterials } from './data';
import { useDemo } from './context';
import { Confidence, PageHeader } from './shared';

export const GovernancePage: React.FC = () => {
  const { currentMaterialIndex, confirmStandard, setPage } = useDemo();
  const material = governanceMaterials[currentMaterialIndex];
  const [selected, setSelected] = useState<string[]>(material.selectedAtomKeys);
  const [synonyms, setSynonyms] = useState(material.sourceName);
  useEffect(() => { setSelected(material.selectedAtomKeys); setSynonyms(material.sourceName); }, [material]);
  const selectedAtoms = material.atoms.filter(atom => selected.includes(atom.key));
  const standardName = useMemo(() => selectedAtoms.map(atom => atom.value).join(' '), [selectedAtoms]);

  const handleConfirm = () => {
    if (!selected.includes('category')) {
      message.warning('请至少保留品类属性');
      return;
    }
    confirmStandard(selected);
  };

  return <>
    <PageHeader title="AI 治理工作台" subtitle={`任务：钢筋品类近五年数据治理 · 当前 ${currentMaterialIndex + 1}/${governanceMaterials.length} · AI 先完成初筛，专家仅需确认`} action={<Space><Progress type="circle" size={40} percent={26} /><Button onClick={() => setPage('tasks')}>任务详情</Button></Space>} />
    <div className="pg-governance-shell">
      <section className="pg-governance-panel">
        <div className="pg-panel-title"><span>AI 抽取原子</span><Confidence value={material.confidence} /></div>
        <div className="pg-panel-body">
          <div className="pg-source-text"><div className="pg-attribute-label">原始描述</div>{material.sourceName}</div>
          <Checkbox.Group value={selected} onChange={values => setSelected(values as string[])} style={{ width: '100%' }}>
            {material.atoms.map(atom => <div className="pg-atom-group" key={atom.key}>
              <Checkbox value={atom.key}><b>{atom.label}</b>：{atom.value}</Checkbox>
              <div className="pg-atom-meta"><span>AI 语义抽取</span><Confidence value={atom.confidence} /></div>
            </div>)}
          </Checkbox.Group>
          <Button block type="dashed" onClick={() => message.info('原型演示：可新增自定义属性原子')}>+ 补充属性</Button>
        </div>
      </section>

      <section className="pg-governance-panel">
        <div className="pg-panel-title"><span>标准物料组装预览</span><Tag color="processing">实时生成</Tag></div>
        <div className="pg-panel-body">
          <div className="pg-preview-name">{standardName || '请从左侧选择属性'}</div>
          <div className="pg-attribute-grid">
            {selectedAtoms.map(atom => <div className="pg-attribute" key={atom.key}><div className="pg-attribute-label">{atom.label}</div><div className="pg-attribute-value">{atom.value}</div></div>)}
          </div>
          <Divider orientation="left">同义词与历史叫法</Divider>
          <Input.TextArea rows={3} value={synonyms} onChange={event => setSynonyms(event.target.value)} placeholder="多个同义词可使用分号分隔" />
          <Divider orientation="left">质量提示</Divider>
          <Space direction="vertical">
            <span><CheckCircleOutlined style={{ color: '#16835b' }} /> 必填属性完整</span>
            <span><CheckCircleOutlined style={{ color: '#16835b' }} /> 单位已归一为“{material.unit}”</span>
            <span><SwapOutlined style={{ color: '#d46b08' }} /> 确认后将覆盖 1 条历史非标叫法</span>
          </Space>
        </div>
        <div className="pg-governance-actions">
          <Tooltip title="暂不处理，进入下一条"><Button onClick={() => message.info('已跳过当前物料')}>跳过此条</Button></Tooltip>
          <Button danger icon={<DeleteOutlined />} onClick={() => Modal.confirm({ title: '确认标记废弃？', content: '废弃记录仍保留审计链路，但不进入标准库。', onOk: () => message.success('已标记为废弃') })}>标记废弃</Button>
          <Button icon={<ScissorOutlined />} onClick={() => message.info('已创建拆分处理子任务')}>拆分处理</Button>
          <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleConfirm}>确认入库</Button>
        </div>
      </section>

      <section className="pg-governance-panel">
        <div className="pg-panel-title"><span>相似标准推荐</span><Tag>向量匹配</Tag></div>
        <div className="pg-panel-body">
          <div className="pg-similar-card" onClick={() => message.info('已在中间区域对比标准物料详情')}><div><b>HRB400E 热轧带肋钢筋 Φ20mm</b></div><div className="pg-similar-score">匹配度 86%</div><div className="pg-page-subtitle">差异：直径 Φ20mm；已关联 36 条价格</div></div>
          <div className="pg-similar-card" onClick={() => message.info('已在中间区域对比标准物料详情')}><div><b>HRB400 热轧带肋钢筋 Φ25mm</b></div><div className="pg-similar-score">匹配度 82%</div><div className="pg-page-subtitle">差异：非抗震牌号；已关联 24 条价格</div></div>
          <div className="pg-similar-card" onClick={() => message.info('已在中间区域对比标准物料详情')}><div><b>HRB500E 抗震钢筋 Φ25mm</b></div><div className="pg-similar-score">匹配度 75%</div><div className="pg-page-subtitle">差异：牌号 HRB500E；已关联 11 条价格</div></div>
        </div>
      </section>
    </div>
  </>;
};
