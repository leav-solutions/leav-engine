// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ImportMode, ImportType} from '_ui/_gqlTypes';
import {mockSheet} from '_ui/__mocks__/common/import';
import {ImportSteps, SheetSettingsError} from '../_types';
import importReducer, {ImportReducerActionTypes, initialState} from './importReducer';

describe('importReducer', () => {
    describe('SET_SHEETS', () => {
        test('Set sheets data', async () => {
            const newState = importReducer(initialState, {
                type: ImportReducerActionTypes.SET_SHEETS,
                sheets: [mockSheet]
            });
            expect(newState).toEqual({...initialState, okBtn: true, sheets: [mockSheet]});
        });

        test('Check errors on sheets data', async () => {
            const mockSheetNoType = {
                ...mockSheet,
                type: null
            };

            const newStateNoType = importReducer(initialState, {
                type: ImportReducerActionTypes.SET_SHEETS,
                sheets: [mockSheetNoType]
            });

            expect(newStateNoType.okBtn).toBe(false);
            expect(newStateNoType.settingsError[mockSheet.name]).toEqual(
                expect.arrayContaining([SheetSettingsError.TYPE])
            );

            const mockSheetWithErrors = {
                ...mockSheet,
                type: ImportType.STANDARD,
                mode: ImportMode.update,
                mapping: null,
                keyColumnIndex: null,
                library: null
            };

            const newStateStandardSheet = importReducer(initialState, {
                type: ImportReducerActionTypes.SET_SHEETS,
                sheets: [mockSheetWithErrors]
            });

            expect(newStateStandardSheet.okBtn).toBe(false);
            expect(newStateStandardSheet.settingsError[mockSheet.name]).toEqual(
                expect.arrayContaining([SheetSettingsError.MAPPING, SheetSettingsError.LIBRARY, SheetSettingsError.KEY])
            );

            const mockLinkSheetWithErrors = {
                ...mockSheet,
                type: ImportType.LINK,
                mode: null,
                mapping: null,
                keyColumnIndex: null,
                keyToColumnIndex: null,
                library: null
            };
            const newStateLinkSheet = importReducer(initialState, {
                type: ImportReducerActionTypes.SET_SHEETS,
                sheets: [mockLinkSheetWithErrors]
            });

            expect(newStateLinkSheet.okBtn).toBe(false);
            expect(newStateLinkSheet.settingsError[mockSheet.name]).toEqual(
                expect.arrayContaining([
                    SheetSettingsError.MODE,
                    SheetSettingsError.KEY_TO,
                    SheetSettingsError.LIBRARY,
                    SheetSettingsError.LINK_ATTRIBUTE
                ])
            );
        });

        test('Ignore errors on ignore sheets', async () => {
            const mockSheetIgnored = {
                ...mockSheet,
                type: ImportType.IGNORE,
                library: null
            };

            const newStateIgnored = importReducer(initialState, {
                type: ImportReducerActionTypes.SET_SHEETS,
                sheets: [mockSheetIgnored]
            });

            expect(newStateIgnored.okBtn).toBe(true);
            expect(newStateIgnored.settingsError[mockSheetIgnored.name]).toBeUndefined();
        });
    });

    test('SET_FILE', async () => {
        const mockFile = new File([], 'test.xlsx');
        const newState = importReducer(initialState, {type: ImportReducerActionTypes.SET_FILE, file: mockFile});
        expect(newState).toEqual({...initialState, file: mockFile});
    });

    test('SET_CURRENT_STEP', async () => {
        const newState = importReducer(
            {...initialState, sheets: [mockSheet]},
            {
                type: ImportReducerActionTypes.SET_CURRENT_STEP,
                currentStep: ImportSteps.CONFIG
            }
        );
        expect(newState.currentStep).toBe(ImportSteps.CONFIG);
    });

    test('SET_OK_BTN', async () => {
        const newState = importReducer(initialState, {type: ImportReducerActionTypes.SET_OK_BTN, okBtn: true});
        expect(newState).toEqual({...initialState, okBtn: true});
    });

    test('SET_IMPORT_ERROR', async () => {
        const newState = importReducer(initialState, {
            type: ImportReducerActionTypes.SET_IMPORT_ERROR,
            importError: 'test'
        });
        expect(newState).toEqual({...initialState, importError: 'test'});
    });
});
