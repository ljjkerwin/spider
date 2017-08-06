
class ListManager {
  constructor(wrapEl) {
    this.wrapEl = wrapEl;
    this.list = []
    this.status = 'end';
    this.keywords = '';

    let wrapElClientHeight = wrapEl.clientHeight;
    wrapEl.addEventListener('scroll', e => {
      if (wrapEl.scrollHeight <= wrapEl.scrollTop + wrapElClientHeight) {
        if (this.status === 'more') {
          this.continueSearch();
        }
      }
    })

    let listEl = document.createElement('div');
    listEl.className = 'list';
    wrapEl.appendChild(listEl);
    this.listEl = listEl;

    let statusEl = document.createElement('div');
    statusEl.className = 'status';
    wrapEl.appendChild(statusEl);
    this.statusEl = statusEl;
    statusEl.addEventListener('click', e => {
      if (this.status === 'more') {
        this.continueSearch();
      }
    })

  }

  search(keywords) {
    if (!keywords) {
      this.list = [];
      this.status = 'end';
      this.renderResult();
      return;
    }
    keywords += '';
    this.keywords = keywords;
    this.changeStatus('pending');

    return fetch(`/search?keywords=${keywords}&page_size=16`)
      .then(body => body.json())
      .then(res => {
        this.list = [];
        this.handleGetResult(res)
      })
  }

  continueSearch() {
    if (this.status !== 'more') return;
    if (!this.next_page) return;

    this.changeStatus('pending');

    return fetch(`/search?keywords=${this.keywords}&next_page=${this.next_page}&page_size=16`)
      .then(body => body.json())
      .then(res => {
        this.handleGetResult(res)
      })
  }

  handleGetResult(res) {
    let data = res.data;
    console.log(data)

    this.list = this.list.concat(this.matchKeywords(data.list));
    this.next_page = data.next_page;
    this.status = !data.next_page ? 'end' : 'more';

    this.renderResult();
  }

  /**
   * {
   *  list: []
   *  status: ''
   * }
   */
  renderResult() {
    this.renderList(this.list);
    this.renderStatus(this.status);

    if (this.wrapEl.clientHeight === this.wrapEl.scrollHeight && this.status === 'more') {
      this.continueSearch();
    }
  }

  matchKeywords(list) {
    let match = this.keywords.split(' ');
    match = match.filter(i => i);
    match = match.join('|');
    console.log(match)

    list.forEach(item => {
      item._title = item.title.replace(RegExp(match, 'ig'), m => {
        return `<b>${m}</b>`;
      })
    })
    console.log(match)
    return list;
  }

  changeStatus(status) {
    this.status = status;
    this.renderStatus(status);
  }

  renderList(list) {
    let html = ''
    list.forEach(item => {
      html += `
        <div class="result-item" data-link="${item.link}" title="${item.title}">
          <div class="img" style="background-image: url(${item.img})"></div>
          <div class="title">${item._title}</div>
        </div>
      `;
    })
    this.listEl.innerHTML = html;
  }

  renderStatus(status) {
    let statusStr = '';
    switch (status) {
      case 'more':
        statusStr = 'load more';
        break;
      case 'pending':
        statusStr = 'loading';
        break;
      case 'end':
        statusStr = 'end';
        break;
    }

    this.statusEl.innerHTML = statusStr;
  }
}




const appEl = document.createElement('div');
appEl.id = 'app';
appEl.innerHTML = `
  <div class="search-bar">
    <input type="text" id='searchInput'>
    <button id="searchBtn">search</button>
  </div>

  <div class="search-result">
  </div>
`;
document.body.appendChild(appEl);


const resultEl = appEl.querySelector('.search-result');
const manager = new ListManager(resultEl);


manager.search(1);








searchInput.addEventListener('keyup', e => {
  if (e.keyCode === 13) {
    let key = searchInput.value.trim();
    manager.search(key);
  }
});

searchBtn.addEventListener('click', () => {
  let key = searchInput.value.trim();
  manager.search(key);
})

$(document.body).on('click', '.result-item', e => {
  let t = e.currentTarget;
  let link = t.getAttribute('data-link');
  window.open(link);
})

