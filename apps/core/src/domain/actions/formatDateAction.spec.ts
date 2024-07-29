// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import formatDateAction from './formatDateAction';

describe('formatDateAction', () => {
    const action = formatDateAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.DATE, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};

    test('formatDate', async () => {
        expect((await action([{value: 2119477320}], {format: 'D/M/YY HH:mm'}, ctx)).values[0].value).toBeTruthy();
        expect((await action([{value: 2119477320}], {}, ctx)).values[0].value).toBeTruthy();
        expect((await action([{value: 'aaaa'}], {}, ctx)).values[0].value).toBe('');
        expect((await action([{value: null}], {}, ctx)).values[0].value).toBe(null);
    });

    test('auto', async () => {
        expect((await action([{value: 2119477320}], {auto: 'true'}, {...ctx, lang: 'ko-KR'})).values[0].value).toBe(
            '2037. 2. 28. 오후 11:42:00'
        );
        expect((await action([{value: 2119477320}], {auto: 'true'}, {...ctx, lang: 'fr-FR'})).values[0].value).toBe(
            '28/02/2037 23:42:00'
        );
        expect((await action([{value: 2119477320}], {auto: 'true'}, {...ctx, lang: 'ar-EG'})).values[0].value).toBe(
            '٢٨‏/٢‏/٢٠٣٧، ١١:٤٢:٠٠ م'
        );
    });

    test('auto override formatDate', async () => {
        expect(
            (await action([{value: 2119477320}], {format: 'D/M/YY', auto: 'true'}, {...ctx, lang: 'fr-FR'})).values[0]
                .value
        ).toBe('28/02/2037 23:42:00');
    });
});
