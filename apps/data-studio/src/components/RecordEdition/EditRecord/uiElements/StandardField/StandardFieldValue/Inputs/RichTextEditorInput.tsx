// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import InlineEditor from '@ckeditor/ckeditor5-build-inline';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import {IStandardInputProps} from 'components/RecordEdition/EditRecord/_types';

function RichTextEditorInput({state, fieldValue, onFocus, onChange}: IStandardInputProps): JSX.Element {
    const {editingValue} = fieldValue;

    const _handleOnChange = (event, editor) => {
        onChange(editor.getData());
    };

    const _handleOnFocus = (event, editor) => {
        onFocus();
    };

    const ckeditorStyle: React.CSSProperties = {
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#d9d9d9',
        background: 'white',
        borderRadius: '5px'
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
        <div style={ckeditorStyle} data-testid="ckeditor">
            <CKEditor
                editor={InlineEditor}
                config={configToolBar}
                data={editingValue.toString()}
                onChange={_handleOnChange}
                onFocus={_handleOnFocus}
            />
        </div>
    );
}

export default RichTextEditorInput;
