/**
 * Layout Components
 *
 * Reusable layout components for consistent screen structure.
 */

export { Screen, SCREEN_STYLES } from './Screen';
export { Header, HeaderAction, HeaderTextAction } from './Header';
export { TabBar, getTabColor, TAB_BAR_STYLES } from './TabBar';
export {
  PageHeader,
  getVariantBackground as getPageHeaderVariantBackground,
  getVariantTitleColor as getPageHeaderTitleColor,
  PAGE_HEADER_STYLES,
  BACK_BUTTON_STYLES,
} from './PageHeader';
export type { PageHeaderVariant } from './PageHeader';
