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
import { Button, SelectField } from '$app/components/forms';
import { arrayMoveImmutable } from 'array-move';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { injectInChanges } from '$app/common/stores/slices/company-users';
import { cloneDeep, set } from 'lodash';
import { ChangeEvent, useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import { Menu, X } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

interface Props {
  defaultVariables: { value: string; label: string }[];
  for: string;
}

export function SortableVariableList(props: Props) {
  const [t] = useTranslation();
  const company = useCompanyChanges();
  const dispatch = useDispatch();

  const defaultVariables = props.defaultVariables;

  const [defaultVariablesFiltered, setDefaultVariablesFiltered] =
    useState(defaultVariables);

  useEffect(() => {
    const variables = company?.settings?.pdf_variables?.[props.for] ?? [];

    setDefaultVariablesFiltered(
      defaultVariables.filter((label) => !variables.includes(label.value))
    );
  }, [company]);

  const resolveTranslation = (key: string) => {
    return defaultVariables.find((field) => field.value === key);
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const selectedOption = event.target.options[event.target.selectedIndex];

    if (selectedOption.value === '') {
      return;
    }

    const companyClone = cloneDeep(company);

    if (!companyClone.settings.pdf_variables) {
      set(companyClone, 'settings.pdf_variables', {});

      if (!companyClone.settings?.pdf_variables?.[props.for]) {
        set(companyClone, `settings.pdf_variables.${props.for}`, []);
      }
    }

    companyClone.settings.pdf_variables?.[props.for]?.push(
      selectedOption.value
    );

    dispatch(injectInChanges({ object: 'company', data: companyClone }));

    event.target.value = '';
  };

  const remove = (property: string) => {
    const companyClone = cloneDeep(company);

    const filtered = companyClone.settings.pdf_variables?.[props.for].filter(
      (variable: string) => variable !== property
    );

    set(companyClone, `settings.pdf_variables.${props.for}`, filtered);

    dispatch(injectInChanges({ object: 'company', data: companyClone }));
  };

  const onDragEnd = (result: DropResult) => {
    const companyClone = cloneDeep(company);

    const filtered = arrayMoveImmutable(
      companyClone.settings.pdf_variables?.[props.for],
      result.source.index,
      result.destination?.index as unknown as number
    );

    set(companyClone, `settings.pdf_variables.${props.for}`, filtered);

    dispatch(injectInChanges({ object: 'company', data: companyClone }));
  };

  return (
    <>
      <Element leftSide={t('fields')}>
        <SelectField onChange={handleSelectChange}>
          <option></option>

          {defaultVariablesFiltered.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      </Element>

      <Element leftSide={t('variables')}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={props.for}>
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {company?.settings?.pdf_variables?.[props.for] && company?.settings?.pdf_variables?.[props.for]?.map(
                  (label: string, index: number) => (
                    <Draggable key={label} draggableId={label} index={index}>
                      {(provided) => (
                        <div
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          className="flex items-center justify-between space-y-6"
                          key={label}
                        >
                          <div className="flex items-center space-x-2">
                            <Button
                              type="minimal"
                              onClick={() => remove(label)}
                              behavior="button"
                            >
                              <X />
                            </Button>

                            <span>{resolveTranslation(label)?.label}</span>
                          </div>

                          <Menu size={16} />
                        </div>
                      )}
                    </Draggable>
                  )
                )}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Element>
    </>
  );
}
