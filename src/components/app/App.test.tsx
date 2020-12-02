// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import App from './App';

jest.mock('i18next', () => ({
    use: jest.fn(() => ({
        use: jest.fn(() => ({
            use: jest.fn(() => ({
                init: jest.fn()
            }))
        }))
    }))
}));

jest.mock(
    './ThemeHandler',
    () =>
        function ThemeHandler() {
            return <div>ThemeHandler</div>;
        }
);

test('renders PageHeader', async () => {
    let component: any;
    await act(async () => {
        component = mount(<App token="" onTokenInvalid={jest.fn} />);
    });

    expect(component.find('ThemeHandler')).toBeTruthy();
});
