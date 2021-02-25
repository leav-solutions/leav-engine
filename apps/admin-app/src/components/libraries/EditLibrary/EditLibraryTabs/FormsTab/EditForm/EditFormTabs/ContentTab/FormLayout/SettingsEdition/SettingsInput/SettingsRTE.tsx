// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import RichTextEditor from 'react-rte';
import styled from 'styled-components';
import {useFormBuilderReducer} from '../../../formBuilderReducer/hook/useFormBuilderReducer';
import {IFormElementSettings, SettingsOnChangeFunc} from '../../../_types';

interface ISettingsRTEProps {
    onChange: SettingsOnChangeFunc;
    settingsField: IFormElementSettings;
}

const EditorWrapper = styled.div`
    .rte-editor-toolbar select {
        padding: 3px 25px 3px 3px;
        background: transparent;
    }
`;

function SettingsRTE({settingsField, onChange}: ISettingsRTEProps): JSX.Element {
    const {t} = useTranslation();
    const {
        state: {elementInSettings}
    } = useFormBuilderReducer();

    const [editorState, setEditorState] = useState(
        RichTextEditor.createValueFromString(
            String(elementInSettings?.settings?.[settingsField.name] ?? ''),
            'markdown'
        )
    );

    const _handleBlur = () => {
        onChange(settingsField.name, editorState.toString('markdown'));
    };

    return (
        <EditorWrapper data-testid="rte-editor-wrapper">
            <RichTextEditor
                value={editorState}
                onChange={setEditorState}
                //@ts-ignore
                onBlur={_handleBlur}
                toolbarConfig={{
                    display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS', 'BLOCK_TYPE_DROPDOWN', 'HISTORY_BUTTONS'],
                    INLINE_STYLE_BUTTONS: [
                        {label: t('forms.rte.bold'), style: 'BOLD'},
                        {label: t('forms.rte.italic'), style: 'ITALIC'}
                    ],
                    BLOCK_TYPE_DROPDOWN: [
                        {label: t('forms.rte.normal'), style: 'unstyled', className: 'normal_text'},
                        {label: t('forms.rte.header1'), style: 'header-one'},
                        {label: t('forms.rte.header2'), style: 'header-two'},
                        {label: t('forms.rte.header3'), style: 'header-three'}
                    ],
                    BLOCK_TYPE_BUTTONS: [
                        {label: t('forms.rte.ul'), style: 'unordered-list-item'},
                        {label: t('forms.rte.ol'), style: 'ordered-list-item'}
                    ]
                }}
                toolbarClassName="rte-editor-toolbar"
            />
        </EditorWrapper>
    );
}

export default SettingsRTE;
