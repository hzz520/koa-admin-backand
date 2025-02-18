import fs from 'fs-extra'
import path from 'path'
import { globSync } from 'glob'

async function main() {
  const cwd = path.resolve(__dirname, '../src/zod')
  const files = globSync('*.ts', { cwd  })
  Promise.all(files.map(async (file) => {
    let filePath = path.resolve(cwd, file)
    let content = fs.readFileSync(filePath, { encoding: 'utf-8' })
    content = 
      // 'import { transform } from "../utils/transform"\n' + 
      content
      .replace(/.openapi\('refname', \{ format: "int64", type: "integer" \}\)/g, '')
      .replace(/z.bigint\(\)/g, `z.bigint().openapi('refname', { format: "int64", type: "integer" })`)
      // .replace(/\}\)\n$/, '}).transform(transform)\n')
    fs.writeFileSync(filePath, content, { encoding: 'utf-8' })
  }))
}

main()
