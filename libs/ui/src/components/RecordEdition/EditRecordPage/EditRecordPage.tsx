// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitButton, KitSpace, KitTypography} from 'aristid-ds';
import {FunctionComponent, useRef} from 'react';
import styled from 'styled-components';
import {themeVars} from '_ui/antdTheme';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IValueVersion} from '_ui/types';
import {RecordIdentityFragment} from '_ui/_gqlTypes';
import {EditRecord} from '../EditRecord';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faXmark, faFloppyDisk, faRotateRight} from '@fortawesome/free-solid-svg-icons';

interface IEditRecordPageProps {
    record: RecordIdentityFragment['whoAmI'] | null;
    library: string;
    title?: string;
    afterCreate?: (newRecord: RecordIdentityFragment['whoAmI']) => void;
    valuesVersion?: IValueVersion;
    onClose: () => void;
}

const Header = styled.div`
    grid-area: title;
    align-self: center;
    font-size: 1rem;
    padding: 10px 20px;
    border-bottom: 1px solid ${themeVars.borderColor};
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
                <KitTypography.Title level="h2" style={{margin: 0}}>
                    {title ?? record?.label ?? t('record_edition.new_record')}
                </KitTypography.Title>
                <KitSpace>
                    <KitButton ref={refreshButtonRef} type="text" icon={<FontAwesomeIcon icon={faRotateRight} />} />
                    <KitButton ref={closeButtonRef} icon={<FontAwesomeIcon icon={faXmark} />}>
                        {closeButtonLabel}
                    </KitButton>
                    {isInCreateMode && (
                        <KitButton
                            form="createAndEditRecordForm"
                            type="primary"
                            icon={<FontAwesomeIcon icon={faFloppyDisk} />}
                        >
                            {t('global.submit')}
                        </KitButton>
                    )}
                </KitSpace>
            </Header>
            <EditRecord
                record={record}
                library={library}
                valuesVersion={valuesVersion}
                afterCreate={afterCreate}
                buttonsRefs={{close: closeButtonRef, refresh: refreshButtonRef}}
                onClose={onClose}
            />
        </>
    );
};
