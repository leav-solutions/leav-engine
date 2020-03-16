import scan from './scan';

(async function() {
    const fsTree = await scan.filesystem();
    const dbTree = await scan.database();

    console.log(fsTree);
    console.log(dbTree);
})().catch(e => console.error(e));
