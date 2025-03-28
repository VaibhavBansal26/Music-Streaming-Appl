import DataURIParser from "datauri/parser.js";
import path from "path";



const getBuffer = (file:any) => {
    const parser = new DataURIParser();
    const extName = path.extname(file.originalname);
    return parser.format(extName, file.buffer);
}

export default getBuffer;