// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button, Modal} from 'antd';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useStateItem} from '../../../../Context/StateItemsContext';
import {IAttribute, IAttributesChecked, IItemsColumn} from '../../../../_types/types';
import ListAttributes from '../../../ListAttributes';
import {LibraryItemListReducerActionTypes} from '../../LibraryItemsListReducer';

interface IChooseTableColumnsProps {
    openChangeColumns: boolean;
    setOpenChangeColumns: (openChangeColumns: boolean) => void;
}

function ChooseTableColumns({openChangeColumns, setOpenChangeColumns}: IChooseTableColumnsProps): JSX.Element {
    const {t} = useTranslation();

    const {stateItems, dispatchItems} = useStateItem();

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

    useEffect(() => {
        setAttributesChecked(
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
    }, [stateItems.attributes, stateItems.columns, setAttributesChecked]);

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

    // hack to disable warning "Droppable: unsupported nested scroll container" from react-beautiful-dnd,
    // remove "overflow: auto" on class "ant-modal-wrap"
    const elements: any = document.getElementsByClassName('ant-modal-wrap');
    if (elements.length) {
        elements[0].style.overflow = 'initial';
    }

    return (
        <Modal
            visible={openChangeColumns}
            onCancel={() => setOpenChangeColumns(false)}
            title={t('table-columns-selection.header')}
            width="70rem"
            centered
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
