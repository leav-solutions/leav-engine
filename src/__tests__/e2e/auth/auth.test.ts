import {makeGraphQlCall} from '../e2eUtils';

describe('Auth', () => {
    test('Me', async () => {
        const res = await makeGraphQlCall(`{
            me {
                id
                login {
                    value
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.me.id).toBeTruthy();
        expect(res.data.data.me.login.value).toBeTruthy();
    });
});
