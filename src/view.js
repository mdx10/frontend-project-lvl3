import onChange from 'on-change';

const elements = {
  form: document.querySelector('form'),
  input: document.querySelector('#url-input'),
  feedbackContainer: document.querySelector('.feedback'),
};
const renderError = (value) => {
  if (value) {
    elements.input.classList.add('is-invalid');
    elements.feedbackContainer.classList.remove('text-success');
    elements.feedbackContainer.classList.add('text-danger');
    elements.feedbackContainer.textContent = value;
  } else {
    elements.input.classList.remove('is-invalid');
    elements.feedbackContainer.textContent = '';
  }
};
export default (state) => onChange(state, (path, value) => {
  if (path === 'rssForm.error') {
    renderError(value);
  }
});
