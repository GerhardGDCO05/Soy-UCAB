const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

// GET /api/groups - obtener todos los grupos
router.get('/', groupController.getAllGroups);

// POST /api/groups - crear grupo
router.post('/', groupController.createGroup);

// POST /api/groups/:name/join - unirse
router.post('/:name/join', groupController.joinGroup);

// GET /api/groups/user/:email - listar grupos de un usuario específico
router.get('/user/:email', groupController.getMyGroups);

// GET /api/groups/:name - obtener detalles del grupo
router.get('/:name', groupController.getGroupDetails);

// GET /api/groups/:name/members - obtener miembros del grupo
router.get('/:name/members', groupController.getGroupMembers);

// PUT /api/groups/:name - actualizar grupo
router.put('/:name', groupController.updateGroup);

// Ruta para salir de un grupo específico
router.delete('/:groupName/leave', groupController.leaveGroup);


//================Publicaciones del grupo=================
// GET /api/groups/:name/posts - obtener publicaciones del grupo
router.get('/:name/posts', groupController.getGroupPosts);

// POST /api/groups/:name/posts - crear publicación
router.post('/:name/posts', groupController.createGroupPost);

// PUT /api/groups/:name/posts - actualizar publicación
router.put('/:name/posts', groupController.updateGroupPost);

// DELETE /api/groups/:name/posts - eliminar publicación
router.delete('/:name/posts', groupController.deleteGroupPost);

// Likes
// POST /api/groups/:name/posts/:email/:fecha/like - dar like
router.post('/:name/posts/:email/:fecha(*)/like', groupController.likePost);
router.delete('/:name/posts/:email/:fecha(*)/like', groupController.unlikePost);

// Comentarios
// POST /api/groups/:name/posts/:email/:fecha/comments
router.post('/:name/posts/:email/:fecha(*)/comments', groupController.commentPost);

// GET /api/groups/:name/posts/:email/:fecha/comments
// Ruta para obtener comentarios de una publicación
router.get('/:name/posts/:email/:fecha/comments', groupController.getPostComments);


router.put('/:name/posts/comments', groupController.updateComment);
router.delete('/:name/posts/comments', groupController.deleteComment);



module.exports = router;