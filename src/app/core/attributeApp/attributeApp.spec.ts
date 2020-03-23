import {IActionsListDomain} from 'domain/actionsList/actionsListDomain';
import utils from '../../../utils';
import {AttributeFormats} from '../../../_types/attribute';
import {
    mockActionsListConfGetAll,
    mockActionsListConfGetString,
    mockAvailActions
} from '../../../__tests__/mocks/actionsList';
import {
    mockAttrAdvLink,
    mockAttrAdvMultiVal,
    mockAttrId,
    mockAttrSimple,
    mockAttrSimpleLink,
    mockAttrTree
} from '../../../__tests__/mocks/attribute';
import attributeApp from './attributeApp';

describe('coreAttributeApp', () => {
    describe('getGraphQLFormat', () => {
        const mockALDomain: Mockify<IActionsListDomain> = {
            getAvailableActions: global.__mockPromise(mockAvailActions)
        };

        const attrApp = attributeApp({
            'core.domain.actionsList': mockALDomain as IActionsListDomain,
            'core.utils': utils()
        });

        test('Attribute ID', async () => {
            expect(await attrApp.getGraphQLFormat(mockAttrId)).toBe('ID!');
        });

        test('Text Attribute', async () => {
            expect(await attrApp.getGraphQLFormat(mockAttrSimple)).toBe('String');
        });

        test('Numeric attribute', async () => {
            expect(await attrApp.getGraphQLFormat({...mockAttrSimple, format: AttributeFormats.NUMERIC})).toBe('Int');
        });

        test('Numeric attribute with formatting', async () => {
            expect(
                await attrApp.getGraphQLFormat({
                    ...mockAttrSimple,
                    format: AttributeFormats.NUMERIC,
                    actions_list: mockActionsListConfGetString
                })
            ).toBe('String');
        });

        test('Date attribute', async () => {
            expect(await attrApp.getGraphQLFormat({...mockAttrSimple, format: AttributeFormats.DATE})).toBe('Int');
        });

        test('Date attribute with formatting', async () => {
            expect(
                await attrApp.getGraphQLFormat({
                    ...mockAttrSimple,
                    format: AttributeFormats.DATE,
                    actions_list: mockActionsListConfGetString
                })
            ).toBe('String');
        });

        test('Extended attribute', async () => {
            expect(await attrApp.getGraphQLFormat({...mockAttrSimple, format: AttributeFormats.EXTENDED})).toBe(
                'JSONObject'
            );
        });

        test('Boolean attribute', async () => {
            expect(await attrApp.getGraphQLFormat({...mockAttrSimple, format: AttributeFormats.BOOLEAN})).toBe(
                'Boolean'
            );
        });

        test('Encrypted attribute', async () => {
            expect(await attrApp.getGraphQLFormat({...mockAttrSimple, format: AttributeFormats.ENCRYPTED})).toBe(
                'String'
            );
        });

        test('Simple link attribute', async () => {
            expect(await attrApp.getGraphQLFormat({...mockAttrSimpleLink})).toBe('TestLib');
        });

        test('Advanced link attribute', async () => {
            expect(await attrApp.getGraphQLFormat({...mockAttrAdvLink})).toBe('TestLib');
        });

        test('Tree attribute', async () => {
            expect(await attrApp.getGraphQLFormat({...mockAttrTree})).toBe('TreeNode');
        });

        test('Multiple values attribute', async () => {
            expect(await attrApp.getGraphQLFormat(mockAttrAdvMultiVal)).toBe('[String!]');
        });

        test('If actions list can return multiple types, return Any', async () => {
            expect(
                await attrApp.getGraphQLFormat({
                    ...mockAttrSimple,
                    format: AttributeFormats.DATE,
                    actions_list: mockActionsListConfGetAll
                })
            ).toBe('Any');
        });
    });
});
