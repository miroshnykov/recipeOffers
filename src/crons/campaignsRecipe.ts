import zlib from "zlib";
import fs from "fs";
import JSONStream from "JSONStream";
import consola from "consola";
import fileSystem from "fs";
import {getCampaigns} from "../models/campaignsModel";
import {compressFileZlibSfl, deleteFile} from "../utils";
import {uploadCampaignsFileToS3Bucket} from "./campaignsRecipeSendToS3";
export const setCampaignsRecipe = async () => {

  try {
    let offers = await getCampaigns()

    const filePath = process.env.CAMPAIGNS_RECIPE_PATH

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
    setTimeout(uploadCampaignsFileToS3Bucket, 6000)

  } catch (e) {
    consola.error('setOffersToRedisError:', e)
  }

}

