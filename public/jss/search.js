const searchKey = decodeURI(location.pathname.split('/').pop());

const searchSpanElement = document.querySelector('#search-key');
searchSpanElement.innerHTML = searchKey;

getProducts(searchKey).
    then(data => {
        if (data.length === 0) {
            console.log('no data')
            createProductCards(data, '.card-container');
        } else {
            createProductCards(data, '.card-container');
        }
    }); 