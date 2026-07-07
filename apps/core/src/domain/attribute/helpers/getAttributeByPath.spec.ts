import getAttributeByPath, {type IGetAttributeByPathDeps} from './getAttributeByPath';
import {AttributeTypes} from '../../../_types/attribute';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IAttributeDomain} from '../attributeDomain';
import {type ITreeDomain} from '../../tree/treeDomain';

describe('getAttributeByPath', () => {
    const ctx: IQueryInfos = {userId: 'testUser'};

    const mockAttributeDomain: Mockify<IAttributeDomain> = {
        getLibraryAttributes: vi.fn(),
    };

    const mockTreeDomain: Mockify<ITreeDomain> = {
        getTreeProperties: vi.fn(),
    };

    const deps: IGetAttributeByPathDeps = {
        'core.domain.attribute': mockAttributeDomain as IAttributeDomain,
        'core.domain.tree': mockTreeDomain as ITreeDomain,
    };

    const _getAttributeByPath = getAttributeByPath(deps);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // A real attribute saved through attributeDomain.saveAttribute requires linked_library for link
    // types, so this malformed state can only be exercised with a mock.
    it('throws when a link attribute has no linked_library configured', async () => {
        mockAttributeDomain.getLibraryAttributes.mockResolvedValue([
            {id: 'broken_link', label: {en: 'Broken link'}, type: AttributeTypes.SIMPLE_LINK},
        ]);

        await expect(
            _getAttributeByPath({libraryId: 'some_library', attributePath: 'broken_link.anything', ctx}),
        ).rejects.toThrow('Attribute path "broken_link.anything" is invalid: "broken_link" has no linked library');
    });
});
