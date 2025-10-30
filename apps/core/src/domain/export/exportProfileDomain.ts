// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {logger} from '@leav/logger';
import {type ILibraryDomain} from '../library/libraryDomain';
import {type IQueryInfos} from '../../_types/queryInfos';
import Joi from 'joi';

export interface IExportProfileConfig {
    profileSelected: string;
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
    getColumnsFromProfileConfig(profile: string, library: string, ctx: IQueryInfos): Promise<IExportColumn[]>;
}

export interface IExportProfileDomainDeps {
    'core.domain.library': ILibraryDomain;
}

export default function ({'core.domain.library': libraryDomain}: IExportProfileDomainDeps): IExportProfileDomain {
    const columnSchema = Joi.object({
        columnLabel: Joi.string().allow('').required(),
        attribute: Joi.string().allow('').required()
    }).required();

    const profileSchema = Joi.object({
        label: Joi.string().required(),
        columns: Joi.array().items(columnSchema).min(1).required()
    }).required();

    const exportProfileConfigSchema = Joi.object({
        profileSelected: Joi.string().required(),
        profiles: Joi.array().items(profileSchema).min(1).required()
    }).required();

    const _validateExportProfileConfig = (exportProfile: IExportProfileConfig) => {
        if (!exportProfile) {
            throw new Error('Export profile config is missing');
        }

        const isValid = exportProfileConfigSchema.validate(exportProfile);
        if (isValid.error) {
            throw new Error(`Export profile config is not valid: ${isValid.error.message}`);
        }
        return true;
    };

    return {
        async getColumnsFromProfileConfig(
            profile: string,
            library: string,
            ctx: IQueryInfos
        ): Promise<IExportColumn[]> {
            try {
                if (!profile || !library) {
                    throw new Error('No profile or library provided');
                }
                const libraryProperties = await libraryDomain.getLibraryProperties(library, ctx);

                const exportCustomConfig: IExportProfileConfig = libraryProperties?.settings?.export;
                _validateExportProfileConfig(exportCustomConfig);

                // Get the config from profileSelected label or the first one
                const exportProfile =
                    exportCustomConfig.profiles.find(p => p.label === exportCustomConfig.profileSelected) ||
                    exportCustomConfig.profiles[0];

                return exportProfile.columns;
            } catch (e) {
                logger.warn(
                    `An error occurs while getting attributes from profile ${profile} for library ${library}: ${e.message}`
                );
                return undefined;
            }
        }
    };
}
