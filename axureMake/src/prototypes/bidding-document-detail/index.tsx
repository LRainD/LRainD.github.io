/**
 * @name 投标报价详情
 */
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, HelpCircle, AlertTriangle, 
  ChevronUp, Plus, ShieldCheck, FileSearch,
  X, Search, FileText, CheckSquare, Square
} from 'lucide-react';
import BiddingLayout from '../../components/bidding-layout';
import { FileAssistantModal } from '../../components/file-assistant-modal';
import beeIcon from '../../../assets/picture/蜂王不带字小图标.png';
import './style.css';

const Component = () => {
  const [activeTab, setActiveTab] = useState('投标文件');
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [expandedSections, setExpandedSections] = useState({
    purchaseList: true,
    businessTerms: true,
    technicalTerms: true,
    biddingInstructions: true,
    attachments: true
  });

  const [sealMethod, setSealMethod] = useState<'esign' | 'scan'>('esign');
  const [isFileAssistantOpen, setIsFileAssistantOpen] = useState(false);
  
  // 独立存储两种方式的附件
  const [esignAttachments, setEsignAttachments] = useState<any[]>([]);
  const [scanAttachments, setScanAttachments] = useState<any[]>([]);

  // 当前显示的附件列表
  const attachments = sealMethod === 'esign' ? esignAttachments : scanAttachments;
  const setAttachments = sealMethod === 'esign' ? setEsignAttachments : setScanAttachments;

  const handleAddAttachment = () => {
    if (sealMethod === 'esign') {
      setIsFileAssistantOpen(true);
    } else {
      // 模拟本地上传
      const input = document.createElement('input');
      input.type = 'file';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          setAttachments(prev => [...prev, {
            id: Date.now(),
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + 'MB',
            date: new Date().toISOString().split('T')[0],
            status: 'pending'
          }]);
        }
      };
      input.click();
    }
  };

  const handleFileAssistantConfirm = (selectedFiles: any[]) => {
    const newAttachments = selectedFiles.map(f => ({
      ...f,
      id: Date.now() + f.id,
      status: 'pending'
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
    setIsFileAssistantOpen(false);
  };

  const handleInitiateEsign = () => {
    setEsignAttachments(prev => prev.map(att => ({ ...att, status: 'signed' })));
  };

  useEffect(() => {
    const handleScroll = () => {
      if (mainRef.current && titleRef.current) {
        const titleBottom = titleRef.current.getBoundingClientRect().bottom;
        // When the bottom of the title section is above the top of the viewport (or header)
        setShowStickyHeader(titleBottom < 56); 
      }
    };

    const mainElement = mainRef.current;
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (mainElement) {
        mainElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      // @ts-ignore
      [section]: !prev[section]
    }));
  };

  return (
    <BiddingLayout activeNav="投标工作台" activeSidebar="投标">
      {/* Main Content */}
      <main ref={mainRef} className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-bg-page relative">
        {/* Sticky Header (Visible on scroll) */}
        {showStickyHeader && (
          <div className="sticky top-0 left-0 right-0 bg-white shadow-md z-30 px-6 py-2 flex items-center justify-between border-b border-border-base animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3">
              <span className="bg-[#f0f5ff] text-[#2f54eb] text-[10px] px-1.5 py-0.5 rounded border border-[#adc6ff] scale-90">公开招标</span>
              <h2 className="text-sm font-bold text-gray-900 truncate max-w-[300px]">资格预审到投标中的自检-不要动</h2>
            </div>
            <div className="flex items-center gap-2">
                <button className="px-4 py-1 bg-primary text-white rounded text-xs">保存</button>
                <button className="px-4 py-1 bg-primary text-white rounded text-xs">提交投标</button>
                <button className="px-3 py-1 bg-white text-primary border border-primary rounded text-xs flex items-center gap-1">
                  购买投标保险 <HelpCircle size={12} />
                </button>
                <button className="px-3 py-1 bg-[#333] text-white rounded text-xs flex items-center gap-1">
                  <img src={beeIcon} alt="bee" className="w-3.5 h-3.5 object-contain" /> 标书检测
                </button>
                <button className="px-3 py-1 bg-[#333] text-white rounded text-xs flex items-center gap-1">
                  <img src={beeIcon} alt="bee" className="w-3.5 h-3.5 object-contain" /> 标书检测报告
                </button>
              </div>
          </div>
        )}

        {/* Breadcrumb */}
        <div className="px-6 py-3 text-[12px] text-gray-500">
          <span className="cursor-pointer hover:text-primary">投标/报价管理</span>
          <span className="mx-2 text-gray-400">{'>'}</span>
          <span className="cursor-pointer hover:text-primary">投标/报价列表</span>
          <span className="mx-2 text-gray-400">{'>'}</span>
          <span className="text-gray-900">投标/报价详情</span>
        </div>

        <div className="px-6 pb-10 relative">
          {/* Title Section */}
          <div ref={titleRef} className="bg-white rounded-sm shadow-sm mb-4 relative">
            {/* Top Orange Line */}
            <div className="h-1 w-full bg-primary rounded-t-sm"></div>
            
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-[#f0f5ff] text-[#2f54eb] text-xs px-2 py-0.5 rounded border border-[#adc6ff]">公开招标</span>
                    <h1 className="text-xl font-bold text-gray-900">资格预审到投标中的自检-不要动</h1>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-3 text-[13px]">
                    <div className="flex gap-2">
                      <span className="text-gray-500 w-20">招标编号：</span>
                      <span className="text-gray-900">cscec202607080000022813</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-500 w-20">招标品类：</span>
                      <span className="text-gray-900">物资 钢材</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-500 w-20">招标单位：</span>
                      <span className="text-gray-900">中国建筑股份有限公司</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-500 w-20">发布时间：</span>
                      <span className="text-gray-900">2026-07-08 15:26:18</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-500 w-20">地区：</span>
                      <span className="text-gray-900 bg-gray-100 px-1.5 rounded">四川省</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-500 w-28">首轮投标截止时间：</span>
                      <span className="text-gray-900">2030-07-27 15:28:00</span>
                    </div>
                    <div className="flex gap-2 col-span-2">
                      <span className="text-gray-500 shrink-0">是否接受附件文件使用电子签：</span>
                      <span className="text-gray-900 flex items-center gap-1">
                        接受电子签且推荐使用 <HelpCircle size={14} className="text-gray-400 cursor-pointer" />
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-4">
                  <div className="flex gap-2">
                    <button className="px-6 py-1.5 bg-primary text-white rounded hover:bg-[#e68a00] transition-colors">保存</button>
                    <button className="px-6 py-1.5 bg-primary text-white rounded hover:bg-[#e68a00] transition-colors">提交投标</button>
                    <button className="px-4 py-1.5 bg-white text-primary border border-primary rounded flex items-center gap-1 hover:bg-orange-50">
                      购买投标保险 <HelpCircle size={14} />
                    </button>
                    <button className="px-4 py-1.5 bg-[#333] text-white rounded flex items-center gap-1 hover:bg-black">
                      <img src={beeIcon} alt="bee" className="w-4 h-4 object-contain" /> 标书检测
                    </button>
                    <button className="px-4 py-1.5 bg-[#333] text-white rounded flex items-center gap-1 hover:bg-black">
                      <img src={beeIcon} alt="bee" className="w-4 h-4 object-contain" /> 标书检测报告
                    </button>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[#2f54eb] font-bold text-lg">待投标</span>
                      <span className="text-gray-500 text-xs">倒计时</span>
                      <div className="flex items-center gap-1">
                        <span className="bg-[#fff7e6] text-[#fa8c16] px-1.5 py-0.5 rounded font-mono font-bold">1449</span>
                        <span className="text-gray-500">天</span>
                        <span className="bg-[#fff7e6] text-[#fa8c16] px-1.5 py-0.5 rounded font-mono font-bold">20</span>
                        <span className="text-gray-500">:</span>
                        <span className="bg-[#fff7e6] text-[#fa8c16] px-1.5 py-0.5 rounded font-mono font-bold">37</span>
                        <span className="text-gray-500">:</span>
                        <span className="bg-[#fff7e6] text-[#fa8c16] px-1.5 py-0.5 rounded font-mono font-bold">44</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-primary text-white rounded font-bold text-base">保存</button>
                        <button className="flex-1 py-2 bg-primary text-white rounded font-bold text-base">提交投标</button>
                      </div>
                      <div className="flex gap-2">
                          <button className="flex-1 py-2 bg-white text-primary border border-primary rounded flex items-center justify-center gap-1">
                            购买投标保险 <HelpCircle size={14} />
                          </button>
                          <button className="flex-1 py-2 bg-[#333] text-white rounded flex items-center justify-center gap-1">
                            <img src={beeIcon} alt="bee" className="w-4 h-4 object-contain" /> 标书检测
                          </button>
                        </div>
                        <button className="w-full py-2 bg-[#333] text-white rounded flex items-center justify-center gap-1">
                          <img src={beeIcon} alt="bee" className="w-4 h-4 object-contain" /> 标书检测报告
                        </button>
                      <div className="text-right text-gray-500 text-xs mt-1">
                        截止时间：2030-07-27 15:28:00
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="bg-white rounded-sm shadow-sm">
            <div className="flex border-b border-border-base px-6">
              {['招标(资格预审)公告', '联系方式', '报名附件', '招标文件', '投标文件', '澄清', '答疑'].map(tab => (
                <div 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-4 cursor-pointer text-[14px] relative transition-colors ${
                    activeTab === tab ? 'text-primary font-bold' : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary"></div>}
                </div>
              ))}
              <div className="ml-auto flex items-center">
                <button className="text-primary text-xs border border-primary px-3 py-1 rounded hover:bg-orange-50">查看预览记录</button>
              </div>
            </div>

            <div className="p-6 flex gap-6">
              <div className="flex-1 min-w-0">
                {/* Purchase List Section */}
                <div className="border border-border-base rounded-sm mb-4 overflow-hidden">
                  <div 
                    className="bg-[#fafafa] px-4 py-3 flex items-center justify-between cursor-pointer border-b border-border-base"
                    onClick={() => toggleSection('purchaseList')}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-primary"></div>
                      <span className="font-bold text-gray-800">采购清单</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button className="text-primary text-xs border border-primary px-3 py-1 rounded bg-white">导出清单</button>
                      <button className="text-primary text-xs border border-primary px-3 py-1 rounded bg-white">导入清单</button>
                      <button className="bg-primary text-white text-xs px-3 py-1 rounded">保存当前清单</button>
                      {expandedSections.purchaseList ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </div>
                  
                  {expandedSections.purchaseList && (
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[#52c41a] text-xs font-medium">完整</span>
                        <span className="text-gray-800 font-medium">JGKZ商品清单-浮动价</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-xs">
                          <thead>
                            <tr className="bg-[#fafafa] text-gray-600">
                              <th className="border border-border-base p-2 font-medium w-12">序号</th>
                              <th className="border border-border-base p-2 font-medium text-left">报价依据</th>
                              <th className="border border-border-base p-2 font-medium text-left">
                                <span className="text-red-500 mr-1">*</span>含税单价
                                <div className="text-gray-400 font-normal">(最多4位小数)</div>
                              </th>
                              <th className="border border-border-base p-2 font-medium text-left">
                                数量
                                <div className="text-gray-400 font-normal">(最多4位小数)</div>
                              </th>
                              <th className="border border-border-base p-2 font-medium text-left">单位</th>
                              <th className="border border-border-base p-2 font-medium text-left">
                                合价 <HelpCircle size={12} className="inline text-gray-400" />
                                <div className="text-gray-400 font-normal">(最多6位小数)</div>
                              </th>
                              <th className="border border-border-base p-2 font-medium text-left">
                                <span className="text-red-500 mr-1">*</span>税率 <AlertTriangle size={12} className="inline text-primary" />
                              </th>
                              <th className="border border-border-base p-2 font-medium text-left">
                                不含税单价 <HelpCircle size={12} className="inline text-gray-400" />
                                <div className="text-gray-400 font-normal">(最多6位小数)</div>
                              </th>
                              <th className="border border-border-base p-2 font-medium text-left">
                                不含税合价 <HelpCircle size={12} className="inline text-gray-400" />
                                <div className="text-gray-400 font-normal">(最多6位小数)</div>
                              </th>
                              <th className="border border-border-base p-2 font-medium text-left">
                                税额 <HelpCircle size={12} className="inline text-gray-400" />
                                <div className="text-gray-400 font-normal">(最多6位小数)</div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-border-base p-3 text-center">1</td>
                              <td className="border border-border-base p-3"></td>
                              <td className="border border-border-base p-3">
                                <input type="text" defaultValue="2" className="w-full border border-border-base rounded px-2 py-1 form-input" />
                              </td>
                              <td className="border border-border-base p-3">12</td>
                              <td className="border border-border-base p-3">件</td>
                              <td className="border border-border-base p-3">24</td>
                              <td className="border border-border-base p-3">
                                <div className="relative">
                                  <select className="w-full border border-border-base rounded px-2 py-1 appearance-none bg-white form-select">
                                    <option>6%</option>
                                  </select>
                                  <ChevronDown size={12} className="absolute right-2 top-2 text-gray-400" />
                                </div>
                              </td>
                              <td className="border border-border-base p-3">1.886792</td>
                              <td className="border border-border-base p-3">22.641504</td>
                              <td className="border border-border-base p-3">1.35849</td>
                            </tr>
                            <tr className="bg-[#fafafa] font-bold">
                              <td className="border border-border-base p-3 text-center" colSpan={2}></td>
                              <td className="border border-border-base p-3">2</td>
                              <td className="border border-border-base p-3">12</td>
                              <td className="border border-border-base p-3"></td>
                              <td className="border border-border-base p-3">24</td>
                              <td className="border border-border-base p-3"></td>
                              <td className="border border-border-base p-3">1.886792</td>
                              <td className="border border-border-base p-3">22.641504</td>
                              <td className="border border-border-base p-3">1.35849</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Other Sections */}
                {[
                  { id: 'businessTerms', title: '商务条款', content: '暂无相关信息' },
                  { id: 'technicalTerms', title: '技术条款', content: '暂无相关信息' },
                  { id: 'biddingInstructions', title: '投标说明', isTextarea: true },
                  { id: 'attachments', title: '投标附件', isUpload: true }
                ].map(section => (
                  <div key={section.id} className="border border-border-base rounded-sm mb-4 overflow-hidden">
                    <div 
                      className="bg-[#fafafa] px-4 py-3 flex items-center justify-between cursor-pointer border-b border-border-base"
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-primary"></div>
                        <span className="font-bold text-gray-800">{section.title}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        {section.id === 'attachments' && sealMethod === 'esign' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInitiateEsign();
                            }}
                            className="bg-primary text-white text-xs px-3 py-1 rounded flex items-center gap-1"
                          >
                            发起电子签 <HelpCircle size="14" />
                          </button>
                        )}
                        {/* @ts-ignore */}
                        {expandedSections[section.id] ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                      </div>
                    </div>
                    
                    {/* @ts-ignore */}
                    {expandedSections[section.id] && (
                      <div className="p-6">
                        {section.isTextarea ? (
                          <textarea className="w-full h-32 border border-border-base rounded p-3 form-textarea" placeholder="请输入投标说明"></textarea>
                        ) : section.isUpload ? (
                          <div className="text-xs text-gray-500">
                            {/* 附件盖章方式 */}
                            <div className="flex items-center mb-6">
                              <div className="flex-shrink-0 text-right pr-1">
                                <span className="text-red-500 text-xs">*</span>
                                <span className="text-sm text-gray-700 whitespace-nowrap">附件盖章方式</span>
                              </div>
                              <span className="text-gray-700 mr-1">:</span>
                              <div className="flex items-center gap-6 flex-shrink-0">
                                <label className="flex items-center cursor-pointer" onClick={() => setSealMethod('esign')}>
                                  <div
                                    className={`w-4 h-4 rounded-full border-2 mr-2 flex items-center justify-center transition-colors ${
                                      sealMethod === 'esign'
                                        ? 'border-primary'
                                        : 'border-gray-300'
                                    }`}
                                  >
                                    {sealMethod === 'esign' && (
                                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                                    )}
                                  </div>
                                  <span className="text-sm text-gray-700">电子签章</span>
                                </label>
                                <label className="flex items-center cursor-pointer" onClick={() => setSealMethod('scan')}>
                                  <div
                                    className={`w-4 h-4 rounded-full border-2 mr-2 flex items-center justify-center transition-colors ${
                                      sealMethod === 'scan'
                                        ? 'border-primary'
                                        : 'border-gray-300'
                                    }`}
                                  >
                                    {sealMethod === 'scan' && (
                                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                                    )}
                                  </div>
                                  <span className="text-sm text-gray-700">纸质扫描件</span>
                                </label>
                              </div>
                            </div>

                            <div className="flex items-start gap-2 mb-4">
                              <span className="shrink-0 text-sm text-gray-700">
                                <span className="text-red-500 mr-0.5">*</span>附件：
                              </span>
                              <div className="flex-1">
                                {sealMethod === 'esign' ? (
                                  <>
                                    <div className="text-gray-500">大小限制：100M 支持格式：.pdf</div>
                                    <div className="text-gray-400 mt-1">(电子签功能仅支持最多20个100M以内的pdf文件，若不满足需求，请选择纸质扫描件方式上传附件报名)</div>
                                  </>
                                ) : (
                                  <div className="text-gray-500">
                                    大小限制：500M 支持格式：.jpeg, .jpg, .gif, .png, .doc, .doc_, .docx, .xls, .xls_, .xlsx, .txt, .pdf, .rar, .zip, .7z, .tar, .jar, .dwg, .dws, .dwt, .dxf, .csv
                                  </div>
                                )}

                                {/* 附件列表展示 */}
                                {attachments.length > 0 && (
                                  <div className="mt-4 flex flex-wrap gap-3">
                                    {attachments.map(file => (
                                      <div 
                                        key={file.id} 
                                        className="inline-flex items-center border border-[#e8e8e8] rounded px-3 py-2 bg-white relative group"
                                      >
                                        {file.status === 'signed' && (
                                          <div className="absolute -top-2 left-2 bg-[#52c41a] text-white text-[10px] px-1.5 py-0.5 rounded-sm leading-none">
                                            签章成功
                                          </div>
                                        )}
                                        <div className="flex-shrink-0 w-[34px] h-[34px] bg-red-50 rounded flex flex-col items-center justify-center mr-2">
                                          <span className="text-[9px] font-bold text-red-500 leading-none">
                                            {file.name.split('.').pop()?.toUpperCase() || 'FILE'}
                                          </span>
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-sm text-gray-700 mr-3">{file.name}</span>
                                          <span className="text-[10px] text-gray-400">{file.size}</span>
                                        </div>
                                        <div className="flex items-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button className="text-gray-400 hover:text-primary mr-2 transition-colors">
                                            <FileSearch size={14} />
                                          </button>
                                          <button 
                                            onClick={() => setAttachments(prev => prev.filter(a => a.id !== file.id))}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                          >
                                            <X size={14} />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <button 
                              onClick={handleAddAttachment}
                              className="flex items-center gap-1 border border-border-base px-4 py-1.5 rounded hover:border-primary hover:text-primary transition-colors ml-[52px]"
                            >
                              <Plus size={14} /> 添加附件
                            </button>
                          </div>
                        ) : (
                          <div className="text-gray-500 italic">{section.content}</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Right Side Navigation */}
              <div className="w-32 shrink-0">
                <div className="sticky top-4 flex flex-col gap-0 border-l border-gray-100">
                  {[
                    { id: 'purchaseList', label: '采购清单' },
                    { id: 'businessTerms', label: '商务条款' },
                    { id: 'technicalTerms', label: '技术条款' },
                    { id: 'biddingInstructions', label: '投标说明' },
                    { id: 'attachments', label: '投标附件' }
                  ].map((item, idx) => (
                    <div 
                      key={item.id}
                      className={`pl-8 py-2 text-xs cursor-pointer relative transition-colors hover:text-primary group ${
                        idx === 0 ? 'text-primary font-bold' : 'text-gray-600'
                      }`}
                    >
                      {idx === 0 && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-100 flex items-center justify-center rounded-sm text-gray-400">
                          <span className="scale-75">{'>'}</span>
                        </div>
                      )}
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <FileAssistantModal 
        isOpen={isFileAssistantOpen}
        onClose={() => setIsFileAssistantOpen(false)}
        onConfirm={handleFileAssistantConfirm}
      />
    </BiddingLayout>
  );
};

export default Component;
