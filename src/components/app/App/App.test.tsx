// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import ReactDOM from 'react-dom';
import App from '.';

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App token="12346798" onTokenInvalid={jest.fn()} />, div);
    ReactDOM.unmountComponentAtNode(div);
});
