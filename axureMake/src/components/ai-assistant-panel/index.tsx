/**
 * @name 数字合规官AI悬浮助手组件
 * @description 包含右侧悬浮胶囊助手（数字合规官 + 快捷菜单）及右侧滑出式 AI 对话面板，完全继承 ai-interaction-v2 的对话交互。
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  X,
  MessageSquarePlus,
  History,
  ArrowLeft,
  Search,
  Edit,
  Trash2,
  Send,
  Edit3,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  Headset,
  UserCog,
  Smartphone
} from 'lucide-react';
import complianceOfficerIcon from '../../../assets/picture/数字合规官.png';
import './style.css';

export interface AIAssistantPanelProps {
  /** 外部控制对话框打开与否，不传则内部自行管理 */
  isOpen?: boolean;
  /** 点击头像/打开面板时的回调 */
  onOpen?: () => void;
  /** 对话框关闭回调 */
  onClose?: () => void;
  /** 点击具体风险节点时的回调 */
  onRiskNodeClick?: (nodeKey: string) => void;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  isOpen: externalIsOpen,
  onOpen: externalOnOpen,
  onClose: externalOnClose,
  onRiskNodeClick
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isChatOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleOpenChat = () => {
    setInternalIsOpen(true);
    if (externalOnOpen) {
      externalOnOpen();
    }
  };

  useEffect(() => {
    // 强制与父组件同步
    if (externalIsOpen !== undefined) {
      setInternalIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  const handleCloseChat = () => {
    setInternalIsOpen(false);
    if (externalOnClose) {
      externalOnClose();
    }
  };

  // 会话管理状态
  const [chatSessions, setChatSessions] = useState([
    {
      id: 1,
      name: '新会话 1',
      preview: '您好，我是您的数字合规官。今天是2026年09月29日，请问有什么可以帮您？',
      messages: [
        {
          id: 1,
          sender: 'bot',
          type: 'text',
          text: '您好，我是您的数字合规官。今天是2026年09月29日，请问有什么可以帮您？您可以询问关于项目的"风险"情况。'
        }
      ],
      timestamp: Date.now()
    }
  ]);
  const [currentSessionId, setCurrentSessionId] = useState(1);
  const [isHistoryView, setIsHistoryView] = useState(false);
  const [isEditSessionModalOpen, setIsEditSessionModalOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editingSessionName, setEditingSessionName] = useState('');
  const [sessionSearchKeyword, setSessionSearchKeyword] = useState('');
  const [sessionSearchQuery, setSessionSearchQuery] = useState('');

  const currentSession = chatSessions.find(s => s.id === currentSessionId);
  const chatMessages = currentSession?.messages || [];
  const setChatMessages = (updater: any) => {
    setChatSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        const newMessages = typeof updater === 'function' ? updater(s.messages) : updater;
        const lastUserMsg = newMessages.slice().reverse().find((m: any) => m.sender === 'user');
        const firstBotMsg = newMessages.find((m: any) => m.sender === 'bot');
        const preview = lastUserMsg?.text || firstBotMsg?.text || '新会话';
        return { ...s, messages: newMessages, preview: preview.length > 30 ? preview.substring(0, 30) + '...' : preview };
      }
      return s;
    }));
  };

  const [chatInputValue, setChatInputValue] = useState('');
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatMessages, isChatOpen]);

  const handleSendMessage = (customText?: string) => {
    const textToSend = customText || chatInputValue;
    if (!textToSend.trim()) return;

    const newUserMsg = {
      id: Date.now(),
      sender: 'user',
      type: 'text',
      text: textToSend
    };

    setChatMessages((prev: any) => [...prev, newUserMsg]);
    if (!customText) setChatInputValue('');

    if (textToSend.includes('风险')) {
      setTimeout(() => {
        setChatMessages((prev: any) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            type: 'risk-nodes',
            text: ''
          }
        ]);
      }, 500);
    } else {
      setTimeout(() => {
        setChatMessages((prev: any) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            type: 'text',
            text: '我尚未掌握此信息。作为数字合规官，我主要协助识别与应对数据、隐私及监管相关的合规风险'
          }
        ]);
      }, 500);
    }
  };

  const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({});

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev: { [key: string]: boolean }) => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const handleNewSession = () => {
    const newSessionId = Date.now();
    const newSessionNum = chatSessions.length + 1;
    const newSession = {
      id: newSessionId,
      name: `新会话 ${newSessionNum}`,
      preview: '您好，我是您的数字合规官。今天是2026年09月29日，请问有什么可以帮您？',
      messages: [
        {
          id: Date.now(),
          sender: 'bot',
          type: 'text',
          text: '您好，我是您的数字合规官。今天是2026年09月29日，请问有什么可以帮您？您可以询问关于项目的"风险"情况。'
        }
      ],
      timestamp: Date.now()
    };
    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSessionId);
    setIsHistoryView(false);
    setExpandedNodes({});
  };

  const handleShowHistory = () => setIsHistoryView(true);
  const handleBackToChat = () => setIsHistoryView(false);

  const handleSwitchSession = (sessionId: number) => {
    setCurrentSessionId(sessionId);
    setIsHistoryView(false);
    setExpandedNodes({});
  };

  const handleOpenEditModal = (e: React.MouseEvent, sessionId: number, currentName: string) => {
    e.stopPropagation();
    setEditingSessionId(sessionId);
    setEditingSessionName(currentName);
    setIsEditSessionModalOpen(true);
  };

  const handleConfirmEditSession = () => {
    if (editingSessionId && editingSessionName.trim()) {
      setChatSessions(prev => prev.map(s =>
        s.id === editingSessionId ? { ...s, name: editingSessionName.trim() } : s
      ));
    }
    setIsEditSessionModalOpen(false);
    setEditingSessionId(null);
    setEditingSessionName('');
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: number) => {
    e.stopPropagation();
    if (chatSessions.length <= 1) return;
    setChatSessions(prev => {
      const newSessions = prev.filter(s => s.id !== sessionId);
      if (sessionId === currentSessionId) {
        setCurrentSessionId(newSessions[0]?.id || 0);
      }
      return newSessions;
    });
  };

  const handleSessionSearch = () => {
    setSessionSearchQuery(sessionSearchKeyword.trim());
  };

  const filteredChatSessions = sessionSearchQuery
    ? chatSessions.filter(s =>
        s.name.toLowerCase().includes(sessionSearchQuery.toLowerCase()) ||
        s.preview.toLowerCase().includes(sessionSearchQuery.toLowerCase())
      )
    : chatSessions;

  return (
    <>
      {/* 右侧悬浮助手胶囊 */}
      <div className="ai-side-helper">
        {/* 数字合规官 独立胶囊卡片 */}
        <div className="ai-helper-card ai-helper-card-officer" onClick={handleOpenChat}>
          <img src={complianceOfficerIcon} alt="数字合规官" className="ai-helper-avatar" />
          <span className="ai-helper-text">
            数字<br />合规官
          </span>
        </div>

        {/* 快捷功能 组合胶囊卡片 */}
        <div className="ai-helper-card ai-helper-card-group">
          <div className="ai-helper-group-item">
            <Headset size={18} className="ai-helper-icon" />
            <span className="ai-helper-text">
              联系<br />客服
            </span>
          </div>
          <div className="ai-helper-divider" />
          <div className="ai-helper-group-item">
            <UserCog size={18} className="ai-helper-icon" />
            <span className="ai-helper-text">
              权限<br />助手
            </span>
          </div>
          <div className="ai-helper-divider" />
          <div className="ai-helper-group-item">
            <Smartphone size={18} className="ai-helper-icon" />
            <span className="ai-helper-text">
              掌上<br />作业
            </span>
          </div>
        </div>
      </div>

      {/* 右侧滑出式 Chat 抽屉面板 */}
      <div className={`fixed top-0 right-0 h-full z-[1000] flex transition-transform duration-300 ease-in-out ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="w-[480px] h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-700">
          {/* 头部 */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
            <div className="flex items-center gap-3">
              {isHistoryView ? (
                <button
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-all duration-200"
                  onClick={handleBackToChat}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-blue-500" />
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                  {isHistoryView ? '历史记录' : '数字合规官'}
                </h2>
                {!isHistoryView && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <span className="text-xs text-slate-400">在线</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isHistoryView && (
                <>
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-all duration-200 text-xs"
                    onClick={handleNewSession}
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                    <span>新建会话</span>
                  </button>
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-all duration-200 text-xs"
                    onClick={handleShowHistory}
                  >
                    <History className="w-4 h-4" />
                    <span>历史记录</span>
                  </button>
                </>
              )}
              <button
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-all duration-200 shadow-sm border border-white/20"
                onClick={handleCloseChat}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 聊天内容区 / 历史记录区 */}
          <div className="flex-1 overflow-y-auto p-5 chat-container" ref={chatHistoryRef}>
            {isHistoryView ? (
              <div className="space-y-3">
                <div className="relative mb-4">
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm"
                    placeholder="过滤会话..."
                    value={sessionSearchKeyword}
                    onChange={(e) => setSessionSearchKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSessionSearch();
                    }}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                {filteredChatSessions.length > 0 ? (
                  filteredChatSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`relative bg-white dark:bg-slate-800 rounded-xl p-4 border cursor-pointer transition-all hover:shadow-md ${
                        session.id === currentSessionId
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-blue-500/50'
                      }`}
                      onClick={() => handleSwitchSession(session.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-slate-800 dark:text-white text-sm pr-16">
                          {session.name}
                        </h3>
                        <span className="text-xs text-slate-400 absolute top-4 right-4">
                          {new Date(session.timestamp).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                        {session.preview}
                      </p>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                          onClick={(e) => handleOpenEditModal(e, session.id, session.name)}
                          title="编辑会话名称"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className={`p-1.5 rounded-lg transition-colors ${
                            chatSessions.length <= 1
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                          }`}
                          onClick={(e) => handleDeleteSession(e, session.id)}
                          disabled={chatSessions.length <= 1}
                          title={chatSessions.length <= 1 ? '至少保留一个会话' : '删除会话'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    未找到匹配的会话
                  </div>
                )}
              </div>
            ) : (
              <>
                {chatMessages.map((msg: any) => (
                  <div key={msg.id} className={`flex gap-3 mb-6 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                    {msg.sender === 'bot' && (
                      <div className="flex-shrink-0">
                        <img alt="Digital Officer" className="w-9 h-9 rounded-full ring-2 ring-blue-500/20" src={complianceOfficerIcon} />
                      </div>
                    )}
                    {msg.sender === 'user' ? (
                      <div className="bg-blue-500 text-white px-4 py-2.5 rounded-2xl rounded-tr-none max-w-[85%] shadow-sm text-sm">
                        {msg.text}
                      </div>
                    ) : msg.type === 'text' ? (
                      <div className="space-y-2">
                        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700 max-w-[95%]">
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                            {msg.text}
                          </p>
                        </div>
                      </div>
                    ) : msg.type === 'risk-nodes' ? (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
                        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700">
                          <p className="font-semibold text-slate-800 dark:text-white mb-3 text-sm">为您检测到以下合规预警节点：</p>
                          <div className="space-y-3">
                            <div className="relative group bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between cursor-pointer" onClick={() => toggleNode('node1')}>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                                  <Edit3 className="w-5 h-5 text-orange-500" />
                                </div>
                                <div>
                                  <h3 className="text-slate-800 dark:text-white font-medium text-sm">采购发起</h3>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-slate-400">已完成 3个子项</span>
                                    <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded">预警</span>
                                  </div>
                                </div>
                              </div>
                              {expandedNodes['node1'] ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </div>
                            {expandedNodes['node1'] && (
                              <div className="pl-8 space-y-2 relative animate-in slide-in-from-top-2">
                                <div className="absolute left-3 top-0 bottom-4 w-px bg-slate-200 dark:bg-slate-700"></div>
                                <div
                                  className="relative bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700 flex items-center justify-between cursor-pointer"
                                  onClick={() => onRiskNodeClick?.('list')}
                                >
                                  <div className="absolute -left-5 top-1/2 w-5 h-px bg-slate-200 dark:bg-slate-700"></div>
                                  <span className="text-sm text-slate-700 dark:text-slate-200">编制采购清单</span>
                                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div
                                  className="relative bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700 cursor-pointer"
                                  onClick={() => onRiskNodeClick?.('announcement')}
                                >
                                  <div className="absolute -left-5 top-1/2 w-5 h-px bg-slate-200 dark:bg-slate-700"></div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-700 dark:text-slate-200">发布采购公告</span>
                                  </div>
                                  <div className="mt-1.5 flex items-center gap-2">
                                    <span className="text-[11px] text-slate-400">检测到2项校验规则不通过</span>
                                    <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded">预警</span>
                                  </div>
                                </div>
                                <div
                                  className="relative bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700 cursor-pointer"
                                  onClick={() => onRiskNodeClick?.('registration-summary')}
                                >
                                  <div className="absolute -left-5 top-1/2 w-5 h-px bg-slate-200 dark:bg-slate-700"></div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-700 dark:text-slate-200">报名与资审汇总</span>
                                  </div>
                                  <div className="mt-1.5 flex items-center gap-2">
                                    <span className="text-[11px] text-slate-400">检测到2项校验规则不通过</span>
                                    <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded">预警</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* 输入区 */}
          {!isHistoryView && (
            <div className="px-5 pb-5 pt-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <div className="relative flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm"
                    placeholder="请输入您的问题，例如：查看当前风险"
                    type="text"
                    value={chatInputValue}
                    onChange={(e: any) => setChatInputValue(e.target.value)}
                    onKeyDown={(e: any) => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                  />
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    onClick={() => handleSendMessage()}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                <button
                  className="whitespace-nowrap px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-colors bg-slate-50 dark:bg-slate-800"
                  onClick={() => handleSendMessage('查看合规风险')}
                >
                  查看合规风险
                </button>
                <button
                  className="whitespace-nowrap px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-colors bg-slate-50 dark:bg-slate-800"
                  onClick={() => handleSendMessage('项目状态查询')}
                >
                  项目状态查询
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 遮罩 */}
      {isChatOpen && (
        <div
          className="fixed inset-0 bg-black/5 z-[999] transition-opacity duration-300"
          onClick={handleCloseChat}
        />
      )}

      {/* 修改会话名称 Modal */}
      {isEditSessionModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[1001]">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">修改会话名称</h3>
              <button
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                onClick={() => {
                  setIsEditSessionModalOpen(false);
                  setEditingSessionId(null);
                  setEditingSessionName('');
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">会话名称</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm"
                placeholder="请输入会话名称"
                value={editingSessionName}
                onChange={(e) => setEditingSessionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmEditSession();
                }}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 px-6 py-2 rounded-md font-medium shadow-md transition-all text-sm"
                onClick={() => {
                  setIsEditSessionModalOpen(false);
                  setEditingSessionId(null);
                  setEditingSessionName('');
                }}
              >
                取消
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium shadow-md transition-all text-sm"
                onClick={handleConfirmEditSession}
                disabled={!editingSessionName.trim()}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistantPanel;
