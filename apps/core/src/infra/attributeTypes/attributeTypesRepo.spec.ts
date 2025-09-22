// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeTypes} from '../../_types/attribute';
import {type IAttributeAdvancedLinkRepo} from './attributeAdvancedLinkRepo';
import {type IAttributeAdvancedRepo} from './attributeAdvancedRepo';
import {type IAttributeSimpleLinkRepo} from './attributeSimpleLinkRepo';
import {type IAttributeSimpleRepo} from './attributeSimpleRepo';
import {type IAttributeTreeRepo} from './attributeTreeRepo';
import attributeTypesRepo, {type IAttributeTypeRepo} from './attributeTypesRepo';

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
                'core.infra.attributeTypes.attributeSimple': mockAttrSimpleRepo as IAttributeSimpleRepo,
                'core.infra.attributeTypes.attributeSimpleLink': mockAttrSimpleLinkRepo as IAttributeSimpleLinkRepo,
                'core.infra.attributeTypes.attributeAdvanced': mockAttrAdvRepo as IAttributeAdvancedRepo,
                'core.infra.attributeTypes.attributeAdvancedLink': mockAttrAdvLinkRepo as IAttributeAdvancedLinkRepo,
                'core.infra.attributeTypes.attributeTree': mockAttrTreeRepo as IAttributeTreeRepo
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
});
