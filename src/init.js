import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import initView from './view.js';
import ru from './locales/ru.js';
import validateUrl from './validator.js';

const parseXml = (xml) => {
  const parsed = new DOMParser().parseFromString(xml, 'application/xml');
  const errorEl = parsed.querySelector('parsererror');
  if (errorEl) throw new Error('form.errors.notValidRss');
  return parsed;
};

const getFeedData = (xmlDom) => {
  const title = xmlDom.querySelector('channel title').textContent;
  const description = xmlDom.querySelector('channel description').textContent;
  return { title, description };
};

const getPostsData = (xmlDom) => {
  const posts = Array
    .from(xmlDom.querySelectorAll('item'))
    .map((item) => {
      const title = item.querySelector('title').textContent;
      const description = item.querySelector('description').textContent;
      const link = item.querySelector('link').textContent;
      return { title, description, link };
    });
  return posts;
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
    posts: [],
  };
  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  });
  const watchedState = initView(state, i18n);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = e.target.elements.url;
    const url = input.value;
    watchedState.rssForm.state = 'filling';
    const urls = state.feeds.map((feed) => feed.url);
    validateUrl(url, urls, i18n)
      .then((validUrl) => {
        watchedState.rssForm.error = null;
        watchedState.rssForm.state = 'processing';
        console.log(state);
        return validUrl;
      })
      .then((feedUrl) => {
        axios.get(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${feedUrl}`)
          .then((response) => {
            const parsedXml = parseXml(response.data.contents);
            console.log(parsedXml);
            const feedId = _.uniqueId();
            const newFeed = {
              id: feedId,
              url,
              ...getFeedData(parsedXml),
            };
            const newPosts = getPostsData(parsedXml)
              .map((post) => ({ id: _.uniqueId(), feedId, ...post }));
            console.log(newPosts);
            watchedState.feeds = [newFeed, ...state.feeds];
            watchedState.posts = [newPosts, ...state.posts];
            watchedState.rssForm.state = 'success';
            console.log(state);
          })
          .catch((err) => {
            watchedState.rssForm.error = err.isAxiosError
              ? i18n.t('form.errors.networkProblems')
              : i18n.t(err.message);
            watchedState.rssForm.state = 'filling';
          });
      })
      .catch((err) => {
        console.dir(err);
        watchedState.rssForm.error = err.message;
        watchedState.rssForm.state = 'filling';
        console.log(state);
      });
  });
};
