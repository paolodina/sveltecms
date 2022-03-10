import { SvelteComponentTyped } from "svelte";
import type { CMSWidgetField } from "..";
declare const __propDef: {
    props: {
        field: CMSWidgetField;
        id: string;
        value?: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export declare type CmsWidgetTextProps = typeof __propDef.props;
export declare type CmsWidgetTextEvents = typeof __propDef.events;
export declare type CmsWidgetTextSlots = typeof __propDef.slots;
export default class CmsWidgetText extends SvelteComponentTyped<CmsWidgetTextProps, CmsWidgetTextEvents, CmsWidgetTextSlots> {
}
export {};
