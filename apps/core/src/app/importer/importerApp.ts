// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AwilixContainer} from 'awilix';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {promises as fs} from 'fs';
import {IDbUtils} from 'infra/db/dbUtils';
import {now} from 'moment';
import {IQueryInfos} from '_types/queryInfos';
import {ITree} from '_types/tree';
import {AttributeTypes} from '../../_types/attribute';

export interface IImporterApp {
    import(filepath: string, clear: boolean): Promise<void>;
}

interface IDeps {
    'core.domain.library'?: ILibraryDomain;
    'core.domain.tree'?: ITreeDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.record'?: IRecordDomain;
    'core.domain.value'?: IValueDomain;
    'core.depsManager'?: AwilixContainer;
    'core.infra.db.dbUtils'?: IDbUtils;
}

export default function ({
    'core.domain.library': libraryDomain = null,
    'core.domain.tree': treeDomain = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.record': recordDomain = null,
    'core.domain.value': valueDomain = null,
    'core.depsManager': depsManager = null,
    'core.infra.db.dbUtils': dbUtils = null
}: IDeps = {}): IImporterApp {
    const _writeToConsole = (msg, clearLine = true) => {
        process.stdout.clearLine(-1);
        process.stdout.cursorTo(0);
        process.stdout.write(msg);
    };

    const _processLibraries = (libraries, ctx: IQueryInfos): Promise<any[]> => {
        return Promise.all(
            libraries.map(lib => {
                const libToSave = {...lib};

                // Remove fields which require attribute creation. We'll take care of it later
                delete libToSave.attributes;
                delete libToSave.recordIdentityConf;
                delete libToSave.permissions_conf;

                return libraryDomain.saveLibrary(libToSave, ctx);
            })
        );
    };

    const _processTrees = (trees, ctx): Promise<any[]> => {
        return Promise.all(
            trees.map(tree => {
                const treeToSave: ITree & {content: any} = {
                    ...tree,
                    libraries: tree.libraries.reduce(
                        (libs: typeof treeToSave.libraries, libId: string) => ({
                            ...libs,
                            [libId]: {
                                allowMultiplePositions: false,
                                allowedAtRoot: true,
                                allowedChildren: ['__all__']
                            }
                        }),
                        {}
                    )
                };
                delete treeToSave.content;
                return treeDomain.saveTree(treeToSave as ITree, ctx);
            })
        );
    };

    const _processAttributes = (attributes, ctx): Promise<any[]> => {
        return Promise.all(
            attributes.map(attr => {
                return attributeDomain.saveAttribute({attrData: attr, ctx});
            })
        );
    };

    const _processLibrariesAttributes = (libraries, attributesById, ctx: IQueryInfos): Promise<any[]> => {
        return Promise.all(
            libraries.map(lib => {
                const libAttributes = lib.attributes.map(a => attributesById[a]);
                const libToSave = {
                    id: lib.id,
                    attributes: libAttributes,
                    recordIdentityConf: lib.recordIdentityConf,
                    permissions_conf: lib.permissions_conf
                };
                return libraryDomain.saveLibrary(libToSave, ctx);
            })
        );
    };

    const _processRecords = async (records, ctx): Promise<{[key: number]: number}> => {
        let insertedRecords = 0;
        const _insertRecord = async (library, key) => {
            const createdRecord = await recordDomain.createRecord(library, ctx);
            recordsMapping[library] = recordsMapping[library] || {};
            recordsMapping[library][key] = createdRecord.id;

            insertedRecords++;
            _writeToConsole(`${insertedRecords} created records...`);
        };

        const recordsMapping = {};
        for (const libName of Object.keys(records)) {
            if (Array.isArray(records[libName])) {
                for (const record of records[libName]) {
                    await _insertRecord(libName, record.key);
                }
            } else if (records[libName]) {
                for (let j = 0; j < records[libName]; j++) {
                    await _insertRecord(libName, j);
                }
            }
        }

        return recordsMapping;
    };

    const _processTreeContent = (trees, recordsMapping, ctx): Promise<any[]> => {
        return Promise.all(trees.map(tree => _saveTreeContent(tree.id, tree.content, null, recordsMapping, ctx)));
    };

    const _processValues = async (values, attributesById, recordsMapping, ctx): Promise<number> => {
        let insertedValues = 0;
        const _insertValue = async valueData => {
            const attrType = attributesById[valueData.attribute].type;
            if (attrType === 'tree') {
                const [library, key] = valueData.value.split('/');
                valueData.value = `${library}/${recordsMapping[library][key]}`;
            } else if (attrType === 'advanced_link' || attrType === 'simple_link') {
                valueData.value = recordsMapping[attributesById[valueData.attribute].linked_library][valueData.value];
            }

            let version = null;
            if (valueData.version) {
                version = {};
                for (const treeName of Object.keys(valueData.version)) {
                    const [lib, key] = valueData.version[treeName].split('/');
                    version[treeName] = {library: lib, id: recordsMapping[lib][key]};
                }
            }

            await valueDomain.saveValue({
                library: valueData.library,
                recordId: recordsMapping[valueData.library][valueData.recordKey],
                attribute: valueData.attribute,
                value: {value: valueData.value, version},
                ctx
            });
            insertedValues++;
            _writeToConsole(`${insertedValues} created values...`);
        };

        for (const libName of Object.keys(values)) {
            for (const attrName of Object.keys(values[libName])) {
                const valSettings = values[libName][attrName];
                if (Array.isArray(valSettings)) {
                    for (const val of valSettings) {
                        await _insertValue({
                            library: libName,
                            attribute: attrName,
                            recordKey: val.recordKey,
                            value: val.value
                        });
                    }
                } else if (valSettings.generate) {
                    for (const key of Object.keys(recordsMapping[libName])) {
                        const value = !!valSettings.values
                            ? valSettings.values[Number(key) % valSettings.values.length]
                            : _generateValue(attrName, key, attributesById, recordsMapping);

                        await _insertValue({
                            library: libName,
                            attribute: attrName,
                            recordKey: key,
                            value,
                            version: !!valSettings.versions
                                ? valSettings.versions[Number(key) % valSettings.versions.length]
                                : null
                        });
                    }
                }
            }
        }

        return insertedValues;
    };

    const _generateValue = (attrName, key, attributesById, recordsMapping): string => {
        const attrType = attributesById[attrName].type;
        const isLinkAttribute =
            attrType === AttributeTypes.SIMPLE_LINK ||
            attrType === AttributeTypes.ADVANCED_LINK ||
            attrType === AttributeTypes.TREE;

        if (isLinkAttribute) {
            const linkedLib = attributesById[attrName].linked_library;

            if (!linkedLib) {
                throw new Error(`Missing linked_library on attribute ${attrName}`);
            }

            const linkedRecordsKeys = Object.keys(recordsMapping[linkedLib]);
            const linkedRecordKey = linkedRecordsKeys[Number(key) % linkedRecordsKeys.length];

            return linkedRecordKey;
        } else {
            return attrName + key;
        }
    };

    const _saveTreeContent = async (treeId, treeNodes, parent, recordsMapping, ctx) => {
        for (const node of treeNodes) {
            const treeElem = {id: recordsMapping[node.library][node.recordKey], library: node.library};
            await treeDomain.addElement({treeId, element: treeElem, parent, ctx});

            if (node.children.length) {
                await _saveTreeContent(treeId, node.children, treeElem, recordsMapping, ctx);
            }
        }
    };

    return {
        async import(filepath: string, clear: boolean): Promise<void> {
            const startTime = now();
            const ctx: IQueryInfos = {
                userId: '1',
                queryId: 'importerApp'
            };

            if (clear) {
                await dbUtils.clearDatabase();
            }

            // Run DB migration before doing anything
            await dbUtils.migrate(depsManager);

            console.info('Start importing data');

            const fileContent = await fs.readFile(filepath, {encoding: 'utf8'});
            const data = JSON.parse(fileContent);

            // Create libraries
            console.info('Processing libraries...');
            const libs = await _processLibraries(data.libraries, ctx);
            console.info(`Processed ${libs.length} libraries`);

            // Create trees
            console.info('Processing trees...');
            const trees = await _processTrees(data.trees, ctx);
            console.info(`Processed ${trees.length} trees`);

            // Create attributes
            console.info('Processing attributes...');
            const attributes = await _processAttributes(data.attributes, ctx);

            const attrsById = attributes.reduce((attrs, a: any) => {
                attrs[a.id] = a;
                return attrs;
            }, {});
            console.info(`Processed ${attributes.length} attributes`);

            console.info('Processing libraries attributes...');
            await _processLibrariesAttributes(data.libraries, attrsById, ctx);

            // Create records
            console.info('Processing records...');
            const recordsMapping = await _processRecords(data.records, ctx);
            const recordsCount = Object.keys(recordsMapping).reduce((count, libName) => {
                count = count + Object.keys(recordsMapping[libName]).length;
                return count;
            }, 0);
            _writeToConsole(`Processed ${recordsCount} records \n`);

            // Create tree content
            console.info('Processing trees content...');
            await _processTreeContent(data.trees, recordsMapping, ctx);

            // Save values
            console.info('Processing values...');
            const insertedValuesCount = await _processValues(data.values, attrsById, recordsMapping, ctx);
            _writeToConsole(`Processed ${insertedValuesCount} values \n`);

            const endTime = now();

            console.info(`Import done in ${(endTime - startTime) / 1000}s`);
        }
    };
}
