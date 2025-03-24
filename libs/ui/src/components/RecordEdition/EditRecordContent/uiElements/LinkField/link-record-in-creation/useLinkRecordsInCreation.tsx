// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FaEye, FaList, FaPlus, FaTrash} from 'react-icons/fa';
import {Explorer} from '_ui/components/Explorer';
import {ExplorerWrapper} from '../shared/ExplorerWrapper';
import {LinkActionsButtons} from '../shared/LinkActionsButtons';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useRecordSelector} from '../action-primary/useRecordSelector';
import {useEditRecord} from '../action-item/useEditRecord';
import {useUnselectRecord} from '../action-item/useUnselectRecord';
import {ACTION_ITEM_EMPTY_LABEL} from '../shared/utils';
import {useCreateRecord} from '../action-primary/useCreateRecord';
import {RecordFilterOperator, RecordFormAttributeFragment} from '_ui/_gqlTypes';
import {useUnselectAllRecords} from '../action-mass/useUnselectAllRecords';
import {DeleteValueFunc, SubmitValueFunc} from '../../../_types';
import {useLinkRecords} from './useLinkRecords';
import {DeleteAllValuesButton} from '../../shared/DeleteAllValuesButton';
import {Dispatch, useEffect} from 'react';
import {RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm';
import {AntForm} from 'aristid-ds';
import {
    EditRecordReducerActionsTypes,
    IEditRecordReducerActions,
    IRecordPropertyWithAttribute
} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';

interface IUseLinkRecordsInCreationProps {
    attribute: RecordFormAttributeFragment;
    libraryId: string;
    pendingValues: RecordFormElementsValueLinkValue[];
    activeAttribute: IRecordPropertyWithAttribute | null;
    dispatch: Dispatch<IEditRecordReducerActions>;
    isHookUsed: boolean;
    isReadOnly: boolean;
    isFieldInError: boolean;
    onValueSubmit: SubmitValueFunc;
    onValueDelete: DeleteValueFunc;
}

export const useLinkRecordsInCreation = ({
    attribute,
    libraryId,
    pendingValues,
    activeAttribute,
    dispatch,
    isHookUsed,
    isReadOnly,
    isFieldInError,
    onValueSubmit,
    onValueDelete
}: IUseLinkRecordsInCreationProps) => {
    const {t} = useSharedTranslation();
    const form = AntForm.useFormInstance();

    const {explorerFilters, explorerKey, linkRecords, unlinkRecords, hasNoSelectedRecord, canDeleteAllValues} =
        useLinkRecords({
            attribute,
            libraryId,
            onValueSubmit,
            onValueDelete
        });

    const {openModal: openCreateRecordModal, CreateRecordModal} = useCreateRecord({
        linkRecords
    });

    const {openModal: openRecordSelectorModal, RecordSelectorModal} = useRecordSelector({
        libraryId,
        isReplacementMode: !attribute.multiple_values && !hasNoSelectedRecord,
        selectionMode: attribute.multiple_values ? 'multiple' : 'simple',
        linkRecords
    });

    const {openModal: openEditRecordModal, EditRecordModal} = useEditRecord();

    const {callback: unselectRecordCallback} = useUnselectRecord({
        unlinkRecords
    });

    const {callback: unselectAllRecordsCallback} = useUnselectAllRecords({
        unlinkRecords
    });

    useEffect(() => {
        if (isHookUsed && pendingValues.length === 0 && attribute.required) {
            // Set field in error when LinkField is displayed for the first time. Otherwise, errors will be handled by useLinkRecords
            form.setFields([
                {
                    name: attribute.id,
                    errors: [t('errors.standard_field_required')]
                }
            ]);
        }
    }, []);

    useEffect(() => {
        if (isHookUsed && activeAttribute?.attribute.id === attribute.id) {
            // Update active value used in the sidebar when pendingValues change
            dispatch({
                type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
                values: pendingValues
            });
        }
    }, [pendingValues]);

    return {
        UnlinkAllRecordsInCreation: isHookUsed && canDeleteAllValues && (
            <DeleteAllValuesButton handleDelete={unlinkRecords} disabled={isReadOnly} danger={isFieldInError} />
        ),
        LinkRecordsInCreation: isHookUsed && (
            <>
                <ExplorerWrapper>
                    <Explorer
                        key={explorerKey} // To force the Explorer to re-render when the filters change
                        defaultViewSettings={{
                            filters: explorerFilters,
                            filtersOperator: RecordFilterOperator.OR
                        }}
                        entrypoint={{
                            type: 'library',
                            libraryId
                        }}
                        showTitle={false}
                        showSearch={false}
                        selectionMode={attribute.multiple_values ? 'multiple' : 'simple'}
                        hideSelectAllAction={!attribute.multiple_values}
                        disableSelection={isReadOnly || !attribute.multiple_values}
                        defaultActionsForItem={[]}
                        itemActions={[
                            {label: ACTION_ITEM_EMPTY_LABEL, icon: <FaEye />, callback: openEditRecordModal},
                            ...(attribute.multiple_values
                                ? [
                                      {
                                          label: ACTION_ITEM_EMPTY_LABEL,
                                          icon: <FaTrash />,
                                          callback: unselectRecordCallback,
                                          isDanger: true
                                      }
                                  ]
                                : [])
                        ]}
                        defaultMassActions={[]}
                        massActions={
                            attribute.multiple_values
                                ? [{icon: <FaTrash />, label: t('global.delete'), callback: unselectAllRecordsCallback}]
                                : []
                        }
                        hidePrimaryActions
                        hideTableHeader
                        iconsOnlyItemActions
                        noPagination
                    />
                </ExplorerWrapper>
                <LinkActionsButtons
                    createButtonProps={{
                        icon: <FaPlus />,
                        label: t('explorer.create-one'),
                        callback: () => openCreateRecordModal(libraryId),
                        disabled: isReadOnly || !attribute.permissions.edit_value
                    }}
                    linkButtonProps={{
                        icon: <FaList />,
                        label:
                            attribute.multiple_values || hasNoSelectedRecord
                                ? t('explorer.add-existing-item')
                                : t('record_edition.replace-by-existing-item'),
                        callback: openRecordSelectorModal,
                        disabled: isReadOnly || !attribute.permissions.edit_value
                    }}
                    hasNoValue={hasNoSelectedRecord}
                />
                {CreateRecordModal}
                {RecordSelectorModal}
                {EditRecordModal}
            </>
        )
    };
};
