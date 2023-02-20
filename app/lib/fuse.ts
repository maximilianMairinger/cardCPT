import { wrap } from "comlink"
import Fuse from "./fuse.worker";

export default wrap<typeof Fuse>(new Worker(new URL("./fuse.worker", import.meta.url)))

