import express from 'express';
import { getUsers, getUser, createUser, updateUser, deleteUser } from '../../controllers/userController.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

// All routes here are protected
router.use(protect);

router
  .route('/')
  .get(authorize('admin', 'manager'), getUsers)
  .post(authorize('admin'), createUser);

router
  .route('/:id')
  .get(authorize('admin', 'manager'), getUser)
  .put(authorize('admin', 'manager', 'user'), updateUser)
  .delete(authorize('admin'), deleteUser);

export default router;
