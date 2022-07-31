import { SvelteComponentTyped } from "svelte";
import type { DisplayableEntity, EntityType, FieldableEntity } from "sveltecms";
import type SvelteCMS from "sveltecms";
import type { Content } from "sveltecms/core/ContentStore";
declare const __propDef: {
    props: {
        cms: SvelteCMS;
        entity?: EntityType & FieldableEntity & DisplayableEntity;
        item: Content;
        displayMode: string;
        class?: string;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type ContentItemProps = typeof __propDef.props;
export declare type ContentItemEvents = typeof __propDef.events;
export declare type ContentItemSlots = typeof __propDef.slots;
export default class ContentItem extends SvelteComponentTyped<ContentItemProps, ContentItemEvents, ContentItemSlots> {
}
export {};
