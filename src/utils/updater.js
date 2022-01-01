/* eslint-disable no-param-reassign */
import _ from 'lodash';
import fetchData from './fetchData';
import parseXml from './parser';
import getFeedAndPosts from './utils';

const updatePosts = (watchedState) => {
  watchedState.feeds.forEach(({ url, id }) => {
    fetchData(url)
      .then(({ data }) => {
        const parsedXml = parseXml(data.contents);
        const [, posts] = getFeedAndPosts(parsedXml);
        const oldPosts = [...watchedState.posts];
        const addedPosts = _.differenceBy(posts, oldPosts, (post) => post.link);
        if (addedPosts.length !== 0) {
          const newPosts = addedPosts.map((post) => ({ ...post, id: _.uniqueId(), feedId: id }));
          watchedState.posts = [...newPosts, ...oldPosts];
        }
      })
      .catch((err) => console.error(err));
  });
  setTimeout(() => updatePosts(watchedState), 5000);
};

export default updatePosts;
