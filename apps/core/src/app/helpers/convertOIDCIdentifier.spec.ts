// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import createConvertOIDCIdentifier from './convertOIDCIdentifier';

describe('convertOIDCIdentifier', () => {
    const convertOIDCIdentifier = createConvertOIDCIdentifier();
    describe('encodeIdentifierToBase64Url', () => {
        it('should encode un base64url the identifier', () => {
            const randomIdentifier = '123456789';

            expect(convertOIDCIdentifier.encodeIdentifierToBase64Url(randomIdentifier)).toBe(
                convertOIDCIdentifier.encodeIdentifierToBase64Url(randomIdentifier)
            );
            expect(convertOIDCIdentifier.encodeIdentifierToBase64Url(randomIdentifier)).toBe('MTIzNDU2Nzg5');
        });
    });

    describe('decodeIdentifierFromBase64Url', () => {
        it('should retrieve identifier from base64url encoded', () => {
            const randomIdentifierEncoded = 'MTIzNDU2Nzg5';

            expect(convertOIDCIdentifier.decodeIdentifierFromBase64Url(randomIdentifierEncoded)).toBe(
                convertOIDCIdentifier.decodeIdentifierFromBase64Url(randomIdentifierEncoded)
            );
            expect(convertOIDCIdentifier.decodeIdentifierFromBase64Url(randomIdentifierEncoded)).toBe('123456789');
        });
    });

    it('should keep same value after encode/decode process', () => {
        const randomIdentifier = '123456789';
        expect(
            convertOIDCIdentifier.decodeIdentifierFromBase64Url(
                convertOIDCIdentifier.encodeIdentifierToBase64Url(randomIdentifier)
            )
        ).toBe(randomIdentifier);
    });
});
