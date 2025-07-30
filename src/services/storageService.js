import supabase from "../config/supabase.js";
import fs from "fs";
import mime from "mime";


export const uploadFileToSupabase = async(localFilePath, fileName) =>{
    const fileBuffer = fs.readFileSync(localFilePath);
    const contentType = mime.getType(localFilePath) || "application/octet-stream";


    
    const safeFileName = fileName.replace(/'/g, "").replace(/\s+/g, "-");
    console.log("Bucket:", process.env.SUPABASE_BUCKET);
    console.log("Supabase URL:", process.env.SUPABASE_URL);
    console.log("Safe File Name:", safeFileName);

    const {data, error} = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(safeFileName, fileBuffer, {
            contentType,
            upsert: true,
        });
            console.log("Upload response data:", data);
            console.log("Upload response error:", error);

        if(error) {
                console.error("Upload error:", error);
                throw error;
        }
       // **Yaha pe replace**
    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/${encodeURIComponent(safeFileName)}`;
    console.log("Uploaded file public URL:", publicUrl);
    return publicUrl;
};