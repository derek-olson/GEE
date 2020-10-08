// Function to add USGS 1/3 arc second topography and derive slope, aspect,
// and hillshade
function getTopography(){
  // Import NED elevation data
  var elevation = ee.Image('USGS/NED');
  // Calculate slope and aspect
  var topo = ee.Algorithms.Terrain(elevation);
  
  //get % slope
  var slopeDeg = topo.select(1).int16();
  var slopeRads = slopeDeg.multiply(Math.PI).divide(ee.Number(180));
  var slopeTan = slopeRads.tan();
  var slopePCT = slopeTan.multiply(ee.Number(100)).rename('slopePCT');
  
  // Add 8-direction aspect
  var aspect = topo.select('aspect');
  var aspectRad = aspect.multiply(Math.PI).divide(180);
  var aspectSin = aspectRad.sin();
  aspectSin = aspectSin.multiply(10000).int16()
  var aspectCos = aspectRad.cos();
  aspectCos = aspectCos.multiply(10000).int16()
  var aspect_8 = (aspect.multiply(8).divide(360)).add(1).floor().uint8().rename('aspect_8');
  // Add 3 equally-spaced sun azimuth hillshades
  var hill_1 = ee.Terrain.hillshade(elevation,30).rename('hill_1');
  var hill_2 = ee.Terrain.hillshade(elevation,150).rename('hill_2');
  var hill_3 = ee.Terrain.hillshade(elevation,270).rename('hill_3');
  // Add topography bands to image
  topo = topo.select('elevation','slope')
    .addBands(slopePCT).addBands(aspectSin).addBands(aspectCos)
    .addBands(aspect_8).addBands(hill_1).addBands(hill_2).addBands(hill_3);
  topo = topo.int16();
  topo = topo.resample('bicubic');
  return topo;
}
exports.getTopography = getTopography; 