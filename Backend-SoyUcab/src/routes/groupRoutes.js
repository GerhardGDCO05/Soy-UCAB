const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const auth = require('../middleware/auth');

// POST /api/groups - crear grupo
router.post('/', auth.verifyToken, groupController.createGroup);

// POST /api/groups/:name/join - unirse
router.post('/:name/join', auth.verifyToken, groupController.joinGroup);

// GET /api/groups/mine - listar grupos del usuario autenticado
router.get('/mine', auth.verifyToken, groupController.getMyGroups);

// GET /api/groups/:name - obtener detalles del grupo
router.get('/:name', groupController.getGroupDetails);

// GET /api/groups/:name/posts - obtener publicaciones del grupo
router.get('/:name/posts', groupController.getGroupPosts);

// POST /api/groups/:name/posts - crear publicación (miembros activos)
router.post('/:name/posts', auth.verifyToken, groupController.createGroupPost);

// PUT /api/groups/:name/posts - actualizar publicación (autor o admin)
router.put('/:name/posts', auth.verifyToken, groupController.updateGroupPost);

// DELETE /api/groups/:name/posts - eliminar publicación (autor o admin)
router.delete('/:name/posts', auth.verifyToken, groupController.deleteGroupPost);

// POST /api/groups/:name/posts/:email/:fecha/like - dar like
router.post('/:name/posts/:email/:fecha/like', auth.verifyToken, groupController.likePost);

// POST /api/groups/:name/posts/:email/:fecha/comments - agregar comentario
router.post('/:name/posts/:email/:fecha/comments', auth.verifyToken, groupController.commentPost);

// GET /api/groups/:name/members - obtener miembros del grupo
router.get('/:name/members', groupController.getGroupMembers);

// PUT /api/groups/:name - actualizar grupo (solo administradores)
router.put('/:name', auth.verifyToken, groupController.updateGroup);

module.exports = router;
