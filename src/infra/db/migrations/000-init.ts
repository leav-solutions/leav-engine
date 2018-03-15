import {IMigration} from 'infra/db/dbUtils';
import {IDbService, collectionTypes} from '../dbService';
import {ILibraryRepo} from 'infra/libraryRepo';
import {IAttributeRepo} from 'infra/attributeRepo';
import {AttributeTypes, AttributeFormats} from '../../../domain/attributeDomain';

export default function(dbService: IDbService, libraryRepo: ILibraryRepo, attributeRepo: IAttributeRepo): IMigration {
    return {
        async run() {
            if (!await dbService.collectionExists('core_attributes')) {
                await dbService.createCollection('core_attributes');

                await attributeRepo.createAttribute({
                    id: 'id',
                    system: true,
                    type: AttributeTypes.INDEX,
                    format: AttributeFormats.TEXT,
                    label: {fr: 'Identifiant', en: 'Identifier'}
                });

                await attributeRepo.createAttribute({
                    id: 'created_by',
                    system: true,
                    type: AttributeTypes.LINK,
                    label: {fr: 'Créé par', en: 'Created by'}
                });

                await attributeRepo.createAttribute({
                    id: 'created_at',
                    system: true,
                    type: AttributeTypes.INDEX,
                    format: AttributeFormats.NUMERIC,
                    label: {fr: 'Date de création', en: 'Creation date'}
                });

                await attributeRepo.createAttribute({
                    id: 'modified_by',
                    system: true,
                    type: AttributeTypes.LINK,
                    label: {fr: 'Modifié par', en: 'Modified by'}
                });

                await attributeRepo.createAttribute({
                    id: 'modified_at',
                    system: true,
                    type: AttributeTypes.INDEX,
                    format: AttributeFormats.NUMERIC,
                    label: {fr: 'Date de modification', en: 'Modification date'}
                });
            }

            if (!await dbService.collectionExists('core_edge_libraries_attributes')) {
                await dbService.createCollection('core_edge_libraries_attributes', collectionTypes.EDGE);
            }

            if (!await dbService.collectionExists('core_libraries')) {
                await dbService.createCollection('core_libraries');
                await libraryRepo.createLibrary({
                    id: 'users',
                    system: true,
                    label: {fr: 'Utilisateurs', en: 'Users'}
                });
            }

            if (!await dbService.collectionExists('core_values')) {
                await dbService.createCollection('core_values');
            }

            if (!await dbService.collectionExists('core_edge_values_links')) {
                await dbService.createCollection('core_edge_values_links', collectionTypes.EDGE);
            }

            // Save default attributes to users library
            await libraryRepo.saveLibraryAttributes('users', [
                'id',
                'created_by',
                'created_at',
                'modified_by',
                'modified_at'
            ]);
        }
    };
}
