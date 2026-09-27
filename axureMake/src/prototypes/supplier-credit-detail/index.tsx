/**
 * @name 供应商信用详情
 * @description 集采工作台 - 信用管理下的供应商企业档案详情页，聚合风险预警、工商信息、经营信息、资质业绩等资料。
 *
 * 参考资料：
 * - 用户提供的页面截图
 */

import React, { useState } from 'react';
import { Button, ConfigProvider, Table, Tag } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import type { ColumnsType } from 'antd/es/table';
import {
  Home,
  Clock,
  BarChart3,
  ShoppingCart,
  Shield,
  Users,
  Truck,
  Package,
  ClipboardList,
  Copy,
  FileImage,
  BadgeCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import CentralizedProcurementLayout from '../../components/centralized-procurement-layout';
import type { MenuItem } from '../../components/centralized-procurement-layout';
import './style.css';

/* ================= 左侧菜单 ================= */

const SIDEBAR_ITEMS: MenuItem[] = [
  { key: 'home', label: '首页', collapsedLabel: '首页', icon: <Home className="menu-icon" /> },
  { key: 'purchase-timeliness', label: '采购时效', collapsedLabel: '时效', icon: <Clock className="menu-icon" /> },
  { key: 'purchase-data', label: '采购数据', collapsedLabel: '数据', icon: <BarChart3 className="menu-icon" /> },
  { key: 'business-chance', label: '商机', collapsedLabel: '商机', icon: <ShoppingCart className="menu-icon" /> },
  {
    key: 'credit-management',
    label: '信用管理',
    collapsedLabel: '信用',
    icon: <Shield className="menu-icon" />,
    children: [
      { key: 'assessment-task', label: '考核任务管理' },
      { key: 'supplier-management', label: '供应商管理' },
      { key: 'bad-behavior', label: '不良行为管理' },
      { key: 'blacklist', label: '黑名单管理' },
      { key: 'performance-evaluation', label: '履约评价管理' },
      { key: 'supplier-disposal', label: '供应商处置' },
      { key: 'cooperation', label: '合作管理' },
      { key: 'task-management', label: '任务管理' }
    ]
  },
  {
    key: 'purchase-plan',
    label: '采购计划管理',
    collapsedLabel: '计划',
    icon: <ClipboardList className="menu-icon" />,
    children: [
      { key: 'plan-list', label: '计划列表' },
      { key: 'plan-approval', label: '计划审批' }
    ]
  },
  {
    key: 'purchase-sourcing',
    label: '采购寻源',
    collapsedLabel: '寻源',
    icon: <Truck className="menu-icon" />,
    children: [
      { key: 'sourcing-list', label: '寻源列表' },
      { key: 'sourcing-detail', label: '寻源详情' }
    ]
  },
  {
    key: 'purchase-acceptance',
    label: '采购验收',
    collapsedLabel: '验收',
    icon: <Package className="menu-icon" />,
    children: [
      { key: 'acceptance-list', label: '验收列表' },
      { key: 'acceptance-detail', label: '验收详情' }
    ]
  },
  {
    key: 'supplier-pool',
    label: '供应商池',
    collapsedLabel: '供应',
    icon: <Users className="menu-icon" />,
    children: [
      { key: 'pool-list', label: '供应商池列表' },
      { key: 'pool-config', label: '入池配置' }
    ]
  }
];

/* ================= 模拟图片 ================= */

const LICENSE_IMG =
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Chinese%20enterprise%20business%20license%20certificate%20scan%2C%20official%20document%20with%20red%20seal%2C%20flat%20lay%20on%20white&image_size=landscape_4_3';
const LEGAL_PERSON_IMG =
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=ID%20card%20portrait%20photo%20of%20an%20asian%20businessman%20in%20dark%20suit%2C%20plain%20blue%20background&image_size=portrait_4_3';
const ENTRUST_IMG =
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=power%20of%20attorney%20document%2C%20official%20paper%20with%20red%20seal%20and%20handwriting%20signature%2C%20flat%20lay&image_size=landscape_4_3';
const FACTORY_CERT_IMG =
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=construction%20qualification%20certificate%20document%20scan%20on%20desk%2C%20official%20paper&image_size=landscape_4_3';
const FACTORY_PHOTO_IMG =
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=steel%20products%20warehouse%20interior%20with%20metal%20pipes%20and%20coils&image_size=landscape_4_3';

/* ================= 风险预警 ================= */

const RISK_ITEMS: { keyword: string; text: string }[] = [
  { keyword: '禁止交易', text: '该分供商被禁止交易（根据「禁止交易企业名单」）' },
  { keyword: '禁用', text: '该分供商被禁用或标记为禁用服务（根据「禁用供应商名单」）' },
  { keyword: '高风险', text: '该分供商存在高风险，请谨慎交易（根据「高风险供应商名单」）' },
  { keyword: '工程禁用', text: '被建设或市政设施工程企业采购等禁用服务或业务存在风险' },
  { keyword: '不良行为', text: '该分供商被标记为不良行为（根据「不良行为名单」）' },
  { keyword: '工程质量', text: '项目管理部反馈该分供商在服务、第三方等责任方面存在偏颇、不实情况' }
];

/* ================= 锚点导航 ================= */

const ANCHORS = [
  { id: 'basic-info', label: '基本信息' },
  { id: 'legal-person', label: '法定代表人' },
  { id: 'bank-account', label: '基本户' },
  { id: 'entrust', label: '委托信息' },
  { id: 'other-info', label: '其他信息' },
  { id: 'business-info', label: '经营信息' },
  { id: 'qualification', label: '企业资质' },
  { id: 'brand', label: '品牌信息' },
  { id: 'product', label: '产品信息' },
  { id: 'engineering', label: '工程业绩' },
  { id: 'honor', label: '荣誉证书' },
  { id: 'credit', label: '企业信用' },
  { id: 'other-materials', label: '其他资料' }
];

/* ================= 通用子组件 ================= */

interface FieldItem {
  label: string;
  value?: React.ReactNode;
  span?: number;
}

const FieldGrid: React.FC<{ items: FieldItem[] }> = ({ items }) => (
  <div className="scd-field-grid">
    {items.map((item) => (
      <div
        className="scd-field"
        key={item.label}
        style={item.span ? { gridColumn: `span ${item.span}` } : undefined}
      >
        <div className="scd-field-label">{item.label}</div>
        <div className="scd-field-value">{item.value ?? '-'}</div>
      </div>
    ))}
  </div>
);

const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => {
  const [open, setOpen] = useState(true);

  return (
    <section className="scd-section" id={id}>
      <div className="scd-section-header" onClick={() => setOpen(!open)}>
        <div className="scd-section-title">{title}</div>
        {open ? <ChevronUp className="scd-section-caret" /> : <ChevronDown className="scd-section-caret" />}
      </div>
      {open && <div className="scd-section-body">{children}</div>}
    </section>
  );
};

const FileChip: React.FC<{ name: string }> = ({ name }) => (
  <span className="scd-file-chip">
    <FileImage className="scd-file-icon" />
    {name}
  </span>
);

const tablePagination = (total: number) => ({
  pageSize: 10,
  total,
  size: 'small' as const,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
  showTotal: (count: number) => `共 ${count} 条`
});

/* ================= 表格数据 ================= */

const contactColumns: ColumnsType<Record<string, unknown>> = [
  { title: '序号', dataIndex: 'index', width: 70 },
  { title: '姓名', dataIndex: 'name' },
  { title: '部门职位', dataIndex: 'position' },
  { title: '手机号码', dataIndex: 'phone' },
  { title: '负责区域', dataIndex: 'region' },
  { title: '电子邮箱', dataIndex: 'email' },
  { title: '微信', dataIndex: 'wechat' },
  { title: '是否常用联系人', dataIndex: 'primary' }
];

const contactData = [
  {
    key: '1',
    index: 1,
    name: '小稠',
    position: '安全员',
    phone: '15333333354',
    region: '市辖区',
    email: 'wert@qq.com',
    wechat: 'dsd',
    primary: '是'
  }
];

const qualificationColumns: ColumnsType<Record<string, unknown>> = [
  { title: '序号', dataIndex: 'index', width: 70 },
  { title: '资质类型', dataIndex: 'type' },
  { title: '资质证书号', dataIndex: 'no' },
  { title: '资质等级', dataIndex: 'level' },
  { title: '证书有效期', dataIndex: 'validity' },
  { title: '发证机关', dataIndex: 'authority' },
  { title: '数据来源', dataIndex: 'source' },
  { title: '资质图片', dataIndex: 'image' }
];

const qualificationData = [
  {
    key: '1',
    index: 1,
    type: '职业健康安全管理体系认证',
    no: 'vfujsdiitkmelemer',
    level: '-',
    validity: '长期',
    authority: '-',
    source: '自行上传',
    image: '665.png'
  }
];

const brandColumns: ColumnsType<Record<string, unknown>> = [
  { title: '序号', dataIndex: 'index', width: 70 },
  { title: '品牌名称', dataIndex: 'name' },
  { title: '商标证书号', dataIndex: 'trademarkNo' },
  { title: '商标有效期', dataIndex: 'trademarkValidity' },
  { title: '品牌类型', dataIndex: 'type' },
  { title: '商标证书', dataIndex: 'trademarkFile' },
  { title: '授权书', dataIndex: 'authFile' },
  { title: '授权有效期', dataIndex: 'authValidity' }
];

const brandData = [
  {
    key: '1',
    index: 1,
    name: 'qwertyqreqwqreaqwen',
    trademarkNo: 'qwertyqreqwqreertwert',
    trademarkValidity: '长期',
    type: '授权品牌',
    trademarkFile: 'png-9696.png',
    authFile: 'png-4523b.png',
    authValidity: '长期'
  }
];

const productColumns: ColumnsType<Record<string, unknown>> = [
  { title: '序号', dataIndex: 'index', width: 70 },
  { title: '商品图片', dataIndex: 'image' },
  { title: '商品名称', dataIndex: 'name' },
  { title: '商品分类', dataIndex: 'category' },
  { title: '商品品牌', dataIndex: 'brand' },
  { title: '供货模式', dataIndex: 'mode' },
  { title: '商品价格区间', dataIndex: 'priceRange' }
];

const productData = [
  {
    key: '1',
    index: 1,
    image: 'png-6549.png',
    name: 'wertwe',
    category: '土建/水暖及其它用钢材/铝..., 商...',
    brand: '商品品牌名称',
    mode: '供货/运货',
    priceRange: '-'
  }
];

const engineeringColumns: ColumnsType<Record<string, unknown>> = [
  { title: '序号', dataIndex: 'index', width: 70 },
  { title: '工程名称', dataIndex: 'name' },
  { title: '合作单位', dataIndex: 'partner' },
  { title: '项目类型', dataIndex: 'type' },
  { title: '工程地址', dataIndex: 'address' },
  { title: '合同额（万元）', dataIndex: 'amount' },
  { title: '起始时间', dataIndex: 'period' },
  { title: '工程业绩描述', dataIndex: 'description' }
];

const engineeringData = [
  {
    key: '1',
    index: 1,
    name: 'shdfjdkjfgjkdf,kfjer',
    partner: 'wert 1ter',
    type: '用户自付上等',
    address: '天津市市辖区...',
    amount: 43,
    period: '开始：2024-06-30 结束：2026-06-30',
    description: 'rewegagqeqw'
  }
];

const honorColumns: ColumnsType<Record<string, unknown>> = [
  { title: '序号', dataIndex: 'index', width: 70 },
  { title: '荣誉奖项名称', dataIndex: 'name' },
  { title: '奖项级别', dataIndex: 'level' },
  { title: '颁发机构', dataIndex: 'authority' },
  { title: '获奖年度', dataIndex: 'year' },
  { title: '证书图片', dataIndex: 'image' }
];

const creditColumns: ColumnsType<Record<string, unknown>> = [
  { title: '序号', dataIndex: 'index', width: 70 },
  { title: '企业信用指标', dataIndex: 'indicator' },
  { title: '信用等级', dataIndex: 'level' },
  { title: '使用附件', dataIndex: 'attachment' }
];

const materialColumns: ColumnsType<Record<string, unknown>> = [
  { title: '序号', dataIndex: 'index', width: 70 },
  { title: '资料名称', dataIndex: 'name' },
  { title: '资料附件', dataIndex: 'attachment' }
];

/* ================= 页面 ================= */

const Component: React.FC = () => {
  const [activeAnchor, setActiveAnchor] = useState('basic-info');

  const handleAnchorClick = (id: string) => {
    setActiveAnchor(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <ConfigProvider locale={zhCN}>
      <CentralizedProcurementLayout
        username="admin"
        activeMenuKey="supplier-management"
        sidebarItems={SIDEBAR_ITEMS}
        defaultOpenGroupKeys={['credit-management']}
      >
        <div className="scd-page">
          <div className="scd-main">
            {/* 头部信息 */}
            <div className="scd-header-card">
              <div className="scd-header-title">
                <h1 className="scd-title">小稠有来有去（球球）有限责任公司</h1>
                <span className="scd-code">
                  份额编号：20231000301
                  <Copy className="scd-copy-icon" />
                </span>
              </div>
              <div className="scd-header-actions">
                <Button type="primary">变更份额编号</Button>
                <Button type="primary">新增退出</Button>
              </div>
            </div>
            <div className="scd-back-row">
              <button type="button" className="scd-back-btn">
                返回入口
              </button>
            </div>

            {/* 风险预警 */}
            <Section id="risk-warning" title="风险预警">
              <div className="scd-risk">
                <div className="scd-risk-content">
                  <div className="scd-risk-alert">
                    <span className="scd-risk-alert-title">风险预警</span>
                    温馨提示：本页数据基于工商信息抽检，不代表企业现状，相关风险请企业自行核实。若发现遗漏或错误请及时报告，我们将第一时间处理并反馈。
                  </div>
                  <ol className="scd-risk-list">
                    {RISK_ITEMS.map((item) => (
                      <li key={item.keyword}>
                        <b>{item.keyword}：</b>
                        {item.text}
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="scd-risk-badge">
                  <div className="scd-risk-badge-inner">
                    <BadgeCheck className="scd-risk-badge-icon" />
                  </div>
                </div>
              </div>
            </Section>

            {/* 基本信息 */}
            <Section id="basic-info" title="基本信息">
              <FieldGrid
                items={[
                  { label: '统一社会信用代码', value: '9110000ZCC9LPTX9V' },
                  { label: '公司类型（企业经济性质）', value: '全部有M' },
                  { label: '注册资本', value: '961万人民币' },
                  { label: '注册日期', value: '1988-01-29' },
                  { label: '注册地址', value: '江苏省连云港市30号' },
                  { label: '营业期限', value: '长期' },
                  { label: '实收资本', value: '-' },
                  { label: '实缴资本', value: '-' },
                  {
                    label: '工商营业执照',
                    span: 4,
                    value: <img src={LICENSE_IMG} className="scd-thumb" width={132} height={92} alt="工商营业执照" />
                  }
                ]}
              />
            </Section>

            {/* 法定代表人信息 */}
            <Section id="legal-person" title="法定代表人信息">
              <FieldGrid
                items={[
                  { label: '法定代表人姓名', value: '小稠' },
                  { label: '证件类型', value: '身份证' },
                  { label: '证件号码', value: '43060226071258723' },
                  { label: '法定代表人手机', value: '15444444440' },
                  {
                    label: '法定代表人证件',
                    span: 4,
                    value: (
                      <img src={LEGAL_PERSON_IMG} className="scd-thumb" width={92} height={118} alt="法定代表人证件" />
                    )
                  }
                ]}
              />
            </Section>

            {/* 基本户 */}
            <Section id="bank-account" title="基本户">
              <FieldGrid
                items={[
                  { label: '户名', value: "fgv'gv" },
                  { label: '账号', value: '34124352452452452' },
                  { label: '开户行', value: 'test12344...' },
                  { label: '开户行地址', value: '-' }
                ]}
              />
            </Section>

            {/* 委托信息 */}
            <Section id="entrust" title="委托信息">
              <FieldGrid
                items={[
                  { label: '委托人账号', value: 'cs10007' },
                  { label: '所属机构', value: '小稠有来有去（球球）有限责任公司' },
                  {
                    label: '授权委托书',
                    value: <img src={ENTRUST_IMG} className="scd-thumb" width={104} height={74} alt="授权委托书" />
                  },
                  { label: '委托人证件号', value: '11204410841231538' }
                ]}
              />
            </Section>

            {/* 其他信息 */}
            <Section id="other-info" title="其他信息">
              <FieldGrid
                items={[
                  { label: '营业额', value: '1000万-5000万' },
                  { label: '员工人数', value: '100-1000人' },
                  { label: '企业网站', value: '-' },
                  { label: '公司电话', value: '15400888887' },
                  { label: '企业视频', value: '-' },
                  { label: '公司地址', value: '四川省成都市金牛区沙湾东二路1号2栋1单元10楼1015号' },
                  { label: '纳税人资质', value: '一般纳税人' },
                  { label: '计价方式', value: '数量计价' },
                  { label: '股东', value: '-' }
                ]}
              />
            </Section>

            {/* 经营信息 */}
            <Section id="business-info" title="经营信息">
              <FieldGrid
                items={[
                  { label: '所属行业', value: '化学纤维制造业' },
                  { label: '企业类别（企业营业执照的类型）', value: '分工商、分商商、已流民' },
                  { label: '企业类型（企业的经营类型）', value: '生产商' }
                ]}
              />

              <div className="scd-block-title">工厂信息</div>
              <Table
                className="scd-table"
                bordered
                size="small"
                rowKey="key"
                pagination={false}
                columns={[
                  { title: '工厂名称', dataIndex: 'name' },
                  { title: '所在省市', dataIndex: 'region' },
                  { title: '详细地址', dataIndex: 'address' },
                  { title: '工厂联系人', dataIndex: 'contact' },
                  { title: '业务覆盖区域', dataIndex: 'coverage' },
                  { title: '资质/图集', dataIndex: 'files' }
                ]}
                dataSource={[
                  {
                    key: '1',
                    name: '坡切顿铁',
                    region: '天津市(天津市滨海新区)',
                    address: '天津市(天津市滨海新区)',
                    contact: 'wertree 15444444444',
                    coverage: '天津市市辖区',
                    files: (
                      <div className="scd-thumb-group">
                        <img src={FACTORY_CERT_IMG} className="scd-thumb" width={62} height={46} alt="资质" />
                        <img src={FACTORY_PHOTO_IMG} className="scd-thumb" width={62} height={46} alt="图集" />
                      </div>
                    )
                  }
                ]}
              />

              <div className="scd-inline-fields">
                <div className="scd-field">
                  <div className="scd-field-label">覆盖区域</div>
                  <div className="scd-field-value">
                    <Tag className="scd-region-tag">北京市</Tag>
                    <Tag className="scd-region-tag">天津市</Tag>
                    <Tag className="scd-region-tag">河北区</Tag>
                  </div>
                </div>
                <div className="scd-field">
                  <div className="scd-field-label">是否提供货源</div>
                  <div className="scd-field-value">-</div>
                </div>
                <div className="scd-field">
                  <div className="scd-field-label">经营简述</div>
                  <div className="scd-field-value">wertwet</div>
                </div>
              </div>

              <div className="scd-block-title">联系人信息</div>
              <Table
                className="scd-table"
                bordered
                size="small"
                rowKey="key"
                pagination={tablePagination(contactData.length)}
                columns={contactColumns}
                dataSource={contactData}
              />
            </Section>

            {/* 企业资质 */}
            <Section id="qualification" title="企业资质">
              <Table
                className="scd-table"
                bordered
                size="small"
                rowKey="key"
                pagination={false}
                columns={qualificationColumns}
                dataSource={qualificationData.map((row) => ({ ...row, image: <FileChip name={row.image} /> }))}
              />
            </Section>

            {/* 品牌信息 */}
            <Section id="brand" title="品牌信息">
              <Table
                className="scd-table"
                bordered
                size="small"
                rowKey="key"
                pagination={false}
                columns={brandColumns}
                dataSource={brandData.map((row) => ({
                  ...row,
                  trademarkFile: <FileChip name={row.trademarkFile} />,
                  authFile: <FileChip name={row.authFile} />
                }))}
              />
            </Section>

            {/* 产品信息 */}
            <Section id="product" title="产品信息">
              <Table
                className="scd-table"
                bordered
                size="small"
                rowKey="key"
                pagination={tablePagination(productData.length)}
                columns={productColumns}
                dataSource={productData.map((row) => ({ ...row, image: <FileChip name={row.image} /> }))}
              />
            </Section>

            {/* 工程业绩 */}
            <Section id="engineering" title="工程业绩">
              <Table
                className="scd-table"
                bordered
                size="small"
                rowKey="key"
                pagination={false}
                columns={engineeringColumns}
                dataSource={engineeringData}
              />
            </Section>

            {/* 荣誉证书 */}
            <Section id="honor" title="荣誉证书">
              <Table
                className="scd-table"
                bordered
                size="small"
                rowKey="key"
                pagination={false}
                columns={honorColumns}
                dataSource={[]}
              />
            </Section>

            {/* 企业信用 */}
            <Section id="credit" title="企业信用">
              <Table
                className="scd-table"
                bordered
                size="small"
                rowKey="key"
                pagination={false}
                columns={creditColumns}
                dataSource={[]}
              />
            </Section>

            {/* 其他资料 */}
            <Section id="other-materials" title="其他资料">
              <Table
                className="scd-table"
                bordered
                size="small"
                rowKey="key"
                pagination={false}
                columns={materialColumns}
                dataSource={[]}
              />
            </Section>
          </div>

          {/* 右侧锚点导航 */}
          <aside className="scd-anchor">
            {ANCHORS.map((anchor) => (
              <div
                key={anchor.id}
                className={`scd-anchor-item ${activeAnchor === anchor.id ? 'active' : ''}`}
                onClick={() => handleAnchorClick(anchor.id)}
              >
                {anchor.label}
              </div>
            ))}
          </aside>
        </div>
      </CentralizedProcurementLayout>
    </ConfigProvider>
  );
};

Component.displayName = 'SupplierCreditDetail';

export default Component;
