import formatDateAction from './formatDateAction';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../../_types/attribute';

describe('formatDateAction', () => {
    const action = formatDateAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.DATE, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};

    const targetDate = new Date(2037, 2, 1, 1, 42);

    // returns the ref date in format: '1/3/37 01:42' adapted to local time
    const simpleDate = `${targetDate.getDate()}/${targetDate.getMonth() + 1}/${targetDate
        .getFullYear()
        .toString()
        .slice(2, 5)} 0${targetDate.getHours()}:${targetDate.getMinutes()}`;
    // return the ref date in format: '2037-03-01T01:42:00+02:00' adapted to local time
    const longDate = `${targetDate.getFullYear()}-0${targetDate.getMonth() +
        1}-0${targetDate.getDate()}T0${targetDate.getHours()}:${targetDate.getMinutes()}:00+0${Math.abs(
        targetDate.getTimezoneOffset()
    ) / 60}:00`;

    test('formatDate', async () => {
        expect(action(2119477320, {format: 'D/M/YY HH:mm'}, ctx)).toBe(simpleDate);
        expect(action(2119477320, {}, ctx)).toBe(longDate);
        expect(action('aaaa', {}, ctx)).toBe('');
    });
});
