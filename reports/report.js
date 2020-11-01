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
const XLSX = require('xlsx');

SupportedTypes=['XLSX']

const InitAggregator = (config) => {
    switch (config.output.report.toUpperCase()) {
        case SupportedTypes[0].toUpperCase():
            return  XLSX.utils.book_new();
      }    
}

const AddDataToAggregator = (wb,config, Data, header, workSheetName) => {
  switch (config.output.report.toUpperCase()) {
    case SupportedTypes[0].toUpperCase():
      try {
        const worksheet = XLSX.utils.json_to_sheet(Data, header);
        XLSX.utils.book_append_sheet(wb, worksheet, workSheetName);
      } catch (err) {
        console.log('error: ', err)
      }      
      break
  }
}
const WriteDataFromAggregator =  (wb,config) => {
    switch (config.output.report.toUpperCase()) {
        case SupportedTypes[0].toUpperCase():
          try {
            XLSX.writeFile(wb, `${config.output.path}`);
        } catch (err) {
            console.log('error: ', err)
          }          
          break
      }  
}
module.exports = { InitAggregator,AddDataToAggregator,WriteDataFromAggregator }
