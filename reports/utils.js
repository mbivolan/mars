BaseTypes = ['string', 'boolean', 'number',]

const TransformJson = (data, replacements, extras) => {
  let dataRemapped = []
  data.forEach(element => {
    // Remove extra keys
    Object.keys(element).forEach((key) => Object.keys(replacements).includes(key) || delete element[key]);
    // console.log("\n log1", "element: ", element, "\n")
    const object = {}
    Object.keys(element).map((key) => {
      const newKey = replacements[key] || key;
      // console.log("\n log2", "key: ", key, "newkey: ", newKey, "object[newKey]: ", object[newKey], "element[key]: ", element[key], "\n")
      if (typeof newKey === "string") {
        object[newKey] = element[key];
        return
      } else {
        Object.keys(newKey).map((subkey) => {
          // console.log("\n log3", "element[key]: ", element[key], "\n")
          if (Array.isArray(element[key])) {
            object[newKey[subkey]] = []
            element[key].forEach(subelement => {
              object[newKey[subkey]].push(subelement[subkey])
            });
          } else if (BaseTypes.includes(typeof element[key][subkey])) {
            // console.log("\n log4", newKey[subkey], "subkey: ", subkey, "element[key][subkey]: ", element[key][subkey], "\n")
            object[newKey[subkey]] = element[key][subkey];
          } else {
            // console.log("\n log5", newKey[subkey], "subkey: ", subkey, "element[key][subkey]: ", element[key][subkey], "\n")
            const ParsedOutput=ParseObjDeep(element[key][subkey] ,newKey[subkey],Object.keys(newKey[subkey])[0])
            object[ParsedOutput[1]]=ParsedOutput[0]
          }
        })
      }
    });
    const mergedObj = Object.assign({}, object, extras)
    dataRemapped.push(mergedObj)
  });
  return dataRemapped
}
const TransformObjToArr = (data, NewKey) => {
  NewDataObj = []
  Object.keys(data).map((key) => {
    data[key].map((elemArr) => {
      NewDataObj.push({ ...elemArr, [`${NewKey}`]: key })
    })
  })
  return NewDataObj
}

const ParseObjDeep=(data,keyvalues,key)=>{
  if (BaseTypes.includes(typeof keyvalues[key])) {
    console.log([data[key],keyvalues[key]])
  return [data[key],keyvalues[key]]
  }else{
    ParseObjDeep(data[value[key]],value[key],key)
  }
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


module.exports = { TranfsormJsonData, TransformObjToArr, TransformJson, ReportBuilder, ReportBuilderConvert }
