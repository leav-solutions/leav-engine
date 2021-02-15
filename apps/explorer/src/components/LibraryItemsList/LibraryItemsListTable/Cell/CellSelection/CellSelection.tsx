// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Checkbox} from 'antd';
import React from 'react';
import styled from 'styled-components';
import {useStateItem} from '../../../../../Context/StateItemsContext';
import themingVar from '../../../../../themingVar';
import {LibraryItemListReducerActionTypes} from '../../../LibraryItemsListReducer';

const Wrapper = styled.div`
    display: grid;
    place-items: center;
    position: relative;

    height: 100%;
    width: 100%;
`;

const CustomCheckbox = styled(Checkbox)`
    & > * {
        z-index: 10;
    }
`;

const HiddenCheckbox = styled.div`
    position: absolute;
    display: none;
    background-color: ${themingVar['@default-bg']};
    padding: 5px;
    z-index: 10;
`;

interface ICellSelectionProps {
    index: string;
    id: string;
}

function CellSelection({index, id}: ICellSelectionProps): JSX.Element {
    const {
        stateItems: {selectionMode, allSelected, itemsSelected},
        dispatchItems
    } = useStateItem();

    const handleChangeSelected = () => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_SELECTION_MODE,
            selectionMode: true
        });

        const newItemSelected = {...itemsSelected, [id]: !itemsSelected[id]};

        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_ITEMS_SELECTED,
            itemsSelected: newItemSelected
        });
    };

    if (selectionMode) {
        const isSelected = allSelected || itemsSelected[id];

        return (
            <Wrapper>
                <span>
                    <CustomCheckbox checked={isSelected} onClick={handleChangeSelected} />
                </span>
            </Wrapper>
        );
    }

    return (
        <Wrapper>
            <span>{index}</span>
            <HiddenCheckbox className="hidden-checkbox">
                <Checkbox onClick={handleChangeSelected} />
            </HiddenCheckbox>
        </Wrapper>
    );
}

export default CellSelection;
