import {describe, expect, it} from 'vitest';
import {graphqlSchemaGuideContents, schemaGuideHandler} from '../../../tools/schemaGuide';

describe('schemaGuideHandler', () => {
    describe('when called', () => {
        it('should return one MCP text block per guide Markdown file', async () => {
            const result = await schemaGuideHandler();

            expect(result).toEqual({
                content: graphqlSchemaGuideContents.map(text => ({type: 'text', text})),
            });
        });

        it('should return at least one non-empty guide block', async () => {
            const result = await schemaGuideHandler();

            expect(result.content.length).toBeGreaterThan(0);
            expect(result.content.every(block => block.text.trim().length > 0)).toBe(true);
        });
    });
});
