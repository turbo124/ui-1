import { cloneDeep, get, has, set } from 'lodash';
import type { EInvoiceType } from '../../pages/settings/e-invoice/EInvoice';
import peppol from '../../resources/e-invoice/peppol/peppol.json';

export interface EInvoiceTemplateField {
  path: string[];
  value: string | number | boolean;
}

interface SchemaComponent {
  elements: Record<string, { base_type?: string; visibility?: number }>;
}

const components = peppol.components as unknown as Record<
  string,
  SchemaComponent
>;

function getEmptyValueField(path: string[]): EInvoiceTemplateField[] {
  let component: SchemaComponent | undefined = components[`${path[0]}Type`];

  for (const part of path.slice(1)) {
    if (/^\d+$/.test(part)) continue;
    const element: SchemaComponent['elements'][string] | undefined =
      component?.elements[part];
    component = element?.base_type ? components[element.base_type] : undefined;
  }

  const value = component?.elements.value;
  if (!value || !((value.visibility ?? 0) & 4)) return [];

  return [
    {
      path: [...path, 'value'],
      value:
        value.base_type === 'boolean'
          ? false
          : value.base_type === 'number' || value.base_type === 'decimal'
          ? 0
          : '',
    },
  ];
}

function writeDocumentValue(
  document: EInvoiceType,
  path: string[],
  value: string | number | boolean
) {
  // PHP can serialize an empty selected object as []. A named property on a
  // JavaScript array disappears during JSON serialization, so normalize only
  // empty containers whose next path segment is an object property.
  for (let index = 1; index < path.length; index++) {
    const parentPath = path.slice(0, index);
    const parent = get(document, parentPath);
    if (
      Array.isArray(parent) &&
      parent.length === 0 &&
      !/^\d+$/.test(path[index])
    ) {
      set(document, parentPath, {});
    }
  }
  return set(document, path, value);
}

// The existing settings document is the field template. Presence (including
// empty strings, null, zero and false) enables a field; no configuration API is needed.
export function getEInvoiceTemplateFields(
  template: unknown,
  path: string[] = []
): EInvoiceTemplateField[] {
  // The API converts blank inputs to null. Keep those selected properties;
  // null array entries instead represent removed repeatable groups.
  if (template === null) {
    if (path.length <= 1 || /^\d+$/.test(path[path.length - 1])) return [];
    const fields = getEmptyValueField(path);
    return fields.length ? fields : [{ path, value: '' }];
  }

  if (template !== null && typeof template === 'object') {
    if (!Object.keys(template).length) return getEmptyValueField(path);
    return Object.entries(template).flatMap(([key, value]) =>
      getEInvoiceTemplateFields(value, [...path, key])
    );
  }

  return ['string', 'number', 'boolean'].includes(typeof template)
    ? [{ path, value: template as string | number | boolean }]
    : [];
}

export function getInvoiceTemplateFields(
  template: EInvoiceType | undefined,
  lineIndex?: number
): EInvoiceTemplateField[] {
  if (lineIndex !== undefined) {
    // Every selected line property is a field for each actual invoice item.
    // Settings can contain multiple line groups (or a single object); don't
    // lose nested properties configured in a later group.
    const lines = get(template, 'Invoice.InvoiceLine');
    const lineTemplates = Array.isArray(lines)
      ? lines
      : lines && typeof lines === 'object'
      ? Object.keys(lines).every((key) => /^\d+$/.test(key))
        ? Object.values(lines)
        : [lines]
      : [];
    const fields = new Map<string, EInvoiceTemplateField>();

    lineTemplates.forEach((line) => {
      getEInvoiceTemplateFields(line, [
        'Invoice',
        'InvoiceLine',
        String(lineIndex),
      ]).forEach((field) => {
        const key = field.path.join('.');
        if (!fields.has(key)) fields.set(key, field);
      });
    });

    return Array.from(fields.values());
  }

  return getEInvoiceTemplateFields(template).filter(
    ({ path }) => !(path[0] === 'Invoice' && path[1] === 'InvoiceLine')
  );
}

export function hydrateEInvoice(
  template: EInvoiceType | undefined,
  document: EInvoiceType | undefined,
  lineCount: number
): EInvoiceType | undefined {
  const fields = [
    ...getInvoiceTemplateFields(template),
    ...Array.from({ length: lineCount }, (_, index) =>
      getInvoiceTemplateFields(template, index)
    ).flat(),
  ];

  if (!fields.length) return document;

  const result = cloneDeep(document ?? {});
  fields.forEach(({ path, value }) => {
    if (!has(result, path)) writeDocumentValue(result, path, value);
  });
  return result;
}

export function setEInvoiceValue(
  document: EInvoiceType | undefined,
  path: string[],
  value: string | number | boolean
): EInvoiceType {
  return writeDocumentValue(cloneDeep(document ?? {}), path, value);
}

// UBL lines live in the existing document array. Keep them aligned when the
// user reorders/deletes invoice items, without adding properties to those items.
export function reorderEInvoiceLines<T>(
  document: EInvoiceType | undefined,
  previousItems: T[],
  nextItems: T[]
): EInvoiceType | undefined {
  const lines = get(document, 'Invoice.InvoiceLine');
  if (!document || !Array.isArray(lines)) return document;

  return set(
    cloneDeep(document),
    'Invoice.InvoiceLine',
    nextItems.map((item) => {
      const index = previousItems.indexOf(item);
      return index >= 0 ? cloneDeep(lines[index] ?? {}) : {};
    })
  );
}
