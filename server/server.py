__author__ = 'ian'
from subprocess import Popen, call
import mimetypes
import os, re
import json
from flask import Flask, make_response, request, send_file, Response, render_template, session, send_from_directory

# configuration
DEBUG = True
SECRET_KEY = '9ddtd2mz%rr3@z+-nqwh@0jcu7#)0x$8fvblt1515tzl7k5=u!*!'
VIDEO_PATH = '/home/ian/Documents/Jane/mp4/web/'

app = Flask(__name__)
app.config.from_object(__name__)

@app.route('/')
def start_jane():
    return make_response(open('html/index.html').read())

@app.route('/writeMovie', methods=['POST'])
def write_movie():
    data = request.data
    dataDict = json.loads(data)
    f = open('files/concat.txt', 'w')
    for shot in dataDict['playlist']:
        f.write('file\t' + '\'' + VIDEO_PATH + shot + '.mp4' + '\'' + '\n')
    f.close()

    call(['ffmpeg', '-f', 'concat', '-i', 'files/concat.txt', '-c', 'copy', '-y', 'files/output.mp4'])

    return 'gotcha'

@app.after_request
def after_request(response):
    response.headers.add('Accept-Ranges', 'bytes')
    return response

@app.route('/stream')
def stream():
    return send_from_directory('html', 'video.html')
    #return app.send_static_file('/opt/jane_ng/server/html/video.html')

@app.route('/<path:path>')
def send_file_partial(path):
    #path = 'files/' + path
    range_header = request.headers.get('Range', None)
    if not range_header:
        return send_file(path)

    size = os.path.getsize(path)
    byte1, byte2 = 0, None
    m = re.search('(\d+)-(\d*)', range_header)
    g = m.groups()

    if g[0]:
        byte1 = int(g[0])
    if g[1]:
        byte2 = int(g[1])

    length = size - byte1

    if byte2 is not None:
        length = byte2 - byte1

    data = None
    with open(path, 'rb') as f:
        f.seek(byte1)
        data = f.read(length)

    rv = Response(data,
                  206,
                  mimetype=mimetypes.guess_type(path)[0],
                  direct_passthrough=True)

    rv.headers.add('Content-Range', 'bytes {0}-{1}/{2}'.format(byte1, byte1 + length - 1, size))
    return rv


# @app.errorhandler(404)
# def page_not_found(error):
#     return render_template('page_not_found.html'), 404

if __name__ == '__main__':
    app.debug = True
    app.run()