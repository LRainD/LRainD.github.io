/**
 * 资审条件豁免配置 - 模拟数据
 */

// 资格审查条件 - 初始表格数据
export const initialQualConditionData = [
  {
    id: 1,
    purchaseCategory: ['物资'],
    purchaseType: ['招标采购', '区域联采', '战略采购', '集中采购', '分散采购'],
    biddingMethod: ['竞价采购', '询比采购', '谈判采购', '公开招标'],
    conditionItems: [
      { id: 101, conditionItem: '自定义', strength: '强制条件', conditionName: '', category: '', reviewMethod: '人工', mappingCode: '', forceUseType: '不强制使用(推荐)', reviewBasis: '', region: [], applyCategories: [] }
    ]
  }
];

// 树形数据 - 左侧组成列表
export const treeData = [
  {
    title: '蜜蜂工作台',
    key: 'bee-workbench',
    children: []
  },
  {
    title: '运营工作台',
    key: 'operation-workbench',
    children: []
  },
  {
    title: '采购商工作台',
    key: 'buyer-workbench',
    children: [
      {
        title: '招标管理',
        key: 'bidding-mgmt',
        children: [
          { title: '招标/询价列表', key: 'bidding-list' },
          { title: '价格', key: 'price' },
          { title: '保证金管理', key: 'deposit-mgmt' },
          { title: '联采通知/邀约', key: 'joint-procurement' },
          { title: '踏勘', key: 'survey' },
          { title: '通用设置', key: 'general-settings' },
          { title: '招标清单', key: 'bidding-inventory' },
          { title: '电子招投标', key: 'e-bidding' },
          { title: '增补退出', key: 'add-exit' },
          { title: '废标管理', key: 'abandon-mgmt' },
          {
            title: '约标',
            key: 'appointment-bid',
            children: [
              { title: '资格审查附件组成', key: 'data-governance', tag: 'NEW' },
              { title: '采购基础信息-自定义分类配置', key: 'custom-classification', tag: 'NEW' },
              { title: '推送公共服务云台配置', key: 'public-service', tag: 'NEW' }
            ]
          }
        ]
      }
    ]
  }
];

// 采购品类 / 采购类型 / 招标方式选项
export const purchaseCategories = ['物资', '设备', '劳务分包', '专业分包', '专业服务', '租赁'];
export const purchaseTypes = ['招标采购', '区域联采', '战略采购', '集中采购', '分散采购', '电子商城采购'];
export const biddingMethods = ['公开招标', '邀请招标', '询比采购', '竞价采购', '谈判采购'];

// 适用二级品类 - 三级品类树（一级品类 / 二级品类 / 三级品类）
export const applyCategoryTreeData = [
  {
    title: '物资',
    value: '物资',
    children: [
      {
        title: '钢材',
        value: '物资/钢材',
        children: [
          { title: '螺纹钢', value: '物资/钢材/螺纹钢' },
          { title: '盘螺', value: '物资/钢材/盘螺' },
          { title: '线材', value: '物资/钢材/线材' },
          { title: '圆钢', value: '物资/钢材/圆钢' },
          { title: '型钢', value: '物资/钢材/型钢' },
          { title: '钢板', value: '物资/钢材/钢板' }
        ]
      },
      {
        title: '水泥及制品',
        value: '物资/水泥及制品',
        children: [
          { title: '水泥', value: '物资/水泥及制品/水泥' },
          { title: '砂浆', value: '物资/水泥及制品/砂浆' },
          { title: '混凝土外加剂', value: '物资/水泥及制品/混凝土外加剂' },
          { title: '预制构件', value: '物资/水泥及制品/预制构件' }
        ]
      },
      {
        title: '混凝土',
        value: '物资/混凝土',
        children: [
          { title: '预拌混凝土', value: '物资/混凝土/预拌混凝土' },
          { title: '沥青混凝土', value: '物资/混凝土/沥青混凝土' },
          { title: '特种混凝土', value: '物资/混凝土/特种混凝土' }
        ]
      },
      {
        title: '砂石骨料',
        value: '物资/砂石骨料',
        children: [
          { title: '机制砂', value: '物资/砂石骨料/机制砂' },
          { title: '天然砂', value: '物资/砂石骨料/天然砂' },
          { title: '碎石', value: '物资/砂石骨料/碎石' },
          { title: '卵石', value: '物资/砂石骨料/卵石' }
        ]
      },
      {
        title: '管材',
        value: '物资/管材',
        children: [
          { title: '焊接钢管', value: '物资/管材/焊接钢管' },
          { title: '镀锌钢管', value: '物资/管材/镀锌钢管' },
          { title: '无缝钢管', value: '物资/管材/无缝钢管' },
          { title: '塑料管', value: '物资/管材/塑料管' },
          { title: '铸铁管', value: '物资/管材/铸铁管' }
        ]
      },
      {
        title: '电线电缆',
        value: '物资/电线电缆',
        children: [
          { title: '电力电缆', value: '物资/电线电缆/电力电缆' },
          { title: '控制电缆', value: '物资/电线电缆/控制电缆' },
          { title: '布电线', value: '物资/电线电缆/布电线' },
          { title: '通信电缆', value: '物资/电线电缆/通信电缆' }
        ]
      },
      {
        title: '砌体材料',
        value: '物资/砌体材料',
        children: [
          { title: '加气混凝土砌块', value: '物资/砌体材料/加气混凝土砌块' },
          { title: '烧结砖', value: '物资/砌体材料/烧结砖' },
          { title: '空心砖', value: '物资/砌体材料/空心砖' },
          { title: '石材砌块', value: '物资/砌体材料/石材砌块' }
        ]
      }
    ]
  },
  {
    title: '设备',
    value: '设备',
    children: [
      {
        title: '机械设备',
        value: '设备/机械设备',
        children: [
          { title: '起重机械', value: '设备/机械设备/起重机械' },
          { title: '土方机械', value: '设备/机械设备/土方机械' },
          { title: '混凝土机械', value: '设备/机械设备/混凝土机械' },
          { title: '运输车辆', value: '设备/机械设备/运输车辆' }
        ]
      },
      {
        title: '电气设备',
        value: '设备/电气设备',
        children: [
          { title: '变压器', value: '设备/电气设备/变压器' },
          { title: '开关柜', value: '设备/电气设备/开关柜' },
          { title: '配电箱', value: '设备/电气设备/配电箱' },
          { title: '发电机组', value: '设备/电气设备/发电机组' }
        ]
      },
      {
        title: '仪器仪表',
        value: '设备/仪器仪表',
        children: [
          { title: '测量仪器', value: '设备/仪器仪表/测量仪器' },
          { title: '检测仪表', value: '设备/仪器仪表/检测仪表' },
          { title: '试验设备', value: '设备/仪器仪表/试验设备' }
        ]
      },
      {
        title: '电梯',
        value: '设备/电梯',
        children: [
          { title: '乘客电梯', value: '设备/电梯/乘客电梯' },
          { title: '载货电梯', value: '设备/电梯/载货电梯' },
          { title: '自动扶梯', value: '设备/电梯/自动扶梯' }
        ]
      },
      {
        title: '暖通设备',
        value: '设备/暖通设备',
        children: [
          { title: '空调机组', value: '设备/暖通设备/空调机组' },
          { title: '通风机', value: '设备/暖通设备/通风机' },
          { title: '锅炉', value: '设备/暖通设备/锅炉' },
          { title: '冷却塔', value: '设备/暖通设备/冷却塔' }
        ]
      }
    ]
  },
  {
    title: '劳务分包',
    value: '劳务分包',
    children: [
      {
        title: '主体结构劳务',
        value: '劳务分包/主体结构劳务',
        children: [
          { title: '钢筋劳务', value: '劳务分包/主体结构劳务/钢筋劳务' },
          { title: '模板劳务', value: '劳务分包/主体结构劳务/模板劳务' },
          { title: '混凝土劳务', value: '劳务分包/主体结构劳务/混凝土劳务' }
        ]
      },
      {
        title: '土建劳务',
        value: '劳务分包/土建劳务',
        children: [
          { title: '砌筑劳务', value: '劳务分包/土建劳务/砌筑劳务' },
          { title: '抹灰劳务', value: '劳务分包/土建劳务/抹灰劳务' },
          { title: '土方劳务', value: '劳务分包/土建劳务/土方劳务' }
        ]
      },
      {
        title: '安装劳务',
        value: '劳务分包/安装劳务',
        children: [
          { title: '水电安装劳务', value: '劳务分包/安装劳务/水电安装劳务' },
          { title: '管道安装劳务', value: '劳务分包/安装劳务/管道安装劳务' },
          { title: '设备安装劳务', value: '劳务分包/安装劳务/设备安装劳务' }
        ]
      },
      {
        title: '装饰劳务',
        value: '劳务分包/装饰劳务',
        children: [
          { title: '油漆劳务', value: '劳务分包/装饰劳务/油漆劳务' },
          { title: '吊顶劳务', value: '劳务分包/装饰劳务/吊顶劳务' },
          { title: '墙地面劳务', value: '劳务分包/装饰劳务/墙地面劳务' }
        ]
      },
      {
        title: '其他类',
        value: '劳务分包/其他类',
        children: [
          { title: '零星劳务', value: '劳务分包/其他类/零星劳务' },
          { title: '临时用工', value: '劳务分包/其他类/临时用工' }
        ]
      }
    ]
  },
  {
    title: '专业分包',
    value: '专业分包',
    children: [
      {
        title: '地基基础工程专业承包',
        value: '专业分包/地基基础工程专业承包',
        children: [
          { title: '桩基工程', value: '专业分包/地基基础工程专业承包/桩基工程' },
          { title: '基坑支护', value: '专业分包/地基基础工程专业承包/基坑支护' },
          { title: '地基处理', value: '专业分包/地基基础工程专业承包/地基处理' }
        ]
      },
      {
        title: '钢结构工程',
        value: '专业分包/钢结构工程',
        children: [
          { title: '钢结构制作', value: '专业分包/钢结构工程/钢结构制作' },
          { title: '钢结构安装', value: '专业分包/钢结构工程/钢结构安装' }
        ]
      },
      {
        title: '幕墙工程',
        value: '专业分包/幕墙工程',
        children: [
          { title: '玻璃幕墙', value: '专业分包/幕墙工程/玻璃幕墙' },
          { title: '石材幕墙', value: '专业分包/幕墙工程/石材幕墙' },
          { title: '金属幕墙', value: '专业分包/幕墙工程/金属幕墙' }
        ]
      },
      {
        title: '机电安装工程',
        value: '专业分包/机电安装工程',
        children: [
          { title: '给排水安装', value: '专业分包/机电安装工程/给排水安装' },
          { title: '暖通安装', value: '专业分包/机电安装工程/暖通安装' },
          { title: '电气安装', value: '专业分包/机电安装工程/电气安装' }
        ]
      },
      {
        title: '消防设施工程',
        value: '专业分包/消防设施工程',
        children: [
          { title: '消防水系统', value: '专业分包/消防设施工程/消防水系统' },
          { title: '消防电系统', value: '专业分包/消防设施工程/消防电系统' }
        ]
      },
      {
        title: '建筑装饰装修工程',
        value: '专业分包/建筑装饰装修工程',
        children: [
          { title: '室内装修', value: '专业分包/建筑装饰装修工程/室内装修' },
          { title: '外立面装修', value: '专业分包/建筑装饰装修工程/外立面装修' }
        ]
      }
    ]
  },
  {
    title: '专业服务',
    value: '专业服务',
    children: [
      {
        title: '勘察设计',
        value: '专业服务/勘察设计',
        children: [
          { title: '工程勘察', value: '专业服务/勘察设计/工程勘察' },
          { title: '工程设计', value: '专业服务/勘察设计/工程设计' }
        ]
      },
      {
        title: '工程监理',
        value: '专业服务/工程监理',
        children: [
          { title: '施工监理', value: '专业服务/工程监理/施工监理' },
          { title: '设备监理', value: '专业服务/工程监理/设备监理' }
        ]
      },
      {
        title: '检测检验',
        value: '专业服务/检测检验',
        children: [
          { title: '材料检测', value: '专业服务/检测检验/材料检测' },
          { title: '结构检测', value: '专业服务/检测检验/结构检测' },
          { title: '无损检测', value: '专业服务/检测检验/无损检测' }
        ]
      },
      {
        title: '造价咨询',
        value: '专业服务/造价咨询',
        children: [
          { title: '预算编制', value: '专业服务/造价咨询/预算编制' },
          { title: '结算审核', value: '专业服务/造价咨询/结算审核' }
        ]
      },
      {
        title: '招标代理',
        value: '专业服务/招标代理',
        children: [
          { title: '招标代理服务', value: '专业服务/招标代理/招标代理服务' }
        ]
      }
    ]
  },
  {
    title: '租赁',
    value: '租赁',
    children: [
      {
        title: '设备租赁',
        value: '租赁/设备租赁',
        children: [
          { title: '塔吊租赁', value: '租赁/设备租赁/塔吊租赁' },
          { title: '施工电梯租赁', value: '租赁/设备租赁/施工电梯租赁' },
          { title: '泵车租赁', value: '租赁/设备租赁/泵车租赁' }
        ]
      },
      {
        title: '周转材料租赁',
        value: '租赁/周转材料租赁',
        children: [
          { title: '脚手架租赁', value: '租赁/周转材料租赁/脚手架租赁' },
          { title: '模板租赁', value: '租赁/周转材料租赁/模板租赁' }
        ]
      }
    ]
  }
];

// 区域 - 区域树（全国 / 省·直辖市 / 市 / 区县）
export const regionTreeData = [
  {
    title: '全国',
    value: '全国',
    children: [
      {
        title: '北京市',
        value: '全国/北京市',
        children: [
          {
            title: '市辖区',
            value: '全国/北京市/市辖区',
            children: [
              { title: '东城区', value: '全国/北京市/市辖区/东城区' },
              { title: '西城区', value: '全国/北京市/市辖区/西城区' },
              { title: '朝阳区', value: '全国/北京市/市辖区/朝阳区' },
              { title: '海淀区', value: '全国/北京市/市辖区/海淀区' }
            ]
          }
        ]
      },
      {
        title: '上海市',
        value: '全国/上海市',
        children: [
          {
            title: '市辖区',
            value: '全国/上海市/市辖区',
            children: [
              { title: '黄浦区', value: '全国/上海市/市辖区/黄浦区' },
              { title: '徐汇区', value: '全国/上海市/市辖区/徐汇区' },
              { title: '浦东新区', value: '全国/上海市/市辖区/浦东新区' },
              { title: '闵行区', value: '全国/上海市/市辖区/闵行区' }
            ]
          }
        ]
      },
      {
        title: '广东省',
        value: '全国/广东省',
        children: [
          {
            title: '广州市',
            value: '全国/广东省/广州市',
            children: [
              { title: '天河区', value: '全国/广东省/广州市/天河区' },
              { title: '越秀区', value: '全国/广东省/广州市/越秀区' },
              { title: '番禺区', value: '全国/广东省/广州市/番禺区' }
            ]
          },
          {
            title: '深圳市',
            value: '全国/广东省/深圳市',
            children: [
              { title: '福田区', value: '全国/广东省/深圳市/福田区' },
              { title: '南山区', value: '全国/广东省/深圳市/南山区' },
              { title: '宝安区', value: '全国/广东省/深圳市/宝安区' }
            ]
          },
          {
            title: '佛山市',
            value: '全国/广东省/佛山市',
            children: [
              { title: '禅城区', value: '全国/广东省/佛山市/禅城区' },
              { title: '南海区', value: '全国/广东省/佛山市/南海区' },
              { title: '顺德区', value: '全国/广东省/佛山市/顺德区' }
            ]
          },
          { title: '东莞市', value: '全国/广东省/东莞市' }
        ]
      },
      {
        title: '江苏省',
        value: '全国/江苏省',
        children: [
          {
            title: '南京市',
            value: '全国/江苏省/南京市',
            children: [
              { title: '玄武区', value: '全国/江苏省/南京市/玄武区' },
              { title: '鼓楼区', value: '全国/江苏省/南京市/鼓楼区' },
              { title: '江宁区', value: '全国/江苏省/南京市/江宁区' }
            ]
          },
          {
            title: '苏州市',
            value: '全国/江苏省/苏州市',
            children: [
              { title: '姑苏区', value: '全国/江苏省/苏州市/姑苏区' },
              { title: '工业园区', value: '全国/江苏省/苏州市/工业园区' },
              { title: '吴中区', value: '全国/江苏省/苏州市/吴中区' }
            ]
          },
          {
            title: '无锡市',
            value: '全国/江苏省/无锡市',
            children: [
              { title: '梁溪区', value: '全国/江苏省/无锡市/梁溪区' },
              { title: '滨湖区', value: '全国/江苏省/无锡市/滨湖区' }
            ]
          }
        ]
      },
      {
        title: '浙江省',
        value: '全国/浙江省',
        children: [
          {
            title: '杭州市',
            value: '全国/浙江省/杭州市',
            children: [
              { title: '上城区', value: '全国/浙江省/杭州市/上城区' },
              { title: '西湖区', value: '全国/浙江省/杭州市/西湖区' },
              { title: '余杭区', value: '全国/浙江省/杭州市/余杭区' }
            ]
          },
          {
            title: '宁波市',
            value: '全国/浙江省/宁波市',
            children: [
              { title: '海曙区', value: '全国/浙江省/宁波市/海曙区' },
              { title: '鄞州区', value: '全国/浙江省/宁波市/鄞州区' }
            ]
          },
          {
            title: '温州市',
            value: '全国/浙江省/温州市',
            children: [
              { title: '鹿城区', value: '全国/浙江省/温州市/鹿城区' },
              { title: '瓯海区', value: '全国/浙江省/温州市/瓯海区' }
            ]
          }
        ]
      },
      {
        title: '四川省',
        value: '全国/四川省',
        children: [
          {
            title: '成都市',
            value: '全国/四川省/成都市',
            children: [
              { title: '锦江区', value: '全国/四川省/成都市/锦江区' },
              { title: '武侯区', value: '全国/四川省/成都市/武侯区' },
              { title: '高新区', value: '全国/四川省/成都市/高新区' }
            ]
          },
          {
            title: '绵阳市',
            value: '全国/四川省/绵阳市',
            children: [
              { title: '涪城区', value: '全国/四川省/绵阳市/涪城区' },
              { title: '游仙区', value: '全国/四川省/绵阳市/游仙区' }
            ]
          },
          {
            title: '宜宾市',
            value: '全国/四川省/宜宾市',
            children: [
              { title: '翠屏区', value: '全国/四川省/宜宾市/翠屏区' },
              { title: '叙州区', value: '全国/四川省/宜宾市/叙州区' }
            ]
          }
        ]
      },
      {
        title: '贵州省',
        value: '全国/贵州省',
        children: [
          {
            title: '贵阳市',
            value: '全国/贵州省/贵阳市',
            children: [
              { title: '南明区', value: '全国/贵州省/贵阳市/南明区' },
              { title: '云岩区', value: '全国/贵州省/贵阳市/云岩区' },
              { title: '观山湖区', value: '全国/贵州省/贵阳市/观山湖区' }
            ]
          },
          {
            title: '遵义市',
            value: '全国/贵州省/遵义市',
            children: [
              { title: '红花岗区', value: '全国/贵州省/遵义市/红花岗区' },
              { title: '汇川区', value: '全国/贵州省/遵义市/汇川区' }
            ]
          },
          {
            title: '毕节市',
            value: '全国/贵州省/毕节市',
            children: [
              { title: '七星关区', value: '全国/贵州省/毕节市/七星关区' },
              { title: '大方县', value: '全国/贵州省/毕节市/大方县' }
            ]
          }
        ]
      },
      {
        title: '湖北省',
        value: '全国/湖北省',
        children: [
          {
            title: '武汉市',
            value: '全国/湖北省/武汉市',
            children: [
              { title: '江岸区', value: '全国/湖北省/武汉市/江岸区' },
              { title: '武昌区', value: '全国/湖北省/武汉市/武昌区' },
              { title: '洪山区', value: '全国/湖北省/武汉市/洪山区' }
            ]
          },
          {
            title: '宜昌市',
            value: '全国/湖北省/宜昌市',
            children: [
              { title: '西陵区', value: '全国/湖北省/宜昌市/西陵区' },
              { title: '伍家岗区', value: '全国/湖北省/宜昌市/伍家岗区' }
            ]
          },
          {
            title: '襄阳市',
            value: '全国/湖北省/襄阳市',
            children: [
              { title: '襄城区', value: '全国/湖北省/襄阳市/襄城区' },
              { title: '樊城区', value: '全国/湖北省/襄阳市/樊城区' }
            ]
          }
        ]
      },
      {
        title: '陕西省',
        value: '全国/陕西省',
        children: [
          {
            title: '西安市',
            value: '全国/陕西省/西安市',
            children: [
              { title: '雁塔区', value: '全国/陕西省/西安市/雁塔区' },
              { title: '碑林区', value: '全国/陕西省/西安市/碑林区' },
              { title: '未央区', value: '全国/陕西省/西安市/未央区' }
            ]
          },
          {
            title: '咸阳市',
            value: '全国/陕西省/咸阳市',
            children: [
              { title: '秦都区', value: '全国/陕西省/咸阳市/秦都区' },
              { title: '渭城区', value: '全国/陕西省/咸阳市/渭城区' }
            ]
          }
        ]
      }
    ]
  }
];

