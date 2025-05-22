// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from '_ui/_tests/testUtils';
import LinkSelect from './LinkSelect';

describe('LinkSelect', () => {
    test('OK', async () => {
        render(
            <LinkSelect
                tagDisplay={false}
                options={[]}
                defaultValues={[]}
                onUpdateSelection={() => null}
                onCreate={() => null}
                onAdvanceSearch={() => null}
            />
        );

        expect(true).toBe(true);
    });
});
