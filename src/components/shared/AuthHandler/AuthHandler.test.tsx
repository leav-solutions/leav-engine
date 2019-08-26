import React from 'react';
import {shallow} from 'enzyme';
import {act} from 'react-test-renderer';
import AuthHandler from './AuthHandler';

const storageGen = () => {
    let store = {};

    return {
        key: nbr => {
            return nbr.toString;
        },
        length: 1,
        setItem: (key, value) => {
            key = key;
            store[key] = value;
        },
        removeItem: key => {
            if (store[key]) {
                store[key] = undefined;
            }
        },
        getItem: key => {
            return store[key];
        },
        clear: () => {
            store = {};
        }
    };
};

describe('AuthHandler', () => {
    test('renders login if no token in local storage, app otherwise', async () => {
        let wrapper;
        let storage;

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
