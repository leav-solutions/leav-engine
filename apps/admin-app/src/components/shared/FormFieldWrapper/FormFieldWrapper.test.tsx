// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import {create} from 'react-test-renderer';
import {Form} from 'semantic-ui-react';
import FormFieldWrapper from '../../shared/FormFieldWrapper';

describe('FormFieldWrapper', () => {
    const testInput = <Form.Input />;
    test('Snapshot test', async () => {
        const comp = create(<FormFieldWrapper>{testInput}</FormFieldWrapper>).toJSON();
        expect(comp).toMatchSnapshot();
    });

    test('Display no error if none', async () => {
        const comp = shallow(<FormFieldWrapper>{testInput}</FormFieldWrapper>);
        expect(comp.find('FormInput').prop('error')).toBe(false);
        expect(comp.find('Label').length).toBe(0);
    });

    test('Display error if any', async () => {
        const comp = shallow(<FormFieldWrapper error="ERROR MESSAGE">{testInput}</FormFieldWrapper>);
        expect(comp.find('FormInput').prop('error')).toBe(true);
        expect(
            comp
                .find('Label')
                .shallow()
                .text()
        ).toBe('ERROR MESSAGE');
    });
});
