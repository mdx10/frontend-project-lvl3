/* eslint-disable no-param-reassign */
import onChange from 'on-change';

const renderFeeds = (feeds, elements, i18n) => {
  const feedsList = feeds.map(({ title, description }) => {
    const html = `
    <li class="list-group-item border-0 border-end-0">
      <h3 class="h6 m-0">${title}</h3>
      <p class="m-0 small text-black-50">${description}</p>
    </li>
    `;
    return html;
  });

  const html = `
    <div class="card border-0">
      <div class="card-body">
        <h2 class="card-title h4">${i18n.t('feeds.title')}</h2>
      </div>
      <ul class="list-group border-0 rounded-0">
        ${feedsList.join('')}
      </ul>
    </div>
  `;
  elements.feedsContainer.innerHTML = html;
};

const renderPosts = (state, posts, elements, i18n) => {
  const postsList = posts.map(({ id, title, link }) => {
    const classes = state.uiState.visitedPosts.includes(id) ? 'fw-normal link-secondary' : 'fw-bold';
    const html = `
      <li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0">
        <a
          href="${link}"
          class="${classes}"
          data-id="${id}"
          target="_blank"
          rel="noopener noreferrer"
        >
          ${title}
        </a>
        <button
          type="button"
          class="btn btn-outline-primary btn-sm"
          data-id="${id}"
          data-bs-toggle="modal"
          data-bs-target="#modal"
        >
          ${i18n.t('posts.button')}
        </button>
      </li>
    `;
    return html;
  });
  const html = `
    <div class="card border-0">
      <div class="card-body">
        <h2 class="card-title h4">${i18n.t('posts.title')}</h2>
      </div>
      <ul class="list-group border-0 rounded-0">
        ${postsList.join('')}
      </ul>
    </div>
  `;
  elements.postsContainer.innerHTML = html;
};

const renderError = (error, elements, i18n) => {
  if (error) {
    elements.input.classList.add('is-invalid');
    elements.feedbackContainer.classList.remove('text-success');
    elements.feedbackContainer.classList.add('text-danger');
    elements.feedbackContainer.textContent = i18n.t(error);
  } else {
    elements.input.classList.remove('is-invalid');
    elements.feedbackContainer.textContent = '';
  }
};

const renderModal = (state, postId, elements) => {
  const post = state.posts.find((item) => item.id === postId);
  elements.modal.querySelector('.modal-title').textContent = post.title;
  elements.modal.querySelector('.modal-body').textContent = post.description;
  elements.modal.querySelector('a.btn').href = post.link;
};

export default (state, elements, i18n) => onChange(state, (path, value) => {
  if (path === 'uiState.modalId') {
    renderModal(state, value, elements);
  }
  if (path === 'uiState.visitedPosts') {
    renderPosts(state, state.posts, elements, i18n);
  }
  if (path === 'feeds') {
    renderFeeds(value, elements, i18n);
  }
  if (path === 'posts') {
    renderPosts(state, value, elements, i18n);
  }
  if (path === 'rssForm.error') {
    renderError(value, elements, i18n);
  }
  if (path === 'rssForm.state') {
    switch (value) {
      case 'filling':
        elements.input.readOnly = false;
        console.log('filling');
        break;
      case 'processing':
        elements.input.readOnly = true;
        elements.feedbackContainer.textContent = '';
        console.log('processing');
        break;
      case 'success':
        elements.input.readOnly = false;
        elements.form.reset();
        elements.form.focus();
        elements.feedbackContainer.classList.remove('text-danger');
        elements.feedbackContainer.classList.add('text-success');
        elements.feedbackContainer.textContent = i18n.t('form.success');
        console.log('success');
        break;
      default:
        break;
    }
  }
});
