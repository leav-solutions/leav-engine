import {Form, Input} from 'antd';
import React, {useState} from 'react';
import styled from 'styled-components';
import {IFilter} from '../../../../../_types/types';

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

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = (event.target.value ?? '').toString();
        updateFilterValue(newValue);

        const rows = newValue.split('\n').length;

        setTextAreaRows(rows <= 10 ? rows : 10);
    };

    return (
        <CustomForm>
            <TextAreaWrapper>
                <Input.TextArea rows={textAreaRows} value={filter.value} onChange={e => handleChange(e)} />
            </TextAreaWrapper>
        </CustomForm>
    );
};

export default FormText;
