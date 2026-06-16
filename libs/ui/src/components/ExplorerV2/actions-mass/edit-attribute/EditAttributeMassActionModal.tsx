import {type ReactNode} from 'react';
import {faCheck, faXmark} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {KitButton, KitModal, KitSpace, KitTypography} from 'aristid-ds';
import {type RecordFilterInput} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

const MODAL_WIDTH = '90vw';
const MODAL_MAX_WIDTH = '656px';

export const EditAttributeMassActionModal = ({
    isOpen,
    children,
    bulkCount,
    onOkButtonClick,
    onCancelButtonClick,
}: {
    isOpen: boolean;
    children: ReactNode;
    bulkCount: number;
    onOkButtonClick: () => void;
    onCancelButtonClick: () => void;
}) => {
    const {t} = useSharedTranslation();

    return (
        <KitModal
            isOpen={isOpen}
            appElement={document.getElementById('root')}
            style={{content: {width: MODAL_WIDTH, maxWidth: MODAL_MAX_WIDTH}}}
            width="100%"
            height="auto"
            icon={false}
            title={
                <KitSpace direction="vertical" size="none">
                    <KitTypography.Title level="h2">{t('explorer.massAction.editAttribute')}</KitTypography.Title>
                    <KitTypography.Text size="fontSize7">
                        {t('explorer.massAction.editAttribute_description', {count: bulkCount})}
                    </KitTypography.Text>
                </KitSpace>
            }
            footer={
                <>
                    <KitButton size="m" icon={<FontAwesomeIcon icon={faXmark} />} onClick={onCancelButtonClick}>
                        {t('global.cancel')}
                    </KitButton>
                    <KitButton
                        type="primary"
                        onClick={onOkButtonClick}
                        size="m"
                        icon={<FontAwesomeIcon icon={faCheck} />}
                    >
                        {t('global.edit')}
                    </KitButton>
                </>
            }
        >
            <KitSpace direction="vertical" size="s" style={{display: 'flex'}}>
                {children}
            </KitSpace>
        </KitModal>
    );
};
