const express = require("express");
const httpProxy = require("http-proxy");
const PORT = 8000;
const app = express();

const BASE_PATH = `https://ezdeploy-2025.s3.ap-southeast-2.amazonaws.com/__outputs`;

const proxy = httpProxy.createProxy();

app.use((req, res) => {
  const hostname = req.hostname;
  const subdomain = hostname.split(".")[0];

  const resolvesTo = `${BASE_PATH}/${subdomain}`;

  return proxy.web(req, res, { target: resolvesTo, changeOrigin: true });
});

proxy.on("proxyReq", (proxyReq, req, res) => {
  const url = req.url;
  if (url === "/") proxyReq.path += "index.html";
  return proxyReq;
});

app.listen(PORT, () => console.log(`Reverse Proxy Running..${PORT}`));

app.get("/uptime", (req, res) => {
  res.send(
    `<h1>Welcome to the S3 Reverse Proxy</h1><p>Use a subdomain to access your S3 bucket content.</p>`
  );
});
