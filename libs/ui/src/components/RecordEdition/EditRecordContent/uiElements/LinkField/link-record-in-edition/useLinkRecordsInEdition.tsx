// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Explorer} from '_ui/components/Explorer';
import {IExplorerRef} from '_ui/components/Explorer/Explorer';
import {ComponentProps, Dispatch, SetStateAction, useEffect, useState} from 'react';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ExplorerWrapper} from '../shared/ExplorerWrapper';
import {DeleteAllValuesButton} from '../../shared/DeleteAllValuesButton';
import {DeleteMultipleValuesFunc, ISubmitMultipleResult} from '../../../_types';
// todo regenerate types
import {
    RecordFilterCondition,
    RecordFormAttributeLinkAttributeFragment,
    useDeleteValueMutation,
    useGetLinksWithDataQuery,
    useGetRecordsFromLibraryLazyQuery
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

interface ILinkRecordsInCreationProps {
    libraryId: string;
    recordId: string;
    attribute: RecordFormAttributeLinkAttributeFragment;
    columnsToDisplay: ComponentProps<typeof Explorer>['defaultViewSettings']['attributesIds'];
    backendValues: RecordFormElementsValueLinkValue[];
    setBackendValues: Dispatch<SetStateAction<RecordFormElementsValueLinkValue[]>>;
    activeAttribute: IRecordPropertyWithAttribute | null;
    dispatch: Dispatch<IEditRecordReducerActions>;
    isHookUsed: boolean;
    isReadOnly: boolean;
    isFieldInError: boolean;
    tagDisplayMode: boolean;
    hasNoValue: boolean;
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
    const [linkedIds, setLinkIds] = useState([]);
    const [selectOptions, setSelectOptions] = useState([]);

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

    // Query to get all records from the linked library
    // Network-only is useful to avoid caching, we have a side effect otherwise
    // When the record is created, if we call getRecordsFromLibrary(), the previous records are returned
    const [getRecordsFromLibrary, {data: libraryItems, loading: libraryLoading}] = useGetRecordsFromLibraryLazyQuery({
        fetchPolicy: 'network-only'
    });

    // Function to refetch data with current parameters
    const libraryRefetch = (customVariables = {}) =>
        getRecordsFromLibrary({
            variables: {
                libraryId: attribute.linked_library.id,
                attributeIds: ['label'],
                pagination: {limit: 10, offset: 0},
                ...customVariables
            }
        });

    useEffect(() => {
        // Load library record data when the component is mounted
        libraryRefetch();
    }, []);

    // Update options for LinkSelect when libraryItems update
    useEffect(() => {
        if (libraryItems?.records?.list) {
            setSelectOptions(
                libraryItems.records.list.map(
                    record =>
                        ({
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
                        }) satisfies IKitOption
                )
            );
        }
    }, [libraryItems]);

    useEffect(() => {
        if (isHookUsed && backendValues.length === 0 && attribute.required) {
            // Set field in error when LinkField is displayed for the first time. Otherwise, errors will be handled by _removeValues() or _handleExplorerLinkValue()
            form.setFields([
                {
                    name: attribute.id,
                    errors: [t('errors.standard_field_required')]
                }
            ]);
        }
    }, []);

    const {data: libraryLinkedData, refetch: refetchLibraryLinkedData} = useGetLinksWithDataQuery({
        variables: {
            attributeIds: [],
            parentLibraryId: libraryId,
            parentRecordId: recordId,
            linkAttributeId: attribute.id
        }
    });

    useEffect(() => {
        // Extract all linkIds as an array of string
        if (libraryLinkedData?.records?.list?.length > 0 && libraryLinkedData.records.list[0]?.property) {
            setLinkIds(
                libraryLinkedData.records.list[0].property
                    .filter((linkData: any) => linkData?.payload?.id)
                    .map((linkData: any) => linkData.payload.id)
            );
        } else {
            setLinkIds([]);
        }
    }, [libraryLinkedData]);

    useEffect(() => {
        if (isHookUsed && activeAttribute?.attribute.id === attribute.id) {
            // Update active value used in the sidebar when backendValues change
            dispatch({
                type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
                values: backendValues
            });
        }
    }, [backendValues]);

    const _handleExplorerRef = (ref: IExplorerRef) => {
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

    const [deleteRecordLinkMutation] = useDeleteValueMutation({});

    const _onBlurLinkSelect = async (itemsToLink: Set<string>, itemsToDelete: Set<string>) => {
        const promises = [];

        // Only add non-empty requests to promises array
        if (itemsToLink.size > 0) {
            promises.push(_linkItem(Array.from(itemsToLink)));
        }

        if (itemsToDelete.size > 0) {
            promises.push(_removeLinkItem(Array.from(itemsToDelete)));
        }

        if (promises.length > 0) {
            await Promise.all(promises);

            // Refresh dropdown list elements
            await refetchLibraryLinkedData();
            await libraryRefetch();
        }
        setIsExplorerAddButtonClicked(false);
    };

    const {saveValues} = useSaveValueBatchMutation();

    // Send mutation to add a link to libraryId
    const _linkItem = async (itemsToLink: string[]) => {
        if (!itemsToLink || itemsToLink.length === 0) {
            return;
        }

        const values = itemsToLink.map(item => ({
            attribute: attribute.id,
            idValue: null,
            value: item
        }));

        // Send mutation to add a link to libraryId
        return saveValues(
            {
                id: recordId,
                library: {
                    id: libraryId
                }
            },
            values
        );
    };

    // After ths 500ms debounce we search records that match the text entered in the search bar
    const _onLinkSelectSearch = async (text: string) => {
        await libraryRefetch({
            filters: [
                {
                    condition: RecordFilterCondition.CONTAINS,
                    field: 'label',
                    value: text
                }
            ]
        });
    };

    const _removeLinkItem = async (itemsId: string[]) => {
        if (!libraryLinkedData || itemsId.length === 0) {
            return;
        }

        const deletePromises = itemsId.map(async itemId => {
            const link = libraryLinkedData?.records?.list[0].property.find(
                (linkData: any) => linkData.payload?.id === itemId
            );

            if (!link) {
                return;
            }

            return deleteRecordLinkMutation({
                variables: {
                    library: libraryId,
                    attribute: attribute.id,
                    recordId,
                    value: {
                        id_value: link.id_value
                    }
                }
            });
        });

        return Promise.all(deletePromises);
    };

    const _onCreateLinkSelect = async () => {
        setIsExplorerAddButtonClicked(false);
        explorerActions?.createAction?.callback();
    };

    // Wrap callback when the value is created, to force a refresh of the dropdown list
    const wrapHandleExplorerCreateValue = async ({
        recordIdCreated,
        saveValuesResultOnLink
    }: {
        recordIdCreated: string;
        saveValuesResultOnLink?: ISubmitMultipleResult;
    }) => {
        // Call the original handler
        handleExplorerCreateValue({
            recordIdCreated,
            saveValuesResultOnLink
        });

        await libraryRefetch();
        await refetchLibraryLinkedData();
    };

    const _onDeselect = (itemId: string) => {
        if (!libraryLinkedData?.records?.list?.length || !libraryLinkedData.records.list[0]?.property) {
            return null;
        }

        const link = libraryLinkedData.records.list[0].property.find(
            (linkData: any) => linkData.payload?.id === itemId
        );

        if (!link) {
            return null;
        }

        return {
            id_value: link.id_value,
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
                <LinkSelect tagDisplay={true} options={selectOptions} defaultValues={linkedIds}></LinkSelect>
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
                                    create: wrapHandleExplorerCreateValue
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
                            hidePrimaryActions
                            hideTableHeader
                            iconsOnlyItemActions
                        />
                    </ExplorerWrapper>

                    <KitButton onClick={_openLinkSelect} icon={<FontAwesomeIcon icon={faPlus} />}>
                        {t('global.add')}
                    </KitButton>
                    {isExplorerAddButtonClicked && (
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
                </>
            ))
    };
};
