// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button, Modal} from 'antd';
import {PrimaryBtn} from 'components/app/StyledComponent/PrimaryBtn';
import useSearchReducer from 'hooks/useSearchReducer';
import {SearchActionTypes} from 'hooks/useSearchReducer/searchReducer';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useLang} from '../../../../hooks/LangHook/LangHook';
import {getFieldsKeyFromAttribute, localizedTranslation} from '../../../../utils';
import {AttributeFormat, AttributeType, IAttribute, IField, ISelectedAttribute} from '../../../../_types/types';
import AttributesSelectionList from '../../../AttributesSelectionList';

interface IChooseTableColumnsProps {
    visible: boolean;
    onClose: () => void;
}

function ChooseTableColumns({visible, onClose}: IChooseTableColumnsProps): JSX.Element {
    const {t} = useTranslation();
    const [{lang}] = useLang();
    const {state: searchState, dispatch: searchDispatch} = useSearchReducer();
    const [selectedAttributes, setSelectedAttributes] = useState<ISelectedAttribute[]>(
        (searchState?.fields ?? []).map(col => {
            const currentAttribute = searchState.attributes.find(
                attribute => attribute.id === col.id && attribute.library === col.library
            );

            return {
                ...col,
                path: col.key,
                label: currentAttribute?.label ?? null,
                multiple_values: !!col.multipleValues
            };
        })
    );

    const handleSubmit = () => {
        const noDuplicateNewAttribute: IAttribute[] = selectedAttributes
            .filter(
                selectedAttribute =>
                    !searchState.attributes.some(
                        attribute =>
                            attribute.id === selectedAttribute.id && attribute.library === selectedAttribute.library
                    )
            )
            .map(a => ({
                ...a,
                isLink: a.type === AttributeType.tree,
                isMultiple: a.multiple_values,
                format: a.format ?? undefined
            }));

        const allAttributes = [...(searchState?.attributes ?? []), ...noDuplicateNewAttribute];

        searchDispatch({type: SearchActionTypes.SET_ATTRIBUTES, attributes: allAttributes});

        const newFields: IField[] = selectedAttributes.reduce((acc, selectedAttribute) => {
            const attribute = allAttributes.find(
                currentAttr =>
                    currentAttr.id === selectedAttribute.id && currentAttr.library === selectedAttribute.library
            );

            if (!attribute) {
                return acc;
            }

            const key = getFieldsKeyFromAttribute(selectedAttribute);

            const label =
                typeof attribute.label === 'string' ? attribute.label : localizedTranslation(attribute.label, lang);

            const embeddedData = selectedAttribute.embeddedFieldData && {
                format: selectedAttribute.embeddedFieldData?.format ?? AttributeFormat.text,
                path: selectedAttribute.path
            };

            const field: IField = {
                id: selectedAttribute.id,
                library: selectedAttribute.library,
                label,
                key,
                type: selectedAttribute.type,
                format: attribute.format,
                parentAttributeData: selectedAttribute?.parentAttributeData,
                treeData: selectedAttribute.treeData,
                embeddedData,
                recordLibrary:
                    selectedAttribute?.parentAttributeData?.type === AttributeType.tree
                        ? selectedAttribute.path.split('.')[1]
                        : null
            };

            return [...acc, field];
        }, []);

        searchDispatch({
            type: SearchActionTypes.SET_FIELDS,
            fields: newFields
        });

        onClose();
    };

    const _handleCancel = () => {
        onClose();
    };

    // hack to disable warning "Droppable: unsupported nested scroll container" from react-beautiful-dnd,
    // remove "overflow: auto" on class "ant-modal-wrap"
    const elements: any = document.getElementsByClassName('ant-modal-wrap');
    if (elements.length) {
        elements[0].style.overflow = 'initial';
    }

    return (
        <Modal
            visible={visible}
            onCancel={_handleCancel}
            title={t('table-columns-selection.header')}
            width="70rem"
            centered
            footer={[
                <Button key="Cancel" onClick={_handleCancel}>
                    {t('table-columns-selection.cancel')}
                </Button>,
                <PrimaryBtn key="Submit" onClick={handleSubmit}>
                    {t('table-columns-selection.submit')}
                </PrimaryBtn>
            ]}
        >
            <AttributesSelectionList
                library={searchState.library.id}
                selectedAttributes={selectedAttributes}
                onSelectionChange={setSelectedAttributes}
            />
        </Modal>
    );
}

export default ChooseTableColumns;
