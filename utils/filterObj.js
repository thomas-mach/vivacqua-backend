function filterObj(obj, ...allowedFields) {
  newObj = {};
  console.log("Object keys", Object.keys(obj));
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
}

module.exports = filterObj;
