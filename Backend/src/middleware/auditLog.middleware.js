import AuditLog from "../models/auditLog.model.js";

const TRACKED_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);
const SENSITIVE_KEY_RE = /secret|token|key/i;
const SENSITIVE_EXACT = new Set(["password", "cvv", "otp"]);
const MAX_BODY_BYTES = 4 * 1024;

const sanitize = (input) => {
  if (input === null || input === undefined) return input;
  if (Array.isArray(input)) return input.map(sanitize);
  if (typeof input === "object") {
    const out = {};
    for (const [k, v] of Object.entries(input)) {
      const lower = k.toLowerCase();
      if (SENSITIVE_EXACT.has(lower) || SENSITIVE_KEY_RE.test(k)) {
        out[k] = "[REDACTED]";
      } else if (v && typeof v === "object") {
        out[k] = sanitize(v);
      } else {
        out[k] = v;
      }
    }
    return out;
  }
  return input;
};

const truncateBody = (body) => {
  try {
    let json = JSON.stringify(body);
    if (!json) return body;
    if (Buffer.byteLength(json, "utf8") <= MAX_BODY_BYTES) {
      return body;
    }
    const truncated = json.slice(0, MAX_BODY_BYTES);
    return { _truncated: true, preview: truncated };
  } catch {
    return { _truncated: true, preview: "[unserializable]" };
  }
};

export const auditLog = (req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    try {
      if (!req.user) return;
      if (req.user.role !== "admin") return;
      if (!TRACKED_METHODS.has(req.method)) return;

      const sanitized = truncateBody(sanitize(req.body || {}));

      AuditLog.create({
        userId: req.user._id,
        method: req.method,
        path: req.originalUrl || req.url,
        statusCode: res.statusCode,
        body: sanitized,
        durationMs: Date.now() - startedAt,
      }).catch((err) => {
        // Never throw from audit; log and move on
        console.error("[auditLog] write failed:", err?.message || err);
      });
    } catch (err) {
      console.error("[auditLog] middleware error:", err?.message || err);
    }
  });

  next();
};

export default auditLog;
