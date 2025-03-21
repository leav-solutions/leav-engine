// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import styled from 'styled-components';
import {INPUT_MAX_HEIGHT} from '../../../formConstants';

export const TreeFieldWrapper = styled.div`
    max-height: ${INPUT_MAX_HEIGHT};
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    gap: calc((var(--general-spacing-xxs)) * 1px);
`;
