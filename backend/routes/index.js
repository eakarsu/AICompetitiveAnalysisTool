const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const aiController = require('../controllers/aiController');
const crudController = require('../controllers/crudController');
const authMiddleware = require('../middleware/auth');
const { requirePermission, requireRole } = require('../middleware/rbac');
const { authLimiter, passwordResetLimiter, aiLimiter } = require('../middleware/rateLimiter');
const { sanitizeBody, loginValidation, registerValidation, passwordResetRequestValidation, passwordResetValidation, changePasswordValidation } = require('../middleware/validation');

router.use(sanitizeBody);

// Auth routes (public)
router.post('/auth/login', authLimiter, loginValidation, authController.login);
router.post('/auth/register', authLimiter, registerValidation, authController.register);
router.post('/auth/logout', authController.logout);
router.post('/auth/request-password-reset', passwordResetLimiter, passwordResetRequestValidation, authController.requestPasswordReset);
router.post('/auth/reset-password', passwordResetLimiter, passwordResetValidation, authController.resetPassword);
router.get('/auth/verify-email/:token', authController.verifyEmail);
router.post('/auth/resend-verification', authMiddleware, authController.resendVerification);
router.post('/auth/check-password-strength', authController.checkPasswordStrength);
router.get('/auth/profile', authMiddleware, authController.getProfile);
router.put('/auth/profile', authMiddleware, authController.updateProfile);
router.put('/auth/change-password', authMiddleware, changePasswordValidation, authController.changePassword);

// Dashboard
router.get('/dashboard/stats', authMiddleware, crudController.getDashboardStats);

// CRUD for each resource
const resources = ['competitors','market-analysis','swot-analysis','price-comparison','product-comparison','social-media','news-trends','customer-reviews','seo-analysis','industry-reports','ad-tracker','hiring-tracker'];
resources.forEach(resource => {
  router.get(`/${resource}`, authMiddleware, requirePermission('read'), crudController.getAll(resource));
  router.get(`/${resource}/search`, authMiddleware, requirePermission('read'), crudController.search(resource));
  router.get(`/${resource}/export/pdf`, authMiddleware, requirePermission('export'), crudController.exportPDF(resource));
  router.get(`/${resource}/:id`, authMiddleware, requirePermission('read'), crudController.getById(resource));
  router.post(`/${resource}`, authMiddleware, requirePermission('create'), crudController.create(resource));
  router.put(`/${resource}/bulk-update`, authMiddleware, requirePermission('bulk_update'), crudController.bulkUpdate(resource));
  router.put(`/${resource}/:id`, authMiddleware, requirePermission('update'), crudController.update(resource));
  router.delete(`/${resource}/bulk-delete`, authMiddleware, requirePermission('delete'), crudController.bulkDelete(resource));
  router.delete(`/${resource}/:id`, authMiddleware, requirePermission('delete'), crudController.delete(resource));
});

// AI routes
router.post('/ai/analyze-competitor', authMiddleware, aiLimiter, aiController.analyzeCompetitor);
router.post('/ai/generate-swot', authMiddleware, aiLimiter, aiController.generateSwot);
router.post('/ai/analyze-market', authMiddleware, aiLimiter, aiController.analyzeMarket);
router.post('/ai/analyze-pricing', authMiddleware, aiLimiter, aiController.analyzePricing);
router.post('/ai/compare-products', authMiddleware, aiLimiter, aiController.compareProducts);
router.post('/ai/analyze-social-media', authMiddleware, aiLimiter, aiController.analyzeSocialMedia);
router.post('/ai/analyze-trends', authMiddleware, aiLimiter, aiController.analyzeTrends);
router.post('/ai/analyze-reviews', authMiddleware, aiLimiter, aiController.analyzeReviews);
router.post('/ai/analyze-seo', authMiddleware, aiLimiter, aiController.analyzeSeo);
router.post('/ai/generate-report', authMiddleware, aiLimiter, aiController.generateReport);
router.post('/ai/analyze-ads', authMiddleware, aiLimiter, aiController.analyzeAds);
router.post('/ai/analyze-hiring', authMiddleware, aiLimiter, aiController.analyzeHiring);
router.post('/ai/chat', authMiddleware, aiLimiter, aiController.chat);
// Battle card - new feature
router.post('/ai/generate-battle-card', authMiddleware, aiLimiter, aiController.generateBattleCard);
// AI history - persisted results browser
router.get('/ai/history', authMiddleware, aiController.getAnalysisHistory);
router.get('/ai/history/:id', authMiddleware, aiController.getAnalysisById);

module.exports = router;
