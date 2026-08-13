import {type ErrorFieldDetail, Errors} from '../../../_types/errors';
import {type ILibrary, LibraryBehavior} from '../../../_types/library';

export default async (libData: ILibrary): Promise<ErrorFieldDetail<ILibrary>> => {
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
    settingsToCheck.sort(a => (a.system ? -1 : 1));

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
            vars: {duplicates: duplicates.join(', ')},
        };
    }

    return errors;
};
