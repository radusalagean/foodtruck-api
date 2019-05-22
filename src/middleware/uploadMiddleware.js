import multer from 'multer';
import path from 'path';
import mkdirp from 'mkdirp';
import fs from 'fs';
import sharp from 'sharp';

const MAX_FILE_SIZE = 1024 * 1024 * 10;
const ALLOWED_MIME_TYPES = [ 'image/jpeg', 'image/png', 'image/*' ];
const PUBLIC_ROOT_DIRECTORY = 'public';
const PUBLIC_PROFILE_IMAGES_DIRECTORY = 'profile_images';
const PUBLIC_FOODTRUCK_IMAGES_DIRECTORY = 'foodtruck_images';
const PUBLIC_THUMBNAILS_DIRECTORY = 'thumbnails';
const PUBLIC_500_DIRECTORY = '500';
const PREFIX_PROFILE_IMAGE = 'profile-image-';
const PREFIX_FOODTRUCK_IMAGE = 'foodtruck-image-';

const OP_PROFILE_IMAGE_UPLOAD = 0;
const OP_FOODTRUCK_IMAGE_UPLOAD = 1;

function getStorage(op) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      let dest = getDestination(op);
      mkdirp.sync(dest);
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      cb(null, getFileName(op, req, file));
    }
  });
}

function getMulter(op) {
  return multer({
    storage: getStorage(op),
    limits: {
      fileSize: MAX_FILE_SIZE
    },
    fileFilter: (req, file, cb) => {
      cb(null, ALLOWED_MIME_TYPES.includes(file.mimetype));
    }
  })
};

function getDestination(op) {
  let dest = PUBLIC_ROOT_DIRECTORY + '/';
  switch(op) {
    case OP_PROFILE_IMAGE_UPLOAD:
      dest += PUBLIC_PROFILE_IMAGES_DIRECTORY;
      break;
    case OP_FOODTRUCK_IMAGE_UPLOAD:
      dest += PUBLIC_FOODTRUCK_IMAGES_DIRECTORY;
      break;
    default:
      throw('Unsuported OP (' + op + ')');
  }
  return dest;
}

function getFileName(op, req, file) {
  switch(op) {
    case OP_PROFILE_IMAGE_UPLOAD:
      return getProfileImageName(req.user.id, file.originalname);
    case OP_FOODTRUCK_IMAGE_UPLOAD:
      return getFoodtruckImageName(req.params.id, file.originalname);
    default:
      throw('Unsuported OP (' + op + ')');
  }
}

function getExtension(originalFileName) {
  let ext = path.extname(originalFileName);
  return ext ? ext.toLowerCase() : '';
}

function removeFile(path) {
  fs.unlink(path, err => {
    if (err) {
      console.log('Error while removing file: ' + err.toString());
    }
    console.log('File deleted: ' + path);
  });
}

function createResizedImage(parentPath, containerDirectoryName, fileName, size) {
  let readPath = parentPath + '/' + fileName;
  let savePathParent = parentPath + '/' + containerDirectoryName;
  let savePath = savePathParent + '/' + fileName;
  mkdirp.sync(savePathParent);
  sharp(readPath)
    .resize({
      width: size,
      height: size,
      fit: sharp.fit.inside
    })
    .toFile(savePath);
}

// Format: PREFIX + ID + EXTENSION
function buildFileName(prefix, id, extension) {
  let fileName = prefix + id;
  return extension ? fileName + extension : fileName;
}

// EXPORT
function getProfileImageUpload() {
  return getMulter(OP_PROFILE_IMAGE_UPLOAD);
}

// EXPORT
function createProfile500Image(fileName) {
  createResizedImage(PUBLIC_ROOT_DIRECTORY + '/' + PUBLIC_PROFILE_IMAGES_DIRECTORY, PUBLIC_500_DIRECTORY, fileName, 500);
}

// EXPORT
function createProfileThumbnail(fileName) {
  createResizedImage(PUBLIC_ROOT_DIRECTORY + '/' + PUBLIC_PROFILE_IMAGES_DIRECTORY, PUBLIC_THUMBNAILS_DIRECTORY, fileName, 150);
}

// EXPORT
function getProfileImageName(userId, originalFileName) {
  let extension = getExtension(originalFileName);
  return buildFileName(PREFIX_PROFILE_IMAGE, userId, extension);
}

// EXPORT
function removeProfileImageFile(fileName) {
  let pathParent = PUBLIC_ROOT_DIRECTORY + '/' + PUBLIC_PROFILE_IMAGES_DIRECTORY;
  let path = pathParent + '/' + fileName;
  let thumbPath = pathParent + '/' + PUBLIC_THUMBNAILS_DIRECTORY + '/' + fileName;
  let fiveHundredPath = pathParent + '/' + PUBLIC_500_DIRECTORY + '/' + fileName;
  removeFile(path);
  removeFile(thumbPath);
  removeFile(fiveHundredPath);
}

// EXPORT
function getFoodtruckImageUpload() {
  return getMulter(OP_FOODTRUCK_IMAGE_UPLOAD);
}

// EXPORT
function createFoodtruck500Image(fileName) {
  createResizedImage(PUBLIC_ROOT_DIRECTORY + '/' + PUBLIC_FOODTRUCK_IMAGES_DIRECTORY, PUBLIC_500_DIRECTORY, fileName, 500);
}

// EXPORT
function createFoodtruckThumbnail(fileName) {
  createResizedImage(PUBLIC_ROOT_DIRECTORY + '/' + PUBLIC_FOODTRUCK_IMAGES_DIRECTORY, PUBLIC_THUMBNAILS_DIRECTORY, fileName, 150);
}

// EXPORT
function getFoodtruckImageName(foodtruckId, originalFileName) {
  let extension = getExtension(originalFileName);
  return buildFileName(PREFIX_FOODTRUCK_IMAGE, foodtruckId, extension);
}

// EXPORT
function removeFoodtruckImageFile(fileName) {
  let pathParent = PUBLIC_ROOT_DIRECTORY + '/' + PUBLIC_FOODTRUCK_IMAGES_DIRECTORY;
  let path = pathParent + '/' + fileName;
  let thumbPath = pathParent + '/' + PUBLIC_THUMBNAILS_DIRECTORY + '/' + fileName;
  let fiveHundredPath = pathParent + '/' + PUBLIC_500_DIRECTORY + '/' + fileName;
  removeFile(path);
  removeFile(thumbPath);
  removeFile(fiveHundredPath);
}

module.exports = {
  PUBLIC_ROOT_DIRECTORY,
  // Profile Image Upload
  getProfileImageUpload,
  createProfile500Image,
  createProfileThumbnail,
  getProfileImageName,
  removeProfileImageFile,
  // Foodtruck Image Upload
  getFoodtruckImageUpload,
  createFoodtruck500Image,
  createFoodtruckThumbnail,
  getFoodtruckImageName,
  removeFoodtruckImageFile
}