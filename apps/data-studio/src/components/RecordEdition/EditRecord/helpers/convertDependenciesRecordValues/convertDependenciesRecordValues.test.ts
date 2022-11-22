// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {convertDependenciesRecordValues} from './convertDependenciesRecordValues';

describe('convertDependenciesRecordValues', () => {
    test('Convert record values for simple dependency attributes', async () => {
        const mockRecordValues = {
            dep_attribute: {
                ancestors: [
                    {record: {id: '123', library: {id: 'dep_lib'}}},
                    {record: {id: '456', library: {id: 'dep_lib'}}}
                ]
            }
        };

        expect(convertDependenciesRecordValues(mockRecordValues, ['dep_attribute'])).toEqual({
            dep_attribute: [
                {id: '123', library: 'dep_lib'},
                {id: '456', library: 'dep_lib'}
            ]
        });
    });

    test('Convert record values for multiple dependency attributes', async () => {
        const mockRecordValues = {
            dep_attribute1: {
                ancestors: [{record: {id: '123', library: {id: 'dep_lib'}}}]
            },
            dep_attribute2: {
                ancestors: [{record: {id: '123', library: {id: 'other_lib'}}}]
            }
        };

        expect(convertDependenciesRecordValues(mockRecordValues, ['dep_attribute1', 'dep_attribute2'])).toEqual({
            dep_attribute1: [{id: '123', library: 'dep_lib'}],
            dep_attribute2: [{id: '123', library: 'other_lib'}]
        });
    });

    test('Convert record values for simple multivalues dependency attributes', async () => {
        const mockRecordValues = {
            dep_attribute: [
                {
                    ancestors: [{record: {id: '123', library: {id: 'dep_lib'}}}]
                },
                {
                    ancestors: [{record: {id: '456', library: {id: 'dep_lib'}}}]
                }
            ]
        };

        expect(convertDependenciesRecordValues(mockRecordValues, ['dep_attribute'])).toEqual({
            dep_attribute: [
                {id: '123', library: 'dep_lib'},
                {id: '456', library: 'dep_lib'}
            ]
        });
    });

    test('Handle case of record has no values', async () => {
        const mockRecordValues = {
            dep_attribute: null
        };

        expect(convertDependenciesRecordValues(mockRecordValues, ['dep_attribute'])).toEqual({
            dep_attribute: []
        });
    });
});
