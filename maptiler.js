console.log("starting maptiler");

var gm = require('gm');
var fs = require('fs');
var request = require('request');

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
var runtime_params = {
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
        runtime_params.xlo = args[i+1];
        i++;
    } else if (args[i] == "-xhi") {
        runtime_params.xhi = args[i+1];
        i++;
    } else if (args[i] == "-ylo") {
        runtime_params.ylo = args[i+1];
        i++;
    } else if (args[i] == "-yhi") {
        runtime_params.yhi = args[i+1];
        i++;
    } else if (args[i] == "-z") {
        runtime_params.z = args[i+1];
        i++;
    } else if (args[i] == "-d") {
        debug = true;
    } else {
        console.error("error parsing argument at position " + i + ": " . args[i]);
    }
}

if (debug) {
    console.log(runtime_params);
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
      fs.mkdirSync(path);
    }
}
deleteFolderRecursive(tempdir);

// url
function url (x, y, z) {
    return "https://khms1.google.com/kh/v=742?x=" + x + "&y=" + y + "&z=" + z;
}

var tilemap_matrix_async_running = 0;

// fetch tiles
var tilemap_matrix = {};
for (xi = runtime_params.xlo; xi <= runtime_params.xhi; xi++) {
    tilemap_matrix[xi] = {};
    fs.mkdirSync(tempdir + "/" + xi);
    for (yi = runtime_params.ylo; yi <= runtime_params.yhi; yi++) {
        tilemap_matrix_async_running++;
        request(url(xi,yi,runtime_params.z), {encoding: binary}, function(error, response, body) {
            //fs.writeFile(tempdir + "/" + xi + "/" + yi + ".jpg", body, 'binary', function(err) {console.log(error);});
            fs.writeFile(tempdir + "/" + xi + "/" + yi + ".jpg", body, 'binary', function(err) {
                if (err) {
                    console.log("error@ x: " + xi + " y: " + yi + " " + err);
                }
                tilemap_matrix_async_running--;
            });
        });
        tilemap_matrix[xi][yi] = null;
    }
}
console.log(tilemap_matrix);