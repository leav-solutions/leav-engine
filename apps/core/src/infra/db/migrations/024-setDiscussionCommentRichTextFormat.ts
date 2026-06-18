import {DiscussionCommentsAttributes} from '../../../_constants/systemAttributes';
import {logger} from '@leav/logger';
import {type IMigration} from '../../../_types/migration';
import {AttributeFormats} from '../../../_types/attribute';
import {type IAttributeRepo} from '../../attribute/attributeRepo';

interface IDeps {
    'core.infra.attribute': IAttributeRepo;
}

export default function ({'core.infra.attribute': attributeRepo}: IDeps): IMigration {
    return {
        async run(ctx) {
            const attr = await attributeRepo.getAttributes({
                params: {
                    filters: {
                        id: DiscussionCommentsAttributes.CONTENT,
                    },
                },
                ctx,
            });

            if (!attr.list.length) {
                return;
            }

            logger.debug('Updating discussion comment text attribute to set rich text format');

            await attributeRepo.updateAttribute({
                attrData: {
                    ...attr.list[0],
                    multiple_values: false,
                    format: AttributeFormats.RICH_TEXT,
                },
                ctx,
            });
        },
    };
}
