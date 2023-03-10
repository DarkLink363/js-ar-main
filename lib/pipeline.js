"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pipeline = void 0;
const zappar_1 = require("./zappar");
const event_1 = require("./event");
/**
 * Pipelines manage the flow of data coming in (i.e. the camera frames) through to the output from the different tracking types and computer vision algorithms.
 * @see https://docs.zap.works/universal-ar/javascript/pipelines-and-camera-processing/
 */
class Pipeline {
    /**
     * Constructs a new Pipeline.
    */
    constructor() {
        /**
         * Emitted when the frame is updated.
        */
        this.onFrameUpdate = new event_1.Event();
        /**
         * @ignore
        */
        this._onFrameUpdateInternal = new event_1.Event();
        this._lastFrameNumber = -1;
        this._z = zappar_1.z();
        this._impl = this._z.pipeline_create();
    }
    /**
     * Destroys the pipeline.
     */
    destroy() {
        this._z.pipeline_destroy(this._impl);
    }
    /**
     * Updates the pipeline and trackers to expose tracking data from the most recently processed camera frame.
     */
    frameUpdate() {
        this._z.pipeline_frame_update(this._impl);
        const frameNumber = this._z.pipeline_frame_number(this._impl);
        if (frameNumber !== this._lastFrameNumber) {
            this._lastFrameNumber = frameNumber;
            this._onFrameUpdateInternal.emit();
            this.onFrameUpdate.emit();
        }
    }
    /**
     * @ignore
    */
    _getImpl() {
        return this._impl;
    }
    /**
     * Sets the WebGL context used for the processing and upload of camera textures.
     * @param gl - The WebGL context.
    */
    glContextSet(gl) {
        this._z.pipeline_gl_context_set(this._impl, gl);
    }
    /**
     * Informs the pipeline that the GL context is lost and should not be used.
    */
    glContextLost() {
        this._z.pipeline_gl_context_lost(this._impl);
    }
    /**
     * Returns the most recent camera frame texture.
    */
    cameraFrameTextureGL() {
        return this._z.pipeline_camera_frame_texture_gl(this._impl);
    }
    /**
     * Returns a matrix that you can use to transform the UV coordinates of the following full-screen quad in order to render the camera texture:
     *
     * Vertex 0: `-1, -1, 0`
     *
     * UV 0: `0, 0`
     *
     * Vertex 1: `-1, 1, 0`
     *
     * UV 1: `0, 1`
     *
     * Vertex 2: `1, -1, 0`
     *
     * UV 1: `1, 0`
     *
     * Vertex 3: `1, 1, 0`
     *
     * UV 1: `1, 1`
     *
     * @param renderWidth - The width of the canvas.
     * @param renderHeight - The height of the canvas.
     * @param mirror - Pass `true` to mirror the camera image in the X-axis.
     * @returns A 4x4 column-major transformation matrix.
    */
    cameraFrameTextureMatrix(renderWidth, renderHeight, mirror) {
        return this._z.pipeline_camera_frame_texture_matrix(this._impl, renderWidth, renderHeight, mirror === true);
    }
    /**
    * Draw the camera to the screen as a full screen quad.
    *
    * Please note this function modifies some GL state during its operation so you may need to reset the following GL state if you use it:
    * - The currently bound texture 2D is set to `null` (e.g. `gl.bindTexture(gl.TEXTURE_2D, null)`)
    * - The currently bound array buffer is set to `null` (e.g. `gl.bindBuffer(gl.ARRAY_BUFFER, null);`)
    * - The currently bound program is set to `null` (e.g. `gl.useProgram(null)`)
    * - The currently active texture is set to `gl.TEXTURE0` (e.g. `gl.activeTexture(gl.TEXTURE0)`)
    * - These features are disabled: `gl.SCISSOR_TEST`, `gl.DEPTH_TEST`, `gl.BLEND`, `gl.CULL_FACE`
    * @param renderWidth - The width of the canvas.
    * @param renderHeight - The height of the canvas.
    * @param mirror - Pass `true` to mirror the camera image in the X-axis.
   */
    cameraFrameDrawGL(renderWidth, renderHeight, mirror) {
        this._z.pipeline_camera_frame_draw_gl(this._impl, renderWidth, renderHeight, mirror);
    }
    /**
     * Uploads the current camera frame to a WebGL texture.
    */
    cameraFrameUploadGL() {
        this._z.pipeline_camera_frame_upload_gl(this._impl);
    }
    /**
     * Prepares camera frames for processing.
     *
     * Call this function on your pipeline once an animation frame (e.g. during your `requestAnimationFrame` function) in order to process incoming camera frames.
     *
     * Please note this function modifies some GL state during its operation so you may need to reset the following GL state if you use it:
     * - The currently bound framebuffer is set to `null` (e.g. `gl.bindFramebuffer(gl.FRAMEBUFFER, null)`)
     * - The currently bound texture 2D is set to `null` (e.g. `gl.bindTexture(gl.TEXTURE_2D, null)`)
     * - The currently bound array buffer is set to `null` (e.g. `gl.bindBuffer(gl.ARRAY_BUFFER, null);`)
     * - The currently bound element array buffer is set to `null` (e.g. `gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)`)
     * - The currently bound program is set to `null` (e.g. `gl.useProgram(null)`)
     * - The currently active texture is set to `gl.TEXTURE0` (e.g. `gl.activeTexture(gl.TEXTURE0)`)
     * - These features are disabled: `gl.SCISSOR_TEST`, `gl.DEPTH_TEST`, `gl.BLEND`, `gl.CULL_FACE`
     * - The pixel store flip-Y mode is disabled (e.g. `gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)`)
     * - The viewport is changed (e.g. `gl.viewport(...)`)
     * - The clear color is changed (e.g. `gl.clearColor(...)`)
    */
    processGL() {
        this._z.pipeline_process_gl(this._impl);
    }
    /**
     * Returns the camera model (i.e. the intrinsic camera parameters) for the current frame.
    */
    cameraModel() {
        return this._z.pipeline_camera_model(this._impl);
    }
    /**
     * Returns a transformation where the camera sits, stationary, at the origin of world space, and points down the negative Z axis.
     *
     * In this mode, tracked anchors move in world space as the user moves the device or tracked objects in the real world.
     *
     * @returns A 4x4 column-major transformation matrix
    */
    cameraPoseDefault() {
        return this._z.pipeline_camera_pose_default(this._impl);
    }
    /**
     * Returns a transformation where the camera sits at the origin of world space, but rotates as the user rotates the physical device.
     *
     * When the Zappar library initializes, the negative Z axis of world space points forward in front of the user.
     *
     * In this mode, tracked anchors move in world space as the user moves the device or tracked objects in the real world.
     *
     * @param mirror -  Pass `true` to mirror the location in the X-axis.
     * @returns A 4x4 column-major transformation matrix
    */
    cameraPoseWithAttitude(mirror) {
        return this._z.pipeline_camera_pose_with_attitude(this._impl, mirror || false);
    }
    /**
     * Returns a transformation with the (camera-relative) origin specified by the supplied parameter.
     *
     * This is used with the `poseCameraRelative(...) : Float32Array` functions provided by the various anchor types to allow a given anchor (e.g. a tracked image or face) to be the origin of world space.
     *
     * In this case the camera moves and rotates in world space around the anchor at the origin.
     *
     * @param o - The origin matrix.
     * @returns A 4x4 column-major transformation matrix
    */
    cameraPoseWithOrigin(o) {
        return this._z.pipeline_camera_pose_with_origin(this._impl, o);
    }
    /**
      * Returns true if the current camera frame came from a user-facing camera
     */
    cameraFrameUserFacing() {
        return this._z.pipeline_camera_frame_user_facing(this._impl);
    }
    /**
      * @ignore
     */
    drawFace(projectionMatrix, cameraMatrix, targetMatrix, m) {
        this._z.pipeline_draw_face(this._impl, projectionMatrix, cameraMatrix, targetMatrix, m._getImpl());
    }
    /**
      * Returns the number of the current frame.
     */
    frameNumber() {
        return this._z.pipeline_frame_number(this._impl);
    }
    /**
     * Start recording camera and motion data into memory. This data can then used with SequenceSource to replay the sequence.
     *
     * @param expectedFrames - The number of camera frames you expect to capture. If supplied, memory will be pre-allocated to improve performance
     */
    sequenceRecordStart(expectedFrames) {
        if (expectedFrames === undefined)
            expectedFrames = 30 * 5; // 5 second default
        this._z.pipeline_sequence_record_start(this._impl, expectedFrames);
    }
    /**
     * Stop recording camera and motion data.
     */
    sequenceRecordStop() {
        this._z.pipeline_sequence_record_stop(this._impl);
    }
    /**
     * Remove any camera and motion data currently stored in memory.
     */
    sequenceRecordClear() {
        this._z.pipeline_sequence_record_clear(this._impl);
    }
    /**
     * Get the data captured by sequence recording.
     *
     * @returns A Uint8Array of packed camera and motion data
     */
    sequenceRecordData() {
        return this._z.pipeline_sequence_record_data(this._impl);
    }
}
exports.Pipeline = Pipeline;
