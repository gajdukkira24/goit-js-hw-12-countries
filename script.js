const form = document.querySelector("#search-form");
const resultsList = document.querySelector("#results-list");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const query = e.target.query.value.trim();

  if (!query) {
    PNotify.error({ text: "Введи запит!" });
    return;
  }

  try {

    const response = await fetch(`https://jsonplaceholder.typicode.com/posts?title_like=${query}`);

    if (!response.ok) {
      throw new Error("Помилка сервера");
    }

    const data = await response.json();

    if (data.length === 0) {
      PNotify.info({ text: "Нічого не знайдено" });
    }

    resultsList.innerHTML = createMarkup(data);

    PNotify.success({ text: "Готово!" });

  } catch (error) {
    PNotify.error({ text: "Сталася помилка: " + error.message });
  }
});


function createMarkup(items) {
  return items
    .map(
      (item) => `
        <li class="result-item">
          <h3>${item.title}</h3>
          <p>${item.body}</p>
        </li>
      `
    )
    .join("");
}