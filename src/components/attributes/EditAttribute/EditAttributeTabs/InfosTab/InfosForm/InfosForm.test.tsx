// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {wait} from '@apollo/react-testing';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import {GET_ATTRIBUTES_attributes_list} from '../../../../../../_gqlTypes/GET_ATTRIBUTES';
import {AttributeType} from '../../../../../../_gqlTypes/globalTypes';
import {mockAttrSimple} from '../../../../../../__mocks__/attributes';
import InfosForm from './InfosForm';

jest.mock('../../../../../../utils', () => ({
    formatIDString: jest.fn().mockImplementation(s => s),
    localizedLabel: jest.fn().mockImplementation(l => l.fr),
    getSysTranslationQueryLanguage: jest.fn().mockReturnValue(['fr', 'fr']),
    getFieldError: jest.fn().mockReturnValue('')
}));

jest.mock('../../../../../../hooks/useLang');

describe('InfosForm', () => {
    const attribute: GET_ATTRIBUTES_attributes_list = {
        ...mockAttrSimple,
        label: {fr: 'Test 1', en: null}
    };
    const onSubmit = jest.fn();
    const onCheckIdExists = jest.fn().mockReturnValue(false);

    test('If attribute exists, ID and type are not editable', async () => {
        const comp = mount(
            <InfosForm
                attribute={attribute}
                readonly={false}
                onSubmitInfos={onSubmit}
                onCheckIdExists={onCheckIdExists}
            />
        );

        expect(comp.find('FormInput[name="id"]').prop('disabled')).toBe(true);
        expect(comp.find('FormSelect[name="type"]').prop('disabled')).toBe(true);
    });

    test('If attribute is new, ID and type are editable', async () => {
        const comp = mount(
            <InfosForm attribute={null} readonly={false} onSubmitInfos={onSubmit} onCheckIdExists={onCheckIdExists} />
        );

        expect(comp.find('FormInput[name="id"]').prop('disabled')).toBe(false);
        expect(comp.find('FormSelect[name="type"]').prop('disabled')).toBe(false);
    });

    test('If readonly, inputs are disabled', async () => {
        const comp = mount(
            <InfosForm attribute={attribute} readonly onSubmitInfos={onSubmit} onCheckIdExists={onCheckIdExists} />
        );

        expect(comp.find('FormInput[name="label.fr"]').prop('disabled')).toBe(true);
    });

    test('Calls onSubmit function', async () => {
        const comp = mount(
            <InfosForm
                attribute={attribute}
                readonly={false}
                onSubmitInfos={onSubmit}
                onCheckIdExists={onCheckIdExists}
            />
        );

        await act(async () => {
            comp.find('form').simulate('submit');
        });

        expect(onSubmit).toBeCalled();
    });

    test('Autofill ID with label on new attribute', async () => {
        const comp = renderer.create(
            <InfosForm attribute={null} readonly={false} onSubmitInfos={onSubmit} onCheckIdExists={onCheckIdExists} />
        );

        renderer.act(() => {
            comp.root.findByProps({name: 'label.fr'}).props.onChange(null, {
                type: 'text',
                name: 'label.fr',
                value: 'labelfr'
            });
        });

        expect(comp.root.findByProps({name: 'id'}).props.value).toBe('labelfr');
    });

    test('Validate ID unicity', async () => {
        const _idNotUnique = jest.fn().mockResolvedValue(false);

        const comp = mount(
            <InfosForm attribute={null} readonly={false} onSubmitInfos={onSubmit} onCheckIdExists={_idNotUnique} />
        );

        renderer.act(() => {
            comp.find('input[name="id"]').simulate('change', {target: {value: 'test'}});
        });

        await wait(0);
        comp.update();

        expect(_idNotUnique).toBeCalled();
    });

    test('Can force values on new attribute', async () => {
        const comp = mount(
            <InfosForm
                attribute={null}
                readonly={false}
                onSubmitInfos={onSubmit}
                onCheckIdExists={onCheckIdExists}
                forcedType={AttributeType.advanced}
            />
        );

        const typeField = comp.find('FormSelect[name="type"]');
        expect(typeField.prop('value')).toBe('advanced');
        expect(typeField.prop('disabled')).toBe(true);
    });
});
