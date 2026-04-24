const permissionMap = {
  admin: ['read', 'create', 'update', 'delete', 'bulk_update', 'export'],
  analyst: ['read', 'create', 'update', 'export'],
  viewer: ['read']
};
const requirePermission = (permission) => (req, res, next) => {
  const role = req.user?.role || 'viewer';
  const perms = permissionMap[role] || permissionMap.viewer;
  if (!perms.includes(permission)) return res.status(403).json({ error: 'Insufficient permissions' });
  next();
};
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return res.status(403).json({ error: 'Insufficient role' });
  next();
};
module.exports = { requirePermission, requireRole };
