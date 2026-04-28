import * as XLSX from 'xlsx';
import type { H2OAlgorithm } from './algorithmCatalog';

export interface WorkbookExportOptions {
  generatedAt?: Date;
}

function normalizeSheetName(name: string) {
  return name.replace(/[\\/?*[\]:]/g, ' ').slice(0, 31) || 'Algorithm';
}

export function buildAlgorithmWorkbook(algorithm: H2OAlgorithm, options: WorkbookExportOptions = {}) {
  const generatedAt = options.generatedAt ?? new Date();
  const workbook = XLSX.utils.book_new();

  const summaryRows = [
    ['Algorithm', algorithm.label],
    ['ID', algorithm.id],
    ['Category', algorithm.category],
    ['Description', algorithm.description],
    ['Generated at', generatedAt.toISOString()],
  ];

  const paramsRows = algorithm.params.map((param) => ({
    key: param.key,
    label: param.label,
    type: param.type,
    default: param.default,
    min: param.min ?? '',
    max: param.max ?? '',
    options: param.options?.join(', ') ?? '',
    description: param.description,
  }));

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summaryRows), normalizeSheetName(`${algorithm.label} summary`));
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(paramsRows), normalizeSheetName(`${algorithm.label} params`));

  return workbook;
}

