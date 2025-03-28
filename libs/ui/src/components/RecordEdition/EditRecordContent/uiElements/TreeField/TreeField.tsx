// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useEffect, useState} from 'react';
import {IFormElementProps} from '../../_types';
import {ICommonFieldsSettings, localizedTranslation} from '@leav/utils';
import styled from 'styled-components';
import {AntForm, KitButton, KitInputWrapper} from 'aristid-ds';
import {RecordFormAttributeTreeAttributeFragment} from '_ui/_gqlTypes';
import {TREE_FIELD_ID_PREFIX} from '_ui/constants';
import {useLang} from '_ui/hooks';
import {FaList} from 'react-icons/fa';
import {RecordFormElementsValueTreeValue} from '_ui/hooks/useGetRecordForm';
import {useDisplayTreeNode} from './display-tree-node/useDisplayTreeNode';
import {useManageTreeNodeSelection} from './manage-tree-node-selection/useManageTreeNodeSelection';
import {useOutsideInteractionDetector} from '../shared/useOutsideInteractionDetector';
import {useEditRecordReducer} from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {EditRecordReducerActionsTypes} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import {computeCalculatedFlags, computeInheritedFlags} from '../shared/calculatedInheritedFlags';
import {ComputeIndicator} from '../shared/ComputeIndicator';

const Wrapper = styled.div<{$metadataEdit: boolean}>`
    margin-bottom: ${props => (props.$metadataEdit ? 0 : '1.5em')};
`;

const KitInputExtraAlignLeft = styled.div`
    margin-right: auto;
    line-height: 12px;
`;

const KitFieldFooterButton = styled(KitButton)<{$hasNoValue: boolean}>`
    margin-top: ${props => (props.$hasNoValue ? 0 : 'calc((var(--general-spacing-xs)) * 1px)')};
`;

type TreeFieldProps = IFormElementProps<ICommonFieldsSettings>;

const TreeField: FunctionComponent<TreeFieldProps> = ({
    element,
    readonly,
    formIdToLoad,
    pendingValues,
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
    const [attributePendingValues, setAttributePendingValues] = useState<RecordFormElementsValueTreeValue[]>([]);

    const calculatedFlags = computeCalculatedFlags(backendValues);
    const inheritedFlags = computeInheritedFlags(backendValues);
    const label = localizedTranslation(settings.label, lang);
    const form = AntForm.useFormInstance();
    const fieldErrors = form.getFieldError(attribute.id);

    const isReadOnly = attribute.readonly || readonly;
    const isFieldInError = fieldErrors.length > 0;

    useEffect(() => {
        setAttributePendingValues(
            pendingValues?.[attribute.id]
                ? (Object.values(pendingValues?.[attribute.id]) as unknown as RecordFormElementsValueTreeValue[])
                : []
        );
    }, [pendingValues, attribute.id]);

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
        formIdToLoad,
        backendValues,
        pendingValues: attributePendingValues,
        allowedSelectors: ['.kit-modal-wrapper']
    });

    const {openModal, removeTreeNode, actionButtonLabel, SelectTreeNodeModal, RemoveAllTreeNodes} =
        useManageTreeNodeSelection({
            modaleTitle: label,
            attribute,
            backendValues,
            setBackendValues,
            onValueSubmit,
            onValueDelete,
            onDeleteMultipleValues,
            isReadOnly,
            isFieldInError
        });

    const {TreeNodeList} = useDisplayTreeNode({
        attribute,
        backendValues,
        removeTreeNode
    });

    return (
        <Wrapper $metadataEdit={metadataEdit}>
            <AntForm.Item name={attribute.id} noStyle>
                <KitInputWrapper
                    id={TREE_FIELD_ID_PREFIX + attribute.id}
                    label={label}
                    required={attribute.required}
                    bordered
                    disabled={isReadOnly}
                    status={isFieldInError ? 'error' : undefined}
                    helper={isFieldInError ? String(fieldErrors[0]) : undefined}
                    extra={
                        <>
                            <KitInputExtraAlignLeft>
                                <ComputeIndicator calculatedFlags={calculatedFlags} inheritedFlags={inheritedFlags} />
                            </KitInputExtraAlignLeft>
                            {RemoveAllTreeNodes}
                        </>
                    }
                >
                    {TreeNodeList}
                    <KitFieldFooterButton
                        icon={<FaList />}
                        onClick={openModal}
                        size="m"
                        $hasNoValue={!backendValues?.length}
                    >
                        {actionButtonLabel}
                    </KitFieldFooterButton>
                    {SelectTreeNodeModal}
                </KitInputWrapper>
            </AntForm.Item>
        </Wrapper>
    );
};

export default TreeField;
