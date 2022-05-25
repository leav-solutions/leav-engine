// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ImportMode, ImportType} from '_gqlTypes/globalTypes';
import {ImportSteps, ISheet, SheetSettingsError} from '../_types';

export interface IImportReducerState {
    sheets: ISheet[];
    file: File | null;
    currentStep: ImportSteps;
    okBtn: boolean;
    importError?: string;
    settingsError: {[sheetName: string]: SheetSettingsError[]};
}

export enum ImportReducerActionTypes {
    SET_SHEETS = 'SET_SHEETS',
    SET_FILE = 'SET_FILE',
    SET_CURRENT_STEP = 'SET_CURRENT_STEP',
    SET_OK_BTN = 'SET_OK_BTN',
    SET_IMPORT_ERROR = 'SET_IMPORT_ERROR'
}

export const initialState: IImportReducerState = {
    sheets: [],
    file: null,
    currentStep: ImportSteps.SELECT_FILE,
    okBtn: false,
    importError: null,
    settingsError: {}
};

export type ImportReducerAction =
    | {
          type: ImportReducerActionTypes.SET_SHEETS;
          sheets: ISheet[];
      }
    | {
          type: ImportReducerActionTypes.SET_FILE;
          file: File | null;
      }
    | {
          type: ImportReducerActionTypes.SET_CURRENT_STEP;
          currentStep: ImportSteps;
      }
    | {
          type: ImportReducerActionTypes.SET_OK_BTN;
          okBtn: boolean;
      }
    | {
          type: ImportReducerActionTypes.SET_IMPORT_ERROR;
          importError: string;
      };

const _isSheetsConfValid = (sheets: ISheet[]) => {
    const mappingOk = (s: ISheet) => {
        return s.mapping.length === Object.keys(s.data[0]).length;
    };
    const keysOk = (s: ISheet) => {
        return s.type === ImportType.LINK
            ? !!s.linkAttribute && typeof s.keyColumnIndex !== 'undefined' && typeof s.keyToColumnIndex !== 'undefined'
            : true;
    };
    const modeOk = (s: ISheet) => {
        return s.mode === ImportMode.update
            ? typeof s.keyColumnIndex !== 'undefined' && s.keyColumnIndex !== null
            : true;
    };

    return sheets.every(s => mappingOk(s) && keysOk(s) && modeOk(s));
};

const _getSheetErrors = (sheet: ISheet): SheetSettingsError[] => {
    if (sheet.type === ImportType.IGNORE) {
        return [];
    }

    const checks: Array<{error: SheetSettingsError; condition: boolean}> = [
        {
            error: SheetSettingsError.TYPE,
            condition: !sheet.type
        },
        {
            error: SheetSettingsError.MODE,
            condition: !sheet.mode
        },
        {
            error: SheetSettingsError.LIBRARY,
            condition: !sheet.library
        },
        {
            error: SheetSettingsError.MAPPING,
            condition: sheet.type && !(sheet?.mapping ?? []).filter(mappingCol => !!mappingCol).length
        },
        {
            error: SheetSettingsError.LINK_ATTRIBUTE,
            condition: sheet.type === ImportType.LINK && !sheet.linkAttribute
        },
        {
            error: SheetSettingsError.KEY,
            condition:
                (sheet.mode === ImportMode.update || sheet.type === ImportType.LINK) &&
                (typeof sheet.keyColumnIndex === 'undefined' ||
                    sheet.keyColumnIndex === null ||
                    !sheet.mapping[sheet.keyColumnIndex])
        },
        {
            error: SheetSettingsError.KEY_TO,
            condition:
                sheet.type === ImportType.LINK &&
                (typeof sheet.keyToColumnIndex === 'undefined' ||
                    sheet.keyToColumnIndex === null ||
                    !sheet.mapping[sheet.keyToColumnIndex])
        }
    ];

    return checks.reduce((errors: SheetSettingsError[], check): SheetSettingsError[] => {
        if (check.condition) {
            errors.push(check.error);
        }
        return errors;
    }, []);
};

const _getSettingsErrors = (sheets: ISheet[]) => {
    return sheets.reduce((acc, s) => {
        const sheetErrors = _getSheetErrors(s);
        if (sheetErrors.length) {
            acc[s.name] = sheetErrors;
        }

        return acc;
    }, {});
};

const importReducer = (state: IImportReducerState, action: ImportReducerAction): IImportReducerState => {
    switch (action.type) {
        case ImportReducerActionTypes.SET_SHEETS: {
            const settingsError = _getSettingsErrors(action.sheets);

            return {
                ...state,
                sheets: action.sheets,
                settingsError,
                okBtn: !Object.keys(settingsError).length
            };
        }
        case ImportReducerActionTypes.SET_FILE: {
            return {
                ...state,
                file: action.file
            };
        }
        case ImportReducerActionTypes.SET_CURRENT_STEP: {
            let stateChanges: Partial<IImportReducerState> = {
                currentStep: action.currentStep
            };

            if (action.currentStep === ImportSteps.CONFIG) {
                const settingsError = _getSettingsErrors(state.sheets);

                stateChanges = {...stateChanges, settingsError, okBtn: !Object.keys(settingsError).length};
            }

            return {
                ...state,
                ...stateChanges
            };
        }
        case ImportReducerActionTypes.SET_OK_BTN: {
            return {
                ...state,
                okBtn: action.okBtn
            };
        }
        case ImportReducerActionTypes.SET_IMPORT_ERROR: {
            return {
                ...state,
                importError: action.importError
            };
        }
        default:
            return state;
    }
};

export default importReducer;
