import {render} from 'enzyme';
import React from 'react';
import {IItem} from '../../../../../../_types/types';
import FormPreviewsModal from './FormPreviewsModal';

describe('FormPreviewModal', () => {
    test('should render FormPreviewModal ', async () => {
        const comp = render(<FormPreviewsModal values={{} as IItem} setValues={jest.fn()} />);

        expect(comp).toMatchSnapshot();
    });
});
