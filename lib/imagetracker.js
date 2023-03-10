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
exports.ImageTargetPreview = exports.ImageTarget = exports.ImageTracker = void 0;
const event_1 = require("./event");
const zappar_1 = require("./zappar");
/**
 * Attaches content to a known image as it moves around in the camera view.
 * @see https://docs.zap.works/universal-ar/javascript/image-tracking/
 */
class ImageTracker {
    /**
     * Constructs a new ImageTracker
     * @param _pipeline - The pipeline that this tracker will operate within.
     * @param targetFile - The .zpt target file from the source image you'd like to track.
     * @see https://docs.zap.works/universal-ar/zapworks-cli/
    */
    constructor(_pipeline, targetFile) {
        this._pipeline = _pipeline;
        /**
        * Emitted when an anchor becomes visible in a camera frame.
        */
        this.onVisible = new event_1.Event1();
        /**
        * Emitted when an anchor goes from being visible in the previous camera frame, to not being visible in the current frame.
        */
        this.onNotVisible = new event_1.Event1();
        /**
        * Emitted when a new anchor is created by the tracker.
        */
        this.onNewAnchor = new event_1.Event1();
        /**
        * The set of currently visible anchors.
        */
        this.visible = new Set();
        /**
        * A map of the available image anchors by their respective IDs.
        */
        this.anchors = new Map();
        this._visibleLastFrame = new Set();
        this._frameUpdate = () => {
            const newAnchors = new Set();
            // Swap the visible and visibleLastFrame so we can avoid a set allocation
            const swap = this.visible;
            this.visible = this._visibleLastFrame;
            this._visibleLastFrame = swap;
            this.visible.clear();
            const num = this._z.image_tracker_anchor_count(this._impl);
            for (let i = 0; i < num; i++) {
                const id = this._z.image_tracker_anchor_id(this._impl, i);
                let anchor = this.anchors.get(id);
                let isNew = false; // TODO: declared but never used?
                if (!anchor) {
                    anchor = {
                        onVisible: new event_1.Event(),
                        onNotVisible: new event_1.Event(),
                        id: id,
                        poseCameraRelative: mirror => this._z.image_tracker_anchor_pose_camera_relative(this._impl, i, mirror === true),
                        pose: (cameraPose, mirror) => this._z.image_tracker_anchor_pose(this._impl, i, cameraPose, mirror === true),
                        visible: true
                    };
                    isNew = true;
                    this.anchors.set(id, anchor);
                    newAnchors.add(anchor);
                }
                anchor.visible = true;
                this.visible.add(anchor);
            }
            // Events
            for (const anchor of newAnchors)
                this.onNewAnchor.emit(anchor);
            for (const anchor of this.visible) {
                if (!this._visibleLastFrame.has(anchor)) {
                    this.onVisible.emit(anchor);
                    anchor.onVisible.emit();
                }
                else {
                    this._visibleLastFrame.delete(anchor);
                }
            }
            for (const anchor of this._visibleLastFrame) {
                this.onNotVisible.emit(anchor);
                anchor.onNotVisible.emit();
            }
        };
        this._pipeline._onFrameUpdateInternal.bind(this._frameUpdate);
        this._z = zappar_1.z();
        this._impl = this._z.image_tracker_create(this._pipeline._getImpl());
        if (targetFile)
            this.loadTarget(targetFile);
    }
    /**
     * Destroys the image tracker.
     */
    destroy() {
        this._pipeline._onFrameUpdateInternal.unbind(this._frameUpdate);
        this.anchors.clear();
        this.visible.clear();
        this._z.image_tracker_destroy(this._impl);
    }
    /**
     * Loads a target file.
     * @param src - A URL to, or an ArrayBuffer of, the target file from the source image you'd like to track.
     * @see https://docs.zap.works/universal-ar/zapworks-cli/
     * @returns A promise that's resolved once the file is downloaded. It may still take a few frames for the tracker to fully initialize and detect images.
    */
    loadTarget(src) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof src === "string") {
                src = yield (yield fetch(src)).arrayBuffer();
            }
            this._targets = undefined;
            this._z.image_tracker_target_load_from_memory(this._impl, src);
        });
    }
    /**
     * Gets/sets the enabled state of the image tracker.
     * Disable when not in use to save computational resources during frame processing.
     */
    get enabled() {
        return this._z.image_tracker_enabled(this._impl);
    }
    set enabled(e) {
        this._z.image_tracker_enabled_set(this._impl, e);
    }
    /**
     * An array of information for each of the target images loaded by this tracker.
     */
    get targets() {
        if (!this._targets) {
            this._targets = [];
            const count = this._z.image_tracker_target_count(this._impl);
            for (let i = 0; i < count; i++) {
                this._targets.push(new ImageTarget(this._z, this._impl, i));
            }
        }
        return this._targets;
    }
}
exports.ImageTracker = ImageTracker;
/**
 * A target image embedded with a target file.
 */
class ImageTarget {
    constructor(_z, _impl, _indx) {
        this._z = _z;
        this._impl = _impl;
        this._indx = _indx;
        this.physicalScaleFactor = this._z.image_tracker_target_physical_scale_factor(this._impl, this._indx);
        if (this.physicalScaleFactor < 0)
            this.physicalScaleFactor = undefined;
        this.topRadius = this._z.image_tracker_target_radius_top(this._impl, this._indx);
        if (this.topRadius < 0)
            this.topRadius = undefined;
        this.bottomRadius = this._z.image_tracker_target_radius_bottom(this._impl, this._indx);
        if (this.bottomRadius < 0)
            this.bottomRadius = undefined;
        this.sideLength = this._z.image_tracker_target_side_length(this._impl, this._indx);
        if (this.sideLength < 0)
            this.sideLength = undefined;
    }
    /**
     * An <img> element containing the embedded preview image, or `undefined` if the target file does not contain one.
     */
    get image() {
        if (this._image === undefined) {
            this._image = this._z.image_tracker_target_image(this._impl, this._indx) || null;
        }
        return this._image || undefined;
    }
    /**
     * An object containing a mesh that represents this image target.
     */
    get preview() {
        if (this._preview === undefined) {
            this._preview = new ImageTargetPreview(this._z, this._impl, this._indx);
        }
        return this._preview;
    }
}
exports.ImageTarget = ImageTarget;
/**
 * Stores a mesh that represents an image target.
 */
class ImageTargetPreview {
    constructor(_z, _impl, _indx) {
        this._z = _z;
        this._impl = _impl;
        this._indx = _indx;
        this.vertices = this._z.image_tracker_target_preview_mesh_vertices(this._impl, this._indx);
        this.indices = this._z.image_tracker_target_preview_mesh_indices(this._impl, this._indx);
        this.uvs = this._z.image_tracker_target_preview_mesh_uvs(this._impl, this._indx);
    }
}
exports.ImageTargetPreview = ImageTargetPreview;
