// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {create} from 'react-test-renderer';
import InfosForm from '.';
import {mockFormFull} from '../../../../../../../../../__mocks__/forms';

jest.mock('hooks/useLang');

jest.mock('../../../../../../../../attributes/AttributeSelector', () => {
    return function AttributeSelector() {
        return <div>AttributeSelector</div>;
    };
});

describe('InfosForm', () => {
    const onSubmit = jest.fn();
    test('Render form for existing form', async () => {
        const comp = shallow(
            <InfosForm library="test_lib" onSubmit={onSubmit} form={{...mockFormFull}} readonly={false} />
        );

        expect(comp.find('Formik').shallow().find('[name="id"]').prop('disabled')).toBe(true);
    });

    test('Render form for new form', async () => {
        const comp = shallow(<InfosForm library="test_lib" onSubmit={onSubmit} form={null} readonly={false} />);

        expect(comp.find('Formik').shallow().find('[name="id"]').prop('disabled')).toBe(false);
    });

    test('Autofill ID with label on new form', async () => {
        const comp = create(<InfosForm library="test_lib" onSubmit={onSubmit} form={null} readonly={false} />);

        act(() => {
            comp.root.findByProps({name: 'label.fr'}).props.onChange(null, {
                type: 'text',
                name: 'label.fr',
                value: 'labelfr'
            });
        });

        expect(comp.root.findByProps({name: 'id'}).props.value).toBe('labelfr');
    });
});
