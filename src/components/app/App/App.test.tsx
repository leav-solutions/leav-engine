import React from 'react';
import ReactDOM from 'react-dom';
import App from '.';

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App token="12346798" onTokenInvalid={jest.fn()} />, div);
    ReactDOM.unmountComponentAtNode(div);
});
