let pageNo = 1;
let SERVICE1;
let SERVICE2;
let SERVICE3;
const APISERVICE = () => {
  SERVICE1 = `https://api.jikan.moe/v4/anime?page=${pageNo}`;
  SERVICE2 = `https://api.jikan.moe/v4/anime`;
  SERVICE3 = `https://api.jikan.moe/v4/anime?q=`;
};
APISERVICE();

let receivedList = [];
let allData;

const getData = async () => {
  showLoader();
  const res = await fetch(SERVICE1);
  const data = await res.json();
  showAllDataUI(data);
  getWatchList();
  updateWatchListUI();
  filterCategory();
  externalink();
};

getData();

function findIndexByKeyValue(_array, key, value) {
  for (var i = 0; i < _array.length; i++) {
    if (_array[i][key] == value) {
      return i;
    }
  }
  return -1;
}

const showAllDataUI = (data) => {
  let seriesList = data.data;
  allData = data.data;
  let seriesListHTML = "";

  seriesList.map((item, index) => {
    seriesListHTML += `
    
        <div class="series__list-item" id="series__list-item-${
          item.mal_id
        }" data-title='${item.title}' data-malId=${item.mal_id}>
            <div class="series__list-item__img">
                <img src="${item.images.webp.large_image_url}" id="img-${
      item.mal_id
    }"/>
            </div>
            <div class="series__list-item__score">
                <p>${item.score}/10</p>
            </div>
            <div class="series__list-item__watchList" title="Watch list">
                <button class="series__list-item__watchList-btn watchlist-btn" id="wid-${
                  item.mal_id
                }" data-malId=${item.mal_id}>
                    <i class="fa-regular fa-heart" id="star-${item.mal_id}"></i>
                </button>
            </div>
            <div class="series__list-item__status">
                <p>${item.status.split(" ")[0]}</p>
                <p>${item.type}</p>
            </div>
            <div class="series__list-item__title">
                <h3>${item.title}</h3>
            </div>
        </div>
    `;
  });

  document.getElementById("series__list").innerHTML = seriesListHTML;
  const watchlistBtn = document.querySelectorAll(".watchlist-btn");

  watchlistBtn.forEach((item, index) => {
    item.addEventListener("click", (e) => {
      const indexVal = findIndexByKeyValue(
        seriesList,
        "mal_id",
        item.getAttribute("data-malId")
      );
      console.log(allData[indexVal]);
      const addWatchlistData = {
        index: index + 1,
        star: true,
        malId: parseInt(item.getAttribute("data-malId")),
        image: allData[indexVal].images.webp.large_image_url,
        score: allData[indexVal].score,
        title: allData[indexVal].title,
      };
      addToWatchList(addWatchlistData);
    });
  });
  hideLoader();
  showPagination(data);
  showBanner(data);
};

const showBanner = (data) => {
  const bData = data.data;
  let bannerHTML = "";

  for (let b = 0; b < 4; b++) {
    if(bData[b].trailer.images.large_image_url){
    bannerHTML += `
    <div class="swiper-slide">
      <img src="${bData[b].trailer.images.large_image_url}"/>
      <div class="banner-title">${bData[b].title}</div>
    </div>
  `;
    }
  }
  document.getElementById("banners").innerHTML = bannerHTML;
};

const addToWatchList = (data) => {
  let items;
  let stared = false;

  if (localStorage.getItem("items") === null) {
    items = [];
    items.push(data);
    localStorage.setItem("items", JSON.stringify(items));
    window.location.reload();
  } else {
    items = JSON.parse(localStorage.getItem("items"));
    items.map((item) => {
      if (item.malId === data.malId) {
        stared = true;
      }
    });

    if (!stared) {
      items.push(data);
      localStorage.setItem("items", JSON.stringify(items));
    } else {
      items.splice(
        items.findIndex((a) => a.malId === data.malId),
        1
      );
      localStorage.setItem("items", JSON.stringify(items));
    }
    getData();
    updateWatchListUI();
  }
};

const getWatchList = () => {
  if (localStorage.getItem("items") === null) {
    receivedList = [];
  } else {
    receivedList = JSON.parse(localStorage.getItem("items"));
  }

  receivedList.map((item) => {
    let starBtn = document.getElementById(`star-${item.malId}`);

    if (starBtn != null) {
      starBtn.classList.remove("fa-regular");
      starBtn.classList.add("fa-solid");
    }
  });
};

const updateWatchListUI = () => {
  let lcData = JSON.parse(localStorage.getItem("items"));

  if (lcData == null) {
    lcData = [];
  }

  let wlHTML = "";
  if (lcData.length > 0 && lcData != null) {
    lcData.map((item, index) => {
      wlHTML += `
          <div class="watchlist-item" id="watch__list-item-${item.malId}" data-wmalId=${item.malId}>
            <div class="watchlist-item__img">
                <img src="${item.image}" />
            </div>
            <div class="watchlist-item__score">
                <p>${item.score}/10</p>
            </div>
            <div class="watchlist-item__watchList">
                <button class="watchlist-item__watchList-btn watchlist-removeBtn" data-rId=${item.malId}>
                <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="watchlist-item__title">
                <h3>${item.title}</h3>
            </div>
        </div>
          `;
    });
  } else {
    wlHTML += `<h4>Your watchlist is empyt :(</h4>`;
  }

  document.getElementById("watchlists").innerHTML = wlHTML;
  removeElementFromWL();
};

const removeElementFromWL = () => {
  const newItem = document.querySelectorAll(".watchlist-removeBtn");

  newItem.forEach((item) => {
    let newItems = JSON.parse(localStorage.getItem("items"));
    item.addEventListener("click", () => {
      newItems.splice(
        newItems.findIndex(
          (a) => a.malId === parseInt(item.getAttribute("data-rId"))
        ),
        1
      );
      localStorage.setItem("items", JSON.stringify(newItems));
      getData();
    });
  });
};

const searchBtn = document.getElementById("searchBtn");

searchBtn.addEventListener("click", () => {
  let filterValue = document.getElementById("searchBar").value;
  searchSeries(filterValue);
});

let filterValue = document.getElementById("searchBar");
filterValue.onkeyup = function (e) {
  if (e.keyCode == 13) {
    searchSeries(filterValue.value);
  }
};

const searchSeries = async (value) => {
  showLoader();
  const res = await fetch(`${SERVICE3}${value}`);
  const data = await res.json();
  showAllDataUI(data);
  document.getElementById("searchBar").value = "";
};

const externalink = () => {
  const itemCard = document.querySelectorAll(".series__list-item");

  itemCard.forEach((item, index) => {
    item.addEventListener("click", (e) => {
      if (e.target.id == `star-${item.getAttribute("data-malId")}`) {
        console.log("do nothig");
      } else {
        window.open(
          `/views/seriesDetails.html?id=${item.getAttribute("data-malId")}`
        );
      }
    });
  });
};

const filterCategory = () => {
  let filist = [];
  let genreHTML = `<option value="Choose Category">Choose Category</option>`;
  allData.map((item, index) => {
    let genres = item.genres;
    genres.map((li) => {
      filist.push(li.name);
    });
  });
  filist = [...new Set(filist)];

  filist.map((genre) => {
    genreHTML += `
        <option value="${genre}">${genre}</option>
    `;
  });
  document.getElementById("category").innerHTML = genreHTML;
};

const showPagination = (data) => {
  let pageHTML = "";
  for (let p = 0; p < 25; p++) {
    pageHTML += `
      <div class="page page-btn" id="p-${p + 1}">${p + 1}</div>
    `;
  }
  document.querySelector(".pages").innerHTML = pageHTML;
  document.getElementById(`p-${pageNo}`).classList.add("active");
  const pageBtn = document.querySelectorAll(".page-btn");

  pageBtn.forEach((item, index) => {
    item.addEventListener("click", (e) => {
      pageNo = parseInt(e.target.innerHTML);
      APISERVICE();
      getData();
    });
  });
};

const swiper = new Swiper(".swiper", {
  direction: "horizontal",
  loop: true,
  autoplay: {
    delay: 4000,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});
function showLoader() {
  document.querySelector(".loader").classList.remove("hide");
  document.querySelector(".loader").classList.add("show");
}
function hideLoader() {
  document.querySelector(".loader").classList.add("hide");
  document.querySelector(".loader").classList.remove("show");
}

const pagesBlock = document.querySelector(".pages");
const prevPage = document.querySelector(".prev");
const nextPage = document.querySelector(".next");

const scrollTo = (value) => (pagesBlock.scrollLeft += value);

pagesBlock.addEventListener("wheel", (event) => scrollTo(event.deltaY));
nextPage.addEventListener("click", (event) => scrollTo(40));
prevPage.addEventListener("click", (event) => scrollTo(-40));
