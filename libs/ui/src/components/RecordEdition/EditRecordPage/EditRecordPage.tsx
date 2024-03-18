// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitButton, KitDivider, KitSpace, KitTypography} from 'aristid-ds';
import {FunctionComponent, ReactNode, useRef} from 'react';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IValueVersion} from '_ui/types';
import {RecordIdentityFragment} from '_ui/_gqlTypes';
import {EditRecord} from '../EditRecord';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faXmark, faFloppyDisk, faRotateRight} from '@fortawesome/free-solid-svg-icons';
import {EDIT_OR_CREATE_RECORD_FORM_ID} from '../EditRecordContent/formConstants';

interface IEditRecordPageProps {
    record: RecordIdentityFragment['whoAmI'] | null;
    library: string;
    title?: ReactNode;
    afterCreate?: (newRecord: RecordIdentityFragment['whoAmI']) => void;
    valuesVersion?: IValueVersion;
    showRefreshButton?: boolean;
    onClose: () => void;
}

const Header = styled.div`
    grid-area: title;
    align-self: center;
    font-size: 1rem;
    padding: 16px 32px;
    height: 82px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

export const EditRecordPage: FunctionComponent<IEditRecordPageProps> = ({
    record,
    library,
    afterCreate,
    valuesVersion,
    title,
    showRefreshButton = true,
    onClose
}) => {
    const {t} = useSharedTranslation();

    const isInCreateMode = !record;

    // Create refs for the buttons to pass them to the EditRecord component
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const refreshButtonRef = useRef<HTMLButtonElement>(null);

    const closeButtonLabel = record ? t('global.close') : t('global.cancel');

    return (
        <>
            <Header>
                {title !== undefined ? (
                    title
                ) : (
                    <KitTypography.Title level="h2" style={{margin: 0}}>
                        {record?.label ?? t('record_edition.new_record')}
                    </KitTypography.Title>
                )}

                <KitSpace>
                    {showRefreshButton && (
                        <KitButton
                            ref={refreshButtonRef}
                            aria-label="refresh"
                            type="text"
                            icon={<FontAwesomeIcon icon={faRotateRight} />}
                        />
                    )}
                    <KitButton ref={closeButtonRef} icon={<FontAwesomeIcon icon={faXmark} />}>
                        {closeButtonLabel}
                    </KitButton>
                    {isInCreateMode && (
                        <KitButton
                            form={EDIT_OR_CREATE_RECORD_FORM_ID}
                            type="primary"
                            icon={<FontAwesomeIcon icon={faFloppyDisk} />}
                        >
                            {t('global.submit')}
                        </KitButton>
                    )}
                </KitSpace>
            </Header>
            <KitDivider noMargin color="lightGrey" />
            <EditRecord
                record={record}
                library={library}
                valuesVersion={valuesVersion}
                afterCreate={afterCreate}
                buttonsRefs={{close: closeButtonRef, refresh: refreshButtonRef}}
                onClose={onClose}
                containerStyle={{height: 'calc(100% - 82px)'}}
            />
        </>
    );
};
