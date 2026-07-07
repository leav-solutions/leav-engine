import {type ILibraryDomain} from '../library/libraryDomain';
import {type IQueryInfos} from '../../_types/queryInfos';
import Joi from 'joi';
import {ErrorTypes} from '../../_types/errors';
import LeavError from '../../errors/LeavError';
import {type IAttributeDomain} from '../attribute/attributeDomain';
import {type GetAttributeByPath} from '../attribute/helpers/getAttributeByPath';
import {type IConfig} from '../../_types/config';
import {type IAttribute} from '../../_types/attribute';

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
    'core.domain.attribute.helpers.getAttributeByPath': GetAttributeByPath;
    config: IConfig;
}

export default function ({
    'core.domain.library': libraryDomain,
    'core.domain.attribute': attributeDomain,
    'core.domain.attribute.helpers.getAttributeByPath': getAttributeByPath,
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
        (libraryId: string, libraryAttributes: IAttribute[], ctx: IQueryInfos) =>
        async (exportProfile: IExportProfile): Promise<IExportProfile> => {
            const isValid = profileSchema.validate(exportProfile);
            if (isValid.error) {
                throw new LeavError(
                    ErrorTypes.CUSTOM_CONFIG_ERROR,
                    `Export profile is not valid: ${isValid.error.message}`,
                );
            }

            const validatedColumns = await Promise.all(
                exportProfile.columns.map(async column => {
                    if (column.attribute === '') {
                        // Allow empty attribute for custom columns
                        return column;
                    }

                    const attributeSegments = column.attribute.split('.');

                    try {
                        await getAttributeByPath({libraryId, attributePath: column.attribute, ctx});
                    } catch (e) {
                        // getAttributeByPath is a generic, export-agnostic module (VALIDATION_ERROR) ; here,
                        // in the context of export profiles, an invalid attribute path is a config error.
                        if (e instanceof LeavError) {
                            throw new LeavError(
                                ErrorTypes.CUSTOM_CONFIG_ERROR,
                                `Export profile column attribute "${column.attribute}": ${e.message}`,
                            );
                        }
                        throw e;
                    }

                    if (column.columnLabel) {
                        return column;
                    }

                    // Compute column label if missing
                    const firstAttribute = libraryAttributes.find(attr => attr.id === attributeSegments[0]);
                    return {
                        ...column,
                        columnLabel:
                            column.columnLabel ||
                            firstAttribute?.label[ctx?.lang] ||
                            firstAttribute?.label[config.lang.default] ||
                            '',
                    };
                }),
            );

            return {
                ...exportProfile,
                columns: validatedColumns,
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
            const validateExportProfile = _validateAndCompleteExportProfile(libraryId, libraryAttributes, ctx);

            const validatedProfiles = await Promise.all(
                exportProfile.profiles.map(async profile => {
                    try {
                        return await validateExportProfile(profile);
                    } catch (e) {
                        return {
                            label: profile.label,
                            columns: [],
                            error: {message: e.message},
                        };
                    }
                }),
            );

            return {
                ...exportProfile,
                profiles: validatedProfiles,
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
            await _validateAndCompleteExportProfile(library, libraryAttributes, ctx)(defaultOrFirstProfile);

            // If we have no profil selected, send back the defaultProfile
            if (!profile) {
                return defaultOrFirstProfile.columns;
            }

            const exportProfile = profiles.find(p => p.label === profile) ?? defaultOrFirstProfile;
            return exportProfile.columns;
        },
    };
}
