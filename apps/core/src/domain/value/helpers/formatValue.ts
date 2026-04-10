// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ILogger} from '@leav/logger';
import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type IUtils} from '../../../utils/utils';
import {type IAttribute} from '../../../_types/attribute';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IValue} from '../../../_types/value';

export type FormatValueHelper = (params: {attribute: IAttribute; value: IValue; ctx: IQueryInfos}) => Promise<IValue>;

export interface IFormatValueHelperDeps {
    'core.domain.attribute': IAttributeDomain;
    'core.utils': IUtils;
    'core.utils.logger': ILogger;
}

export default function ({
    'core.domain.attribute': attributeDomain,
    'core.utils': utils,
    'core.utils.logger': logger,
}: IFormatValueHelperDeps): FormatValueHelper {
    const formatValue: FormatValueHelper = async ({attribute, value, ctx}) => {
        let processedValue = {...value}; // Don't mutate given value

        if (utils.isLinkAttribute(attribute)) {
            const linkValue = processedValue.payload
                ? {...processedValue.payload, library: processedValue.payload.library ?? attribute.linked_library}
                : null;
            processedValue = {...value, payload: linkValue};
        }

        processedValue.attribute = attribute.id;

        // Format metadata values as well
        if ((attribute.metadata_fields ?? []).length) {
            const metadataValuesFormatted = await attribute.metadata_fields.reduce(
                async (allValuesProm, metadataField) => {
                    const allValues = await allValuesProm;
                    try {
                        const metadataAttributeProps = await attributeDomain.getAttributeProperties({
                            id: metadataField,
                            ctx,
                        });

                        allValues[metadataField] =
                            typeof value.metadata?.[metadataField] !== 'undefined'
                                ? await formatValue({
                                      attribute: metadataAttributeProps,
                                      value: {payload: value.metadata?.[metadataField]},
                                      ctx,
                                  })
                                : null;
                    } catch (err) {
                        logger.error(`Error formatting metadata field ${metadataField} : ${err.stack}`);
                        allValues[metadataField] = null;
                    }

                    return allValues;
                },
                Promise.resolve({}),
            );
            processedValue.metadata = metadataValuesFormatted;
        }

        return processedValue;
    };

    return formatValue;
}
