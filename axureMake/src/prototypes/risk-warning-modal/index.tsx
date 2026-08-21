/**
 * @name 风控预警弹窗
 */
import React, { useState } from 'react';
import { 
  AlertCircle, 
  X, 
  Plus, 
  Download,
  Search,
  ChevronDown,
  Home,
  Monitor,
  Send,
  ArrowRightLeft,
  Star,
  HelpCircle,
  Bell,
  Shield,
  ShoppingCart,
  Users,
  Gavel,
  HardHat,
  Link,
  FileText,
  AlertTriangle,
  Banknote,
  CheckCircle,
  Inbox,
  List,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  CheckCircle2,
  Paperclip
} from 'lucide-react';
import './style.css';

interface RiskItem {
  id: number;
  displayIndex: number; // 序号从1开始
  name: string;
  scene: string;
  status: string;
  info: string;
  suggestion: string;
  mode: string;
  description: string;
  attachments: string[];
  selected?: boolean;
  satisfaction?: 'like' | 'dislike' | null;
}

const initialData: RiskItem[] = [
  {
    id: 1,
    displayIndex: 1,
    name: '法人失信被执行人',
    scene: '风控预警',
    status: '待处置',
    info: '经系统检测，以下供应商法人存在失信被执行记录：sup101 (李华)，请核实风险。',
    suggestion: '建议根据组织管理要求进行处理，必要时要求供应商提供合规证明。',
    mode: '及时处置',
    description: '',
    attachments: [],
    selected: false
  },
  {
    id: 2,
    displayIndex: 2,
    name: '工商状态变更预警',
    scene: '风控预警',
    status: '待处置',
    info: '发现供应商 sup105 工商状态变更为“经营异常”，可能影响履约能力。',
    suggestion: '核实异常原因，评估对当前采购项目的风险影响。',
    mode: '事后处置',
    description: '',
    attachments: [],
    selected: false
  },
  {
    id: 3,
    displayIndex: 3,
    name: '信息重叠',
    scene: '风控预警',
    status: '待处置',
    info: '当前供应商存在多项信息重叠，是否继续当前操作？涉及信息重叠的供应商如下：sup203, 彭才林, 钟莉, sup201, sup300, sup247, sup330, sup332',
    suggestion: '建议根据组织管理要求进行处理',
    mode: '事后处置',
    description: '',
    attachments: [],
    selected: false
  },
  {
    id: 4,
    displayIndex: 4,
    name: '严重失信违法企业',
    scene: '风控预警',
    status: '待处置',
    info: '有1个供应商存在严重违法或失信被执行人，如下：sup330;',
    suggestion: '建议根据组织管理要求进行处理',
    mode: '事后处置',
    description: '',
    attachments: [],
    selected: false
  },
  {
    id: 5,
    displayIndex: 5,
    name: '企业经营状态异常',
    scene: '风控预警',
    status: '待处置',
    info: '有2个供应商企业经营状态异常，如下：sup247, sup330;',
    suggestion: '建议根据组织管理要求进行处理',
    mode: '事后处置',
    description: '',
    attachments: [],
    selected: false
  },
  {
    id: 6,
    displayIndex: 6,
    name: '招标企业资质校验',
    scene: '风控预警',
    status: '待处置',
    info: '您勾选的供应商有2个不满足企业资质承接范围校验，如下：彭才林, sup300; 查看企业资质承接范围校验规则',
    suggestion: '建议根据组织管理要求进行处理',
    mode: '及时处置',
    description: '',
    attachments: [],
    selected: true
  },
  {
    id: 7,
    displayIndex: 7,
    name: '资审不通过理由校验',
    scene: '合规自查, 风控预警',
    status: '无需处置',
    info: '本次资审不通过供应商中存在2家未填写资审备注（资审不通过原因）',
    suggestion: '资审不通过供应商在资审备注中填写不通过原因',
    mode: '--',
    description: '无需处置',
    attachments: [],
    selected: false
  }
];

const Component: React.FC = () => {
  const [data, setData] = useState<RiskItem[]>(initialData);
  const [isOpen, setIsOpen] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean; itemId: number | null }>({
    isOpen: false,
    itemId: null
  });
  const [problemType, setProblemType] = useState<string>('');

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const handleSatisfaction = (id: number, type: 'like' | 'dislike') => {
    setData(prev => prev.map(item => {
      if (item.id === id) {
        const newValue = item.satisfaction === type ? null : type;
        if (newValue) {
          showToast(type === 'like' ? '感谢您的好评！' : '感谢您的反馈，我们会持续改进。');
        }
        return { ...item, satisfaction: newValue };
      }
      return item;
    }));
  };

  const toggleSelect = (id: number) => {
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const selectedCount = data.filter(item => item.selected).length;

  return (
    <div className="h-screen flex flex-col bg-page text-sm overflow-hidden relative">
      {/* Background Page (Bidding List Mockup) */}
      <header className="h-[56px] bg-white border-b border-border-base flex items-center justify-between px-4 shrink-0 shadow-sm z-10 relative">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-primary font-bold text-xl italic tracking-wide">
            <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center transform -skew-x-12">
              <span className="transform skew-x-12 font-bold text-lg">集</span>
            </div>
            集采工作台
          </div>
          <div className="flex items-center gap-4 ml-6">
            <div className="flex items-center gap-2 border border-border-base rounded px-3 py-1.5 cursor-pointer bg-white">
              <span className="text-gray-700">中国建筑股份...</span>
              <ChevronDown size={14} className="text-gray-400"/>
            </div>
            <div className="relative">
              <input type="text" placeholder="搜索菜单" className="pl-3 pr-8 py-1.5 border border-border-base rounded w-64 text-xs" />
              <Search size={14} className="absolute right-2.5 top-2 text-gray-400" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-5 text-gray-600 text-xs">
          <div className="flex items-center gap-4">
            <Bell size={17} />
            <div className="flex items-center gap-2 ml-2">
              <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-200"></div>
              <span className="text-gray-700">管理员</span>
              <ChevronDown size={14} className="text-gray-400"/>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[80px] bg-[#001529] flex flex-col shrink-0 text-white/70 py-2">
          {[
            { icon: <Home size={20} />, label: '首页' },
            { icon: <Users size={20} />, label: '账户中心' },
            { icon: <Users size={20} />, label: '分供商管理' },
            { icon: <FileText size={20} />, label: '计划管理' },
            { icon: <ShoppingCart size={20} />, label: '采购管理' },
            { icon: <Gavel size={20} />, label: '招标管理', active: true },
          ].map((item, i) => (
            <div key={i} className={`py-3 flex flex-col items-center gap-1 text-[11px] cursor-pointer ${item.active ? 'bg-primary text-white' : 'hover:bg-white/10'}`}>
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </aside>
        <main className="flex-1 bg-[#f0f2f5] p-6 relative">
          <div className="bg-white h-full rounded-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium">招标列表</h2>
              <button onClick={() => setIsOpen(true)} className="action-btn action-btn-primary">手动触发风控预警</button>
            </div>
            <div className="space-y-4 opacity-30 pointer-events-none">
              <div className="h-10 bg-gray-100 rounded-sm w-full"></div>
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-50 rounded-sm border border-gray-100"></div>)}
              </div>
              <div className="h-64 bg-gray-50 rounded-sm w-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                数据列表内容区
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="risk-warning-modal-overlay">
          <div className="risk-warning-modal-container">
            {/* Header */}
            <div className="risk-warning-modal-header">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-medium text-text text-base">风控预警提醒</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-text-tertiary hover:text-text transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="risk-warning-modal-body">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-text-secondary">
                  本次未通过 <span className="text-orange-500 font-medium">{data.length}</span> 项风险预警，详情如下：
                </div>
                <button className="flex items-center gap-1 text-primary text-sm font-medium border border-primary/20 px-3 py-1 rounded-sm hover:bg-primary/5 transition-colors">
                  <Download className="w-4 h-4" />
                  下载风险明细
                </button>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-sm">
                <table className="risk-table">
                  <thead>
                    <tr>
                      <th className="w-[48px] text-center">
                        <input type="checkbox" className="rounded-sm border-gray-300" />
                      </th>
                      <th className="w-[60px] text-center">序号</th>
                      <th className="w-[180px]">风险预警名称</th>
                      <th className="w-[140px]">检测场景</th>
                      <th className="w-[100px]">处置状态</th>
                      <th className="w-[400px]">风险预警信息</th>
                      <th className="w-[280px]">处置建议</th>
                      <th className="w-[120px]">处置模式</th>
                      <th className="w-[320px]"><span className="text-red-500 mr-1">*</span>处置说明</th>
                      <th className="w-[160px]">处置附件</th>
                      <th className="w-[140px]">反馈评价</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr key={item.id} className={item.selected ? 'bg-blue-50/20' : ''}>
                        <td className="text-center">
                          <input 
                            type="checkbox" 
                            checked={item.selected} 
                            onChange={() => toggleSelect(item.id)}
                            className="rounded-sm border-gray-300 text-primary focus:ring-primary" 
                          />
                        </td>
                        <td className="text-center text-text-secondary">{item.displayIndex}</td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <span className="status-tag status-tag-warning shrink-0">预警</span>
                            <span className="text-text font-medium leading-snug">{item.name}</span>
                          </div>
                        </td>
                        <td className="text-text-secondary">{item.scene}</td>
                        <td>
                          <span className={item.status === '无需处置' ? 'text-text-tertiary font-medium' : 'text-text font-medium text-orange-500'}>
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <div className="text-text-secondary leading-relaxed text-xs break-words pr-4">
                            {item.info}
                            {item.name === '招标企业资质校验' && (
                              <a href="#" className="text-primary hover:underline block mt-1">查看企业资质承接范围校验规则</a>
                            )}
                          </div>
                        </td>
                        <td className="text-text-secondary leading-relaxed text-xs pr-4">{item.suggestion}</td>
                        <td className="text-text-secondary text-xs">{item.mode}</td>
                        <td className="pr-4">
                          {item.status === '无需处置' ? (
                            <span className="text-text-tertiary">无需处置</span>
                          ) : (
                            <div className="relative">
                              <textarea 
                                placeholder="请输入处置说明"
                                className="w-full border border-gray-200 rounded-sm p-2 text-xs h-20 focus:border-primary focus:outline-none resize-none bg-gray-50/30"
                              />
                              <span className="absolute bottom-1 right-2 text-[10px] text-text-tertiary bg-white/80 px-1">0 / 1000</span>
                            </div>
                          )}
                        </td>
                        <td>
                          {item.status === '无需处置' ? (
                            <span className="text-text-tertiary">无需处置</span>
                          ) : (
                            <button className="upload-btn">
                              <Plus className="w-3 h-3" />
                              添加附件
                            </button>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleSatisfaction(item.id, 'like')}
                              className={`feedback-icon-btn ${item.satisfaction === 'like' ? 'active-like' : 'text-text-tertiary'}`}
                              title="满意"
                            >
                              <ThumbsUp className={`w-4 h-4 ${item.satisfaction === 'like' ? 'fill-current' : ''}`} />
                            </button>
                            <button 
                              onClick={() => handleSatisfaction(item.id, 'dislike')}
                              className={`feedback-icon-btn ${item.satisfaction === 'dislike' ? 'active-dislike' : 'text-text-tertiary'}`}
                              title="不满意"
                            >
                              <ThumbsDown className={`w-4 h-4 ${item.satisfaction === 'dislike' ? 'fill-current' : ''}`} />
                            </button>
                            <button 
                              onClick={() => setFeedbackModal({ isOpen: true, itemId: item.id })}
                              className="flex items-center gap-0.5 text-primary hover:underline text-xs ml-1"
                            >
                              <MessageSquare className="w-3 h-3" />
                              反馈
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="risk-warning-modal-footer">
              <div className="bg-gray-50 px-3 py-1.5 rounded-sm text-sm text-text-secondary border border-gray-100">
                已选 <span className="font-medium text-text">{selectedCount}</span> 条
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="action-btn action-btn-ghost px-6"
                >
                  取消
                </button>
                <button className="action-btn action-btn-primary bg-blue-500 px-6">
                  查看风险解析报告
                </button>
                <button className="action-btn action-btn-primary px-8">
                  提交审核
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div 
          style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10001,
            pointerEvents: 'none'
          }}
        >
          <div 
            style={{
              backgroundColor: '#fff',
              padding: '10px 20px',
              borderRadius: '4px',
              boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              color: 'rgba(0, 0, 0, 0.88)',
              animation: 'toast-in 0.3s ease-out'
            }}
          >
            <CheckCircle2 style={{ width: '16px', height: '16px', color: '#52c41a' }} />
            {toast}
          </div>
          <style>{`
            @keyframes toast-in {
              from { transform: translateY(-20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* Problem Feedback Modal */}
      {feedbackModal.isOpen && (
        <div 
            className="feedback-modal-overlay"
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
            onClick={() => setFeedbackModal({ isOpen: false, itemId: null })}
          >
          <div 
            className="feedback-modal-container"
            style={{ 
              backgroundColor: '#fff', 
              maxWidth: '440px', 
              width: '100%',
              borderRadius: '2px',
              boxShadow: '0 9px 28px 8px rgba(0, 0, 0, 0.05), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center">
                <div style={{ width: '4px', height: '16px', backgroundColor: '#1677ff', borderRadius: '2px', marginRight: '8px' }} />
                <span className="font-medium text-text text-base">问题反馈</span>
              </div>
              <button 
                onClick={() => setFeedbackModal({ isOpen: false, itemId: null })}
                className="text-text-tertiary hover:text-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh] bg-white flex-1">
              <div className="mb-6">
                <label className="block text-sm font-medium text-text mb-3">
                  <span className="text-red-500 mr-1">*</span>请选择您遇到的问题类型
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    '预警信息不准确',
                    '处置建议不合理',
                    '规则逻辑有误',
                    '数据同步延迟',
                    '其他问题'
                  ].map(option => (
                    <div 
                      key={option}
                      onClick={() => setProblemType(option)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        border: '1px solid #d9d9d9',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        backgroundColor: problemType === option ? '#e6f4ff' : '#fff',
                        borderColor: problemType === option ? '#1677ff' : '#d9d9d9',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div 
                        style={{ 
                          width: '16px', 
                          height: '16px', 
                          borderRadius: '50%', 
                          border: '1px solid',
                          borderColor: problemType === option ? '#1677ff' : '#d9d9d9',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          backgroundColor: '#fff',
                          flexShrink: 0
                        }}
                      >
                        {problemType === option && (
                          <div style={{ width: '8px', height: '8px', backgroundColor: '#1677ff', borderRadius: '50%' }} />
                        )}
                      </div>
                      <span style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.88)', lineHeight: '1' }}>{option}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-text mb-3">
                  问题说明
                </label>
                <textarea 
                  placeholder="请详细描述您遇到的问题，以便我们更好地为您解决"
                  className="w-full border border-gray-200 rounded-sm p-3 text-sm h-32 focus:border-primary focus:outline-none resize-none bg-gray-50/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-3">
                  附件上传
                </label>
                <div className="border border-dashed border-gray-200 rounded-sm p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors">
                  <Paperclip className="w-6 h-6 text-text-tertiary" />
                  <span className="text-xs text-text-tertiary">点击或将文件拖拽到此处上传</span>
                  <span className="text-[10px] text-text-tertiary">支持 png, jpg, pdf, docx 格式，最大 10MB</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50 shrink-0">
              <button 
                onClick={() => setFeedbackModal({ isOpen: false, itemId: null })}
                className="action-btn action-btn-ghost px-6"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  if (!problemType) {
                    showToast('请选择问题类型');
                    return;
                  }
                  setFeedbackModal({ isOpen: false, itemId: null });
                  showToast('提交成功');
                  setProblemType(''); // 重置状态
                }}
                className="action-btn action-btn-primary px-8"
              >
                提交反馈
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Component;
