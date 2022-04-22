import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { ApiVersion, Shopify } from "@shopify/shopify-api";
import { resolve } from "path";
import dotenv from "dotenv";
import sessionStorage from "../utils/sessionStorage.js";
import webhookRoutes from "./webhooks/_routes.js";
import csp from "./middleware/csp.js";
import verifyRequest from "./middleware/verifyRequest.js";
import isActiveShop from "./middleware/isActiveShop.js";
import applyAuthMiddleware from "./middleware/auth.js";
import userRoutes from "./routes/index.js";
import { appUninstallHandler } from "./webhooks/app_uninstalled.js";
import {
  customerDataRequest,
  customerRedact,
  shopRedact,
} from "./webhooks/gdpr.js";

dotenv.config();
const PORT = parseInt(process.env.PORT, 10) || 8081;
const isDev = process.env.NODE_ENV === "dev";

const mongoUrl =
  process.env.MONGO_URL || "mongodb://127.0.0.1:27017/shopify-express-app";

mongoose.connect(mongoUrl, (err) => {
  if (err) {
    console.log(
      "--> An error occured while connecting to MongoDB",
      err.message
    );
  } else {
    console.log("--> Connected to MongoDB");
  }
});

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SHOPIFY_API_SCOPES as any,
  HOST_NAME: process.env.SHOPIFY_APP_URL.replace(/https:\/\//, ""),
  API_VERSION: process.env.SHOPIFY_API_VERSION as ApiVersion,
  IS_EMBEDDED_APP: true,
  SESSION_STORAGE: sessionStorage,
});

//MARK:- Add handlers for webhooks here.

Shopify.Webhooks.Registry.addHandlers({
  APP_UNINSTALLED: {
    path: "/webhooks/app_uninstalled",
    webhookHandler: appUninstallHandler as any,
  },
  CUSTOMERS_DATA_REQUEST: {
    path: "/webhooks/gdpr/customers_data_request",
    webhookHandler: customerDataRequest,
  },
  CUSTOMERS_REDACT: {
    path: "/webhooks/gdpr/customers_redact",
    webhookHandler: customerRedact,
  },
  SHOP_REDACT: {
    path: "/webhooks/gdpr/shop_redact",
    webhookHandler: shopRedact,
  },
});

const createServer = async (root = process.cwd()) => {
  const app = express();
  app.set("top-level-oauth-cookie", "shopify_top_level_oauth");
  app.set("use-online-tokens", true);

  app.use(cookieParser(Shopify.Context.API_SECRET_KEY));

  applyAuthMiddleware(app);

  app.use("/webhooks", webhookRoutes); //webhookRotues

  app.post("/graphql", verifyRequest(app), async (req, res) => {
    try {
      const response = await Shopify.Utils.graphqlProxy(req, res);
      res.status(200).send(response.body);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  app.use(express.json());
  app.use(csp);
  app.use(isActiveShop);

  let vite;
  if (isDev) {
    vite = await import("vite").then(({ createServer }) =>
      createServer({
        root,
        logLevel: isDev ? "error" : "info",
        server: {
          port: PORT,
          hmr: {
            protocol: "ws",
            host: "localhost",
            port: 64999,
            clientPort: 64999,
          },
          middlewareMode: "html",
        },
      })
    );

    app.use(vite.middlewares);
  } else {
    const compression = await import("compression").then(
      ({ default: fn }) => fn
    );
    const serveStatic = await import("serve-static").then(
      ({ default: fn }) => fn
    );
    const fs = await import("fs");

    app.use(compression());
    app.use(serveStatic(resolve("dist/client")));
    app.use("/*", (req, res, next) => {
      res
        .status(200)
        .set("Content-Type", "text/html")
        .send(fs.readFileSync(`${root}/dist/client/index.html`));
    });
  }

  app.use("/", userRoutes);

  return { app, vite };
};

createServer().then(({ app }) => {
  app.listen(PORT, () => {
    console.log(`Running on ${PORT}`);
  });
});
export default createServer;
