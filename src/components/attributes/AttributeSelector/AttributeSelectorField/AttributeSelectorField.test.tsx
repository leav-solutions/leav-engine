import {shallow} from 'enzyme';
import React from 'react';
import {mockAttrAdv, mockAttrSimple} from '../../../../__mocks__/attributes';
import AttributeSelectorField from './AttributeSelectorField';

jest.mock('../../../../utils/utils', () => ({
    formatIDString: jest.fn().mockImplementation(s => s),
    localizedLabel: jest.fn().mockImplementation(l => l.fr),
    getSysTranslationQueryLanguage: jest.fn().mockReturnValue(v => ['fr', 'fr'])
}));

jest.mock('../../../../hooks/useLang');

describe('AttributesSelectorField', () => {
    test('Render dropdown with attributes', async () => {
        const attributes = [mockAttrAdv, mockAttrSimple];

        const comp = shallow(<AttributeSelectorField attributes={attributes} />);

        expect(comp.find('FormDropdown').prop('options')).toHaveLength(2);
    });
});
