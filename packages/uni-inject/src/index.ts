import uniInject from "./modules/inject";
import uniAutoPages from "./modules/auto-pages";

export type {
  AutoPagesPluginOptions,
  DefinePageConfig,
  UniPageStyle,
} from "./modules/auto-pages/types";
export type { InjectPluginOptions } from "./modules/inject/types";
export { uniAutoPages, uniInject };
