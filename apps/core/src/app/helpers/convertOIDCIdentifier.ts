// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export interface IConvertOIDCIdentifier {
    encodeIdentifierToBase64Url: (identifier: string) => string;
    decodeIdentifierFromBase64Url: (identifierBase64UrlEncoded: string) => string;
}

export default function (): IConvertOIDCIdentifier {
    return {
        encodeIdentifierToBase64Url: identifier => Buffer.from(identifier).toString('base64url'),
        decodeIdentifierFromBase64Url: identifierBase64UrlEncoded =>
            Buffer.from(identifierBase64UrlEncoded, 'base64url').toString()
    };
}
