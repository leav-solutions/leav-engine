// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import {GET_LIB_BY_ID_libraries_list} from '_gqlTypes/GET_LIB_BY_ID';
import {SAVE_LIBRARYVariables, SAVE_LIBRARY} from '_gqlTypes/SAVE_LIBRARY';
import {JsonEditor} from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';
import {saveLibQuery} from 'queries/libraries/saveLibMutation';
import {useRef} from 'react';
import styled from 'styled-components';

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

interface ICustomConfigTabProps {
    library: GET_LIB_BY_ID_libraries_list | null;
}

function CustomConfigTab({library}: ICustomConfigTabProps): JSX.Element {
    const [saveLibrary, {error, loading}] = useMutation<SAVE_LIBRARY, SAVE_LIBRARYVariables>(saveLibQuery, {
        // Prevents Apollo from throwing an exception on error state. Errors are managed with the error variable
        fetchPolicy: 'network-only',
        onError: () => undefined
    });

    const _onChangeConfig = (value: Record<string, any>) => {
        const dataToSave = {
            libData: {
                id: library.id,
                settings: {...value}
            }
        };
        saveLibrary({
            variables: dataToSave
        });
    };

    return (
        <Wrapper>
            <JsonEditor
                mode="tree"
                value={library?.settings ?? ''}
                navigationBar={false}
                statusBar={false}
                onChange={_onChangeConfig}
                allowedModes={['code', 'tree']}
            />
        </Wrapper>
    );
}

export default CustomConfigTab;
