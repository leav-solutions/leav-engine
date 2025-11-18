// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MASKED_VALUE} from '../../../../_constants/values';
import {USERS_LIBRARY} from '../../../../_types/library';
import {makeGraphQlCall} from '../e2eUtils';

describe('Mask users password', () => {
    const userEmail = 'e2e-mask-user-email@example.com';
    const userPassword = 'e2e-user%Password';

    beforeAll(async () => {
        await makeGraphQlCall(
            `mutation {
            createRecord(library: "${USERS_LIBRARY}", data: {
                values: [{
                        attribute: "email",
                        payload: "${userEmail}"
                    },{
                        attribute: "password",
                        payload: "${userPassword}"
                    }]
                }
            ) {
                record {
                    id
                }
            }
        }`,
        );
    });

    afterAll(async () => {
        await makeGraphQlCall(
            `mutation {
            deactivateRecords(
                libraryId: "${USERS_LIBRARY}",
                filters: [
                    {field: "email", condition: EQUAL, value: "${userEmail}"}
                ]
            ) {
                id
            }
        }`,
        );
    });

    test('get user password should mask payload/raw_payload value', async () => {
        const res = await makeGraphQlCall(
            `{
            records(library: "${USERS_LIBRARY}", filters: [{field: "email", condition: EQUAL, value: "${userEmail}"}]) {
                list {
                id
                properties(attributeIds: ["email", "password"]) {
                    values {
                    ... on Value {
                        raw_payload
                        payload
                    }
                    }
                    attributeId
                }
                }
            }
        }`,
        );

        expect(res.data.errors).toBeUndefined();
        expect(res.status).toBe(200);
        expect(res.data.data.records.list.length).toBe(1);

        const record = res.data.data.records.list[0];
        const passwordValue = record.properties.find(p => p.attributeId === 'password').values[0];

        expect(passwordValue.raw_payload).toBe(MASKED_VALUE);
        expect(passwordValue.payload).toBe(MASKED_VALUE);
    });
});
