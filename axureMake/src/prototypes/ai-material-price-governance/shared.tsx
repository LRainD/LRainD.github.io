import React from 'react';
import { Button } from 'antd';
import type { PageKey } from './data';
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

export const PageHeader: React.FC<{
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}> = ({ title, subtitle, action }) => (
  <div className="pg-page-header">
    <div>
      <h1 className="pg-page-title">{title}</h1>
      <div className="pg-page-subtitle">{subtitle}</div>
    </div>
    {action}
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
