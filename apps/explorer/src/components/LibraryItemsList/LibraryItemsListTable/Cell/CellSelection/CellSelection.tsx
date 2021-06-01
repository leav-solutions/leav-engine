// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Checkbox} from 'antd';
import {SelectionModeContext} from 'context';
import React, {useContext} from 'react';
import {setSelectionToggleSearchSelectionElement, setSelectionToggleSelected} from 'redux/selection';
import {useAppDispatch, useAppSelector} from 'redux/store';
import styled from 'styled-components';
import {ISharedSelected, SharedStateSelectionType} from '_types/types';
import themingVar from '../../../../../themingVar';

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
    selectionData: ISharedSelected;
}

function CellSelection({index, selectionData}: ICellSelectionProps): JSX.Element {
    const {selectionState, display} = useAppSelector(state => ({
        selectionState: state.selection,
        display: state.display
    }));
    const dispatch = useAppDispatch();
    const selectionMode = useContext(SelectionModeContext);

    const handleChangeSelected = () => {
        if (selectionMode) {
            dispatch(setSelectionToggleSearchSelectionElement(selectionData));
        } else {
            dispatch(
                setSelectionToggleSelected({
                    selectionType: SharedStateSelectionType.search,
                    elementSelected: selectionData
                })
            );
        }
    };

    if (selectionState.selection.selected.length || selectionState.searchSelection.selected.length) {
        const allSelected =
            selectionState.selection.type === SharedStateSelectionType.search && selectionState.selection.allSelected;

        const isSelected = selectionMode
            ? selectionState.searchSelection.selected.some(
                  elementSelected =>
                      elementSelected.id === selectionData.id && elementSelected.library === selectionData.library
              )
            : allSelected ||
              selectionState.selection.selected.some(
                  elementSelected =>
                      elementSelected.id === selectionData.id && elementSelected.library === selectionData.library
              );

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
            <HiddenCheckbox data-testid="hidden-checkbox" className="hidden-checkbox">
                <Checkbox onClick={handleChangeSelected} />
            </HiddenCheckbox>
        </Wrapper>
    );
}

export default CellSelection;
