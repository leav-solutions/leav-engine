// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mockSelectedAttributeB} from '../__mocks__/common/attribute';
import {isAttributeSelected} from './utils';

describe('utils', () => {
    describe('isAttributeSelected', () => {
        test('Return true if attribute selected', async () => {
            expect(
                isAttributeSelected('A.B', [
                    {
                        ...mockSelectedAttributeB,
                        path: 'A.B'
                    }
                ])
            ).toBe(true);
        });

        test('Return false if attribute not selected', async () => {
            expect(
                isAttributeSelected('C', [
                    {
                        ...mockSelectedAttributeB,
                        path: 'A.B'
                    }
                ])
            ).toBe(false);
        });
    });
});
