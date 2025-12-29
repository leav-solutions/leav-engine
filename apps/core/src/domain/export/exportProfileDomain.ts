// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ILibraryDomain} from '../library/libraryDomain';
import {type IQueryInfos} from '../../_types/queryInfos';
import Joi from 'joi';
import {ErrorTypes} from '../../_types/errors';
import LeavError from '../../errors/LeavError';
import {type IAttributeDomain} from 'domain/attribute/attributeDomain';
import {type IConfig} from '_types/config';
import {type IAttribute} from '_types/attribute';

export interface IExportProfileColumn {
    columnLabel: string;
    attribute: string;
}

export interface IExportProfile {
    label: string;
    columns: IExportProfileColumn[];
    error?: {message: string};
}

export interface IExportProfileConfig {
    defaultProfile: string;
    profiles: IExportProfile[];
}

export interface IExportColumn {
    columnLabel: string;
    attribute: string;
}

export interface IExportProfileDomain {
    getExportProfileConfig(libraryId: string, ctx: IQueryInfos): Promise<IExportProfileConfig | null>;
    getColumnsFromProfileConfig(
        profile: string | undefined,
        library: string,
        ctx: IQueryInfos,
    ): Promise<IExportColumn[]>;
}

export interface IExportProfileDomainDeps {
    'core.domain.library': ILibraryDomain;
    'core.domain.attribute': IAttributeDomain;
    config: IConfig;
}

export default function ({
    'core.domain.library': libraryDomain,
    'core.domain.attribute': attributeDomain,
    config,
}: IExportProfileDomainDeps): IExportProfileDomain {
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
        profiles: Joi.array().min(1).required(),
    }).required();

    const _validateExportProfileConfig = (exportProfileConfig: IExportProfileConfig) => {
        if (!exportProfileConfig) {
            throw new LeavError(ErrorTypes.CUSTOM_CONFIG_ERROR, 'Export profile config is missing');
        }

        const isValid = exportProfileConfigSchema.validate(exportProfileConfig);
        if (isValid.error) {
            throw new LeavError(
                ErrorTypes.CUSTOM_CONFIG_ERROR,
                `Export profile config is not valid: ${isValid.error.message}`,
            );
        }

        return true;
    };

    const _validateAndCompleteExportProfile =
        (libraryAttributes: IAttribute[], ctx: IQueryInfos) =>
        (exportProfile: IExportProfile): IExportProfile => {
            const isValid = profileSchema.validate(exportProfile);
            if (isValid.error) {
                throw new LeavError(
                    ErrorTypes.CUSTOM_CONFIG_ERROR,
                    `Export profile is not valid: ${isValid.error.message}`,
                );
            }

            return {
                ...exportProfile,
                columns: exportProfile.columns.map(column => {
                    if (column.attribute === '') {
                        // Allow empty attribute for custom columns
                        return column;
                    }
                    const attribute = libraryAttributes.find(attr => attr.id === column.attribute);
                    if (!attribute) {
                        throw new LeavError(
                            ErrorTypes.CUSTOM_CONFIG_ERROR,
                            `Export profile column attribute "${column.attribute}" does not exist in library`,
                        );
                    }
                    if (column.columnLabel) {
                        return column;
                    }
                    // Compute column label if missing
                    return {
                        ...column,
                        columnLabel:
                            column.columnLabel ||
                            attribute?.label[ctx?.lang] ||
                            attribute?.label[config.lang.default] ||
                            '',
                    };
                }),
            };
        };

    const _getExportProfileConfig = async (
        libraryId: string,
        ctx: IQueryInfos,
    ): Promise<IExportProfileConfig | null> => {
        if (!libraryId) {
            throw new LeavError(ErrorTypes.CUSTOM_CONFIG_ERROR, 'Export error: No library provided');
        }

        const libraryProperties = await libraryDomain.getLibraryProperties(libraryId, ctx);
        const exportConfig = libraryProperties?.settings?.export;

        if (!exportConfig?.profiles?.length) {
            return null;
        }

        const profileConfig: IExportProfileConfig = {
            defaultProfile: exportConfig.defaultProfile || '',
            profiles: exportConfig.profiles,
        };

        _validateExportProfileConfig(profileConfig);
        return profileConfig;
    };

    return {
        async getExportProfileConfig(libraryId: string, ctx: IQueryInfos): Promise<IExportProfileConfig | null> {
            const exportProfile = await _getExportProfileConfig(libraryId, ctx);

            if (!exportProfile) {
                return null;
            }

            const libraryAttributes = await attributeDomain.getLibraryAttributes(libraryId, ctx);
            const validateExportProfile = _validateAndCompleteExportProfile(libraryAttributes, ctx);
            return {
                ...exportProfile,
                profiles: exportProfile.profiles.map(profile => {
                    try {
                        return validateExportProfile(profile);
                    } catch (e) {
                        return {
                            label: profile.label,
                            columns: [],
                            error: {message: e.message},
                        };
                    }
                }),
            };
        },
        async getColumnsFromProfileConfig(profile, library, ctx) {
            const exportProfilesConfig = await _getExportProfileConfig(library, ctx);
            if (!exportProfilesConfig) {
                throw new LeavError(ErrorTypes.CUSTOM_CONFIG_ERROR, 'Export profile config is missing');
            }

            const profiles = exportProfilesConfig.profiles;

            const defaultOrFirstProfile =
                profiles.find(p => p.label === exportProfilesConfig.defaultProfile) ?? profiles[0];

            const libraryAttributes = await attributeDomain.getLibraryAttributes(library, ctx);
            _validateAndCompleteExportProfile(libraryAttributes, ctx)(defaultOrFirstProfile);

            // If we have no profil selected, send back the defaultProfile
            if (!profile) {
                return defaultOrFirstProfile.columns;
            }

            const exportProfile = profiles.find(p => p.label === profile) ?? defaultOrFirstProfile;
            return exportProfile.columns;
        },
    };
}
