// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type IValidateHelper} from '../../helpers/validate';
import {type IGetDefaultElementHelper} from '../../tree/helpers/getDefaultElement';
import {type IElementAncestorsHelper} from '../../tree/helpers/elementAncestors';
import {type IVersionProfileDomain} from '../../versionProfile/versionProfileDomain';
import {type IValueRepo} from '../../../infra/value/valueRepo';
import {ActionsListEvents} from '../../../_types/actionsList';
import {ValueVersionMode, type IAttribute} from '../../../_types/attribute';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IFindValueTree, type IValue, type IValuesOptions} from '../../../_types/value';
import findValue from './findValue';
import {type RunActionsListHelper} from './runActionsList';

export type GetValuesHelper = (params: {
    library: string;
    recordId: string;
    attribute: string;
    options?: IValuesOptions;
    ctx: IQueryInfos;
}) => Promise<IValue[]>;

export interface IGetValuesHelperDeps {
    'core.domain.attribute': IAttributeDomain;
    'core.domain.helpers.validate': IValidateHelper;
    'core.domain.tree.helpers.elementAncestors': IElementAncestorsHelper;
    'core.domain.tree.helpers.getDefaultElement': IGetDefaultElementHelper;
    'core.domain.versionProfile': IVersionProfileDomain;
    'core.domain.value.helpers.runActionsList': RunActionsListHelper;
    'core.infra.value': IValueRepo;
}

export default function ({
    'core.domain.attribute': attributeDomain,
    'core.domain.helpers.validate': validate,
    'core.domain.tree.helpers.elementAncestors': elementAncestors,
    'core.domain.tree.helpers.getDefaultElement': getDefaultElementHelper,
    'core.domain.versionProfile': versionProfileDomain,
    'core.domain.value.helpers.runActionsList': runActionsListHelper,
    'core.infra.value': valueRepo,
}: IGetValuesHelperDeps): GetValuesHelper {
    return async ({library, recordId, attribute, options, ctx}) => {
        await validate.validateLibrary(library, ctx);
        await validate.validateRecord(library, recordId, ctx);

        const attr = await attributeDomain.getAttributeProperties({id: attribute, ctx});

        let reverseLink: IAttribute;
        if (!!attr.reverse_link) {
            reverseLink = await attributeDomain.getAttributeProperties({id: attr.reverse_link as string, ctx});
        }

        let values: IValue[];
        if (
            !attr.versions_conf ||
            !attr.versions_conf.versionable ||
            attr.versions_conf.mode === ValueVersionMode.SIMPLE
        ) {
            const getValOptions = {
                ...options,
                version: attr?.versions_conf?.versionable ? options?.version : null,
            };

            values = await valueRepo.getValues({
                library,
                recordId,
                attribute: {...attr, reverse_link: reverseLink},
                forceGetAllValues: false,
                options: getValOptions,
                ctx,
            });
        } else {
            // Get all values, no matter the version.
            const allValues: IValue[] = await valueRepo.getValues({
                library,
                recordId,
                attribute: {...attr, reverse_link: reverseLink},
                forceGetAllValues: true,
                options,
                ctx,
            });
            const versionProfile = await versionProfileDomain.getVersionProfileProperties({
                id: attr.versions_conf.profile,
                ctx,
            });

            // Get trees ancestors
            const trees: IFindValueTree[] = await Promise.all(
                versionProfile.trees.map(async (treeName: string): Promise<IFindValueTree> => {
                    const treeElem =
                        options?.version?.[treeName] ??
                        (await getDefaultElementHelper.getDefaultElement({treeId: treeName, ctx}))?.id;

                    const ancestors = treeElem
                        ? (
                              await elementAncestors.getCachedElementAncestors({
                                  treeId: treeName,
                                  nodeId: treeElem,
                                  ctx,
                              })
                          ).reverse() // We want the leaves first
                        : [];

                    return {
                        name: treeName,
                        currentIndex: 0,
                        elements: ancestors,
                    };
                }),
            );

            // Retrieve appropriate value among all values
            values = options?.forceGetAllValues ? allValues : findValue(trees, allValues);
        }

        return options?.skipActions
            ? values
            : runActionsListHelper({
                  listName: ActionsListEvents.GET_VALUE,
                  values,
                  attribute: attr,
                  record: {id: recordId},
                  library,
                  ctx,
              });
    };
}
