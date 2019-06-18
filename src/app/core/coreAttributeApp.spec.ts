import {
    mockAttrAdvLink,
    mockAttrAdvLinkMultiVal,
    mockAttrAdvMultiVal,
    mockAttrId,
    mockAttrSimple,
    mockAttrSimpleLink,
    mockAttrTree,
    mockAttrTreeMultival
} from '../../__tests__/mocks/attribute';
import coreAttributeApp from './coreAttributeApp';

describe('coreAttributeApp', () => {
    describe('getGraphQLFormat', () => {
        const attrApp = coreAttributeApp(null, null, null);

        test('Attribute ID', async () => {
            expect(attrApp.getGraphQLFormat(mockAttrId)).toBe('ID!');
        });

        test('Attribute simple', async () => {
            expect(attrApp.getGraphQLFormat(mockAttrSimple)).toBe('Value');
        });

        test('Attribute advanced multival', async () => {
            expect(attrApp.getGraphQLFormat(mockAttrAdvMultiVal)).toBe('[Value!]');
        });

        test('Attribute link', async () => {
            expect(attrApp.getGraphQLFormat(mockAttrSimpleLink)).toBe('linkValue');
            expect(attrApp.getGraphQLFormat(mockAttrAdvLink)).toBe('linkValue');
        });

        test('Attribute link multival', async () => {
            expect(attrApp.getGraphQLFormat(mockAttrAdvLinkMultiVal)).toBe('[linkValue!]');
        });

        test('Attribute tree', async () => {
            expect(attrApp.getGraphQLFormat(mockAttrTree)).toBe('treeValue');
        });

        test('Attribute tree mutival', async () => {
            expect(attrApp.getGraphQLFormat(mockAttrTreeMultival)).toBe('[treeValue!]');
        });
    });
});
