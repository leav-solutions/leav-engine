import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import {AttributeFormats, AttributeTypes, IAttributeVersionsConf} from '_types/attribute';
import {config} from '../../config';

async function _getAuthToken() {
    const conf: any = await config;

    const token = jwt.sign(
        {
            userId: '1',
            login: 'admin',
            role: 'admin'
        },
        conf.auth.key,
        {
            algorithm: conf.auth.algorithm,
            expiresIn: conf.auth.tokenExpiration
        }
    );

    return token;
}

async function _getGraphQLUrl() {
    const conf: any = await config;

    return `http://${conf.server.host}:${conf.server.port}/graphql`;
}

export async function makeGraphQlCall(query: string): Promise<any> {
    try {
        const url = await _getGraphQLUrl();
        const token = await _getAuthToken();

        const res = await axios.post(url, {query}, {headers: {Authorization: token}});

        return res;
    } catch (e) {
        console.error('GraphQL query error:', e.message, '\n', e.response.data);
    }
}

export async function gqlSaveLibrary(id: string, label: string, additionalAttributes: string[] = []) {
    const baseAttributes = ['id', 'modified_by', 'modified_at', 'created_by', 'created_at'];
    const libAttributes = baseAttributes.concat(additionalAttributes);

    const saveLibRes = await makeGraphQlCall(`mutation {
        saveLibrary(library: {
            id: "${id}",
            label: {fr: "${label}"},
            attributes: [${libAttributes.map(a => `"${a}"`).join(', ')}]
        }) { id }
    }`);

    await makeGraphQlCall(`mutation { refreshSchema }`);

    return saveLibRes.data.data;
}

export async function gqlSaveAttribute(
    id: string,
    type: AttributeTypes,
    label: string,
    format?: AttributeFormats,
    versionsConf?: IAttributeVersionsConf,
    metadataFields?: string[]
) {
    const query = `mutation {
        saveAttribute(
            attribute: {
                id: "${id}",
                type: ${type},
                format: ${format || 'text'},
                label: {fr: "${label}"},
                metadata_fields: ${metadataFields ? `[${metadataFields.map(t => `"${t}"`).join(', ')}]` : 'null'},
                versions_conf: ${
                    versionsConf
                        ? `{versionable: ${
                              versionsConf.versionable ? 'true' : 'false'
                          }, trees: [${versionsConf.trees.map(t => `"${t}"`).join(', ')}]}`
                        : 'null'
                }
            }
        ) { id }
    }`;
    const saveAttrRes = await makeGraphQlCall(query);
    await makeGraphQlCall(`mutation { refreshSchema }`);

    return saveAttrRes.data.data;
}

export async function gqlSaveTree(id: string, label: string, libraries: string[]) {
    const saveTreeRes = await makeGraphQlCall(`mutation {
        saveTree(
            tree: {id: "${id}", label: {fr: "${label}"}, libraries: [${libraries.map(l => `"${l}"`).join(', ')}]}
        ) {
            id
        }
    }`);

    return saveTreeRes.data.data;
}

export async function gqlCreateRecord(library: string): Promise<number> {
    const res = await makeGraphQlCall(`mutation {
        c: createRecord(library: "${library}") {
            id
        }
    }
    `);

    return res.data.data.c.id;
}
