import {shallow} from 'enzyme';
import {Location} from 'history';
import React from 'react';
import {GET_TREES_trees_list} from '../../../_gqlTypes/GET_TREES';
import {TreeBehavior} from '../../../_gqlTypes/globalTypes';
import {Mockify} from '../../../_types/Mockify';
import EditTreeForm from './EditTreeForm';

jest.mock('../../../utils/utils', () => ({
    formatIDString: jest.fn().mockImplementation(s => s),
    localizedLabel: jest.fn().mockImplementation(l => l.fr),
    getSysTranslationQueryLanguage: jest.fn().mockReturnValue(v => ['fr', 'fr'])
}));

jest.mock('../../../hooks/useLang');

describe('EditTreeForm', () => {
    test('Render form for existing tree', async () => {
        const tree: GET_TREES_trees_list = {
            id: 'test',
            label: {fr: 'Test', en: null},
            system: false,
            libraries: [
                {id: 'test_lib', label: null},
                {id: 'users', label: null}
            ],
            behavior: TreeBehavior.standard
        };
        const onSubmit = jest.fn();

        const onCheckIdExists = async () => true;

        const comp = shallow(
            <EditTreeForm readOnly onCheckIdExists={onCheckIdExists} tree={tree} onSubmit={onSubmit} />
        );

        expect(
            comp
                .find('Header')
                .shallow()
                .text()
        ).toBe('Test');
    });

    test('Render form for new tree', async () => {
        const onSubmit = jest.fn();

        const onCheckIdExists = async () => true;

        const comp = shallow(
            <EditTreeForm readOnly onCheckIdExists={onCheckIdExists} tree={null} onSubmit={onSubmit} />
        );

        expect(
            comp
                .find('Header')
                .shallow()
                .text()
        ).toBe('trees.new');
    });

    test('should open the tab in anchor', async () => {
        const tabName = 'structure';
        const mockLocation: Mockify<Location> = {
            hash: '#' + tabName
        };
        const onSubmit = jest.fn();

        const onCheckIdExists = async () => true;

        const comp = shallow(
            <EditTreeForm
                tree={null}
                onSubmit={onSubmit}
                readOnly
                onCheckIdExists={onCheckIdExists}
                location={mockLocation as Location}
            />
        );

        const activeIndex: number = comp.find('Tab').prop('activeIndex');
        const panes: any[] = comp.find('Tab').prop('panes');

        expect(panes.findIndex(p => p.key === tabName)).toBe(activeIndex);
    });
});
