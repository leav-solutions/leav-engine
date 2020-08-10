import {mount} from 'enzyme';
import React from 'react';
import {IItem} from '../../../../../../_types/types';
import FormPreviewsModal from './FormPreviewsModal';

describe('FormPreviewModal', () => {
    test('should render FormPreviewModal for each previews', async () => {
        const comp = mount(<FormPreviewsModal values={{} as IItem} updateValues={jest.fn()} />);

        expect(comp.find('FormPreviewModal')).toHaveLength(4);
    });
});
