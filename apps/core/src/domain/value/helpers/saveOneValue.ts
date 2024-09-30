// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IActionsListDomain} from 'domain/actionsList/actionsListDomain';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IGetDefaultElementHelper} from 'domain/tree/helpers/getDefaultElement';
import {IVersionProfileDomain} from 'domain/versionProfile/versionProfileDomain';
import {IRecordRepo} from 'infra/record/recordRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import moment from 'moment';
import {IQueryInfos} from '_types/queryInfos';
import {IAttribute} from '../../../_types/attribute';
import {IValue, IValueVersion} from '../../../_types/value';
import doesValueExist from './doesValueExist';

interface ISaveOneValueDeps {
    valueRepo: IValueRepo;
    recordRepo: IRecordRepo;
    treeRepo: ITreeRepo;
    getDefaultElementHelper: IGetDefaultElementHelper;
    actionsListDomain: IActionsListDomain;
    attributeDomain: IAttributeDomain;
    versionProfileDomain: IVersionProfileDomain;
}

const _handleValueVersion = async (
    value: IValue,
    attribute: IAttribute,
    deps: ISaveOneValueDeps,
    ctx: IQueryInfos
): Promise<IValueVersion> => {
    if (!attribute.versions_conf?.profile) {
        throw new Error('Attribute has no profile set');
    }
    const versionProfile = await deps.versionProfileDomain.getVersionProfileProperties({
        id: attribute.versions_conf?.profile,
        ctx
    });

    // Run through each profile's tree: if value's version has a value for this tree, we keep it, otherwise we affect
    // default version for this tree.
    // The goal is to make sure the version is always relevant in regard to the profile
    const valueVersion = versionProfile.trees.reduce(
        async (versionProm: Promise<IValueVersion>, treeId): Promise<IValueVersion> => {
            const version = await versionProm;

            if (value.version?.[treeId]) {
                version[treeId] = value.version[treeId];
            } else {
                const treeDefaultElement = await deps.getDefaultElementHelper.getDefaultElement({
                    treeId,
                    ctx
                });

                version[treeId] = treeDefaultElement.id;
            }

            return version;
        },
        Promise.resolve({})
    );

    return valueVersion;
};

export default async (
    library: string,
    recordId: string,
    attribute: IAttribute,
    value: IValue,
    deps: ISaveOneValueDeps,
    ctx: IQueryInfos
): Promise<IValue> => {
    const valueExists = doesValueExist(value, attribute);

    const valueToSave = {
        ...value,
        modified_at: moment().unix()
    };

    if (!valueExists) {
        valueToSave.created_at = moment().unix();
    }

    let reverseLink: IAttribute;
    if (!!attribute.reverse_link) {
        reverseLink = await deps.attributeDomain.getAttributeProperties({
            id: attribute.reverse_link as string,
            ctx
        });
    }

    // Make sure version only contains relevant trees for this attribute
    if (attribute.versions_conf?.versionable) {
        valueToSave.version = await _handleValueVersion(valueToSave, attribute, deps, ctx);
    }

    const savedVal = valueExists
        ? await deps.valueRepo.updateValue({
              library,
              recordId,
              attribute: {...attribute, reverse_link: reverseLink},
              value: valueToSave,
              ctx
          })
        : await deps.valueRepo.createValue({
              library,
              recordId,
              attribute: {...attribute, reverse_link: reverseLink},
              value: valueToSave,
              ctx
          });

    return savedVal;
};
