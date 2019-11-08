export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) {
    el.parentElement.removeChild(el);
  }
};

export const showAlert = (type, message, time = 3) => {
  // type = success || error
  hideAlert();
  const markup = `<div class="alert alert--${type}">${message}</div>`;

  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  setTimeout(hideAlert, time * 1000);
};
