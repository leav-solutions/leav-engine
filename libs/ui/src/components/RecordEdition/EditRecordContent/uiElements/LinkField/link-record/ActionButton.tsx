// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitButton} from 'aristid-ds';
import styled from 'styled-components';

export const ActionButton = styled(KitButton)<{$hasNoValue: boolean}>`
    margin-top: ${props => (props.$hasNoValue ? 0 : 'calc((var(--general-spacing-xs)) * 1px)')};
`;
