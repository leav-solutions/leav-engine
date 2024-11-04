// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {Button, Modal} from 'antd';
import {useState} from 'react';
import AttributesSelectionList from '_ui/components/AttributesSelectionList';
import useSearchReducer from '_ui/components/LibraryItemsList/hooks/useSearchReducer';
import {SearchActionTypes} from '_ui/components/LibraryItemsList/hooks/useSearchReducer/searchReducer';
import useLang from '_ui/hooks/useLang';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ISelectedAttribute} from '_ui/types/attributes';
import {IAttribute, IField} from '_ui/types/search';
import {AttributeFormat, AttributeType} from '_ui/_gqlTypes';
import {getFieldsKeyFromAttribute} from '../../helpers/getFieldsKeyFromAttribute';

interface IChooseTableColumnsProps {
    visible: boolean;
    onClose: () => void;
}

function ChooseTableColumns({visible, onClose}: IChooseTableColumnsProps): JSX.Element {
    const {t} = useSharedTranslation();
    const {lang} = useLang();
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
            open={visible}
            onCancel={_handleCancel}
            title={t('table-columns-selection.header')}
            width="70rem"
            centered
            footer={[
                <Button key="Cancel" onClick={_handleCancel}>
                    {t('table-columns-selection.cancel')}
                </Button>,
                <Button type="primary" key="Submit" onClick={handleSubmit}>
                    {t('table-columns-selection.submit')}
                </Button>
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
