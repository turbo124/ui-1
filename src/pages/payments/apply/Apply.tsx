/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { Button, InputField } from '$app/components/forms';
import { AxiosError } from 'axios';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { Invoice } from '$app/common/interfaces/invoice';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { usePaymentQuery } from '$app/common/queries/payments';
import { Alert } from '$app/components/Alert';
import {
  DebouncedCombobox,
  Record,
} from '$app/components/forms/DebouncedCombobox';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { X } from 'react-feather';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';
import { v4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';

export default function Apply() {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [t] = useTranslation();
  const { data: payment } = usePaymentQuery({ id });
  const [errors, setErrors] = useState<ValidationBag>();
  const navigate = useNavigate();
  const formatMoney = useFormatMoney();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      invoices: [],
    },
    onSubmit: (values) => {
      const toastId = toast.loading(t('processing'));
      setErrors(undefined);

      request('PUT', endpoint('/api/v1/payments/:id', { id }), values)
        .then((data) => {
          toast.success(t('updated_payment'), { id: toastId });
          navigate(route('/payments/:id/edit', { id: data.data.data.id }));
        })
        .catch((error: AxiosError<ValidationBag>) => {
          console.error(error);
          toast.error(t('error_title'), { id: toastId });
          if (error.response?.status === 422) {
            setErrors(error.response.data);
          }
        })
        .finally(() => {
          formik.setSubmitting(false);
          queryClient.invalidateQueries(route('/api/v1/payments/:id', { id }));
        });
    },
  });
  const handleInvoiceChange = (id: string, amount: number, number: string) => {
    formik.setFieldValue('invoices', [
      ...formik.values.invoices,
      { _id: v4(), amount, credit_id: '', invoice_id: id, number: number },
    ]);
  };

  const handleRemovingInvoice = (id: string) => {
    formik.setFieldValue(
      'invoices',
      formik.values.invoices.filter(
        (record: { _id: string }) => record._id !== id
      )
    );
  };

  useEffect(() => {
    let total = 0;
    formik.values.invoices.map((invoice: any) => {
      total = total + Number(invoice.amount);
    });
  }, [formik.values.invoices]);

  return (
    <Card
      title={t('apply_payment')}
      disableSubmitButton={formik.isSubmitting}
      onFormSubmit={formik.handleSubmit}
      withSaveButton
    >
      <Element leftSide={t('number')}>
        <InputField disabled value={payment?.number} />
      </Element>

      {payment && payment.client && (
        <>
          <Element leftSide={t('amount')}>
            <InputField
              disabled
              value={formatMoney(
                payment?.amount - payment?.refunded,
                payment?.client.country_id,
                payment?.client.settings.currency_id
              )}
            />
          </Element>
          <Element leftSide={t('applied')}>
            <InputField
              disabled
              value={formatMoney(
                payment?.applied,
                payment?.client.country_id,
                payment?.client.settings.currency_id
              )}
            />
          </Element>
          <Element leftSide={t('unapplied')}>
            <InputField
              disabled
              value={formatMoney(
                payment?.amount - payment?.refunded - payment?.applied,
                payment?.client.country_id,
                payment?.client.settings.currency_id
              )}
            />
          </Element>
        </>
      )}

      <Element leftSide={t('invoices')}>
        <DebouncedCombobox
          endpoint={`/api/v1/invoices?status_id=1,2,3&is_deleted=false&client_id=${payment?.client_id}`}
          label="number"
          formatLabel={(resource: Invoice) =>
            `${resource.number} (${formatMoney(
              resource.balance,
              payment?.client?.country_id ?? '1',
              payment?.client?.settings.currency_id
            )})`
          }
          onChange={(value: Record<Invoice>) =>
            handleInvoiceChange(
              value.resource?.id as string,
              value.resource?.amount as number,
              value.resource?.number as string
            )
          }
        />
        {errors?.errors.invoices && (
          <div className="py-2">
            <Alert type="danger">{errors.errors.invoices}</Alert>
          </div>
        )}
      </Element>
      {formik.values.invoices.map(
        (record: { _id: string; amount: number; number: string }, index) => (
          <Element key={index} leftSide={t('applied')}>
            <div className="flex items-center space-x-2">
              <InputField
                disabled
                label={t('invoice_number')}
                value={record.number}
              />
              <InputField
                label={t('amount_received')}
                id={`invoices[${index}].amount`}
                onChange={formik.handleChange}
                value={record.amount}
              />

              <Button
                behavior="button"
                type="minimal"
                onClick={() => handleRemovingInvoice(record._id)}
              >
                <X />
              </Button>
            </div>

            {errors?.errors[`invoices.${[index]}.invoice_id`] && (
              <div className="py-2">
                <Alert type="danger">
                  {errors.errors[`invoices.${[index]}.invoice_id`]}
                </Alert>
              </div>
            )}
          </Element>
        )
      )}
    </Card>
  );
}
