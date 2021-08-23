import fs from "fs";
import AWS from 'aws-sdk'
import consola from "consola";
import {getFileSize} from "../utils";
import {redis} from "../redis";
import {ManagedUpload} from "aws-sdk/lib/s3/managed_upload";
import SendData = ManagedUpload.SendData;
import * as dotenv from "dotenv";

dotenv.config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const tempFileName = process.env.OFFERS_RECIPE_PATH+'.gz'
const offersFileS3RecipePath = 'unprocessed/offersRecipe.json.gz'
export const uploadFileToS3Bucket = async () => {
  try {

    fs.readFile(tempFileName!, (err, data) => {
      if (err) throw err;
      const params = {
        Bucket: 'adcenter-redshift-logs-staging',
        Key: offersFileS3RecipePath,
        Body: data
      };
      s3.upload(params, (err: Error, data: SendData) => {
        if (err) {
          consola.error(err);
        }
        consola.info(`File uploaded successfully at ${data.Location}`);
      });
      // s3.upload(params, function(s3Err, data) {
      //   if (s3Err) throw s3Err
      //   console.log(`File uploaded successfully at ${data.Location}`)
      // });
    });


  } catch (error) {
    console.error('s3 upload error:', error)
  } finally {

  }

}

