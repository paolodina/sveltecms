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
export declare type CmsWidgetNumberProps = typeof __propDef.props;
export declare type CmsWidgetNumberEvents = typeof __propDef.events;
export declare type CmsWidgetNumberSlots = typeof __propDef.slots;
export default class CmsWidgetNumber extends SvelteComponentTyped<CmsWidgetNumberProps, CmsWidgetNumberEvents, CmsWidgetNumberSlots> {
}
export {};
