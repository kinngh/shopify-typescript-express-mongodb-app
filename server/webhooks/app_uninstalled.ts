import express from "express";
import { Shopify } from "@shopify/shopify-api";

import SessionModel from "../../utils/models/SessionModel";
import StoreModel from "../../utils/models/StoreModel";

const appUninstallRoute = express.Router();

const appUninstallHandler = async (topic, shop, webhookRequestBody) => {
  await StoreModel.findOneAndUpdate({ shop }, { isActive: false });

  var regexp = new RegExp("^" + shop);
  await SessionModel.deleteMany({ shop: regexp });
};

appUninstallRoute.post("/app_uninstalled", async (req, res) => {
  console.log("Processing app_uninstalled webhook");
  try {
    await Shopify.Webhooks.Registry.process(req, res);
    console.log("--> APP_UNINSTALLED processed");
  } catch (error) {
    console.log("--> Error in processing APP_UNINSTALLED:", error);
    res.status(500).send(error.message);
  }
});

export { appUninstallHandler, appUninstallRoute };
