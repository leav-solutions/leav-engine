import {aql} from 'arangojs';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {AttributeTypes} from '../../../_types/attribute';
import {LIB_ATTRIB_COLLECTION_NAME} from '../../library/libraryRepo';
import {IDbService} from '../dbService';

interface IDeps {
    config?: any;
    'core.infra.db.dbService'?: IDbService;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.library'?: ILibraryDomain;
}

export default function({
    'core.domain.attribute': attributeDomain = null,
    'core.infra.db.dbService': dbService = null,
    'core.domain.library': libraryDomain = null
}: IDeps) {
    return {
        // Fix simple link value format as we may have sometimes a number ID. Arango works with string IDs so we must
        // make sure everything is a string
        async run(ctx) {
            // Get libs using these attributes
            const edgeCollec = dbService.db.collection(LIB_ATTRIB_COLLECTION_NAME);
            const libsByAttr = await dbService.execute({
                query: aql`
                        FOR a IN core_attributes
                            FILTER a.type == ${AttributeTypes.SIMPLE_LINK}
                            FOR v IN 1 INBOUND a ${edgeCollec}
                                COLLECT attr = a._key INTO libs = v._key
                                RETURN {attr, libs}
                    `,
                ctx
            });

            // For each library using these attributes, cast values to string
            for (const {attr, libs} of libsByAttr) {
                for (const lib of libs) {
                    const libCollec = dbService.db.collection(lib);
                    await dbService.execute({
                        query: aql`
                            FOR r IN ${libCollec}
                                UPDATE r WITH {[${attr}]: TO_STRING(r[${attr}])} IN ${libCollec}
                                RETURN NEW
                        `,
                        ctx
                    });
                }
            }
        }
    };
}
