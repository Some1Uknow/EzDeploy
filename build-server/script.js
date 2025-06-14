const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const mime = require("mime-types");
const Redis = require("ioredis");

const publisher = new Redis(process.env.REDIS_KEY);

publisher.on("error", (err) => {
  console.error("Redis connection error:", err);
});

publisher.on("connect", () => {
  console.log("Connected to Redis successfully");
});

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

const PROJECT_ID = process.env.PROJECT_ID;

function publishLog(log) {
  publisher.publish(`logs:${PROJECT_ID}`, JSON.stringify({ log }));
}

async function init() {
  console.log("Executing script.js");
  publishLog("Build Started...");
  const outDirPath = path.join(__dirname, "output");
  // Check if output directory exists (git clone was successful)
  if (!fs.existsSync(outDirPath)) {
    const errorMsg =
      "Output directory does not exist. Git clone may have failed.";
    console.error(errorMsg);
    publishLog(`error: ${errorMsg}`);

    // Close connections and exit with error
    await publisher.quit();
    process.exit(1);
    return;
  }

  const p = exec(`cd ${outDirPath} && npm install && npm run build`);

  p.stdout.on("data", function (data) {
    console.log(data.toString());
    publishLog(data.toString());
  });

  p.stderr.on("data", function (data) {
    console.log("Error", data.toString());
    publishLog(`error: ${data.toString()}`);
  });

  p.on("close", async function (code) {
    console.log(`Build process exited with code ${code}`);
    publishLog(`Build process exited with code ${code}`);
    if (code !== 0) {
      const errorMsg = `Build failed with exit code ${code}`;
      console.error(errorMsg);
      publishLog(`error: ${errorMsg}`);

      // Close connections and exit with error
      await publisher.quit();
      process.exit(1);
      return;
    }

    console.log("Build Complete");
    publishLog(`Build Complete`);

    // Look for common build output directories
    const possibleDistPaths = [
      path.join(outDirPath, "dist"),
      path.join(outDirPath, "build"),
      path.join(outDirPath, "out"),
      path.join(outDirPath, "public"),
    ];

    let distFolderPath = null;
    for (const distPath of possibleDistPaths) {
      if (fs.existsSync(distPath)) {
        distFolderPath = distPath;
        break;
      }
    }
    if (!distFolderPath) {
      const errorMsg =
        "No build output directory found (dist, build, out, or public)";
      console.error(errorMsg);
      publishLog(`error: ${errorMsg}`);

      // Close connections and exit with error
      await publisher.quit();
      process.exit(1);
      return;
    }

    console.log(`Using build output directory: ${distFolderPath}`);
    publishLog(
      `Using build output directory: ${path.basename(distFolderPath)}`
    );

    try {
      const distFolderContents = fs.readdirSync(distFolderPath, {
        recursive: true,
      });

      publishLog(`Starting to upload`);
      for (const file of distFolderContents) {
        const filePath = path.join(distFolderPath, file);
        if (fs.lstatSync(filePath).isDirectory()) continue;
        console.log("uploading", filePath);
        publishLog(`uploading ${file}`);

        const command = new PutObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: `__outputs/${PROJECT_ID}/${file}`,
          Body: fs.createReadStream(filePath),
          ContentType: mime.lookup(filePath),
        });

        await s3Client.send(command);
        publishLog(`uploaded ${file}`);
        console.log("uploaded", filePath);
      }
      publishLog(`Done`);
      console.log("Done...");

      // Close connections and exit gracefully
      await publisher.quit();
      process.exit(0);
    } catch (error) {
      const errorMsg = `Error during upload: ${error.message}`;
      console.error(errorMsg);
      publishLog(`error: ${errorMsg}`);

      // Close connections and exit with error
      await publisher.quit();
      process.exit(1);
    }
  });
  p.on("error", function (error) {
    const errorMsg = `Failed to start build process: ${error.message}`;
    console.error(errorMsg);
    publishLog(`error: ${errorMsg}`);

    publisher.quit().finally(() => {
      process.exit(1);
    });
  });
}

init();
