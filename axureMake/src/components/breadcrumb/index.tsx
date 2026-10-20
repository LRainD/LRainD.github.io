/**
 * @name 通用面包屑
 * @description 详情页顶部面包屑导航，文案由外部传入，最后一项自动作为当前页
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /src/components/top-action-bar/index.tsx
 */
import React from 'react';
import './style.css';

export interface BreadcrumbProps {
  /** 面包屑文案，按层级顺序传入，最后一项为当前页 */
  items: string[];
  /** 自定义样式类名 */
  className?: string;
}

const Breadcrumb = ({ items, className = '' }: BreadcrumbProps) => (
  <div className={`breadcrumb ${className}`.trim()}>
    {items.map((item, index) => (
      <React.Fragment key={`${item}-${index}`}>
        {index > 0 && <span className="breadcrumb-sep">{'>'}</span>}
        <span className={index === items.length - 1 ? 'breadcrumb-current' : 'breadcrumb-link'}>
          {item}
        </span>
      </React.Fragment>
    ))}
  </div>
);

export default Breadcrumb;
