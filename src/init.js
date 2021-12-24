import i18next from 'i18next';
import initView from './view.js';
import ru from './locales/ru.js';
import validateUrl from './validator.js';

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
  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  });
  const watchedState = initView(state);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = e.target.elements.url;
    const url = input.value;
    watchedState.rssForm.state = 'filling';
    validateUrl(url, state.feeds, i18n)
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
