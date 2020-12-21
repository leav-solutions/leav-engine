// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql} from 'arangojs';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {IDbService} from '../dbService';

interface IDeps {
    config?: any;
    'core.infra.db.dbService'?: IDbService;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.library'?: ILibraryDomain;
    'core.infra.attribute'?: IAttributeRepo;
    'core.infra.library'?: ILibraryRepo;
}

export default function({
    'core.infra.attribute': attributeRepo = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.library': libraryDomain = null,
    'core.infra.db.dbService': dbService = null
}: any) {
    return {
        async run(ctx) {
            const existingAttribute = await attributeDomain.getAttributes({});

            const modifyAndRecordAttribute = async function(attribute) {
                if (!attribute || !attribute.id) {
                    return;
                }

                let getValue = [];
                let saveValue = [];
                let deleteValue = [];

                if (
                    attribute.actions_list &&
                    attribute.actions_list.getValue &&
                    attribute.actions_list.getValue.length
                ) {
                    getValue = attribute.actions_list.getValue.map(action => {
                        return {id: action.id ? action.id : action.name, is_system: action.is_system};
                    });
                }

                if (
                    attribute.actions_list &&
                    attribute.actions_list.saveValue &&
                    attribute.actions_list.saveValue.length
                ) {
                    saveValue = attribute.actions_list.saveValue.map(action => {
                        return {id: action.id ? action.id : action.name, is_system: action.is_system};
                    });
                }

                if (
                    attribute.actions_list &&
                    attribute.actions_list.deleteValue &&
                    attribute.actions_list.deleteValue.length
                ) {
                    deleteValue = attribute.actions_list.deleteValue.map(action => {
                        return {id: action.id ? action.id : action.name, is_system: action.is_system};
                    });
                }

                const actionsList = {getValue, saveValue, deleteValue};

                await dbService.execute({
                    query: aql`UPDATE ${attribute.id} WITH {
                            actions_list: ${actionsList}
                        } IN core_attributes`,
                    ctx
                });
            };

            existingAttribute.list.forEach(modifyAndRecordAttribute);
        }
    };
}
