import React, { useState } from 'react';
import { Alert, Button, Input, Select, Space, Steps, Table, Tag, Upload, message } from 'antd';
import { ArrowRightOutlined, InboxOutlined } from '@ant-design/icons';
import { useDemo } from './context';
import { PageHeader, Surface } from './shared';

const previewRows = [
  { key: '1', name: 'HRB400E Φ25mm 热轧带肋抗震钢筋', spec: 'Φ25mm / HRB400E', unit: '吨', quantity: 120, source: '采购清单' },
  { key: '2', name: '三级抗震螺纹钢 20', spec: '20 / 三级钢', unit: '吨', quantity: 85, source: '采购清单' },
  { key: '3', name: '螺旋节能灯 22W E27 暖光', spec: '22W / E27 / 暖光', unit: '个', quantity: 600, source: '采购清单' }
];

const mappingRows = [
  ['材料名称', '物料名称', 'name'], ['规格型号', '规格描述', 'spec'], ['计量单位', '单位', 'unit'], ['工程数量', '数量', 'quantity'], ['含税单价', '单价', 'price']
];

export const ImportPage: React.FC = () => {
  const { importedFileName, setImportedFileName, completeImport } = useDemo();
  const [step, setStep] = useState(importedFileName ? 1 : 0);
  const [mappings, setMappings] = useState<Record<string, string>>(Object.fromEntries(mappingRows.map(row => [row[2], row[1]])));
  const uploadProps = {
    multiple: true,
    accept: '.xlsx,.xls,.pdf,.docx',
    showUploadList: false,
    beforeUpload: file => {
      setImportedFileName(file.name);
      setStep(1);
      message.success(`${file.name} 解析完成`);
      return false;
    }
  };

  return <>
    <PageHeader
      title="数据源接入"
      subtitle="接入采购清单、合同与招标文件，统一映射后进入 AI 原子化拆解"
      action={<Tag color="blue">单次支持 50 万条</Tag>}
    />
    <Surface className="pg-import-card">
      <Steps current={step} items={[{ title: '上传数据' }, { title: '字段映射' }, { title: '确认导入' }]} style={{ marginBottom: 24 }} />
      {step === 0 && <div className="pg-upload-card">
        <Alert showIcon type="info" message="价格与品牌数据优先使用合同文本，其次为招标清单；结算单暂不纳入治理范围。" style={{ marginBottom: 16 }} />
        <Upload.Dragger {...uploadProps}>
          <p className="pg-upload-icon"><InboxOutlined /></p>
          <p className="ant-upload-text">拖拽文件到此处，或点击选择文件</p>
          <p className="ant-upload-hint">支持 Excel、PDF、Word；单个文件不超过 100MB</p>
        </Upload.Dragger>
        <div className="pg-empty-action"><Button type="primary" onClick={() => { setImportedFileName('某住宅项目招标物料清单.xlsx'); setStep(1); }}>使用演示文件</Button></div>
      </div>}

      {step === 1 && <>
        <Alert showIcon type="success" message={`已识别文件：${importedFileName || '某住宅项目招标物料清单.xlsx'}，共 3 条物料记录，字段识别准确率 97.3%。`} style={{ marginBottom: 12 }} />
        <Surface type="inner" title="字段映射">
          {mappingRows.map(([source, target, key]) => <div className="pg-mapping-row" key={key}>
            <Input value={source} readOnly /><span className="pg-mapping-arrow"><ArrowRightOutlined /></span>
            <Select value={mappings[key]} options={['物料名称', '规格描述', '单位', '数量', '单价', '忽略'].map(value => ({ value, label: value }))} onChange={value => setMappings(current => ({ ...current, [key]: value }))} />
            <Tag color={mappings[key] === '忽略' ? 'default' : 'success'}>{mappings[key] === target ? 'AI 已匹配' : '已调整'}</Tag>
          </div>)}
        </Surface>
        <div className="pg-step-actions"><Button onClick={() => setStep(0)}>上一步</Button><Button type="primary" onClick={() => setStep(2)}>预览数据</Button></div>
      </>}

      {step === 2 && <>
        <Alert showIcon type="warning" message="确认后将执行去重、单位归一和 AI 原子化拆解。3 条数据中有 1 条中置信度记录，需要专家确认。" />
        <Table className="pg-preview-table" dataSource={previewRows} rowKey="key" pagination={false} columns={[
          { title: '原始物料名称', dataIndex: 'name', key: 'name' },
          { title: '规格', dataIndex: 'spec', key: 'spec' },
          { title: '单位', dataIndex: 'unit', key: 'unit', width: 80 },
          { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 90 },
          { title: '来源', dataIndex: 'source', key: 'source', width: 100 }
        ]} />
        <div className="pg-step-actions"><Button onClick={() => setStep(1)}>上一步</Button><Space><Button onClick={() => message.success('映射规则已保存为模板')}>保存映射模板</Button><Button type="primary" onClick={completeImport}>确认并开始 AI 拆解</Button></Space></div>
      </>}
    </Surface>
  </>;
};
