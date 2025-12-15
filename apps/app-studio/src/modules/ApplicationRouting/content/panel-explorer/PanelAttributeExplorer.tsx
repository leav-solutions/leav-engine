// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Explorer,
    ThroughConditionFilter,
    useExecuteSaveValueBatchMutation,
    useLang,
    useValuesCacheUpdate,
} from '@leav/ui';
import {useApplicationSettingsContext} from '../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {mapToCommonExplorerProps} from './mapperToCommonExplorerProps';
import {mapperToItemActions} from './mapperToItemActions';
import {type ItemActions, type ExplorerProps} from '../../types';
import {AttributeType, RecordFilterCondition} from '../../../../__generated__';
import {explorerContainer} from './panelExplorer.module.css';
import {faTrash} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {type IItemData} from '_ui/components/Explorer/_types';
import {useDeactivateRecordsMutation, useDeleteValueMutation} from '_ui/_gqlTypes';
import {KitModal} from 'aristid-ds';
import {BREAK_TWO_LINES} from '_ui/components/Explorer/_constants';
import {useTranslation} from 'react-i18next';

interface IPanelExplorerProps {
    libraryIdSource: string;
    attributeSource: string;
    deactivateOnUnlink: boolean;
    viewId: string | undefined;
    explorerProps: ExplorerProps | undefined;
    actions: ItemActions;
    recordId: string | null;
    libraryId: string;
}

export const PanelAttributeExplorer: FunctionComponent<IPanelExplorerProps> = ({
    libraryIdSource,
    attributeSource,
    viewId,
    explorerProps,
    actions,
    recordId,
    libraryId,
    deactivateOnUnlink = false,
}) => {
    const [application] = useApplicationSettingsContext();
    const {lang} = useLang();
    const {t} = useTranslation();
    const navigate = useNavigate();

    const updateValuesCache = useValuesCacheUpdate();
    const {saveValues} = useExecuteSaveValueBatchMutation();
    const [deleteRecordLinkMutation] = useDeleteValueMutation({
        update: (_, deletedRecord) => {
            const parentRecord = {
                id: recordId,
                library: {
                    id: libraryId,
                },
            };
            updateValuesCache(parentRecord, deletedRecord.data?.deleteValue ?? []);
        },
    });
    const [deactivateRecordsMutation] = useDeactivateRecordsMutation({
        update(cache, deactivatedRecords) {
            deactivatedRecords.data?.deactivateRecords.forEach(record => {
                cache.evict({
                    id: cache.identify(record),
                });
            });
            cache.modify({
                fields: {
                    records: prev => ({
                        ...prev,
                        totalCount: prev.totalCount - 1,
                    }),
                },
                broadcast: false,
            });
            cache.gc();
        },
    });

    const commonExplorerProps = explorerProps ? mapToCommonExplorerProps({explorerProps}) : {};
    const itemActions = mapperToItemActions({actions, application, lang, navigate, libraryId: libraryIdSource});

    // TODO: Should be deleted when we will use link explorer
    itemActions.push({
        label: t('explorer.delete_item'),
        icon: <FontAwesomeIcon icon={faTrash} />,
        isDanger: true,
        useItemDeletePermission: true,
        callback: (item: IItemData) => {
            KitModal.confirm({
                width: '100%',
                style: {content: {width: '90vw', maxWidth: '656px'}},
                type: 'confirm',
                icon: false,
                title: t('explorer.delete_link'),
                content: t('explorer.delete_link_description') + BREAK_TWO_LINES + t('global.are_you_sure'),
                okText: t('global.confirm') ?? undefined,
                cancelText: t('global.cancel') ?? undefined,
                onOk: async () => {
                    await deleteRecordLinkMutation({
                        variables: {
                            library: libraryIdSource,
                            recordId: item.itemId,
                            attribute: attributeSource,
                            value: {
                                payload: recordId,
                            },
                        },
                    });

                    if (deactivateOnUnlink) {
                        await deactivateRecordsMutation({
                            variables: {
                                libraryId: libraryIdSource,
                                recordsIds: [item.itemId],
                            },
                        });
                    }
                },
            });
        },
    });

    return (
        <div className={explorerContainer}>
            <Explorer
                {...commonExplorerProps}
                defaultViewSettings={{
                    viewId,
                    filters: [
                        {
                            id: 'filter_to_linked_records',
                            hidden: true,
                            field: attributeSource,
                            subField: 'id',
                            attribute: {
                                id: attributeSource,
                                type: AttributeType.simple_link, // because it can be only mono-valued
                                label: 'SHOULD BE HIDDEN',
                            },
                            condition: ThroughConditionFilter.THROUGH,
                            subCondition: RecordFilterCondition.EQUAL,
                            value: recordId,
                        },
                    ],
                    ...commonExplorerProps.defaultViewSettings,
                }}
                entrypoint={{
                    // TODO: One day, this should be type="link" (when link explorer will support pagination, filtering, etc.)
                    // So we will no longer need to have a callback on create or custom item and mass actions
                    type: 'library',
                    libraryId: libraryIdSource,
                }}
                hideFirstActionLabel
                defaultActionsForItem={[]}
                itemActions={itemActions}
                defaultMassActions={['editAttribute', 'export']}
                defaultCallbacks={{
                    primary: {
                        create: ({recordIdCreated}) =>
                            // TODO: should be deleted when explorer used panels instead of modal form
                            saveValues(
                                {
                                    id: recordIdCreated,
                                    library: {
                                        id: libraryIdSource,
                                    },
                                },
                                [
                                    {
                                        attribute: attributeSource,
                                        idValue: null,
                                        value: recordId,
                                    },
                                ],
                            ),
                    },
                }}
            />
        </div>
    );
};
