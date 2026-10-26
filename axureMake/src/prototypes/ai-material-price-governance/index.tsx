/**
 * @name AI物料标准化与价格治理平台
 * @mode axure
 * @description 以数据接入、AI拆解、专家治理、标准建库、价格审核和智能询价构成闭环演示。
 *
 * 参考资料：
 * - /skills/axure-export-workflow/SKILL.md
 */
import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import CentralizedProcurementLayout, {
  DEFAULT_SIDEBAR_ITEMS,
  type MenuItem
} from '../../components/centralized-procurement-layout';
import { DemoProvider, useDemo } from './context';
import { pageItems, type PageKey } from './data';
import { OverviewPage } from './OverviewPage';
import { ImportPage } from './ImportPage';
import { GovernancePage } from './GovernancePage';
import { StandardsPage } from './StandardsPage';
import { StandardsEditPage } from './StandardsEditPage';
import { ReviewPage } from './ReviewPage';
import { ReviewDetailPage } from './ReviewDetailPage';
import { MappingPage } from './MappingPage';
import { MappingDetailPage } from './MappingDetailPage';
import { AnalysisPage } from './AnalysisPage';
import { InquiryPage } from './InquiryPage';
import { TasksPage } from './TasksPage';
import { PurchaseListPage } from './PurchaseListPage';
import './style.css';

/**
 * 二级菜单涨到 10 项后，价格库再挂在侧边栏最底部就装不下了（10 项 ≈ 452px，
 * 1440×900 下菜单区只有 708px）。本原型是「价格库」的演示，把这一组提到「首页」之后，
 * 10 个二级菜单一屏看全，其余全局导航顺位下移到可滚动区域。
 */
const PRICE_LIBRARY_ITEMS: MenuItem[] = (() => {
  const items = DEFAULT_SIDEBAR_ITEMS.map(item =>
    item.key === 'price-library'
      ? {
          ...item,
          children: pageItems.filter(page => !page.hidden).map(page => ({ key: page.key, label: page.label }))
        }
      : item
  );
  const index = items.findIndex(item => item.key === 'price-library');
  if (index > 1) {
    const [priceLibrary] = items.splice(index, 1);
    items.splice(1, 0, priceLibrary);
  }
  return items;
})();

const isPageKey = (key: string): key is PageKey => pageItems.some(item => item.key === key);

const PageContent: React.FC = () => {
  const { page, setPage } = useDemo();
  const pages = {
    'purchase-list': <PurchaseListPage />,
    overview: <OverviewPage />,
    import: <ImportPage />,
    governance: <GovernancePage />,
    standards: <StandardsPage />,
    'standards-edit': <StandardsEditPage />,
    review: <ReviewPage />,
    'review-detail': <ReviewDetailPage />,
    'material-mapping': <MappingPage />,
    'mapping-detail': <MappingDetailPage />,
    analysis: <AnalysisPage />,
    inquiry: <InquiryPage />,
    tasks: <TasksPage />
  };

  return (
    <CentralizedProcurementLayout
      activeMenuKey={page}
      sidebarItems={PRICE_LIBRARY_ITEMS}
      orgName="中建八局"
      username="治理管理员"
      defaultOpenGroupKeys={['price-library']}
      onSubMenuClick={key => {
        if (isPageKey(key)) setPage(key);
      }}
    >
      <div className="price-governance-page">
        {pages[page]}
      </div>
    </CentralizedProcurementLayout>
  );
};

const Component: React.FC = () => (
  <ConfigProvider
    locale={zhCN}
    theme={{
      token: {
        colorPrimary: '#0081cc',
        colorInfo: '#0081cc',
        borderRadius: 4,
        fontSize: 13,
        colorBgLayout: '#f5f5f5'
      },
      components: {
        Button: { borderRadius: 4 },
        Card: { borderRadiusLG: 6 },
        Table: { headerBg: '#f7f9fb' }
      }
    }}
  >
    <DemoProvider><PageContent /></DemoProvider>
  </ConfigProvider>
);

export default Component;
