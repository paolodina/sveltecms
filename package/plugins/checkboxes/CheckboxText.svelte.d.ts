import { SvelteComponentTyped } from "svelte";
import type { WidgetField } from 'sveltecms';
declare const __propDef: {
    props: {
        field: WidgetField;
        id: string;
        value?: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type CheckboxTextProps = typeof __propDef.props;
export declare type CheckboxTextEvents = typeof __propDef.events;
export declare type CheckboxTextSlots = typeof __propDef.slots;
export default class CheckboxText extends SvelteComponentTyped<CheckboxTextProps, CheckboxTextEvents, CheckboxTextSlots> {
}
export {};
