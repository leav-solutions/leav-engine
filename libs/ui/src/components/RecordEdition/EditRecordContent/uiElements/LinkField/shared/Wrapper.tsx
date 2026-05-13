import styled from 'styled-components';

export const Wrapper = styled.div<{$metadataEdit: boolean}>`
    margin-bottom: ${props => (props.$metadataEdit ? 0 : '1.5em')};
`;
