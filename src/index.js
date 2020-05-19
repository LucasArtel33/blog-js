import "./assets/styles/styles.scss";
import "./index.scss";
import { openModal } from "./assets/javascripts/modal.js";

console.log("test");

const articlesContainer = document.querySelector(".articles-container");
const categoriesContainer = document.querySelector(".categories");
const selectElement = document.querySelector("select");
let filter;
let articles;
let sortBy = "desc";

selectElement.addEventListener("change", () => {
  sortBy = selectElement.value;
  fetchArticles();
});

const createArticles = () => {
  const articlesDOM = articles
    .filter((article) => {
      if (filter) {
        return article.category === filter;
      } else {
        return true;
      }
    })
    .map((article) => {
      const articleDOM = document.createElement("div");
      articleDOM.classList.add("article");
      articleDOM.innerHTML = `
    <h2>${article.title}</h2>
    <p class="article-author">${article.author} - ${new Date(
        article.createdAt
      ).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}</p>
    <p class="article-content">${article.content}</p>
    <div class="article-action">
      <button class="btn btn-secondary" data-id=${
        article._id
      } >Modifier</button>
      <button class="btn btn-danger" data-id=${article._id} >Supprimer</button>
    </div>
    `;
      return articleDOM;
    });
  articlesContainer.innerHTML = "";
  articlesContainer.append(...articlesDOM);
  const deleteBtn = articlesContainer.querySelectorAll(".btn-danger");
  const editBtn = articlesContainer.querySelectorAll(".btn-secondary");
  editBtn.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const articleId = e.target.dataset.id;
      location.assign(`./form.html?id=${articleId}`);
    });
  });
  deleteBtn.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const result = await openModal(
        "Etes vous sur de vouloir supprimer votre article ?"
      );
      if (result === true) {
        try {
          const articleId = e.target.dataset.id;
          const response = await fetch(
            `https://restapi.fr/api/articleLucas/${articleId}`,
            {
              method: "DELETE",
            }
          );
          const body = await response.json();
          fetchArticles();
        } catch (e) {
          console.log("e :", e);
        }
      }
    });
  });
};

const displayCategoriesMenu = (categoriesArr) => {
  const liElements = categoriesArr.map((categoryElem) => {
    const li = document.createElement("li");
    li.innerHTML = `${categoryElem[0]} (<strong>${categoryElem[1]}</strong>)`;
    if (categoryElem[0] === filter) {
      li.classList.add("active");
    }
    li.addEventListener("click", () => {
      if (filter === categoryElem[0]) {
        filter = null;
        li.classList.remove("active");
      } else {
        filter = categoryElem[0];
        liElements.forEach((li) => {
          li.classList.remove("active");
        });
        li.classList.add("active");
      }
      createArticles();
    });
    return li;
  });
  categoriesContainer.innerHTML = "";
  categoriesContainer.append(...liElements);
};

const createMenuCat = () => {
  const categories = articles.reduce((acc, article) => {
    if (acc[article.category]) {
      acc[article.category]++;
    } else {
      acc[article.category] = 1;
    }
    return acc;
  }, {});

  const categoriesArr = Object.keys(categories)
    .map((category) => {
      return [category, categories[category]];
    })
    .sort((c1, c2) => c1[0].localeCompare(c2[0]));
  displayCategoriesMenu(categoriesArr);
};

const fetchArticles = async () => {
  try {
    const response = await fetch(
      `https://restapi.fr/api/articleLucas?sort=createdAt:${sortBy}`
    );
    articles = await response.json();
    createArticles();
    createMenuCat();
  } catch (e) {
    console.log("error :", e);
  }
};

fetchArticles();
