import {useSaveLibraryMutation} from '../../../../../_gqlTypes';
import {type GET_LIB_BY_ID_libraries_list} from '../../../../../_gqlTypes/GET_LIB_BY_ID';
import {JsonEditor} from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';
import styled from 'styled-components';

const Wrapper = styled.div`
    .jsoneditor {
        border: none;
        textarea.jsoneditor-text {
            height: 70vh;
        }
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
    const [saveLibrary, {error, loading}] = useSaveLibraryMutation();

    const _onChangeConfig = (value: Record<string, any>) => {
        const dataToSave = {
            libData: {
                id: library.id,
                settings: {...value},
            },
        };
        saveLibrary({
            variables: dataToSave,
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
