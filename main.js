/*
     Copyright 2020 SJULTRA, inc.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

 */
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
        const AggConf = InitAggregator(cfg)
        QualysApi.init(entry.credentials, index, cfg, Stor, entry.requests, { AggConf, AddDataToAggregator, runtimeReportOBJ })
        WriteDataFromAggregator(AggConf)
    }
}

if (cfg.GCP) {
    for (const [index, entry] of cfg.GCP.entries()) {
        const AggConf = InitAggregator(cfg)
        GCPApi.init(entry.credentials, index, cfg, Stor, entry.requests, { AggConf, AddDataToAggregator, runtimeReportOBJ })
        WriteDataFromAggregator(AggConf)
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
    outputWritter.AddDataToAggregator(AggConf, data)
    WriteDataFromAggregator(AggConf, 'RunTime')
});