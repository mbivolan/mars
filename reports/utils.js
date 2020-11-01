
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
const TransformJson = (data, replacements, extras) => {
  let dataRemapped = []
  data.forEach(element => {
    // Remove extra keys
    Object.keys(element).forEach((key) => Object.keys(replacements).includes(key) || delete element[key]);
    const object = {}
    Object.keys(element).map((key) => {
      const newKey = replacements[key] || key;
      if (typeof newKey === "string") {
        object[newKey] = element[key];
        return
      } else {
        Object.keys(newKey).map((subkey) => {
          if (Array.isArray(element[key])) {
            object[newKey[subkey]] = []
            element[key].forEach(subelement => {
              object[newKey[subkey]].push(subelement[subkey])
            });
          } else {
            object[newKey[subkey]] = element[key][subkey];
          }
        })
      }
    });
    const mergedObj = Object.assign({}, object, extras)
    dataRemapped.push(mergedObj)
  });
  return dataRemapped
}

const TranfsormJsonData = (data, Arrkeys) => {
  for (const el of Arrkeys) {
    for (const [index, datael] of data.entries()) {
      if (datael[el] !== undefined) {
        datael[el] = datael[el].toString()
      }
    }
  }
}

const ReportBuilder = (data, cardinal, ordinal) => {
  obj = {}
  for (const datael of data) {
    switch (typeof datael[cardinal]) {
      case "string":
        obj[datael[cardinal]][datael[ordinal]] = 1
        break
      case "object":
        if (Array.isArray(datael[cardinal])) {
          for (const key of datael[cardinal]) {
            obj[key] = { [datael[ordinal]]: 1 }
          }
        }
        break
      case "undefined":
        break
    }
  }
  return obj
}

const ReportBuilderConvert = (data, cardinal, ordinal) => {
  obj = []
  for (const key1 of Object.keys(data)) {
    objtemp = { [cardinal]: key1, [ordinal]: [] }
    for (const key2 of Object.keys(data[key1])) {
      objtemp[ordinal].push(key2)
    }
    obj.push(objtemp)
  }
  return obj
}


module.exports = { TranfsormJsonData, TransformJson, ReportBuilder, ReportBuilderConvert }
