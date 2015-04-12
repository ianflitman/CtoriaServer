# CtoriaServer
a nodejs server for receiving requests with file list payload, concatenating it via ffmpeg and streaming it back

Ctoria server receives a http request from a browser - in this instance one running the Jane_ng project. 
The payload includes a list of files that is made into a txt file for input into the ffmpeg command:

./ffmpeg -f concat -i /file/path/to/video/seq.txt -c copy output_filename.mp4




