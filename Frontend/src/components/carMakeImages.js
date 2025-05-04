// src/utils/carMakeImages.js
import defaultVehicleImage from "../images/default.png";

// Ford images
import fordMainImage from "../images/cars/ford.png";
import fordBackImage from "../images/cars/ford-back.jpeg";
import fordSideImage from "../images/cars/ford-side.jpeg";
import fordInteriorImage from "../images/cars/ford-interior.jpeg";
import fordFrontImage from "../images/cars/ford-front.jpeg";

// BMW images
import bmwMainImage from "../images/cars/bmw.png";
import bmwBackImage from "../images/cars/bmw-back.jpeg";
import bmwSideImage from "../images/cars/bmw-side.jpeg";
import bmwInteriorImage from "../images/cars/bmw-interior.jpeg";
import bmwFrontImage from "../images/cars/bmw-front.jpeg";

// Nissan images
import nissanMainImage from "../images/cars/nissan.png";
import nissanBackImage from "../images/cars/nissan-back.jpeg";
import nissanSideImage from "../images/cars/nissan-side.jpeg";
import nissanInteriorImage from "../images/cars/nissan-interior.jpeg";
import nissanFrontImage from "../images/cars/nissan-front.jpeg";

// Honda images
import hondaMainImage from "../images/cars/honda.png";
import hondaBackImage from "../images/cars/honda-back.jpeg";
import hondaSideImage from "../images/cars/honda-side.jpeg";
import hondaInteriorImage from "../images/cars/honda-interior.jpeg";
import hondaFrontImage from "../images/cars/honda-front.jpeg";

// Jeep images
import jeepMainImage from "../images/cars/jeep.png";
import jeepBackImage from "../images/cars/jeep-back.jpeg";
import jeepSideImage from "../images/cars/jeep-side.jpeg";
import jeepInteriorImage from "../images/cars/jeep-interior.jpeg";
import jeepFrontImage from "../images/cars/jeep-front.jpeg";

// Jaguar images
import jaguarMainImage from "../images/cars/jaguar.png";
import jaguarBackImage from "../images/cars/jaguar-back.jpeg";
import jaguarSideImage from "../images/cars/jaguar-side.jpeg";
import jaguarInteriorImage from "../images/cars/jaguar-interior.jpeg";
import jaguarFrontImage from "../images/cars/jaguar-front.jpeg";

// GMC images
import gmcMainImage from "../images/cars/gmc.png";
import gmcBackImage from "../images/cars/gmc-back.jpeg";
import gmcSideImage from "../images/cars/gmc-side.jpeg";
import gmcInteriorImage from "../images/cars/gmc-interior.jpeg";
import gmcFrontImage from "../images/cars/gmc-front.jpeg";

// Porsche images
import porscheMainImage from "../images/cars/porsche.png";
import porscheBackImage from "../images/cars/porsche-back.jpeg";
import porscheSideImage from "../images/cars/porsche-side.jpeg";
import porscheInteriorImage from "../images/cars/porsche-interior.jpeg";
import porscheFrontImage from "../images/cars/porsche-front.jpeg";

// Audi images
import audiMainImage from "../images/cars/audi.png";
import audiBackImage from "../images/cars/audi-back.jpeg";
import audiSideImage from "../images/cars/audi-side.jpeg";
import audiInteriorImage from "../images/cars/audi-interior.jpeg";
import audiFrontImage from "../images/cars/audi-front.jpeg";

// Infiniti images
import infinitiMainImage from "../images/cars/infiniti.png";
import infinitiBackImage from "../images/cars/infiniti-back.jpeg";
import infinitiSideImage from "../images/cars/infiniti-side.jpeg";
import infinitiInteriorImage from "../images/cars/infiniti-interior.jpeg";
import infinitiFrontImage from "../images/cars/infiniti-front.jpeg";

// Chevrolet images
import chevroletMainImage from "../images/cars/chevrolet.png";
import chevroletBackImage from "../images/cars/chevrolet-back.jpeg";
import chevroletSideImage from "../images/cars/chevrolet-side.jpeg";
import chevroletInteriorImage from "../images/cars/chevrolet-interior.jpeg";
import chevroletFrontImage from "../images/cars/chevrolet-front.jpeg";

const carMakeImages = {
  ford: { main: fordMainImage, back: fordBackImage, side: fordSideImage, interior: fordInteriorImage, front: fordFrontImage },
  bmw: { main: bmwMainImage, back: bmwBackImage, side: bmwSideImage, interior: bmwInteriorImage, front: bmwFrontImage },
  nissan: { main: nissanMainImage, back: nissanBackImage, side: nissanSideImage, interior: nissanInteriorImage, front: nissanFrontImage },
  honda: { main: hondaMainImage, back: hondaBackImage, side: hondaSideImage, interior: hondaInteriorImage, front: hondaFrontImage },
  jeep: { main: jeepMainImage, back: jeepBackImage, side: jeepSideImage, interior: jeepInteriorImage, front: jeepFrontImage },
  jaguar: { main: jaguarMainImage, back: jaguarBackImage, side: jaguarSideImage, interior: jaguarInteriorImage, front: jaguarFrontImage },
  gmc: { main: gmcMainImage, back: gmcBackImage, side: gmcSideImage, interior: gmcInteriorImage, front: gmcFrontImage },
  porsche: { main: porscheMainImage, back: porscheBackImage, side: porscheSideImage, interior: porscheInteriorImage, front: porscheFrontImage },
  audi: { main: audiMainImage, back: audiBackImage, side: audiSideImage, interior: audiInteriorImage, front: audiFrontImage },
  infiniti: { main: infinitiMainImage, back: infinitiBackImage, side: infinitiSideImage, interior: infinitiInteriorImage, front: infinitiFrontImage },
  chevrolet: { main: chevroletMainImage, back: chevroletBackImage, side: chevroletSideImage, interior: chevroletInteriorImage, front: chevroletFrontImage },
  default: defaultVehicleImage, // Fallback if the car make is not listed
};

export default carMakeImages;
