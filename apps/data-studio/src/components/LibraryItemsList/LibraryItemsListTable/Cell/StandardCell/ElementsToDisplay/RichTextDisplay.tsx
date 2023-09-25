// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import EllipsisOutlined from '@ant-design/icons/lib/icons/EllipsisOutlined';
import {Tooltip} from 'antd';
import parse from 'html-react-parser';
import styled from 'styled-components';
import DOMPurify from 'dompurify';

const EllipsisOutlinedComponent = styled(EllipsisOutlined)`
    border-width: 1px;
    border-style: solid;
    border-color: #d9d9d9;
    background: white;
    border-radius: 10px;
`;

export interface IRichTextDisplayProps {
    displayedValue: string;
}

function RichTextDisplay({displayedValue}: IRichTextDisplayProps): JSX.Element {
    const sanitizedDisplayedValue = DOMPurify.sanitize(displayedValue);
    const parseValue = parse(sanitizedDisplayedValue);

    return (
        <Tooltip overlay={parseValue}>
            <EllipsisOutlinedComponent />
        </Tooltip>
    );
}

export default RichTextDisplay;
