/**
 * 浏览器端文件解析：Excel / CSV 转二维表，PDF 转文本行。
 * 只做「结构还原」，语义理解交给大模型。
 *
 * 注意：这里必须使用静态 import，不能用 `await import('xlsx')` 这类动态导入。
 * 该原型会被导出为单文件 iife（ENTRY_KEY 单入口构建），iife 不支持代码分割，
 * 只要出现动态导入就会构建失败（导出时报 Failed to fetch code: Internal Server Error）。
 */
import * as XLSX from 'xlsx';
import * as pdfjs from 'pdfjs-dist';
// worker 用 ?raw 内联进主包：单文件 iife 导出不带外部资源，
// 若用 ?url 会产出 dist/assets/pdf.worker-*.js，导出运行时取不到该文件（404）。
import pdfWorkerSource from 'pdfjs-dist/build/pdf.worker.min.js?raw';

export type SheetTable = {
  name: string;
  headers: string[];
  rows: string[][];
};

export type ParsedFile = {
  fileName: string;
  /** table: 结构化表格（Excel / CSV）；text: 纯文本（PDF） */
  kind: 'table' | 'text';
  tables: SheetTable[];
  text: string;
  lines: string[];
  /** 原始总行数（未截断） */
  totalRows: number;
  /** PDF 无文字层（扫描件），需要用户粘贴文本 */
  scan?: boolean;
};

const MAX_TABLE_ROWS = 200;
const MAX_PDF_PAGES = 40;

const EXT_LABEL: Record<string, string> = {
  xlsx: 'Excel',
  xls: 'Excel',
  csv: 'CSV',
  pdf: 'PDF'
};

export const getExt = (fileName: string) => (fileName.split('.').pop() || '').toLowerCase();

export const getFileTypeLabel = (fileName: string) => EXT_LABEL[getExt(fileName)] || '未知格式';

export const isSupportedFile = (fileName: string) => Boolean(EXT_LABEL[getExt(fileName)]);

const normalizeCell = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  }
  return String(value).replace(/\s+/g, ' ').trim();
};

/** 表格右侧常有大量空白格式列，按实际内容裁掉尾部空列 */
const trimColumns = (grid: string[][]): string[][] => {
  let width = 0;
  grid.forEach(row => {
    for (let index = row.length - 1; index >= 0; index -= 1) {
      if (row[index] !== '') {
        width = Math.max(width, index + 1);
        break;
      }
    }
  });
  return width ? grid.map(row => row.slice(0, width)) : grid;
};

/** 去掉括号补充说明，保留核心列名：单价（元）（含税…）→ 单价 */
const shortLabel = (label: string) => {
  const head = label.split(/[（(]/)[0].trim();
  return head || label.trim();
};

const NUMERIC = /^\d+(\.\d+)?$/;

/**
 * 两行表头：首行常是合并单元格的大类（单价/合价），次行是子列（不含税单价/税额/含税单价）。
 * 命中则合并成「单价-含税单价」这类唯一列名，避免空列名与子表头被当成数据行。
 */
const looksLikeSubHeader = (row: string[], headerRow: string[]): boolean => {
  const cells = row.filter(cell => cell !== '');
  if (cells.length < 2) return false;
  if (!cells.every(cell => cell.replace(/\s/g, '').length <= 12)) return false;
  if (cells.some(cell => NUMERIC.test(cell.replace(/[\s,，]/g, '')))) return false;
  const headerEmpty = headerRow.slice(0, row.length).some(cell => cell === '');
  const grouped = cells.some(cell => /单价|合价|金额|税额|数量|单位|规格|型号|品牌|税率|备注|产地/.test(cell));
  return headerEmpty || grouped;
};

const mergeHeaderRows = (parentRow: string[], childRow: string[], width: number): string[] => {
  let parent = '';
  return Array.from({ length: width }, (_, index) => {
    const top = (parentRow[index] || '').trim();
    if (top) parent = shortLabel(top);
    const child = (childRow[index] || '').trim();
    if (child && parent && child !== parent) return `${parent}-${shortLabel(child)}`;
    return shortLabel(child || top);
  });
};

const buildTable = (name: string, matrix: unknown[][]): SheetTable => {
  const grid = trimColumns(matrix.map(row => (Array.isArray(row) ? row.map(normalizeCell) : [])));
  const meaningful = grid.filter(row => row.some(cell => cell !== ''));
  if (!meaningful.length) return { name, headers: [], rows: [] };

  const start = findHeaderRow(meaningful);
  const headerRow = meaningful[start] || [];
  const width = meaningful.reduce((max, row) => Math.max(max, row.length), headerRow.length);

  const subRow = meaningful[start + 1];
  const hasSubHeader = Boolean(subRow) && looksLikeSubHeader(subRow, headerRow);
  const mergedHeaders = hasSubHeader
    ? mergeHeaderRows(headerRow, subRow as string[], width)
    : Array.from({ length: width }, (_, index) => shortLabel(headerRow[index] || `列${index + 1}`));

  const headers = mergedHeaders.map((header, index) => header || `列${index + 1}`);

  const rows = meaningful
    .slice(start + (hasSubHeader ? 2 : 1))
    .slice(0, MAX_TABLE_ROWS)
    .map(row => Array.from({ length: width }, (_, index) => row[index] ?? ''))
    .filter(row => row.some(cell => cell !== ''));

  return { name, headers, rows };
};

const parseSheetFile = async (file: File): Promise<ParsedFile> => {
  const buffer = await file.arrayBuffer();
  const ext = getExt(file.name);
  const workbook =
    ext === 'csv'
      ? XLSX.read(new TextDecoder('utf-8').decode(buffer), { type: 'string' })
      : XLSX.read(buffer, { type: 'array' });

  const tables = workbook.SheetNames.map(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false, defval: '' });
    return buildTable(sheetName, matrix);
  }).filter(table => table.headers.length > 0);

  if (!tables.length) throw new Error('未在文件中识别到有效表格，请检查文件内容');

  return {
    fileName: file.name,
    kind: 'table',
    tables,
    text: '',
    lines: [],
    totalRows: tables.reduce((sum, table) => sum + table.rows.length, 0)
  };
};

type PdfTextItem = { str?: string; transform?: number[] };

/** 中日韩字符：相邻两段都是中文时不插入空格，避免“某 住 宅”这类断字 */
const CJK_PATTERN = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uff00-\uffef]/;
const needSpace = (left: string, right: string) => {
  const a = left.slice(-1);
  const b = right.slice(0, 1);
  if (!a || !b) return '';
  return CJK_PATTERN.test(a) && CJK_PATTERN.test(b) ? '' : ' ';
};

const joinParts = (parts: Array<{ x: number; str: string }>) =>
  parts
    .sort((a, b) => a.x - b.x)
    .reduce((line, part) => (line ? `${line}${needSpace(line, part.str)}${part.str}` : part.str), '');

const groupPdfLines = (items: PdfTextItem[]): string[] => {
  const rows: Array<{ y: number; parts: Array<{ x: number; str: string }> }> = [];
  items.forEach(item => {
    const str = (item.str || '').trim();
    if (!str) return;
    const transform = item.transform || [];
    const y = Math.round(Number(transform[5] ?? 0));
    const x = Number(transform[4] ?? 0);
    const row = rows.find(candidate => Math.abs(candidate.y - y) <= 3);
    if (row) row.parts.push({ x, str });
    else rows.push({ y, parts: [{ x, str }] });
  });

  return rows
    .sort((a, b) => b.y - a.y)
    .map(row => joinParts(row.parts).replace(/\s+/g, ' ').trim())
    .filter(line => line.length > 1);
};

const HEADER_WORDS = ['序号', '名称', '规格', '型号', '单位', '数量', '单价', '金额', '合价', '备注'];
const NOISE_PATTERN = /^(第?\s*\d+\s*页|共\s*\d+\s*页|合计|小计|总计)/;

const flat = (line: string) => line.replace(/\s+/g, '');

/** 表头行：既要够宽（≥2 列），也要命中足够多的表头关键词，避免把「项目名称」这类标题行当表头 */
const findHeaderRow = (rows: string[][]): number => {
  let best = -1;
  let bestScore = 0;
  rows.slice(0, 15).forEach((row, index) => {
    const cells = row.filter(cell => cell !== '');
    if (cells.length < 2) return;
    const text = flat(row.join(''));
    const hits = HEADER_WORDS.filter(word => text.includes(word)).length;
    const score = hits * 10 + cells.length;
    if (hits >= 2 && score > bestScore) {
      best = index;
      bestScore = score;
    }
  });
  if (best >= 0) return best;
  const fallback = rows.findIndex(row => row.filter(cell => cell !== '').length >= 2);
  return fallback >= 0 ? fallback : 0;
};

/** 剔除表头行及其之前的标题、招标编号等版式文本，只留数据行 */
const stripPdfLayout = (lines: string[]): string[] => {
  const cleaned = lines
    .map(line =>
      line
        .normalize('NFKC')
        // 合并被 PDF 断开的相邻中文字符（“水 泥” → “水泥”）
        .replace(/([\u3400-\u4dbf\u4e00-\u9fff])\s+(?=[\u3400-\u4dbf\u4e00-\u9fff])/g, '$1')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter(line => line.length > 1 && !NOISE_PATTERN.test(flat(line)));

  const headerIndex = cleaned.findIndex(line => {
    const text = flat(line);
    return HEADER_WORDS.filter(word => text.includes(word)).length >= 3;
  });

  const body = headerIndex >= 0 ? cleaned.slice(headerIndex + 1) : cleaned;
  return body.length >= 2 ? body : cleaned;
};

/** PDF worker 只在首次解析 PDF 时创建一次，Blob URL 需缓存复用 */
let pdfWorkerUrl = '';
const ensurePdfWorker = () => {
  if (!pdfWorkerUrl) {
    pdfWorkerUrl = URL.createObjectURL(new Blob([pdfWorkerSource], { type: 'application/javascript' }));
  }
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
};

const parsePdfFile = async (file: File): Promise<ParsedFile> => {
  ensurePdfWorker();

  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  const pageCount = Math.min(doc.numPages, MAX_PDF_PAGES);
  const allLines: string[] = [];

  for (let pageNo = 1; pageNo <= pageCount; pageNo += 1) {
    const page = await doc.getPage(pageNo);
    const content = await page.getTextContent();
    allLines.push(...groupPdfLines(content.items as PdfTextItem[]));
  }

  const lines = stripPdfLayout(Array.from(new Set(allLines)).filter(line => !/^[-—–\s\d]{1,4}$/.test(line)));
  // 扫描件（图片型 PDF）没有文字层：不中断流程，交给「文本录入」兜底
  if (!lines.length) {
    return {
      fileName: file.name,
      kind: 'text',
      tables: [],
      text: '',
      lines: [],
      totalRows: 0,
      scan: true
    };
  }

  return {
    fileName: file.name,
    kind: 'text',
    tables: [],
    text: lines.join('\n'),
    lines,
    totalRows: lines.length
  };
};

export const parseFile = async (file: File): Promise<ParsedFile> => {
  const ext = getExt(file.name);
  if (!EXT_LABEL[ext]) throw new Error('仅支持 Excel（xlsx/xls）、CSV 与 PDF 文件');
  if (ext === 'pdf') return parsePdfFile(file);
  return parseSheetFile(file);
};
