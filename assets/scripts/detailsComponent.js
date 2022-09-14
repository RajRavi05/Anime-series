const url_string = window.location.href;
const url = new URL(url_string);
const id = url.searchParams.get("id");

const SERVICE4 = `https://api.jikan.moe/v4/anime/${id}/full`;

const getFullDetails = async () => {
  showLoader();
  const res = await fetch(SERVICE4);
  const data = await res.json();
  updateDetailsUI(data);
};
getFullDetails();

const updateDetailsUI = (data) => {
  let detailsHTML = "";
  let detailsData = data.data;
  detailsHTML += `
        <div class="details__container">
            <div class="details__img-cont">
                <img src="${detailsData.images.jpg.large_image_url}" />
            </div>
            <div class="details__content">
                <div class="details__content-heading">
                    <h2>${detailsData.title}</h2>
                    <h3><i class="fa-solid fa-calendar-days"></i>${
                      detailsData.year != null ? detailsData.year : ""
                    }</h3>
                </div>
                <div class="details__content-paragraph">
                    <p>${detailsData.synopsis}</p>
                </div>
                <div class="details__content-breif">
                <a
                    href="${detailsData.trailer.url}"
                    class="details__content-breif-yt"
                    target="_blank"
                    >Watch Trailer</a
                >
                <p class="details__content-breif-hr">
                    <i class="fa-regular fa-clock"></i>${detailsData.duration}
                </p>
                <p class="details__content-breif-ep">
                    <i class="fa-solid fa-tv"></i>${
                      detailsData.episodes
                    } Episodes
                </p>
                <p class="details__content-breif-scr">
                    <i class="fa-solid fa-star"></i>${detailsData.score}/10
                </p>
                </div>
            </div>
        </div>
  `;

  document.getElementById("individualDeatils").innerHTML = detailsHTML;
  hideLoader();
};

function showLoader() {
  document.querySelector(".loader").classList.remove("hide");
  document.querySelector(".loader").classList.add("show");
}
function hideLoader() {
  document.querySelector(".loader").classList.add("hide");
  document.querySelector(".loader").classList.remove("show");
}
