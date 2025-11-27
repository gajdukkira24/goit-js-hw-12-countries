// script.js (ES module)
const input = document.getElementById('search-box');
const list = document.getElementById('country-list');
const info = document.getElementById('country-info');

// Компіляція inline Handlebars-шаблонів (вони є в index.html)
const countryItemTpl = Handlebars.compile(
  document.getElementById('country-item-template').innerHTML
);
const countryInfoTpl = Handlebars.compile(
  document.getElementById('country-info-template').innerHTML
);

// Простой дебаунс, щоб не посилати запит на кожну клавішу
function debounce(fn, ms = 350) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

// Використовуємо AbortController, щоб скасовувати попередні запити
let controller = null;
function fetchCountries(query) {
  const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(
    query
  )}?fields=name,capital,population,flags,languages`;

  // Скасовуємо попередній запит, якщо є
  if (controller) {
    controller.abort();
  }
  controller = new AbortController();

  return fetch(url, { signal: controller.signal }).then((res) => {
    if (!res.ok) {
      // 404 -> повернемо спеціальну помилку для обробки
      if (res.status === 404) {
        const err = new Error('not found');
        err.code = 404;
        throw err;
      }
      throw new Error('Network response was not ok');
    }
    return res.json();
  });
}

function clearUI() {
  list.innerHTML = '';
  info.innerHTML = '';
}

function showMessage(text) {
  // просте повідомлення в блоці списку
  list.innerHTML = `<li class="notice">${text}</li>`;
  info.innerHTML = '';
}

async function onSearchHandler(e) {
  const query = e.target.value.trim();
  if (!query) {
    clearUI();
    return;
  }

  try {
    const countries = await fetchCountries(query);

    if (!Array.isArray(countries) || countries.length === 0) {
      clearUI();
      showMessage('Країн не знайдено.');
      return;
    }

    if (countries.length > 10) {
      clearUI();
      showMessage('Занадто багато результатів. Введи точніший запит.');
      return;
    }

    if (countries.length >= 2 && countries.length <= 10) {
      info.innerHTML = '';
      // countries.map -> кожен елемент рендеримо через шаблон item
      list.innerHTML = countries.map((c) => countryItemTpl(c)).join('');
      return;
    }

    if (countries.length === 1) {
      list.innerHTML = '';
      info.innerHTML = countryInfoTpl(countries[0]);
      return;
    }
  } catch (err) {
    // якщо запит скасовано — мовчимо
    if (err.name === 'AbortError') return;

    // 404 (не знайдено)
    if (err.code === 404 || err.message === 'not found') {
      clearUI();
      showMessage('Країн не знайдено.');
      return;
    }

    console.error('Помилка при fetchCountries:', err);
    clearUI();
    showMessage('Сталася помилка. Подивись консоль (F12).');
  }
}

// підключаємо дебаунсований обробник
input.addEventListener('input', debounce(onSearchHandler, 400));
