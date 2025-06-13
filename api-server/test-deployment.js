const axios = require("axios");

const API_BASE_URL = "http://localhost:9000";

async function testHealthCheck() {
  console.log("🔍 Testing health check...");
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log("✅ Health check passed:", response.data);
    return true;
  } catch (error) {
    console.error("❌ Health check failed:", error.message);
    return false;
  }
}

async function testCreateProject() {
  console.log("🚀 Testing project creation...");
  try {
    const response = await axios.post(`${API_BASE_URL}/project`, {
      gitURL: "https://github.com/some1uknow/test.git",
      slug: "test-deployment-" + Date.now(),
      name: "Test Project",
      description: "A test project for EzDeploy",
      userId: "test-user-123"
    });

    console.log("✅ Project created successfully:", response.data);
    return response.data.data.projectId;
  } catch (error) {
    console.error("❌ Project creation failed:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
    return null;
  }
}

async function testGetAllProjects() {
  console.log("📋 Testing get all projects...");
  try {
    const response = await axios.get(`${API_BASE_URL}/projects`);
    console.log("✅ Projects fetched successfully:");
    console.log(`   Found ${response.data.data.length} projects`);
    response.data.data.forEach((project, index) => {
      console.log(`   ${index + 1}. ${project.name} (${project.status})`);
    });
    return response.data.data;
  } catch (error) {
    console.error("❌ Failed to fetch projects:", error.message);
    return [];
  }
}

async function testGetProject(projectId) {
  if (!projectId) return;
  
  console.log(`🔍 Testing get project ${projectId}...`);
  try {
    const response = await axios.get(`${API_BASE_URL}/project/${projectId}`);
    console.log("✅ Project fetched successfully:");
    console.log(`   Name: ${response.data.data.name}`);
    console.log(`   Status: ${response.data.data.status}`);
    console.log(`   Logs: ${response.data.data.logs.length} entries`);
    return response.data.data;
  } catch (error) {
    console.error("❌ Failed to fetch project:", error.message);
    return null;
  }
}

async function testUpdateProject(projectId) {
  if (!projectId) return;
  
  console.log(`🔄 Testing project update ${projectId}...`);
  try {
    const response = await axios.put(`${API_BASE_URL}/project/${projectId}`, {
      status: "building",
      logMessage: "Test log message added via API"
    });

    console.log("✅ Project updated successfully:");
    console.log(`   Status: ${response.data.data.status}`);
    console.log(`   Last log: ${response.data.data.logs[response.data.data.logs.length - 1].message}`);
    return response.data.data;
  } catch (error) {
    console.error("❌ Failed to update project:", error.message);
    return null;
  }
}

async function runAllTests() {
  console.log("🧪 Starting EzDeploy API Tests\n");

  // Test health check
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log("❌ Health check failed, stopping tests");
    return;
  }

  console.log("");

  // Test project creation
  const projectId = await testCreateProject();
  console.log("");

  // Test getting all projects
  await testGetAllProjects();
  console.log("");

  // Test getting specific project
  await testGetProject(projectId);
  console.log("");

  // Test updating project
  await testUpdateProject(projectId);
  console.log("");

  console.log("🎉 All tests completed!");
}

// Run all tests
runAllTests();
