try:
  from pytube import YouTube
  import urllib
  from flask import Flask, render_template
  from flask_socketio import SocketIO, emit, join_room
  from youtubesearchpython import VideosSearch
  import os
  from replit import db
except ImportError as e:
	print(f'\033[35mAn error has occured. Something went wrong when importing. \n\t\033[34mError:\033[0m {e}')
	quit()
finally:
  print(f'-'*25)

# initialize the server
app = Flask(__name__)
io = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def display():
  return render_template('index.html')

# first args: the event
@io.on('room', namespace='/web')
def room_join(id):
  join_room(id)

@io.on('login', namespace='/web')
def onLogin(data):
  password = data["password"]
  if password in db.keys():
    name_ = db[password]
    emit('loggedIn', { 'name': name_, 'password': password }, to=data["id"])
  else:
    emit('rong')  

@io.on('search', namespace='/web')
def search(video):
  videos = VideosSearch(video["search"], limit=5).result()

  if not os.path.exists(f"static/images/{video['id']}/"):
    os.makedirs(f"static/images/{video['id']}/")
  
  for i in range(0, len(videos['result'])):
    url = videos['result'][i]['thumbnails'][0]['url']
    urllib.request.urlretrieve(url, f"static/images/{video['id']}/{i}.jpg")
  emit("searchDone", videos, to=video["id"])

@io.on('download', namespace='/web')
def download(info):
  video = YouTube(info["url"])
  video.streams.filter(progressive=False, file_extension='mp4').first().download(output_path='static/videos/', filename=info["userId"] + '.mp4')

  emit("downloaded", to=info["userId"])


if __name__ == "__main__":
  io.run(app=app, host='0.0.0.0', port='8080', debug=False)