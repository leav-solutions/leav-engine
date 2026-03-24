// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {adminUserSdk} from '../e2eUtils';
import {
    AttributeFormat,
    type AttributeInput,
    AttributeType,
    LibraryBehavior,
    type LibraryInput,
    RecordFilterCondition,
    RecordFilterOperator,
    type SaveLinkValuePayloadFragment,
} from '../../_gqlTypes';

describe('NestedJoinLibraries', () => {
    describe('Lib A has multi B though B-join and B-join has multi C though C-join, 1 A record exists', () => {
        const libAId = 'nested_lib_a';
        const libABJoinId = 'nested_lib_ab_join';

        const libC: LibraryInput = {
            id: 'nested_lib_c',
            label: {fr: 'C', en: 'C'},
        };

        const attrBCJoinToC: AttributeInput = {
            id: 'nested_attribute_bc_join_to_c',
            type: AttributeType.simple_link,
            format: AttributeFormat.text,
            label: {fr: 'Catégorie', en: 'Category'},
            linked_library: libC.id,
        };

        const attrParentBCJoinToABJoin: AttributeInput = {
            id: 'nested_attribute_parent_bc_join_to_ab_join',
            type: AttributeType.simple_link,
            format: AttributeFormat.text,
            label: {fr: 'Test attr', en: 'Test attr en'},
            linked_library: libABJoinId,
        };
        const libBCJoin: LibraryInput = {
            id: 'nested_lib_bc_join',
            label: {fr: 'C join', en: 'C join'},
            behavior: LibraryBehavior.join,
            attributes: [attrBCJoinToC.id, attrParentBCJoinToABJoin.id],
            mandatoryAttribute: attrBCJoinToC.id,
        };

        const attrABJoinToBCJoin: AttributeInput = {
            id: 'nested_attribute_ab_join_to_bc_join',
            type: AttributeType.advanced_link,
            format: AttributeFormat.text,
            label: {fr: 'Test attr', en: 'Test attr en'},
            linked_library: libBCJoin.id,
            reverse_link: attrParentBCJoinToABJoin.id,
            multiple_values: true,
        };
        const libB: LibraryInput = {
            id: 'nested_lib_b',
            label: {fr: 'B', en: 'B'},
        };

        const attrABJoinToB: AttributeInput = {
            id: 'nested_attribute_b_join_to_b',
            type: AttributeType.simple_link,
            format: AttributeFormat.text,
            label: {fr: 'Test attr', en: 'Test attr en'},
            linked_library: libB.id,
        };
        const attrParentABJoinToA: AttributeInput = {
            id: 'nested_attribute_parent_ab_join_to_a',
            type: AttributeType.simple_link,
            format: AttributeFormat.text,
            label: {fr: 'Test attr', en: 'Test attr en'},
            linked_library: libAId,
        };

        const libABJoin: LibraryInput = {
            id: libABJoinId,
            label: {fr: 'B join', en: 'B join'},
            behavior: LibraryBehavior.join,
            attributes: [attrABJoinToB.id, attrParentABJoinToA.id, attrABJoinToBCJoin.id],
            mandatoryAttribute: attrABJoinToB.id,
        };

        const attrAToABJoin: AttributeInput = {
            id: 'nested_attribute_a_to_ab_join',
            type: AttributeType.advanced_link,
            format: AttributeFormat.text,
            label: {fr: 'Test attr', en: 'Test attr en'},
            linked_library: libABJoin.id,
            reverse_link: attrParentABJoinToA.id,
            multiple_values: true,
        };
        const libA: LibraryInput = {
            id: 'nested_lib_a',
            label: {fr: 'A', en: 'A'},
            attributes: [attrAToABJoin.id],
        };

        let ra1: string;
        let rb1: string;
        let rb2: string;

        let rc1: string;
        let rc2: string;

        beforeAll(async () => {
            await adminUserSdk.SaveAttribute({
                attribute: attrBCJoinToC,
            });
            await adminUserSdk.SaveAttribute({
                attribute: attrParentBCJoinToABJoin,
            });
            await adminUserSdk.SaveAttribute({
                attribute: attrABJoinToBCJoin,
            });
            await adminUserSdk.SaveAttribute({
                attribute: attrABJoinToB,
            });
            await adminUserSdk.SaveAttribute({
                attribute: attrParentABJoinToA,
            });
            await adminUserSdk.SaveAttribute({
                attribute: attrAToABJoin,
            });

            await adminUserSdk.SaveLibrary({
                library: libC,
            });
            await adminUserSdk.SaveLibrary({
                library: libBCJoin,
            });
            await adminUserSdk.SaveLibrary({
                library: libB,
            });
            await adminUserSdk.SaveLibrary({
                library: libABJoin,
            });
            await adminUserSdk.SaveLibrary({
                library: libA,
            });

            rc1 = (
                await adminUserSdk.CreateRecord({
                    library: libC.id,
                })
            ).createRecord.record.id;
            rc2 = (
                await adminUserSdk.CreateRecord({
                    library: libC.id,
                })
            ).createRecord.record.id;

            rb1 = (
                await adminUserSdk.CreateRecord({
                    library: libB.id,
                })
            ).createRecord.record.id;
            rb2 = (
                await adminUserSdk.CreateRecord({
                    library: libB.id,
                })
            ).createRecord.record.id;
        });

        afterAll(async () => {
            await adminUserSdk.DeleteRecord({
                library: libB.id,
                id: rb1,
            });
            await adminUserSdk.DeleteRecord({
                library: libB.id,
                id: rb2,
            });
            await adminUserSdk.DeleteRecord({
                library: libC.id,
                id: rc1,
            });
            await adminUserSdk.DeleteRecord({
                library: libC.id,
                id: rc2,
            });

            await adminUserSdk.DeleteLibrary({
                id: libB.id,
            });
            await adminUserSdk.DeleteLibrary({
                id: libABJoin.id,
            });
            await adminUserSdk.DeleteLibrary({
                id: libC.id,
            });
            await adminUserSdk.DeleteLibrary({
                id: libBCJoin.id,
            });
            await adminUserSdk.DeleteLibrary({
                id: libA.id,
            });
        });

        beforeEach(async () => {
            ra1 = (
                await adminUserSdk.CreateRecord({
                    library: libA.id,
                })
            ).createRecord.record.id;
        });

        afterEach(async () => {
            ra1 &&
                (await adminUserSdk.DeleteRecord({
                    library: libA.id,
                    id: ra1,
                }));

            await purgeInactiveRecordsAndWait(libABJoin.id);
            await purgeInactiveRecordsAndWait(libBCJoin.id);
        });

        describe('with 2 A-B join records', () => {
            let abJoinLinkValues: Array<{id: string; id_value: string}>;

            beforeEach(async () => {
                const res = await adminUserSdk.SaveValueBatch({
                    library: libA.id,
                    recordId: ra1,
                    values: [
                        {
                            attribute: attrAToABJoin.id,
                            payload: rb1,
                        },
                        {
                            attribute: attrAToABJoin.id,
                            payload: rb2,
                        },
                    ],
                });

                expect(res.saveValueBatch.values).toHaveLength(2);

                abJoinLinkValues = res.saveValueBatch.values.map(v => ({
                    id: (v as SaveLinkValuePayloadFragment).linkPayload.id,
                    id_value: v.id_value,
                }));
            });

            it('deleteValue A-B join link should deactivate A-B join record', async () => {
                const res = await adminUserSdk.DeleteValue({
                    library: libA.id,
                    recordId: ra1,
                    attribute: attrAToABJoin.id,
                    value: {
                        id_value: abJoinLinkValues[0].id_value,
                    },
                });

                expect(res.deleteValue).toHaveLength(1);
                expect(res.deleteValue[0].id_value).toBe(abJoinLinkValues[0].id_value);
                expect((res.deleteValue[0] as SaveLinkValuePayloadFragment).linkPayload.id).toBe(
                    abJoinLinkValues[0].id,
                );

                const aBJoinRecords = await adminUserSdk.GetRecordsLinkValuesProperty({
                    library: libABJoin.id,
                    filters: [{field: 'id', condition: RecordFilterCondition.EQUAL, value: abJoinLinkValues[0].id}],
                    attribute: attrABJoinToB.id,
                    retrieveInactive: true,
                });
                expect(aBJoinRecords.records.list).toHaveLength(1); // should be deactivated
                expect(aBJoinRecords.records.list[0].active).toBe(false);

                const aRecords = await adminUserSdk.GetRecordsLinkValuesProperty({
                    library: libA.id,
                    filters: [{field: 'id', condition: RecordFilterCondition.EQUAL, value: ra1}],
                    attribute: attrAToABJoin.id,
                });
                expect(
                    aRecords.records.list[0].property.map(p => (p as SaveLinkValuePayloadFragment).linkPayload.id),
                ).toEqual(expect.arrayContaining([abJoinLinkValues[1].id]));
            });

            it('delete/purge record A should deactivate A-B join records', async () => {
                await adminUserSdk.DeleteRecord({
                    library: libA.id,
                    id: ra1,
                });
                ra1 = null; // skip delete in afterEach

                const aBJoinRecords = await adminUserSdk.GetRecordsLinkValuesProperty({
                    library: libABJoin.id,
                    filters: [
                        {field: 'id', condition: RecordFilterCondition.EQUAL, value: abJoinLinkValues[0].id},
                        {operator: RecordFilterOperator.OR},
                        {field: 'id', condition: RecordFilterCondition.EQUAL, value: abJoinLinkValues[1].id},
                    ],
                    attribute: attrABJoinToB.id,
                    retrieveInactive: true,
                });

                expect(aBJoinRecords.records.list).toHaveLength(2); // should be deactivated
                expect(aBJoinRecords.records.list[0].active).toBe(false);
                expect(aBJoinRecords.records.list[1].active).toBe(false);
            });

            describe('each has 2 C-B join', () => {
                let cBJoinLinkValuesForEachJoin: Array<Array<{id: string; id_value: string}>>;

                beforeEach(async () => {
                    cBJoinLinkValuesForEachJoin = await Promise.all(
                        abJoinLinkValues.map(async abJoinLinkValue => {
                            const res = await adminUserSdk.SaveValueBatch({
                                library: libABJoin.id,
                                recordId: abJoinLinkValue.id,
                                values: [
                                    {
                                        attribute: attrABJoinToBCJoin.id,
                                        payload: rc1,
                                    },
                                    {
                                        attribute: attrABJoinToBCJoin.id,
                                        payload: rc2,
                                    },
                                ],
                            });

                            expect(res.saveValueBatch.values).toHaveLength(2);
                            const cBJoinLinkValues = res.saveValueBatch.values.map(v => ({
                                id: (v as SaveLinkValuePayloadFragment).linkPayload.id,
                                id_value: v.id_value,
                            }));
                            return cBJoinLinkValues;
                        }),
                    );
                });

                it('deleteValue C-B join link should deactivate C-B join record', async () => {
                    const res = await adminUserSdk.DeleteValue({
                        library: libABJoin.id,
                        recordId: abJoinLinkValues[0].id,
                        attribute: attrABJoinToBCJoin.id,
                        value: {
                            id_value: cBJoinLinkValuesForEachJoin[0][0].id_value,
                        },
                    });

                    expect(res.deleteValue).toHaveLength(1);
                    expect(res.deleteValue[0].id_value).toBe(cBJoinLinkValuesForEachJoin[0][0].id_value);
                    expect((res.deleteValue[0] as SaveLinkValuePayloadFragment).linkPayload.id).toBe(
                        cBJoinLinkValuesForEachJoin[0][0].id,
                    );

                    const cBJoinRecords = await adminUserSdk.GetRecordsLinkValuesProperty({
                        library: libBCJoin.id,
                        filters: [
                            {
                                field: 'id',
                                condition: RecordFilterCondition.EQUAL,
                                value: cBJoinLinkValuesForEachJoin[0][0].id,
                            },
                        ],
                        attribute: attrParentBCJoinToABJoin.id,
                        retrieveInactive: true,
                    });
                    expect(cBJoinRecords.records.list).toHaveLength(1); // should be deactivated
                    expect(cBJoinRecords.records.list[0].active).toBe(false);

                    const aBJoinRecords = await adminUserSdk.GetRecordsLinkValuesProperty({
                        library: libABJoin.id,
                        filters: [{field: 'id', condition: RecordFilterCondition.EQUAL, value: abJoinLinkValues[0].id}],
                        attribute: attrABJoinToBCJoin.id,
                    });
                    expect(aBJoinRecords.records.list[0].property.map(p => (p as any).linkPayload.id)).toEqual(
                        expect.arrayContaining([cBJoinLinkValuesForEachJoin[0][1].id]),
                    );
                });

                describe('deleteValue A-B join link to deactivate A-B join record', () => {
                    beforeEach(async () => {
                        await adminUserSdk.DeleteValue({
                            library: libA.id,
                            recordId: ra1,
                            attribute: attrAToABJoin.id,
                            value: {
                                id_value: abJoinLinkValues[0].id_value,
                            },
                        });
                    });

                    it('purge records should remove link to and deactivate C-B join records', async () => {
                        const res = await purgeInactiveRecordsAndWait(libABJoin.id);
                        expect(res.purgeInactiveRecords).toHaveLength(1);

                        const cBJoinRecordsParent1 = await adminUserSdk.GetRecordsLinkValuesProperty({
                            library: libBCJoin.id,
                            filters: [
                                {
                                    field: 'id',
                                    condition: RecordFilterCondition.EQUAL,
                                    value: cBJoinLinkValuesForEachJoin[0][0].id,
                                },
                                {
                                    operator: RecordFilterOperator.OR,
                                },
                                {
                                    field: 'id',
                                    condition: RecordFilterCondition.EQUAL,
                                    value: cBJoinLinkValuesForEachJoin[0][1].id,
                                },
                            ],
                            attribute: attrParentBCJoinToABJoin.id,
                            retrieveInactive: true,
                        });

                        expect(cBJoinRecordsParent1.records.list).toHaveLength(2); // should be deactivated
                        expect(cBJoinRecordsParent1.records.list).toEqual(
                            expect.arrayContaining([
                                expect.objectContaining({
                                    id: cBJoinLinkValuesForEachJoin[0][0].id,
                                    active: false,
                                    property: [],
                                }),
                                expect.objectContaining({
                                    id: cBJoinLinkValuesForEachJoin[0][1].id,
                                    active: false,
                                    property: [],
                                }),
                            ]),
                        );

                        // Check other join record from the same A record is not affected
                        const cBJoinRecordsParent2 = await adminUserSdk.GetRecordsLinkValuesProperty({
                            library: libBCJoin.id,
                            filters: [
                                {
                                    field: 'id',
                                    condition: RecordFilterCondition.EQUAL,
                                    value: cBJoinLinkValuesForEachJoin[1][0].id,
                                },
                                {
                                    operator: RecordFilterOperator.OR,
                                },
                                {
                                    field: 'id',
                                    condition: RecordFilterCondition.EQUAL,
                                    value: cBJoinLinkValuesForEachJoin[1][1].id,
                                },
                            ],
                            attribute: attrParentBCJoinToABJoin.id,
                            retrieveInactive: true,
                        });

                        expect(cBJoinRecordsParent2.records.list).toHaveLength(2);
                        expect(cBJoinRecordsParent2.records.list).toEqual(
                            expect.arrayContaining([
                                expect.objectContaining({
                                    id: cBJoinLinkValuesForEachJoin[1][0].id,
                                    active: true,
                                    property: [
                                        expect.objectContaining({
                                            linkPayload: {
                                                id: abJoinLinkValues[1].id,
                                            },
                                        }),
                                    ],
                                }),
                                expect.objectContaining({
                                    id: cBJoinLinkValuesForEachJoin[1][1].id,
                                    active: true,
                                    property: [
                                        expect.objectContaining({
                                            linkPayload: {
                                                id: abJoinLinkValues[1].id,
                                            },
                                        }),
                                    ],
                                }),
                            ]),
                        );
                    });
                });
            });
        });
    });

    async function purgeInactiveRecordsAndWait(libraryId: string) {
        const res = await adminUserSdk.PurgeInactiveRecords({
            libraryId,
        });
        await new Promise(resolve => setTimeout(resolve, 25)); // wait for the purge to be effective
        // Would be better to make library purge in task
        return res;
    }
});
