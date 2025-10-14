import databaseInspector from '../utils/databaseInspector.js';
import { sendResponse, sendError } from '../utils/response.js';

export const inspectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return sendError(res, 400, 'User ID is required');
    }
    
    const report = await databaseInspector.inspectUser(userId);
    
    if (report.error) {
      return sendError(res, 404, report.error);
    }
    
    sendResponse(res, 200, 'User inspection completed', report);
  } catch (error) {
    console.error('User inspection error:', error);
    sendError(res, 500, `Inspection failed: ${error.message}`);
  }
};

export const inspectCurrentUser = async (req, res) => {
  try {
    // amazonq-ignore-next-line
    // amazonq-ignore-next-line
    const userId = req.user._id;
    const report = await databaseInspector.inspectUser(userId);
    
    if (report.error) {
      return sendError(res, 404, report.error);
    }
    
    sendResponse(res, 200, 'User inspection completed', report);
  } catch (error) {
    console.error('Inspector error:', error);
    sendError(res, 500, `Inspection failed: ${error.message}`);
  }
};

export const getDatabaseHealth = async (req, res) => {
  try {
    const report = await databaseInspector.generateSummaryReport();
    
    if (report.error) {
      return sendError(res, 500, report.error);
    }
    
    sendResponse(res, 200, 'Database health check completed', report);
  } catch (error) {
    console.error('Database health check error:', error);
    sendError(res, 500, `Health check failed: ${error.message}`);
  }
};

export const validateRelationships = async (req, res) => {
  try {
    const issues = await databaseInspector.validateRelationships();
    
    const summary = {
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'CRITICAL').length,
      highIssues: issues.filter(i => i.severity === 'HIGH').length,
      mediumIssues: issues.filter(i => i.severity === 'MEDIUM').length,
      issues: issues
    };
    
    sendResponse(res, 200, 'Relationship validation completed', summary);
  } catch (error) {
    sendError(res, 500, 'Validation failed');
  }
};