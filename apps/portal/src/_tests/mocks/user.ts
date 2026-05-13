import {type ME_me} from '../../_gqlTypes/ME';

export const mockUser: ME_me = {
    id: '1',
    login: 'toto',
    whoAmI: {
        id: '1',
        label: 'Toto',
        color: 'red',
        subLabel: 'sub toto',
        library: {
            id: 'users',
            label: {
                fr: 'Utilisateurs',
            },
        },
        preview: null,
    },
};
