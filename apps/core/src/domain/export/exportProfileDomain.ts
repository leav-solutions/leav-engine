// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ILibraryDomain} from '../library/libraryDomain';
import {type IQueryInfos} from '../../_types/queryInfos';
import Joi from 'joi';
import {ErrorTypes} from '../../_types/errors';
import LeavError from '../../errors/LeavError';

export interface IExportProfileConfig {
    defaultProfile: string;
    profiles: Array<{
        label: string;
        columns: Array<{columnLabel: string; attribute: string}>;
    }>;
}

export interface IExportColumn {
    columnLabel: string;
    attribute: string;
}

export interface IExportProfileDomain {
    getColumnsFromProfileConfig(
        profile: string | undefined,
        library: string,
        ctx: IQueryInfos,
    ): Promise<IExportColumn[]>;
}

export interface IExportProfileDomainDeps {
    'core.domain.library': ILibraryDomain;
}

export default function ({'core.domain.library': libraryDomain}: IExportProfileDomainDeps): IExportProfileDomain {
    const columnSchema = Joi.object({
        columnLabel: Joi.string().allow('').required(),
        attribute: Joi.string().allow('').required(),
    }).required();

    const profileSchema = Joi.object({
        label: Joi.string().required(),
        columns: Joi.array().items(columnSchema).min(1).required(),
    }).required();

    const exportProfileConfigSchema = Joi.object({
        defaultProfile: Joi.string().required(),
        profiles: Joi.array().items(profileSchema).min(1).required(),
    }).required();

    const _validateExportProfileConfig = (exportProfile: IExportProfileConfig) => {
        if (!exportProfile) {
            throw new LeavError(ErrorTypes.CUSTOM_CONFIG_ERROR, 'Export profile config is missing');
        }

        const isValid = exportProfileConfigSchema.validate(exportProfile);
        if (isValid.error) {
            throw new LeavError(
                ErrorTypes.CUSTOM_CONFIG_ERROR,
                `Export profile config is not valid: ${isValid.error.message}`,
            );
        }
        return true;
    };

    return {
        async getColumnsFromProfileConfig(profile, library, ctx) {
            if (!library) {
                throw new LeavError(ErrorTypes.CUSTOM_CONFIG_ERROR, 'Export error: No library provided');
            }

            const libraryProperties = await libraryDomain.getLibraryProperties(library, ctx);

            const config: IExportProfileConfig = libraryProperties?.settings?.export;
            _validateExportProfileConfig(config);

            const profiles = config.profiles;

            const defaultOrFirstProfile = profiles.find(p => p.label === config.defaultProfile) ?? profiles[0];

            // If we have no profil selected, send back the defaultProfile
            if (!profile) {
                return defaultOrFirstProfile.columns;
            }

            const exportProfile = profiles.find(p => p.label === profile) ?? defaultOrFirstProfile;
            return exportProfile.columns;
        },
    };
}
