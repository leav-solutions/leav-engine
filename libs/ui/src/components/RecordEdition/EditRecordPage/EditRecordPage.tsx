// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitButton, KitDivider, KitSpace, KitTypography} from 'aristid-ds';
import {FunctionComponent, ReactNode, useRef, useState} from 'react';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IValueVersion} from '_ui/types';
import {RecordIdentityFragment} from '_ui/_gqlTypes';
import {EditRecord} from '../EditRecord';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faXmark, faRotateRight} from '@fortawesome/free-solid-svg-icons';
import {possibleSubmitButtons, submitButtonsProp} from '../_types';
import {useGetSubmitButtons} from '../hooks/useGetSubmitButtons';

interface IEditRecordPageProps {
    record: RecordIdentityFragment['whoAmI'] | null;
    library: string;
    title?: ReactNode;
    onCreate?: (newRecord: RecordIdentityFragment['whoAmI']) => void; // Called after submitting via the "create" button
    onCreateAndEdit?: (newRecord: RecordIdentityFragment['whoAmI']) => void; // Called after submitting via the "create and edit" button
    submitButtons?: submitButtonsProp;
    valuesVersion?: IValueVersion;
    showRefreshButton?: boolean;
    withInfoButton?: boolean;
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
    onCreate,
    onCreateAndEdit,
    valuesVersion,
    title,
    showRefreshButton = true,
    submitButtons = 'create',
    withInfoButton,
    onClose
}) => {
    const {t} = useSharedTranslation();
    const [currentRecord, setCurrentRecord] = useState<RecordIdentityFragment['whoAmI'] | null>(record);
    const [clickedSubmitButton, setClickedSubmitButton] = useState<possibleSubmitButtons | null>(null);
    const isInCreateMode = !currentRecord;

    const _handleClickSubmit = (button: possibleSubmitButtons) => {
        setClickedSubmitButton(button);
    };

    const displayedSubmitButtons = useGetSubmitButtons(submitButtons, isInCreateMode, _handleClickSubmit);

    // Create refs for the buttons to pass them to the EditRecord component
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const refreshButtonRef = useRef<HTMLButtonElement>(null);

    const closeButtonLabel = isInCreateMode ? t('global.cancel') : t('global.close');

    const _handleCreate = (newRecord: RecordIdentityFragment['whoAmI']) => {
        setCurrentRecord(newRecord);

        if (onCreateAndEdit && clickedSubmitButton === 'createAndEdit') {
            onCreateAndEdit(newRecord);
            return;
        }

        if (onCreate && clickedSubmitButton === 'create') {
            onCreate(newRecord);
            return;
        }
    };

    return (
        <>
            <Header>
                {title !== undefined ? (
                    title
                ) : (
                    <KitTypography.Title level="h2" style={{margin: 0}}>
                        {currentRecord?.label ?? t('record_edition.new_record')}
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
                    <KitSpace>{displayedSubmitButtons}</KitSpace>
                </KitSpace>
            </Header>
            <KitDivider noMargin color="lightGrey" />
            <EditRecord
                record={currentRecord}
                library={library}
                valuesVersion={valuesVersion}
                onCreate={_handleCreate}
                buttonsRefs={{close: closeButtonRef, refresh: refreshButtonRef}}
                onClose={onClose}
                containerStyle={{height: 'calc(100% - 82px)'}}
                withInfoButton={withInfoButton}
            />
        </>
    );
};
