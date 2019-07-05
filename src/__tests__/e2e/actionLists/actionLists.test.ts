import {makeGraphQlCall} from '../e2eUtils';

describe('ActionList', () => {
    test('Get available actions', async () => {
        const res = await makeGraphQlCall(`{
            availableActions {
                name
                description
                input_types
                output_types
                params {
                    name
                    type
                    description
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.availableActions.length).toBeGreaterThanOrEqual(1);
        expect(res.data.errors).toBeUndefined();
    });
});
