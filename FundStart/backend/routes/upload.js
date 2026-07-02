const express = require('express');
const router = express.Router();
const multer = require('multer');
const { supabase } = require('../lib/supabase');
const { authenticate } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images are allowed.'));
  }
});

router.post('/', authenticate, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided.' });

  const ext = req.file.originalname.split('.').pop().toLowerCase();
  const fileName = `${uuidv4()}.${ext}`;

  await supabase.storage.createBucket('campaign-images', { public: true });

  const { error } = await supabase.storage
    .from('campaign-images')
    .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

  if (error) {
    console.error('[upload] supabase error:', error.message);
    return res.status(500).json({ error: 'Upload failed: ' + error.message });
  }

  const { data: { publicUrl } } = supabase.storage
    .from('campaign-images')
    .getPublicUrl(fileName);

  console.log('[upload] success:', publicUrl);
  res.json({ url: publicUrl });
});

module.exports = router;
