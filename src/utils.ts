import {promises as fs} from "fs";
import consola from "consola";
import zlib from "zlib";
import file from "fs";

export const getFileSize = async (filename: string) => {
  try {
    let stats = await fs.stat(filename)
    return stats?.size | 0
  } catch (e) {
    consola.error('File Size:', e);
  }
}

export const compressFileZlibSfl = (fileName: string) => {

  return new Promise((resolve) => {
    let read = file.createReadStream(fileName)
    let write = file.createWriteStream(fileName + '.gz')
    let compress = zlib.createGzip()
    read.pipe(compress).pipe(write)
    compress.on('unpipe', (compression) => {
      if (compression._readableState.ended === true) {
        // console.log('Compression stream ended');
        return new Promise((resolve) => {
          write.on('finish', () => {
            // console.log('Compression fully finished');
            resolve(write);
          })
        }).then(() => {
          // console.log(`sfl resolve fileName:${fileName}`)
          resolve(fileName)
        }).catch((err) => {
          console.log(`sfl unpipe error fileName:${fileName}`, err)
        })
      }
    })
    compress.on('errors', (err) => {
      console.log(`sfl compress error: fileName:${fileName}`, err)
    })
    write.on('error', (err) => {
      console.log(`sfl write error: fileName:${fileName}`, err)
    })
  }).catch((err) => {
    console.log(`compressFileZlibError fileName:${fileName}`, err)
  })
}

export const deleteFile = (filePath: string) => {

  return new Promise((resolve, reject) => {

    file.unlink(filePath, (err) => {
      if (err) {
        console.error(err)
        reject(filePath)
      } else {
        console.log(`delete file:${filePath}`)
        resolve(filePath)
      }
    });
  })
};

