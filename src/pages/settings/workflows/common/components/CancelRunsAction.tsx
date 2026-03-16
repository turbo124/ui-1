import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { MdCancel } from 'react-icons/md';
import { Modal } from '$app/components/Modal';
import { Button } from '$app/components/forms';
import { WorkflowDefinition } from '../../types/workflow';
import { useWorkflowActions } from '../../hooks/useWorkflows';

interface Props {
  workflow: WorkflowDefinition;
}

export function CancelRunsAction({ workflow }: Props) {
  const [t] = useTranslation();
  const actions = useWorkflowActions();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <DropdownElement
        onClick={() => setIsModalOpen(true)}
        icon={<Icon element={MdCancel} />}
      >
        {t('cancel_runs')}
      </DropdownElement>

      <Modal
        title={t('cancel_runs')}
        visible={isModalOpen}
        onClose={setIsModalOpen}
      >
        <div className="flex flex-col space-y-6">
          <span className="text-left font-medium">
            {t('cancel_runs_confirmation')}
          </span>

          <Button
            onClick={() => {
              setIsModalOpen(false);
              actions.cancelRuns(workflow.id);
            }}
          >
            {t('confirm')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
