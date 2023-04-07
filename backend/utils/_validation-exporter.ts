import Ajv from 'ajv'
import * as fs from 'fs'
import * as path from 'path'
const standaloneCode = require('ajv/dist/standalone').default

const schema = {
  $id: 'https://example.com/bar.json',
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    bar: { type: 'string' },
  },
  required: ['bar'],
}

// The generated code will have a default export:
// `module.exports = <validateFunctionCode>;module.exports.default = <validateFunctionCode>;`
const ajv = new Ajv({ code: { source: true } })
const validate = ajv.compile(schema)
let moduleCode = standaloneCode(ajv, validate)

// Now you can write the module code to file
fs.writeFileSync(path.join(__dirname, '../consume/validate-cjs.js'), moduleCode)
