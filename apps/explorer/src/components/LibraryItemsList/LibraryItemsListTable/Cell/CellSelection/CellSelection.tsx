// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Checkbox} from 'antd';
import React from 'react';
import styled from 'styled-components';
import {IRecordIdentityWhoAmI} from '_types/types';

const Wrapper = styled.div`
    display: grid;
    place-items: center;
    position: relative;
    height: 100%;
    width: 100%;
`;

const CustomCheckbox = styled(Checkbox)<{checked: boolean}>`
    && {
        display: ${p => (!p.checked ? 'none' : 'block')};
    }

    [role='row']:hover & {
        display: block;
    }
`;

interface ICellSelectionProps {
    record: IRecordIdentityWhoAmI;
    selected: boolean;
    onClick: () => void;
}

function CellSelection({record, onClick, selected}: ICellSelectionProps): JSX.Element {
    return (
        <Wrapper>
            <CustomCheckbox checked={selected} onClick={onClick} />
        </Wrapper>
    );
}

export default CellSelection;
