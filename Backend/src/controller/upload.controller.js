import crypto from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponce.js";
import { ApiError } from "../utils/apierror.js";
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from "../utils/r2Client.js";

const ALLOWED_KINDS = ["poster", "trailer", "general"];
const ALLOWED_CONTENT_TYPES = ["image/png", "image/jpeg", "image/webp"];

const CONTENT_TYPE_TO_EXT = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

const sanitizeStem = (filename) => {
  if (!filename || typeof filename !== "string") return "";
  // strip extension
  const lastDot = filename.lastIndexOf(".");
  const stem = lastDot > 0 ? filename.slice(0, lastDot) : filename;
  // keep alphanumerics, dashes, underscores; replace anything else with '-'
  const cleaned = stem
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return cleaned;
};

const getPresignedUrl = asyncHandler(async (req, res) => {
  if (!R2_PUBLIC_URL) {
    throw new ApiError(500, "R2_PUBLIC_URL is not configured");
  }
  if (!R2_BUCKET) {
    throw new ApiError(500, "R2_BUCKET_NAME is not configured");
  }

  const { kind, contentType, filename } = req.body || {};

  if (!kind || !ALLOWED_KINDS.includes(kind)) {
    throw new ApiError(
      400,
      `Invalid 'kind'. Must be one of: ${ALLOWED_KINDS.join(", ")}`
    );
  }

  if (!contentType || !ALLOWED_CONTENT_TYPES.includes(contentType)) {
    throw new ApiError(
      400,
      `Invalid 'contentType'. Must be one of: ${ALLOWED_CONTENT_TYPES.join(", ")}`
    );
  }

  const ext = CONTENT_TYPE_TO_EXT[contentType];
  const uuid = crypto.randomUUID();
  const stem = sanitizeStem(filename);
  const filePart = stem ? `${uuid}-${stem}${ext}` : `${uuid}${ext}`;
  const key = `${kind}/${Date.now()}-${filePart}`;

  const ttl = 300; // 5 minutes — plenty for a browser PUT

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: ttl });
  const publicUrl = `${R2_PUBLIC_URL}/${key}`;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { uploadUrl, publicUrl, key },
        "Presigned URL generated successfully"
      )
    );
});

export { getPresignedUrl };
