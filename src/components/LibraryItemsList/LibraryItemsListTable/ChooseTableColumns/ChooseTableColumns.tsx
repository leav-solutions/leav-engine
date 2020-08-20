import {Button, Modal} from 'antd';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {IAttribute, IAttributesChecked, IItemsColumn} from '../../../../_types/types';
import ListAttributes from '../../../ListAttributes';
import {
    LibraryItemListReducerAction,
    LibraryItemListReducerActionTypes,
    LibraryItemListState
} from '../../LibraryItemsListReducer';

interface IChooseTableColumnsProps {
    stateItems: LibraryItemListState;
    dispatchItems: React.Dispatch<LibraryItemListReducerAction>;
    openChangeColumns: boolean;
    setOpenChangeColumns: (openChangeColumns: boolean) => void;
}

function ChooseTableColumns({
    stateItems,
    dispatchItems,
    openChangeColumns,
    setOpenChangeColumns
}: IChooseTableColumnsProps): JSX.Element {
    const {t} = useTranslation();

    const [attributesChecked, setAttributesChecked] = useState<IAttributesChecked[]>(
        stateItems.columns.map(col => {
            const currentAttribute = stateItems.attributes.find(
                attribute => attribute.id === col.id && attribute.library === col.library
            );

            return {
                id: col.id,
                library: col.library,
                label: currentAttribute?.label ?? '',
                type: col.type,
                depth: 0,
                checked: true
            };
        })
    );

    const [newAttributes, setNewAttributes] = useState<IAttribute[]>([]);

    const handleSubmit = () => {
        const noDuplicateNewAttribute = newAttributes.filter(
            newAttribute =>
                !stateItems.attributes.some(
                    attribute => attribute.id === newAttribute.id && attribute.library === newAttribute.library
                )
        );

        const allAttributes = [...stateItems.attributes, ...noDuplicateNewAttribute];

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_ATTRIBUTES,
            attributes: allAttributes
        });

        const newColumns: IItemsColumn[] = attributesChecked.reduce((acc, attributeChecked) => {
            if (attributeChecked.checked) {
                const attribute = allAttributes.find(
                    attribute => attribute.id === attributeChecked.id && attribute.library === attributeChecked.library
                );

                return [
                    ...acc,
                    {
                        id: attributeChecked.id,
                        library: attributeChecked.library,
                        type: attributeChecked.type,
                        originAttributeData: attribute?.originAttributeData,
                        extendedData: attributeChecked.extendedData,
                        treeData: attributeChecked.treeData
                    }
                ];
            }
            return acc;
        }, [] as IItemsColumn[]);

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_COLUMNS,
            columns: newColumns
        });

        setOpenChangeColumns(false);
    };

    const handleCancel = () => {
        setOpenChangeColumns(false);
    };

    return (
        <Modal
            visible={openChangeColumns}
            onCancel={() => setOpenChangeColumns(false)}
            title={t('table-columns-selection.header')}
            footer={[
                <Button key="Cancel" onClick={handleCancel}>
                    {t('table-columns-selection.cancel')}
                </Button>,
                <Button key="Submit" onClick={handleSubmit} type="primary">
                    {t('table-columns-selection.submit')}
                </Button>
            ]}
        >
            <ListAttributes
                attributes={stateItems.attributes}
                useCheckbox
                attributesChecked={attributesChecked}
                setAttributesChecked={setAttributesChecked}
                setNewAttributes={setNewAttributes}
            />
        </Modal>
    );
}

export default ChooseTableColumns;
