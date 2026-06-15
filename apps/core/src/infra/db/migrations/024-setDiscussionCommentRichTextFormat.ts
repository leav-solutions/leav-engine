import {logger} from '@leav/logger';
import {type IMigration} from '../../../_types/migration';
import {AttributeFormats} from '../../../_types/attribute';
import {type IAttributeRepo} from '../../attribute/attributeRepo';
import {COMMENT_CONTENT_ATTRIBUTE_ID} from '../migrationConstants/threads';

interface IDeps {
    'core.infra.attribute': IAttributeRepo;
}

export default function ({'core.infra.attribute': attributeRepo}: IDeps): IMigration {
    return {
        async run(ctx) {
            const attr = await attributeRepo.getAttributes({
                params: {
                    filters: {
                        id: COMMENT_CONTENT_ATTRIBUTE_ID,
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
