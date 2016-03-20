//get a reference to the original document and also make a copy to work with
var oDoc = app.activeDocument;
var docRef = app.activeDocument.duplicate();

//this creates the popup for the destination folder
var outputFolder = Folder.selectDialog("Where to save these layers?")

//collection of the squares of 2 which i called RootTwos for some reason
var RootTwos = new Array(2, 4, 8, 18, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384);

var currentImageNumber = 0;

//store the original preferences
var oru = app.preferences.rulerUnits;
var otu = app.preferences.typeUnits;

//Main() is called at the bottom of the script
var Main = function () {
    //set the preferences to use PIXELS so the image is sized in pixels
    app.preferences.rulerUnits = Units.PIXELS;
    app.preferences.typeUnits = TypeUnits.PIXELS;
    if (documents.length == 0) {
        alert("No Open Document");
    } else {
        for (var i = 0; i < docRef.layers.length; i++) {
            if (docRef.layers[i].typename == "LayerSet") {
                IterateThroughLayers(docRef.layers[i], docRef.layers[i].name)
            }
            if (docRef.layers[i].typename == "ArtLayer") {
                ExportLayer(docRef.layers[i], "top");
            }
        }

    }
    //close out the copy document
    docRef.close(SaveOptions.DONOTSAVECHANGES);
    //reset the application preferences back to what the user had
    app.preferences.rulerUnits = oru;
    app.preferences.typeUnits = otu;
};

var IterateThroughLayers = function (lsets, folderName) {
    for (var i = 0; i < lsets.artLayers.length; i++) {
        //check to make sure the layer isn't empty. if it is, all of its bounds will be 0
        var emptyCheck = 0;
        for (var k = 0; k < 4; k++) {
            emptyCheck += lsets.artLayers[i].bounds[k];
        }
        if (emptyCheck == 0) {
            continue;
        }
        ExportLayer(lsets.artLayers[i], folderName);
    }
    for (var j = 0; j < lsets.layerSets.length; j++) {
        IterateThroughLayers(lsets.layerSets[j], folderName + "_" + lsets.layerSets[j].name);
    }
};

var ExportLayer = function (l, foldername) {
    //need to copy the layer before switching to a different document
    l.copy();
    var imageSize = BestSize(l);
    var tempDoc = app.documents.add(imageSize, imageSize, 72, l.name, NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
    var pngSaveOpt = new PNGSaveOptions();

    //creat the file to save into. used the folder names, the layer name and then added a currentImageNumber to make sure that duplicate names don't save over each other
    var fileName = new File(outputFolder + "/" + foldername + "_" + l.name + "_" + currentImageNumber + ".png");
    tempDoc.paste();
    tempDoc.saveAs(fileName, pngSaveOpt, true, Extension.LOWERCASE);
    tempDoc.close(SaveOptions.DONOTSAVECHANGES);
    currentImageNumber++;
};

//find out which of the Squares our layer will fit in
var BestSize = function (layer) {
    //subtract the bounds to get the width and height of the layer
    var width = layer.bounds[2] - layer.bounds[0];
    var height = layer.bounds[3] - layer.bounds[1];
    var b;
    //we only need the biggest value since all of the layers will be exported as squares.
    if (width > height) {
        b = width;
    } else {
        b = height;
    }
    for (var i = 0; i < RootTwos.length; i++) {
        if (b <= RootTwos[i]) {
            return RootTwos[i];
        }
    }
    //cute little message for carter if a layer gets too big
    alert("Layer Size Larger Than 16384, which is crazy, Carter >:(");
};

Main();