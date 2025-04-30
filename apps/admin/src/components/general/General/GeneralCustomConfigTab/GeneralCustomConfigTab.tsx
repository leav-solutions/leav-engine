// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation, useQuery} from '@apollo/client';
import {GET_GLOBAL_SETTINGS} from '_gqlTypes/GET_GLOBAL_SETTINGS';
import {SAVE_GLOBAL_SETTINGS, SAVE_GLOBAL_SETTINGSVariables} from '_gqlTypes/SAVE_GLOBAL_SETTINGS';
import Loading from 'components/shared/Loading';
import {JsonEditor} from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';
import {getGlobalSettingsQuery} from 'queries/globalSettings/getGlobalSettingsQuery';
import {saveGlobalSettingsQuery} from 'queries/globalSettings/saveGlobalSettingsMutation';
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

function GeneralCustomConfigTab(): JSX.Element {
    const {
        data,
        loading: getLoading,
        error: getError
    } = useQuery<GET_GLOBAL_SETTINGS>(getGlobalSettingsQuery, {
        fetchPolicy: 'no-cache'
    });
    const [saveGlobalSettings, {loading: saveLoading, error: saveError}] = useMutation<
        SAVE_GLOBAL_SETTINGS,
        SAVE_GLOBAL_SETTINGSVariables
    >(saveGlobalSettingsQuery);

    const _onChange = (value: Record<string, any>) => {
        const dataToSave = {
            settings: {
                settings: value
            }
        };
        saveGlobalSettings({
            variables: dataToSave
        });
    };

    if (getLoading) {
        return <Loading />;
    }

    return (
        <Wrapper>
            <JsonEditor
                mode="tree"
                value={data?.globalSettings?.settings ?? ''}
                navigationBar={false}
                statusBar={false}
                onChange={_onChange}
                allowedModes={['code', 'tree']}
            />
        </Wrapper>
    );
}

export default GeneralCustomConfigTab;
