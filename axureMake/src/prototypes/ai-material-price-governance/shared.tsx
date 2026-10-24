import React from 'react';
import { Button } from 'antd';
import { pageItems, type PageKey } from './data';
import { useDemo } from './context';

export const Surface: React.FC<{
  title?: React.ReactNode;
  extra?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  type?: 'inner';
  size?: 'small';
}> = ({ title, extra, children, className = '', style, type, size }) => (
  <section className={`pg-surface ${type === 'inner' ? 'pg-surface-inner' : ''} ${size === 'small' ? 'pg-surface-small' : ''} ${className}`} style={style}>
    {(title || extra) && <header className="pg-surface-header"><div className="pg-surface-title">{title}</div>{extra && <div className="pg-surface-extra">{extra}</div>}</header>}
    <div className="pg-surface-body">{children}</div>
  </section>
);

export const PageBreadcrumb: React.FC = () => {
  const { page } = useDemo();
  const current = pageItems.find(item => item.key === page);
  return (
    <div className="pg-breadcrumb">
      <span className="pg-breadcrumb-link">价格库</span>
      <span className="pg-breadcrumb-sep">›</span>
      <span>{current ? current.label : '治理总览'}</span>
    </div>
  );
};

export const PageHeader: React.FC<{
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  tag?: string;
}> = ({ title, subtitle, action, tag = '价格库' }) => (
  <div className="pg-head">
    <PageBreadcrumb />
    <div className="pg-bill-header">
      <div className="pg-bill-title">
        <span className="pg-bill-tag">{tag}</span>
        <span className="pg-bill-name">{title}</span>
        <span className="pg-bill-desc">{subtitle}</span>
      </div>
      {action && <div className="pg-bill-action">{action}</div>}
    </div>
  </div>
);

export const Confidence: React.FC<{ value: number }> = ({ value }) => {
  const color = value >= 90 ? '#16835b' : value >= 75 ? '#d46b08' : '#cf3f3f';
  const label = value >= 90 ? '高' : value >= 75 ? '中' : '低';
  return <span style={{ color, fontWeight: 600 }}>{value}% · {label}</span>;
};

export const LinkButton: React.FC<{ page: PageKey; children: React.ReactNode }> = ({ page, children }) => {
  const { setPage } = useDemo();
  return <Button type="link" onClick={() => setPage(page)}>{children}</Button>;
};
