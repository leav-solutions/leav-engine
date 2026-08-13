import {useGetGlobalSettingsQuery, useSaveGlobalSettingsMutation} from '../../../../_gqlTypes';
import Loading from '../../../shared/Loading';
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

function GeneralCustomConfigTab(): JSX.Element {
    const {data, loading: getLoading} = useGetGlobalSettingsQuery({
        fetchPolicy: 'no-cache',
    });
    const [saveGlobalSettings] = useSaveGlobalSettingsMutation();

    const _onChange = (value: Record<string, any>) => {
        const dataToSave = {
            settings: {
                settings: value,
            },
        };
        saveGlobalSettings({
            variables: dataToSave,
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
