import React from 'react';
import { Button, Tag } from 'antd';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export function PageHeader(props: {
  title: string;
  description: string;
  eyebrow?: string;
  onBack?: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="pg-page-header">
      <div className="pg-page-heading">
        {props.onBack && (
          <Button type="text" icon={<ArrowLeft size={16} />} onClick={props.onBack} className="pg-back-button" />
        )}
        <div>
          {props.eyebrow && <div className="pg-eyebrow">{props.eyebrow}</div>}
          <h1>{props.title}</h1>
          <p>{props.description}</p>
        </div>
      </div>
      {props.extra && <div className="pg-header-extra">{props.extra}</div>}
    </div>
  );
}

export function SectionCard(props: {
  title?: string;
  subtitle?: string;
  extra?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`pg-card ${props.className || ''}`}>
      {(props.title || props.extra) && (
        <div className="pg-card-header">
          <div>
            {props.title && <h2>{props.title}</h2>}
            {props.subtitle && <p>{props.subtitle}</p>}
          </div>
          {props.extra}
        </div>
      )}
      <div className="pg-card-body">{props.children}</div>
    </section>
  );
}

export function StatusTag({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    已生效: 'success',
    已完成: 'success',
    已选用: 'success',
    进行中: 'processing',
    待审核: 'warning',
    待处理: 'default',
    价格存疑: 'error',
    已逾期: 'error',
    不选用: 'default'
  };
  return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
}

export function Confidence({ value }: { value: number }) {
  const level = value >= 90 ? 'high' : value >= 80 ? 'medium' : 'low';
  return <span className={`pg-confidence ${level}`}>{value}%</span>;
}

export function EmptyLoading({ label = 'AI 正在分析数据' }: { label?: string }) {
  return (
    <div className="pg-loading-state">
      <RefreshCw size={22} className="pg-spin" />
      <span>{label}</span>
    </div>
  );
}
