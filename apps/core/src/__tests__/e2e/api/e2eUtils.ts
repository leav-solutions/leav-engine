// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// eslint-disable-next-line max-classes-per-file
import WebSocket from 'ws';
import {type Client as GraphqlWsClient, createClient as createGraphqlWsClient} from 'graphql-ws';
import axios, {type AxiosResponse} from 'axios';
import FormData from 'form-data';
import jwt, {type Algorithm} from 'jsonwebtoken';
import {type ActionsListConfig} from '_types/actionsList';
import {type ITreeElement} from '_types/tree';
import {getConfig} from '../../../config';
import {adminsGroupId, adminUserId} from '../../../_constants/users';
import {
    AttributeFormats,
    type AttributeTypes,
    type IAttributeVersionsConf,
    type IEmbeddedAttribute,
} from '../../../_types/attribute';
import {ACCESS_TOKEN_COOKIE_NAME} from '../../../_types/auth';
import {USERS_LIBRARY} from '../../../_types/library';
import {logger} from '@leav/logger';

interface IE2EUser {
    getAuthToken: () => Promise<string>;
}

interface IE2EUserParams {
    userId: string;
    groupsId: string[];
}

const e2eUser = ({userId, groupsId}: IE2EUserParams): IE2EUser => ({
    getAuthToken: async () => {
        const conf = await getConfig();

        return jwt.sign(
            {
                userId,
                groupsId,
            },
            conf.auth.key,
            {
                algorithm: conf.auth.algorithm as Algorithm,
                expiresIn: conf.auth.tokenExpiration,
            },
        );
    },
});

export const e2eAdminUser = (): IE2EUser => e2eUser({userId: adminUserId, groupsId: [adminsGroupId]});

let guestUserId;
export const e2eGuestUser = async (): Promise<IE2EUser> => {
    if (!guestUserId) {
        logger.verbose('Creating guest user...');
        const res = await makeGraphQlCall(
            `mutation {
            createRecord(library: "${USERS_LIBRARY}", data: {
                values: [{
                        attribute: "email",
                        payload: "guest@aristid.com"
                    }]
                }
            ) {
                record {
                    id
                }
            }
        }`,
        );
        guestUserId = res.data.data.createRecord.record.id;
    }
    return e2eUser({userId: guestUserId, groupsId: []});
};

export async function getGraphQLUrl() {
    const conf = await getConfig();

    return `http://${conf.server.host}:${conf.server.port}/graphql`;
}

export class E2EGraphQLError extends Error {
    public constructor(
        message: string,
        public readonly response: AxiosResponse,
    ) {
        super(message);
    }
}

export interface IMakeGraphQlCallOptions {
    user?: IE2EUser;
    skipLogErrors?: boolean;
}

export async function makeGraphQlCall(query: string | FormData, options?: IMakeGraphQlCallOptions): Promise<any> {
    const user = options?.user ?? e2eAdminUser();
    try {
        const url = await getGraphQLUrl();
        const token = await user.getAuthToken();

        const data = typeof query === 'string' ? {query} : query;
        const headers = {
            Cookie: `${ACCESS_TOKEN_COOKIE_NAME}=${token}`,
            ...(typeof query !== 'string' && (data as FormData).getHeaders()),
        };

        const res = await axios.post(url, data, {headers});

        if (res.status === 200 && res.data.errors?.length) {
            throw new E2EGraphQLError(
                `${res.data.errors[0].message} - ${JSON.stringify(
                    res.data.errors[0]?.extensions?.fields,
                )} - Code ${res.data.errors[0]?.extensions?.code} - Query was: ${query}`,
                res,
            );
        } else if (res.status !== 200) {
            throw new E2EGraphQLError(`HTTP error ${res.status} - Query was: ${query}`, res);
        }

        return res;
    } catch (e) {
        if (!(e instanceof E2EGraphQLError) && !options?.skipLogErrors) {
            console.error('GraphQL query error:', e.message, '\n', e.response?.data ?? '', `- Query was: ${query}`);
        }
        throw e;
    }
}
export async function importFileGraphQlCall(query: string, filePath: string, sheets = undefined) {
    try {
        const url = await getGraphQLUrl();
        const token = await e2eAdminUser().getAuthToken();

        const operations = {
            query,
            variables: {
                file: null,
                sheets,
            },
        };

        const map = {'0': ['variables.file']};

        const form = new FormData();
        form.append('operations', JSON.stringify(operations));
        form.append('map', JSON.stringify(map));
        form.append('0', require('fs').createReadStream(filePath));

        const headers = {
            Cookie: `${ACCESS_TOKEN_COOKIE_NAME}=${token}`,
            ...form.getHeaders(),
            'x-apollo-operation-name': 'importFile',
        };

        const response = await axios.post(url, form, {headers});

        return response.data;
    } catch (e) {
        if (!(e instanceof E2EGraphQLError)) {
            console.error('GraphQL query error:', e.message, '\n', e.response?.data ?? '', `- Query was: ${query}`);
        }
        throw e;
    }
}

export async function gqlSaveLibrary(
    id: string,
    label: string,
    additionalAttributes: string[] = [],
    settings?: string,
) {
    const baseAttributes = ['id', 'modified_by', 'modified_at', 'created_by', 'created_at'];
    const libAttributes = baseAttributes.concat(additionalAttributes);

    const saveLibRes = await makeGraphQlCall(
        `mutation {
        saveLibrary(library: {
            id: "${id}",
            label: {en: "${label}"},
            attributes: [${libAttributes.map(a => `"${a}"`).join(', ')}]
            ${settings ? `settings: ${settings}` : ''}
        }) { id }
    }`,
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
    unique?: boolean;
    actionsList?: ActionsListConfig;
    required?: boolean;
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
        unique,
        reverseLink,
        actionsList,
        required,
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
                            }`,
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
                required: ${required ? 'true' : 'false'}
                unique: ${unique ? 'true' : 'false'}
            }
        ) { id }
    }`;

    const saveAttrRes = await makeGraphQlCall(query);

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
                            `{library: "${l}", settings: {allowMultiplePositions: false, allowedAtRoot: true,  allowedChildren: ["__all__"]}}`,
                    )
                    .join(', ')}]}
        ) {
            id
        }
    }`,
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
            payload: "${groupNodeId}"
        }) {
            id_value
        }
    }`,
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
    parent?: string | null,
    order?: number,
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
    );

    return res.data.data.treeAddElement.id;
}

export async function gqlSaveValue(attributeId: string, libraryId: string, recordId: string, value: string | number) {
    await makeGraphQlCall(
        `mutation {
        saveValue(library: "${libraryId}", recordId: "${recordId}", attribute: "${attributeId}", value: {
            payload: ${typeof value === 'string' ? `"${value}"` : value}
        }) {
            id_value
        }
    }`,
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
    );
}

/**
 * Convert object to JSON, escaping quotes to be able to use it in a graphql query
 **/
export function toCleanJSON(obj: {}): string {
    return JSON.stringify(obj).replace(/[\""]/g, '\\"');
}

export async function makeWebSocketGraphQlCall(options?: {user: IE2EUser}): Promise<GraphqlWsClient> {
    const user = options?.user ?? e2eAdminUser();
    const config = await getConfig();
    const token = await user.getAuthToken();
    const headers = {
        Cookie: `${ACCESS_TOKEN_COOKIE_NAME}=${token}`,
    };

    class MyWebSocket extends WebSocket {
        public constructor(address, protocols) {
            super(address, protocols, {
                headers,
            });
        }
    }

    return createGraphqlWsClient({
        url: `ws://${config.server.host}:${config.server.port}/graphql`,
        webSocketImpl: MyWebSocket,
    });
}

export async function waitGraphqlWebSocketMessage<T>(
    client: GraphqlWsClient,
    query: string,
    variables: Record<string, any>,
    acceptMessage: (msg: T) => boolean,
    {timeoutMs}: {timeoutMs},
): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Wait message timeout'));
        }, timeoutMs || 20_000);

        client.subscribe(
            {
                query,
                variables,
            },
            {
                next: data => {
                    const msg = data.data as unknown as T;
                    if (acceptMessage(msg)) {
                        clearTimeout(timeout);
                        resolve(msg);
                    }
                },
                error: err => {
                    clearTimeout(timeout);
                    reject(err);
                },
                complete: () => {
                    clearTimeout(timeout);
                },
            },
        );
    });
}

export async function waitWebSocketMessage<T>(
    webSocket: WebSocket,
    acceptMessage: (msg: T) => boolean,
    {timeoutMs}: {timeoutMs},
): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timeout = setTimeout(() => {
            webSocket.close();
            reject(new Error('Wait message timeout'));
        }, timeoutMs || 20_000);

        webSocket.onmessage = (event: WebSocket.MessageEvent) => {
            try {
                const msg = JSON.parse(event.data.toString());
                if (acceptMessage(msg)) {
                    clearTimeout(timeout);
                    webSocket.close();
                    resolve(msg);
                }
            } catch (e) {
                if (e instanceof SyntaxError) {
                    // Depending on what is received, maybe ignore those message in later code changes
                    console.warn('Received non-JSON message over WebSocket:', event.data.toString());
                }
                clearTimeout(timeout);
                webSocket.close();
                reject(e);
            }
        };

        webSocket.onerror = (error: WebSocket.ErrorEvent) => {
            clearTimeout(timeout);
            webSocket.close();
            reject(error);
        };

        webSocket.onclose = () => {
            clearTimeout(timeout);
        };
    });
}
