// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import AuthHandler from './AuthHandler';

jest.mock('i18next', () => ({
    use: jest.fn(() => ({
        use: jest.fn(() => ({
            use: jest.fn(() => ({
                init: jest.fn()
            }))
        }))
    }))
}));

const storageGen = () => {
    let store: any = {};

    return {
        key: (nbr: any) => {
            return nbr.toString;
        },
        length: 1,
        setItem: (key: any, value: any) => {
            key = key;
            store[key] = value;
        },
        removeItem: (key: any) => {
            if (store[key]) {
                store[key] = undefined;
            }
        },
        getItem: (key: any) => {
            return store[key];
        },
        clear: () => {
            store = {};
        }
    };
};

describe('AuthHandler', () => {
    test('renders login if no token in local storage, app otherwise', async () => {
        let wrapper: any;
        let storage: any;

        act(() => {
            storage = storageGen();
            wrapper = shallow(<AuthHandler url={''} storage={storage} />);
        });

        expect(wrapper.find('Login')).toHaveLength(1);

        act(() => {
            const successFunc: any = wrapper.find('Login').prop('onSuccess');
            successFunc('2');
            wrapper = shallow(<AuthHandler url={''} storage={storage} />);
        });

        expect(wrapper.find('App')).toHaveLength(1);
    });
});
