// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import {GET_TREE_BY_ID_trees_list} from '_gqlTypes/GET_TREE_BY_ID';
import {SAVE_TREEVariables, SAVE_TREE} from '_gqlTypes/SAVE_TREE';
import {JsonEditor} from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';
import {saveTreeQuery} from 'queries/trees/saveTreeMutation';
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
    tree: GET_TREE_BY_ID_trees_list | null;
}

function CustomConfigTab({tree}: ICustomConfigTabProps): JSX.Element {
    const [saveTree, {error, loading}] = useMutation<SAVE_TREE, SAVE_TREEVariables>(saveTreeQuery);

    const _onChange = (value: Record<string, any>) => {
        const dataToSave = {
            treeData: {
                id: tree.id,
                settings: value
            }
        };
        saveTree({
            variables: dataToSave
        });
    };

    return (
        <Wrapper>
            <JsonEditor
                mode="tree"
                value={tree?.settings ?? ''}
                navigationBar={false}
                statusBar={false}
                onChange={_onChange}
                allowedModes={['code', 'tree']}
            />
        </Wrapper>
    );
}

export default CustomConfigTab;
