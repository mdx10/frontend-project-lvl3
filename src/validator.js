import * as yup from 'yup';

export default (url, feeds, i18n) => {
  yup.setLocale({
    string: {
      url: i18n.t('form.errors.notValidUrl'),
    },
    mixed: {
      notOneOf: i18n.t('form.errors.notUniqUrl'),
    },
  });

  const schema = yup
    .string()
    .required()
    .url()
    .notOneOf(feeds);

  return schema.validate(url);
};
