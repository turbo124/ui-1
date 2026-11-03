/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { useFormik } from 'formik';
import { useSetAtom } from 'jotai';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { activeSettingsAtom } from '$app/common/atoms/settings';
import { useColorScheme } from '$app/common/colors';
import {
  getPaymentMeansFields,
  PAYMENT_MEANS,
  type PaymentMeansField,
  type PaymentMeansValidationContext,
} from '$app/common/constants/payment-means';
import { endpoint } from '$app/common/helpers';
import {
  changePaymentMeansCode,
  paymentMeansPayload,
  readPaymentMeans,
} from '$app/common/helpers/payment-means';
import {
  type PaymentMeansValidationError,
  paymentMeansFieldLimit,
  requiredPaymentMeansFields,
  validatePaymentMeans,
} from '$app/common/helpers/payment-means-validation';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useRefreshCompanyUsers } from '$app/common/hooks/useRefreshCompanyUsers';
import type { Client } from '$app/common/interfaces/client';
import type { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import type { ValidationBag } from '$app/common/interfaces/validation-bag';
import { updateChanges } from '$app/common/stores/slices/company-users';
import type { EInvoiceType } from '$app/pages/settings';
import { Card, Element } from '../cards';
import { ErrorMessage } from '../ErrorMessage';
import { InputField, SelectField } from '../forms';

interface Props {
  entity: 'company' | 'invoice' | 'client';
  entityId?: string;
  currentEInvoice: EInvoiceType;
  onBeforeSave?: () => Promise<unknown>;
  validationContext?: PaymentMeansValidationContext;
}

export interface PaymentMeansFormComponent {
  saveEInvoice: () => Promise<void>;
}

const FIELD_LABELS: Record<PaymentMeansField, [string, string]> = {
  information: ['payment_means_description', 'Payment instructions'],
  payment_reference: ['payment_reference', 'Payment Reference'],
  iban: ['payment_account_identifier', 'Account Number / IBAN'],
  account_holder: ['account_holder', 'Account Name'],
  bic_swift: ['payment_bank_identifier', 'BIC / Bank Code'],
  payer_bank_account: ['payer_bank_account', 'Payer Bank Account Number'],
  mandate_reference: ['payment_mandate_reference', 'Mandate Reference'],
  creditor_identifier: ['payment_creditor_identifier', 'Creditor Identifier'],
  card_type: ['card_type', 'Card Type'],
  card_number: ['payment_card_last_four', 'Last Four Card Digits'],
  card_holder: ['card_holder', 'Card Holder'],
};

export const PaymentMeans = forwardRef<PaymentMeansFormComponent, Props>(
  (props, ref) => {
    const colors = useColorScheme();
    const [t] = useTranslation();
    const dispatch = useDispatch();
    const setActiveSettings = useSetAtom(activeSettingsAtom);
    const refreshCompanyUsers = useRefreshCompanyUsers();
    const isClientLevel = props.entity === 'client';
    const [errors, setErrors] = useState<ValidationBag | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const context = {
      ...props.validationContext,
      allowInheritance: isClientLevel,
    };
    const validationMessage = (error: PaymentMeansValidationError) =>
      t(error.key, { defaultValue: error.message, max: error.max });
    const unsupportedPaymentMeans = (code: string) =>
      t('unsupported_e_invoice_payment_means', {
        code,
        defaultValue:
          'Payment means {{code}} is not supported. Choose another payment means.',
      });

    const activeRequest = useRef<AbortController>();

    useEffect(() => {
      setErrors(null);
      setHasSubmitted(false);
      return () => activeRequest.current?.abort();
    }, [props.entity, props.entityId]);

    const form = useFormik({
      enableReinitialize: true,
      initialValues: {
        entity: props.entity,
        entity_id: props.entityId,
        payment_means: [
          readPaymentMeans(props.currentEInvoice, isClientLevel ? '' : '1'),
        ],
      },
      onSubmit: async (values) => {
        if (activeRequest.current && !activeRequest.current.signal.aborted)
          return;
        if (values.entity !== 'company' && !values.entity_id) {
          toast.error('record_not_found');
          return;
        }
        const localErrors = validatePaymentMeans(
          values.payment_means[0],
          context
        );
        setHasSubmitted(true);
        setErrors(null);
        const firstError = Object.values(localErrors)[0];
        if (firstError) {
          toast.error(validationMessage(firstError));
          return;
        }

        const controller = new AbortController();
        activeRequest.current = controller;
        toast.processing();
        setErrors(null);

        try {
          // Capture form values before saving other settings refreshes the source.
          await props.onBeforeSave?.();
          if (controller.signal.aborted) return;

          await request(
            'POST',
            endpoint('/api/v1/einvoice/configurations'),
            {
              entity: values.entity,
              ...(values.entity_id ? { entity_id: values.entity_id } : {}),
              payment_means: values.payment_means[0].code
                ? [paymentMeansPayload(values.payment_means[0])]
                : [],
            },
            { signal: controller.signal }
          );

          if (controller.signal.aborted) return;

          if (isClientLevel) {
            const response: GenericSingleResourceResponse<Client> =
              await request(
                'GET',
                endpoint('/api/v1/clients/:id', { id: values.entity_id }),
                undefined,
                { signal: controller.signal }
              );

            if (controller.signal.aborted) return;

            const client = response.data.data;
            dispatch(
              updateChanges({
                object: 'company',
                property: 'e_invoice',
                value: client.e_invoice || {},
              })
            );
            setActiveSettings((current) =>
              current?.id === client.id
                ? { ...current, e_invoice: client.e_invoice }
                : current
            );
            $refetch(['clients']);
          } else {
            await refreshCompanyUsers();
          }

          if (!controller.signal.aborted)
            toast.success('saved_einvoice_details');
        } catch (error) {
          if (controller.signal.aborted) return;

          // Other settings may have refreshed the source while this save failed.
          // Keep the submitted payment fields available for correction/retry.
          form.setValues(values);
          const response = (error as AxiosError<ValidationBag>).response;

          if (response?.status === 422) {
            toast.dismiss();
            setErrors(response.data);
          } else {
            toast.error();
          }
        } finally {
          if (activeRequest.current === controller)
            activeRequest.current = undefined;
        }
      },
    });

    useImperativeHandle(ref, () => ({ saveEInvoice: form.submitForm }));

    const payment = form.values.payment_means[0];
    const fields = getPaymentMeansFields(payment.code);
    const requiredFields = requiredPaymentMeansFields(payment, context);
    const localErrors = hasSubmitted
      ? validatePaymentMeans(payment, context)
      : {};
    const unsupportedMessage =
      payment.code && !PAYMENT_MEANS.some(({ code }) => code === payment.code)
        ? unsupportedPaymentMeans(payment.code)
        : undefined;
    const envelopeErrors =
      errors?.errors?.entity ||
      errors?.errors?.entity_id ||
      errors?.errors?.payment_means ||
      (errors?.message && !Object.keys(errors.errors || {}).length
        ? [errors.message]
        : undefined);

    return (
      <Card
        title={t('payment_means')}
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
      >
        {envelopeErrors && (
          <Element>
            <ErrorMessage>{envelopeErrors}</ErrorMessage>
          </Element>
        )}
        <Element leftSide={t('payment_means')}>
          <SelectField
            value={payment.code}
            onValueChange={(code) => {
              setErrors(null);
              setHasSubmitted(false);
              form.setFieldValue(
                'payment_means.0',
                changePaymentMeansCode(payment, code)
              );
            }}
            errorMessage={
              unsupportedMessage || errors?.errors?.['payment_means.0.code']
            }
            disabled={form.isSubmitting}
            withBlank={isClientLevel}
            dismissable={isClientLevel}
            placeholder={
              isClientLevel
                ? t('inherit_company_payment_means', {
                    defaultValue: 'Use company payment means',
                  })
                : undefined
            }
            customSelector
          >
            {PAYMENT_MEANS.map(({ code, label }) => (
              <option key={code} value={code}>
                {code} — {label}
              </option>
            ))}
          </SelectField>
        </Element>

        {fields.map((field) => {
          const [key, defaultValue] = FIELD_LABELS[field];
          const label =
            (field === 'iban' && payment.code === '58') ||
            (field === 'payer_bank_account' && payment.code === '59')
              ? t('iban')
              : t(key, { defaultValue });

          return (
            <Element
              key={field}
              leftSide={label}
              required={requiredFields.includes(field)}
              leftSideHelp={
                field === 'card_number' ? t('card_number_help') : undefined
              }
            >
              <InputField
                id={`payment_means.0.${field}`}
                value={payment[field]}
                onValueChange={(value) => {
                  setErrors(null);
                  form.setFieldValue(`payment_means.0.${field}`, value);
                }}
                required={requiredFields.includes(field)}
                maxLength={
                  [
                    'information',
                    'payment_reference',
                    'account_holder',
                    'mandate_reference',
                    'card_type',
                    'card_holder',
                  ].includes(field)
                    ? paymentMeansFieldLimit(field, payment.code)
                    : undefined
                }
                autoComplete="off"
                changeOverride
                debounceTimeout={0}
                element={field === 'information' ? 'textarea' : 'input'}
                disabled={form.isSubmitting}
                errorMessage={
                  localErrors[field]
                    ? validationMessage(localErrors[field]!)
                    : errors?.errors?.[`payment_means.0.${field}`]
                }
              />
            </Element>
          );
        })}
      </Card>
    );
  }
);
