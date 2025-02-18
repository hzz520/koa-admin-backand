import fs from 'fs-extra'
import path from 'path'
import multer from './muilter'

//获取文件后缀
function getFileExtension(filename) {
  let mimetype = filename.split('.').pop()
  mimetype = mimetype ? '.' + mimetype : ''
  return mimetype
}
const getMathRandom = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return (Math.floor(Math.random() * (max - min + 1)) + min).toString()
}

const dirname = path.join(__dirname, '../../', 'uploads/article')

fs.ensureDir(dirname)

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dirname)
  },
  filename: function (req, file, cb) {
    let filename = Date.now() + getMathRandom(0, 1000) //使用时间戳加随机数防止重名
    let mimetype = getFileExtension(file.originalname) //获取文件后缀
    cb(null, filename + mimetype)
  },
})

export const upload = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1000 },
})
