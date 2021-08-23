import zlib from "zlib";
import fs from "fs";
import JSONStream from "JSONStream";
import consola from "consola";
import fileSystem from "fs";
import {getOffers} from "../models/offersModel"
import {uploadFileToS3Bucket} from "./offersRecipeSendToS3";

export const setOffersRecipe = async () => {

  try {
    let offers = await getOffers()

    const filePath = process.env.OFFERS_RECIPE_PATH

    let transformStream = JSONStream.stringify();
    let outputStream = fileSystem.createWriteStream(filePath!);

    transformStream.pipe(outputStream);

    offers?.forEach(transformStream.write);

    transformStream.end();

    outputStream.on(
      "finish",
      async function handleFinish() {

        await compressFileZlibSfl(filePath!)
        await deleteFile(filePath!)
        console.log(`File Offers(count:${offers?.length}) created path:${filePath} `)
      }
    )
    setTimeout(uploadFileToS3Bucket, 6000)

  } catch (e) {
    consola.error('setOffersToRedisError:', e)
  }

}

const generateFilePath = (recipeName: string) => {
  let date = new Date()
  let unixTimestamp = ~~(date.getTime() / 1000)
  return recipeName + '-' + unixTimestamp + '.json'
}


const compressFileZlibSfl = (fileName: string) => {

  return new Promise((resolve) => {
    let read = fs.createReadStream(fileName)
    let write = fs.createWriteStream(fileName + '.gz')
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


const deleteFile = (filePath: string) => {

  return new Promise((resolve, reject) => {

    fs.unlink(filePath, (err) => {
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
