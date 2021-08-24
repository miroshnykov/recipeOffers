import {createServer} from "http";
import {Server, Socket} from "socket.io";
import * as socketio from "socket.io";
// import {db} from "./db/mysql";
import {FieldPacket, Pool} from 'mysql2/promise';
import {connect} from './db/mysql';
import 'dotenv/config';
import consola from "consola";

import express, {Application, Request, Response, NextFunction} from 'express'
import {setOffersRecipe} from "./crons/offersRecipe"
import {setFileSizeOffers} from "./crons/offersFileSize";
import {redis} from "./redis";
import {setCampaignsRecipe} from "./crons/campaignsRecipe";
import {setFileSizeCampaigns} from "./crons/campaignsFileSize";

const app: Application = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {});

app.get('/recipe', async (req: Request, res: Response) => {

  const conn: Pool = await connect();

  let sql = `
      SELECT o.id                    AS offerId,
             o.name                  AS name,
             a.id                    AS advertiserId,
             a.name                  AS advertiserName,
             o.advertiser_manager_id AS advertiserManagerId,
             v.id                    AS verticalId,
             v.name                  AS verticalName,
             o.currency_id           AS currencyId,
             o.status                AS status,
             o.payin                 AS payin,
             o.payout                AS payout,
             o.is_cpm_option_enabled AS isCpmOptionEnabled,
             o.payout_percent        AS payoutPercent,
             lp.id                   AS landingPageId,
             lp.url                  AS landingPageUrl,
             o.sfl_offer_geo_id      AS sflOfferGeoId,
             g.rules                 AS geoRules,
             g.sfl_offer_id          AS geoOfferId,
             o.conversion_type       AS conversionType,
             lps.rules               AS customLpRules,
             c.sfl_offer_id          AS capOfferId,
             o.use_start_end_date    AS useStartEndDate,
             o.start_date            AS startDate,
             o.end_date              AS endDate,
             o.type
      FROM sfl_offers o
               left join sfl_offer_landing_pages lp
                         ON lp.id = o.sfl_offer_landing_page_id
               left join sfl_offer_geo g
                         ON g.sfl_offer_id = o.id
               left join sfl_offer_custom_landing_pages lps
                         ON o.id = lps.sfl_offer_id
               left join sfl_advertisers a
                         ON a.id = o.sfl_advertiser_id
               left join sfl_vertical v
                         ON v.id = o.sfl_vertical_id
               left join sfl_offers_cap c
                         ON c.sfl_offer_id = o.id
  `
  const [offers]: [any[], FieldPacket[]] = await conn.query(sql);
  conn.end();

  return res.status(200).json(offers);
})

io.on('connection', (socket: Socket) => {
  consola.info('connection');
  socket.on('fileSizeOffersCheck', async (fileSizeOffersCheck) => {
    try {
      // consola.info(`Get size from engine:${fileSizeOffersCheck}`)
      let fileSizeOffersRecipe = await redis.get(`offersSize`)
      if (fileSizeOffersCheck !== fileSizeOffersRecipe) {
        consola.warn(`fileSize is different `)
        consola.info(`fileSizeOffersCheck:${fileSizeOffersCheck}, fileSizeOffersRecipe:${fileSizeOffersRecipe}`)
        io.to(socket.id).emit("fileSizeOffersCheck", fileSizeOffersRecipe)
      }

    } catch (e) {
      console.log('fileSizeOffersCheckError:', e)
    }
  })

  socket.on('fileSizeCampaignsCheck', async (fileSizeCampaignsCheck) => {
    try {
      let fileSizeCampaignsRecipe = await redis.get(`campaignsSize`)
      if (fileSizeCampaignsCheck !== fileSizeCampaignsRecipe) {
        consola.warn(`fileSize campaigns  is different `)
        consola.info(`fileSizeCampaignsCheck:${fileSizeCampaignsCheck}, fileSizeCampaignsRecipe:${fileSizeCampaignsRecipe}`)
        io.to(socket.id).emit("fileSizeCampaignsCheck", fileSizeCampaignsCheck)
      }

    } catch (e) {
      console.log('fileSizeCampaignsCheckError:', e)
    }
  })

  socket.on('disconnect', () => {
    consola.warn(`client disconnected ID:${socket.id}`);
  })
});

io.on('connect', async (socket: Socket) => {
  consola.info(`connect id`, socket.id)
})

if (process.env.ENV !== 'development') {
  setInterval(setCampaignsRecipe, 60000) // 60000 -> 60 sec
  setInterval(setOffersRecipe, 60000) // 60000 -> 60 sec

  setInterval(setFileSizeOffers, 20000) // 6000 -> 6 sec
  setInterval(setFileSizeCampaigns, 20000) // 6000 -> 6 sec
}

setTimeout(setCampaignsRecipe, 6000) // 6000 -> 6 sec
setTimeout(setOffersRecipe, 6000) // 6000 -> 6 sec

setTimeout(setFileSizeOffers, 20000) // 6000 -> 6 sec
setTimeout(setFileSizeCampaigns, 20000) // 6000 -> 6 sec

const host: string = process.env.HOST || ''
const port: number = parseInt(process.env.PORT || '3001')
httpServer.listen(port, host, (): void => console.log(`server is running on ${port}`));