import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockedLangContextProvider from '../../../../../__mocks__/MockedLangContextProvider';
import NavigatorTab from './NavigatorTab';

const wait = () => {
    return new Promise((res, rej) => {
        setTimeout(res, 0);
    });
};

jest.mock('../../../../navigator/Navigator', () => {
    return function Navigator(props) {
        return <div>MOCK Navigator</div>;
    };
});

jest.mock('../../../../records/EditRecordModal', () => {
    return function EditRecordModal(props) {
        return <div>MOCK EditRecordModal</div>;
    };
});

const mockLibrary = {
    id: '',
    system: true,
    attributes: [],
    label: {fr: '', en: ''},
    gqlNames: {
        filter: '',
        list: '',
        query: '',
        searchableFields: '',
        type: '',
        __typename: ''
    },
    permissions_conf: null,
    recordIdentityConf: null,
    __typename: ''
};

const mockRecord = {
    color: null,
    id: '1',
    label: null,
    library: mockLibrary,
    preview: null,
    __typename: ''
};

describe('EditableNavigator', () => {
    test('renders the navigator', async () => {
        const comp = mount(
            <MockedLangContextProvider>
                <NavigatorTab library={mockLibrary} />
            </MockedLangContextProvider>
        );

        await act(async () => {
            await wait();
        });

        comp.update();
        const navigator = comp.find('Navigator');
        expect(navigator.length).toBe(1);
    });

    test('renders the Edit Record Modal when a record is set', async () => {
        const comp = mount(
            <MockedLangContextProvider>
                <NavigatorTab library={mockLibrary} />
            </MockedLangContextProvider>
        );

        await act(async () => {
            await wait();
        });
        comp.update();

        const navigator = comp.find('Navigator');
        const setRecord = navigator.prop('onEditRecordClick');

        await act(async () => {
            if (typeof setRecord === 'function') {
                setRecord(mockRecord);
            }
        });
        comp.update();

        const editModal = comp.find('EditRecordModal');
        expect(editModal.length).toBe(1);
    });
});
