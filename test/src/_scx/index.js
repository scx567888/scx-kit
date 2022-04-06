import {ScxApiHelper, ScxEventBus, ScxFSS, ScxReq} from "../../../scx-kit.js";

const scxApiHelper = new ScxApiHelper("http://127.0.0.1:8080");

const scxEventBus = new ScxEventBus(scxApiHelper);

const scxReq = new ScxReq(scxApiHelper);

const scxFSS = new ScxFSS(scxReq);

export {
    scxApiHelper,
    scxEventBus,
    scxReq,
    scxFSS
}