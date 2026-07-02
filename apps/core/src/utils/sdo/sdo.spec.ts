import {type ISDO} from '../../_types/sdo';
import sdoUtils from './sdo';

const _sdoUtils = sdoUtils();

describe('sdo (utils)', () => {
    describe('createHash', () => {
        const sdoContent = {
            system: {
                test: 'test',
                systemId: '95',
                systemActive: false,
                systemCreator: '12',
                systemCreationDate: 1717675756,
                systemLastModificator: '12',
                systemLastModifiedDate: 1717675756,
                systemLabel: 'my label',
            },
            info: {
                startDate: 1609243200,
                endDate: 1641211200,
                label: '2021_PAC_Retail Auchan',
                year: 2021,
                versionsList: [110, 2233, 2617, 111, 112],
            },
        };
        // Do not use mock from __tests__/mocks/sdo to avoid breaking test on any content changes
        const sdoForHash: ISDO = {
            dataModelRelease: 'dataModelRelease',
            name: 'campaign',
            date: Date.now(),
            action: 'CREATE',
            content: sdoContent,
        };
        it('[+] should create a hash from SDO content, idempotent depending on content only', () => {
            expect(_sdoUtils.createHash(sdoForHash)).toBe('96a2947f9d26a91cea27ee9f2f898d96');
            expect(_sdoUtils.createHash(sdoForHash)).toBe(_sdoUtils.createHash(sdoForHash));
            expect(_sdoUtils.createHash(sdoForHash)).toBe(
                _sdoUtils.createHash({
                    ...sdoForHash,
                    date: 123456789, // date is not part of the hash
                }),
            );
        });

        it('[-] should not create same hash for diff SDO content', () => {
            expect(_sdoUtils.createHash(sdoForHash)).not.toBe(
                _sdoUtils.createHash({
                    ...sdoForHash,
                    content: {
                        ...sdoContent,
                        system: {
                            ...sdoContent.system,
                            systemId: '96', // systemId change content
                        },
                    },
                }),
            );

            // content value is same, but attribute not order same. That result in diff json, so diff hash !
            // we could use a tool link https://github.com/SkeLLLa/node-object-hash to avoid that !
            expect(_sdoUtils.createHash(sdoForHash)).not.toBe(
                _sdoUtils.createHash({
                    ...sdoForHash,
                    content: {
                        ...sdoContent,
                        system: {
                            // same values as sdoContent.system but not same order
                            systemId: '95',
                            systemActive: false,
                            systemCreator: '12',
                            systemCreationDate: 1717675756,
                            systemLastModificator: '12',
                            systemLastModifiedDate: 1717675756,
                            systemLabel: 'my label',
                            test: 'test',
                        },
                    },
                }),
            );
        });
    });
});
