// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount, shallow} from 'enzyme';
import 'jest-styled-components';
import React from 'react';
import RecordPreview from './RecordPreview';

jest.mock('../../../utils/utils', () => ({
    getInvertColor: jest.fn().mockImplementation(() => '#FFFFFF'),
    stringToColor: jest.fn().mockImplementation(() => '#000000')
}));

describe('RecordPreview', () => {
    test('Show an image', async () => {
        const comp = shallow(<RecordPreview color={null} image="http://fake-image-url.com" label="TestLabel" />);

        expect(comp.find('Image')).toHaveLength(1);
        expect(comp.find('Image').prop('src')).toBe('http://fake-image-url.com');
    });

    test('Show initial with color if no image', async () => {
        const comp = mount(<RecordPreview color="#FF0000" image={null} label="TestLabel" />);

        expect(comp.find('Image')).toHaveLength(0);
        expect(comp.find('GeneratedPreview')).toHaveLength(1);
        expect(comp.find('GeneratedPreview').text()).toBe('T');
        expect(comp.find('GeneratedPreview')).toHaveStyleRule('background-color', '#FF0000');
    });

    test('Show initial with random color if no color', async () => {
        const comp = mount(<RecordPreview color={null} image={null} label="TestLabel" />);

        expect(comp.find('GeneratedPreview')).toHaveStyleRule('background-color', /^#[0-9A-Fa-f]{6}$/);
    });

    test('Show uppercase initial', async () => {
        const comp = shallow(<RecordPreview color={null} image={null} label="testLabel" />);

        expect(comp.find('GeneratedPreview').text()).toBe('T');
    });
});
