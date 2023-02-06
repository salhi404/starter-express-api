exports.multeruploadprofile = function (multer,name){
// File upload settings  
const PATH = './uploads';
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PATH);
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null,`${file.fieldname}-${Date.now()}.${ext}`)
  }
});
let upload = multer({
  storage: storage,
  fileFilter: multerFilter,
});
return upload.single(name)
};
const multerFilter = (req, file, cb) => {
  if (['png','jpg','jpeg','gif'].includes(file.mimetype.split("/")[1].toLowerCase()) ) {
    cb(null, true);
  } else {
    cb(new Error("Not a PDF File!!"), false);
  }
};