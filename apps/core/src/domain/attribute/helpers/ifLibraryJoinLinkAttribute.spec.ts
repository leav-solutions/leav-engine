// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ToAny} from 'utils/utils';
import ifLibraryJoinLinkAttribute, {IIfLibraryJoinLinkDeps} from './ifLibraryJoinLinkAttribute';
import {AttributeTypes, IAttribute} from '../../../_types/attribute';
import {type ILibrary, LibraryBehavior} from '../../../_types/library';
import {type IQueryInfos} from '_types/queryInfos';

const depsBase: ToAny<IIfLibraryJoinLinkDeps> = {
    'core.domain.attribute': jest.fn(),
    'core.domain.helpers.getCoreEntityById': jest.fn()
};
describe('ifLibraryJoinLinkAttribute', () => {
    const callback = jest.fn();
    const _ifLibraryJoinLinkAttribute = ifLibraryJoinLinkAttribute(depsBase);
    const ctx: IQueryInfos = {userId: 'testUser'};

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('[-] should not call callback if attributeProps type is not link', async () => {
        await expect(
            _ifLibraryJoinLinkAttribute(
                {
                    type: AttributeTypes.SIMPLE
                },
                callback,
                ctx
            )
        ).resolves.toBeUndefined();
        await expect(
            _ifLibraryJoinLinkAttribute(
                {
                    type: AttributeTypes.ADVANCED
                },
                callback,
                ctx
            )
        ).resolves.toBeUndefined();
        expect(callback).not.toHaveBeenCalled();
    });

    it('[-] should not call callback if linked library has not join behavior', async () => {
        depsBase['core.domain.helpers.getCoreEntityById'].mockResolvedValue({
            behavior: LibraryBehavior.STANDARD
        } as ILibrary);
        await expect(
            _ifLibraryJoinLinkAttribute(
                {
                    type: AttributeTypes.ADVANCED_LINK,
                    linked_library: 'structure_items'
                },
                callback,
                ctx
            )
        ).resolves.toBeUndefined();

        depsBase['core.domain.helpers.getCoreEntityById'].mockResolvedValue({
            behavior: LibraryBehavior.FILES
        } as ILibrary);
        await expect(
            _ifLibraryJoinLinkAttribute(
                {
                    type: AttributeTypes.ADVANCED_LINK,
                    linked_library: 'structure_items'
                },
                callback,
                ctx
            )
        ).resolves.toBeUndefined();

        depsBase['core.domain.helpers.getCoreEntityById'].mockResolvedValue({
            behavior: LibraryBehavior.DIRECTORIES
        } as ILibrary);
        await expect(
            _ifLibraryJoinLinkAttribute(
                {
                    type: AttributeTypes.ADVANCED_LINK,
                    linked_library: 'structure_items'
                },
                callback,
                ctx
            )
        ).resolves.toBeUndefined();
        expect(callback).not.toHaveBeenCalled();
    });

    it('[-] should not call callback if linked library has join behavior but not mandatory attribut', async () => {
        depsBase['core.domain.helpers.getCoreEntityById'].mockResolvedValue({
            behavior: LibraryBehavior.JOIN
        } as ILibrary);
        await expect(
            _ifLibraryJoinLinkAttribute(
                {
                    type: AttributeTypes.ADVANCED_LINK,
                    linked_library: 'structure_items'
                },
                callback,
                ctx
            )
        ).resolves.toBeUndefined();
        expect(callback).not.toHaveBeenCalled();
    });

    it('[-] should not call callback if linked library has mandatory attribut tree multi valuated', async () => {
        const joinLibraryId = 'structure_item_categories';
        const joinAttributeProps: IAttribute = {
            type: AttributeTypes.TREE,
            id: 'structure_item_categories_category',
            multiple_values: true
        };
        depsBase['core.domain.helpers.getCoreEntityById'].mockResolvedValue({
            behavior: LibraryBehavior.JOIN,
            mandatoryAttribute: joinAttributeProps.id
        } as ILibrary);
        depsBase['core.domain.attribute'].getAttributeProperties = jest.fn().mockResolvedValue(joinAttributeProps);
        await expect(
            _ifLibraryJoinLinkAttribute(
                {
                    type: AttributeTypes.ADVANCED_LINK,
                    linked_library: joinLibraryId
                },
                callback,
                ctx
            )
        ).resolves.toBeUndefined();
        expect(callback).not.toHaveBeenCalled();
    });

    it('[-] should not call callback if linked library has mandatory attribut advanced link', async () => {
        const joinLibraryId = 'structure_item_advanced_links';
        const joinAttributeProps: IAttribute = {
            type: AttributeTypes.ADVANCED_LINK,
            id: 'structure_item_advanced_links_link'
        };
        depsBase['core.domain.helpers.getCoreEntityById'].mockResolvedValue({
            behavior: LibraryBehavior.JOIN,
            mandatoryAttribute: joinAttributeProps.id
        } as ILibrary);
        depsBase['core.domain.attribute'].getAttributeProperties = jest.fn().mockResolvedValue(joinAttributeProps);
        await expect(
            _ifLibraryJoinLinkAttribute(
                {
                    type: AttributeTypes.ADVANCED_LINK,
                    linked_library: joinLibraryId
                },
                callback,
                ctx
            )
        ).resolves.toBeUndefined();
        expect(callback).not.toHaveBeenCalled();
    });

    it('[+] should call callback if linked library has mandatory attribut simple link', async () => {
        const joinLibraryId = 'structure_items';
        const joinAttributeProps: IAttribute = {
            type: AttributeTypes.SIMPLE_LINK,
            id: 'structure_item_thematic'
        };
        depsBase['core.domain.helpers.getCoreEntityById'].mockResolvedValue({
            behavior: LibraryBehavior.JOIN,
            mandatoryAttribute: joinAttributeProps.id
        } as ILibrary);
        depsBase['core.domain.attribute'].getAttributeProperties = jest.fn().mockResolvedValue(joinAttributeProps);
        callback.mockResolvedValue(42);
        await expect(
            _ifLibraryJoinLinkAttribute(
                {
                    type: AttributeTypes.ADVANCED_LINK,
                    linked_library: joinLibraryId
                },
                callback,
                ctx
            )
        ).resolves.toEqual(42);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(joinLibraryId, joinAttributeProps);
    });

    it('[-] should not call callback if linked library has mandatory attribut tree mono valuated', async () => {
        const joinLibraryId = 'structure_item_categories';
        const joinAttributeProps: IAttribute = {
            type: AttributeTypes.TREE,
            id: 'structure_item_categories_category',
            multiple_values: false
        };
        depsBase['core.domain.helpers.getCoreEntityById'].mockResolvedValue({
            behavior: LibraryBehavior.JOIN,
            mandatoryAttribute: joinAttributeProps.id
        } as ILibrary);
        depsBase['core.domain.attribute'].getAttributeProperties = jest.fn().mockResolvedValue(joinAttributeProps);
        callback.mockResolvedValue({some: 'values'});
        await expect(
            _ifLibraryJoinLinkAttribute(
                {
                    type: AttributeTypes.ADVANCED_LINK,
                    linked_library: joinLibraryId
                },
                callback,
                ctx
            )
        ).resolves.not.toEqual({some: 'values'});
        expect(callback).not.toHaveBeenCalledTimes(1);
        expect(callback).not.toHaveBeenCalledWith(joinLibraryId, joinAttributeProps);
    });
});
