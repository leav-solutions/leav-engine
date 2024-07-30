// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import axios from 'axios';
import FormData from 'form-data';
import jwt, {Algorithm} from 'jsonwebtoken';
import {ActionsListConfig} from '_types/actionsList';
import {ITreeElement} from '_types/tree';
import {getConfig} from '../../../config';
import {adminsGroupId} from '../../../_constants/userGroups';
import {AttributeFormats, AttributeTypes, IAttributeVersionsConf, IEmbeddedAttribute} from '../../../_types/attribute';
import {ACCESS_TOKEN_COOKIE_NAME} from '../../../_types/auth';

async function _getAuthToken() {
    const conf = await getConfig();

    const token = jwt.sign(
        {
            userId: '1',
            login: 'admin',
            role: 'admin',
            groupsId: ['1']
        },
        conf.auth.key,
        {
            algorithm: conf.auth.algorithm as Algorithm,
            expiresIn: conf.auth.tokenExpiration
        }
    );

    return token;
}

export async function getGraphQLUrl() {
    const conf = await getConfig();

    return `http://${conf.server.host}:${conf.server.port}/graphql`;
}

export async function makeGraphQlCall(query: string | FormData, throwOnErrors = false): Promise<any> {
    try {
        const url = await getGraphQLUrl();
        const token = await _getAuthToken();

        const data = typeof query === 'string' ? {query} : query;
        const headers = {
            Cookie: `${ACCESS_TOKEN_COOKIE_NAME}=${token}`,
            ...(typeof query !== 'string' && (data as FormData).getHeaders())
        };

        const res = await axios.post(url, data, {headers});

        if (throwOnErrors && res.data.errors?.length) {
            throw new Error(
                `${res.data.errors[0].message} - ${JSON.stringify(
                    res.data.errors[0]?.extensions?.fields
                )} - Query was: ${query}`
            );
        }

        return res;
    } catch (e) {
        console.error('GraphQL query error:', e.message, '\n', e.response?.data ?? '', `- Query was: ${query}`);
        console.error(e);
        console.trace();
    }
}

export async function gqlSaveLibrary(id: string, label: string, additionalAttributes: string[] = []) {
    const baseAttributes = ['id', 'modified_by', 'modified_at', 'created_by', 'created_at'];
    const libAttributes = baseAttributes.concat(additionalAttributes);

    const saveLibRes = await makeGraphQlCall(
        `mutation {
        saveLibrary(library: {
            id: "${id}",
            label: {en: "${label}"},
            attributes: [${libAttributes.map(a => `"${a}"`).join(', ')}]
        }) { id }
    }`,
        true
    );

    return saveLibRes.data.data;
}

export async function gqlSaveApplication(id: string, label: string, endpoint: string) {
    const saveAppRes = await makeGraphQlCall(
        `mutation {
            saveApplication(application: {
                id: "${id}",
                label: {en: "${label}"},
                endpoint: "${endpoint}",
                module: "data-studio"
            }) { id }
        }`,
        true
    );

    return saveAppRes.data.data;
}

export async function gqlSaveAttribute(params: {
    id: string;
    type: AttributeTypes;
    label: string;
    description?: string;
    format?: AttributeFormats;
    versionsConf?: IAttributeVersionsConf;
    metadataFields?: string[];
    embeddedFields?: IEmbeddedAttribute[];
    linkedLibrary?: string;
    linkedTree?: string;
    multipleValues?: boolean;
    reverseLink?: string;
    actionsList?: ActionsListConfig;
}) {
    const {
        id,
        type,
        label,
        description,
        format = AttributeFormats.TEXT,
        versionsConf,
        metadataFields,
        embeddedFields,
        linkedLibrary,
        linkedTree,
        multipleValues,
        reverseLink,
        actionsList
    } = params;

    const _convertEmbeddedFields = (field: IEmbeddedAttribute): string => `
            {
                id: "${field.id}",
                format: ${field.format ?? 'null'},
                label: {en: "${field.id}"},
                validation_regex: ${field.validation_regex ? `"${field.validation_regex}"` : 'null'},
                embedded_fields: ${
                    field.embedded_fields ? `[${field.embedded_fields.map(_convertEmbeddedFields).join(', ')}]` : 'null'
                }
            }
        `;

    const _convertActionsList = (actions: ActionsListConfig): string => `
            {
                ${Object.keys(actions)
                    .map(eventKey => {
                        const eventActions = actions[eventKey].map(
                            actionConf => `{
                                id: "${actionConf.id}",
                                params: [${(actionConf?.params ?? [])
                                    .map(p => `{name: "${p.name}", value: "${p.value}"}`)
                                    .join(', ')}]
                            }`
                        );

                        return `${eventKey}: [${eventActions.join(', ')}]`;
                    })
                    .join(', ')}
            }
        `;

    const query = `mutation {
        saveAttribute(
            attribute: {
                id: "${id}",
                type: ${type},
                format: ${format},
                label: {en: "${label}"},
                description: {en: "${description ? `"${description}"` : 'null'}"},
                linked_library: ${linkedLibrary ? `"${linkedLibrary}"` : 'null'},
                reverse_link: ${reverseLink ? `"${reverseLink}"` : 'null'},
                linked_tree: ${linkedTree ? `"${linkedTree}"` : 'null'},
                metadata_fields: ${metadataFields ? `[${metadataFields.map(t => `"${t}"`).join(', ')}]` : 'null'},
                versions_conf: ${
                    versionsConf
                        ? `{
                            versionable: ${versionsConf.versionable ? 'true' : 'false'},
                            profile: "${versionsConf.profile}"
                        }`
                        : 'null'
                },
                embedded_fields: ${embeddedFields ? `${embeddedFields.map(_convertEmbeddedFields).join(', ')}` : 'null'}
                multiple_values: ${multipleValues ? 'true' : 'false'},
                actions_list: ${actionsList ? _convertActionsList(actionsList) : 'null'}
            }
        ) { id }
    }`;

    const saveAttrRes = await makeGraphQlCall(query, true);

    return saveAttrRes.data.data;
}

export async function gqlSaveTree(id: string, label: string, libraries: string[]) {
    const saveTreeRes = await makeGraphQlCall(
        `mutation {
        saveTree(
            tree: {
                id: "${id}",
                label: {en: "${label}"},
                libraries: [${libraries
                    .map(
                        l =>
                            `{library: "${l}", settings: {allowMultiplePositions: false, allowedAtRoot: true,  allowedChildren: ["__all__"]}}`
                    )
                    .join(', ')}]}
        ) {
            id
        }
    }`,
        true
    );

    return saveTreeRes.data.data;
}

export async function gqlCreateRecord(library: string): Promise<string> {
    const res = await makeGraphQlCall(
        `mutation {
        c: createRecord(library: "${library}") {
            record {
                id
            }
        }
    }
    `,
        true
    );

    return res.data.data.c.record.id;
}

export async function gqlGetAdminsGroupNodeId() {
    return adminsGroupId;
}

export async function gqlAddUserToGroup(groupNodeId: string) {
    const userGroupAttrId = 'user_groups';
    await makeGraphQlCall(
        `mutation {
        saveValue(library: "users", recordId: "1", attribute: "${userGroupAttrId}", value: {
            value: "${groupNodeId}"
        }) {
            id_value
        }
    }`,
        true
    );
}

/**
 * Add an element to the tree
 *
 * @param treeId
 * @param element
 * @param parent
 * @return Node ID
 */
export async function gqlAddElemToTree(
    treeId: string,
    element: ITreeElement,
    parent?: string,
    order?: number
): Promise<string> {
    const res = await makeGraphQlCall(
        `mutation {
        treeAddElement(
            treeId: "${treeId}",
            element: {id: "${element.id}", library: "${element.library}"}
            ${parent ? `parent: ${parent}` : ''}
            order: ${order ?? 0}
        ) { id }
    }`,
        true
    );

    return res.data.data.treeAddElement.id;
}

export async function gqlSaveValue(attributeId: string, libraryId: string, recordId: string, value: string | number) {
    await makeGraphQlCall(
        `mutation {
        saveValue(library: "${libraryId}", recordId: "${recordId}", attribute: "${attributeId}", value: {
            value: ${typeof value === 'string' ? `"${value}"` : value}
        }) {
            id_value
        }
    }`,
        true
    );
}

export async function gqlSaveVersionProfile(profileId: string, label: string, trees: string[]) {
    await makeGraphQlCall(
        `mutation {
            saveVersionProfile(versionProfile: {
                id: "${profileId}",
                label: {en: "label"},
                trees: [${trees.map(a => `"${a}"`).join(', ')}]
            }) {
            id
        }
    }`,
        true
    );
}

/**
 * Convert object to JSON, escaping quotes to be able to use it in a graphql query
 **/
export function toCleanJSON(obj: {}): string {
    return JSON.stringify(obj).replace(/[\""]/g, '\\"');
}
