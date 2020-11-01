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
const { LogWritter } = require("./LogWritter")
const {InitAggregator,AddDataToAggregator,WriteDataFromAggregator} = require("./reports/report")
program.option("-c, --config <src>", "Path to the config file");
program.option("-o, --output <src>", "Path to the output folder");

program.version(version);
program.parse(process.argv);
if (program.debug) console.log(program.opts());

console.log("Initializing memory cache ...");
const Stor = new DStore();

console.log("Loading config ...");
console.log(`${program.config}`, fs.existsSync(`${program.config}`));
config = new cfgParser(program.config);
output = program.output
const workbook = InitAggregator(config)
console.log("Running:");

if (config.Qualys) {
    for (const [index, entry] of config.Qualys.entries()) {
        QualysApi.init(entry.credentials, index, config, Stor, entry.requests, LogWritter)
    }
}

if (config.GCP) {
        for (const [index, entry] of config.GCP.entries()) {

        GCPApi.init(entry.credentials, index, config, Stor, entry.requests, LogWritter)
    }
}

if (config.PrismaCloud) {
        for (const [index, entry] of config.PrismaCloud.entries()) {
        PrismaCloudApi.init(entry.credentials, index, config, Stor, entry.requests, {workbook, AddDataToAggregator});
        }
}

process.on('exit', ()=>{WriteDataFromAggregator(workbook,config)});