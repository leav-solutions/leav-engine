// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSaveAttributeMutation} from '_gqlTypes';
import {type GET_ATTRIBUTE_BY_ID_attributes_list} from '_gqlTypes/GET_ATTRIBUTE_BY_ID';
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
    attribute?: GET_ATTRIBUTE_BY_ID_attributes_list;
}

function CustomConfigTab({attribute}: ICustomConfigTabProps): JSX.Element {
    const [saveAttribute, {error, loading}] = useSaveAttributeMutation();

    const _onChange = (value: Record<string, any>) => {
        const dataToSave = {
            attrData: {
                id: attribute.id,
                settings: value,
            },
        };
        saveAttribute({
            variables: dataToSave,
        });
    };

    return (
        <Wrapper>
            <JsonEditor
                mode="tree"
                value={attribute?.settings ?? ''}
                navigationBar={false}
                statusBar={false}
                onChange={_onChange}
                allowedModes={['code', 'tree']}
            />
        </Wrapper>
    );
}

export default CustomConfigTab;
