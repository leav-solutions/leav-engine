import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Table} from 'semantic-ui-react';
import {RecordIdentity_whoAmI} from '../../../../../_gqlTypes/RecordIdentity';
import {ITreeLinkValue} from '../../../../../_types/records';
import TreeNodeBreadcrumb from '../../../../shared/TreeNodeBreadcrumb';
import {ITreeBreadcrumbMenuItem} from '../../../../shared/TreeNodeBreadcrumb/TreeNodeBreadcrumb';
import EditRecordModal from '../../../EditRecordModal';

interface ILinksFieldTreeElementProps {
    value: ITreeLinkValue;
    readOnly?: boolean;
    onDeleteLink: (value: ITreeLinkValue) => void;
}

function LinksFieldTreeElement({value, readOnly, onDeleteLink}: ILinksFieldTreeElementProps): JSX.Element {
    const {t} = useTranslation();

    const _handleDeleteLink = () => onDeleteLink(value);
    const [isOpenEditRecordModal, setIsOpenEditRecordModal] = useState<boolean>(false);
    const [editedRecord, setEditedRecord] = useState<RecordIdentity_whoAmI | null>(null);

    const _handleOpenEditRecordModal = (r: RecordIdentity_whoAmI) => {
        setEditedRecord(r);
        setIsOpenEditRecordModal(true);
    };
    const _handleCloseEditRecordModal = () => setIsOpenEditRecordModal(false);

    if (!value.value) {
        return (
            <Table.Row>
                <Table.Cell>Invalid value</Table.Cell>
            </Table.Row>
        );
    }

    const actions: ITreeBreadcrumbMenuItem[] = [
        {
            text: t('records.edit'),
            icon: 'edit outline',
            action: _handleOpenEditRecordModal
        }
    ];

    if (!readOnly) {
        actions.push({
            text: t('records.delete_link'),
            icon: 'trash alternate outline',
            action: _handleDeleteLink,
            displayFilter: (r: RecordIdentity_whoAmI) => r.id === value.value?.record.whoAmI.id
        });
    }

    return (
        <>
            <Table.Row>
                <Table.Cell>
                    <TreeNodeBreadcrumb element={value.value} actions={actions} />
                </Table.Cell>
            </Table.Row>
            {isOpenEditRecordModal && !!editedRecord && (
                <EditRecordModal
                    library={editedRecord!.library.id}
                    recordId={editedRecord!.id}
                    open={isOpenEditRecordModal}
                    onClose={_handleCloseEditRecordModal}
                />
            )}
        </>
    );
}

export default LinksFieldTreeElement;
