/**
 * @name 采购基础信息
 * @description 集采工作台-采购基础信息页，高保真还原截图：流程步骤条、基本信息表单、项目信息、附加信息。
 * @mode axure
 *
 * 参考资料：
 * - /docs/design/design.md
 * - /src/components/centralized-procurement-layout/index.tsx
 */

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Plus,
  PackageOpen,
  ContactRound
} from 'lucide-react';
import { Button, ConfigProvider, Input, InputNumber, Radio, Select, Space, Upload } from 'antd';
import type { ThemeConfig, UploadFile } from 'antd';
import CentralizedProcurementLayout from '../../components/centralized-procurement-layout';
import StepBar from '../../components/step-bar';
import './style.css';

/** 子步骤（与截图一致） */
const SUB_STEP_LIST = [
  '采购基本信息',
  '编制采购清单',
  '编制采购公告',
  '发布采购公告',
  '报名与资审汇总',
  '资审结果通知'
];

/** antd 主题：对齐设计稿主色与 2px 圆角 */
const THEME: ThemeConfig = {
  token: {
    colorPrimary: '#0081cc',
    colorText: '#262626',
    colorTextPlaceholder: '#bfbfbf',
    colorBorder: '#d9d9d9',
    borderRadius: 2,
    controlHeight: 32,
    fontSize: 13
  },
  components: {
    Button: { primaryShadow: 'none' },
    Select: { optionSelectedBg: '#e6f4ff' }
  }
};

interface SectionState {
  basic: boolean;
  project: boolean;
  extra: boolean;
}

const Component = () => {
  const [sections, setSections] = useState<SectionState>({
    basic: true,
    project: true,
    extra: true
  });

  const [form, setForm] = useState({
    purchaseName: '',
    cooperationCategory: '钢筋',
    purchaseCategory: '物资-钢材',
    organization: '中国建筑股份有限公司',
    handler: '奥巴马',
    contractType: '',
    currency: '人民币',
    amount: '',
    splitOrder: 'no',
    inviteMode: '',
    greenPurchase: 'no'
  });

  const [remark, setRemark] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const toggleSection = (key: keyof SectionState) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateField = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <CentralizedProcurementLayout
      username="奥巴马"
      orgName="中国建筑股份..."
      activeMenuKey="procurement-list"
      defaultCollapsed
    >
      <ConfigProvider theme={THEME}>
        <div className="pbi-page">
          {/* 面包屑 + 操作栏 */}
          <div className="pbi-head">
            <div className="pbi-breadcrumb">
              <span>采购列表</span>
              <span className="pbi-breadcrumb-sep">&gt;</span>
              <span>采购基础信息</span>
            </div>
            <div className="pbi-toolbar">
              <span className="pbi-category-tag">物资</span>
              <div className="pbi-toolbar-actions">
                <Button type="primary">保存</Button>
                <Button type="primary">下一步</Button>
              </div>
            </div>
          </div>

          {/* 流程步骤 */}
          <StepBar
            className="pbi-stepbar"
            currentMainStep={0}
            currentSubStep={0}
            subSteps={SUB_STEP_LIST}
          />

          {/* 基本信息 */}
          <div className="pbi-card">
            <div className="pbi-card-head">
              <div className="pbi-card-title" onClick={() => toggleSection('basic')}>
                <span className="pbi-title-bar" />
                <span>基本信息</span>
              </div>
              <div className="pbi-head-right">
                <button className="pbi-ai-btn">
                  <Sparkles size={13} />
                  智能推荐
                </button>
                <span className="pbi-collapse" onClick={() => toggleSection('basic')}>
                  {sections.basic ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </div>
            </div>

            {sections.basic && (
              <div className="pbi-form">
                {/* 创建人 */}
                <div className="pbi-field">
                  <label className="pbi-label"><span className="pbi-required">*</span>创建人：</label>
                  <div className="pbi-control">
                    <div className="pbi-static">奥巴马</div>
                  </div>
                </div>
                {/* 创建时间 */}
                <div className="pbi-field">
                  <label className="pbi-label"><span className="pbi-required">*</span>创建时间：</label>
                  <div className="pbi-control">
                    <div className="pbi-static pbi-static-placeholder">保存后生成</div>
                  </div>
                </div>
                {/* 采购编号 */}
                <div className="pbi-field">
                  <label className="pbi-label"><span className="pbi-required">*</span>采购编号：</label>
                  <div className="pbi-control">
                    <div className="pbi-static pbi-static-placeholder">保存后生成</div>
                  </div>
                </div>
                {/* 采购名称 */}
                <div className="pbi-field">
                  <label className="pbi-label"><span className="pbi-required">*</span>采购名称：</label>
                  <div className="pbi-control">
                    <Input
                      placeholder="请输入"
                      value={form.purchaseName}
                      onChange={e => updateField('purchaseName', e.target.value)}
                    />
                  </div>
                </div>

                {/* 合作品类 */}
                <div className="pbi-field">
                  <label className="pbi-label"><span className="pbi-required">*</span>合作品类：</label>
                  <div className="pbi-control">
                    <Select
                      placeholder="请选择"
                      value={form.cooperationCategory || undefined}
                      onChange={value => updateField('cooperationCategory', value)}
                      options={[
                        { value: '钢筋', label: '钢筋' },
                        { value: '混凝土', label: '混凝土' },
                        { value: '水泥', label: '水泥' }
                      ]}
                    />
                  </div>
                </div>
                {/* 采购品类 */}
                <div className="pbi-field">
                  <label className="pbi-label"><span className="pbi-required">*</span>采购品类：</label>
                  <div className="pbi-control">
                    <Select
                      placeholder="请选择"
                      value={form.purchaseCategory || undefined}
                      onChange={value => updateField('purchaseCategory', value)}
                      options={[
                        { value: '物资-钢材', label: '物资-钢材' },
                        { value: '物资-水泥', label: '物资-水泥' },
                        { value: '设备-塔吊', label: '设备-塔吊' }
                      ]}
                    />
                  </div>
                </div>
                {/* 组织机构 */}
                <div className="pbi-field">
                  <label className="pbi-label"><span className="pbi-required">*</span>组织机构：</label>
                  <div className="pbi-control">
                    <Select
                      value={form.organization}
                      onChange={value => updateField('organization', value)}
                      options={[
                        { value: '中国建筑股份有限公司', label: '中国建筑股份有限公司' },
                        { value: '中国建筑第八工程局有限公司', label: '中国建筑第八工程局有限公司' }
                      ]}
                    />
                  </div>
                </div>

                {/* 经办人 */}
                <div className="pbi-field">
                  <label className="pbi-label"><span className="pbi-required">*</span>经办人：</label>
                  <div className="pbi-control">
                    <Input
                      value={form.handler}
                      onChange={e => updateField('handler', e.target.value)}
                      suffix={<ContactRound size={14} style={{ color: '#bfbfbf' }} />}
                    />
                  </div>
                </div>
                {/* 组织形式 */}
                <div className="pbi-field">
                  <label className="pbi-label"><span className="pbi-required">*</span>组织形式：</label>
                  <div className="pbi-control">
                    <div className="pbi-static">分散采购</div>
                  </div>
                </div>
                {/* 采购方式 */}
                <div className="pbi-field">
                  <label className="pbi-label"><span className="pbi-required">*</span>采购方式：</label>
                  <div className="pbi-control">
                    <div className="pbi-static">询比采购</div>
                  </div>
                </div>
                {/* 合同类型 */}
                <div className="pbi-field">
                  <label className="pbi-label"><span className="pbi-required">*</span>合同类型：</label>
                  <div className="pbi-control">
                    <Select
                      placeholder="请选择合同类型"
                      value={form.contractType || undefined}
                      onChange={value => updateField('contractType', value)}
                      options={[
                        { value: '买卖合同', label: '买卖合同' },
                        { value: '服务合同', label: '服务合同' }
                      ]}
                    />
                  </div>
                </div>

                {/* 概算金额 */}
                <div className="pbi-field">
                  <label className="pbi-label"><span className="pbi-required">*</span>概算金额：</label>
                  <div className="pbi-control pbi-control-amount">
                    <div className="pbi-amount">
                      <Space.Compact style={{ flex: 1, minWidth: 0 }}>
                        <Select
                          value={form.currency}
                          onChange={value => updateField('currency', value)}
                          options={[
                            { value: '人民币', label: '人民币' },
                            { value: '美元', label: '美元' }
                          ]}
                          style={{ width: 82 }}
                        />
                        <InputNumber
                          placeholder="请输入"
                          controls={false}
                          value={form.amount === '' ? null : Number(form.amount)}
                          onChange={value =>
                            updateField('amount', value === null || value === undefined ? '' : String(value))
                          }
                          style={{ flex: 1, width: 'auto' }}
                        />
                      </Space.Compact>
                      <span className="pbi-amount-unit">万</span>
                    </div>
                  </div>
                </div>
                {/* 分清单成交 */}
                <div className="pbi-field">
                  <label className="pbi-label pbi-label-wide">
                    <span className="pbi-required">*</span>分清单成交
                    <Info className="pbi-info-icon" size={12} />
                    ：
                  </label>
                  <div className="pbi-control">
                    <Radio.Group
                      className="pbi-radios"
                      value={form.splitOrder}
                      onChange={e => updateField('splitOrder', e.target.value)}
                    >
                      <Radio value="yes">是</Radio>
                      <Radio value="no">否</Radio>
                    </Radio.Group>
                  </div>
                </div>
                {/* 邀请分供商方式 */}
                <div className="pbi-field">
                  <label className="pbi-label pbi-label-wide pbi-label-multiline">
                    <span>
                      <span className="pbi-required">*</span>邀请分供商方式
                      <Info className="pbi-info-icon" size={12} />
                      ：
                    </span>
                    <span className="pbi-label-sub">（原:是否公开）</span>
                  </label>
                  <div className="pbi-control">
                    <Select
                      placeholder="请选择"
                      value={form.inviteMode || undefined}
                      onChange={value => updateField('inviteMode', value)}
                      options={[
                        { value: '公开', label: '公开' },
                        { value: '邀请', label: '邀请' }
                      ]}
                    />
                  </div>
                </div>
                {/* 是否绿色采购 */}
                <div className="pbi-field">
                  <label className="pbi-label pbi-label-wide">
                    <span className="pbi-required">*</span>是否绿色采购
                    <Info className="pbi-info-icon" size={12} />
                    ：
                  </label>
                  <div className="pbi-control">
                    <Radio.Group
                      className="pbi-radios"
                      value={form.greenPurchase}
                      onChange={e => updateField('greenPurchase', e.target.value)}
                    >
                      <Radio value="yes">是</Radio>
                      <Radio value="no">否</Radio>
                    </Radio.Group>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 项目信息 */}
          <div className="pbi-card">
            <div className="pbi-card-head">
              <div className="pbi-card-title" onClick={() => toggleSection('project')}>
                <span className="pbi-title-bar" />
                <span>项目信息</span>
              </div>
              <div className="pbi-head-right">
                <Button type="primary" className="pbi-btn-sm">选择项目</Button>
                <span className="pbi-collapse" onClick={() => toggleSection('project')}>
                  {sections.project ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </div>
            </div>
            {sections.project && (
              <div className="pbi-empty">
                <PackageOpen className="pbi-empty-icon" size={72} strokeWidth={1} />
                <span className="pbi-empty-text">暂无数据</span>
              </div>
            )}
          </div>

          {/* 附加信息 */}
          <div className="pbi-card">
            <div className="pbi-card-head">
              <div className="pbi-card-title" onClick={() => toggleSection('extra')}>
                <span className="pbi-title-bar" />
                <span>附加信息</span>
              </div>
            </div>
            {sections.extra && (
              <div className="pbi-extra-body">
                <div className="pbi-remark">
                  <label className="pbi-label pbi-remark-label">备注：</label>
                  <div className="pbi-remark-control">
                    <Input.TextArea
                      className="pbi-textarea"
                      maxLength={500}
                      value={remark}
                      onChange={e => setRemark(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pbi-attachment">
                  <label className="pbi-label pbi-attachment-label">附件：</label>
                  <div className="pbi-attachment-content">
                    <div className="pbi-attachment-meta">
                      <span className="pbi-attachment-gap">大小限制：500M</span>
                      <span>
                        支持格式：jpeg.jpg.gif.png.doc.docx.xls.xlsx.xlsx.txt.pdf.rar.zip.7z.tar.jar.dwg.dws.dwt.dxf.csv
                      </span>
                    </div>
                    <Upload
                      className="pbi-upload"
                      multiple
                      fileList={fileList}
                      beforeUpload={() => false}
                      onChange={({ fileList: nextFileList }) => setFileList(nextFileList)}
                    >
                      <Button icon={<Plus size={14} />}>添加附件</Button>
                    </Upload>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ConfigProvider>
    </CentralizedProcurementLayout>
  );
};

Component.displayName = 'ProcurementBaseInfo';

export default Component;
