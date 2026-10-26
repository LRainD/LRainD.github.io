import React, { useEffect, useMemo, useState } from 'react';
import { Button, Modal, Select, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FileExcelOutlined, LinkOutlined, WarningOutlined } from '@ant-design/icons';
import type { MatchedRow } from './ai/match';
import type { CatalogDetail } from './ai/match';
import { avgConfidenceOf, formatFileSize, hitCountOf, money, type AttachmentRecord } from './attachment';

export type QuotePayload = {
  /** 原始解析行 */
  row: MatchedRow;
  /** 最终采用的标准物料编码（可能是手工指定后的） */
  code: string;
};

type Props = {
  open: boolean;
  attachment: AttachmentRecord | null;
  catalog: Map<string, CatalogDetail>;
  onClose: () => void;
  onQuote: (items: QuotePayload[]) => void;
};

const confidenceColor = (value: number) => {
  if (value >= 85) return '#0e9f6e';
  if (value >= 70) return '#0081cc';
  if (value >= 50) return '#d98600';
  return '#d93f3f';
};

const ConfidenceCell: React.FC<{ value: number }> = ({ value }) => (
  <div className="pl-conf-cell">
    <span className="pl-conf-num" style={{ color: confidenceColor(value) }}>{value}</span>
    <span className="pl-conf-track">
      <i style={{ width: `${Math.max(3, value)}%`, background: confidenceColor(value) }} />
    </span>
  </div>
);

export const AttachmentQuoteModal: React.FC<Props> = ({ open, attachment, catalog, onClose, onQuote }) => {
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  /** 手工改推荐的物料：idx → code */
  const [overrides, setOverrides] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!open) return;
    setOverrides({});
    // 默认只勾选命中的行，未命中的留给人工判断
    setSelectedKeys((attachment?.rows ?? []).filter(row => row.code).map(row => row.idx));
  }, [open, attachment?.key]);

  const rows = attachment?.rows ?? [];
  const hitCount = hitCountOf(rows);
  const avgConfidence = avgConfidenceOf(rows);

  const codeOf = (row: MatchedRow) => overrides[row.idx] ?? row.code;

  const catalogOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> = [];
    catalog.forEach(detail => {
      options.push({ value: detail.material.code, label: `${detail.material.code} · ${detail.material.name}` });
    });
    return options;
  }, [catalog]);

  const detailOf = (code: string) => (code ? catalog.get(code) : undefined);

  const expandedRowRender = (row: MatchedRow) => {
    const code = codeOf(row);
    const detail = detailOf(code);
    return (
      <div className="pl-quote-detail">
        <div className="pl-quote-block">
          <div className="pl-quote-block-title">推荐物料明细</div>
          {detail ? (
            <>
              <div className="pl-quote-line"><span>编码</span><b>{detail.material.code}</b></div>
              <div className="pl-quote-line"><span>标准名称</span><b>{detail.material.name}</b></div>
              <div className="pl-quote-line"><span>品类路径</span><em>{detail.material.category}</em></div>
              <div className="pl-quote-line"><span>规格型号</span>
                <span className="pl-quote-tags">
                  {detail.material.attributes.map(item => <Tag key={item}>{item}</Tag>)}
                </span>
              </div>
              <div className="pl-quote-line"><span>历史叫法</span><em>{detail.material.synonyms.join('、') || '无'}</em></div>
            </>
          ) : (
            <div className="pl-quote-empty">
              <WarningOutlined /> 暂未匹配到标准物料
            </div>
          )}
          <div className="pl-quote-picker">
            <span>指定物料</span>
            <Select
              size="small"
              showSearch
              allowClear
              optionFilterProp="label"
              placeholder="搜索编码或名称"
              value={code || undefined}
              options={catalogOptions}
              onChange={value => setOverrides(prev => ({ ...prev, [row.idx]: value || '' }))}
              style={{ flex: 1, minWidth: 0 }}
            />
          </div>
        </div>

        <div className="pl-quote-block">
          <div className="pl-quote-block-title">价格数据</div>
          {detail && detail.records.length ? (
            <>
              <div className="pl-quote-kpis">
                <div><span>关联价格</span><b>{detail.material.prices} 条</b></div>
                <div><span>历史均价</span><b>{money(detail.avgPrice)}</b></div>
                <div><span>价格区间</span><b>{money(detail.minPrice)} ~ {money(detail.maxPrice)}</b></div>
                <div><span>最近成交</span><b>{detail.latestDate}</b></div>
              </div>
              <div className="pl-quote-records">
                {detail.records.slice(0, 3).map(record => (
                  <div className="pl-quote-record" key={record.key}>
                    <span className="pl-quote-record-source">{record.source}</span>
                    <span className="pl-quote-record-price">{money(record.unitPrice)} 元/{record.unit}</span>
                    <span className="pl-quote-record-meta">{record.brand} · {record.bureau} · {record.signDate}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="pl-quote-empty">该物料暂无已审核的历史价格</div>
          )}
        </div>

        <div className="pl-quote-block">
          <div className="pl-quote-block-title">AI 判断依据</div>
          <div className="pl-quote-reason">{row.reason || '—'}</div>
          <div className="pl-quote-gap">
            <span>差异提示</span>
            <em>{row.gap || '原文与标准物料无关键差异'}</em>
          </div>
          <div className="pl-quote-source-row">
            <span>附件原文</span>
            <em>{row.raw}{row.spec ? ` / ${row.spec}` : ''}</em>
          </div>
        </div>
      </div>
    );
  };

  const columns: ColumnsType<MatchedRow> = [
    { title: '序号', key: 'index', width: 56, align: 'center', render: (_v, _r, index) => index + 1 },
    {
      title: '附件解析行',
      key: 'raw',
      width: 250,
      render: (_v, row) => (
        <div className="pl-quote-raw">
          <span className="pl-quote-raw-name">{row.raw}</span>
          {row.spec && <span className="pl-quote-raw-spec">规格：{row.spec}</span>}
        </div>
      )
    },
    {
      title: '数量 / 单位',
      key: 'qty',
      width: 110,
      align: 'right',
      render: (_v, row) => (row.quantity || row.unit ? `${row.quantity || '—'} ${row.unit}` : '—')
    },
    {
      title: '含税单价',
      key: 'price',
      width: 110,
      align: 'right',
      render: (_v, row) => (row.price ? money(Number(row.price)) : '—')
    },
    {
      title: '推荐标准物料',
      key: 'material',
      width: 268,
      render: (_v, row) => {
        const detail = detailOf(codeOf(row));
        if (!detail) return <Tag color="warning">未匹配</Tag>;
        return (
          <div className="pl-quote-mat">
            <span className="pl-quote-mat-code">{detail.material.code}</span>
            <Tooltip title={detail.material.name} placement="topLeft">
              <span className="pl-quote-mat-name">{detail.material.name}</span>
            </Tooltip>
          </div>
        );
      }
    },
    {
      title: '规格型号',
      key: 'attrs',
      width: 190,
      render: (_v, row) => {
        const detail = detailOf(codeOf(row));
        if (!detail) return <span className="pl-quote-dash">—</span>;
        return (
          <span className="pl-quote-tags">
            {detail.material.attributes.slice(0, 2).map(item => <Tag key={item}>{item}</Tag>)}
            {detail.material.attributes.length > 2 && <Tag>+{detail.material.attributes.length - 2}</Tag>}
          </span>
        );
      }
    },
    {
      title: '置信度',
      key: 'confidence',
      width: 96,
      render: (_v, row) => (codeOf(row) ? <ConfidenceCell value={row.confidence} /> : <span className="pl-quote-dash">—</span>)
    }
  ];

  const picked = selectedKeys.length ? rows.filter(row => selectedKeys.includes(row.idx)) : [];
  const pickedHit = picked.filter(row => codeOf(row)).length;

  return (
    <Modal
      open={open}
      width={1180}
      title="引用附件解析结果"
      onCancel={onClose}
      className="pl-quote-modal"
      footer={
        <div className="pl-quote-footer">
          <span className="pl-quote-footer-tip">
            已选 <b>{picked.length}</b> / {rows.length} 行，其中 <b>{pickedHit}</b> 行已关联标准物料
          </span>
          <span className="pl-quote-footer-actions">
            <Button onClick={onClose}>取消</Button>
            <Button
              type="primary"
              icon={<LinkOutlined />}
              disabled={!picked.length}
              onClick={() => onQuote(picked.map(row => ({ row, code: codeOf(row) })))}
            >
              引用选中行到清单
            </Button>
            <Button
              type="primary"
              ghost
              disabled={!rows.length}
              onClick={() => onQuote(rows.map(row => ({ row, code: codeOf(row) })))}
            >
              全部引用
            </Button>
          </span>
        </div>
      }
    >
      {attachment && (
        <>
          <div className="pl-quote-head">
            <div className="pl-quote-file">
              <FileExcelOutlined className="pl-quote-file-icon" />
              <div className="pl-quote-file-main">
                <span className="pl-quote-file-name">{attachment.fileName}</span>
                <span className="pl-quote-file-meta">
                  {formatFileSize(attachment.size)} · 工作表「{attachment.sheetName || 'Sheet1'}」 · 有效 {attachment.rowCount} 行
                  {attachment.skipped > 0 && ` · 已剔除 ${attachment.skipped} 行非物料`}
                </span>
              </div>
            </div>
            <div className="pl-quote-stats">
              <div><span>命中标准物料</span><b>{hitCount} / {rows.length}</b></div>
              <div><span>平均置信度</span><b>{avgConfidence}</b></div>
              <div><span>解析字段</span><b>{attachment.nameColumn || '—'}</b></div>
            </div>
          </div>

          <Table
            className="pl-quote-table"
            rowKey="idx"
            size="small"
            columns={columns}
            dataSource={rows}
            pagination={false}
            scroll={{ x: 1080, y: 392 }}
            expandable={{ expandedRowRender, columnWidth: 42 }}
            rowSelection={{
              selectedRowKeys: selectedKeys,
              onChange: keys => setSelectedKeys(keys)
            }}
            locale={{ emptyText: '该附件未解析出有效数据行' }}
          />
          <div className="pl-quote-note">
            展开任意一行可查看推荐物料的标准信息、历史价格与 AI 判断依据；未命中的行可在展开区手工指定物料后再引用。
          </div>
        </>
      )}
    </Modal>
  );
};
