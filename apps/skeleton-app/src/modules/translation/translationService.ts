// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {LeavServerError} from './LeavServerError';

export const getLeavFallbackLanguage = (): Promise<string> | never =>
    fetch('/global-lang', {method: 'GET'}).then(response => {
        if (response.ok) {
            return response.text();
        }
        throw new LeavServerError();
    });
