export {
  siteConfig,
  type SiteConfig,
} from "./site";
export { apiConfig, authConfig, type ApiConfig, type AuthConfig } from "./api";
export { fonts, fontVariables } from "./fonts";
export {
  dashboardNavigation,
  authNavigation,
  routePaths,
  type NavItem,
  type NavItemConfig,
  type NavSection,
  type RoutePaths,
} from "./navigation";
export {
  moduleNavSections,
  getRegisteredModuleIds,
  type ModuleNavItem,
  type ModuleNavSection,
} from "./modules-registry";
export {
  SIDEBAR_MODULES,
  hasModuleAccess,
  can,
  type NavModule,
} from "./permissions";
