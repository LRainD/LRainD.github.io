export interface ContractType {
  key: string;
  name: string;
  code?: string;
  templateCount: number;
  updateTime: string;
  updater: string;
  children?: ContractType[];
}

export const MOCK_DATA: ContractType[] = [
  {
    key: '1',
    name: '136合同中心应用',
    code: 'CONTRACT_CENTER',
    templateCount: 45,
    updateTime: '2026-07-10 15:07:17',
    updater: '幂律专属测试',
    children: [
      { key: '1-1', name: '子分类 1', code: 'SUB_001', templateCount: 10, updateTime: '2026-07-10 15:07:17', updater: '幂律专属测试' },
      { key: '1-2', name: '子分类 2', code: 'SUB_002', templateCount: 35, updateTime: '2026-07-10 15:07:17', updater: '幂律专属测试' }
    ]
  },
  {
    key: '2',
    name: '测试专用分类',
    code: 'TEST',
    templateCount: 9,
    updateTime: '2024-12-11 17:10:06',
    updater: '幂律专属测试'
  },
  {
    key: '3',
    name: '废旧竞价',
    code: 'STO',
    templateCount: 6,
    updateTime: '2025-06-03 14:34:59',
    updater: 'admin'
  },
  {
    key: '4',
    name: '分供商管理',
    code: 'PSUPS',
    templateCount: 2,
    updateTime: '2025-05-20 14:10:52',
    updater: 'jczjgftest',
    children: [
      { key: '4-1', name: '分供商子类', code: 'PSUPS_01', templateCount: 1, updateTime: '2025-05-20 14:10:52', updater: 'jczjgftest' }
    ]
  },
  {
    key: '5',
    name: '合同2.0应用',
    code: 'CONTRACT_V2',
    templateCount: 168,
    updateTime: '2025-11-06 11:51:24',
    updater: 'admin',
    children: [
      { key: '5-1', name: '合同2.0子类', code: 'CONTRACT_V2_01', templateCount: 80, updateTime: '2025-11-06 11:51:24', updater: 'admin' }
    ]
  },
  {
    key: '6',
    name: '招投标2.0应用',
    code: 'TENDER_APP',
    templateCount: 50,
    updateTime: '2025-10-13 17:10:35',
    updater: 'admin',
    children: [
      { key: '6-1', name: '招投标子类', code: 'TENDER_APP_01', templateCount: 25, updateTime: '2025-10-13 17:10:35', updater: 'admin' }
    ]
  },
  {
    key: '7',
    name: '招投标2.0应用(旧)',
    code: 'TENDER_APP_OLD',
    templateCount: 3,
    updateTime: '2024-10-21 09:52:28',
    updater: '宙斯公用账号',
    children: [
      { key: '7-1', name: '旧版子类', code: 'TENDER_OLD_01', templateCount: 1, updateTime: '2024-10-21 09:52:28', updater: '宙斯公用账号' }
    ]
  }
];
