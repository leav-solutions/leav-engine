// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CheckCircleFilled, CheckCircleOutlined} from '@ant-design/icons';
import React from 'react';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {IRecordIdentityWhoAmI} from '_types/types';

const Wrapper = styled.div`
    display: grid;
    place-items: center;
    position: relative;
    height: 100%;
    width: 100%;
`;

const CustomCheckbox = styled.span<{checked: boolean}>`
    && {
        display: ${p => (!p.checked ? 'none' : 'block')};
        color: ${p => (p.checked ? `${themingVar['@primary-color']}` : themingVar['@default-text-color'])};

        .ant-checkbox-checked::after {
            border: none;
        }
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
            <CustomCheckbox checked={selected} onClick={onClick} role="checkbox">
                {selected ? <CheckCircleFilled /> : <CheckCircleOutlined />}
            </CustomCheckbox>
        </Wrapper>
    );
}

export default CellSelection;
