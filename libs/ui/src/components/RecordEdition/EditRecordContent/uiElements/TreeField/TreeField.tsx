// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent, useEffect, useState} from 'react';
import styled from 'styled-components';
import {type ICommonFieldsSettings, localizedTranslation} from '@leav/utils';
import {AntForm, KitButton, KitInputWrapper} from 'aristid-ds';
import {FaList} from 'react-icons/fa';
import {useLang} from '_ui/hooks';
import {type IFormElementProps} from '../../_types';
import {
    type ChildrenAsRecordValuePermissionFilterInput,
    type RecordFormAttributeTreeAttributeFragment,
    RecordPermissionsActions
} from '_ui/_gqlTypes';
import {TREE_FIELD_ID_PREFIX} from '_ui/constants';
import {type RecordFormElementsValueTreeValue} from '_ui/hooks/useGetRecordForm';
import {TreeNodeList} from './display-tree-node/TreeNodeList';
import {useManageTreeNodeSelection} from './manage-tree-node-selection/useManageTreeNodeSelection';
import {useOutsideInteractionDetector} from '../shared/useOutsideInteractionDetector';
import {useEditRecordReducer} from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {EditRecordReducerActionsTypes} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import {computeCalculatedFlags, computeInheritedFlags} from '../shared/calculatedInheritedFlags';
import {ComputeIndicator} from '../shared/ComputeIndicator';

const StyledWrapperDiv = styled.div<{$metadataEdit: boolean}>`
    margin-bottom: ${props => (props.$metadataEdit ? 0 : '1.5em')};
`;

const KitInputExtraAlignLeftDiv = styled.div`
    margin-right: auto;
    line-height: 12px;
`;

const StyledFieldFooterKitButton = styled(KitButton)<{$hasNoValue: boolean}>`
    margin-top: ${props => (props.$hasNoValue ? 0 : 'calc((var(--general-spacing-xs)) * 1px)')};
`;

type TreeFieldProps = IFormElementProps<ICommonFieldsSettings>;

const TreeField: FunctionComponent<TreeFieldProps> = ({
    element,
    readonly,
    isFormCreationMode,
    onDeleteMultipleValues,
    onValueSubmit,
    onValueDelete,
    metadataEdit = false
}) => {
    const {state, dispatch} = useEditRecordReducer();
    const {lang} = useLang();
    const {
        settings,
        attribute,
        values
    }: {
        settings: typeof element.settings;
        attribute?: RecordFormAttributeTreeAttributeFragment;
        values?: RecordFormElementsValueTreeValue[];
    } = element;

    const [backendValues, setBackendValues] = useState<RecordFormElementsValueTreeValue[]>(values);

    const calculatedFlags = computeCalculatedFlags(backendValues);
    const inheritedFlags = computeInheritedFlags(backendValues);
    const label = localizedTranslation(settings.label, lang);
    const form = AntForm.useFormInstance();
    const fieldErrors = form.getFieldError(attribute.id);

    const isReadOnly = attribute.readonly || !attribute.permissions.edit_value || readonly;
    const isFieldInError = fieldErrors.length > 0;

    useEffect(() => {
        if (state.activeAttribute?.attribute.id === attribute.id) {
            dispatch({
                type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
                values: backendValues
            });
        }
    }, [backendValues]);

    useOutsideInteractionDetector({
        attribute,
        activeAttribute: state.activeAttribute,
        attributePrefix: TREE_FIELD_ID_PREFIX,
        dispatch,
        backendValues,
        allowedSelectors: ['.kit-modal-wrapper']
    });

    const childrenAsRecordValuePermissionFilter: ChildrenAsRecordValuePermissionFilterInput = {
        libraryId: state.libraryId,
        attributeId: state.activeAttribute?.attribute?.id,
        action: RecordPermissionsActions.create_record
    };

    const {openModal, removeTreeNode, actionButtonLabel, SelectTreeNodeModal, RemoveAllTreeNodes} =
        useManageTreeNodeSelection({
            modaleTitle: label,
            attribute,
            isFormCreationMode,
            backendValues,
            setBackendValues,
            onValueSubmit,
            onValueDelete,
            onDeleteMultipleValues,
            isReadOnly,
            isFieldInError,
            childrenAsRecordValuePermissionFilter
        });

    return (
        <StyledWrapperDiv $metadataEdit={metadataEdit}>
            <AntForm.Item name={attribute.id} noStyle>
                <KitInputWrapper
                    id={TREE_FIELD_ID_PREFIX + attribute.id}
                    data-testid="tree-field"
                    label={label}
                    required={attribute.required}
                    bordered
                    disabled={isReadOnly}
                    status={isFieldInError ? 'error' : undefined}
                    helper={isFieldInError ? String(fieldErrors[0]) : undefined}
                    extra={
                        <>
                            <KitInputExtraAlignLeftDiv>
                                <ComputeIndicator calculatedFlags={calculatedFlags} inheritedFlags={inheritedFlags} />
                            </KitInputExtraAlignLeftDiv>
                            {RemoveAllTreeNodes}
                        </>
                    }
                >
                    <TreeNodeList
                        attribute={attribute}
                        backendValues={backendValues}
                        removeTreeNode={removeTreeNode}
                        isReadOnly={isReadOnly}
                    />
                    <StyledFieldFooterKitButton
                        disabled={isReadOnly}
                        icon={<FaList />}
                        onClick={openModal}
                        size="m"
                        $hasNoValue={!backendValues?.length}
                    >
                        {actionButtonLabel}
                    </StyledFieldFooterKitButton>
                    {SelectTreeNodeModal}
                </KitInputWrapper>
            </AntForm.Item>
        </StyledWrapperDiv>
    );
};

export default TreeField;
