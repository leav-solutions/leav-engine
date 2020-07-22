import React, {useState} from 'react';
import styled from 'styled-components';
import {IFilter} from '../../../../../_types/types';
import {TextAreaProps, Form, TextArea} from 'semantic-ui-react';

const TextAreaWrapper = styled.div`
    margin: 1rem 0 0 0;
`;

const CustomForm = styled(Form)`
    width: 100%;
`;

interface IFromTextProps {
    filter: IFilter;
    updateFilterValue: (newValue: any) => void;
}

const FormText = ({filter, updateFilterValue}: IFromTextProps) => {
    const [textAreaRows, setTextAreaRows] = useState<number>(1);

    const handleChange = (event: React.FormEvent<HTMLTextAreaElement>, data: TextAreaProps) => {
        const newValue = (data?.value ?? '').toString();
        updateFilterValue(newValue);

        const rows = newValue.split('\n').length;

        setTextAreaRows(rows <= 10 ? rows : 10);
    };

    return (
        <CustomForm>
            <TextAreaWrapper>
                <TextArea rows={textAreaRows} value={filter.value} onChange={handleChange} />
            </TextAreaWrapper>
        </CustomForm>
    );
};

export default FormText;
