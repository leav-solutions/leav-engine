// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Modal} from 'antd';
import {KitButton, KitSpace, KitTypography} from 'aristid-ds';
import {FunctionComponent, useRef} from 'react';
import styled from 'styled-components';
import {themeVars} from '_ui/antdTheme';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IValueVersion} from '_ui/types';
import {RecordIdentityFragment} from '_ui/_gqlTypes';
import {EditRecord} from '../EditRecord';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faXmark, faFloppyDisk, faRotateRight, faLayerGroup} from '@fortawesome/free-solid-svg-icons';

interface IEditRecordModalProps {
    open: boolean;
    record: RecordIdentityFragment['whoAmI'] | null;
    library: string;
    onClose: () => void;
    afterCreate?: (newRecord: RecordIdentityFragment['whoAmI']) => void;
    valuesVersion?: IValueVersion;
}

const modalWidth = 1200;
const StyledModal = styled(Modal)`
    && .ant-modal-content {
        padding: 0;
    }
`;

const Header = styled.div`
    height: 3.5rem;
    grid-area: title;
    align-self: center;
    font-size: 1rem;
    padding: 10px 50px 10px 10px;
    border-bottom: 1px solid ${themeVars.borderColor};
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    padding: 0.5rem 1rem;
`;

export const EditRecordModal: FunctionComponent<IEditRecordModalProps> = ({
    open,
    record,
    library,
    onClose,
    afterCreate,
    valuesVersion
}) => {
    const {t} = useSharedTranslation();
    const isCreationMode = !record;

    // Create refs for the buttons to pass them to the EditRecord component
    const submitButtonRef = useRef<HTMLButtonElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const refreshButtonRef = useRef<HTMLButtonElement>(null);
    const valuesVersionsButtonRef = useRef<HTMLButtonElement>(null);

    const closeButtonLabel = record ? t('global.close') : t('global.cancel');
    const footerButtons = [
        <KitButton
            aria-label={t('global.close')}
            key="close"
            ref={closeButtonRef}
            icon={<FontAwesomeIcon icon={faXmark} />}
        >
            {closeButtonLabel}
        </KitButton>
    ];

    if (isCreationMode) {
        footerButtons.push(
            <KitButton
                type="primary"
                aria-label={t('global.submit')}
                key="submit"
                ref={submitButtonRef}
                icon={<FontAwesomeIcon icon={faFloppyDisk} />}
            >
                {t('global.submit')}
            </KitButton>
        );
    }

    const footer = (
        <ModalFooter>
            <KitSpace>{footerButtons}</KitSpace>
        </ModalFooter>
    );

    return (
        <StyledModal
            open={open}
            onCancel={onClose}
            destroyOnClose
            cancelText={t('global.cancel')}
            width="90vw"
            centered
            style={{maxWidth: `${modalWidth}px`}}
            styles={{body: {height: 'calc(100vh - 12rem)', overflowY: 'auto'}, content: {padding: 0}}}
            footer={footer}
            closeIcon={<FontAwesomeIcon icon={faXmark} />}
        >
            <Header>
                <KitTypography.Title level="h2" style={{margin: 0}}>
                    {record?.label ?? t('record_edition.new_record')}
                </KitTypography.Title>
                <KitSpace size="xxs">
                    <KitButton
                        ref={valuesVersionsButtonRef}
                        type="text"
                        icon={<FontAwesomeIcon icon={faLayerGroup} />}
                    />
                    <KitButton ref={refreshButtonRef} type="text" icon={<FontAwesomeIcon icon={faRotateRight} />} />
                </KitSpace>
            </Header>
            <EditRecord
                record={record}
                library={library}
                onClose={onClose}
                afterCreate={afterCreate}
                valuesVersion={valuesVersion}
                buttonsRefs={{
                    submit: submitButtonRef,
                    close: closeButtonRef,
                    refresh: refreshButtonRef,
                    valuesVersions: valuesVersionsButtonRef
                }}
                showSidebar
                containerStyle={{height: 'calc(100% - 3.5rem)'}}
            />
        </StyledModal>
    );
};
