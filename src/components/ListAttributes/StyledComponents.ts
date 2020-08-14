import {Collapse, Input, List} from 'antd';
import styled from 'styled-components';

export const WrapperAttribute = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
`;

export const TextAttribute = styled.span`
    color: hsl(0, 0%, 13%);
    font-weight: 700;
`;

export const SmallText = styled.span`
    color: hsl(0, 0%, 45%);
    font-weight: 400;
`;

export const ListItem = styled(List.Item)`
    &&&& {
        padding: 0.7rem 1rem;
        width: 100%;

        &:hover {
            background: hsla(205.7, 72.6%, 47.3%, 10%);
            border-radius: 0.25rem;
        }
    }
`;

export const CustomForm = styled.form`
    width: 100%;
`;

export const CustomInput = styled(Input.Search)`
    &&& {
        input {
            background: hsl(0, 0%, 95%);
            border: none;
        }
    }
`;

export const CustomAccordion = styled(Collapse)`
    width: 100%;
`;

export const CustomAccordionTitle = styled(Collapse)`
    & {
        width: 100%;
        padding: 0;
        display: flex;
        justify-content: start;
        align-items: center;
    }
`;

export const CustomAccordionContent = styled(Collapse.Panel)`
    width: 100%;
`;

export const WrapperContentAttribute = styled.div`
    border-left: 3px solid #2185d0;
`;

export const RowAttribute = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-left: 0.2rem;

    *:first-child > *:last-child {
        margin: 0 0.2rem;
    }
`;
