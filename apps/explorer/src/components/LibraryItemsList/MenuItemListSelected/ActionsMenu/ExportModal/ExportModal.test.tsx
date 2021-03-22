// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {exportQuery} from '../../../../../graphQL/queries/export/exportQuery';
import MockedProviderWithFragments from '../../../../../__mocks__/MockedProviderWithFragments';
import ExportModal from './ExportModal';

jest.mock('../../../../../hooks/ActiveLibHook/ActiveLibHook');

jest.mock('../../../../AttributesSelectionList', () => {
    return function AttributesSelectionList() {
        return <div>AttributesSelectionList</div>;
    };
});

describe('ExportModal', () => {
    test('Run export', async () => {
        const onClose = jest.fn();

        const mocks = [
            {
                request: {
                    query: exportQuery,
                    variables: {library: 'test_lib', attributes: ['id'], filters: []}
                },
                result: {
                    data: {
                        export: '/path/to/file.xls'
                    }
                }
            }
        ];

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks}>
                    <ExportModal open onClose={onClose} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('AttributesSelectionList')).toHaveLength(1);

        await act(async () => {
            comp.find('Button.submit-btn').simulate('click');
        });

        comp.update();

        expect(comp.find('div[data-test-id="done"]')).toHaveLength(1);
    });
});
