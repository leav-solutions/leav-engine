// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type IValidateHelper} from '../../helpers/validate';
import createAutomationTriggersTopics from './automationTriggersTopics';

const mockSystemCtx = {userId: 'system'} as IQueryInfos;
const getSystemQueryContext = vi.fn().mockReturnValue(mockSystemCtx);

const attributeDomain: Mockify<IAttributeDomain> = {
    getAttributeProperties: vi.fn(),
};

const validate: Mockify<IValidateHelper> = {
    validateLibrary: vi.fn(),
};

const createTopics = () =>
    createAutomationTriggersTopics({
        'core.domain.attribute': attributeDomain as unknown as IAttributeDomain,
        'core.domain.helpers.validate': validate as unknown as IValidateHelper,
        'core.utils.getSystemQueryContext': getSystemQueryContext,
    });

describe('automationTriggersTopics', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        getSystemQueryContext.mockReturnValue(mockSystemCtx);
        attributeDomain.getAttributeProperties = vi.fn().mockResolvedValue({});
        validate.validateLibrary = vi.fn().mockResolvedValue(undefined);
    });

    describe('librarySchema', () => {
        it('validates an existing library', async () => {
            validate.validateLibrary = vi.fn().mockResolvedValue(undefined);
            const {librarySchema} = createTopics();

            const result = await librarySchema.safeParseAsync('my_lib');

            expect(result.success).toBe(true);
        });

        it('rejects a non-existing library', async () => {
            validate.validateLibrary = vi.fn().mockRejectedValue(new Error('not found'));
            const {librarySchema} = createTopics();

            const result = await librarySchema.safeParseAsync('unknown_lib');

            expect(result.success).toBe(false);
        });

        it('includes the library id in the error message', async () => {
            validate.validateLibrary = vi.fn().mockRejectedValue(new Error('not found'));
            const {librarySchema} = createTopics();

            const result = await librarySchema.safeParseAsync('bad_lib');

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('bad_lib');
            }
        });

        it('calls validateLibrary with the submitted value and the system context', async () => {
            const {librarySchema} = createTopics();

            await librarySchema.safeParseAsync('my_lib');

            expect(validate.validateLibrary).toHaveBeenCalledWith('my_lib', mockSystemCtx);
        });
    });

    describe('attributeSchema', () => {
        it('validates an existing attribute', async () => {
            attributeDomain.getAttributeProperties = vi.fn().mockResolvedValue({});
            const {attributeSchema} = createTopics();

            const result = await attributeSchema.safeParseAsync('my_attr');

            expect(result.success).toBe(true);
        });

        it('rejects a non-existing attribute', async () => {
            attributeDomain.getAttributeProperties = vi.fn().mockRejectedValue(new Error('not found'));
            const {attributeSchema} = createTopics();

            const result = await attributeSchema.safeParseAsync('unknown_attr');

            expect(result.success).toBe(false);
        });

        it('includes the attribute id in the error message', async () => {
            attributeDomain.getAttributeProperties = vi.fn().mockRejectedValue(new Error('not found'));
            const {attributeSchema} = createTopics();

            const result = await attributeSchema.safeParseAsync('bad_attr');

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('bad_attr');
            }
        });

        it('calls getAttributeProperties with the submitted value and the system context', async () => {
            const {attributeSchema} = createTopics();

            await attributeSchema.safeParseAsync('my_attr');

            expect(attributeDomain.getAttributeProperties).toHaveBeenCalledWith({id: 'my_attr', ctx: mockSystemCtx});
        });
    });

    describe('libraryAndAttributeSchema', () => {
        beforeEach(() => {
            attributeDomain.getAttributeProperties = vi.fn().mockResolvedValue({});
            validate.validateLibrary = vi.fn().mockResolvedValue(undefined);
            validate.validateLibraryAttribute = vi.fn().mockResolvedValue(undefined);
        });

        it('validates an existing library and attribute', async () => {
            const {libraryAndAttributeSchema} = createTopics();

            const result = await libraryAndAttributeSchema.safeParseAsync({library: 'my_lib', attribute: 'my_attr'});

            expect(result.success).toBe(true);
        });

        it('rejects a non-existing attribute', async () => {
            validate.validateLibraryAttribute.mockRejectedValue(new Error('not in library'));
            const {libraryAndAttributeSchema} = createTopics();

            const result = await libraryAndAttributeSchema.safeParseAsync({
                library: 'my_lib',
                attribute: 'not_in_library_attr',
            });

            expect(result.success).toBe(false);
        });

        it('calls getAttributeProperties/validateLibrary/validateLibraryAttribute with the submitted value and the system context', async () => {
            const {libraryAndAttributeSchema} = createTopics();

            await libraryAndAttributeSchema.safeParseAsync({library: 'my_lib', attribute: 'my_attr'});

            expect(attributeDomain.getAttributeProperties).toHaveBeenCalledWith({id: 'my_attr', ctx: mockSystemCtx});
            expect(validate.validateLibrary).toHaveBeenCalledWith('my_lib', mockSystemCtx);
            expect(validate.validateLibraryAttribute).toHaveBeenCalledWith('my_lib', 'my_attr', mockSystemCtx);
        });
    });
});
