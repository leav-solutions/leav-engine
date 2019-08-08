import React from 'react';
import {render, mount} from 'enzyme';
import AuthHandler from './AuthHandler';

import Login from '../Login';
import App from '../../app/App';

const globalAny: any = global;

const localStorageMock = {
    setItem: jest.fn()
};

globalAny.localStorage = localStorageMock;

test('Snapshot test', async () => {
    const comp = render(<AuthHandler url={process.env.REACT_APP_AUTH_URL || ''} />);
    expect(comp).toMatchSnapshot();
});

test('renders login if no token in local storage, app otherwise', async () => {
    globalAny.localStorage.clear();
    const wrapper = mount(<AuthHandler url={process.env.REACT_APP_AUTH_URL || ''} />);
    const loginComp = render(<Login />);
    const app = render(<App />);
    expect(wrapper.childAt(0).contains(loginComp));
    globalAny.localStorage.setItem('accessToken', '1');
    wrapper.update();
    expect(wrapper.childAt(0).contains(app));
});
