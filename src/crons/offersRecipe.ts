import zlib from "zlib";
import fs from "fs";
import JSONStream from "JSONStream";
import consola from "consola";
import fileSystem from "fs";
import {uploadOffersFileToS3Bucket} from "./offersRecipeSendToS3";
import {compressFileZlibSfl, deleteFile} from "../utils";
import {getOffers} from "../models/offersModel";

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
    setTimeout(uploadOffersFileToS3Bucket, 6000)

  } catch (e) {
    consola.error('setOffersToRedisError:', e)
  }

}
