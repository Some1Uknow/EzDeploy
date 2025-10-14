const express = require("express");
const httpProxy = require("http-proxy");
const app = express();

// Render's PORT or default to 8000 locally
const PORT = process.env.PORT || 8000;

const S3_BUCKET = process.env.S3_BUCKET;
const S3_REGION = process.env.S3_REGION;
const S3_BASE_PATH = process.env.S3_BASE_PATH; // optional explicit override

const DEFAULT_BASE = `https://ezdeploy-2025.s3.ap-southeast-2.amazonaws.com/__outputs`;
const ENV_BASE =
  S3_BASE_PATH ||
  (S3_BUCKET && S3_REGION
    ? `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/__outputs`
    : undefined);

const BASE_PATH = ENV_BASE || DEFAULT_BASE;

const proxy = httpProxy.createProxy();

app.get(["/health", "/uptime"], (_req, res) => {
  res.status(200).send("ok");
});

app.use((req, res) => {
  const hostname = req.hostname || "";
  const subdomain = hostname.split(".")[0];

  const resolvesTo = `${BASE_PATH}/${subdomain}`;

  return proxy.web(req, res, { target: resolvesTo, changeOrigin: true });
});

proxy.on("proxyReq", (proxyReq, req, _res) => {
  const url = req.url;
  if (url === "/") proxyReq.path += "index.html";
  return proxyReq;
});

app.listen(PORT, () => console.log(`Reverse Proxy running on port ${PORT}`));
