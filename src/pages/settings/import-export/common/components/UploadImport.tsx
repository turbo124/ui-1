/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Element } from '$app/components/cards';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';
import { useColorScheme } from '$app/common/colors';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Alert } from '$app/components/Alert';
import { ImportedFile } from './Import';

interface Props {
  group: string;
  errors: ValidationBag | undefined;
  files: ImportedFile[];
  setFiles: Dispatch<SetStateAction<ImportedFile[]>>;
}

export function UploadImport(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const { errors, group, files, setFiles } = props;

  const [currentFiles, setCurrentFiles] = useState<File[]>([]);

  const handleRemoveFile = (file: File) => {
    setFiles((currentList) =>
      currentList.filter(({ file: currentFile }) => currentFile !== file)
    );
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'text/*': ['.csv'] },
    onDrop: (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        setFiles((prevState) => [...prevState, { group, file }]);
      });
    },
  });

  useEffect(() => {
    setCurrentFiles(
      files
        .filter(({ group: currentGroup }) => currentGroup === group)
        .map(({ file }) => file)
    );
  }, [files]);

  return (
    <Element leftSide={t(group)}>
      {!currentFiles.length ? (
        <div
          {...getRootProps()}
          className="flex flex-col md:flex-row md:items-center"
        >
          <div className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <input {...getInputProps()} />
            <Image
              className="mx-auto h-12 w-12"
              style={{ color: colors.$3, colorScheme: colors.$0 }}
            />
            <span
              className="mt-2 block text-sm font-medium"
              style={{ color: colors.$3, colorScheme: colors.$0 }}
            >
              {isDragActive
                ? t('drop_file_here')
                : t('dropzone_default_message')}
            </span>
          </div>

          {errors &&
            Object.keys(errors.errors).map((key, index) => (
              <Alert key={index} type="danger">
                {errors.errors[key]}
              </Alert>
            ))}
        </div>
      ) : (
        <ul className="grid xs:grid-rows-6 lg:grid-cols-2">
          {currentFiles.map((file, index) => (
            <li
              key={index}
              className="flex items-center hover:bg-gray-50 cursor-pointer p-2"
            >
              {file.name} - {(file.size / 1024).toPrecision(2)} KB{' '}
              {
                <MdClose
                  fontSize={15}
                  className="cursor-pointer ml-3"
                  onClick={() => handleRemoveFile(file)}
                />
              }
            </li>
          ))}
        </ul>
      )}
    </Element>
  );
}
