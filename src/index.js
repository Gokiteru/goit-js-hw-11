import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages } from './js/fetch-Images';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMore = document.querySelector('.load-more');

let query = '';
let page = 1;
let simpleLightBox;
const perPage = 40;

searchForm.addEventListener('submit', onSearchForm);

function renderGallery(images) {
  if (!gallery) {
    return;
  }

  const markup = images
    .map(image => {
      const {
        id,
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      } = image;
      return `
        <a class="gallery__link" href="${largeImageURL}">
          <div class="gallery-item" id="${id}">
            <img class="gallery-item__img" src="${webformatURL}" alt="${tags}" loading="lazy" />
            <div class="info">
              <p class="info-item"><b>Likes</b>${likes}</p>
              <p class="info-item"><b>Views</b>${views}</p>
              <p class="info-item"><b>Comments</b>${comments}</p>
              <p class="info-item"><b>Downloads</b>${downloads}</p>
            </div>
          </div>
        </a>
      `;
    })
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
}

function onSearchForm(e) {
  e.preventDefault();
  page = 1;
  query = e.currentTarget.elements.searchQuery.value.trim();
  gallery.innerHTML = '';

  if (query === '') {
    loadMore.classList.add('is-hidden');
    Notiflix.Notify.failure(
      'The search string cannot be empty. Please specify your search query.'
    );
    return;
  }

  (async () => {
    try {
      const data = await fetchImages(query, page, perPage);

      if (data.totalHits === 0) {
        loadMore.classList.add('is-hidden');
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        loadMore.classList.remove('is-hidden');
        renderGallery(data.hits);
        simpleLightBox = new SimpleLightbox('.gallery a').refresh();
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
        if (data.totalHits < 40) {
          loadMore.classList.add('is-hidden');
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      searchForm.reset();
    }
  })();
}

function onloadMore() {
  page += 1;
  simpleLightBox.destroy();
  (async () => {
    try {
      const data = await fetchImages(query, page, perPage);
      renderGallery(data.hits);
      simpleLightBox = new SimpleLightbox('.gallery a').refresh();

      const totalPages = Math.ceil(data.totalHits / perPage);

      if (page >= totalPages) {
        loadMore.classList.add('is-hidden');
        Notiflix.Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
      }
    } catch (error) {
      console.log(error);
    }
  })();
}

loadMore.addEventListener('click', onloadMore);
