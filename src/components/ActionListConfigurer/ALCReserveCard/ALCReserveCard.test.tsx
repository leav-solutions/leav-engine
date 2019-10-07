import React from 'react';
import {render} from 'enzyme';
import ALCReserveCard from './ALCReserveCard';

describe('ALCReserveCard', () => {
    test('Snapshot test', async () => {
        const comp = render(<ALCReserveCard />);

        expect(comp).toMatchSnapshot();
    });
});