/**
 * @name 运营解决方案配置页面
 */
import React, { useState } from 'react';
import logoImage from '../../../assets/media/运营后台左上角logo.png';
import {
  Layout,
  Menu,
  Tabs,
  Card,
  Radio,
  Checkbox,
  Select,
  Input,
  Button,
  Breadcrumb,
  Tag,
  Space,
  Table,
  Switch,
  Alert,
  Tree
} from 'antd';
import {
  HomeOutlined,
  SettingOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  UserOutlined,
  SearchOutlined,
  DownOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
  ShopOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  ToolOutlined,
  SolutionOutlined,
  AuditOutlined,
  ProfileOutlined,
  FileProtectOutlined,
  ContainerOutlined,
  ReconciliationOutlined,
  FundOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  DotChartOutlined,
  SlidersOutlined,
  ControlOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  CloudOutlined,
  CloudServerOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
  CloudSyncOutlined,
  GlobalOutlined,
  LinkOutlined,
  PaperClipOutlined,
  FlagOutlined,
  TagsOutlined,
  WalletOutlined,
  ShoppingCartOutlined,
  GiftOutlined,
  CrownOutlined,
  TrophyOutlined,
  StarOutlined,
  HeartOutlined,
  LikeOutlined,
  DislikeOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  LockOutlined,
  UnlockOutlined,
  KeyOutlined,
  SafetyOutlined,
  SecurityScanOutlined,
  InsuranceOutlined,
  AlertOutlined,
  WarningOutlined,
  StopOutlined,
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
  EditOutlined,
  CopyOutlined,
  SnippetsOutlined,
  ScissorOutlined,
  FileAddOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileMarkdownOutlined,
  FilePdfOutlined,
  FilePptOutlined,
  FileTextOutlined as FileTextIconOutlined,
  FileUnknownOutlined,
  FileWordOutlined,
  FileZipOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  FolderAddOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  ScheduleOutlined,
  CarryOutOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined as CheckCircleIconOutlined,
  CloseCircleOutlined as CloseCircleIconOutlined,
  ExclamationCircleOutlined as ExclamationCircleIconOutlined,
  InfoCircleOutlined as InfoCircleIconOutlined,
  SyncOutlined,
  ReloadOutlined,
  RedoOutlined,
  UndoOutlined,
  RollbackOutlined,
  RetweetOutlined,
  SwapOutlined,
  SwapLeftOutlined,
  SwapRightOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  UpOutlined,
  DownOutlined as DownIconOutlined,
  LeftOutlined,
  RightOutlined,
  UpCircleOutlined,
  DownCircleOutlined,
  LeftCircleOutlined,
  RightCircleOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignMiddleOutlined,
  HorizontalAlignLeftOutlined,
  HorizontalAlignRightOutlined,
  HorizontalAlignCenterOutlined,
  PicCenterOutlined,
  PicLeftOutlined,
  PicRightOutlined,
  RadiusUpleftOutlined,
  RadiusUprightOutlined,
  RadiusBottomleftOutlined,
  RadiusBottomrightOutlined,
  BorderOutlined,
  BorderTopOutlined,
  BorderBottomOutlined,
  BorderLeftOutlined,
  BorderRightOutlined,
  BorderHorizontalOutlined,
  BorderVerticalOutlined,
  BorderInnerOutlined,
  BorderOuterOutlined,
  BorderlessTableOutlined,
  InsertRowAboveOutlined,
  InsertRowBelowOutlined,
  InsertRowLeftOutlined,
  InsertRowRightOutlined,
  DeleteRowOutlined,
  DeleteColumnOutlined,
  MergeCellsOutlined,
  SplitCellsOutlined,
  FormatPainterOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  FontSizeOutlined,
  FontColorsOutlined,
  LineHeightOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  MenuOutlined,
  MenuFoldOutlined as MenuFoldIconOutlined,
  MenuUnfoldOutlined as MenuUnfoldIconOutlined,
  MoreOutlined,
  MoreHorizontalOutlined,
  EllipsisOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  DragOutlined,
  ExpandOutlined,
  ExpandAltOutlined,
  CompressOutlined,
  NodeIndexOutlined,
  NodeCollapseOutlined,
  NodeExpandOutlined,
  ApartmentOutlined,
  ClusterOutlined,
  DeploymentUnitOutlined,
  PartitionOutlined,
  GroupOutlined,
  SubnodeOutlined,
  MergeCellsHorizontalOutlined,
  MergeCellsVerticalOutlined,
  RobotOutlined,
  BugOutlined,
  CodeOutlined,
  CodeSandboxOutlined,
  CodepenOutlined,
  GithubOutlined,
  GitlabOutlined,
  ChromeOutlined,
  SafariOutlined,
  FirefoxOutlined,
  EdgeOutlined,
  InternetExplorerOutlined,
  WindowsOutlined,
  AppleOutlined,
  AndroidOutlined,
  Html5Outlined,
  SlackOutlined,
  DingdingOutlined,
  WechatOutlined,
  AlipayOutlined,
  TaobaoOutlined,
  TwitterOutlined,
  WeiboOutlined,
  ZhihuOutlined,
  FacebookOutlined,
  LinkedinOutlined,
  YoutubeOutlined,
  InstagramOutlined,
  RedditOutlined,
  SkypeOutlined,
  MailOutlined,
  PhoneOutlined,
  MobileOutlined,
  TabletOutlined,
  LaptopOutlined,
  DesktopOutlined,
  PrinterOutlined,
  WifiOutlined,
  SignalOutlined,
  BatteryFullOutlined,
  BatteryHalfOutlined,
  BatteryEmptyOutlined,
  UsbOutlined,
  CloudOutlined as CloudIconOutlined,
  ThunderboltOutlined,
  FireOutlined,
  DashboardOutlined as DashboardIconOutlined,
  CompassOutlined,
  EnvironmentOutlined,
  AimOutlined,
  PushpinOutlined,
  TagOutlined,
  TagsOutlined as TagsIconOutlined,
  QrcodeOutlined,
  BarcodeOutlined,
  CreditCardOutlined,
  BankOutlined,
  PayCircleOutlined,
  PropertySafetyOutlined,
  DollarOutlined,
  EuroOutlined,
  PoundOutlined,
  TransactionOutlined,
  GiftOutlined as GiftIconOutlined,
  RedEnvelopeOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined as ShoppingCartIconOutlined,
  ShopOutlined as ShopIconOutlined,
  RestOutlined,
  CoffeeOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  TrophyOutlined as TrophyIconOutlined,
  CrownOutlined as CrownIconOutlined,
  SmileOutlined,
  FrownOutlined,
  MehOutlined,
  UserOutlined as UserIconOutlined,
  TeamOutlined as TeamIconOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  UserSwitchOutlined,
  UsergroupAddOutlined,
  UsergroupDeleteOutlined,
  WomanOutlined,
  ManOutlined,
  ContactsOutlined,
  IdcardOutlined,
  PassportOutlined,
  ReconciliationOutlined as ReconciliationIconOutlined,
  FileDoneOutlined,
  FileSyncOutlined,
  FileSearchOutlined,
  FileProtectOutlined as FileProtectIconOutlined,
  ContainerOutlined as ContainerIconOutlined,
  FundOutlined as FundIconOutlined,
  FundViewOutlined,
  FundProjectionScreenOutlined,
  LogoutOutlined,
  LoginOutlined,
  ImportOutlined,
  ExportOutlined,
  ShareAltOutlined,
  SendOutlined,
  MailOutlined as MailIconOutlined,
  MessageOutlined,
  CommentOutlined,
  CustomerServiceOutlined,
  QuestionOutlined,
  PlusOutlined as PlusIconOutlined,
  MinusOutlined as MinusIconOutlined,
  CloseOutlined,
  CheckOutlined,
  BorderOutlined as BorderIconOutlined,
  CheckSquareOutlined,
  CloseSquareOutlined,
  PlusSquareOutlined,
  MinusSquareOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  FastBackwardOutlined,
  FastForwardOutlined,
  ShrinkOutlined,
  ArrowsAltOutlined,
  ArrowUpOutlined as ArrowUpIconOutlined,
  ArrowDownOutlined as ArrowDownIconOutlined,
  ArrowLeftOutlined as ArrowLeftIconOutlined,
  ArrowRightOutlined as ArrowRightIconOutlined,
  FallOutlined,
  RiseOutlined,
  StockOutlined,
  BoxPlotOutlined,
  BuildOutlined,
  CalculatorOutlined,
  CalendarOutlined as CalendarIconOutlined,
  CameraOutlined,
  CarOutlined,
  CarryOutOutlined as CarryOutIconOutlined,
  CiOutlined,
  ClearOutlined,
  CloudDownloadOutlined as CloudDownloadIconOutlined,
  CloudServerOutlined as CloudServerIconOutlined,
  CloudSyncOutlined as CloudSyncIconOutlined,
  CloudUploadOutlined as CloudUploadIconOutlined,
  CommentOutlined as CommentIconOutlined,
  CompassOutlined as CompassIconOutlined,
  ConsoleSqlOutlined,
  ContactsOutlined as ContactsIconOutlined,
  ContainerOutlined as ContainerIcon2Outlined,
  ControlOutlined as ControlIconOutlined,
  CopyrightOutlined,
  CreditCardOutlined as CreditCardIconOutlined,
  CrownOutlined as CrownIcon2Outlined,
  CustomerServiceOutlined as CustomerServiceIconOutlined,
  DashboardOutlined as DashboardIcon2Outlined,
  DatabaseOutlined as DatabaseIconOutlined,
  DeleteOutlined as DeleteIconOutlined,
  DiffOutlined,
  DingdingOutlined as DingdingIconOutlined,
  DislikeOutlined as DislikeIconOutlined,
  DollarOutlined as DollarIconOutlined,
  DotChartOutlined as DotChartIconOutlined,
  DownCircleOutlined as DownCircleIconOutlined,
  DownOutlined as DownIcon2Outlined,
  DownloadOutlined as DownloadIconOutlined,
  DragOutlined as DragIconOutlined,
  EditOutlined as EditIconOutlined,
  EllipsisOutlined as EllipsisIconOutlined,
  EnvironmentOutlined as EnvironmentIconOutlined,
  EuroOutlined as EuroIconOutlined,
  ExclamationCircleOutlined as ExclamationCircleIcon2Outlined,
  ExclamationOutlined,
  ExpandAltOutlined as ExpandAltIconOutlined,
  ExpandOutlined as ExpandIconOutlined,
  ExperimentOutlined as ExperimentIconOutlined,
  ExportOutlined as ExportIconOutlined,
  EyeInvisibleOutlined as EyeInvisibleIconOutlined,
  EyeOutlined as EyeIconOutlined,
  FileAddOutlined as FileAddIconOutlined,
  FileDoneOutlined as FileDoneIconOutlined,
  FileExcelOutlined as FileExcelIconOutlined,
  FileExclamationOutlined,
  FileGifOutlined,
  FileImageOutlined as FileImageIconOutlined,
  FileJpgOutlined,
  FileMarkdownOutlined as FileMarkdownIconOutlined,
  FileOutlined,
  FilePdfOutlined as FilePdfIconOutlined,
  FilePptOutlined as FilePptIconOutlined,
  FileProtectOutlined as FileProtectIcon2Outlined,
  FileSearchOutlined as FileSearchIconOutlined,
  FileSyncOutlined as FileSyncIconOutlined,
  FileTextOutlined as FileTextIcon2Outlined,
  FileUnknownOutlined as FileUnknownIconOutlined,
  FileWordOutlined as FileWordIconOutlined,
  FileZipOutlined as FileZipIconOutlined,
  FilterOutlined,
  FireOutlined as FireIconOutlined,
  FlagOutlined as FlagIconOutlined,
  FolderAddOutlined as FolderAddIconOutlined,
  FolderOpenOutlined as FolderOpenIconOutlined,
  FolderOutlined as FolderIconOutlined,
  FontColorsOutlined as FontColorsIconOutlined,
  FontSizeOutlined as FontSizeIconOutlined,
  ForkOutlined,
  FormOutlined,
  FormatPainterOutlined as FormatPainterIconOutlined,
  FrownOutlined as FrownIconOutlined,
  FullscreenExitOutlined as FullscreenExitIconOutlined,
  FullscreenOutlined as FullscreenIconOutlined,
  GatewayOutlined,
  GiftOutlined as GiftIcon2Outlined,
  GlobalOutlined as GlobalIconOutlined,
  GoldOutlined,
  GroupOutlined as GroupIconOutlined,
  HddOutlined,
  HeartOutlined as HeartIconOutlined,
  HighlightOutlined,
  HistoryOutlined as HistoryIconOutlined,
  HolderOutlined,
  HomeOutlined as HomeIconOutlined,
  HourglassOutlined,
  Html5Outlined as Html5IconOutlined,
  IdcardOutlined as IdcardIconOutlined,
  ImportOutlined as ImportIconOutlined,
  InboxOutlined,
  InsertRowAboveOutlined as InsertRowAboveIconOutlined,
  InsertRowBelowOutlined as InsertRowBelowIconOutlined,
  InsertRowLeftOutlined as InsertRowLeftIconOutlined,
  InsertRowRightOutlined as InsertRowRightIconOutlined,
  InsuranceOutlined as InsuranceIconOutlined,
  InteractionOutlined,
  KeyOutlined as KeyIconOutlined,
  LaptopOutlined as LaptopIconOutlined,
  LayoutOutlined,
  LikeOutlined as LikeIconOutlined,
  LineChartOutlined as LineChartIconOutlined,
  LineHeightOutlined as LineHeightIconOutlined,
  LinkOutlined as LinkIconOutlined,
  Loading3QuartersOutlined,
  LoadingOutlined,
  LockOutlined as LockIconOutlined,
  LoginOutlined as LoginIconOutlined,
  LogoutOutlined as LogoutIconOutlined,
  MacCommandOutlined,
  MailOutlined as MailIcon2Outlined,
  ManOutlined as ManIconOutlined,
  MedicineBoxOutlined as MedicineBoxIconOutlined,
  MehOutlined as MehIconOutlined,
  MenuFoldOutlined as MenuFoldIcon2Outlined,
  MenuOutlined as MenuIconOutlined,
  MenuUnfoldOutlined as MenuUnfoldIcon2Outlined,
  MinusCircleOutlined as MinusCircleIconOutlined,
  MinusSquareOutlined as MinusSquareIconOutlined,
  MobileOutlined as MobileIconOutlined,
  MoneyCollectOutlined,
  MonitorOutlined,
  MoreOutlined as MoreIconOutlined,
  NodeCollapseOutlined as NodeCollapseIconOutlined,
  NodeExpandOutlined as NodeExpandIconOutlined,
  NodeIndexOutlined as NodeIndexIconOutlined,
  NumberOutlined,
  OneToOneOutlined,
  OrderedListOutlined as OrderedListIconOutlined,
  PaperClipOutlined as PaperClipIconOutlined,
  PartitionOutlined as PartitionIconOutlined,
  PauseCircleOutlined as PauseCircleIconOutlined,
  PauseOutlined,
  PercentageOutlined,
  PhoneOutlined as PhoneIconOutlined,
  PictureOutlined,
  PieChartOutlined as PieChartIconOutlined,
  PlayCircleOutlined as PlayCircleIconOutlined,
  PlaySquareOutlined,
  PlusCircleOutlined as PlusCircleIconOutlined,
  PlusOutlined as PlusIcon2Outlined,
  PlusSquareOutlined as PlusSquareIconOutlined,
  PoundOutlined as PoundIconOutlined,
  PoweroffOutlined,
  PrinterOutlined as PrinterIconOutlined,
  ProfileOutlined as ProfileIconOutlined,
  ProjectOutlined,
  PropertySafetyOutlined as PropertySafetyIconOutlined,
  PullRequestOutlined,
  PushpinOutlined as PushpinIconOutlined,
  QrcodeOutlined as QrcodeIconOutlined,
  QuestionCircleOutlined as QuestionCircleIconOutlined,
  QuestionOutlined as QuestionIconOutlined,
  RadarChartOutlined,
  RadiusBottomleftOutlined as RadiusBottomleftIconOutlined,
  RadiusBottomrightOutlined as RadiusBottomrightIconOutlined,
  RadiusUpleftOutlined as RadiusUpleftIconOutlined,
  RadiusUprightOutlined as RadiusUprightIconOutlined,
  RedEnvelopeOutlined as RedEnvelopeIconOutlined,
  RedoOutlined as RedoIconOutlined,
  ReloadOutlined as ReloadIconOutlined,
  RestOutlined as RestIconOutlined,
  RobotOutlined as RobotIconOutlined,
  RocketOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SafetyCertificateOutlined as SafetyCertificateIconOutlined,
  SafetyOutlined as SafetyIconOutlined,
  SaveOutlined,
  ScanOutlined,
  ScheduleOutlined as ScheduleIconOutlined,
  SearchOutlined as SearchIconOutlined,
  SecurityScanOutlined as SecurityScanIconOutlined,
  SelectOutlined,
  SendOutlined as SendIconOutlined,
  SettingOutlined as SettingIconOutlined,
  ShakeOutlined,
  ShareAltOutlined as ShareAltIconOutlined,
  ShopOutlined as ShopIcon2Outlined,
  ShoppingCartOutlined as ShoppingCartIcon2Outlined,
  ShoppingOutlined as ShoppingIconOutlined,
  SlackOutlined as SlackIconOutlined,
  SlidersOutlined as SlidersIconOutlined,
  SmileOutlined as SmileIconOutlined,
  SnippetsOutlined as SnippetsIconOutlined,
  SolutionOutlined as SolutionIconOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  SoundOutlined,
  SplitCellsOutlined as SplitCellsIconOutlined,
  StarOutlined as StarIconOutlined,
  StepBackwardOutlined as StepBackwardIconOutlined,
  StepForwardOutlined as StepForwardIconOutlined,
  StockOutlined as StockIconOutlined,
  StopOutlined as StopIconOutlined,
  StrikethroughOutlined as StrikethroughIconOutlined,
  SubnodeOutlined as SubnodeIconOutlined,
  SwapLeftOutlined as SwapLeftIconOutlined,
  SwapOutlined as SwapIconOutlined,
  SwapRightOutlined as SwapRightIconOutlined,
  SwitcherOutlined,
  SyncOutlined as SyncIconOutlined,
  TableOutlined,
  TabletOutlined as TabletIconOutlined,
  TagOutlined as TagIconOutlined,
  TagsOutlined as TagsIcon2Outlined,
  TaobaoOutlined as TaobaoIconOutlined,
  TeamOutlined as TeamIcon2Outlined,
  ThunderboltOutlined as ThunderboltIconOutlined,
  ToolOutlined as ToolIconOutlined,
  TrademarkCircleOutlined,
  TrademarkOutlined,
  TransactionOutlined as TransactionIconOutlined,
  TranslationOutlined,
  TrophyOutlined as TrophyIcon2Outlined,
  TwitterOutlined as TwitterIconOutlined,
  UnderlineOutlined as UnderlineIconOutlined,
  UndoOutlined as UndoIconOutlined,
  UngroupOutlined,
  UnlockOutlined as UnlockIconOutlined,
  UnorderedListOutlined as UnorderedListIconOutlined,
  UpCircleOutlined as UpCircleIconOutlined,
  UpOutlined as UpIconOutlined,
  UploadOutlined,
  UsbOutlined as UsbIconOutlined,
  UserAddOutlined as UserAddIconOutlined,
  UserDeleteOutlined as UserDeleteIconOutlined,
  UserOutlined as UserIcon2Outlined,
  UserSwitchOutlined as UserSwitchIconOutlined,
  UsergroupAddOutlined as UsergroupAddIconOutlined,
  UsergroupDeleteOutlined as UsergroupDeleteIconOutlined,
  VerifiedOutlined,
  VerticalAlignBottomOutlined as VerticalAlignBottomIconOutlined,
  VerticalAlignMiddleOutlined as VerticalAlignMiddleIconOutlined,
  VerticalAlignTopOutlined as VerticalAlignTopIconOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined,
  VideoCameraAddOutlined,
  VideoCameraOutlined,
  WalletOutlined as WalletIconOutlined,
  WarningOutlined as WarningIconOutlined,
  WechatOutlined as WechatIconOutlined,
  WeiboOutlined as WeiboIconOutlined,
  WifiOutlined as WifiIconOutlined,
  WindowsOutlined as WindowsIconOutlined,
  WomanOutlined as WomanIconOutlined,
  ZhihuOutlined as ZhihuIconOutlined,
  ZoomInOutlined as ZoomInIconOutlined,
  ZoomOutOutlined as ZoomOutIconOutlined
} from '@ant-design/icons';
import './style.css';

const { Sider, Content } = Layout;

const Component = function SolutionConfig() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('config');
  const [selectedGroup, setSelectedGroup] = useState('qual-review');

  // 顶部表单状态
  const [platform, setPlatform] = useState('平台abc');
  const [orgCode, setOrgCode] = useState('0001');
  const [parentOrg, setParentOrg] = useState('-');

  // 展示内容筛选
  const [displayContent, setDisplayContent] = useState('all');

  // 适用组织范围
  const [scopeType, setScopeType] = useState('current');

  // 全局开关
  const [globalEnabled, setGlobalEnabled] = useState(true);

  // 资格审查附件组成 - 表格数据
  const [qualReviewData, setQualReviewData] = useState([
    {
      id: 1,
      purchaseCategory: ['物资'],
      purchaseType: ['区域联采'],
      biddingMethod: ['公开招标'],
      defaultUse: true,
      forceUse: true,
      aiFileDetectEnabled: false,
      aiFileDetectConfig: '自由选择',
      fileItems: [
        { id: 101, name: '法人身份证', customContent: '', required: '是', defaultSample: '' },
        { id: 102, name: '自定义', customContent: '请输入自定义内容', required: '是', defaultSample: '' }
      ]
    }
  ]);

  // AI检测项分类数据
  const AI_CHECK_CATEGORIES = [
    { name: '签章类', items: ['是否盖章', '法人签字', '骑缝章'] },
    { name: '时效类', items: ['有效期校验', '年检状态'] },
    { name: '资质类', items: ['颁发机构核验', '资质等级匹配'] },
  ];

  // 每行文件项的AI检测项设置
  const [attachmentCheckSettings, setAttachmentCheckSettings] = useState<Record<number, string[]>>({});
  const [checkModalFileItemId, setCheckModalFileItemId] = useState<number | null>(null);
  const [checkModalRowId, setCheckModalRowId] = useState<number | null>(null);

  const aiDetectConfigOptions = ['自由选择', '默认是', '默认否', '强制是'];

  const toggleAttachmentCheck = (fileItemId: number, checkItem: string) => {
    setAttachmentCheckSettings((prev) => {
      const current = prev[fileItemId] || [];
      if (current.includes(checkItem)) {
        return { ...prev, [fileItemId]: current.filter((c) => c !== checkItem) };
      }
      return { ...prev, [fileItemId]: [...current, checkItem] };
    });
  };

  // 左侧菜单项 - 运营后台风格
  const menuItems = [
    { key: 'supplier_mgmt', icon: <TeamOutlined />, label: '分供商管理' },
    { key: 'template_mgmt', icon: <FileTextOutlined />, label: '模板管理' },
    { key: 'procurement_plan', icon: <ShoppingCartOutlined />, label: '采购计划管理' },
    { key: 'bidding', icon: <AuditOutlined />, label: '招标采购' },
    { key: 'config_mgmt', icon: <SettingOutlined />, label: '配置管理' },
    { key: 'identity_mgmt', icon: <SafetyCertificateOutlined />, label: '身份管理' },
    {
      key: 'solution',
      icon: <SolutionOutlined />,
      label: '解决方案',
      children: [
        { key: 'param_level_config', label: '参数层级配置' },
        { key: 'product_solution_config', label: '产品解决方案配置' },
        { key: 'operation_solution_config', label: '运营解决方案配置' }
      ]
    },
    { key: 'contract_mgmt', icon: <FileProtectOutlined />, label: '合同管理' },
    { key: 'performance_mgmt', icon: <CheckCircleOutlined />, label: '履约管理' },
    { key: 'inspection', icon: <ContainerOutlined />, label: '收验货' },
    { key: 'marketing_mgmt', icon: <ShopOutlined />, label: '营销管理' },
    { key: 'operation_tools', icon: <ToolOutlined />, label: '运营工具' },
    {
      key: 'risk_warning_center',
      icon: <WarningOutlined />,
      label: '风控预警中心',
      children: [
        { key: 'field_config', label: '字段配置' },
        { key: 'rule_config', label: '规则配置' },
        { key: 'scene_mgmt', label: '场景管理' },
        { key: 'warning_config', label: '预警配置' },
        { key: 'operation_mgmt', label: '运营管理' },
        { key: 'rule_mgmt', label: '规则管理' },
        { key: 'notification_center', label: '通知中心' },
        { key: 'log_center', label: '日志中心' }
      ]
    }
  ];

  // 树形数据 - 左侧组成列表
  const treeData = [
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

  // 树节点标题渲染 - 支持NEW标签
  const renderTreeTitle = (node: any) => {
    return (
      <span className="tree-node-title">
        <span className="tree-node-label">{node.title}</span>
        {node.tag && (
          <span className="tree-node-tag">{node.tag}</span>
        )}
      </span>
    );
  };

  // 处理树数据，添加title渲染
  const processTreeData = (data: any[]): any[] => {
    return data.map(node => ({
      ...node,
      title: renderTreeTitle(node),
      children: node.children ? processTreeData(node.children) : undefined
    }));
  };

  const [expandedKeys, setExpandedKeys] = useState<string[]>(['buyer-workbench', 'bidding-mgmt', 'appointment-bid']);
  const [selectedTreeKeys, setSelectedTreeKeys] = useState<string[]>(['data-governance']);

  const tabItems = [
    { key: 'config', label: '方案配置' },
    { key: 'distribute', label: '配置下发' },
    { key: 'func-desc', label: '功能说明' },
    { key: 'operation-log', label: '操作日志' },
  ];

  const purchaseCategories = ['物资', '设备', '劳务分包', '专业分包', '专业服务', '租赁'];
  const purchaseTypes = ['招标采购', '区域联采', '战略采购', '集中采购', '分散采购', '电子商城采购'];
  const biddingMethods = ['公开招标', '邀请招标', '询比采购', '竞价采购', '谈判采购'];
  const requiredOptions = ['是', '否'];
  const fileItemOptions = ['营业执照', '法人身份证', '银行信用等级', '工商企业信用等级', '纳税信用等级', '财务会计信用等级', '资质证书', '安全施工许可证', '自定义'];

  const handleAddRow = () => {
    setQualReviewData(prev => [
      ...prev,
      {
        id: Date.now(),
        purchaseCategory: ['物资'],
        purchaseType: ['区域联采'],
        biddingMethod: ['公开招标'],
        defaultUse: false,
        forceUse: false,
        aiFileDetectEnabled: false,
        aiFileDetectConfig: '自由选择',
        fileItems: []
      }
    ]);
  };

  const handleDeleteRow = (id: number) => {
    setQualReviewData(prev => prev.filter(item => item.id !== id));
  };

  const handleAddFileItem = (rowId: number) => {
    setQualReviewData(prev => prev.map(item => {
      if (item.id === rowId) {
        return {
          ...item,
          fileItems: [
            ...item.fileItems,
            { id: Date.now(), name: '', customContent: '', required: '是', defaultSample: '' }
          ]
        };
      }
      return item;
    }));
  };

  const handleDeleteFileItem = (rowId: number, fileItemId: number) => {
    setQualReviewData(prev => prev.map(item => {
      if (item.id === rowId) {
        return {
          ...item,
          fileItems: item.fileItems.filter(fi => fi.id !== fileItemId)
        };
      }
      return item;
    }));
  };

  const handleUpdateRow = (id: number, field: string, value: any) => {
    setQualReviewData(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleUpdateFileItem = (rowId: number, fileItemId: number, field: string, value: any) => {
    setQualReviewData(prev => prev.map(item => {
      if (item.id === rowId) {
        return {
          ...item,
          fileItems: item.fileItems.map(fi =>
            fi.id === fileItemId ? { ...fi, [field]: value } : fi
          )
        };
      }
      return item;
    }));
  };

  return (
    <Layout className="solution-config-page">
      {/* 左侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={200}
        collapsedWidth={60}
        className="left-sidebar"
      >
        <div className="logo">
          <img src={logoImage} alt="运营后台logo" className="logo-icon" />
          {!collapsed && <span className="logo-text">集采运营后台</span>}
        </div>
        <Menu
          mode="inline"
          selectedKeys={['operation_solution_config']}
          defaultOpenKeys={['solution']}
          items={menuItems}
          className="sidebar-menu"
        />
        <div className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      </Sider>

      {/* 主内容区 */}
      <Layout className="main-layout">
        {/* 顶部导航栏 */}
        <div className="top-header">
          <div className="header-right">
            <Button type="text" icon={<DownloadOutlined />}>下载中心</Button>
            <Button type="text" icon={<UserOutlined />}>admin</Button>
          </div>
        </div>

        {/* 面包屑导航栏 */}
        <div className="breadcrumb-bar">
          <div className="breadcrumb-nav">
            <span className="breadcrumb-item">解决方案</span>
            <span className="breadcrumb-separator">&gt;</span>
            <span className="breadcrumb-item active">运营解决方案配置</span>
          </div>
        </div>

        {/* 页面主体内容 */}
        <Content className="main-content">
          <div className="content-wrapper">
            {/* 顶部信息栏 */}
            <div className="org-info-bar">
              <div className="org-search">
                <Select
                  defaultValue="平台abc"
                  className="org-select"
                  options={[
                    { label: '平台abc', value: '平台abc' },
                    { label: '平台xyz', value: '平台xyz' }
                  ]}
                  value={platform}
                  onChange={setPlatform}
                />
              </div>
              <div className="org-details">
                <span className="org-info-item">
                  <span className="org-label">机构编码：</span>
                  <span className="org-value">{orgCode}</span>
                </span>
                <span className="org-info-item">
                  <span className="org-label">上级组织：</span>
                  <span className="org-value">{parentOrg}</span>
                </span>
              </div>
            </div>

            {/* 主体内容：左右布局 */}
            <div className="main-body">
              {/* 左侧树形列表 */}
              <div className="left-panel tree-panel">
                {/* 展示内容筛选 */}
                <div className="display-filter">
                  <span className="filter-label">展示内容：</span>
                  <Radio.Group value={displayContent} onChange={(e) => setDisplayContent(e.target.value)}>
                    <Radio value="all">全部解决方案</Radio>
                    <Radio value="distributed">下发客户的解决方案</Radio>
                  </Radio.Group>
                </div>
                <div className="tree-search">
                  <Input
                    prefix={<SearchOutlined />}
                    placeholder="请输入关键字"
                    className="tree-search-input"
                  />
                </div>
                <Tree
                  className="composition-tree"
                  treeData={processTreeData(treeData)}
                  expandedKeys={expandedKeys}
                  selectedKeys={selectedTreeKeys}
                  onExpand={(keys) => setExpandedKeys(keys as string[])}
                  onSelect={(keys) => setSelectedTreeKeys(keys as string[])}
                  showLine={{ showLeafIcon: false }}
                  showIcon={false}
                  defaultExpandAll={false}
                />
              </div>

              {/* 右侧内容区 */}
              <div className="right-panel">
                <div className="right-panel-inner">
                  {/* Tab 导航 */}
                  <div className="tab-nav">
                    {tabItems.map(tab => (
                      <button
                        key={tab.key}
                        className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab 内容 */}
                  <div className="tab-content">
                    {activeTab === 'config' && (
                      <div>
                        {/* 全局开关 */}
                        <div className="section-header">
                          <div className="section-title-bar">
                            <div className="title-indicator"></div>
                            <h2 className="section-title">资格审查附件组成</h2>
                          </div>
                          <Switch
                            size="small"
                            checked={globalEnabled}
                            onChange={setGlobalEnabled}
                          />
                        </div>

                        {/* 参数说明 */}
                        <div className="param-desc">
                          <span className="desc-label">参数说明：</span>
                          在对应品类及采购类型条件下，可配置供应商需要上传哪些资格审查文件
                        </div>

                        {/* 适用组织范围 */}
                        <div className="scope-row">
                          <span className="scope-label">适用组织范围：</span>
                          <Radio.Group value={scopeType} onChange={(e) => setScopeType(e.target.value)}>
                            <Radio value="current">本级</Radio>
                            <Radio value="subordinate">本下级</Radio>
                          </Radio.Group>
                        </div>

                        {/* 表格区域 */}
                        {globalEnabled && (
                          <div className="table-area">
                            {/* 主表格 - 采购条件配置 */}
                            <Table
                              className="main-table"
                              dataSource={qualReviewData}
                              rowKey="id"
                              pagination={false}
                              bordered
                              columns={[
                                {
                                  title: '采购品类',
                                  dataIndex: 'purchaseCategory',
                                  key: 'purchaseCategory',
                                  render: (value: string[], record: any) => (
                                    <Select
                                      mode="multiple"
                                      value={value}
                                      onChange={(val) => handleUpdateRow(record.id, 'purchaseCategory', val)}
                                      options={purchaseCategories.map(c => ({ label: c, value: c }))}
                                      style={{ width: '100%' }}
                                      placeholder="请选择"
                                    />
                                  )
                                },
                                {
                                  title: '采购类型&组织形式',
                                  dataIndex: 'purchaseType',
                                  key: 'purchaseType',
                                  render: (value: string[], record: any) => (
                                    <Select
                                      mode="multiple"
                                      value={value}
                                      onChange={(val) => handleUpdateRow(record.id, 'purchaseType', val)}
                                      options={purchaseTypes.map(t => ({ label: t, value: t }))}
                                      style={{ width: '100%' }}
                                      placeholder="请选择"
                                    />
                                  )
                                },
                                {
                                  title: '招标方式&采购方式',
                                  dataIndex: 'biddingMethod',
                                  key: 'biddingMethod',
                                  render: (value: string[], record: any) => (
                                    <Select
                                      mode="multiple"
                                      value={value}
                                      onChange={(val) => handleUpdateRow(record.id, 'biddingMethod', val)}
                                      options={biddingMethods.map(m => ({ label: m, value: m }))}
                                      style={{ width: '100%' }}
                                      placeholder="请选择"
                                    />
                                  )
                                },
                                {
                                  title: '默认使用',
                                  dataIndex: 'defaultUse',
                                  key: 'defaultUse',
                                  width: 100,
                                  align: 'center',
                                  render: (value: boolean, record: any) => (
                                    <Switch
                                      size="small"
                                      checked={value}
                                      onChange={(checked) => handleUpdateRow(record.id, 'defaultUse', checked)}
                                    />
                                  )
                                },
                                {
                                  title: '强制使用',
                                  dataIndex: 'forceUse',
                                  key: 'forceUse',
                                  width: 100,
                                  align: 'center',
                                  render: (value: boolean, record: any) => (
                                    <Switch
                                      size="small"
                                      checked={value}
                                      onChange={(checked) => handleUpdateRow(record.id, 'forceUse', checked)}
                                    />
                                  )
                                },
                                {
                                  title: 'AI辅助报名文件检测是否开启',
                                  dataIndex: 'aiFileDetectEnabled',
                                  key: 'aiFileDetectEnabled',
                                  width: 180,
                                  align: 'center',
                                  render: (value: boolean, record: any) => (
                                    <Switch
                                      size="small"
                                      checked={value}
                                      onChange={(checked) => handleUpdateRow(record.id, 'aiFileDetectEnabled', checked)}
                                    />
                                  )
                                },
                                {
                                  title: 'AI辅助报名文件检测配置',
                                  dataIndex: 'aiFileDetectConfig',
                                  key: 'aiFileDetectConfig',
                                  width: 180,
                                  align: 'center',
                                  render: (value: string, record: any) => (
                                    <Select
                                      value={value}
                                      onChange={(val) => handleUpdateRow(record.id, 'aiFileDetectConfig', val)}
                                      options={aiDetectConfigOptions.map(o => ({ label: o, value: o }))}
                                      style={{ width: '100%' }}
                                      placeholder="请选择"
                                    />
                                  )
                                },
                                {
                                  title: '操作',
                                  key: 'action',
                                  width: 120,
                                  align: 'center',
                                  render: (_: any, record: any) => (
                                    <Space direction="vertical" size="small">
                                      <Button type="link" size="small" onClick={() => handleAddFileItem(record.id)}>
                                        添加文件项
                                      </Button>
                                      <Button type="link" size="small" danger onClick={() => handleDeleteRow(record.id)}>
                                        删除
                                      </Button>
                                    </Space>
                                  )
                                }
                              ]}
                            />

                            {/* 子表格 - 文件项配置 */}
                            {qualReviewData.map((row) => (
                              row.fileItems.length > 0 && (
                                <div key={`file-table-${row.id}`} className="file-table-wrapper">
                                  <Table
                                    className="file-table"
                                    dataSource={row.fileItems}
                                    rowKey="id"
                                    pagination={false}
                                    bordered
                                    columns={[
                                      {
                                        title: '文件项',
                                        dataIndex: 'name',
                                        key: 'name',
                                        render: (value: string, record: any) => (
                                          <Select
                                            value={value}
                                            onChange={(val) => handleUpdateFileItem(row.id, record.id, 'name', val)}
                                            options={fileItemOptions.map(o => ({ label: o, value: o }))}
                                            style={{ width: '100%' }}
                                            placeholder="请选择文件项"
                                          />
                                        )
                                      },
                                      {
                                        title: '自定义内容',
                                        dataIndex: 'customContent',
                                        key: 'customContent',
                                        render: (value: string, record: any) => (
                                          record.name === '自定义' ? (
                                            <Input
                                              value={value}
                                              onChange={(e) => handleUpdateFileItem(row.id, record.id, 'customContent', e.target.value)}
                                              placeholder="请输入自定义内容"
                                            />
                                          ) : (
                                            <span style={{ color: '#999' }}>-</span>
                                          )
                                        )
                                      },
                                      {
                                        title: '是否必选',
                                        dataIndex: 'required',
                                        key: 'required',
                                        width: 120,
                                        align: 'center',
                                        render: (value: string, record: any) => (
                                          <Select
                                            value={value}
                                            onChange={(val) => handleUpdateFileItem(row.id, record.id, 'required', val)}
                                            options={requiredOptions.map(o => ({ label: o, value: o }))}
                                            style={{ width: '100%' }}
                                          />
                                        )
                                      },
                                      {
                                        title: '默认范本',
                                        dataIndex: 'defaultSample',
                                        key: 'defaultSample',
                                        render: () => (
                                          <Button type="dashed" size="small" icon={<PlusOutlined />}>
                                            添加附件
                                          </Button>
                                        )
                                      },
                                      ...(row.aiFileDetectEnabled ? [
                                        {
                                          title: 'AI检测项设置',
                                          key: 'aiCheckSetting',
                                          width: 140,
                                          align: 'center',
                                          render: (_: any, record: any) => {
                                            const selected = attachmentCheckSettings[record.id] || [];
                                            return (
                                              <Button
                                                type="primary"
                                                ghost
                                                size="small"
                                                icon={<SettingOutlined />}
                                                onClick={() => {
                                                  setCheckModalRowId(row.id);
                                                  setCheckModalFileItemId(record.id);
                                                }}
                                              >
                                                {selected.length > 0 ? `已选${selected.length}项` : '设置检测项'}
                                              </Button>
                                            );
                                          }
                                        }
                                      ] : []),
                                      {
                                        title: '操作',
                                        key: 'action',
                                        width: 100,
                                        align: 'center',
                                        render: (_: any, record: any) => (
                                          <Button type="link" size="small" danger onClick={() => handleDeleteFileItem(row.id, record.id)}>
                                            删除
                                          </Button>
                                        )
                                      }
                                    ]}
                                  />
                                </div>
                              )
                            ))}

                            {/* 添加行按钮 */}
                            <div className="add-row-btn" onClick={handleAddRow}>
                              <PlusOutlined /> 添加
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'distribute' && (
                      <div className="placeholder-content">
                        <SettingOutlined className="placeholder-icon" />
                        <p>配置下发功能待实现</p>
                      </div>
                    )}

                    {activeTab === 'func-desc' && (
                      <div className="placeholder-content">
                        <InfoCircleOutlined className="placeholder-icon" />
                        <p>功能说明待补充</p>
                      </div>
                    )}

                    {activeTab === 'operation-log' && (
                      <div className="placeholder-content">
                        <ClockCircleOutlined className="placeholder-icon" />
                        <p>操作日志待实现</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 底部提交按钮 */}
            <div className="footer-actions">
              <Button type="primary" size="large">提交</Button>
            </div>
          </div>
        </Content>
      </Layout>

      {/* AI检测项设置弹窗 */}
      {checkModalFileItemId !== null && checkModalRowId !== null && (
        <div className="ai-check-modal-overlay" onClick={() => { setCheckModalFileItemId(null); setCheckModalRowId(null); }}>
          <div className="ai-check-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ai-check-modal-header">
              <SettingOutlined className="ai-check-modal-icon" />
              <span className="ai-check-modal-title">
                检测项设置 - {qualReviewData.find(r => r.id === checkModalRowId)?.fileItems.find(f => f.id === checkModalFileItemId)?.name || ''}
              </span>
              <Button type="text" size="small" onClick={() => { setCheckModalFileItemId(null); setCheckModalRowId(null); }}>
                <CloseOutlined />
              </Button>
            </div>
            <div className="ai-check-modal-body">
              {(() => {
                const selected = attachmentCheckSettings[checkModalFileItemId] || [];
                return (
                  <div className="ai-check-categories">
                    {AI_CHECK_CATEGORIES.map((category) => (
                      <div key={category.name} className="ai-check-category">
                        <h4 className="ai-check-category-title">{category.name}</h4>
                        <div className="ai-check-items">
                          {category.items.map((item) => (
                            <label key={item} className="ai-check-item">
                              <input
                                type="checkbox"
                                checked={selected.includes(item)}
                                onChange={() => toggleAttachmentCheck(checkModalFileItemId, item)}
                              />
                              <span>{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            <div className="ai-check-modal-footer">
              <span className="ai-check-selected-count">
                已选 {(attachmentCheckSettings[checkModalFileItemId] || []).length} 项
              </span>
              <Button type="primary" onClick={() => { setCheckModalFileItemId(null); setCheckModalRowId(null); }}>
                确定
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Component;
