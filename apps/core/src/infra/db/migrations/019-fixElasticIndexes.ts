// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IElasticsearchService} from 'infra/elasticsearch/elasticsearchService';
import {ILibraryRepo} from 'infra/library/libraryRepo';
import {IMigration} from '_types/migration';

interface IDeps {
    'core.infra.elasticsearch.elasticsearchService'?: IElasticsearchService;
    'core.infra.library'?: ILibraryRepo;
}

export default function ({
    'core.infra.elasticsearch.elasticsearchService': elasticsearchService = null,
    'core.infra.library': libraryRepo = null
}: IDeps = {}): IMigration {
    return {
        async run(ctx) {
            // Make sure elasticsearch index is created for all existing libraries
            const libsList = await libraryRepo.getLibraries({params: {withCount: false}, ctx});

            for (const lib of libsList.list) {
                // Check if index exists
                const doesIndexExist = await elasticsearchService.indiceExists(lib.id);

                // If not, create it
                if (!doesIndexExist) {
                    await elasticsearchService.indiceCreate(lib.id);
                }
            }
        }
    };
}
