import {mount} from 'enzyme';
import React from 'react';
import {Header} from 'semantic-ui-react';
import App from './App';

test('renders Header', () => {
    const component = mount(<App />);
    expect(component.find(Header)).toBeTruthy();
});
