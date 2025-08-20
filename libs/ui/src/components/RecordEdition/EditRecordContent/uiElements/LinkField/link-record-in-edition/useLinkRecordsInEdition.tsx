// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Explorer} from '_ui/components/Explorer';
import {IExplorerRef} from '_ui/components/Explorer/Explorer';
import {ComponentProps, Dispatch, SetStateAction, useEffect, useState} from 'react';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ExplorerWrapper} from '../shared/ExplorerWrapper';
import {DeleteAllValuesButton} from '../../shared/DeleteAllValuesButton';
import {DeleteMultipleValuesFunc} from '../../../_types';
import {
    AttributeType,
    JoinLibraryContextFragment,
    RecordFilterCondition,
    RecordFilterInput,
    RecordFilterOperator,
    RecordFormAttributeLinkAttributeFragment,
    useGetLibraryByIdQuery,
    useGetJoinLibraryMandatoryAttributeValuesLazyQuery,
    useGetRecordsFromLibraryQuery,
    ValueDetailsLinkValueFragment
} from '_ui/_gqlTypes';

import useSaveValueBatchMutation from '_ui/components/RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation';
import {RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm';
import {AntForm, KitButton} from 'aristid-ds';
import {
    EditRecordReducerActionsTypes,
    IEditRecordReducerActions,
    IRecordPropertyWithAttribute
} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import {useLinkRecords} from './useLinkRecords';
import {IKitOption} from 'aristid-ds/dist/Kit/DataEntry/Select/types';
import LinkSelect from '_ui/components/LinkSelect';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus} from '@fortawesome/free-solid-svg-icons';
import {FullTextAttribute, IFilter, IQueryFilter} from '_ui/types';
import {SelectTreeNodeModal} from '../../TreeField/manage-tree-node-selection/SelectTreeNodeModal';
import _ from 'lodash';

interface ILinkRecordsInCreationProps {
    libraryId: string;
    recordId: string;
    attribute: RecordFormAttributeLinkAttributeFragment;
    joinLibraryContext: JoinLibraryContextFragment;
    columnsToDisplay: ComponentProps<typeof Explorer>['defaultViewSettings']['attributesIds'];
    backendValues: RecordFormElementsValueLinkValue[];
    setBackendValues: Dispatch<SetStateAction<RecordFormElementsValueLinkValue[]>>;
    activeAttribute: IRecordPropertyWithAttribute | null;
    dispatch: Dispatch<IEditRecordReducerActions>;
    isHookUsed: boolean;
    isReadOnly: boolean;
    isFieldInError: boolean;
    tagDisplayMode: boolean;
    onDeleteMultipleValues: DeleteMultipleValuesFunc;
}

const _shouldUpdateExplorerActions = (ref: IExplorerRef, explorerActions: IExplorerRef) =>
    ref?.createAction?.disabled !== explorerActions?.createAction?.disabled ||
    ref?.linkAction?.disabled !== explorerActions?.linkAction?.disabled ||
    ref?.totalCount !== explorerActions?.totalCount;

export const useLinkRecordsInEdition = ({
    libraryId,
    recordId,
    attribute,
    joinLibraryContext,
    columnsToDisplay,
    backendValues,
    setBackendValues,
    activeAttribute,
    dispatch,
    isHookUsed,
    isReadOnly,
    isFieldInError,
    tagDisplayMode,
    onDeleteMultipleValues
}: ILinkRecordsInCreationProps) => {
    const {t} = useSharedTranslation();
    const form = AntForm.useFormInstance();

    const [isExplorerAddButtonClicked, setIsExplorerAddButtonClicked] = useState(false);
    const [explorerActions, setExplorerActions] = useState<IExplorerRef | null>(null);
    const [fullTextSearchAttributes, setFullTextSearchAttributes] = useState<FullTextAttribute[]>([]);
    const [linkedIds, setLinkIds] = useState<string[]>([]);
    const [selectOptions, setSelectOptions] = useState<IKitOption[]>([]);
    const [totalCountInExplorer, setTotalCountInExplorer] = useState<number>(0);
    /**
     * Keys is joined record id (e.g. thematic), values is join record Id (e.g. structure_item)
     * Necessary to get the id_value of the link when we want to delete a value
     */
    const [joinedRecordIdsMap, setJoinedRecordIdsMap] = useState<Record<string, string> | null>(null);

    const {
        handleDeleteAllValues,
        handleExplorerCreateValue,
        handleExplorerLinkValue,
        handleExplorerMassDeactivateValues,
        handleExplorerRemoveValue
    } = useLinkRecords({
        attribute,
        backendValues,
        setBackendValues,
        onDeleteMultipleValues
    });

    const _getLibraryId = () =>
        (joinLibraryContext?.mandatoryAttribute &&
            'linked_library' in joinLibraryContext.mandatoryAttribute &&
            joinLibraryContext.mandatoryAttribute.linked_library?.id) ||
        attribute.linked_library.id;

    // Query to get all records from the linked library
    // Network-only is useful to avoid caching, we have a side effect otherwise
    // When the record is created, if we call getRecordsFromLibrary(), the previous records are returned
    const {data: libraryItems, refetch: getRecordsFromLibrary} = useGetRecordsFromLibraryQuery({
        fetchPolicy: 'network-only',
        variables: {
            libraryId: _getLibraryId(),
            pagination: {limit: 10, offset: 0}
        }
    });

    // Function to get the library configuration
    const {data: libraryLinked} = useGetLibraryByIdQuery({
        variables: {
            id: _getLibraryId()
        }
    });

    useEffect(() => {
        if (libraryLinked) {
            setFullTextSearchAttributes(libraryLinked.libraries.list[0].fullTextAttributes);
        }
    }, [libraryLinked]);

    // For each record in backendValues, get the id of the record linked by the mandatory attribute
    // Will create a map of joined record ids to their corresponding link ids in joinedRecordIdsMap
    const [getJoinLibraryMandatoryAttributeValues, {data: mandatoryAttributeValues}] =
        useGetJoinLibraryMandatoryAttributeValuesLazyQuery({
            fetchPolicy: 'no-cache'
        });

    useEffect(() => {
        if (mandatoryAttributeValues) {
            const _joinedRecordIdsMap = mandatoryAttributeValues?.records?.list.reduce(
                (acc, record) => {
                    const joinedRecordId = record.property[0]?.payload?.id;
                    if (joinedRecordId) {
                        acc[joinedRecordId] = record.id;
                    }
                    return acc;
                },
                {} as Record<string, string>
            );
            const linkIds = Object.keys(_joinedRecordIdsMap);
            setJoinedRecordIdsMap(_joinedRecordIdsMap);
            setLinkIds(linkIds);
        }
    }, [mandatoryAttributeValues]);

    // Function to refetch data with current parameters
    const getRecordsRefetch = (customVariables = {}) =>
        getRecordsFromLibrary({
            libraryId: _getLibraryId(),
            pagination: {limit: 10, offset: 0},
            ...customVariables
        });

    useEffect(() => {
        // will be set by specific useEffect on joinLinkOrTreeValue after getLinkOrTreeAttributeValueOfRecord
        if (backendValues.length) {
            if (joinLibraryContext?.mandatoryAttribute?.id) {
                const filteredJoinRecords: RecordFilterInput[] = backendValues.reduce(
                    (acc: RecordFilterInput[], value: RecordFormElementsValueLinkValue, index: number) => {
                        // Add OR operator between filters (except before the first filter)
                        if (index > 0) {
                            acc.push({operator: RecordFilterOperator.OR});
                        }
                        acc.push({
                            condition: RecordFilterCondition.EQUAL,
                            field: 'id',
                            value: value.linkValue.id
                        });

                        return acc;
                    },
                    []
                );
                getJoinLibraryMandatoryAttributeValues({
                    variables: {
                        joinLibraryId: attribute.linked_library.id,
                        filters: filteredJoinRecords,
                        mandatoryAttributeId: joinLibraryContext.mandatoryAttribute.id
                    }
                });
            } else {
                setLinkIds(backendValues.map(bv => bv.linkValue.id));
            }
        } else {
            setLinkIds([]);
        }

        if (isHookUsed && activeAttribute?.attribute.id === attribute.id) {
            // Update active value used in the sidebar when backendValues change
            dispatch({
                type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
                values: backendValues
            });
        }
    }, [backendValues, joinLibraryContext]);

    // Update options for LinkSelect when libraryItems update
    useEffect(() => {
        if (libraryItems?.records?.list) {
            setSelectOptions(
                libraryItems.records.list.map<IKitOption>(record => ({
                    value: record.id,
                    label: record.whoAmI.label ?? record.whoAmI.id,
                    idCard: {
                        description: record.whoAmI.label ?? record.whoAmI.id,
                        avatarProps: {
                            size: 'small',
                            shape: 'square',
                            imageFit: 'contain',
                            src: record.whoAmI.preview?.small,
                            label: record.whoAmI.label ?? record.whoAmI.id
                        }
                    }
                }))
            );
        }
    }, [libraryItems]);

    useEffect(() => {
        if (!totalCountInExplorer && attribute.required) {
            form.setFields([{name: attribute.id, errors: [t('errors.standard_field_required')]}]);
        } else {
            form.setFields([{name: attribute.id, errors: []}]);
        }
    }, [totalCountInExplorer]);

    const _handleExplorerRef = (ref: IExplorerRef) => {
        setTotalCountInExplorer(ref?.totalCount);

        if (_shouldUpdateExplorerActions(ref, explorerActions)) {
            setExplorerActions({
                createAction: ref?.createAction,
                linkAction: ref?.linkAction,
                totalCount: ref?.totalCount
            });
        }
    };

    const _openLinkSelect = () => {
        setIsExplorerAddButtonClicked(true);
    };

    const {saveValues} = useSaveValueBatchMutation();

    // eventually change Set to Array can simplify a bit that method !
    const _onSelectionDone = async (itemsToLink: Set<string>, itemsToDelete: Set<string>) => {
        // In case of joinLibraryContext,
        // itemsToLink and itemsToDelete are a Set of joined record ids (e.g. thematic ids instead structure_item ids)
        // - for insertion, backend can receive joined record ids, it is ok
        // - but for deletion, we need the id of linked record (e.g. structure_item id), to be able to get the id_value of that link
        // (e.g. between campaign and structure_item), so we use a map of joined record ids to their corresponding link ids
        // (e.g. switch from thematic id to structure_item id)
        const backendIdToDelete = joinedRecordIdsMap
            ? new Set([...itemsToDelete.values()].map(itemToDelete => joinedRecordIdsMap[itemToDelete]))
            : itemsToDelete;

        // If there is no value to link or to remove, return early
        if (itemsToLink.size === 0 && itemsToDelete.size === 0) {
            setIsExplorerAddButtonClicked(false);
            return;
        }

        // Convert itemsToLink Set to Array once to avoid repeated conversions
        const itemsToLinkArray = Array.from(itemsToLink);

        // Find values to remove and prepare payload for backend
        const valuesToRemove = backendValues.filter(bv => backendIdToDelete.has(bv.linkValue.id));
        const idValuesToRemove = valuesToRemove.map(bv => bv.id_value);

        // Prepare batch operation payload
        const values = [
            // Items to link (create new links)
            ...itemsToLinkArray.map(item => ({
                attribute: attribute.id,
                idValue: null,
                value: item
            })),
            // Items to delete (remove existing links)
            ...idValuesToRemove.map(item => ({
                attribute: attribute.id,
                idValue: item,
                value: null
            }))
        ];

        // Send the values to the backend
        const res = await saveValues({id: recordId, library: {id: libraryId}}, values, undefined, true);

        const resValues = res.values as ValueDetailsLinkValueFragment[];

        // Update linked IDs: add new links and remove deleted ones
        // Maybe not necessary because setBackendValues will trigger an effect to re set linkedIds !
        const updatedLinkedIds = linkedIds.filter(id => !itemsToDelete.has(id)).concat(itemsToLinkArray);
        setLinkIds(updatedLinkedIds);

        // Extract newly added values from response, filter because saveValues return delete values in resValues !
        const newlyAddedValues = resValues.filter(
            v =>
                // We do not do a positive filter based on itemsToLink because in case of joinLibraryContext,
                // we do not have the mapping between linkIds and backendValue ids.
                // However in we know the mapping between linkIds and backendValue ids for itemsToDelete, so we do a negative filter here
                !backendIdToDelete.has(v.linkValue.id)
        ) as unknown as RecordFormElementsValueLinkValue[];

        // Update backend values: remove deleted ones and add new ones
        setBackendValues([...backendValues.filter(bv => !backendIdToDelete.has(bv.linkValue.id)), ...newlyAddedValues]);

        // Hide linkSelect
        setIsExplorerAddButtonClicked(false);
    };

    const _onBlurLinkSelect: ComponentProps<typeof LinkSelect>['onBlur'] = async (itemsToLink, itemsToDelete) => {
        _onSelectionDone(itemsToLink, itemsToDelete);
    };

    const _onSelectTreeNodeConfirm: ComponentProps<typeof SelectTreeNodeModal>['onConfirm'] = async selectedNodes => {
        // Convert selectedNodes to a Set of ids
        const itemsToLink = new Set(
            _.difference(
                selectedNodes.map(node => node.id),
                linkedIds
            )
        );
        const itemsToDelete = new Set(
            _.difference(
                linkedIds,
                selectedNodes.map(node => node.id)
            )
        );

        _onSelectionDone(itemsToLink, itemsToDelete);
    };

    // search records that match the text typed in the search bar
    const _onLinkSelectSearch: ComponentProps<typeof LinkSelect>['onSearch'] = async text => {
        const filters = fullTextSearchAttributes.reduce(
            (acc: IQueryFilter[], attr: FullTextAttribute, index: number) => {
                // Add OR operator between filters (except before the first filter)
                if (index > 0) {
                    acc.push({operator: RecordFilterOperator.OR});
                }

                // Add the filter condition
                acc.push({
                    condition: RecordFilterCondition.CONTAINS,
                    field: attr.id,
                    value: text
                });

                return acc;
            },
            []
        );

        await getRecordsRefetch({
            filters
        });
    };

    const _onCreateLinkSelect: ComponentProps<typeof LinkSelect>['onClickCreateButton'] = async () => {
        setIsExplorerAddButtonClicked(false);
        explorerActions?.createAction?.callback();
    };

    const _onDeselect: ComponentProps<typeof LinkSelect>['onParentDeselect'] = linkId => {
        const item = backendValues.find(bv => bv.linkValue.id === linkId);

        if (!item) {
            return null;
        }

        return {
            id_value: item.id_value,
            libraryId,
            attribute,
            recordId
        };
    };

    return {
        UnlinkAllRecordsInEdition: isHookUsed &&
            backendValues.length > 1 &&
            attribute.multiple_values &&
            !attribute.required && (
                <DeleteAllValuesButton
                    handleDelete={handleDeleteAllValues}
                    disabled={isReadOnly}
                    danger={isFieldInError}
                />
            ),
        LinkRecordsInEditionExplorer:
            isHookUsed &&
            recordId &&
            (tagDisplayMode ? (
                <LinkSelect tagDisplay options={selectOptions} defaultValues={linkedIds} />
            ) : (
                <>
                    <ExplorerWrapper>
                        <Explorer
                            ref={_handleExplorerRef}
                            defaultViewSettings={{
                                attributesIds: columnsToDisplay
                            }}
                            entrypoint={{
                                type: 'link',
                                parentLibraryId: libraryId,
                                parentRecordId: recordId,
                                linkAttributeId: attribute.id
                            }}
                            defaultCallbacks={{
                                item: {
                                    remove: handleExplorerRemoveValue
                                },
                                mass: {
                                    deactivate: handleExplorerMassDeactivateValues
                                },
                                primary: {
                                    link: handleExplorerLinkValue,
                                    create: handleExplorerCreateValue
                                }
                            }}
                            showTitle={false}
                            showSearch={false}
                            selectionMode={attribute.multiple_values ? 'multiple' : 'simple'}
                            disableSelection={
                                isReadOnly ||
                                !attribute.multiple_values ||
                                (attribute.required && attribute.multiple_values && backendValues.length === 1)
                            }
                            defaultActionsForItem={[]}
                            joinLibraryContext={joinLibraryContext}
                            hidePrimaryActions
                            hideTableHeader
                            iconsOnlyItemActions
                        />
                    </ExplorerWrapper>

                    <KitButton
                        disabled={isReadOnly}
                        onClick={_openLinkSelect}
                        icon={<FontAwesomeIcon icon={faPlus} />}
                    ></KitButton>
                    {isExplorerAddButtonClicked && (
                        <>
                            {joinLibraryContext?.mandatoryAttribute.type !== AttributeType.tree && (
                                <LinkSelect
                                    tagDisplay={false}
                                    options={selectOptions}
                                    defaultValues={linkedIds}
                                    onClickCreateButton={_onCreateLinkSelect}
                                    onBlur={_onBlurLinkSelect}
                                    onParentDeselect={_onDeselect}
                                    onSearch={_onLinkSelectSearch}
                                />
                            )}
                            {joinLibraryContext?.mandatoryAttribute.type === AttributeType.tree && (
                                <SelectTreeNodeModal
                                    title="title"
                                    open={true}
                                    attribute={{
                                        ...joinLibraryContext.mandatoryAttribute,
                                        multiple_values: attribute.multiple_values
                                    }}
                                    backendValues={linkedIds.map(linkId => ({
                                        treeValue: {
                                            id: linkId
                                        }
                                    }))}
                                    onClose={() => {
                                        setIsExplorerAddButtonClicked(false);
                                    }}
                                    onConfirm={_onSelectTreeNodeConfirm}
                                />
                            )}
                        </>
                    )}
                </>
            ))
    };
};
