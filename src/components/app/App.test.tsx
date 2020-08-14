import {PageHeader} from 'antd';
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

test('renders PageHeader', async () => {
    let component: any;
    await act(async () => {
        component = mount(<App token="" onTokenInvalid={jest.fn} />);
    });

    expect(component.find(PageHeader)).toBeTruthy();
});
