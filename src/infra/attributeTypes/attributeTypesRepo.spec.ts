import {AttributeTypes} from '../../_types/attribute';
import attributeTypesRepo, {IAttributeTypeRepo} from './attributeTypesRepo';

describe('AttributeTypesRepo', () => {
    const mockAttrTypeRepo: Mockify<IAttributeTypeRepo> = {};

    describe('getTypeRepo', () => {
        const mockAttribute = {
            id: 'test_attr',
            type: null
        };

        test('Should return repo by attribute type', () => {
            const mockAttrSimpleRepo = {...mockAttrTypeRepo};
            const mockAttrSimpleLinkRepo = {...mockAttrTypeRepo};
            const mockAttrAdvRepo = {...mockAttrTypeRepo};
            const mockAttrAdvLinkRepo = {...mockAttrTypeRepo};

            const attrRepo = attributeTypesRepo(
                mockAttrSimpleRepo as IAttributeTypeRepo,
                mockAttrSimpleLinkRepo as IAttributeTypeRepo,
                mockAttrAdvRepo as IAttributeTypeRepo,
                mockAttrAdvLinkRepo as IAttributeTypeRepo
            );

            expect(attrRepo.getTypeRepo({...mockAttribute, type: AttributeTypes.SIMPLE})).toBe(mockAttrSimpleRepo);
            expect(attrRepo.getTypeRepo({...mockAttribute, type: AttributeTypes.SIMPLE_LINK})).toBe(
                mockAttrSimpleLinkRepo
            );
            expect(attrRepo.getTypeRepo({...mockAttribute, type: AttributeTypes.ADVANCED})).toBe(mockAttrAdvRepo);
            expect(attrRepo.getTypeRepo({...mockAttribute, type: AttributeTypes.ADVANCED_LINK})).toBe(
                mockAttrAdvLinkRepo
            );
        });
    });
});
