import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import initView from './view.js';
import ru from './locales/ru.js';
import validateUrl from './validator.js';
import proxify from './proxy.js';

const parseXml = (xml) => {
  const parsed = new DOMParser().parseFromString(xml, 'application/xml');
  const errorEl = parsed.querySelector('parsererror');
  if (errorEl) throw new Error('form.errors.notValidRss');
  return parsed;
};

const getFeedAndPosts = (xmlDom) => {
  const feed = {
    title: xmlDom.querySelector('channel title').textContent,
    description: xmlDom.querySelector('channel description').textContent,
  };

  const posts = Array
    .from(xmlDom.querySelectorAll('item'))
    .map((item) => (
      {
        title: item.querySelector('title').textContent,
        description: item.querySelector('description').textContent,
        link: item.querySelector('link').textContent,
      }
    ));
  return [feed, posts];
};

const updatePosts = (watchedState) => {
  watchedState.feeds.forEach(({ url, id }) => {
    axios.get(proxify(url))
      .then(({ data }) => {
        const parsedXml = parseXml(data.contents);
        const [, posts] = getFeedAndPosts(parsedXml);
        const oldPosts = [...watchedState.posts];
        const addedPosts = _.differenceBy(posts, oldPosts, (post) => post.link);
        if (addedPosts.length !== 0) {
          const newPosts = addedPosts.map((post) => ({ ...post, id: _.uniqueId(), feedId: id }));
          // eslint-disable-next-line no-param-reassign
          watchedState.posts = [...newPosts, ...oldPosts];
        }
      });
    // .catch((err) => console.log(err));
  });
  setTimeout(() => updatePosts(watchedState), 5000);
};

export default () => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    button: document.querySelector('button[type="submit"]'),
    feedbackContainer: document.querySelector('.feedback'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
    modal: document.querySelector('#modal'),
  };
  const state = {
    rssForm: {
      state: 'filling',
      error: null,
    },
    feeds: [],
    posts: [],
    uiState: {
      visitedPosts: [],
      modalId: null,
    },
  };
  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  });
  const watchedState = initView(state, elements, i18n);
  updatePosts(watchedState);
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
        // console.log(state);
        return validUrl;
      })
      .then((feedUrl) => axios.get(proxify(feedUrl)))
      .then(({ data }) => {
        const parsedXml = parseXml(data.contents);
        const [feed, posts] = getFeedAndPosts(parsedXml);
        const newFeed = { ...feed, id: _.uniqueId(), url };
        const newPosts = posts.map((post) => ({ ...post, id: _.uniqueId(), feedId: newFeed.id }));
        watchedState.feeds = [newFeed, ...state.feeds];
        watchedState.posts = [...newPosts, ...state.posts];
        watchedState.rssForm.state = 'success';
        // console.log(state);
      })
      .catch((err) => {
        watchedState.rssForm.error = err.isAxiosError
          ? 'form.errors.networkProblems'
          : err.message;
        watchedState.rssForm.state = 'filling';
        // console.log(state);
      });
  });
  elements.postsContainer.addEventListener('click', ({ target }) => {
    if (target.closest('a')) {
      const { id } = target.dataset;
      watchedState.uiState.visitedPosts = [...state.uiState.visitedPosts, id];
    }
    if (target.closest('button')) {
      const { id } = target.dataset;
      watchedState.uiState.visitedPosts = [...state.uiState.visitedPosts, id];
      watchedState.uiState.modalId = id;
    }
  });
};
