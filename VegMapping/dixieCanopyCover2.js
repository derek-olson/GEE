/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var cc_points = ee.FeatureCollection("users/thinkbetween/Dixie_CC_RefPoints"),
    harmonics = ee.Image("users/thinkbetween/Dixie_Harmonics"),
    composite = ee.Image("users/thinkbetween/Dixie_Composite");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
//  get the classification library
var classificationLib = require('users/USFS_GTAC/modules:classificationLib.js')

// get predictor rasters as multi-band image
var predictors = composite.addBands(harmonics);

// get reference data
var referenceData = cc_points;

// choose whether to use 'points' or 'polygons'.
//If the referece data are points than the classification will result in a raster output.
// If the referece data are points than the classification reqires the polygons to be split into training and
//apply datasets. The result will be classified polygons. Computations will time out with too many polygons. 
var referenceDataType = 'points';

// get column name of reference field as a string
var responseField = 'FinalCall';

// choose the polygons to apply classifier to if the reference data type is polygons otherwise choose null
var applyPolygons = null;

// choose classifier 
var classifier = ee.Classifier.randomForest;

// choose classifier parameters
var classifierParameters = {};

// choose classifier output mode: CLASSIFICATION, REGRESSION, PROBABILITY
var mode = 'REGRESSION'

// choose projection
var projection = 'EPSG:26912';

// choose resolution
var scale = 30;

// polygon reducers
var reducers = ee.Reducer.mean().combine({
  reducer2: ee.Reducer.stdDev(),
  sharedInputs: true
});

var out = classificationLib.classificationWrapper(predictors, referenceData, referenceDataType, responseField, classifier, classifierParameters, mode, reducers, projection, null, scale);
print('out', out);
//Export.table.toDrive({collection: out[1], description: 'Dixie_CC',fileFormat: 'KML'});
var cc = out[1];
cc = cc.clip(composite.geometry());
Map.addLayer(cc, {min:0, max:78}, 'out'); 
 