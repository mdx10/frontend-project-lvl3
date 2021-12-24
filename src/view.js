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
export default (state, i18n) => onChange(state, (path, value) => {
  if (path === 'rssForm.error') {
    renderError(value);
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
