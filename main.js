const { program } = require("commander");
const fs = require("fs");
const QualysApi = require("./Qualys");
const GCPApi = require("./GCP");
const PrismaCloudApi = require("./PrismaCloud");
const cfgParser = require("./configParser.js");
const DStore = require("./dataStore");
const version = require("./package.json").version;
const { InitAggregator, AddDataToAggregator, WriteDataFromAggregator } = require("./reports/report");
program.option("-c, --config <src>", "Path to the config file");
program.option("-o, --output <src>", "Path to the output folder");

program.version(version);
program.parse(process.argv);
if (program.debug) console.log(program.opts());

console.log("Initializing memory cache ...");
const Stor = new DStore();

console.log("Loading config ...");
console.log(`${program.config}`, fs.existsSync(`${program.config}`));
cfg = new cfgParser(program.config);
output = program.output
console.log("Running:");

const runtimeReportOBJ = []


if (cfg.Qualys) {
    for (const [index, entry] of cfg.Qualys.entries()) {
        console.log("inits config")
        QualysApi.init(entry.credentials, index, cfg, Stor, entry.requests, runtimeReportOBJ)
    }
}

if (cfg.GCP) {
    for (const [index, entry] of cfg.GCP.entries()) {
        console.log("inits config")
        GCPApi.init(entry.credentials, index, cfg, Stor, entry.requests, runtimeReportOBJ)
    }
}

if (cfg.PrismaCloud) {
    for (const [index, entry] of cfg.PrismaCloud.entries()) {
        console.log("inits config")
        PrismaCloudApi.init(entry.credentials, index, cfg, Stor, entry.requests, runtimeReportOBJ)
    }
}
process.on('unhandledRejection', (reason) => {
    console.log('Reason: ' + reason);
});

process.on('exit', () => {
    headerList = ['account id', 'name', 'apiURL', 'entries', 'reason']
    const AggConf = InitAggregator(cfg)
    data = { data: runtimeReportOBJ, header: { header: headerList }, workSheetName: 'Runtime', funcName: 'RunTimeStats' }
    console.log("data:", data)

    outputWritter.AddDataToAggregator(AggConf, data)
    WriteDataFromAggregator(AggConf, 'RunTime')
});
