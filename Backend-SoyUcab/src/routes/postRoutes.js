const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Los archivos se guardarán en esta carpeta

// Obtener todas las publicaciones para el Home
router.get('/', postController.getHomeFeed);

// NUEVA RUTA: Obtener cantidad de posts de un usuario
// Colócala antes de la ruta de /usuario/:email para evitar conflictos
router.get('/count/:email', postController.getPostCount);

// Obtener publicaciones de un usuario específico (para el Perfil)
router.get('/usuario/:email', postController.getPostsByEmail);

// Crear una nueva publicación
router.post('/', postController.createPost);

// Eliminar una publicación
router.delete('/:email/:fecha', postController.deletePost);

// Línea 13: Contador (AQUÍ ESTABA TU ERROR probablemente decía getCount o algo distinto)
router.get('/count/:email', postController.getPostCount);

// Línea 16: Posts de usuario
router.get('/usuario/:email', postController.getPostsByEmail);

// Línea 19: Eliminar
router.delete('/:email/:fecha', postController.deletePost);

router.get('/comments', postController.getCommentsByPost);


// Cambia tu ruta de POST para que use el middleware de upload
router.post('/', upload.single('file'), postController.createPost);

module.exports = router;