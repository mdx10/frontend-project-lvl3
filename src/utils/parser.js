export default (xml) => {
  const parsed = new DOMParser().parseFromString(xml, 'application/xml');
  const errorEl = parsed.querySelector('parsererror');
  if (errorEl) throw new Error('form.errors.notValidRss');
  return parsed;
};
