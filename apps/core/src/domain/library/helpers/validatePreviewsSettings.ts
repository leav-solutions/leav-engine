// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IQueryInfos} from '_types/queryInfos';
import {ErrorFieldDetail, Errors} from '../../../_types/errors';
import {ILibrary, LibraryBehavior} from '../../../_types/library';

export default async (libData: ILibrary, ctx: IQueryInfos): Promise<ErrorFieldDetail<ILibrary>> => {
    const errors: ErrorFieldDetail<ILibrary> = {};

    if (!libData.previewsSettings) {
        return {};
    }

    if (libData.behavior !== LibraryBehavior.FILES) {
        errors.previewsSettings = Errors.PREVIEWS_SETTINGS_NOT_ALLOWED;
        return errors;
    }

    // Sort settings to have system settings first
    const settingsToCheck = [...libData.previewsSettings];
    settingsToCheck.sort((a, b) => (a.system ? -1 : 1));

    // Check for duplicates in sizes names.
    // If a duplicate is found, we must be able to tell where the name was previously used
    const sizeNames: string[] = [];
    const duplicates: string[] = [];
    for (const settings of settingsToCheck) {
        for (const size of settings.versions.sizes) {
            if (sizeNames.find(name => name === size.name)) {
                duplicates.push(size.name);
            } else {
                sizeNames.push(size.name);
            }
        }
    }

    if (duplicates.length) {
        errors.previewsSettings = {
            msg: Errors.PREVIEWS_SETTINGS_DUPLICATE_NAMES,
            vars: {duplicates: duplicates.join(', ')}
        };
    }

    return errors;
};
