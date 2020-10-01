import {render} from 'enzyme';
import React from 'react';
import {mockTree} from '../../../../../../../../../../__mocks__/trees';
import {initialState} from '../../formBuilderReducer/_fixtures/fixtures';
import BreadcrumbNavigatorView from './BreadcrumbNavigatorView';

jest.mock('./BreadcrumbSection', () => {
    return function BreadcrumbSection() {
        return <div>BreadcrumbSection</div>;
    };
});

describe('BreadcrumbNavigatorView', () => {
    test('Snapshot test', async () => {
        const comp = render(<BreadcrumbNavigatorView treeData={mockTree} dispatch={jest.fn()} state={initialState} />);

        expect(comp).toMatchSnapshot();
    });
});
