const XLSX = require('xlsx');
const fs = require('fs');
const { parse } = require('json2csv');

SupportedTypes = ['XLSX', 'CSV', 'MYSQL']

const InitAggregator = (config) => {
  AggregatorConfig = {
    Type: config.output.report.toUpperCase(),
    outputPath: config.output.path,
    workBook:null,
    workSheetName: null
  }
  switch (config.output.report.toUpperCase()) {
    case SupportedTypes[0].toUpperCase():
      AggregatorConfig.workBook = XLSX.utils.book_new();
      break

    case SupportedTypes[1].toUpperCase():

      break

    case SupportedTypes[2].toUpperCase():

      break

  }
  return AggregatorConfig
}
// DATA: { data:null,header:null,workSheetName:null,funcName:null,}
const AddDataToAggregator = (AggregatorConfig, Data) => {
  switch (AggregatorConfig.Type) {
    case SupportedTypes[0].toUpperCase():
      try {
        const worksheet = XLSX.utils.json_to_sheet(Data.data, Data.header);
        XLSX.utils.book_append_sheet(AggregatorConfig.workBook, worksheet, Data.workSheetName);
      } catch (err) {
        console.log('error: ', err)
      }
      break
    case SupportedTypes[1].toUpperCase():
      try {
        const opts = { fields:[...Data.header.header] };
        const csv = parse(Data.data, opts);
        console.log("datopts",csv,"\n","outp ",`${AggregatorConfig.outputPath}${Data.funcName}.csv`)
        fs.appendFileSync(
          `${AggregatorConfig.outputPath}/${Data.funcName}.csv`,
          csv,
          function (err) {
            if (err) return console.log(err)
            console.log(`Wrote succesfully the ${Data.funcName} log`)
          }
        )
      } catch (err) {
        console.log('error: ', err)
      }
      break
    case SupportedTypes[2].toUpperCase():
      const { PrismaClient } = require('@prisma/client')
      const prisma = new PrismaClient()
      prisma.post.create({
      }).catch(e => {
        throw e
      }).finally(async () => {
        await prisma.$disconnect()
      })
      break
  }
}

const WriteDataFromAggregator = (AggregatorConfig,PathMod) => {
  switch (AggregatorConfig.Type) {
    case SupportedTypes[0].toUpperCase():
      try {
        XLSX.writeFile(AggregatorConfig.workBook, `${AggregatorConfig.outputPath}` + `Report_${new Date().toISOString().split('T')[0]}`+ `${PathMod}`+ ".XLSX");
      } catch (err) {
        console.log('error: ', err)
      }
      break
    case SupportedTypes[1].toUpperCase():
      console.log("DONE")
    case SupportedTypes[2].toUpperCase():
      console.log("DONE")
  }
}
module.exports = { InitAggregator, AddDataToAggregator, WriteDataFromAggregator }
