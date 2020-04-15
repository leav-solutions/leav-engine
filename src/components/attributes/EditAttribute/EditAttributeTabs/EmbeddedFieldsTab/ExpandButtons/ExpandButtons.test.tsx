import {render} from 'enzyme';
import React from 'react';
import ExpandButtons from './ExpandButtons';

describe('EmbeddedFieldsWrapper', () => {
    test('should display two Button', async () => {
        const comp = render(<ExpandButtons flatItems={[]} setFlatItems={jest.fn} />);

        expect(comp.find('button')).toHaveLength(2);
    });
});
