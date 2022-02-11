// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IValidateHelper} from 'domain/helpers/validate';
import {IRecordDomain} from 'domain/record/recordDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {IQueryInfos} from '_types/queryInfos';
import {Action, IFile} from '../../_types/import';
import importDomain from './importDomain';

describe('importDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'importDomainTest'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('import wrong data file', async () => {
        const imprtDomain = importDomain();

        expect(imprtDomain.import({} as IFile, ctx)).rejects.toThrow();
    });

    test('test import elements - simple and advanced links', async () => {
        const data = {
            elements: [
                {
                    library: 'test_import',
                    matches: [],
                    data: [
                        {
                            attribute: 'simple',
                            values: [
                                {
                                    value: 'one'
                                }
                            ],
                            action: Action.ADD
                        },
                        {
                            attribute: 'advanced_link',
                            values: [
                                {
                                    value: '1'
                                }
                            ],
                            action: Action.REPLACE
                        }
                    ],
                    links: []
                },
                {
                    library: 'users_groups',
                    matches: [],
                    data: [
                        {
                            attribute: 'simple',
                            values: [
                                {
                                    value: 'test'
                                }
                            ],
                            action: Action.ADD
                        }
                    ],
                    links: []
                }
            ],
            trees: []
        };

        const mockAttrDomain: Mockify<IAttributeDomain> = {
            getLibraryAttributes: global.__mockPromise([{id: 'simple'}, {id: 'advanced_link'}])
        };

        const mockValueDomain: Mockify<IValueDomain> = {
            saveValue: global.__mockPromise([]),
            getValues: global.__mockPromise([])
        };

        const mockRecordDomain: Mockify<IRecordDomain> = {
            createRecord: global.__mockPromise({id: '1'})
        };

        const mockValidateHelper: Mockify<IValidateHelper> = {
            validateLibrary: global.__mockPromise()
        };

        const imprtDomain = importDomain({
            'core.domain.record': mockRecordDomain as IRecordDomain,
            'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
            'core.domain.attribute': mockAttrDomain as IAttributeDomain,
            'core.domain.value': mockValueDomain as IValueDomain
        });

        await imprtDomain.import(data, ctx);

        expect(mockRecordDomain.createRecord.mock.calls.length).toBe(2);
        expect(mockAttrDomain.getLibraryAttributes.mock.calls.length).toBe(3);
        expect(mockValidateHelper.validateLibrary.mock.calls.length).toBe(2);
        expect(mockValueDomain.saveValue.mock.calls.length).toBe(3);
        expect(mockValueDomain.getValues.mock.calls.length).toBe(1);
    });

    test('test import elements - simple link with matches', async () => {
        const data = {
            elements: [
                {
                    library: 'test_import',
                    matches: [],
                    data: [
                        {
                            attribute: 'simple_link',
                            values: [
                                {
                                    value: [
                                        {
                                            attribute: 'login',
                                            value: 'admin'
                                        }
                                    ]
                                }
                            ],
                            action: Action.ADD
                        }
                    ],
                    links: []
                }
            ],
            trees: []
        };

        const mockAttrDomain: Mockify<IAttributeDomain> = {
            getLibraryAttributes: global.__mockPromise([{id: 'simple_link'}])
        };

        const mockValueDomain: Mockify<IValueDomain> = {
            saveValue: global.__mockPromise([])
        };

        const mockRecordDomain: Mockify<IRecordDomain> = {
            createRecord: global.__mockPromise({id: '1'}),
            find: global.__mockPromise({totalCount: 1, list: [{id: '1'}]})
        };

        const mockValidateHelper: Mockify<IValidateHelper> = {
            validateLibrary: global.__mockPromise()
        };

        const imprtDomain = importDomain({
            'core.domain.record': mockRecordDomain as IRecordDomain,
            'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
            'core.domain.attribute': mockAttrDomain as IAttributeDomain,
            'core.domain.value': mockValueDomain as IValueDomain
        });

        await imprtDomain.import(data, ctx);

        expect(mockRecordDomain.createRecord.mock.calls.length).toBe(1);
        expect(mockRecordDomain.find.mock.calls.length).toBe(1);
        expect(mockAttrDomain.getLibraryAttributes.mock.calls.length).toBe(1);
        expect(mockValidateHelper.validateLibrary.mock.calls.length).toBe(1);
        expect(mockValueDomain.saveValue.mock.calls.length).toBe(1);
    });

    test('test import trees', async () => {
        const data = {
            elements: [],
            trees: [
                {
                    library: 'users_groups',
                    treeId: 'users_groups',
                    matches: [
                        {
                            attribute: 'simple',
                            value: 'test'
                        }
                    ],
                    action: Action.UPDATE
                }
            ]
        };

        const mockTreeDomain: Mockify<ITreeDomain> = {
            isRecordPresent: global.__mockPromise(false),
            addElement: global.__mockPromise(),
            getNodesByRecord: global.__mockPromise([])
        };

        const mockRecordDomain: Mockify<IRecordDomain> = {
            find: global.__mockPromise({totalCount: 1, list: [{id: '123'}]})
        };

        const mockValidateHelper: Mockify<IValidateHelper> = {
            validateLibrary: global.__mockPromise()
        };

        const imprtDomain = importDomain({
            'core.domain.record': mockRecordDomain as IRecordDomain,
            'core.domain.helpers.validate': mockValidateHelper as IValidateHelper,
            'core.domain.tree': mockTreeDomain as ITreeDomain
        });

        await imprtDomain.import(data, ctx);

        expect(mockRecordDomain.find.mock.calls.length).toBe(1);
        expect(mockValidateHelper.validateLibrary.mock.calls.length).toBe(1);
        expect(mockTreeDomain.getNodesByRecord.mock.calls.length).toBe(1);
        expect(mockTreeDomain.addElement.mock.calls.length).toBe(1);
    });
});
