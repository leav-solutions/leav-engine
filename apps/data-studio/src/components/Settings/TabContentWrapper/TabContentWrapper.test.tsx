// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_tests/testUtils';
import TabContentWrapper from './TabContentWrapper';

describe('TabContentWrapper', () => {
    test('Render children', async () => {
        render(
            <TabContentWrapper>
                <div>Foo</div>
            </TabContentWrapper>
        );

        expect(screen.getByText('Foo')).toBeInTheDocument();
    });
});
