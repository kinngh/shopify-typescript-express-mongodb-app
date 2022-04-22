import express from "express";
import { appUninstallRoute } from "./app_uninstalled";
import { gdprRoutes } from "./gdpr";

const webhookRoutes = express.Router();

//Combine all routes here.
webhookRoutes.use("/", gdprRoutes);
webhookRoutes.use("/", appUninstallRoute);

export default webhookRoutes;
