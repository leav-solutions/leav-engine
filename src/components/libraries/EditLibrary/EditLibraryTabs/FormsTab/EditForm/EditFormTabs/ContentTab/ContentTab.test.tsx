// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import React from 'react';
import ContentTab from './ContentTab';
import {formData} from './formBuilderReducer/_fixtures/fixtures';

jest.mock('./BreadcrumbNavigator', () => {
    return function BreadcrumbNavigator() {
        return <div>BreadcrumbNavigator</div>;
    };
});

jest.mock('./DependencySettings', () => {
    return function DependencySettings() {
        return <div>DependencySettings</div>;
    };
});

jest.mock('./ElementsReserve', () => {
    return function ElementsReserve() {
        return <div>ElementsReserve</div>;
    };
});

jest.mock('./FormLayout', () => {
    return function FormLayout() {
        return <div>FormLayout</div>;
    };
});

describe('ContentTab', () => {
    test('Snapshot test', async () => {
        const comp = render(<ContentTab library="test_lib" form={formData} />);

        expect(comp).toMatchSnapshot();
    });
});
