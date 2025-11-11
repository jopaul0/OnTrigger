export function firstName(name) {
  if (!name) return '';
  const lower = name.toLowerCase();
  return (lower.charAt(0).toUpperCase() + lower.slice(1)).split(" ")[0];
}

export function uniqueArray(array) {
  return array.filter((value, index, self) =>
    index === self.findIndex((t) => (
      t.name === value.name && t.birthday.getTime() === value.birthday.getTime()
    ))
  );
}

export function uniqueObjArray(arr) {
  return arr.filter((obj, index, self) => {
    if (!obj.date || !(obj.date instanceof Date)) return false;
    return index === self.findIndex(o =>
      o.name === obj.name &&
      o.phone === obj.phone &&
      o.date instanceof Date &&
      o.date.getTime() === obj.date.getTime()
    );
  });
}

export function truncateFileName(name, maxLength = 30) {
  if (name.length <= maxLength) return name;
  const ext = name.split('.').pop();
  const base = name.substring(0, maxLength - ext.length - 5);
  return `${base}...${ext}`;
};

export function clearPhone(input) {
  try{return input.replace(/\D/g, '');}catch{return undefined;}
  
}
