// controllers/downloadController.js
import axios from 'axios';

export const downloadFileController = async (req, res) => {
  try {
    const fileUrl = req.query.url; // Get the Supabase URL from the query parameter
    if (!fileUrl) {
      return res.status(400).send('File URL is required.');
    }

    // Fetch the file from Supabase as a stream
    const response = await axios({
      method: 'GET',
      url: fileUrl,
      responseType: 'stream',
    });

    // Get the filename from the URL
    const fileName = fileUrl.split('/').pop();

    // Set headers to tell the browser to download the file
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', response.headers['content-type']);

    // Pipe the file stream from Supabase to the user
    response.data.pipe(res);

  } catch (error) {
    console.error('File download proxy error:', error);
    res.status(500).send('Failed to download file.');
  }
};