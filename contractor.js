import { getNsDataThroughFile, disableLogs, scanAllServers } from './helpers.js'
const scriptSolver = "./contractor.js.solver.js";

/** @param {NS} ns **/
export async function main(ns) {
    disableLogs(ns, ["scan"]);
    ns.print("Getting server list...");
    const servers = scanAllServers(ns);
    ns.print(`Got ${servers.length} servers. Searching for contracts on each...`);
    const contractsDb = servers.map(hostname => ({ hostname, contracts: ns.ls(hostname, '.cct') }))
        .filter(o => o.contracts.length > 0)
        .map(o => o.contracts.map(contract => ({ contract, hostname: o.hostname }))).flat();
    if (contractsDb.length == 0)
        return ns.print("Found no contracts to solve.");
    ns.print(`Found ${contractsDb.length} contracts to solve. Gathering contract data via separate scripts..."`);
    let contractsDictCommand = command => `Object.fromEntries(${JSON.stringify(contractsDb)}.map(c => [c.contract, ${command}]))`;
    let dictContractTypes = await getNsDataThroughFile(ns, contractsDictCommand('ns.codingcontract.getContractType(c.contract, c.hostname)'), '/Temp/contract-types.txt');
    let dictContractData = await getNsDataThroughFile(ns, contractsDictCommand('ns.codingcontract.getData(c.contract, c.hostname)'), '/Temp/contract-data.txt');
    contractsDb.forEach(c => c.type = dictContractTypes[c.contract]);
    contractsDb.forEach(c => c.data = dictContractData[c.contract]);
    ns.run('./run-with-delay.js', 1, scriptSolver, 1, JSON.stringify(contractsDb));
    await ns.sleep(10000);
}