import { supabaseAdmin } from '../config/supabase.js';
import logger from '../utils/logger.js';

export const logAudit = async ({ actor_id, action, resource_type, resource_id = null, old_value = null, new_value = null, ip_address = null }) => {
  try {
    await supabaseAdmin.from('audit_logs').insert({
      actor_id,
      action,
      resource_type,
      resource_id,
      old_value,
      new_value,
      ip_address,
    });
  } catch (error) {
    logger.error('Failed to write audit log', { error: error.message });
  }
};

export const auditMiddleware = (action, resource_type) => async (req, res, next) => {
  // Capture original send/json to intercept response completion if needed,
  // but generally we can just fire and forget the audit log if the request succeeds.
  const originalJson = res.json;
  
  res.json = function (body) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      // Extract resource ID from params or response body
      const resource_id = req.params.id || (body.data && body.data.id) || null;
      
      const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      
      logAudit({
        actor_id: req.user?.id,
        action,
        resource_type,
        resource_id,
        new_value: req.body,
        ip_address,
      });
    }
    return originalJson.call(this, body);
  };
  
  next();
};
