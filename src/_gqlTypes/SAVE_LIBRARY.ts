/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {LibraryInput} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_LIBRARY
// ====================================================

export interface SAVE_LIBRARY_saveLibrary {
    id: string;
    system: boolean | null;
    label: any | null;
}

export interface SAVE_LIBRARY {
    saveLibrary: SAVE_LIBRARY_saveLibrary;
}

export interface SAVE_LIBRARYVariables {
    libData: LibraryInput;
}
