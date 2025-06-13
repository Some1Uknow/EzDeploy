const express = require('express');
const { 
  healthCheck, 
  debugEcs, 
  createProject, 
  getAllProjects, 
  getProject, 
  updateProjectStatus, 
  deleteProject 
} = require('../controllers/project');

const router = express.Router();

// Health and debug routes
router.get('/health', healthCheck);
router.get('/debug', debugEcs);

// Project routes
router.post('/project', createProject);
router.get('/projects', getAllProjects);
router.get('/project/:id', getProject);
router.put('/project/:id', updateProjectStatus);
router.delete('/project/:id', deleteProject);

module.exports = router;
