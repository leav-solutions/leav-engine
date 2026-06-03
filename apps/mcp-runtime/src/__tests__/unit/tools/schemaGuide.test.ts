import {describe, expect, it} from 'vitest';
import {graphqlSchemaGuideContent, schemaGuideHandler} from '../../../tools/schemaGuide';

describe('schemaGuideHandler', () => {
    describe('when called', () => {
        it('should return the static cookbook as MCP text content', async () => {
            const result = await schemaGuideHandler();

            expect(result).toEqual({
                content: [{type: 'text', text: graphqlSchemaGuideContent}],
            });
        });
    });
});
