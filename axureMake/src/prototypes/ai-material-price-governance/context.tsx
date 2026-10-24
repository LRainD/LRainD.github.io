import React, { createContext, useContext, useMemo, useState } from 'react';
import { message } from 'antd';
import {
  governanceMaterials,
  initialPrices,
  initialStandards,
  initialTasks,
  type GovernanceTask,
  type PageKey,
  type PriceRecord,
  type StandardMaterial
} from './data';

type PriceDecision = '采用' | '存疑' | '不采用';

type DemoContextValue = {
  page: PageKey;
  setPage: (page: PageKey) => void;
  pendingCount: number;
  standardCount: number;
  validPriceCount: number;
  standards: StandardMaterial[];
  prices: PriceRecord[];
  tasks: GovernanceTask[];
  priceDecisions: Record<string, PriceDecision>;
  currentMaterialIndex: number;
  importedFileName: string;
  setImportedFileName: (name: string) => void;
  completeImport: () => void;
  confirmStandard: (selectedAtomKeys: string[]) => void;
  decidePrice: (keys: string[], decision: PriceDecision) => void;
  submitUnmatched: () => void;
  createTask: (task: GovernanceTask) => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export const DemoProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [page, setPage] = useState<PageKey>('overview');
  const [pendingCount, setPendingCount] = useState(1287);
  const [standardCount, setStandardCount] = useState(12480);
  const [validPriceCount, setValidPriceCount] = useState(86421);
  const [standards, setStandards] = useState(initialStandards);
  const [prices] = useState(initialPrices);
  const [tasks, setTasks] = useState(initialTasks);
  const [priceDecisions, setPriceDecisions] = useState<Record<string, PriceDecision>>({});
  const [currentMaterialIndex, setCurrentMaterialIndex] = useState(0);
  const [importedFileName, setImportedFileName] = useState('');

  const completeImport = () => {
    setPendingCount(current => current + 3);
    setTasks(current => [{
      key: `t-${Date.now()}`,
      name: '本次导入物料 AI 治理',
      category: '多品类',
      bureau: '中建八局',
      assignee: '张工',
      deadline: '2026-11-08',
      total: 3,
      completed: 0,
      status: '进行中'
    }, ...current]);
    message.success('3 条物料已进入 AI 拆解队列');
    setPage('governance');
  };

  const confirmStandard = (selectedAtomKeys: string[]) => {
    const material = governanceMaterials[currentMaterialIndex];
    const selectedAtoms = material.atoms.filter(atom => selectedAtomKeys.includes(atom.key));
    const name = selectedAtoms.map(atom => atom.value).join(' ');
    const newStandard: StandardMaterial = {
      key: `s-${Date.now()}`,
      code: `STD-AI-${String(standards.length + 1).padStart(6, '0')}`,
      name,
      category: `建材 / ${material.category}`,
      attributes: selectedAtoms.map(atom => `${atom.label}：${atom.value}`),
      synonyms: [material.sourceName],
      prices: 0,
      updatedAt: '2026-10-23'
    };
    setStandards(current => [newStandard, ...current]);
    setStandardCount(current => current + 1);
    setPendingCount(current => Math.max(0, current - 1));
    setCurrentMaterialIndex(current => (current + 1) % governanceMaterials.length);
    message.success('标准物料已生效，原始叫法已建立映射');
  };

  const decidePrice = (keys: string[], decision: PriceDecision) => {
    const freshAccepted = keys.filter(key => decision === '采用' && priceDecisions[key] !== '采用').length;
    const removedAccepted = keys.filter(key => decision !== '采用' && priceDecisions[key] === '采用').length;
    setPriceDecisions(current => ({ ...current, ...Object.fromEntries(keys.map(key => [key, decision])) }));
    setValidPriceCount(current => current + freshAccepted - removedAccepted);
    message.success(`${keys.length} 条价格记录已标记为“${decision}”`);
  };

  const submitUnmatched = () => {
    setPendingCount(current => current + 1);
    message.success('未匹配清单已提交治理，已生成待处理任务');
    setPage('governance');
  };

  const createTask = (task: GovernanceTask) => {
    setTasks(current => [task, ...current]);
    message.success('治理任务已创建并通知专家');
  };

  const value = useMemo(() => ({
    page, setPage, pendingCount, standardCount, validPriceCount, standards, prices, tasks,
    priceDecisions, currentMaterialIndex, importedFileName, setImportedFileName,
    completeImport, confirmStandard, decidePrice, submitUnmatched, createTask
  }), [page, pendingCount, standardCount, validPriceCount, standards, prices, tasks, priceDecisions, currentMaterialIndex, importedFileName]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
};

export const useDemo = () => {
  const value = useContext(DemoContext);
  if (!value) throw new Error('useDemo must be used inside DemoProvider');
  return value;
};
