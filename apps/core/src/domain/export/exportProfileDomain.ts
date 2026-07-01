import {type ILibraryDomain} from '../library/libraryDomain';
import {type IQueryInfos} from '../../_types/queryInfos';
import Joi from 'joi';
import {ErrorTypes} from '../../_types/errors';
import LeavError from '../../errors/LeavError';
import {type IAttributeDomain} from '../attribute/attributeDomain';
import {type ITreeDomain} from '../tree/treeDomain';
import {type IConfig} from '../../_types/config';
import {AttributeTypes, type IAttribute} from '../../_types/attribute';

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
    'core.domain.tree': ITreeDomain;
    config: IConfig;
}

export default function ({
    'core.domain.library': libraryDomain,
    'core.domain.attribute': attributeDomain,
    'core.domain.tree': treeDomain,
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

    /**
     * Recursively validate nested attributes (e.g., "link_attr.nested_link.final_attr")
     * Follows link attributes to their linked libraries and validates each segment
     */
    const _validateNestedAttribute = async (
        attributeSegments: string[],
        fullAttributePath: string,
        libraryAttributes: IAttribute[],
        ctx: IQueryInfos,
    ): Promise<IAttribute> => {
        const [currentSegment, ...remainingSegments] = attributeSegments;

        const attribute = libraryAttributes.find(attr => attr.id === currentSegment);

        if (!attribute) {
            throw new LeavError(
                ErrorTypes.CUSTOM_CONFIG_ERROR,
                `Export profile column attribute "${fullAttributePath}" does not exist in the library (attribute "${currentSegment}" not found)`,
            );
        }

        // If there are more segments, we need to keep traversing according to the attribute type.
        if (remainingSegments.length > 0) {
            // Link: follow the linked library and validate the rest there.
            if ([AttributeTypes.SIMPLE_LINK, AttributeTypes.ADVANCED_LINK].includes(attribute.type)) {
                const linkedLibraryId = attribute.linked_library;
                if (!linkedLibraryId) {
                    throw new LeavError(
                        ErrorTypes.CUSTOM_CONFIG_ERROR,
                        `Export profile column attribute "${fullAttributePath}" is invalid: "${currentSegment}" has no linked library`,
                    );
                }

                const linkedLibraryAttributes = await attributeDomain.getLibraryAttributes(linkedLibraryId, ctx);
                return _validateNestedAttribute(remainingSegments, fullAttributePath, linkedLibraryAttributes, ctx);
            }

            // Tree: the target library is dynamic (a node can link records from several libraries, and the
            // path carries no library id — same semantics as getRecordFieldValue). The remaining path is
            // valid as soon as it resolves in at least one of the tree's libraries.
            if (attribute.type === AttributeTypes.TREE) {
                const treeProps = await treeDomain.getTreeProperties(attribute.linked_tree, ctx);
                const treeLibraryIds = Object.keys(treeProps?.libraries ?? {});

                for (const treeLibraryId of treeLibraryIds) {
                    const treeLibraryAttributes = await attributeDomain.getLibraryAttributes(treeLibraryId, ctx);
                    try {
                        return await _validateNestedAttribute(
                            remainingSegments,
                            fullAttributePath,
                            treeLibraryAttributes,
                            ctx,
                        );
                    } catch {
                        // Not valid in this library, try the next one linked to the tree.
                    }
                }

                throw new LeavError(
                    ErrorTypes.CUSTOM_CONFIG_ERROR,
                    `Export profile column attribute "${fullAttributePath}" is invalid: "${remainingSegments[0]}" not found in any library linked to tree "${attribute.linked_tree}"`,
                );
            }

            // TODO: extended/date_range sub-paths (e.g. "extended_attr.subfield") are resolvable by
            // getRecordFieldValue but intentionally not accepted here yet - left for a follow-up.
            throw new LeavError(
                ErrorTypes.CUSTOM_CONFIG_ERROR,
                `Export profile column attribute "${fullAttributePath}" is invalid: "${currentSegment}" is not a link or tree attribute`,
            );
        }

        return attribute;
    };

    const _validateAndCompleteExportProfile =
        (libraryAttributes: IAttribute[], ctx: IQueryInfos) =>
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
                    await _validateNestedAttribute(attributeSegments, column.attribute, libraryAttributes, ctx);

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
            const validateExportProfile = _validateAndCompleteExportProfile(libraryAttributes, ctx);

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
            await _validateAndCompleteExportProfile(libraryAttributes, ctx)(defaultOrFirstProfile);

            // If we have no profil selected, send back the defaultProfile
            if (!profile) {
                return defaultOrFirstProfile.columns;
            }

            const exportProfile = profiles.find(p => p.label === profile) ?? defaultOrFirstProfile;
            return exportProfile.columns;
        },
    };
}
