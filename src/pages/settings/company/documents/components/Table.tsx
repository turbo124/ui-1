/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  Pagination,
  Table as TableElement,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@invoiceninja/tables';
import axios from 'axios';
import { endpoint } from 'common/helpers';
import { Document } from 'common/interfaces/document.interface';
import { defaultHeaders } from 'common/queries/common/headers';
import { useDocumentsQuery } from 'common/queries/documents';
import { bulk } from 'common/queries/payment-terms';
import { updateLatestQueryUrl } from 'common/stores/slices/company-documents';
import { Dropdown } from 'components/dropdown/Dropdown';
import { DropdownElement } from 'components/dropdown/DropdownElement';
import { FileIcon } from 'components/FileIcon';
import { Spinner } from 'components/Spinner';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useSWRConfig } from 'swr';

export function Table() {
  const [t] = useTranslation();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<string>('10');

  const { data, isLoading } = useDocumentsQuery({ perPage, currentPage });
  const { mutate } = useSWRConfig();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      updateLatestQueryUrl({ url: data?.request.responseURL as string })
    );
  }, [data]);

  const _delete = (id: string) => {
    toast.loading(t('processing'));

    axios
      .delete(endpoint('/api/v1/documents/:id', { id }), {
        headers: defaultHeaders,
      })
      .then(() => {
        toast.dismiss();
        toast.success(t('deleted_payment_term'));

        mutate(data?.request.responseURL);
      })
      .catch((error) => {
        console.error(error);

        toast.dismiss();
        toast.error(t('error_title'));
      });
  };

  return (
    <>
      <TableElement>
        <Thead>
          <Th>{t('name')}</Th>
          <Th>{t('date')}</Th>
          <Th>{t('type')}</Th>
          <Th>{t('size')}</Th>
          <Th></Th>
        </Thead>
        <Tbody>
          {isLoading && (
            <Tr>
              <Td colSpan={5}>
                <Spinner />
              </Td>
            </Tr>
          )}

          {data &&
            data.data.data.map((document: Document) => (
              <Tr key={document.id}>
                <Td className="truncate">
                  <div className="flex items-center space-x-2">
                    <FileIcon type={document.type} />
                    <span>{document.name}</span>
                  </div>
                </Td>
                <Td>{document.updated_at}</Td>
                <Td>{document.type}</Td>
                <Td>{document.size}</Td>
                <Td>
                  <Dropdown>
                    <DropdownElement>
                      <a
                        target="_blank"
                        className="block w-full"
                        href={endpoint('/documents/:hash?inline=true', {
                          hash: document.hash,
                        })}
                      >
                        {t('view')}
                      </a>
                    </DropdownElement>

                    <DropdownElement>
                      <a
                        className="block w-full"
                        href={endpoint('/documents/:hash', {
                          hash: document.hash,
                        })}
                      >
                        {t('download')}
                      </a>
                    </DropdownElement>

                    <DropdownElement onClick={() => _delete(document.id)}>
                      {t('delete')}
                    </DropdownElement>
                  </Dropdown>
                </Td>
              </Tr>
            ))}
        </Tbody>
      </TableElement>

      {data && (
        <Pagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onRowsChange={setPerPage}
          totalPages={data.data.meta.pagination.total_pages}
        />
      )}
    </>
  );
}
