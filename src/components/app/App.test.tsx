import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {Header} from 'semantic-ui-react';
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

test('renders Header', async () => {
    let component: any;
    await act(async () => {
        component = mount(<App token="" onTokenInvalid={jest.fn} />);
    });

    expect(component.find(Header)).toBeTruthy();
});
