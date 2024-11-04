// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {TreeItem} from 'react-sortable-tree';
import {Button, Icon, List} from 'semantic-ui-react';
import {RecordIdentity_whoAmI} from '../../../../../../../_gqlTypes/RecordIdentity';
import {ITreeValuesList} from '../../../../../../../_types/attributes';
import {ITreeLinkElement} from '../../../../../../../_types/records';
import EditRecordModal from '../../../../../../records/EditRecordModal';
import TreeNodeBreadcrumb from '../../../../../../shared/TreeNodeBreadcrumb';
import SelectTreeNodeModal from '../../../../../../trees/SelectTreeNodeModal';

interface ITreeValuesListProps {
    values: ITreeValuesList[];
    onValuesUpdate: (values: ITreeValuesList[]) => void;
    linkedTree: string;
}

function TreeValuesList({values, onValuesUpdate, linkedTree}: ITreeValuesListProps): JSX.Element {
    const {t} = useTranslation();

    const [isOpenSelectTreeNodeModal, setIsOpenSelectTreeNodeModal] = useState<boolean>(false);
    const _handleOpenSelectTreeNodeModal = () => setIsOpenSelectTreeNodeModal(true);
    const _handleCloseSelectTreeNodeModal = () => setIsOpenSelectTreeNodeModal(false);

    const [editRecordModalOpen, setEditRecordModalOpen] = useState<boolean>(false);
    const _handleOpenEditRecordModal = () => setEditRecordModalOpen(true);
    const _handleCloseEditRecordModal = () => setEditRecordModalOpen(false);

    const [editedRecord, setEditedRecord] = useState<RecordIdentity_whoAmI>();

    const _onTreeNodeSelected = ({node}: TreeItem) => {
        _handleCloseSelectTreeNodeModal();

        if (
            values.filter(
                v => v.record.whoAmI.id === node.record.whoAmI.id && v.record.whoAmI.id === node.record.whoAmI.id
            ).length
        ) {
            return;
        }

        const newValuesList = [
            ...values,
            {
                id: node.id,
                record: {whoAmI: node.record.whoAmI},
                ancestors: node.parents.map(p => ({
                    record: {
                        whoAmI: p.record.whoAmI
                    }
                }))
            }
        ];
        onValuesUpdate(newValuesList);
    };

    const _deleteValue = (i: number) => (e: React.SyntheticEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const newValuesList = [...values.slice(0, i), ...values.slice(i + 1)];
        onValuesUpdate(newValuesList);
    };

    const breadcrumbActions = [
        {
            text: t('records.edit'),
            icon: 'edit outline',
            action: (r: RecordIdentity_whoAmI) => {
                setEditedRecord(r);
                _handleOpenEditRecordModal();
            }
        }
    ];

    return (
        <>
            <Button
                icon
                labelPosition="left"
                size="medium"
                data-test-id="values-list-add-btn"
                onClick={_handleOpenSelectTreeNodeModal}
                type="button"
            >
                <Icon name="plus" />
                {t('attributes.add_value')}
            </Button>
            <List data-test-id="values-list-wrapper" style={{width: '100%'}} divided>
                {values.map((val, i) => (
                        <List.Item data-test-id="values-list-value" key={`values_${i}`}>
                            <List.Content floated="left">
                                <TreeNodeBreadcrumb element={val as ITreeLinkElement} actions={breadcrumbActions} />
                            </List.Content>
                            <List.Content floated="right">
                                <Button data-test-id="link-value-delete-btn" icon="trash" onClick={_deleteValue(i)} />
                            </List.Content>
                        </List.Item>
                    ))}
            </List>
            <SelectTreeNodeModal
                open={isOpenSelectTreeNodeModal}
                onClose={_handleCloseSelectTreeNodeModal}
                tree={linkedTree}
                onSelect={_onTreeNodeSelected}
            />
            <EditRecordModal
                open={editRecordModalOpen}
                onClose={_handleCloseEditRecordModal}
                recordId={editedRecord?.id || ''}
                library={editedRecord?.library.id || ''}
            />
        </>
    );
}

export default TreeValuesList;
