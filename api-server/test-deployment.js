const axios = require("axios");

async function testDeployment() {
  try {
    console.log("Testing deployment API...");

    const response = await axios.post("http://localhost:9000/project", {
      gitURL: "https://github.com/some1uknow/test.git",
      slug: "test-deployment",
    });

    console.log("API Response:", response.data);

    if (response.data.status === "queued") {
      console.log("✅ Deployment queued successfully");
      console.log("Project URL:", response.data.data.url);
      console.log("Project Slug:", response.data.data.projectSlug);
    } else {
      console.log("❌ Unexpected response:", response.data);
    }
  } catch (error) {
    console.error("❌ Error testing deployment:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

// Run the test
testDeployment();
