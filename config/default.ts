module.exports = {
    graphql: {
        uri: process.env.GRAPHQL_URL,
        token: process.env.GRAPHQL_TOKEN,
        treeId: process.env.GRAPHQL_TREE_ID
    },
    filesystem: {
        absolutePath: process.env.FILESYSTEM_ABSOLUTE_PATH
    },
    rmq: {}
};
