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
const sc = require('@google-cloud/security-center');
const fs = require('fs');

const LogWritter = async(config,filetype, Data, func) => {
    console.log(config.output.mode)
    switch(config.output.mode.toUpperCase()) {
        case "FILE":
            try {
                fs.appendFile(`${config.output.path}/${func}.${filetype}`, Data, function (err) {
                  if (err) return console.log(err);
                  console.log(`Wrote succesfully the ${func} log`);
                })
              } catch (err) {
                console.log("error: ", err);
            }
            
        break;
        case "MYSQL":
          // code block
          break;
        default:
          // code block
      }
    };
  

module.exports = { LogWritter };