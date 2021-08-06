// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Checkbox} from 'antd';
import React from 'react';
import {useAppSelector} from 'redux/store';
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
    selectionData: ISharedSelected;
}

function CellSelection({selectionData}: ICellSelectionProps): JSX.Element {
    const {selectionState} = useAppSelector(state => ({
        selectionState: state.selection,
        display: state.display
    }));

    const allSelected =
        selectionState.selection.type === SharedStateSelectionType.search && selectionState.selection.allSelected;

    const selected =
        selectionState.selection.type === SharedStateSelectionType.search &&
        !!selectionState.selection.selected.find(e => e.id === selectionData.id && e.library === selectionData.library);

    return (
        <Wrapper>
            <span>
                <CustomCheckbox checked={allSelected || selected} />
            </span>
        </Wrapper>
    );
}

export default CellSelection;
