import {type ComponentProps, type FunctionComponent} from 'react';
import {KitSelect} from 'aristid-ds';
import styled from 'styled-components';

const SelectStyled = styled(KitSelect)`
    width: 100%;
`;

// Select plein-largeur, sans allowClear : un filtre a toujours une condition (pas de croix de reset),
// et les selects du dropdown doivent occuper toute la largeur disponible.
export const FilterSelect: FunctionComponent<ComponentProps<typeof KitSelect>> = ({allowClear = false, ...props}) => (
    <SelectStyled allowClear={allowClear} {...props} />
);
