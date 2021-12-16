// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeTypes} from '../../_types/attribute';
import {AttributeCondition} from '../../_types/record';
import {mockAttrSimple} from '../../__tests__/mocks/attribute';
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
            const mockAttrTreeRepo = {...mockAttrTypeRepo};

            const attrRepo = attributeTypesRepo({
                'core.infra.attributeTypes.attributeSimple': mockAttrSimpleRepo as IAttributeTypeRepo,
                'core.infra.attributeTypes.attributeSimpleLink': mockAttrSimpleLinkRepo as IAttributeTypeRepo,
                'core.infra.attributeTypes.attributeAdvanced': mockAttrAdvRepo as IAttributeTypeRepo,
                'core.infra.attributeTypes.attributeAdvancedLink': mockAttrAdvLinkRepo as IAttributeTypeRepo,
                'core.infra.attributeTypes.attributeTree': mockAttrTreeRepo as IAttributeTypeRepo
            });

            expect(attrRepo.getTypeRepo({...mockAttribute, type: AttributeTypes.SIMPLE})).toBe(mockAttrSimpleRepo);
            expect(attrRepo.getTypeRepo({...mockAttribute, type: AttributeTypes.SIMPLE_LINK})).toBe(
                mockAttrSimpleLinkRepo
            );
            expect(attrRepo.getTypeRepo({...mockAttribute, type: AttributeTypes.ADVANCED})).toBe(mockAttrAdvRepo);
            expect(attrRepo.getTypeRepo({...mockAttribute, type: AttributeTypes.ADVANCED_LINK})).toBe(
                mockAttrAdvLinkRepo
            );
            expect(attrRepo.getTypeRepo({...mockAttribute, type: AttributeTypes.TREE})).toBe(mockAttrTreeRepo);
        });
    });
    describe('getQueryPart', () => {
        test('Return AQL with value escaped', async () => {
            const attrRepo = attributeTypesRepo({});
            const getQueryPartFunc = attrRepo.getConditionPart(AttributeCondition.CONTAINS, 'my_value', mockAttrSimple);

            const res = getQueryPartFunc('v');

            expect(Object.values(res.bindVars).includes('%my_value%')).toBe(true);
        });
    });
});
