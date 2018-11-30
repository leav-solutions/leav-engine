import {shallow} from 'enzyme';
import * as React from 'react';
import RecordPreview from './RecordPreview';

describe('RecordPreview', () => {
    test('Show an image', async () => {
        const comp = shallow(<RecordPreview color={null} image="http://fake-image-url.com" label="TestLabel" />);

        expect(comp.find('Image')).toHaveLength(1);
        expect(comp.find('Image').prop('src')).toBe('http://fake-image-url.com');
    });

    test('Show initial with color if no image', async () => {
        const comp = shallow(<RecordPreview color="#FF0000" image={null} label="TestLabel" />);

        expect(comp.find('Image')).toHaveLength(0);
        expect(comp.find('div.initial')).toHaveLength(1);
        expect(comp.find('div.initial').text()).toBe('T');
        expect(comp.find('div.initial').props().style!.backgroundColor).toBe('#FF0000');
    });

    test('Show initial with random color if no color', async () => {
        const comp = shallow(<RecordPreview color={null} image={null} label="TestLabel" />);

        expect(comp.find('div.initial').props().style!.backgroundColor).toMatch(/^\#[0-9A-Fa-f]{6}$/);
    });

    test('Show uppercase initial', async () => {
        const comp = shallow(<RecordPreview color={null} image={null} label="testLabel" />);

        expect(comp.find('div.initial').text()).toBe('T');
    });
});
