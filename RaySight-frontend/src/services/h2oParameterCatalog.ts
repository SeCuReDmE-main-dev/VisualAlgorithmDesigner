import manifestDocument from '../../../data/algorithms/manifest.json';

export interface H2OParameterManifestEntry {
  name: string;
  file: string;
  algorithms: string[];
  type: string;
}

export interface H2OParameterEntry extends H2OParameterManifestEntry {
  description: string;
  defaultValue: unknown;
  valueType: 'boolean' | 'number' | 'text';
  sourceUrl: string;
}

interface H2OManifest {
  version: string;
  source: string;
  total_parameters: number;
  parameters: H2OParameterManifestEntry[];
}

const manifest = manifestDocument as H2OManifest;

function readableName(name: string) {
  return name.replaceAll('_', ' ');
}

function fallbackEntry(entry: H2OParameterManifestEntry): H2OParameterEntry {
  return {
    ...entry,
    description: `Configure the H2O ${readableName(entry.name)} parameter for compatible models.`,
    defaultValue: null,
    valueType: 'text',
    sourceUrl: `${manifest.source}${entry.name}.html`,
  };
}

export const H2O_PARAMETER_TOTAL = manifest.total_parameters;
export const H2O_PARAMETER_SOURCE = manifest.source;
export const H2O_PARAMETER_FALLBACK = manifest.parameters.map(fallbackEntry);

export async function loadH2OParameterCatalog(): Promise<H2OParameterEntry[]> {
  try {
    const response = await fetch('/api/catalog/h2o-parameters', { credentials: 'include' });
    if (!response.ok) throw new Error(`Catalog request failed (${response.status})`);
    const body = await response.json() as { data?: { parameters?: H2OParameterEntry[] } };
    return Array.isArray(body.data?.parameters) && body.data.parameters.length > 0
      ? body.data.parameters
      : H2O_PARAMETER_FALLBACK;
  } catch {
    return H2O_PARAMETER_FALLBACK;
  }
}

export function searchH2OParameters(entries: H2OParameterEntry[], query: string) {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return entries;
  return entries.filter((entry) => [entry.name, entry.description, ...entry.algorithms]
    .join(' ')
    .toLocaleLowerCase()
    .includes(needle));
}
