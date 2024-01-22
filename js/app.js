/**
 * Represents the username of the user.
 * @type {string}
 */
var user = "gabriel-ezequiel";
/**
 * Represents the current page number.
 * @type {number}
 */
var page = 1;
/**
 * Represents the current pagination of the API.
 * @type {number}
 */
var page_api = 0;
/**
 * The number of items to display per page.
 * @type {number}
 */
var per_page = 30;
/**
 * The maximum number of repositories allowed per API.
 * @type {number}
 */
/**
 * Maximum number of allowed repositories for API.
 * @type {number}
 */
var max_per_repos_api = 90;
/**
 * Number of repositories.
 * @type {number}
 */
var num_repos = 0;
/**
 * Array to store repositories.
 * @type {Array}
 */
var repos = [];
/**
 * Array to store search results for repositories.
 * @type {Array}
 */
var searchRepos = [];
/**
 * The search input variable.
 * @type {string}
 */
var searchInput = "";
var converter = new showdown.Converter();
showdown.setFlavor('github');

/**
 * Fetches data from an API using the provided URL.
 * @param {string} url - The URL of the API.
 * @returns {Promise<Object>} - A promise that resolves to the fetched data.
 */
async function getAPI(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

/**
 * Retrieves repositories from the GitHub API based on the specified parameters.
 */
function getRepos() {
  getAPI(`https://api.github.com/users/${user}/repos?per_page=${max_per_repos_api}&page=${++page_api}&sort=created&direction=desc`).then(data => {
    repos = repos.concat(data);
    num_repos += data.length;
  }).catch(err => {
    console.log(err);
  });
}

/**
 * Creates a carousel based on data retrieved from the GitHub API.
 */
function createCarousel() {
  getAPI(`https://api.github.com/search/repositories?q=user%3Ao=desc&per_page=5&q=user%3A${user}&s=stars&type=Repositories`).then(data => {
    if (data.items[0].stargazers_count === 0) {
      return;
    }
    var carousel = document.getElementById("carousel");
    carousel.innerHTML = "";

    var carouselIndicators = document.createElement("div");
    carouselIndicators.classList.add("carousel-indicators");

    var carouselInner = document.createElement("div");
    carouselInner.classList.add("carousel-inner");

    var active = true;
    var num = 0;

    data.items.forEach(element => {
      if (element.stargazers_count === 0) {
        return;
      }
      var button = document.createElement("button");
      button.setAttribute("type", "button");
      button.setAttribute("data-bs-target", "#carousel");
      button.setAttribute("data-bs-slide-to", num);
      button.setAttribute("aria-label", `Slide ${++num}`);
      if (active) {
        button.classList.add("active");
        button.setAttribute("aria-current", "true");
      }
      carouselIndicators.appendChild(button);

      var carouselItem = document.createElement("div");
      carouselItem.classList.add("carousel-item");
      if (active) {
        carouselItem.classList.add("active");
        active = false;
      }

      var img = document.createElement("img");
      img.classList.add("d-block", "w-100", "wide-img");
      img.src = `https://raw.githubusercontent.com/${user}/${element.name}/${element.default_branch}/thumbnail/1.jpeg`;
      img.onerror = function () {
        onerror=null;
        img.src = 'imgs/404NotFound.jpeg';
      };
      img.alt = "...";
      carouselItem.appendChild(img);

      var carouselCaption = document.createElement("div");
      carouselCaption.classList.add("carousel-caption", "d-none", "d-sm-block");

      var h5 = document.createElement("h5");
      h5.textContent = element.name.replace(/([\w\d])-(?=[\w\d])/g, '$1 ').replace(/(---)/g, ' - ').replace(/^\w/, (l) => l.toUpperCase()); // replace(/\b\w/g, function(l){ return l.toUpperCase() });

      var p = document.createElement("p");
      p.textContent = element.description;

      carouselCaption.appendChild(h5);
      carouselCaption.appendChild(p);

      carouselItem.appendChild(carouselCaption);
      carouselInner.appendChild(carouselItem);
    });

    carousel.appendChild(carouselIndicators);
    carousel.appendChild(carouselInner);

    var buttonPrev = document.createElement("button");
    buttonPrev.classList.add("carousel-control-prev");
    buttonPrev.setAttribute("type", "button");
    buttonPrev.setAttribute("data-bs-target", "#carousel");
    buttonPrev.setAttribute("data-bs-slide", "prev");

    var spanPrev = document.createElement("span");
    spanPrev.classList.add("carousel-control-prev-icon");
    spanPrev.setAttribute("aria-hidden", "true");

    var spanPrev2 = document.createElement("span");
    spanPrev2.classList.add("visually-hidden");
    spanPrev2.textContent = "Previous";

    buttonPrev.appendChild(spanPrev);
    buttonPrev.appendChild(spanPrev2);

    var buttonNext = document.createElement("button");
    buttonNext.classList.add("carousel-control-next");
    buttonNext.setAttribute("type", "button");
    buttonNext.setAttribute("data-bs-target", "#carousel");
    buttonNext.setAttribute("data-bs-slide", "next");

    var spanNext = document.createElement("span");
    spanNext.classList.add("carousel-control-next-icon");
    spanNext.setAttribute("aria-hidden", "true");

    var spanNext2 = document.createElement("span");
    spanNext2.classList.add("visually-hidden");
    spanNext2.textContent = "Next";

    buttonNext.appendChild(spanNext);
    buttonNext.appendChild(spanNext2);

    carousel.appendChild(buttonPrev);
    carousel.appendChild(buttonNext);

  }).catch(err => {
    console.log(err)
  });
}

/**
 * Creates cards for displaying repositories.
 * 
 * @param {Array} repos - The array of repositories.
 * @param {number} start - The starting index of the slice.
 * @param {number} end - The ending index of the slice.
 */
function createCards(repos, start, end) {

  var cards = document.getElementById("cards");
  cards.innerHTML = "";

  var row = document.createElement("div");
  row.classList.add("row");
  row.style.padding = "10px";

  repos.slice(start, end).forEach(element => {
    var col = document.createElement("div");
    col.classList.add("col-md-4")
    col.style.padding = "5px";

    var card = document.createElement("div");
    card.classList.add("card");
    card.onclick = function () {
      createDetails(element.name, element.default_branch);
      window.scrollTo(0, 0);
    };

    var cardImg = document.createElement("img");
    cardImg.classList.add("card-img-top", "wide-img");
    cardImg.src =  `https://raw.githubusercontent.com/${user}/${element.name}/${element.default_branch}/imgs/1.jpeg`;
    cardImg.onerror = function () {
      onerror=null;
      cardImg.src = 'imgs/404NotFound.jpeg';
    };
    cardImg.alt = "...";
    card.appendChild(cardImg);

    var cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    var cardTitle = document.createElement("h5");
    cardTitle.classList.add("card-title");
    cardTitle.textContent = element.name.replace(/([\w\d])-(?=[\w\d])/g, '$1 ').replace(/(---)/g, ' - ').replace(/^\w/, (l) => l.toUpperCase()); // replace(/\b\w/g, function(l){ return l.toUpperCase() });
    
    var cardText = document.createElement("p");
    cardText.classList.add("card-text");
    cardText.textContent = element.description;

    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);
    card.appendChild(cardBody);

    var cardFooter = document.createElement("div");
    cardFooter.classList.add("card-footer", "text-body-secondary", "text-center");
    cardFooter.textContent = element.language;

    card.appendChild(cardFooter);
    col.appendChild(card);
    row.appendChild(col);
  });
  cards.appendChild(row);

  cards.appendChild(createPagination());
}

/**
 * Creates a pagination element with previous and next buttons, as well as page numbers.
 * @returns {HTMLElement} The pagination element.
 */
function createPagination() {
  var nav = document.createElement("nav");
  nav.setAttribute("aria-label", "Navegação de página exemplo");

  var ul = document.createElement("ul");
  ul.classList.add("pagination", "justify-content-center");
  nav.appendChild(ul);

  var li = document.createElement("li");
  li.classList.add("page-item");
  if (page === 1) {
    li.classList.add("disabled");
  }
  var a = document.createElement("div");
  a.classList.add("page-link");
  a.textContent = "Previous";
  a.onclick = function () {
    previousPage();
    window.scrollTo(0, 0);
  };
  li.appendChild(a);
  ul.appendChild(li);

  if ((page-1) > 0) {
    li = document.createElement("li");
    li.classList.add("page-item");
    a = document.createElement("div");
    a.classList.add("page-link");
    a.textContent = page-1;
    a.onclick = function () {
      previousPage();
      window.scrollTo(0, 0);
    };
    li.appendChild(a);
    ul.appendChild(li);
  }

  li = document.createElement("li");
  li.classList.add("page-item", "active");
  a = document.createElement("div");
  a.classList.add("page-link");
  a.textContent = page;
  li.appendChild(a);
  ul.appendChild(li);

  if ((num_repos-(page*per_page)) > 0) {
    li = document.createElement("li");
    li.classList.add("page-item");
    a = document.createElement("div");
    a.classList.add("page-link");
    a.textContent = page+1;
    a.onclick = function () {
      nextPage();
      window.scrollTo(0, 0);
    };
    li.appendChild(a);
    ul.appendChild(li);
  }

  li = document.createElement("li");
  li.classList.add("page-item");
  if (!((num_repos-(page*per_page)) > 0)) {
    li.classList.add("disabled");
  }
  a = document.createElement("div");
  a.classList.add("page-link");
  a.textContent = "Next";
  a.onclick = function () {
    nextPage();
    window.scrollTo(0, 0);
  };
  li.appendChild(a);
  ul.appendChild(li);

  nav.appendChild(ul);

  return nav;
}

/**
 * Goes to the previous page and updates the cards accordingly.
 */
function previousPage() {
  createCards(repos, per_page*(page-2), per_page*--page);
}

/**
 * Go to the next page and display the corresponding cards.
 */
function nextPage() {
  createCards(repos, per_page*(page++), per_page*page);
  if (num_repos >= per_page*page) {
    getRepos();
  }
}

/**
 * Fetches the README.md file from a GitHub repository and populates the details section of the webpage.
 * @param {string} nameRepo - The name of the GitHub repository.
 * @param {string} defaultBranch - The default branch of the GitHub repository.
 */
function createDetails(nameRepo,defaultBranch) {
  fetch(`https://raw.githubusercontent.com/${user}/${nameRepo}/${defaultBranch}/README.md`).then(async response => {
    var details = document.getElementById("details");
    details.innerHTML = "";
    var cards = document.getElementById("cards");
    cards.innerHTML = "";

    var a = await response.text();

    details.innerHTML = converter.makeHtml(a);

    var div = document.createElement("div");
    div.classList.add("d-grid", "gap-2", "d-md-flex", "justify-content-md-center");

    var back = document.createElement("button");
    back.classList.add("btn", "btn-primary");
    back.textContent = "Back";
    back.onclick = backPage;
    div.appendChild(back);
    details.appendChild(div);
  }).catch(err => {
    console.log(err);
  });
}

/**
 * Clears the details element, sets the page to 1, creates cards for the repositories, and scrolls to the top of the page.
 */
function project() {
  var details = document.getElementById("details");
  details.innerHTML = "";
  page = 1;
  createCards(repos, 0, per_page);
  window.scrollTo(0, 0);
}

/**
 * Clears the details element, creates new cards based on the current page and displays them, 
 * and scrolls the window to the top.
 */
function backPage() {
  var details = document.getElementById("details");
  details.innerHTML = "";
  createCards(repos, per_page*(page-1), per_page*page);
  window.scrollTo(0, 0);
}

/**
 * Performs a search based on the input value and updates the display with the search results.
 */
function search() {
  var input = document.getElementById("search").value;
  getAPI(`https://api.github.com/search/repositories?q=user%3A${user}+${input}`).then(data => {
    searchRepos = data;
    createCards(searchRepos.items, 0, per_page);
  }).catch(err => {
    console.log(err);
  });

  console.log(input);
}

/**
 * The main function that initializes the application.
 */
function main() {
  getRepos();
  createCarousel();
  setTimeout(() => {
    createCards(repos, 0, per_page);
  }, 1000);
}

alert("developing site")

main();