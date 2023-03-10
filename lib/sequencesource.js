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
exports.SequenceSource = void 0;
const zappar_1 = require("./zappar");
/**
 * Plays back a previously recorded sequence of camera and motion data.
 */
class SequenceSource {
    /**
     * Constructs a new SequenceSource.
     * @param _pipeline - The pipeline that this source will operate within.
    */
    constructor(pipeline) {
        this._z = zappar_1.z();
        this._impl = this._z.sequence_source_create(pipeline._getImpl());
    }
    /**
    * Destroys the sequence source.
    */
    destroy() {
        this._z.sequence_source_destroy(this._impl);
    }
    /**
    * Starts the sequence source.
    *
    * Starting a given source pauses any other sources within the same pipeline.
    */
    start() {
        this._z.sequence_source_start(this._impl);
    }
    /**
    * Pauses the sequence source.
    */
    pause() {
        this._z.sequence_source_pause(this._impl);
    }
    /**
     * Loads sequence data.
     * @param src - A URL to, or an ArrayBuffer of, the sequence data you'd like to play back.
     * @returns A promise that's resolved once the data is downloaded.
    */
    load(src) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof src === "string") {
                src = yield (yield fetch(src)).arrayBuffer();
            }
            this._z.sequence_source_load_from_memory(this._impl, src);
        });
    }
    /**
     * Manually set the current time for the sequence.
     * @param t The time in ms, or `undefined` to use the system time.
     */
    setTime(t) {
        this._z.sequence_source_time_set(this._impl, t !== null && t !== void 0 ? t : -1);
    }
}
exports.SequenceSource = SequenceSource;
