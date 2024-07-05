import {Configuration} from "../../build/generated-ts/api";

const restConfig = new Configuration({
    basePath: import.meta.env.VITE_APP_CONFIG_BACKEND_URL || ''
});

console.log(restConfig)
