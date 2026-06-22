import {type FunctionComponent} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {
    Explorer,
    ExplorerV2,
    ThroughConditionFilter,
    useConfirmModal,
    useExecuteSaveValueBatchMutation,
    useLang,
    useValuesCacheUpdate,
} from '@leav/ui';
import {faTrash} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {useDeactivateRecordsMutation, useDeleteValueMutation} from '_ui/_gqlTypes';
import {type IItemData} from '_ui/components/Explorer/_types';
import {BREAK_TWO_LINES} from '_ui/constants';
import {useApplicationSettingsContext} from '../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {type ItemActions, type ExplorerProps} from '../../types';
import {AttributeType, RecordFilterCondition} from '../../../../__generated__';
import {mapToCommonExplorerProps} from './mapperToCommonExplorerProps';
import {mapperToItemActions} from './mapperToItemActions';
import {useViewSettingsProps} from './useViewSettingsProps';
import {explorerContainer} from './panelExplorer.module.css';

interface IPanelExplorerProps {
    libraryIdSource: string;
    attributeSource: string;
    deactivateOnUnlink: boolean;
    explorerProps: ExplorerProps | undefined;
    actions: ItemActions;
    recordId: string | null;
    libraryId: string;
}

export const PanelAttributeExplorer: FunctionComponent<IPanelExplorerProps> = ({
    libraryIdSource,
    attributeSource,
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

    const viewSettingsProps = useViewSettingsProps();

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

    const {openConfirmModal} = useConfirmModal();

    const commonExplorerProps = explorerProps ? mapToCommonExplorerProps({explorerProps}) : {};
    const itemActions = mapperToItemActions({actions, application, lang, navigate, libraryId: libraryIdSource});

    // TODO: Should be deleted when we will use link explorer
    itemActions.push({
        label: t('explorer.delete_item'),
        icon: <FontAwesomeIcon icon={faTrash} />,
        isDanger: true,
        useItemDeletePermission: true,
        callback: (item: IItemData) => {
            openConfirmModal({
                title: t('explorer.delete_link'),
                content: t('explorer.delete_link_description') + BREAK_TWO_LINES + t('global.are_you_sure'),
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

    // The link pre-filter restricts the explorer to records linked to the parent record. It is
    // `hidden`: applied to the requests but never shown in the filters UI.
    const linkPreFilter = {
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
    };

    const entrypoint = {
        // TODO: One day, this should be type="link" (when link explorer will support pagination, filtering, etc.)
        // So we will no longer need to have a callback on create or custom item and mass actions
        type: 'library',
        libraryId: libraryIdSource,
    } as const;

    // TODO: should be deleted when explorer used panels instead of modal form
    const onCreate = ({recordIdCreated}: {recordIdCreated: string}) =>
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
        );

    // TODO: Should be deleted when ViewV2 will be fully integrated and ExplorerV2 will be renamed to Explorer.
    if (application.enableViewSettings) {
        const {defaultViewSettings: _legacyViewSettings, ...commonExplorerPropsV2} = commonExplorerProps;
        return (
            <div className={explorerContainer}>
                <ExplorerV2
                    {...commonExplorerPropsV2}
                    entrypoint={entrypoint}
                    hideFirstActionLabel
                    defaultActionsForItem={[]}
                    itemActions={itemActions}
                    defaultMassActions={['editAttribute', 'export']}
                    currentView={{
                        // ExplorerV2 is driven by the controlled `currentView`; the link pre-filter is injected into its filters.
                        ...viewSettingsProps.currentView,
                        filters: [linkPreFilter, ...(viewSettingsProps.currentView?.filters ?? [])],
                    }}
                    defaultCallbacks={{
                        ...viewSettingsProps.defaultCallbacks,
                        primary: {create: onCreate},
                    }}
                />
            </div>
        );
    }

    return (
        <div className={explorerContainer}>
            <Explorer
                {...commonExplorerProps}
                defaultViewSettings={{
                    filters: [linkPreFilter],
                    ...commonExplorerProps.defaultViewSettings,
                }}
                entrypoint={entrypoint}
                hideFirstActionLabel
                defaultActionsForItem={[]}
                itemActions={itemActions}
                defaultMassActions={['editAttribute', 'export']}
                defaultCallbacks={{
                    primary: {create: onCreate},
                }}
            />
        </div>
    );
};
