const { RunTaskCommand } = require("@aws-sdk/client-ecs");
const { generateSlug } = require("random-word-slugs");
const { eq } = require("drizzle-orm");
const ecsClient = require("../services/ecs");
const { config } = require("../config");
const { db } = require("../lib/db");
const { project } = require("../lib/schema");

const healthCheck = (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
};

const debugEcs = async (req, res) => {
  try {
    const testCommand = {
      cluster: config.ECS.CLUSTER,
      taskDefinition: config.ECS.TASK,
    };

    res.json({
      status: "debug",
      config: {
        cluster: config.ECS.CLUSTER,
        task: config.ECS.TASK,
        region: process.env.REGION,
        hasCredentials: !!(process.env.ACCESS_KEY && process.env.SECRET_ACCESS),
      },
      testCommand,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message,
    });
  }
};

const createProject = async (req, res) => {
  const { gitURL, slug, userId, name, description } = req.body;

  // Validate required fields
  if (!gitURL || typeof gitURL !== "string" || gitURL.trim() === "") {
    return res.status(400).json({
      status: "error",
      message: "gitURL is required and must be a valid string",
    });
  }

  // For now, we'll use a default userId if not provided (in production, this should come from authentication)
  const projectUserId = userId;
  const projectName = name || `Project ${new Date().toISOString()}`;
  const projectSlug = slug ? slug : generateSlug();
  const deployUrl = `http://${projectSlug}.localhost:8000`;

  try {
    console.log(`Creating project with URL: ${gitURL.trim()}`);

    // First, create the project record in the database
    const [createdProject] = await db
      .insert(project)
      .values({
        id: projectSlug,
        name: projectName,
        description: description || `Project for ${gitURL.trim()}`,
        userId: projectUserId,
        repoUrl: gitURL.trim(),
        deployUrl: deployUrl,
        deployedAt: new Date(),
        status: "queued",
        logs: JSON.stringify([
          {
            timestamp: new Date().toISOString(),
            message: "Project created and queued for deployment",
          },
        ]),
      })
      .returning();

    const command = new RunTaskCommand({
      cluster: config.ECS.CLUSTER,
      taskDefinition: config.ECS.TASK,
      launchType: "FARGATE",
      count: 1,      networkConfiguration: {
        awsvpcConfiguration: {
          assignPublicIp: "ENABLED",
          subnets: config.AWS.SUBNETS,
          securityGroups: config.AWS.SECURITY_GROUPS,
        },
      },
      overrides: {
        containerOverrides: [
          {
            name: "builder-image",
            environment: [
              {
                name: "GIT_REPOSITORY__URL",
                value: gitURL.trim(),
              },
              {
                name: "PROJECT_ID",
                value: projectSlug,
              },
              {
                name: "REDIS_KEY",
                value: process.env.REDIS_KEY,
              },
              {
                name: "S3_BUCKET",
                value: process.env.S3_BUCKET,
              },
              {
                name: "S3_ACCESS_KEY",
                value: process.env.S3_ACCESS_KEY,
              },
              {
                name: "S3_SECRET_ACCESS_KEY",
                value: process.env.S3_SECRET_ACCESS_KEY,
              },
              {
                name: "S3_REGION",
                value: process.env.S3_REGION,
              },
            ],
          },
        ],
      },
    });

    await ecsClient.send(command);

    // Update project status to building
    await db
      .update(project)
      .set({
        status: "building",
        updatedAt: new Date(),
        logs: JSON.stringify([
          ...JSON.parse(createdProject.logs || "[]"),
          {
            timestamp: new Date().toISOString(),
            message: "ECS task started successfully",
          },
        ]),
      })
      .where(eq(project.id, projectSlug));

    return res.json({
      status: "queued",
      data: {
        projectId: createdProject.id,
        projectSlug,
        projectName: createdProject.name,
        url: `http://${projectSlug}.localhost:8000`,
        repoUrl: createdProject.repoUrl,
        status: "building",
        createdAt: createdProject.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating project:", error);

    // Update project status to failed if it was created
    try {
      await db
        .update(project)
        .set({
          status: "failed",
          updatedAt: new Date(),
          logs: JSON.stringify([
            {
              timestamp: new Date().toISOString(),
              message: `Deployment failed: ${error.message}`,
            },
          ]),
        })
        .where(eq(project.id, projectSlug));
    } catch (dbError) {
      console.error("Error updating project status:", dbError);
    }

    return res.status(500).json({
      status: "error",
      message: "Failed to queue build task",
      error: error.message,
    });
  }
};

// Get all projects (user-specific only)
const getAllProjects = async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Validate that userId is provided
    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "userId is required to fetch projects",
      });
    }    
    // Always filter by userId - never fetch all projects from all users
    const projects = await db
      .select()
      .from(project)
      .where(eq(project.userId, userId.trim()));

    return res.json({
      status: "success",
      data: projects.map((p) => ({
        ...p,
        logs: JSON.parse(p.logs || "[]"),
      })),
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch projects",
      error: error.message,
    });
  }
};

// Get a specific project
const getProject = async (req, res) => {
  try {
    const { id } = req.params;

    const [projectData] = await db
      .select()
      .from(project)
      .where(eq(project.id, id));

    if (!projectData) {
      return res.status(404).json({
        status: "error",
        message: "Project not found",
      });
    }

    return res.json({
      status: "success",
      data: {
        ...projectData,
        logs: JSON.parse(projectData.logs || "[]"),
      },
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch project",
      error: error.message,
    });
  }
};

// Update project status and logs
const updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, deployUrl, logMessage } = req.body;

    // Get current project data
    const [currentProject] = await db
      .select()
      .from(project)
      .where(eq(project.id, id));

    if (!currentProject) {
      return res.status(404).json({
        status: "error",
        message: "Project not found",
      });
    }

    const currentLogs = JSON.parse(currentProject.logs || "[]");
    const updatedLogs = logMessage
      ? [
          ...currentLogs,
          {
            timestamp: new Date().toISOString(),
            message: logMessage,
          },
        ]
      : currentLogs;

    const updateData = {
      updatedAt: new Date(),
      logs: JSON.stringify(updatedLogs),
    };

    if (status) updateData.status = status;
    if (deployUrl) updateData.deployUrl = deployUrl;
    if (status === "deployed") updateData.deployedAt = new Date();

    const [updatedProject] = await db
      .update(project)
      .set(updateData)
      .where(eq(project.id, id))
      .returning();

    return res.json({
      status: "success",
      data: {
        ...updatedProject,
        logs: JSON.parse(updatedProject.logs || "[]"),
      },
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to update project",
      error: error.message,
    });
  }
};

// Delete a project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const [deletedProject] = await db
      .delete(project)
      .where(eq(project.id, id))
      .returning();

    if (!deletedProject) {
      return res.status(404).json({
        status: "error",
        message: "Project not found",
      });
    }

    return res.json({
      status: "success",
      message: "Project deleted successfully",
      data: deletedProject,
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to delete project",
      error: error.message,
    });
  }
};

module.exports = {
  healthCheck,
  debugEcs,
  createProject,
  getAllProjects,
  getProject,
  updateProjectStatus,
  deleteProject,
};
