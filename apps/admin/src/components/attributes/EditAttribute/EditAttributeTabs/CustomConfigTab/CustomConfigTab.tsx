// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import {GET_ATTRIBUTE_BY_ID_attributes_list} from '_gqlTypes/GET_ATTRIBUTE_BY_ID';
import {SAVE_ATTRIBUTEVariables, SAVE_ATTRIBUTE} from '_gqlTypes/SAVE_ATTRIBUTE';
import {JsonEditor} from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';
import {saveAttributeQuery} from 'queries/attributes/saveAttributeMutation';
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
    attribute?: GET_ATTRIBUTE_BY_ID_attributes_list;
}

function CustomConfigTab({attribute}: ICustomConfigTabProps): JSX.Element {
    const customConfigData = useRef<SAVE_ATTRIBUTEVariables | null>(null);

    const [saveAttribute, {error, loading}] = useMutation<SAVE_ATTRIBUTE, SAVE_ATTRIBUTEVariables>(saveAttributeQuery, {
        // Prevents Apollo from throwing an exception on error state. Errors are managed with the error variable
        onError: () => undefined
    });

    const _onChange = (value: Record<string, any>) => {
        customConfigData.current = {
            attrData: {
                id: attribute.id,
                settings: value
            }
        };
    };

    const _saveChange = () => {
        if (customConfigData.current !== null) {
            saveAttribute({
                variables: customConfigData.current
            });
        }
    };
    return (
        <Wrapper>
            <JsonEditor
                mode="tree"
                value={attribute?.settings ?? ''}
                navigationBar={false}
                statusBar={false}
                onChange={_onChange}
                onBlur={_saveChange}
                allowedModes={['code', 'tree']}
            />
        </Wrapper>
    );
}

export default CustomConfigTab;
