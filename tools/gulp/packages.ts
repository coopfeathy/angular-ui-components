import {BuildPackage} from '../package-tools';

export const cdkPackage = new BuildPackage('cdk');
export const materialPackage = new BuildPackage('material', [cdkPackage]);
export const youTubePlayerPackage = new BuildPackage('youtube-player');
export const googleMapsPackage = new BuildPackage('google-maps');
export const cdkExperimentalPackage = new BuildPackage('cdk-experimental', [cdkPackage]);
export const materialExperimentalPackage = new BuildPackage('material-experimental',
    [cdkPackage, cdkExperimentalPackage, materialPackage]);
export const momentAdapterPackage = new BuildPackage('material-moment-adapter', [materialPackage]);
export const luxonAdapterPackage = new BuildPackage('material-luxon-adapter', [materialPackage]);
export const dateFnsAdapterPackage =
    new BuildPackage('material-date-fns-adapter', [materialPackage]);
