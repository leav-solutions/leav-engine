import {type IActionsListDomain} from '../../actionsList/actionsListDomain';
import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type IGetDefaultElementHelper} from '../../tree/helpers/getDefaultElement';
import {type IVersionProfileDomain} from '../../versionProfile/versionProfileDomain';
import {type IRecordRepo} from '../../../infra/record/recordRepo';
import {type ITreeRepo} from '../../../infra/tree/treeRepo';
import {type IValueRepo} from '../../../infra/value/valueRepo';
import dayjs from 'dayjs';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IAttribute} from '../../../_types/attribute';
import {type ISaveValue, type IValue, type IValueVersion} from '../../../_types/value';
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
    ctx: IQueryInfos,
): Promise<IValueVersion> => {
    const versionProfile = await deps.versionProfileDomain.getVersionProfileProperties({
        id: attribute.versions_conf.profile,
        ctx,
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
                    ctx,
                });

                version[treeId] = treeDefaultElement.id;
            }

            return version;
        },
        Promise.resolve({}),
    );

    return valueVersion;
};

export default async (
    library: string,
    recordId: string,
    attribute: IAttribute,
    value: ISaveValue,
    deps: ISaveOneValueDeps,
    ctx: IQueryInfos,
): Promise<IValue> => {
    const valueExists = doesValueExist(value, attribute);

    const valueToSave = {
        ...value,
        modified_at: dayjs().unix(),
    };

    if (!valueExists) {
        valueToSave.created_at = dayjs().unix();
    }

    let reverseLink: IAttribute;
    if (!!attribute.reverse_link) {
        reverseLink = await deps.attributeDomain.getAttributeProperties({
            id: attribute.reverse_link as string,
            ctx,
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
              ctx,
          })
        : await deps.valueRepo.createValue({
              library,
              recordId,
              attribute: {...attribute, reverse_link: reverseLink},
              value: valueToSave,
              ctx,
          });

    return savedVal;
};
