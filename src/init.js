import * as yup from 'yup';
import initView from './view.js';

const validateUrl = (url, feeds) => {
  const schema = yup
    .string()
    .required()
    .url('Ссылка должна быть валидным URL')
    .notOneOf(feeds, 'RSS уже существует');

  return schema.validate(url);
};

export default () => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    feedbackContainer: document.querySelector('.feedback'),
  };
  const state = {
    rssForm: {
      state: 'filling',
      error: null,
    },
    feeds: [],
  };

  const watchedState = initView(state);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = e.target.elements.url;
    const url = input.value;
    watchedState.rssForm.state = 'filling';
    validateUrl(url, state.feeds)
      .then((validUrl) => {
        watchedState.rssForm.error = null;
        watchedState.rssForm.state = 'processing';
        watchedState.feeds.push(validUrl);
        e.target.reset();
        e.target.focus();
        console.log(state);
      })
      .catch((err) => {
        console.dir(err);
        watchedState.rssForm.error = err.message;
        console.log(state);
      });
  });
};
