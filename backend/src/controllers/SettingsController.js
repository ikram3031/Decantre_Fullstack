import { StoreSettingsModel } from "../models/storeSettings.model.js";
import {
  getMetaPixelConfig,
  testMetaCapiConnection,
} from "../services/facebookCapi.service.js";

// Retrieves full Meta Pixel and Conversions API settings for Dashboard administration
export const getMetaPixelSettings = async (req, res, next) => {
  try {
    const config = await getMetaPixelConfig();
    const doc = await StoreSettingsModel.findOne({ key: "default" }).lean();

    return res.json({
      status: "success",
      data: {
        ...config,
        isPersistedInDb: Boolean(doc?.metaPixel?.pixelId),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Persists updated Meta Pixel and Conversions API settings to database
export const updateMetaPixelSettings = async (req, res, next) => {
  try {
    const {
      pixelId = "",
      accessToken = "",
      testEventCode = "",
      isEnabled = true,
      enableBrowserPixel = true,
      enableCapi = true,
      advancedMatching = true,
    } = req.body || {};

    const cleanPixelId = String(pixelId).trim();
    const cleanAccessToken = String(accessToken).trim();
    const cleanTestEventCode = String(testEventCode).trim();

    const updatePayload = {
      "metaPixel.pixelId": cleanPixelId,
      "metaPixel.accessToken": cleanAccessToken,
      "metaPixel.testEventCode": cleanTestEventCode,
      "metaPixel.isEnabled": Boolean(isEnabled),
      "metaPixel.enableBrowserPixel": Boolean(enableBrowserPixel),
      "metaPixel.enableCapi": Boolean(enableCapi),
      "metaPixel.advancedMatching": Boolean(advancedMatching),
      updatedBy: req.user?.userId || null,
    };

    const updatedDoc = await StoreSettingsModel.findOneAndUpdate(
      { key: "default" },
      { $set: updatePayload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return res.json({
      status: "success",
      message: "Meta Pixel settings saved successfully.",
      data: updatedDoc.metaPixel,
    });
  } catch (error) {
    next(error);
  }
};

// Executes a live test event against Meta Graph API and updates verification status
export const testMetaPixelConnection = async (req, res, next) => {
  try {
    const currentConfig = await getMetaPixelConfig();
    const targetPixelId = (req.body?.pixelId || currentConfig.pixelId || "").trim();
    const targetAccessToken = (req.body?.accessToken || currentConfig.accessToken || "").trim();
    const targetTestEventCode = (req.body?.testEventCode ?? currentConfig.testEventCode ?? "").trim();

    if (!targetPixelId || !targetAccessToken) {
      return res.status(400).json({
        status: "error",
        message: "Both Pixel ID and Conversions API Access Token must be provided to test the connection.",
      });
    }

    const testResult = await testMetaCapiConnection({
      pixelId: targetPixelId,
      accessToken: targetAccessToken,
      testEventCode: targetTestEventCode,
    });

    const isSuccess = testResult.success === true;
    const now = new Date();
    const statusVal = isSuccess ? "connected" : "failed";
    const statusMsg = testResult.message || (isSuccess ? "Connected" : "Test failed");

    await StoreSettingsModel.updateOne(
      { key: "default" },
      {
        $set: {
          "metaPixel.lastVerifiedAt": isSuccess ? now : currentConfig.lastVerifiedAt,
          "metaPixel.lastTestStatus": statusVal,
          "metaPixel.lastTestMessage": statusMsg,
        },
      },
      { upsert: true }
    );

    if (!isSuccess) {
      return res.status(testResult.status >= 400 && testResult.status < 600 ? testResult.status : 400).json({
        status: "error",
        message: testResult.message,
        details: testResult.raw || null,
      });
    }

    return res.json({
      status: "success",
      message: testResult.message,
      data: {
        eventsReceived: testResult.eventsReceived,
        fbtraceId: testResult.fbtraceId,
        verifiedAt: now,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Returns public sanitized Meta Pixel configuration for customer storefront integration
export const getPublicMetaPixelConfig = async (req, res, next) => {
  try {
    const config = await getMetaPixelConfig();

    return res.json({
      status: "success",
      data: {
        pixelId: config.isEnabled ? config.pixelId : "",
        isEnabled: config.isEnabled,
        enableBrowserPixel: config.enableBrowserPixel,
        advancedMatching: config.advancedMatching,
      },
    });
  } catch (error) {
    next(error);
  }
};
