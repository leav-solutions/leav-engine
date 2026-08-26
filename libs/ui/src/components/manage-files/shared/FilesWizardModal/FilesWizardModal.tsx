import {type FunctionComponent, type ReactNode} from 'react';
import {KitModal, KitSteps} from 'aristid-ds';
import {type StepsProps} from 'antd';
import {type IWizardStep} from '../../_types';
import {wizardContent} from './FilesWizardModal.module.css';

export const FILES_WIZARD_MODAL_WIDTH = '656px';

interface IFilesWizardModalProps {
    title: string;
    testId: string;
    steps: IWizardStep[];
    currentStep: number;
    status?: StepsProps['status'];
    footer: ReactNode;
    onClose: () => void;
}

/**
 * Shell of both file-management wizards: modal frame, step header and footer slot. It owns no
 * branching of its own — each modal passes the footer it needs for the step it is on.
 */
export const FilesWizardModal: FunctionComponent<IFilesWizardModalProps> = ({
    title,
    testId,
    steps,
    currentStep,
    status,
    footer,
    onClose,
}) => (
    <KitModal
        appElement={document.getElementById('root')}
        isOpen
        close={onClose}
        showCloseIcon
        title={title}
        width={FILES_WIZARD_MODAL_WIDTH}
        height="auto"
        testId={testId}
        footer={footer}
    >
        <KitSteps
            status={status}
            current={currentStep}
            items={steps.map(({key, title: stepTitle}) => ({key, title: stepTitle}))}
        />
        <div className={wizardContent}>{steps[currentStep].content}</div>
    </KitModal>
);
