import attributeTypesRepo, {IAttributeTypeRepo} from './attributeTypesRepo';
import {Database} from 'arangojs';
import {AttributeTypes, AttributeFormats} from '../_types/attribute';

describe('AttributeTypesRepo', () => {
    const mockAttrTypeRepo: IAttributeTypeRepo = {
        createValue: null,
        updateValue: null,
        deleteValue: null,
        getValues: null,
        getValueById: null,
        filterQueryPart: null,
        clearAllValues: null
    };

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
                mockAttrSimpleRepo,
                mockAttrSimpleLinkRepo,
                mockAttrAdvRepo,
                mockAttrAdvLinkRepo
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
