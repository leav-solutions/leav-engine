import {MockedProvider, wait} from '@apollo/react-testing';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {getLibsQuery} from '../../../queries/libraries/getLibrariesQuery';
import {mockLibrary} from '../../../__mocks__/libraries';
import SelectRecordModal from './SelectRecordModal';

jest.mock(
    '../SelectRecord',
    () =>
        function SelectRecord() {
            return <div>Select record</div>;
        }
);

describe('SelectRecordModal', () => {
    const mocks = [
        {
            request: {
                query: getLibsQuery,
                variables: {id: 'test_lib'}
            },
            result: {
                data: {
                    libraries: {
                        __typename: 'LibrariesList',
                        totalCount: 1,
                        list: [
                            {
                                ...mockLibrary
                            }
                        ]
                    }
                }
            }
        }
    ];

    const onClose = jest.fn();
    const onSelect = jest.fn();
    test('Loading and success state', async () => {
        let comp;
        await act(async () => {
            comp = mount(
                <MockedProvider mocks={[...mocks]} addTypename>
                    <SelectRecordModal open library="test_lib" onClose={onClose} onSelect={onSelect} />
                </MockedProvider>
            );
        });

        expect(comp.find('Modal')).toHaveLength(1);
        expect(comp.find('Modal').prop('open')).toBe(true);
        expect(comp.find('Loading')).toHaveLength(1);

        await act(async () => {
            await wait(0);
            comp.update();
        });

        expect(comp.find('SelectRecord')).toHaveLength(1);
    });

    test('Call on close', async () => {
        let comp;
        await act(async () => {
            comp = mount(
                <MockedProvider mocks={[...mocks]} addTypename>
                    <SelectRecordModal open library="test_lib" onClose={onClose} onSelect={onSelect} />
                </MockedProvider>
            );
        });

        act(() => {
            comp.find('Button[data-test-id="select-record-modal-close-btn"]').simulate('click');
        });

        await wait(0);

        expect(onClose).toBeCalled();
    });
});
