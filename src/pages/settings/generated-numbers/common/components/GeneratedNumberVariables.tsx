/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { MdOutlineContentCopy } from 'react-icons/md';
import { useColorScheme } from '$app/common/colors';
import { toast } from '$app/common/helpers/toast/toast';
import { CustomFields, useCustomField } from '$app/components/CustomField';
import { Divider } from '$app/components/cards/Divider';
import { LinkToVariables } from './LinkToVariables';

export type GeneratedNumberEntity =
  | 'client'
  | 'credit'
  | 'expense'
  | 'invoice'
  | 'payment'
  | 'project'
  | 'purchase_order'
  | 'quote'
  | 'recurring_expense'
  | 'recurring_invoice'
  | 'task'
  | 'vendor';

type VariableGroup = 'general' | 'user' | 'client' | 'vendor' | 'expense';

interface GeneratedNumberVariable {
  token: string;
  labelKey?: string;
  labelPrefixKey?: string;
  customField?: CustomFields;
  fallbackLabelKey?: string;
}

interface GeneratedNumberVariableGroup {
  id: VariableGroup;
  variables: GeneratedNumberVariable[];
}

const customVariables = (
  entity: 'client' | 'user' | 'vendor'
): GeneratedNumberVariable[] =>
  [1, 2, 3, 4].map((index) => ({
    token: `{\$${entity}_custom${index}}`,
    customField: `${entity}${index}` as CustomFields,
    fallbackLabelKey: `custom${index}`,
  }));

const GENERAL_VARIABLES: GeneratedNumberVariable[] = [
  { token: '{$counter}', labelKey: 'counter' },
  { token: '{$year}', labelKey: 'year' },
  { token: '{$date:Y-m-d}', labelKey: 'date' },
];

const USER_VARIABLES: GeneratedNumberVariable[] = [
  { token: '{$user_id}', labelKey: 'id' },
  ...customVariables('user'),
];

const CLIENT_COUNTER_VARIABLES: GeneratedNumberVariable[] = [
  {
    token: '{$client_counter}',
    labelPrefixKey: 'client',
    labelKey: 'counter',
  },
  {
    token: '{$group_counter}',
    labelPrefixKey: 'group',
    labelKey: 'counter',
  },
];

const CLIENT_VARIABLES: GeneratedNumberVariable[] = [
  ...customVariables('client'),
  { token: '{$client_id_number}', labelKey: 'id_number' },
  { token: '{$client_number}', labelKey: 'client_number' },
];

const VENDOR_VARIABLES: GeneratedNumberVariable[] = [
  ...customVariables('vendor'),
  { token: '{$vendor_id_number}', labelKey: 'id_number' },
  {
    token: '{$vendor_number}',
    labelPrefixKey: 'vendor',
    labelKey: 'number',
  },
];

const CLIENT_AWARE_ENTITIES: GeneratedNumberEntity[] = [
  'client',
  'credit',
  'invoice',
  'payment',
  'project',
  'quote',
  'recurring_invoice',
];

export function getGeneratedNumberVariableGroups(
  entity: GeneratedNumberEntity
): GeneratedNumberVariableGroup[] {
  const groups: GeneratedNumberVariableGroup[] = [
    {
      id: 'general',
      variables: CLIENT_AWARE_ENTITIES.includes(entity)
        ? [...GENERAL_VARIABLES, ...CLIENT_COUNTER_VARIABLES]
        : GENERAL_VARIABLES,
    },
    { id: 'user', variables: USER_VARIABLES },
  ];

  if (CLIENT_AWARE_ENTITIES.includes(entity) || entity === 'expense') {
    groups.push({ id: 'client', variables: CLIENT_VARIABLES });
  }

  if (entity === 'vendor') {
    groups.push({
      id: 'vendor',
      variables: [{ token: '{$vendor_id_number}', labelKey: 'id_number' }],
    });
  }

  if (entity === 'expense') {
    groups.push({ id: 'vendor', variables: VENDOR_VARIABLES });
    groups.push({
      id: 'expense',
      variables: [{ token: '{$expense_id_number}', labelKey: 'id_number' }],
    });
  }

  return groups;
}

interface Props {
  entity: GeneratedNumberEntity;
}

export function GeneratedNumberVariables({ entity }: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const customField = useCustomField();

  const copyVariable = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success('copied_to_clipboard', { value: token });
  };

  return (
    <>
      <div className="px-4 sm:px-6 py-4">
        <Divider
          className="border-dashed"
          borderColor={colors.$20}
          withoutPadding
        />
      </div>

      <div className="px-4 sm:px-6 space-y-5">
        {getGeneratedNumberVariableGroups(entity).map((group) => (
          <section key={group.id} className="space-y-2">
            <h3 className="text-sm font-medium" style={{ color: colors.$3 }}>
              {t(group.id)}
            </h3>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {group.variables.map((variable) => {
                const customLabel = variable.customField
                  ? customField(variable.customField).label()
                  : '';
                const translatedLabel = t(
                  variable.labelKey || variable.fallbackLabelKey || ''
                );
                const label = variable.labelPrefixKey
                  ? `${t(variable.labelPrefixKey)} ${translatedLabel}`
                  : customLabel || translatedLabel;

                return (
                  <button
                    key={variable.token}
                    type="button"
                    className="flex items-center justify-between gap-3 rounded-md border px-3 py-3 text-left transition-colors"
                    style={{ borderColor: colors.$20, color: colors.$3 }}
                    onClick={() => copyVariable(variable.token)}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm">{label}</span>
                      <code className="block truncate text-xs">
                        {variable.token}
                      </code>
                    </span>

                    <MdOutlineContentCopy
                      aria-hidden="true"
                      className="shrink-0"
                      size={18}
                    />
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="px-4 sm:px-6 pt-4 pb-6">
        <Divider
          className="border-dashed"
          borderColor={colors.$20}
          withoutPadding
        />
      </div>

      <LinkToVariables />
    </>
  );
}
