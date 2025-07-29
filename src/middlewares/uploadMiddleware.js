import multer from 'multer';
import path from 'path';
import fs from 'fs';

const tempDir = path.join(process.cwd(), 'src', 'temp');  // 'temp' inside src

// Make sure 'temp' folder exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const allowedTypes =[  
  // Audio
  "audio/mpeg",      
  "audio/wav",       

  // Videos
  "video/mp4",       
  "video/x-msvideo", 
  "video/quicktime", 
  "video/webm",      

  // Documents
  "application/pdf",                               
  "text/plain",                                     
  "application/vnd.oasis.opendocument.text",       
  "application/msword",                             
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
  "text/html",                                     

  // Images
  "image/png",                                      
  "image/jpeg",                                    
  "image/webp"   ];
const fileFilter = (req,file, cb) =>{
  if(!allowedTypes.includes(file.mimetype)) {
    cb(null,true);
  }else{
    cb(new Error("Unsupported file type"), false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({
  storage,
  limits:{fileSize: 50 * 1024 * 1024},
  fileFilter
});

export default upload;