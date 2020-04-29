import {render} from 'enzyme';
import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import SideBarMenu from './SideBarMenu';

describe('SideBarMenu', () => {
    test('Snapshot test', async () => {
        const comp = render(
            <BrowserRouter>
                <SideBarMenu visible={true} />
            </BrowserRouter>
        );

        expect(comp).toBeTruthy();
    });
});
