/**
 * @name 企业关联-检测结果页
 */
import React, { useState, useRef } from 'react';
import {
  Home,
  Building2,
  AlertTriangle,
  FileCheck,
  Link2,
  Sparkles,
  LayoutGrid,
  HelpCircle,
  Bell,
  User,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import logoImage from '../../../assets/media/image.png';
import './style.css';

interface RelationItem {
  id: string;
  seq: number;
  enterpriseNames: string[];
  relationLevel: number;
  relationDesc: string;
}

const mockRelationData: RelationItem[] = [
  {
    id: '1',
    seq: 1,
    enterpriseNames: ['北京搜狗信息服务有限公司', '北京百度网讯科技有限公司'],
    relationLevel: 3,
    relationDesc: '北京搜狗信息服务有限公司 ←——工商股东：55.00%——广西腾讯创业投资有限公司 ——工商股东：'
  },
  {
    id: '2',
    seq: 2,
    enterpriseNames: ['北京搜狗信息服务有限公司', '北京百度网讯科技有限公司'],
    relationLevel: 4,
    relationDesc: '北京搜狗信息服务有限公司 ←——工商股东：55.00%——广西腾讯创业投资有限公司 ——工商股东：'
  },
  {
    id: '3',
    seq: 3,
    enterpriseNames: ['北京搜狗信息服务有限公司', '北京百度网讯科技有限公司'],
    relationLevel: 4,
    relationDesc: '北京搜狗信息服务有限公司 ←——工商股东：55.00%——广西腾讯创业投资有限公司 ——工商股东：'
  },
  {
    id: '4',
    seq: 4,
    enterpriseNames: ['北京搜狗信息服务有限公司', '北京百度网讯科技有限公司'],
    relationLevel: 4,
    relationDesc: '北京搜狗信息服务有限公司 ——工商股东：2.35%——→ 浙江湖州华卓信息科技有限公司 ←——工商股'
  },
  {
    id: '5',
    seq: 5,
    enterpriseNames: ['北京搜狗信息服务有限公司', '北京百度网讯科技有限公司'],
    relationLevel: 4,
    relationDesc: '北京搜狗信息服务有限公司 ——工商股东：2.35%——→ 浙江湖州华卓信息科技有限公司 ←——工商股'
  },
  {
    id: '6',
    seq: 6,
    enterpriseNames: ['北京搜狗信息服务有限公司', '北京百度网讯科技有限公司'],
    relationLevel: 5,
    relationDesc: '北京搜狗信息服务有限公司 ←——工商股东：55.00%——广西腾讯创业投资有限公司 ——工商股东：'
  }
];

const menuItems = [
  { icon: Home, label: '主页', key: 'home' },
  { icon: Building2, label: '企业检测', key: 'enterprise' },
  { icon: AlertTriangle, label: '风险解析', key: 'risk' },
  { icon: FileCheck, label: '投标智检', key: 'bid' },
  { icon: Link2, label: '企业关联', key: 'relation', active: true },
  { icon: Sparkles, label: '智能清标', key: 'clear' }
];

const serviceItems = [
  { icon: LayoutGrid, label: '应用市场', key: 'market' },
  { icon: HelpCircle, label: '帮助中心', key: 'help' }
];

// 关联图谱弹窗组件
const RelationGraphModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  if (!visible) return null;

  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const SVG_WIDTH = 1600;
  const SVG_HEIGHT = 900;

  const [nodes, setNodes] = useState([
    { id: 'main1', name: '北京百度网讯科技有限公司', x: 400, y: 120, type: 'main' },
    { id: 'main2', name: '北京搜狗信息服务有限公司', x: 1200, y: 120, type: 'main' },
    { id: 'n1', name: '广西腾讯创业投资有限公司', x: 800, y: 280, type: 'node' },
    { id: 'n2', name: '达孜县百瑞翔创业投资...', x: 160, y: 320, type: 'node' },
    { id: 'n3', name: '苏州启明融盛股权投资...', x: 1440, y: 320, type: 'node' },
    { id: 'n4', name: '上海新梨网络科技有限公司', x: 60, y: 580, type: 'node' },
    { id: 'n5', name: '金景声科技南京有限公司', x: 320, y: 580, type: 'node' },
    { id: 'n6', name: '上海无问芯穹智能科技...', x: 640, y: 580, type: 'node' },
    { id: 'n7', name: '北京生数科技股份有限公司', x: 960, y: 580, type: 'node' },
    { id: 'n8', name: '浙江湖州华卓信息科技...', x: 1340, y: 580, type: 'node' },
  ]);

  const edges = [
    { from: 'n2', to: 'main1', label: '工商股东：100%' },
    { from: 'n1', to: 'main1', label: '工商股东：5.47%' },
    { from: 'n1', to: 'main2', label: '工商股东：55.0...' },
    { from: 'n2', to: 'n1', label: '工商股东：5.47%' },
    { from: 'main2', to: 'n6', label: '工商股东：1.38%' },
    { from: 'main1', to: 'n6', label: '工商股东：1.68%' },
    { from: 'main2', to: 'n7', label: '工商股东：2.35%' },
    { from: 'main1', to: 'n7', label: '工商股东：2.35%' },
    { from: 'n3', to: 'n7', label: '工商股东：...' },
    { from: 'main2', to: 'n8', label: '工商股东：2.35%' },
    { from: 'n8', to: 'main2', label: '工商股东：...' },
    { from: 'n4', to: 'n2', label: '工商股东：6.73%' },
    { from: 'n5', to: 'n2', label: '工商股东：5.88%' },
  ];

  const getNodePos = (id: string) => nodes.find(n => n.id === id)!;

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = e.clientX - rect.left;
    const svgY = e.clientY - rect.top;
    dragOffset.current = { x: svgX - node.x, y: svgY - node.y };
    setDraggingNode(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNode || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = e.clientX - rect.left;
    const svgY = e.clientY - rect.top;
    setNodes(prev => prev.map(n =>
      n.id === draggingNode
        ? { ...n, x: svgX - dragOffset.current.x, y: svgY - dragOffset.current.y }
        : n
    ));
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  const renderEdge = (edge: typeof edges[0], index: number) => {
    const from = getNodePos(edge.from);
    const to = getNodePos(edge.to);
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    return (
      <g key={`edge-${index}`}>
        <line
          x1={from.x}
          y1={from.y + 20}
          x2={to.x}
          y2={to.y - 20}
          stroke="#BFBFBF"
          strokeWidth={1}
          markerEnd="url(#arrowhead)"
        />
        <rect
          x={midX - 44}
          y={midY - 9}
          width={88}
          height={18}
          rx={2}
          fill="white"
          opacity={0.95}
        />
        <text
          x={midX}
          y={midY + 4}
          textAnchor="middle"
          fontSize={10}
          fill="#8C8C8C"
        >
          {edge.label}
        </text>
      </g>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-[1400px] max-h-[900px] flex flex-col">
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0F0]">
          <h3 className="text-base font-medium text-[#262626]">关联关系图谱视图</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#F5F5F5] rounded transition-colors"
          >
            <X className="w-4 h-4 text-[#8C8C8C]" />
          </button>
        </div>

        {/* 图例 */}
        <div className="flex items-center justify-end gap-4 px-6 py-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#1677FF]" />
            <span className="text-xs text-[#595959]">关联主体</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#E6F4FF] border border-[#1677FF]" />
            <span className="text-xs text-[#595959]">关联节点</span>
          </div>
        </div>

        {/* 图谱区域 */}
        <div className="flex-1 overflow-auto px-6 pb-4">
          <svg
            ref={svgRef}
            width={SVG_WIDTH}
            height={SVG_HEIGHT}
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            className={draggingNode ? 'cursor-grabbing' : 'cursor-grab'}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="6"
                markerHeight="6"
                refX="5"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 6 3, 0 6" fill="#BFBFBF" />
              </marker>
            </defs>
            {edges.map((edge, i) => renderEdge(edge, i))}
            {nodes.map((node) => (
              <g
                key={node.id}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
                style={{ cursor: 'grab' }}
              >
                <rect
                  x={node.x - 80}
                  y={node.y - 22}
                  width={160}
                  height={44}
                  rx={4}
                  fill={node.type === 'main' ? '#1677FF' : '#E6F4FF'}
                  stroke={node.type === 'main' ? '#1677FF' : '#1677FF'}
                  strokeWidth={1}
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fontSize={11}
                  fill={node.type === 'main' ? '#FFFFFF' : '#262626'}
                  pointerEvents="none"
                >
                  {node.name.length > 14 ? node.name.substring(0, 13) + '...' : node.name}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* 底部关闭按钮 */}
        <div className="flex justify-end px-6 py-4 border-t border-[#F0F0F0]">
          <button
            onClick={onClose}
            className="px-5 py-1.5 text-sm border border-[#D9D9D9] rounded hover:border-[#1677FF] hover:text-[#1677FF] transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default function EnterpriseRelationResult() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [graphModalVisible, setGraphModalVisible] = useState(false);
  const currentStep = 2;

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      {/* 左侧导航栏 */}
      <aside
        className={`${sidebarCollapsed ? 'w-16' : 'w-[200px]'} bg-white border-r border-[#F0F0F0] flex flex-col transition-all duration-300 fixed h-full z-10`}
      >
        {/* LOGO区域 */}
        <div className="h-16 flex items-center px-4">
          {sidebarCollapsed ? (
            <div className="flex items-center justify-center w-full">
              <img
                src={logoImage}
                alt="云筑AI工坊"
                className="w-8 h-8 object-contain"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <img
                src={logoImage}
                alt="云筑AI工坊"
                className="w-8 h-8 object-contain"
              />
              <span className="text-[#262626] font-medium text-sm">云筑AI工坊</span>
            </div>
          )}
        </div>

        {/* 主页 - 独立区域 */}
        <div className="pt-2 pb-2">
          <nav className="px-2">
            <button
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm transition-colors text-[#595959] hover:bg-[#F5F5F5]`}
            >
              <Home className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>主页</span>}
            </button>
          </nav>
        </div>

        {/* 工具模块 */}
        <div className="flex-1 py-2 overflow-y-auto">
          {!sidebarCollapsed && (
            <div className="px-4 mb-2 text-xs text-[#8C8C8C]">工具</div>
          )}
          <nav className="space-y-1 px-2">
            {menuItems.filter(item => item.key !== 'home').map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    item.active
                      ? 'bg-[#E6F4FF] text-[#1677FF]'
                      : 'text-[#595959] hover:bg-[#F5F5F5]'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* 服务模块 */}
          {!sidebarCollapsed && (
            <div className="px-4 mt-6 mb-2 text-xs text-[#8C8C8C]">服务</div>
          )}
          <nav className="space-y-1 px-2">
            {serviceItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#595959] hover:bg-[#F5F5F5] transition-colors"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 底部工具栏 */}
        <div className="border-t border-[#F0F0F0] p-2">
          {sidebarCollapsed && (
            <div className="flex justify-center mb-2">
              <button className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors relative">
                <Bell className="w-4 h-4 text-[#595959]" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF4D4F] text-white text-[10px] rounded-full flex items-center justify-center">
                  10
                </span>
              </button>
            </div>
          )}
          
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-2 mb-2`}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors"
            >
              <Menu className="w-4 h-4 text-[#595959]" />
            </button>
            {!sidebarCollapsed && (
              <button className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors relative">
                <Bell className="w-4 h-4 text-[#595959]" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF4D4F] text-white text-[10px] rounded-full flex items-center justify-center">
                  10
                </span>
              </button>
            )}
          </div>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#595959] hover:bg-[#F5F5F5] transition-colors">
            <div className="w-6 h-6 rounded-full bg-[#1677FF] flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <>
                <span className="flex-1 text-left">jcftest1</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className={`flex-1 ${sidebarCollapsed ? 'ml-16' : 'ml-[200px]'} transition-all duration-300`}>
        <div className="p-6">
          {/* 页面标题区域 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-medium text-[#262626]">企业关联检测</h1>
              <span className="px-3 py-1 bg-[#FFF7E6] text-[#FA8C16] text-xs rounded">企业关联检测结果汇总，支持下载检测报告</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-sm text-[#1677FF] hover:underline">历史检测记录&gt;&gt;&gt;</a>
              <button className="px-4 py-1.5 text-sm border border-[#D9D9D9] rounded hover:border-[#1677FF] hover:text-[#1677FF] transition-colors">
                上一步
              </button>
            </div>
          </div>

          {/* 步骤条 */}
          <div className="bg-white rounded-lg border border-[#F0F0F0] mb-4">
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center">
                {/* 步骤1 */}
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-[#1677FF] text-white">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="ml-2 text-sm font-medium text-[#1677FF]">
                    检测信息设置
                  </span>
                </div>
                {/* 连接线 */}
                <div className="w-24 h-[1px] bg-[#1677FF] mx-4"></div>
                {/* 步骤2 */}
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-[#1677FF] text-white">
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium text-[#1677FF]">
                    检测结果
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 检测结果区域 */}
          <div className="bg-white rounded-lg shadow-sm border border-[#F0F0F0]">
            {/* 检测结果头部 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0F0F0]">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#1677FF] rounded-full" />
                <span className="text-sm font-medium text-[#262626]">检测结果</span>
              </div>
              <button className="px-4 py-1.5 text-sm bg-[#1677FF] text-white rounded hover:bg-[#4096FF] transition-colors">
                生成检测报告
              </button>
            </div>

            {/* 检测信息 */}
            <div className="px-4 py-3 border-b border-[#F0F0F0]">
              <div className="text-sm text-[#595959]">
                <span>检测时间：2026-04-14 20:47:37</span>
              </div>
              <div className="text-sm text-[#595959] mt-1">
                <span>存在企业关联关系的企业：</span>
                <span className="text-[#1677FF]">2</span>
                <span>家</span>
              </div>
              <div className="text-xs text-[#8C8C8C] mt-2">
                以下数据基于公开信息挖掘的成果，仅供参考。该成果不构成任何明示或暗示的观点或保证
              </div>
            </div>

            {/* 表格 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#F0F0F0]">
                    <th className="w-16 px-4 py-3 text-center text-sm font-medium text-[#262626]">序号</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#262626]">企业名称</th>
                    <th className="w-20 px-4 py-3 text-center text-sm font-medium text-[#262626]">关联层...</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#262626]">企业关联关系</th>
                    <th className="w-24 px-4 py-3 text-center text-sm font-medium text-[#262626]">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {mockRelationData.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`border-b border-[#F0F0F0] hover:bg-[#FAFAFA] transition-colors ${
                        index === mockRelationData.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-sm text-[#595959] text-center">{item.seq}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {item.enterpriseNames.map((name, i) => (
                            <span key={i} className="text-sm text-[#595959]">{name}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#595959] text-center">{item.relationLevel}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 bg-[#F0F0F0] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#1677FF] rounded-full"
                              style={{ width: `${Math.min(100, item.relationLevel * 20)}%` }}
                            />
                          </div>
                          <span className="text-xs text-[#8C8C8C] whitespace-nowrap">{item.relationDesc}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => setGraphModalVisible(true)}
                          className="text-sm text-[#1677FF] hover:underline"
                        >
                          查看图谱
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* 关联图谱弹窗 */}
      <RelationGraphModal 
        visible={graphModalVisible} 
        onClose={() => setGraphModalVisible(false)} 
      />
    </div>
  );
}
