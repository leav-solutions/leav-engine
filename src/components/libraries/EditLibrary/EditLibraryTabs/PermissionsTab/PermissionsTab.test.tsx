import {wait} from '@apollo/react-testing';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {saveLibQuery} from '../../../../../queries/libraries/saveLibMutation';
import {GET_LIBRARIES_libraries_list} from '../../../../../_gqlTypes/GET_LIBRARIES';
import {PermissionsRelation, Treepermissions_confInput} from '../../../../../_gqlTypes/globalTypes';
import {mockLibrary} from '../../../../../__mocks__/libraries';
import MockedProviderWithFragments from '../../../../../__mocks__/MockedProviderWithFragments';
import PermissionsTab from './PermissionsTab';

jest.mock(
    './PermissionsContent',
    () =>
        function PermissionsContent() {
            return <div>Permissions</div>;
        }
);

describe('PermissionsTab', () => {
    const library: GET_LIBRARIES_libraries_list = {
        ...mockLibrary,
        label: {fr: 'Test 1', en: null}
    };

    test('Render content', async () => {
        let comp;
        await act(async () => {
            comp = mount(<PermissionsTab library={library} readonly={false} />);
        });

        expect(comp.find('PermissionsContent')).toHaveLength(1);
    });

    test('Save data on submit', async () => {
        let saveQueryCalled = false;
        const permConfToSave: Treepermissions_confInput = {
            permissionTreeAttributes: ['tree1', 'tree2'],
            relation: PermissionsRelation.and
        };

        const mocks = [
            {
                request: {
                    query: saveLibQuery,
                    variables: {
                        libData: {id: library.id, permissions_conf: permConfToSave}
                    }
                },
                result: () => {
                    saveQueryCalled = true;
                    return {
                        data: {
                            saveLibrary: {
                                ...library,
                                __typename: 'Library'
                            }
                        }
                    };
                }
            }
        ];

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks}>
                    <PermissionsTab library={library} readonly={false} />
                </MockedProviderWithFragments>
            );
        });

        await act(async () => {
            await wait(0);
            comp.update();
        });

        const submitFunc: any = comp.find('PermissionsContent').prop('onSubmitSettings');
        if (!!submitFunc) {
            await act(async () => {
                await submitFunc({...permConfToSave});
                await wait(0);
            });
        }

        expect(saveQueryCalled).toBe(true);
    });
});
