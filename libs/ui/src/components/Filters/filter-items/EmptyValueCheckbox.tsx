// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import styled from 'styled-components';
import {KitCheckbox} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type UIFilter} from '../_types';

interface IEmptyValueCheckboxProps {
    filter: UIFilter;
    onSelect: (selected: boolean) => void;
}

const CheckboxStyled = styled(KitCheckbox)`
    font-style: italic;
    padding-left: 3px;
`;

export const EmptyValueCheckbox: FunctionComponent<IEmptyValueCheckboxProps> = ({filter, onSelect}) => {
    const {t} = useSharedTranslation();

    const onChange = () => {
        onSelect(!filter.withEmptyValues);
    };

    return (
        <CheckboxStyled checked={filter.withEmptyValues} onChange={onChange}>
            {t('explorer.empty_value')}
        </CheckboxStyled>
    );
};
