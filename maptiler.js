console.log("starting maptiler");

var gm = require('gm');
var fs = require('fs');
var request = require('request');
var download = require('download');

var dir = process.cwd() + "/output";
var tempdir = process.cwd() + "/temp";
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}
if (!fs.existsSync(tempdir)) {
    fs.mkdirSync(tempdir);
}

/**
 * args:
 * xlo: x to start from
 * xhi: x to finish at
 * ylo: y to start from
 * yhi: y to finish at
 * z: zoom level (default 19);
 * d: debug
 */

var debug = false;
var args = process.argv;
var rp = {
    xlo: 0,
    xhi: 0,
    ylo: 0,
    yhi: 0,
    z: 19
}

for (i = 2; i < args.length; i++) {
    if (args[i] == "-?" || args[i] == "--help") { //help
        //help
        console.log("help not implemented yet");
    } else if (args[i] == "-xlo") {
        rp.xlo = args[i+1];
        i++;
    } else if (args[i] == "-xhi") {
        rp.xhi = args[i+1];
        i++;
    } else if (args[i] == "-ylo") {
        rp.ylo = args[i+1];
        i++;
    } else if (args[i] == "-yhi") {
        rp.yhi = args[i+1];
        i++;
    } else if (args[i] == "-z") {
        rp.z = args[i+1];
        i++;
    } else if (args[i] == "-d") {
        debug = true;
    } else {
        console.error("error parsing argument at position " + i + ": " . args[i]);
    }
}

if (debug) {
    console.log(rp);
}

// wipe temp folder
var deleteFolderRecursive = function(path) {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach(function(file, index){
        var curPath = path + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
}
deleteFolderRecursive(tempdir);
fs.mkdirSync(tempdir);

// url
function url (x, y, z) {
    return "https://khms1.google.com/kh/v=742?x=" + x + "&y=" + y + "&z=" + z;
}

var tilemap_matrix_async_running = 0;

//fetch tiles
var tilemap_matrix = {};
for (xi = rp.xlo; xi <= rp.xhi; xi++) {
    tilemap_matrix[xi] = {};
    for (yi = rp.ylo; yi <= rp.yhi; yi++) {
        tilemap_matrix[xi][yi] = {url: url(xi,yi,rp.z), path: null, done: false}
    }
}

//fetch tiles
for (xi = rp.xlo; xi <= rp.xhi; xi++) {
    fs.mkdirSync(tempdir + "/" + xi);
    for (yi = rp.ylo; yi <= rp.yhi; yi++) {
        console.log(xi + "," + yi);
        var run = true;
        var path = tempdir + "/" + xi + "/" + yi + ".jpg"
        console.log("do");
        download(tilemap_matrix[xi][yi].url).then(data => {
            console.log("starting");
            fs.writeFileSync(path, data);
            tilemap_matrix[xi][yi].path = path;
            tilemap_matrix[xi][yi].done = true;
            run = false;
            console.log("falsed");
        });
        while (run){
            // blocking
        }
        console.log("done");
    }
}

// fetch tiles
/*var tilemap_matrix = {};
for (xi = runtime_params.xlo; xi <= runtime_params.xhi; xi++) {
    tilemap_matrix[xi] = {};
    fs.mkdirSync(tempdir + "/" + xi);
    for (yi = runtime_params.ylo; yi <= runtime_params.yhi; yi++) {
        tilemap_matrix_async_running++;
        request(url(xi,yi,runtime_params.z), {encoding: 'binary'}, function(error, response, body) {
            if (error) {
                console.error('error: ' + error);
            }
            //fs.writeFile(tempdir + "/" + xi + "/" + yi + ".jpg", body, 'binary', function(err) {console.log(error);});
            fs.writeFile(tempdir + "/" + xi + "/" + yi + ".jpg", body, 'binary', function(err) {
                if (err) {
                    console.log("error@ x: " + xi + " y: " + yi + " " + err);
                }
                tilemap_matrix_async_running--;
            });
        });
        /*request(url(xi,yi,runtime_params.z),null,function(){
            tilemap_matrix_async_running--;
        }).pipe(fs.createWriteStream(tempdir + '/' + xi + '/' + yi + ".jpg"));     */  /* 
        tilemap_matrix[xi][yi] = tempdir + '/' + xi + '/' + yi + ".jpg";
    }
}
console.log(tilemap_matrix);
while (tilemap_matrix_async_running != 0 && debug) {
    console.log(tilemap_matrix_async_running);
}

if (debug) {
    console.log("done");
}*/