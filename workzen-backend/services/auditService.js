const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Create an audit log entry
 */
async function createAuditLog(data) {
  const { adminId, employeeId, action, metadata } = data;
  
  try {
    // For now, we'll log to console and could store in a separate audit table
    const auditEntry = {
      timestamp: new Date().toISOString(),
      adminId: adminId || 'system',
      employeeId: employeeId || null,
      action: action,
      data: metadata || {},
    };
    
    console.log('📝 Audit Log:', JSON.stringify(auditEntry, null, 2));
    
    // In a production system, you would save this to an audit_logs table
    // await prisma.audit_logs.create({ data: auditEntry });
    
    return { success: true, entry: auditEntry };
  } catch (error) {
    console.error('Failed to create audit log:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Log user creation
 */
async function logUserCreation(adminId, employeeId, loginId, email) {
  return await createAuditLog({
    adminId,
    employeeId,
    action: 'user.create',
    metadata: {
      loginId,
      email,
      status: 'success'
    }
  });
}

/**
 * Log email send failure
 */
async function logEmailSendFailure(adminId, employeeId, loginId, email, error) {
  return await createAuditLog({
    adminId,
    employeeId,
    action: 'email.send_failed',
    metadata: {
      loginId,
      email,
      error: error,
      status: 'failed'
    }
  });
}

module.exports = {
  createAuditLog,
  logUserCreation,
  logEmailSendFailure
};
