// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Icon, List} from 'semantic-ui-react';
import {RecordIdentity_whoAmI} from '../../../../../../../_gqlTypes/RecordIdentity';
import {ILinkValuesList} from '../../../../../../../_types/attributes';
import EditRecordModal from '../../../../../../records/EditRecordModal';
import SelectRecordModal from '../../../../../../records/SelectRecordModal';
import RecordCard from '../../../../../../shared/RecordCard';

interface ILinkValuesListProps {
    values: ILinkValuesList[];
    onValuesUpdate: (values: ILinkValuesList[]) => void;
    linkedLibrary: string;
}

function LinkValuesList({values, onValuesUpdate, linkedLibrary}: ILinkValuesListProps): JSX.Element {
    const {t} = useTranslation();
    const orTxt = t('admin.or');
    const [editRecordModalOpen, setEditRecordModalOpen] = useState<boolean>(false);
    const [editedRecord, setEditedRecord] = useState<string>();
    const [openSelectRecordModal, setOpenSelectRecordModal] = useState<boolean>(false);

    const _handleOpenSelectRecordModal = () => setOpenSelectRecordModal(true);
    const _handleCloseSelectRecordModal = () => setOpenSelectRecordModal(false);

    const _handleOpenEditRecordModal = () => setEditRecordModalOpen(true);
    const _handleCloseEditRecordModal = () => setEditRecordModalOpen(false);

    const _addElement = record => {
        // Don't add record if already present in values
        if (!values.filter(v => v.whoAmI.id === record.id).length) {
            const newValuesList = [...values, {whoAmI: record}];
            onValuesUpdate(newValuesList);
        }
    };

    const _handleSelectElement = (record?: RecordIdentity_whoAmI) => {
        if (!record) {
            return;
        }

        _addElement(record);

        _handleCloseSelectRecordModal();
    };

    const _handleCloseRecordEdition = (record?: RecordIdentity_whoAmI) => {
        _handleCloseEditRecordModal();
        if (!record) {
            return;
        }

        if (!editedRecord) {
            // We come from record creation, let's add it
            _addElement(record);
        }
    };

    const _handleOpenCreateRecord = () => {
        setEditedRecord(undefined);
        _handleOpenEditRecordModal();
    };

    const _handleOpenEditRecord = (recordId: string) => () => {
        setEditedRecord(recordId);
        _handleOpenEditRecordModal();
    };

    const _deleteValue = (i: number) => (e: React.SyntheticEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const newValuesList = [...values.slice(0, i), ...values.slice(i + 1)];
        onValuesUpdate(newValuesList);
    };

    return (
        <>
            <Button.Group size="tiny">
                <Button data-test-id="open-create-record" type="button" onClick={_handleOpenCreateRecord}>
                    <Icon name="plus circle" />
                    {t('records.create_record')}
                </Button>
                <Button.Or text={orTxt} />
                <Button data-test-id="open-select-record" type="button" onClick={_handleOpenSelectRecordModal}>
                    <Icon name="search" />
                    {t('records.select_record')}
                </Button>
            </Button.Group>
            <List data-test-id="values-list-wrapper" style={{width: '100%'}} divided>
                {values.map((val, i) => (
                    <List.Item
                        data-test-id="values-list-value"
                        key={`values_${i}`}
                        onClick={_handleOpenEditRecord(val.whoAmI.id)}
                    >
                        <List.Content floated="left">
                            <RecordCard record={val.whoAmI} />
                        </List.Content>
                        <List.Content floated="right">
                            <Button data-test-id="link-value-delete-btn" icon="trash" onClick={_deleteValue(i)} />
                        </List.Content>
                    </List.Item>
                ))}
            </List>
            <EditRecordModal
                open={editRecordModalOpen}
                onClose={_handleCloseRecordEdition}
                recordId={editedRecord}
                library={linkedLibrary}
            />
            <SelectRecordModal
                open={openSelectRecordModal}
                library={linkedLibrary}
                onClose={_handleCloseSelectRecordModal}
                onSelect={_handleSelectElement}
            />
        </>
    );
}

export default LinkValuesList;
