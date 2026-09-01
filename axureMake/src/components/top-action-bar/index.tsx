import React, { type ReactNode } from 'react';
import './style.css';

export interface TopActionBarProps {
  title: ReactNode;
  actions?: ReactNode;
  className?: string;
}

const TopActionBar = ({ title, actions, className = '' }: TopActionBarProps) => (
  <div className={`top-action-bar ${className}`.trim()}>
    <div className="top-action-bar-title">{title}</div>
    {actions && <div className="top-action-bar-actions">{actions}</div>}
  </div>
);

export default TopActionBar;
