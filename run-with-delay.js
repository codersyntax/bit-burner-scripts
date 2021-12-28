 export async function main(ns) {
    var scriptpath = ns.args[0];
    var delay = ns.args[1];
    var forwardedArgs = ns.args.length > 2 ? ns.args.slice(2) : [];
    await ns.sleep(delay || 100);
    var pid = ns.run(scriptpath, 1, ...forwardedArgs);
    if (!pid)
        ns.tprint(`Failed to spawn "${scriptpath}" with args: ${forwardedArgs} (bad file name or insufficient RAM?)`);
}