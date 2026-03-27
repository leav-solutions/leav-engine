// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// import {IQueryInfos} from '../../../_types/queryInfos';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type ILibraryRepo} from '../../../infra/library/libraryRepo';
import {type IRecordRepo} from '../../../infra/record/recordRepo';
import {type ITreeRepo} from '../../../infra/tree/treeRepo';
import {type IRecord} from '../../../_types/record';
import {type ITree, type ITreeNodeLight, TreeBehavior} from '../../../_types/tree';
import {getLibraryRepo, getRecordRepo, getTreeRepo} from './integrationTestRepoUtils';

// Partial tests, to be completed !
describe('treeRepo', () => {
    let recordRepo: IRecordRepo;
    let libraryRepo: ILibraryRepo;
    let treeRepo: ITreeRepo;

    const libraryId = 'test_lib_tree_repo';
    const treeId = 'test_tree_repo';
    const ctx: IQueryInfos = {
        userId: '1',
    };

    beforeAll(async () => {
        libraryRepo = getLibraryRepo();
        recordRepo = getRecordRepo();
        treeRepo = getTreeRepo();

        await libraryRepo.createLibrary({
            libData: {
                id: libraryId,
            },
            ctx,
        });
    });

    describe('an empty standard tree', () => {
        let tree: ITree;

        beforeEach(async () => {
            tree = await treeRepo.createTree({
                treeData: {
                    id: treeId,
                    behavior: TreeBehavior.STANDARD,
                    libraries: {
                        remoteLibraryId: {
                            allowedAtRoot: true,
                            allowMultiplePositions: false,
                            allowedChildren: [],
                        },
                    },
                },
                ctx,
            });

            expect(tree.id).toEqual(treeId);
            expect(tree.behavior).toEqual(TreeBehavior.STANDARD);
            expect(tree.libraries).toHaveProperty('remoteLibraryId');
        });

        afterEach(async () => {
            if (tree) {
                await treeRepo.deleteTree({
                    id: tree.id,
                    ctx,
                });
            }
        });

        it('getTreeContent should return empty records', async () => {
            const elements = await treeRepo.getTreeContent({
                treeId,
                ctx,
            });

            expect(elements).toEqual([]);
        });

        describe('2 records exists', () => {
            let record1: IRecord;
            let record2: IRecord;
            beforeEach(async () => {
                record1 = await recordRepo.createRecord({
                    libraryId,
                    recordData: {
                        active: true,
                        created_at: Date.now(),
                        created_by: '1',
                        modified_at: Date.now(),
                        modified_by: '1',
                        text_attr: 'value1',
                    },
                    ctx,
                });

                record2 = await recordRepo.createRecord({
                    libraryId,
                    recordData: {
                        active: true,
                        created_at: Date.now(),
                        created_by: '1',
                        modified_at: Date.now(),
                        modified_by: '1',
                        text_attr: 'value2',
                    },
                    ctx,
                });
            });

            describe('addElement', () => {
                let element: ITreeNodeLight;
                it('should add a record to the tree', async () => {
                    element = await treeRepo.addElement({
                        treeId,
                        element: {
                            id: record1.id,
                            library: libraryId,
                        },
                        parent: null,
                        ctx,
                    });

                    expect(element.id).toEqual(expect.any(String));
                    expect(element.order).toEqual(0);

                    const elements = await treeRepo.getTreeContent({
                        treeId,
                        ctx,
                    });

                    expect(elements).toEqual([
                        {
                            id: element.id,
                            order: element.order,
                            record: record1,
                            children: [],
                        },
                    ]);
                });
            });

            describe('2 elements exists', () => {
                let element1: ITreeNodeLight;
                let element2: ITreeNodeLight;

                beforeEach(async () => {
                    element1 = await treeRepo.addElement({
                        treeId,
                        element: {
                            id: record1.id,
                            library: libraryId,
                        },
                        parent: null,
                        ctx,
                    });
                    element2 = await treeRepo.addElement({
                        treeId,
                        element: {
                            id: record2.id,
                            library: libraryId,
                        },
                        parent: null,
                        ctx,
                    });
                });

                it('getTreeContent should return 2 records', async () => {
                    const elements = await treeRepo.getTreeContent({
                        treeId,
                        ctx,
                    });

                    expect(elements).toHaveLength(2);
                    expect(elements).toEqual([
                        {
                            id: element1.id,
                            order: element1.order,
                            record: record1,
                            children: [],
                        },
                        {
                            id: element2.id,
                            order: element2.order,
                            record: record2,
                            children: [],
                        },
                    ]);
                });

                it('sort with moveElement should should return elements in the correct order', async () => {
                    await treeRepo.moveElement({
                        treeId,
                        nodeId: element1.id,
                        parentTo: null,
                        order: 0,
                        ctx,
                    });
                    await treeRepo.moveElement({
                        treeId,
                        nodeId: element2.id,
                        parentTo: null,
                        order: 1,
                        ctx,
                    });

                    const elements = await treeRepo.getTreeContent({
                        treeId,
                        ctx,
                    });

                    expect(elements).toEqual([
                        {
                            id: element1.id,
                            order: 0,
                            record: record1,
                            children: [],
                        },
                        {
                            id: element2.id,
                            order: 1,
                            record: record2,
                            children: [],
                        },
                    ]);
                });

                it('reverse sort with moveElement should should return elements in the correct order', async () => {
                    await treeRepo.moveElement({
                        treeId,
                        nodeId: element1.id,
                        parentTo: null,
                        order: 1,
                        ctx,
                    });
                    await treeRepo.moveElement({
                        treeId,
                        nodeId: element2.id,
                        parentTo: null,
                        order: 0,
                        ctx,
                    });

                    const elements = await treeRepo.getTreeContent({
                        treeId,
                        ctx,
                    });

                    expect(elements).toEqual([
                        {
                            id: element2.id,
                            order: 0,
                            record: record2,
                            children: [],
                        },
                        {
                            id: element1.id,
                            order: 1,
                            record: record1,
                            children: [],
                        },
                    ]);
                });

                it('getRecordByNodeId should return the record for a node id', async () => {
                    const recordByNodeId = await treeRepo.getRecordByNodeId({
                        treeId,
                        nodeId: element1.id,
                        ctx,
                    });

                    expect(recordByNodeId).toEqual(record1);
                });

                it('many getRecordByNodeId in parallel should return record for each node id', async () => {
                    const records = await Promise.all(
                        [element1, element2].map(elem =>
                            treeRepo.getRecordByNodeId({
                                treeId,
                                nodeId: elem.id,
                                ctx,
                            }),
                        ),
                    );

                    expect(records).toEqual([record1, record2]);
                });

                it('getRecordByNodeId should return null for an unknown node id', async () => {
                    const recordByNodeId = await treeRepo.getRecordByNodeId({
                        treeId,
                        nodeId: 'not-exists',
                        ctx,
                    });

                    expect(recordByNodeId).toEqual(null);
                });

                it('many getRecordByNodeId in parallel with not uniq nodeIds should return record for each node id', async () => {
                    const elemNotExists = {id: 'not-exists'};
                    const records = await Promise.all(
                        [element1, element2, elemNotExists, element1, element2, elemNotExists].map(elem =>
                            treeRepo.getRecordByNodeId({
                                treeId,
                                nodeId: elem.id,
                                ctx,
                            }),
                        ),
                    );

                    expect(records).toEqual([record1, record2, null, record1, record2, null]);
                });
            });
        });
    });
});
