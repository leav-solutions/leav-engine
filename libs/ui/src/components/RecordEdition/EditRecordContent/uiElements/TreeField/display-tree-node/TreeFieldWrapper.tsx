import styled from 'styled-components';
import {INPUT_MAX_HEIGHT} from '../../../formConstants';

export const TreeFieldWrapper = styled.div`
    max-height: ${INPUT_MAX_HEIGHT};
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    gap: calc((var(--general-spacing-xxs)) * 1px);
`;
