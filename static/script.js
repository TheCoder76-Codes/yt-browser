namespace = '/web';
var socket = io(namespace);

if (!localStorage.getItem('agree')) {
  Swal.fire({
    title: 'Accept to access the website',
    text: 'The creator of this website is not responsible for any actions. This tool was created for educational purposes only. By accepting, you agree that you are responsible for your actions.',
    allowOutsideClick: () => {
      const popup = Swal.getPopup()
      popup.classList.remove('swal2-show')
      setTimeout(() => {
        popup.classList.add('animate__animated', 'animate__headShake')
      })
      setTimeout(() => {
        popup.classList.remove('animate__animated', 'animate__headShake')
      }, 500)
      return false
    },
    confirmButtonText: 'I accept',
    backdrop: true,
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.setItem('agree', 'yes')
    }
  })
}
if (!localStorage.getItem('name')) {
  Swal.fire({
    title: 'Please enter your name',
    html: `<input type="text" id="login" class="swal2-input" placeholder="Name">`,
    confirmButtonText: 'Sign in',
    focusConfirm: false,
    preConfirm: () => {
      const login = Swal.getPopup().querySelector('#login').value
      if (!login) {
        Swal.showValidationMessage(`Please enter login and password`)
      }
      return { login: login }
    },
    allowOutsideClick: () => {
      const popup = Swal.getPopup()
      popup.classList.remove('swal2-show')
      setTimeout(() => {
        popup.classList.add('animate__animated', 'animate__headShake')
      })
      setTimeout(() => {
        popup.classList.remove('animate__animated', 'animate__headShake')
      }, 500)
      return false
    },
    backdrop: true,
  }).then((result) => {
      localStorage.setItem('name', result.value.login)
  })
}

if (localStorage.getItem('agree') && localStorage.getItem('name') && localStorage.getItem('id')) { socket.emit('room', localStorage.getItem('id'))}

function random(length = 8) {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
};

var id;
if (!localStorage.getItem('id')) {
  id = random(32)
  localStorage.setItem('id', id)
}
const div = document.getElementById('main')

var afterLogin = () => {

  if (localStorage.getItem('id')) {
    div.innerHTML = `
      <form id="f-search">
        <h3>Start Searching</h3>
        <input type="text" placeholder="Search" autocomplete="off" id="i-search" style="display:  inline;">
        <input type="submit" value="search" class="material-icons">
      </form>
      <br>
      <br>
      <button onclick="watchLastVideo()">Or, watch your last downloaded video.</button>`
  } else {
    div.innerHTML = `
    <form id="f-search">
      <h3>Start Searching</h3>
      <input type="text" placeholder="Search" autocomplete="off" id="i-search" style="display:  inline;">
      <input type="submit" value="search" class="material-icons">
    </form>`
  }
}

afterLogin()

var urlArray = []

function choose(num) {
  div.innerHTML = `<h2>Please wait, proccessing and downloading video. This may take a while.</h2>`
  //emit
  var url = urlArray[num]
  socket.emit('download', { userId: localStorage.getItem('id'), url: url, name: localStorage.getItem('name')})
}


function watchLastVideo() {
  div.innerHTML = `
  <p>To watch the video, press play below. If you want another video, press the button below that specifies it.</p>
  <video controls>
    <source src="/static/videos/${localStorage.getItem('userId')}.mp4" type="video/mp4">
  </video>
  <button onclick="window.location.reload()">Search Again!</button>`
  
}



  document.getElementById('f-search').addEventListener('submit', (e) => {
    e.preventDefault()
    var search = document.getElementById('i-search').value
    div.innerHTML = `<h2>Searching for: ${search}`

    socket.emit('search', { search: search, id: localStorage.getItem('id') })
  })
  // urls from search

  socket.on('searchDone', function (videos) {
    videos = videos
    console.log(videos)
    var htmlCode

    for (var i = 0; i < videos.result.length; i++) {
      var video = videos.result[i]
      var title = video.title
      var duration = video.duration
      var thumbURL = `/static/images/${localStorage.getItem('id')}/${i}.jpg`
      var channel = video.channel.name
      var url = video.link
      htmlCode += `
      <div class="video">
        <img width="20%" height="20%" src="${thumbURL}">
        <div>
          <h4>${title}</h4>
          <p>Duration: ${duration}
            From channel: ${channel}</p>

          <button onclick="choose(${i})">This Video</button>
        </div>
      </div>
      `
      urlArray.push(url)
    }

    console.log(htmlCode)

    div.innerHTML = htmlCode
  })

  socket.on('downloaded', () => {
    div.innerHTML = `<h2>The video has finished downloading!</h2>
    <p>To watch it, press play below. If you want another video, press the button below that specifies it.</p>
    <video controls>
      <source src="/static/videos/${localStorage.getItem('userId')}.mp4" type="video/mp4">
    </video>
    <br>
    <br>
    <button onclick="window.location.reload()">Search Again!</button>`
  })