/**
 * @name 规则配置页面
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /rules/design-guide.md
 * - /src/themes/antd-new/DESIGN-SPEC.md
 * - /src/prototypes/rule-config/spec.md
 */

import './style.css';
import logoImage from '../../../assets/media/运营后台左上角logo.png';

import React, { useState, useCallback } from 'react';
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

const { Sider, Content } = Layout;

// 预警级别颜色
const warningLevelColors: Record<string, string> = {
  high: '#ff4d4f',
  medium_high: '#fa8c16',
  medium: '#faad14',
  low: '#52c41a'
};

// 规则数据 - 树形结构，带类型、状态、预警级别
const ruleTreeData = [
  {
    title: '招投标',
    key: 'bidding',
    children: [
      {
        title: '组织最低集中采购率（<xx%）',
        key: 'min_procurement_rate',
        level: 'high',
        type: '股',
        status: '禁'
      },
      {
        title: '组织最低在线评标率（<xx%）',
        key: 'min_evaluation_rate',
        level: 'high',
        type: '股',
        status: '禁'
      },
      {
        title: '组织最低公开采购率（<xx%）',
        key: 'min_public_rate',
        level: 'medium',
        type: '股',
        status: '禁'
      },
      {
        title: '保证金超概算金额',
        key: 'deposit_exceed',
        level: 'low',
        type: '股',
        status: '禁'
      },
      {
        title: '评标人数不满足要求',
        key: 'evaluator_count',
        level: 'low',
        type: '启',
        status: '启'
      },
      {
        title: '报名时间过短',
        key: 'register_time_short',
        level: 'medium',
        type: '客',
        status: '启'
      },
      {
        title: '供应商规律报价',
        key: 'supplier_regular_quote',
        level: 'medium_high',
        type: '企',
        status: '启'
      },
      {
        title: '供应商工商关联',
        key: 'supplier_relation',
        level: 'low',
        type: '股',
        status: '禁'
      },
      {
        title: '最少有效报名供应商数量',
        key: 'min_supplier_count',
        level: 'low',
        type: '股',
        status: '禁'
      },
      {
        title: '股份禁止交易名单',
        key: 'blocklist',
        level: 'medium',
        type: '股',
        status: '禁'
      },
      {
        title: '信息重叠',
        key: 'info_overlap',
        level: 'low',
        type: '股',
        status: '启'
      },
      {
        title: '投标时间过短',
        key: 'bid_time_short',
        level: 'medium',
        type: '股',
        status: '启'
      },
      {
        title: '资审公告、招标报价文件使用电子签',
        key: 'electronic_signature',
        level: 'low',
        type: '股',
        status: '启'
      },
      {
        title: '招标公告、招标报价文件使用电子签',
        key: 'electronic_signature2',
        level: 'low',
        type: '局',
        status: '启'
      }
    ]
  }
];

// 表格数据
const tableData = [
  {
    key: '1',
    purchaseCategory: '物资',
    purchaseType: '招标采购',
    purchaseMethod: '公开招标',
    warningType: '公开招标',
    warningMethod: '拦截',
    notifyMethod: '短信',
    notifyTarget: '采购经理',
    maxAdjust: '111',
    minAdjust: '0',
    operation: 'edit'
  }
];

const Component = function RuleConfig() {
  const [activeTab, setActiveTab] = useState('cloud_procurement');
  const [selectedRule, setSelectedRule] = useState<string>('price_adjust_limit');
  const [activeConfigTab, setActiveConfigTab] = useState('plan');
  const [collapsed, setCollapsed] = useState(false);

  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key);
  }, []);

  const handleConfigTabChange = useCallback((key: string) => {
    setActiveConfigTab(key);
  }, []);

  // 左侧菜单项 - 根据截图结构定义
  const menuItems = [
    { key: 'supplier_mgmt', icon: <TeamOutlined />, label: '分供商管理' },
    { key: 'template_mgmt', icon: <FileTextOutlined />, label: '模板管理' },
    { key: 'procurement_plan', icon: <ShoppingCartOutlined />, label: '采购计划管理' },
    { key: 'bidding', icon: <AuditOutlined />, label: '招标采购' },
    { key: 'config_mgmt', icon: <SettingOutlined />, label: '配置管理' },
    { key: 'identity_mgmt', icon: <SafetyCertificateOutlined />, label: '身份管理' },
    { key: 'solution', icon: <SolutionOutlined />, label: '解决方案' },
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

  // 采购品类选项
  const purchaseCategoryOptions = [
    { label: '物资', value: '物资' },
    { label: '劳务分包', value: '劳务分包' },
    { label: '专业分包', value: '专业分包' },
    { label: '专业服务', value: '专业服务' },
    { label: '租赁', value: '租赁' },
    { label: '设备', value: '设备' }
  ];

  // 采购类型选项
  const purchaseTypeOptions = [
    { label: '招标采购', value: '招标采购' },
    { label: '区域联采', value: '区域联采' },
    { label: '战略采购', value: '战略采购' },
    { label: '集中采购', value: '集中采购' },
    { label: '分散采购', value: '分散采购' }
  ];

  // 采购方式选项
  const purchaseMethodOptions = [
    { label: '公开招标', value: '公开招标' },
    { label: '邀请招标', value: '邀请招标' },
    { label: '询价采购', value: '询价采购' },
    { label: '竞争性谈判', value: '竞争性谈判' },
    { label: '单一来源', value: '单一来源' },
    { label: '紧急采购', value: '紧急采购' }
  ];

  // 预警方式选项
  const warningMethodOptions = [
    { label: '拦截', value: '拦截' },
    { label: '预警', value: '预警' },
    { label: '可忽略', value: '可忽略' }
  ];

  // 通知方式选项
  const notifyMethodOptions = [
    { label: '提示框', value: '提示框' },
    { label: '短信', value: '短信' },
    { label: '邮件', value: '邮件' },
    { label: '站内信', value: '站内信' }
  ];

  // 表格列定义 - 可编辑
  const columns = [
    {
      title: <span><span style={{ color: '#ff4d4f' }}>*</span>采购品类</span>,
      dataIndex: 'purchaseCategory',
      key: 'purchaseCategory',
      width: 120,
      render: (value: string, record: any) => (
        <Select
          mode="multiple"
          placeholder="请选择"
          value={value ? value.split(',').filter(Boolean) : []}
          options={purchaseCategoryOptions}
          style={{ width: '100%' }}
          tagRender={({ label }) => <Tag closable>{label}</Tag>}
        />
      )
    },
    {
      title: <span><span style={{ color: '#ff4d4f' }}>*</span>采购类型&组织形式</span>,
      dataIndex: 'purchaseType',
      key: 'purchaseType',
      width: 140,
      render: (value: string, record: any) => (
        <Select
          mode="multiple"
          placeholder="请选择"
          value={value ? value.split(',').filter(Boolean) : []}
          options={purchaseTypeOptions}
          style={{ width: '100%' }}
          tagRender={({ label }) => <Tag closable>{label}</Tag>}
        />
      )
    },
    {
      title: <span><span style={{ color: '#ff4d4f' }}>*</span>招标方式&采购方式</span>,
      dataIndex: 'purchaseMethod',
      key: 'purchaseMethod',
      width: 140,
      render: (value: string, record: any) => (
        <Select
          mode="multiple"
          placeholder="请选择"
          value={value ? value.split(',').filter(Boolean) : []}
          options={purchaseMethodOptions}
          style={{ width: '100%' }}
          tagRender={({ label }) => <Tag closable>{label}</Tag>}
        />
      )
    },
    {
      title: <span><span style={{ color: '#ff4d4f' }}>*</span>预警类型</span>,
      dataIndex: 'warningType',
      key: 'warningType',
      width: 100,
      render: (value: string) => (
        <Select
          placeholder="请选择"
          value={value}
          options={[
            { label: '拦截', value: '拦截' },
            { label: '预警', value: '预警' },
            { label: '可忽略', value: '可忽略' }
          ]}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: '预警方式',
      dataIndex: 'warningMethod',
      key: 'warningMethod',
      width: 100,
      render: (value: string) => (
        <Select
          placeholder="请选择"
          value={value}
          options={warningMethodOptions}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: '通知方式',
      dataIndex: 'notifyMethod',
      key: 'notifyMethod',
      width: 100,
      render: (value: string) => (
        <Select
          placeholder="请选择"
          value={value}
          options={notifyMethodOptions}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: '通知对象',
      dataIndex: 'notifyTarget',
      key: 'notifyTarget',
      width: 100,
      render: (value: string) => (
        <Select
          placeholder="选择角色"
          value={value}
          options={[
            { label: '采购经理', value: '采购经理' },
            { label: '项目经理', value: '项目经理' },
            { label: '风控专员', value: '风控专员' }
          ]}
          style={{ width: '100%' }}
          suffixIcon={<UserOutlined />}
        />
      )
    },
    {
      title: <span><span style={{ color: '#ff4d4f' }}>*</span>最大调价次数</span>,
      dataIndex: 'maxAdjust',
      key: 'maxAdjust',
      width: 100,
      render: (value: string) => (
        <Input value={value} placeholder="请输入" style={{ width: '100%' }} />
      )
    },
    {
      title: <span><span style={{ color: '#ff4d4f' }}>*</span>最小调价次数</span>,
      dataIndex: 'minAdjust',
      key: 'minAdjust',
      width: 100,
      render: (value: string) => (
        <Input value={value} placeholder="请输入" style={{ width: '100%' }} />
      )
    },
    {
      title: '操作',
      key: 'operation',
      width: 80,
      render: () => (
        <Space>
          <a style={{ color: '#1890ff' }}>编辑</a>
          <a style={{ color: '#ff4d4f' }}>删除</a>
        </Space>
      )
    }
  ];

  return (
    <Layout className="rule-config-page">
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
          selectedKeys={['rule_mgmt']}
          defaultOpenKeys={['risk_warning_center']}
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
            <span className="breadcrumb-item">风控管理中心</span>
            <span className="breadcrumb-separator">&gt;</span>
            <span className="breadcrumb-item active">规则管理</span>
          </div>
        </div>

        {/* 机构信息栏 */}
        <div className="org-info-bar">
          <div className="org-search">
            <Input
              prefix={<SearchOutlined />}
              placeholder="中国建筑股份有限公司"
              className="search-input"
            />
          </div>
          <div className="org-details">
            <span className="org-info-item">
              <span className="org-label">机构名称：</span>
              <span className="org-value">中国建筑股份有限公司</span>
            </span>
            <span className="org-info-item">
              <span className="org-label">机构代码：</span>
              <span className="org-value">00010100</span>
            </span>
            <span className="org-info-item">
              <span className="org-label">上级机构：</span>
              <span className="org-value">平台abc</span>
            </span>
          </div>
        </div>

        {/* 业务线 Tab */}
        <div className="business-tabs">
          <div
            className={`tab-item ${activeTab === 'cloud_procurement' ? 'active' : ''}`}
            onClick={() => handleTabChange('cloud_procurement')}
          >
            云筑集采
          </div>
          <div
            className={`tab-item ${activeTab === 'cloud_mall' ? 'active' : ''}`}
            onClick={() => handleTabChange('cloud_mall')}
          >
            云筑商城
          </div>
          <div
            className={`tab-item ${activeTab === 'cloud_labor' ? 'active' : ''}`}
            onClick={() => handleTabChange('cloud_labor')}
          >
            云筑劳务
          </div>
          <div
            className={`tab-item ${activeTab === 'cloud_finance' ? 'active' : ''}`}
            onClick={() => handleTabChange('cloud_finance')}
          >
            云筑金服
          </div>
        </div>

        {/* 页面主体内容 */}
        <Content className="main-content">
          <div className="content-wrapper">
            {/* 左侧规则树 */}
            <div className="rule-tree-panel">
              <div className="tree-search">
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="输入规则名称"
                  className="tree-search-input"
                />
              </div>
              <Tree
                className="rule-tree"
                defaultExpandAll
                treeData={ruleTreeData.map(node => ({
                  ...node,
                  title: (
                    <span className="tree-node-title">{node.title}</span>
                  ),
                  children: node.children?.map((child: any) => ({
                    ...child,
                    title: (
                      <div className="tree-rule-item">
                        <Tag className="rule-type-tag" color="default">{child.type}</Tag>
                        <Tag 
                          className="rule-status-tag" 
                          color={child.status === '禁' ? 'red' : 'green'}
                        >
                          {child.status}
                        </Tag>
                        <span 
                          className="rule-level-dot"
                          style={{ backgroundColor: warningLevelColors[child.level] }}
                        />
                        <span className="rule-name-text">{child.title}</span>
                      </div>
                    )
                  }))
                }))}
                selectedKeys={[selectedRule]}
                onSelect={(keys) => {
                  if (keys.length > 0) {
                    setSelectedRule(keys[0] as string);
                  }
                }}
              />
            </div>

            {/* 右侧配置区 */}
            <div className="config-panel">
              {/* 标签页 */}
              <div className="config-tabs">
                <div
                  className={`config-tab ${activeConfigTab === 'plan' ? 'active' : ''}`}
                  onClick={() => handleConfigTabChange('plan')}
                >
                  方案配置
                </div>
                <div
                  className={`config-tab ${activeConfigTab === 'deploy' ? 'active' : ''}`}
                  onClick={() => handleConfigTabChange('deploy')}
                >
                  配置下发
                </div>
                <div
                  className={`config-tab ${activeConfigTab === 'log' ? 'active' : ''}`}
                  onClick={() => handleConfigTabChange('log')}
                >
                  操作日志
                </div>
              </div>

              {/* 配置内容 */}
              {activeConfigTab === 'plan' && (
                <div className="config-content">
                  {/* 黄色提示条 */}
                  <Alert
                    message="该规则已被应用到 中国建筑股份有限公司 及其下级，您可以继续编辑或停用该配置"
                    type="warning"
                    showIcon
                    className="warning-alert"
                  />

                  {/* 规则名称 */}
                  <div className="config-section">
                    <div className="section-header">
                      <span className="section-title">调价轮次限制</span>
                      <Switch defaultChecked className="section-switch" />
                      <Button type="primary" className="add-rule-btn">一键复制</Button>
                    </div>
                  </div>

                  {/* 表单区域 */}
                  <div className="config-form">
                    <div className="form-row">
                      <div className="form-label">适用组织范围：</div>
                      <div className="form-value">
                        <Radio.Group defaultValue="current">
                          <Radio value="current">本级</Radio>
                          <Radio value="subordinate">本下级</Radio>
                        </Radio.Group>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-label">下级独立配置：</div>
                      <div className="form-value">
                        <Radio.Group defaultValue="allow">
                          <Radio value="allow">允许</Radio>
                          <Radio value="disallow">不允许</Radio>
                        </Radio.Group>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-label">预警级别：</div>
                      <div className="form-value">
                        <Radio.Group defaultValue="medium">
                          <Radio value="high" style={{ color: '#ff4d4f' }}>
                            <span className="level-dot" style={{ backgroundColor: '#ff4d4f' }} /> 高风险
                          </Radio>
                          <Radio value="medium_high" style={{ color: '#fa8c16' }}>
                            <span className="level-dot" style={{ backgroundColor: '#fa8c16' }} /> 中高风险
                          </Radio>
                          <Radio value="medium" style={{ color: '#faad14' }}>
                            <span className="level-dot" style={{ backgroundColor: '#faad14' }} /> 中风险
                          </Radio>
                          <Radio value="low" style={{ color: '#52c41a' }}>
                            <span className="level-dot" style={{ backgroundColor: '#52c41a' }} /> 低风险
                          </Radio>
                        </Radio.Group>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-label">是否去重：</div>
                      <div className="form-value">
                        <Radio.Group defaultValue="no">
                          <Radio value="yes">去重</Radio>
                          <Radio value="no">不去重</Radio>
                        </Radio.Group>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-label">规则类型：</div>
                      <div className="form-value">
                        <Tag color="blue">合规风险</Tag>
                      </div>
                    </div>
                  </div>

                  {/* 表格区域 */}
                  <div className="table-section">
                    <Table
                      columns={columns}
                      dataSource={tableData}
                      pagination={false}
                      bordered
                      size="small"
                      className="config-table"
                    />
                    <Button type="dashed" block className="add-row-btn">
                      <PlusOutlined /> 添加一项
                    </Button>
                  </div>

                  {/* 提交按钮 */}
                  <div className="submit-section">
                    <Button type="primary" size="large" className="submit-btn">
                      提交
                    </Button>
                  </div>
                </div>
              )}

              {activeConfigTab === 'deploy' && (
                <div className="empty-content">
                  <InfoCircleOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
                  <p>配置下发功能开发中...</p>
                </div>
              )}

              {activeConfigTab === 'log' && (
                <div className="empty-content">
                  <FileTextIconOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
                  <p>暂无操作日志</p>
                </div>
              )}
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Component;
