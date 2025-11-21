import { Router } from 'express';
import {
  getDocuments,
  getDocument,
  createDocument,
  deleteDocument,
  updateDocument,
  shareDocument,
  revokeDocumentAccess,
  downloadDocument,
} from '../controllers/documentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getDocuments);
router.get('/:id', getDocument);
router.get('/:id/download', downloadDocument);
router.post('/', authorize('ADMIN', 'HR'), createDocument);
router.put('/:id', authorize('ADMIN', 'HR'), updateDocument);
router.delete('/:id', authorize('ADMIN', 'HR'), deleteDocument);
router.post('/:id/share', authorize('ADMIN', 'HR'), shareDocument);
router.delete('/:id/revoke/:employeeId', authorize('ADMIN', 'HR'), revokeDocumentAccess);

export default router;
