import {logger} from '@leav/logger';
import {type ToAny} from '../../../../utils/utils';
import {AttributeTypes, type IAttribute} from '../../../../_types/attribute';
import {type IRecordIdentity} from '../../../../_types/record';
import {type ISDOExportMappingFunction} from '../../../../_types/sdo';
import {type ILinkValue, type ITreeValue} from '../../../../_types/value';
import {mockRecordDomain, mockSystemQueryContext} from '../../../../__tests__/mocks/sdo/core';
import toIDLabel from './toIDLabel';

const mockGetRecordUUID = vi.fn();

const deps: ToAny<Parameters<typeof toIDLabel>[0]> = {
    'core.domain.record': mockRecordDomain,
    'core.domain.sdo.helpers.getRecordUUID': mockGetRecordUUID,
};

const advancedLinkMulti: IAttribute = {
    id: 'statuses_link',
    type: AttributeTypes.ADVANCED_LINK,
    linked_library: 'statuses',
    multiple_values: true,
} as IAttribute;

const simpleLink: IAttribute = {
    id: 'status_link',
    type: AttributeTypes.SIMPLE_LINK,
    linked_library: 'statuses',
} as IAttribute;

const treeMulti: IAttribute = {
    id: 'statuses_tree',
    type: AttributeTypes.TREE,
    linked_tree: 'statuses_tree',
    multiple_values: true,
} as IAttribute;

const linkValue = (id: string, library = 'statuses'): ILinkValue => ({payload: {id, library}}) as ILinkValue;
const treeValue = (id: string, library = 'statuses'): ITreeValue =>
    ({payload: {id: `node-${id}`, record: {id, library}}}) as ITreeValue;

/** Every record's label is `label-<id>`, and every uuid `uuid-<id>`. */
const _mockNominalResolution = () => {
    mockGetRecordUUID.mockImplementation(async (_library: string, recordId: string) => `uuid-${recordId}`);
    mockRecordDomain.getRecordIdentity.mockImplementation(
        async ({id}) => ({getLabel: vi.fn().mockResolvedValue(`label-${id}`)}) as unknown as IRecordIdentity,
    );
};

describe('toIDLabel', () => {
    let _toIDLabel: ISDOExportMappingFunction;

    beforeEach(() => {
        vi.clearAllMocks();
        _mockNominalResolution();
        _toIDLabel = toIDLabel(deps);
    });

    describe('nominal cases', () => {
        it('[+] Should return one pair per value of a multivalued advanced link, in order', async () => {
            const res = await _toIDLabel({
                record: {id: 'entity', library: 'campaigns'},
                values: [linkValue('42'), linkValue('7'), linkValue('13')],
                attributeProps: advancedLinkMulti,
                format: 'array',
                ctx: mockSystemQueryContext,
            });

            expect(res).toEqual([
                {id: 'uuid-42', label: 'label-42'},
                {id: 'uuid-7', label: 'label-7'},
                {id: 'uuid-13', label: 'label-13'},
            ]);
        });

        it('[+] Should resolve the entity carried by a tree node, not the node itself', async () => {
            const res = await _toIDLabel({
                record: {id: 'entity', library: 'campaigns'},
                values: [treeValue('42'), treeValue('7')],
                attributeProps: treeMulti,
                format: 'array',
                ctx: mockSystemQueryContext,
            });

            expect(res).toEqual([
                {id: 'uuid-42', label: 'label-42'},
                {id: 'uuid-7', label: 'label-7'},
            ]);
            // A tree has no linked_library: the library comes from the record the node carries.
            expect(mockGetRecordUUID).toHaveBeenCalledWith('statuses', '42', mockSystemQueryContext);
            expect(mockGetRecordUUID).not.toHaveBeenCalledWith(expect.anything(), 'node-42', expect.anything());
        });

        it('[+] Should return a single object for a simple link', async () => {
            const res = await _toIDLabel({
                record: {id: 'entity', library: 'campaigns'},
                values: [linkValue('42')],
                attributeProps: simpleLink,
                format: 'object',
                ctx: mockSystemQueryContext,
            });

            expect(res).toEqual({id: 'uuid-42', label: 'label-42'});
        });

        it('[+] Should return an empty array / null when the attribute holds no value', async () => {
            await expect(
                _toIDLabel({
                    record: {id: 'entity', library: 'campaigns'},
                    values: [],
                    attributeProps: advancedLinkMulti,
                    format: 'array',
                    ctx: mockSystemQueryContext,
                }),
            ).resolves.toEqual([]);

            await expect(
                _toIDLabel({
                    record: {id: 'entity', library: 'campaigns'},
                    values: undefined,
                    attributeProps: simpleLink,
                    format: 'object',
                    ctx: mockSystemQueryContext,
                }),
            ).resolves.toBeNull();
        });

        it('[+] Should skip values whose payload is empty', async () => {
            const res = await _toIDLabel({
                record: {id: 'entity', library: 'campaigns'},
                values: [linkValue('42'), {payload: null} as ILinkValue],
                attributeProps: advancedLinkMulti,
                format: 'array',
                ctx: mockSystemQueryContext,
            });

            expect(res).toEqual([{id: 'uuid-42', label: 'label-42'}]);
        });
    });

    describe('label fallback', () => {
        it('[+] Should fall back on the leav id when the target library configures no label', async () => {
            mockRecordDomain.getRecordIdentity.mockResolvedValue({} as IRecordIdentity);

            const res = await _toIDLabel({
                record: {id: 'entity', library: 'campaigns'},
                values: [linkValue('42')],
                attributeProps: simpleLink,
                format: 'object',
                ctx: mockSystemQueryContext,
            });

            expect(res).toEqual({id: 'uuid-42', label: '42'});
        });

        it('[+] Should fall back on the leav id when the configured label has no value', async () => {
            mockRecordDomain.getRecordIdentity.mockResolvedValue({
                getLabel: vi.fn().mockResolvedValue(null),
            } as unknown as IRecordIdentity);

            const res = await _toIDLabel({
                record: {id: 'entity', library: 'campaigns'},
                values: [linkValue('42')],
                attributeProps: simpleLink,
                format: 'object',
                ctx: mockSystemQueryContext,
            });

            expect(res).toEqual({id: 'uuid-42', label: '42'});
        });
    });

    it('[+] Should degrade to a null id, with a warning, rather than drop the whole export', async () => {
        // Throwing here would nack the message and lose the export of every other attribute.
        const loggerSpy = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
        mockGetRecordUUID.mockResolvedValue(null);

        const res = await _toIDLabel({
            record: {id: 'entity', library: 'campaigns'},
            values: [linkValue('42')],
            attributeProps: simpleLink,
            format: 'object',
            ctx: mockSystemQueryContext,
        });

        expect(res).toEqual({id: null, label: 'label-42'});
        expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('statuses/42'));
    });

    describe('configuration errors', () => {
        it('[-] Should throw when the mapping entry designates no attribute', async () => {
            await expect(
                _toIDLabel({
                    record: {id: 'entity', library: 'campaigns'},
                    format: 'object',
                    ctx: mockSystemQueryContext,
                }),
            ).rejects.toThrow('must declare a leavAttributeId');
        });

        it('[-] Should throw when the attribute is neither a link nor a tree', async () => {
            await expect(
                _toIDLabel({
                    record: {id: 'entity', library: 'campaigns'},
                    values: [],
                    attributeProps: {id: 'label', type: AttributeTypes.SIMPLE} as IAttribute,
                    format: 'object',
                    ctx: mockSystemQueryContext,
                }),
            ).rejects.toThrow('attribute label is of type simple');
        });

        it('[-] Should throw on "array" declared over a single-valued attribute', async () => {
            // _cleanValue would otherwise turn the object into [] — the silent loss this whole
            // function exists to remove.
            await expect(
                _toIDLabel({
                    record: {id: 'entity', library: 'campaigns'},
                    values: [linkValue('42')],
                    attributeProps: simpleLink,
                    format: 'array',
                    ctx: mockSystemQueryContext,
                }),
            ).rejects.toThrow('format "array" declared on the single-valued attribute status_link');
        });

        it('[-] Should throw on "object" declared over a multivalued attribute', async () => {
            await expect(
                _toIDLabel({
                    record: {id: 'entity', library: 'campaigns'},
                    values: [linkValue('42')],
                    attributeProps: advancedLinkMulti,
                    format: 'object',
                    ctx: mockSystemQueryContext,
                }),
            ).rejects.toThrow('format "object" declared on the multivalued attribute statuses_link');
        });

        it('[-] Should treat a simple link as single-valued whatever multiple_values says', async () => {
            // A SIMPLE_LINK holds exactly one record; the flag is meaningless on it.
            await expect(
                _toIDLabel({
                    record: {id: 'entity', library: 'campaigns'},
                    values: [linkValue('42')],
                    attributeProps: {...simpleLink, multiple_values: true},
                    format: 'array',
                    ctx: mockSystemQueryContext,
                }),
            ).rejects.toThrow('expected "object"');
        });
    });
});
