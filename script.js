document.addEventListener('DOMContentLoaded', () => {

    const input = document.getElementById('search-box');
    const list = document.getElementById('country-list');
    const info = document.getElementById('country-info');
  
    const itemTemplate = document.getElementById('country-item-template');
    const infoTemplate = document.getElementById('country-info-template');
  
    function clearUI() {
      list.innerHTML = '';
      info.innerHTML = '';
    }
  
    function showMsg(msg) {
      clearUI();
      const li = document.createElement('li');
      li.className = 'notice';
      li.textContent = msg;
      list.appendChild(li);
    }
  
    async function fetchCountries(query) {
      const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(query)}?fields=name,capital,population,flags,languages`;
      const res = await fetch(url);
  
      if (!res.ok) {
        if (res.status === 404) throw new Error('not found');
        throw new Error('network error');
      }
  
      return res.json();
    }
  
    function renderList(countries) {
      list.innerHTML = '';
      info.innerHTML = '';
  
      countries.forEach(c => {
        const clone = itemTemplate.content.cloneNode(true);
        clone.querySelector('.flag').src = c.flags.svg;
        clone.querySelector('.flag').alt = `Прапор ${c.name.common}`;
        clone.querySelector('.name').textContent = c.name.common;
        list.appendChild(clone);
      });
    }
  
    function renderInfo(country) {
      list.innerHTML = '';
      info.innerHTML = '';
  
      const clone = infoTemplate.content.cloneNode(true);
      clone.querySelector('.flag-big').src = country.flags.svg;
      clone.querySelector('.flag-big').alt = `Прапор ${country.name.common}`;
      clone.querySelector('.country-title').textContent = country.name.common;
      clone.querySelector('.capital').textContent =
        `Столиця: ${country.capital ? country.capital[0] : '—'}`;
      clone.querySelector('.population').textContent =
        `Населення: ${country.population.toLocaleString()}`;
      clone.querySelector('.languages').textContent =
        `Мови: ${country.languages ? Object.values(country.languages).join(', ') : '—'}`;
  
      info.appendChild(clone);
    }
  
    async function onSearch(e) {
      const query = e.target.value.trim();
      if (!query) {
        clearUI();
        return;
      }
  
      try {
        const countries = await fetchCountries(query);
  
        if (countries.length > 10) {
          showMsg('Занадто багато результатів. Введи точніше.');
        } else if (countries.length >= 2) {
          renderList(countries);
        } else if (countries.length === 1) {
          renderInfo(countries[0]);
        }
      } catch {
        showMsg('Країн не знайдено.');
      }
    }
  
    input.addEventListener('input', _.debounce(onSearch, 400));
  });
  