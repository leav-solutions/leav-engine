import {mount, shallow} from 'enzyme';
import 'jest-styled-components';
import React from 'react';
import RecordPreview from './RecordPreview';

jest.mock('../../../../../utils/utils', () => ({
    getInvertColor: jest.fn().mockImplementation(() => '#FFFFFF'),
    stringToColor: jest.fn().mockImplementation(() => '#000000')
}));

describe('RecordPreview', () => {
    test('Show an image', async () => {
        const comp = shallow(<RecordPreview image="http://fake-image-url.com" label="TestLabel" />);

        expect(comp.find('img')).toHaveLength(1);
        expect(comp.find('img').prop('src')).toBe('http://fake-image-url.com');
    });

    test('Show initial with color if no image', async () => {
        const comp = mount(<RecordPreview color="#FF0000" label="TestLabel" />);

        expect(comp.find('img')).toHaveLength(0);
        expect(comp.find('GeneratedPreview')).toHaveLength(1);
        expect(comp.find('GeneratedPreview').text()).toBe('T');
    });

    test('Show initial with random color if no color', async () => {
        const comp = mount(<RecordPreview label="TestLabel" />);

        expect(comp.find('GeneratedPreview')).toHaveLength(1);
    });

    test('Show uppercase initial', async () => {
        const comp = shallow(<RecordPreview label="testLabel" />);

        expect(comp.find('GeneratedPreview').text()).toBe('T');
    });
});
