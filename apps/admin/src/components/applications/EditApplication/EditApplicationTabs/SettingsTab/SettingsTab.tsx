// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import {useEditApplicationContext} from 'context/EditApplicationContext';
import {JsonEditor} from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';
import {saveApplicationMutation} from 'queries/applications/saveApplicationMutation';
import React from 'react';
import styled from 'styled-components';
import {SAVE_APPLICATION, SAVE_APPLICATIONVariables} from '_gqlTypes/SAVE_APPLICATION';

const Wrapper = styled.div`
    .jsoneditor {
        border: none;
    }

    .jsoneditor-menu {
        background-color: #ddd;
        border-color: #ddd;

        > button {
            background-color: #000;
            filter: invert(100%);
            opacity: 0.5;
        }

        .jsoneditor-modes {
            color: #000;
        }

        .jsoneditor-search {
            .jsoneditor-results {
                color: #000;
            }

            .jsoneditor-frame {
                background: none;

                input {
                    margin: 0 0.5em;
                    border-radius: 3px;
                    height: 100%;
                }

                button {
                    filter: invert(100%);
                    opacity: 0.5;
                }
            }
        }
    }
`;

function SettingsTab(): JSX.Element {
    const {application, readonly} = useEditApplicationContext();

    const [saveApplication, {error, loading}] = useMutation<SAVE_APPLICATION, SAVE_APPLICATIONVariables>(
        saveApplicationMutation,
        {
            // Prevents Apollo from throwing an exception on error state. Errors are managed with the error variable
            onError: () => undefined
        }
    );

    const _handleChange = (value: Record<string, any>) => {
        const dataToSave = {
            application: {
                id: application.id,
                settings: value
            }
        };

        saveApplication({
            variables: dataToSave
        });
    };

    return (
        <Wrapper>
            <JsonEditor
                mode={readonly ? 'view' : 'tree'}
                value={application?.settings ?? ''}
                navigationBar={false}
                statusBar={false}
                onChange={_handleChange}
                allowedModes={readonly ? [] : ['code', 'tree']}
            />
        </Wrapper>
    );
}

export default SettingsTab;
