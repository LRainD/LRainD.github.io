/**
 * 入库审核 · 审核详情（独立页面）。
 *
 * 业务方明确要求：审核不走右侧浮窗，点「审核 / 详情」直接跳到本页。
 * 页面上逐条核对业务专家组装的结果（属性名 / 属性值 / 该属性的历史叫法），
 * 底部吸底操作条给出「驳回退回」「通过并入库」两个结论。
 *
 * 两种提交方式的审核重点不同，所以页面结构也跟着分叉：
 * - 新增建档：重点看「是不是真的没有这条物料」（相似标准卡给疑似重复预警）；
 * - 修改已有：重点看「改得对不对」，顶部直接给出本次变更明细（改值 / 新增属性 / 新增同义词）。
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Input, Modal, Space, Tag, message } from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import type { MaterialSubmission } from './data';
import { useDemo } from './context';
import { PageHeader, Surface } from './shared';
import { buildSimilarItems, changeKindText, describeChanges } from './similar';

export const ReviewDetailPage: React.FC = () => {
  const {
    submissions, reviewingSubmissionKey, reviewSubmission,
    standards, prices, setPage, openTask, openStandardEditor, openReviewDetail
  } = useDemo();
  const [comment, setComment] = useState('');

  const detail = submissions.find(item => item.key === reviewingSubmissionKey) ?? null;

  // 换一条提交单时重置意见草稿（同一条重新渲染不能冲掉用户正在写的内容）
  useEffect(() => {
    setComment(detail?.comment ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail?.key]);

  /** 待审核队列：给「下一条待审核」按钮用，避免审核完再回列表点一次 */
  const queue = useMemo(() => submissions.filter(item => item.status === '待审核'), [submissions]);
  const nextPending = detail ? queue.find(item => item.key !== detail.key) ?? null : null;

  /** 与标准库的相似度：≥85% 提示「可能重复建档」 */
  const similar = useMemo(
    () => (detail ? buildSimilarItems(standards, prices, detail.atoms, detail.synonyms) : []),
    [detail, standards, prices]
  );
  const similarTop = similar[0];

  if (!detail) {
    return (
      <>
        <PageHeader title="审核组装结果" subtitle="逐条核对业务专家组装完成的商品" />
        <Surface>
          <div className="pg-review-empty">
            <ExperimentOutlined />
            <div>没有找到这条提交单</div>
            <div className="pg-ai-sub">可能已被审核或演示数据已重置。</div>
            <Button type="primary" onClick={() => setPage('review')}>返回运营入库审核</Button>
          </div>
        </Surface>
      </>
    );
  }

  const changes = detail.changes ?? [];
  /** 修改模式下被修改的那条标准物料（可能因为数据重置而不存在，approve 时会降级为新建） */
  const targetStandard = detail.targetStandardKey
    ? standards.find(std => std.key === detail.targetStandardKey)
    : undefined;

  /** 组装结果表里每一行属性的变更标记：改值 / 新增属性 / 新增同义词 */
  const flagOf = (atom: { label: string; synonyms: string[] }) => {
    if (detail.changeType !== 'update') return null;
    const hit = changes.find(change =>
      change.label === atom.label ||
      change.alias === atom.label ||
      (change.kind === 'atom-synonym' && (change.words ?? []).some(word => atom.synonyms.includes(word)))
    );
    if (!hit) return null;
    if (hit.kind === 'value') return { text: '改', tone: 'value' };
    if (hit.kind === 'add-atom') return { text: '新', tone: 'add-atom' };
    if (hit.kind === 'atom-synonym') return { text: '同', tone: 'atom-synonym' };
    return null;
  };

  const approve = () => {
    if (detail.status !== '待审核') {
      message.warning('该提交单不在待审核状态');
      return;
    }
    confirmApprove(detail, comment, () => {
      reviewSubmission(detail.key, 'approve', comment);
      setPage('review');
    });
  };
  const reject = () => {
    if (detail.status !== '待审核') {
      message.warning('该提交单不在待审核状态');
      return;
    }
    if (!comment.trim()) {
      message.warning('驳回需要填写审核意见，告诉专家哪里要改');
      return;
    }
    reviewSubmission(detail.key, 'reject', comment);
    setPage('review');
  };

  return <>
    <PageHeader
      title="审核组装结果"
      subtitle={`${detail.name} · 来源任务「${detail.taskName}」`}
      action={
        <Space>
          <Tag color={detail.status === '待审核' ? 'processing' : detail.status === '已通过' ? 'success' : 'error'}>
            {detail.status}
          </Tag>
          {nextPending && (
            <Button onClick={() => openReviewDetail(nextPending.key)}>
              下一条待审核（{queue.length - 1}）
            </Button>
          )}
          <Button icon={<ArrowLeftOutlined />} onClick={() => setPage('review')}>返回运营入库审核</Button>
        </Space>
      }
    />

    <div className="pg-rv-detail pg-rv-page">
      <div className="pg-rv-title">{detail.name}</div>
      <div className="pg-rv-meta">
        <div>
          <span>提交方式</span>
          <b className={detail.changeType === 'update' ? 'pg-rv-meta-strong' : ''}>
            {detail.changeType === 'update'
              ? `修改已有 · ${detail.targetStandardCode ?? '目标标准'}`
              : '新增建档'}
          </b>
        </div>
        <div><span>来源任务</span><b>{detail.taskName}</b></div>
        <div><span>原始描述</span><b>{detail.sourceName}</b></div>
        <div><span>品类 / 单位</span><b>{detail.category} · {detail.unit}</b></div>
        <div><span>提交人 / 时间</span><b>{detail.submitter} · {detail.submittedAt}</b></div>
        <div><span>提交批次</span><b>第 {detail.attempt} 次提交</b></div>
        <div><span>所属工程局</span><b>{detail.bureau}</b></div>
      </div>

      {detail.status === '已驳回' && detail.comment && (
        <Alert
          className="pg-rv-alert"
          showIcon
          type="error"
          title={`已驳回：${detail.comment}`}
          description={detail.reviewer ? `${detail.reviewer} · ${detail.reviewedAt}` : undefined}
        />
      )}
      {detail.status === '已通过' && (
        <Alert
          className="pg-rv-alert"
          showIcon
          type="success"
          title={`已通过并写入标准物料库：${detail.standardCode ?? '—'}`}
          description="该商品已作为标准物料生效，后续清单与询价会直接匹配到它。"
        />
      )}

      {detail.changeType === 'update' && (
        <Surface
          size="small"
          className="pg-rv-block"
          title={
            <span>
              本次变更
              <Tag color="purple" className="pg-soft-tag" style={{ marginLeft: 8 }}>
                {detail.targetStandardCode ?? '目标标准'}
              </Tag>
            </span>
          }
          extra={<span className="pg-ai-sub">{describeChanges(changes)}</span>}
        >
          {changes.length ? (
            <div className="pg-rv-changes">
              <div className="pg-rv-changes-head">
                <span>变更</span>
                <span>属性</span>
                <span>标准库现值</span>
                <span>本次提交</span>
              </div>
              {changes.map((change, index) => (
                <div
                  className={`pg-rv-change-row is-${change.kind}`}
                  key={`${change.kind}-${change.label ?? 'syn'}-${index}`}
                >
                  <span><em className={`pg-rv-flag is-${change.kind}`}>{changeKindText[change.kind]}</em></span>
                  <span>
                    {change.kind === 'name-synonym' ? '商品名称' : change.label}
                    {change.alias && <span className="pg-ai-sub">（提交写作「{change.alias}」）</span>}
                  </span>
                  <span className="pg-rv-change-old">
                    {change.kind === 'atom-synonym' || change.kind === 'name-synonym' ? '—' : change.before || '—'}
                  </span>
                  <span className="pg-rv-change-new">
                    {change.kind === 'atom-synonym' || change.kind === 'name-synonym'
                      ? change.words?.map(word => <Tag key={word} className="pg-soft-tag">{word}</Tag>)
                      : change.after || '—'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="pg-ai-sub">本次提交与目标标准完全一致，只确认关联关系，没有属性变更。</div>
          )}
          <div className="pg-ai-sub">
            通过后只合并属性值、属性同义词与商品历史叫法；标准编码 {detail.targetStandardCode}、名称与品类路径保持不变
            {targetStandard ? `，${targetStandard.prices} 条价格记录仍挂在这条标准上` : ''}
            —— 这是「修改」与「新建」的区别。
          </div>
        </Surface>
      )}

      {detail.changeType === 'update' && !targetStandard && (
        <Alert
          className="pg-rv-alert"
          showIcon
          type="warning"
          title="目标标准物料已不存在"
          description="通过后将按「新增建档」处理；如只是要关联，请驳回让专家重新选择目标标准。"
        />
      )}

      <Surface size="small" title="组装结果（审核对象）" className="pg-rv-block">
        <div className="pg-rv-atoms">
          <div className="pg-rv-atoms-head">
            <span>属性名</span>
            <span>属性值</span>
            <span>该属性的历史叫法</span>
          </div>
          {detail.atoms.map(atom => {
            const flag = flagOf(atom);
            const before = flag?.tone === 'value'
              ? changes.find(change =>
                  change.kind === 'value' && (change.label === atom.label || change.alias === atom.label)
                )?.before
              : undefined;
            return (
              <div className={`pg-rv-atoms-row ${flag ? `is-${flag.tone}` : ''}`} key={atom.label}>
                <span className={atom.label === '品类' ? 'pg-rv-pk' : ''}>
                  {flag && <em className={`pg-rv-flag is-${flag.tone}`}>{flag.text}</em>}
                  {atom.label}
                </span>
                <span className={atom.value ? '' : 'pg-ai-sub'}>
                  {atom.value || '（空，入库后标记待补充）'}
                  {before && <span className="pg-rv-was">（原 {before}）</span>}
                </span>
                <span className="pg-rv-syn">
                  {atom.synonyms.length
                    ? atom.synonyms.map(word => <Tag key={word} className="pg-soft-tag">{word}</Tag>)
                    : <span className="pg-ai-sub">—</span>}
                </span>
              </div>
            );
          })}
        </div>
        <div className="pg-rv-item">
          <span>商品名称历史叫法</span>
          <div className="pg-rv-syn">
            {detail.synonyms.length
              ? detail.synonyms.map(word => <Tag key={word}>{word}</Tag>)
              : <span className="pg-ai-sub">—</span>}
          </div>
        </div>
        <div className="pg-ai-sub">
          入库后这些属性会成为标准物料的「规格型号」，属性同义词与商品历史叫法一起落库，历史文件再导入时能直接归并到这条物料。
        </div>
      </Surface>

      {detail.changeType === 'update' && targetStandard ? (
        <div className="pg-rv-similar-box">
          <div className="pg-rv-similar-head">
            <span>
              本次提交是给标准物料 <b>{targetStandard.name}</b> 打补丁：通过后合并进它，<b>不会重复建档</b>
            </span>
            <Button size="small" onClick={() => openStandardEditor(targetStandard.key)}>查看该标准</Button>
          </div>
          <div className="pg-rv-similar-meta">
            <span>{targetStandard.code}</span>
            <span>当前 {targetStandard.attributes.length} 项规格</span>
            <span>本次变更 {changes.length} 项</span>
            <span>价格记录 {targetStandard.prices} 条保留</span>
          </div>
          {similarTop && similarTop.key !== targetStandard.key && similarTop.score >= 85 && (
            <div className="pg-rv-similar-meta">
              <b className="pg-warning">
                注意：另有相似物料 {similarTop.code}（匹配度 {similarTop.score}%），请确认目标标准选的是对的那条
              </b>
            </div>
          )}
        </div>
      ) : similarTop ? (
        <div className={`pg-rv-similar-box ${similarTop.score >= 85 ? 'is-warn' : ''}`}>
          <div className="pg-rv-similar-head">
            <span>
              标准库已有相似物料：<b>{similarTop.name}</b>
            </span>
            <Button size="small" onClick={() => openStandardEditor(similarTop.key)}>查看该标准</Button>
          </div>
          <div className="pg-rv-similar-meta">
            <span>{similarTop.code}</span>
            <span>属性一致 {similarTop.same}/{similarTop.total} 项</span>
            <span>匹配度 {similarTop.score}%</span>
            {similarTop.score >= 85 && <b className="pg-warning">高度相似，通过前请确认是否重复建档</b>}
          </div>
        </div>
      ) : null}

      <Surface size="small" title="审核意见" className="pg-rv-block">
        {detail.status === '待审核' ? (
          <>
            <Input.TextArea
              value={comment}
              onChange={event => setComment(event.target.value)}
              rows={3}
              maxLength={200}
              showCount
              placeholder="通过时可留空；驳回必须写明原因，例如：色温应补成 3000K，「暖光」放到历史叫法"
            />
            {detail.changeType !== 'update' && similarTop && similarTop.score >= 85 && (
              <div className="pg-rv-suggest">
                <button
                  type="button"
                  className="pg-syn-add"
                  onClick={() => setComment(`与标准物料 ${similarTop.code}（${similarTop.name}）高度相似，建议关联已有标准而不是新建，请核对后确认。`)}
                >
                  ＋ 用「疑似重复」作为意见
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="pg-rv-final">
            {detail.comment ? detail.comment : '审核通过，无补充意见。'}
          </div>
        )}
      </Surface>

      <div className="pg-gov-actionbar">
        <div className="pg-gov-actionbar-hint">
          <div className="pg-gov-actionbar-title">
            {detail.changeType === 'update'
              ? `通过后把 ${changes.length} 项变更合并进 ${detail.targetStandardCode ?? '目标标准'}；驳回则带着意见退回治理工作台。`
              : '通过后自动生成标准物料编码并写入标准物料库；驳回则带着意见退回治理工作台。'}
          </div>
          <div className="pg-gov-actionbar-sub">
            待审核队列还有 <b>{queue.length}</b> 条
            {detail.attempt > 1 && <> · 本条为第 {detail.attempt} 次提交</>}
          </div>
        </div>
        <Space wrap>
          <Button
            onClick={() => {
              if (detail.taskKey) openTask(detail.taskKey);
              else setPage('governance');
            }}
          >
            {detail.taskKey ? '回到该任务继续治理' : '回到治理工作台'}
          </Button>
          {detail.status === '已通过' && (
            <Button onClick={() => openStandardEditor(detail.standardKey ?? '')} disabled={!detail.standardKey}>
              查看已入库标准物料
            </Button>
          )}
          {detail.status === '待审核' && (
            <>
              <Button danger icon={<CloseCircleOutlined />} onClick={reject}>驳回退回</Button>
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={approve}>
                {detail.changeType === 'update' ? '通过并合并' : '通过并入库'}
              </Button>
            </>
          )}
        </Space>
      </div>
    </div>
  </>;
};

/** 通过前确认：把「通过到底做了什么」讲清楚（新建一条 / 合并进已有），避免误点 */
const confirmApprove = (record: MaterialSubmission, comment: string, onOk: () => void) => {
  const isUpdate = record.changeType === 'update';
  Modal.confirm({
    title: isUpdate ? '确认把变更合并进标准物料？' : '通过并写入标准物料库？',
    width: 490,
    content: (
      <div className="pg-submit-confirm">
        <div><span>提交方式</span><b>{isUpdate ? `修改已有 ${record.targetStandardCode ?? ''}` : '新增建档'}</b></div>
        <div><span>商品名称</span><b>{record.name}</b></div>
        {isUpdate ? (
          <div><span>变更内容</span><b>{describeChanges(record.changes)}</b></div>
        ) : (
          <div>
            <span>规格型号</span>
            <b>{record.atoms.filter(atom => atom.label !== '品类').length} 项属性 · 单位 {record.unit}</b>
          </div>
        )}
        <div><span>历史叫法</span><b>{record.synonyms.length} 条商品叫法</b></div>
        {comment.trim() && <div><span>审核意见</span><b>{comment.trim()}</b></div>}
        <div className="pg-ai-sub">
          {isUpdate
            ? '通过后只更新该标准物料的属性与历史叫法，标准编码、名称与价格记录保持不变，标准物料总数不变。'
            : '通过后自动生成标准物料编码，标准物料库 +1、待治理量 -1，任务状态同步为「已完成 / 待审核」。'}
        </div>
      </div>
    ),
    okText: isUpdate ? '通过并合并' : '通过并入库',
    cancelText: '再核一下',
    onOk
  });
};
