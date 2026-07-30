import {systemUserId} from '../../../../_constants/users';
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {type IQueryInfos} from '../../../../_types/queryInfos';
import {type IAttributeDomain} from '../../../../domain/attribute/attributeDomain';
import {type GetAttributeByPath} from '../../../../domain/attribute/helpers/getAttributeByPath';
import {type ILibraryDomain} from '../../../../domain/library/libraryDomain';
import {type ITreeDomain} from '../../../../domain/tree/treeDomain';
import ValidationError from '../../../../errors/ValidationError';
import {getCoreDep} from '../../integrationTestUtils';

const libSource = 'gabp_lib_source';
const libTarget = 'gabp_lib_target';
const treeId = 'gabp_tree';

const SIMPLE_ATTR = 'gabp_simple';
const SIMPLE_LINK_ATTR = 'gabp_simple_link';
const TREE_ATTR = 'gabp_tree_attr';
const TARGET_LABEL_ATTR = 'gabp_target_label';
const DATE_RANGE_ATTR = 'gabp_date_range';
const EXTENDED_ATTR = 'gabp_extended';
const UNDECLARED_EXTENDED_ATTR = 'gabp_extended_undeclared';

describe('getAttributeByPath (integration)', () => {
    let libraryDomain: ILibraryDomain;
    let attributeDomain: IAttributeDomain;
    let treeDomain: ITreeDomain;
    let getAttributeByPath: GetAttributeByPath;

    const ctx: IQueryInfos = {userId: systemUserId};

    beforeAll(async () => {
        libraryDomain = getCoreDep<ILibraryDomain>('core.domain.library');
        attributeDomain = getCoreDep<IAttributeDomain>('core.domain.attribute');
        treeDomain = getCoreDep<ITreeDomain>('core.domain.tree');
        getAttributeByPath = getCoreDep<GetAttributeByPath>('core.domain.attribute.helpers.getAttributeByPath');

        const targetLabelAttr = await attributeDomain.saveAttribute({
            attrData: {
                id: TARGET_LABEL_ATTR,
                type: AttributeTypes.SIMPLE,
                format: AttributeFormats.TEXT,
                label: {en: 'Target label'},
            },
            ctx,
        });

        const dateRangeAttr = await attributeDomain.saveAttribute({
            attrData: {
                id: DATE_RANGE_ATTR,
                type: AttributeTypes.SIMPLE,
                format: AttributeFormats.DATE_RANGE,
                label: {en: 'Date range'},
            },
            ctx,
        });

        // libTarget must exist before libSource (link/tree attributes reference it). It also carries the
        // date range attribute, to cover a sub-field path reached through a link.
        await libraryDomain.saveLibrary({id: libTarget, attributes: [targetLabelAttr, dateRangeAttr]}, ctx);

        // Tree referencing libTarget (no actual nodes needed: getAttributeByPath only reads the tree's
        // configured libraries, not its content)
        await treeDomain.saveTree(
            {
                id: treeId,
                label: {en: 'Tree'},
                libraries: {
                    [libTarget]: {allowedAtRoot: true, allowMultiplePositions: false, allowedChildren: []},
                },
            },
            ctx,
        );

        const simpleAttr = await attributeDomain.saveAttribute({
            attrData: {
                id: SIMPLE_ATTR,
                type: AttributeTypes.SIMPLE,
                format: AttributeFormats.TEXT,
                label: {en: 'Simple'},
            },
            ctx,
        });
        const simpleLinkAttr = await attributeDomain.saveAttribute({
            attrData: {
                id: SIMPLE_LINK_ATTR,
                type: AttributeTypes.SIMPLE_LINK,
                linked_library: libTarget,
                label: {en: 'Simple link'},
            },
            ctx,
        });
        const treeAttr = await attributeDomain.saveAttribute({
            attrData: {
                id: TREE_ATTR,
                type: AttributeTypes.TREE,
                linked_tree: treeId,
                label: {en: 'Tree attr'},
            },
            ctx,
        });

        const extendedAttr = await attributeDomain.saveAttribute({
            attrData: {
                id: EXTENDED_ATTR,
                type: AttributeTypes.SIMPLE,
                format: AttributeFormats.EXTENDED,
                label: {en: 'Extended'},
                embedded_fields: [
                    {id: 'street', format: AttributeFormats.TEXT},
                    {
                        id: 'city',
                        format: AttributeFormats.EXTENDED,
                        embedded_fields: [{id: 'zipcode', format: AttributeFormats.TEXT}],
                    },
                ],
            },
            ctx,
        });

        // Declaring embedded_fields is optional: such an attribute must accept any sub-path
        const undeclaredExtendedAttr = await attributeDomain.saveAttribute({
            attrData: {
                id: UNDECLARED_EXTENDED_ATTR,
                type: AttributeTypes.SIMPLE,
                format: AttributeFormats.EXTENDED,
                label: {en: 'Extended without embedded fields'},
            },
            ctx,
        });

        await libraryDomain.saveLibrary(
            {
                id: libSource,
                attributes: [simpleAttr, simpleLinkAttr, treeAttr, dateRangeAttr, extendedAttr, undeclaredExtendedAttr],
            },
            ctx,
        );
    });

    test('resolves a terminal attribute directly', async () => {
        const attribute = await getAttributeByPath({libraryId: libSource, attributePath: SIMPLE_ATTR, ctx});

        expect(attribute.id).toBe(SIMPLE_ATTR);
    });

    test('resolves a nested attribute through a SIMPLE_LINK', async () => {
        const attribute = await getAttributeByPath({
            libraryId: libSource,
            attributePath: `${SIMPLE_LINK_ATTR}.${TARGET_LABEL_ATTR}`,
            ctx,
        });

        expect(attribute.id).toBe(TARGET_LABEL_ATTR);
    });

    test('resolves a nested attribute through a TREE (any of its libraries)', async () => {
        const attribute = await getAttributeByPath({
            libraryId: libSource,
            attributePath: `${TREE_ATTR}.${TARGET_LABEL_ATTR}`,
            ctx,
        });

        expect(attribute.id).toBe(TARGET_LABEL_ATTR);
    });

    test('throws a ValidationError when the attribute does not exist in the library', async () => {
        await expect(
            getAttributeByPath({libraryId: libSource, attributePath: 'not_an_attribute', ctx}),
        ).rejects.toBeInstanceOf(ValidationError);
    });

    test('throws a ValidationError when a nested segment does not exist in the linked library', async () => {
        await expect(
            getAttributeByPath({libraryId: libSource, attributePath: `${SIMPLE_LINK_ATTR}.not_an_attribute`, ctx}),
        ).rejects.toBeInstanceOf(ValidationError);
    });

    test('throws when an intermediate segment is not a link or tree attribute', async () => {
        await expect(
            getAttributeByPath({libraryId: libSource, attributePath: `${SIMPLE_ATTR}.something`, ctx}),
        ).rejects.toThrow('is not a link or tree attribute');
    });

    test('throws when the tree sub-path is not found in any of the tree libraries', async () => {
        await expect(
            getAttributeByPath({libraryId: libSource, attributePath: `${TREE_ATTR}.not_an_attribute`, ctx}),
        ).rejects.toThrow('not found in any library linked to tree');
    });

    describe('sub-fields of extended / date range attributes (allowSubFields)', () => {
        test.each(['from', 'to'])(
            'resolves a "%s" sub-field of a date range attribute to its carrier',
            async subField => {
                const attribute = await getAttributeByPath({
                    libraryId: libSource,
                    attributePath: `${DATE_RANGE_ATTR}.${subField}`,
                    allowSubFields: true,
                    ctx,
                });

                // A sub-field is not an attribute of its own: the carrier attribute is returned
                expect(attribute).toMatchObject({id: DATE_RANGE_ATTR, format: AttributeFormats.DATE_RANGE});
            },
        );

        test('resolves a nested embedded field of an extended attribute to its carrier', async () => {
            const attribute = await getAttributeByPath({
                libraryId: libSource,
                attributePath: `${EXTENDED_ATTR}.city.zipcode`,
                allowSubFields: true,
                ctx,
            });

            expect(attribute).toMatchObject({id: EXTENDED_ATTR, format: AttributeFormats.EXTENDED});
        });

        test('resolves any sub-path of an extended attribute declaring no embedded fields', async () => {
            const attribute = await getAttributeByPath({
                libraryId: libSource,
                attributePath: `${UNDECLARED_EXTENDED_ATTR}.whatever.nested`,
                allowSubFields: true,
                ctx,
            });

            expect(attribute.id).toBe(UNDECLARED_EXTENDED_ATTR);
        });

        test('resolves a sub-field reached through a link', async () => {
            const attribute = await getAttributeByPath({
                libraryId: libSource,
                attributePath: `${SIMPLE_LINK_ATTR}.${DATE_RANGE_ATTR}.from`,
                allowSubFields: true,
                ctx,
            });

            expect(attribute.id).toBe(DATE_RANGE_ATTR);
        });

        test('throws on an unknown sub-field of a date range attribute', async () => {
            await expect(
                getAttributeByPath({
                    libraryId: libSource,
                    attributePath: `${DATE_RANGE_ATTR}.startDate`,
                    allowSubFields: true,
                    ctx,
                }),
            ).rejects.toThrow('is not a sub-field of date range attribute');
        });

        test('throws when a date range sub-field path goes deeper than one level', async () => {
            await expect(
                getAttributeByPath({
                    libraryId: libSource,
                    attributePath: `${DATE_RANGE_ATTR}.from.deeper`,
                    allowSubFields: true,
                    ctx,
                }),
            ).rejects.toThrow('is not a sub-field of date range attribute');
        });

        test('throws on an undeclared embedded field of an extended attribute', async () => {
            await expect(
                getAttributeByPath({
                    libraryId: libSource,
                    attributePath: `${EXTENDED_ATTR}.city.not_a_field`,
                    allowSubFields: true,
                    ctx,
                }),
            ).rejects.toThrow('is not an embedded field of extended attribute');
        });

        test('still refuses sub-fields of a plain attribute', async () => {
            await expect(
                getAttributeByPath({
                    libraryId: libSource,
                    attributePath: `${SIMPLE_ATTR}.something`,
                    allowSubFields: true,
                    ctx,
                }),
            ).rejects.toThrow('is not a link, tree, extended or date range attribute');
        });

        test.each([DATE_RANGE_ATTR, EXTENDED_ATTR])(
            'refuses a sub-field path on "%s" when the option is off (default)',
            async attributeId => {
                await expect(
                    getAttributeByPath({libraryId: libSource, attributePath: `${attributeId}.from`, ctx}),
                ).rejects.toThrow('is not a link or tree attribute');
            },
        );
    });
});
