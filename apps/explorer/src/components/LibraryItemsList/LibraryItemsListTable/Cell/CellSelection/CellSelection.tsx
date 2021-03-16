// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Checkbox} from 'antd';
import {toggleSharedElementSelected} from 'hooks/SharedStateHook/SharedReducerActions';
import useStateShared from 'hooks/SharedStateHook/SharedReducerHook';
import {SharedStateSelectionType} from 'hooks/SharedStateHook/SharedStateReducer';
import React from 'react';
import styled from 'styled-components';
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
    id: string;
    library: string;
}

function CellSelection({index, id, library}: ICellSelectionProps): JSX.Element {
    const {stateShared, dispatchShared} = useStateShared();

    const handleChangeSelected = () => {
        const newElementSelected = {id, library};

        dispatchShared(toggleSharedElementSelected(SharedStateSelectionType.recherche, newElementSelected));
    };

    if (stateShared.selection.selected.length) {
        const allSelected =
            stateShared.selection.type === SharedStateSelectionType.recherche && stateShared.selection.allSelected;
        const isSelected =
            allSelected ||
            stateShared.selection.selected.some(
                elementSelected => elementSelected.id === id && elementSelected.library === library
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
            <HiddenCheckbox className="hidden-checkbox">
                <Checkbox onClick={handleChangeSelected} />
            </HiddenCheckbox>
        </Wrapper>
    );
}

export default CellSelection;
