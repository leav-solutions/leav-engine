// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import InlineEditor from '@ckeditor/ckeditor5-build-inline';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import styled from 'styled-components';
import {IStandardInputProps} from '_ui/components/RecordEdition/EditRecordContent/_types';

// TODO: should be clean due to support with DS?
const CkeditorComponent = styled.div<{$isEditing: boolean}>`
    border-width: 1px;
    border-style: solid;
    border-color: #d9d9d9;
    background: ${props => (props.$isEditing ? 'white' : '')};
    border-radius: 5px;
    height: 100%;
    position: relative;
    z-index: 1;
`;

function RichTextEditorInput({state, fieldValue, onFocus, onChange}: IStandardInputProps): JSX.Element {
    const {isEditing, editingValue} = fieldValue;

    const _handleOnChange = (event, editor) => {
        onChange(editor.getData());
    };

    const _handleOnFocus = (event, editor) => {
        onFocus();
    };

    const configToolBar = {
        toolbar: {
            items: [
                'undo',
                'redo',
                '|',
                'heading',
                '|',
                'bold',
                'italic',
                '|',
                'link',
                'blockQuote',
                'insertTable',
                '|',
                'bulletedList',
                'numberedList',
                'outdent',
                'indent'
            ]
        }
    };

    return (
        <CkeditorComponent data-testid="ckeditor" $isEditing={isEditing}>
            <CKEditor
                editor={InlineEditor}
                config={configToolBar}
                data={editingValue.toString()}
                onChange={_handleOnChange}
                onFocus={_handleOnFocus}
            />
        </CkeditorComponent>
    );
}

export default RichTextEditorInput;
