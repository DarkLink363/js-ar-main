"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadedPromise = exports.loaded = exports.browserIncompatibleUI = exports.browserIncompatible = exports.drawPlane = exports.projectionMatrixFromCameraModel = exports.invert = exports.cameraDefaultDeviceID = exports.z = exports.setOptions = void 0;
const zappar_cv_1 = require("@zappar/zappar-cv");
const gl_matrix_1 = require("gl-matrix");
const version_1 = require("./version");
let _z;
let _options;
function setOptions(opts) {
    if (_z)
        console.warn("setOptions called after Zappar JS initialization");
    _options = opts;
}
exports.setOptions = setOptions;
/**
 * @ignore
*/
function z() {
    if (!_z) {
        console.log(`Zappar JS v${version_1.VERSION}`);
        _z = zappar_cv_1.initialize(_options);
    }
    return _z;
}
exports.z = z;
/**
 * Gets the ID or the default rear- or user-facing camera.
 * @param userFacing - Whether 'selfie' camera ID should be returned.
 * @returns The camera device ID.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices
*/
function cameraDefaultDeviceID(userFacing) {
    return z().camera_default_device_id(userFacing || false);
}
exports.cameraDefaultDeviceID = cameraDefaultDeviceID;
/**
 * Inverts a 4x4 Float32Array Matrix.
 * @param m - The 4x4 matrix to be inverted.
 * @returns The inverted Float32Array matrix.
*/
function invert(m) {
    const ret = gl_matrix_1.mat4.create();
    gl_matrix_1.mat4.invert(ret, m);
    return ret;
}
exports.invert = invert;
/**
  * Calculates the projection matrix from a given camera model (i.e. intrinsic camera parameters)
  * @param model - The camera model.
  * @param renderWidth - The width of the canvas.
  * @param renderHeight - The height of the canvas.
  * @param zNear - The near clipping plane.
  * @param zFar - The far clipping plane.
  * @returns A 4x4 column-major projection matrix.
 */
function projectionMatrixFromCameraModel(model, renderWidth, renderHeight, zNear = 0.1, zFar = 100) {
    return z().projection_matrix_from_camera_model_ext(model, renderWidth, renderHeight, zNear, zFar);
}
exports.projectionMatrixFromCameraModel = projectionMatrixFromCameraModel;
/**
 * @ignore
*/
function drawPlane(gl, projectionMatrix, cameraMatrix, targetMatrix, texture) {
    z().draw_plane(gl, projectionMatrix, cameraMatrix, targetMatrix, texture);
}
exports.drawPlane = drawPlane;
/**
 * Detects if your page is running in a browser that's not supported
 * @returns 'true' if the browser is incompatible.
*/
function browserIncompatible() {
    return z().browser_incompatible();
}
exports.browserIncompatible = browserIncompatible;
/**
 * Shows a full-page dialog that informs the user they're using an unsupported browser,
 * and provides a button to 'copy' the current page URL so they can 'paste' it into the
 * address bar of a compatible alternative.
*/
function browserIncompatibleUI() {
    z().browser_incompatible_ui();
}
exports.browserIncompatibleUI = browserIncompatibleUI;
/**
 * Check if the Zappar library is fully loaded and ready to process data.
 * Note that you can still use the full API before this function returns true - it's here to help implement loading screens.
 *
 * @returns 'true' if the library is fully loaded.
*/
function loaded() {
    return z().loaded();
}
exports.loaded = loaded;
/**
 * Gets a promise that resolves when the Zappar library is fully loaded and ready to process data.
 * Note that you can still use the full API before this promise is resolved - it's here to help implement loading screens.
 *
 * @returns a promise that resolves when the library is fully loaded.
*/
function loadedPromise() {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            if (loaded())
                return;
            yield delay(50);
        }
    });
}
exports.loadedPromise = loadedPromise;
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
