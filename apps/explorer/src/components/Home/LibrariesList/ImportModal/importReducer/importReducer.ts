// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ImportMode, ImportType} from '_gqlTypes/globalTypes';
import {ImportSteps, ISheet} from '../_types';

export interface IImportReducerState {
    sheets: ISheet[];
    file: File | null;
    currentStep: ImportSteps;
    okBtn: boolean;
    importError?: string;
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
    importError: null
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

const importReducer = (state: IImportReducerState, action: ImportReducerAction): IImportReducerState => {
    switch (action.type) {
        case ImportReducerActionTypes.SET_SHEETS:
            return {
                ...state,
                sheets: action.sheets,
                okBtn: _isSheetsConfValid(action.sheets)
            };
        case ImportReducerActionTypes.SET_FILE:
            return {
                ...state,
                file: action.file
            };
        case ImportReducerActionTypes.SET_CURRENT_STEP:
            return {
                ...state,
                currentStep: action.currentStep
            };
        case ImportReducerActionTypes.SET_OK_BTN:
            return {
                ...state,
                okBtn: action.okBtn
            };
        case ImportReducerActionTypes.SET_IMPORT_ERROR:
            return {
                ...state,
                importError: action.importError
            };
        default:
            return state;
    }
};

export default importReducer;
