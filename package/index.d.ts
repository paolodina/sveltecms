import { AdminPage, type AdminPageConfig } from './core/AdminPage';
import { Field, type FieldType, type FieldConfigSetting, type ConfigFieldConfigSetting } from './core/Field';
import { type WidgetType, type WidgetConfigSetting } from './core/Widget';
import { ContentType, type ContentTypeConfigSetting } from "./core/ContentType";
import { type MediaStoreType, type MediaStoreConfigSetting } from './core/MediaStore';
import { type Content, type ContentStoreConfigSetting, type ContentStoreType, type Value } from './core/ContentStore';
import { type FieldgroupConfigSetting, type AdminFieldgroupConfigSetting, Fieldgroup } from './core/Fieldgroup';
import { type Transformer, type TransformerConfigSetting } from './core/Transformer';
import { type ScriptFunctionType, type ScriptFunctionConfig, type ScriptVars } from './core/ScriptFunction';
import { type ComponentType, type ComponentConfigSetting, type Component } from './core/Component';
import { type EntityDisplayConfigSetting, type DisplayConfigSetting, type FullEntityDisplayConfig } from './core/Display';
import type { EntityTemplate } from './core/EntityTemplate';
import SlugConfig from './core/Slug';
import { Indexer, type IndexerConfigSetting, type IndexerType, type IndexItem } from './core/Indexer';
import { type CMSHookFunctions } from './core/Hook';
import { type CMSPlugin, type CMSPluginBuilder } from './core/Plugin';
export { CMSPlugin, CMSPluginBuilder };
export declare const FieldPropsAllowFunctions: string[];
export declare const cmsConfigurables: string[];
export type Entity = {
    _parent?: Entity;
};
export type TypedEntity = Entity & {
    id: string;
    type: string;
};
export type TypedEntityConfigSetting = {
    id?: string;
    type: string;
};
export type ConfigurableEntity = Entity & {
    options?: ConfigSetting;
};
export type ConfigurableEntityConfigSetting = TypedEntityConfigSetting & {
    options?: ConfigSetting;
};
export type ConfigurableEntityConfigSettingValue<T> = string | T | (string | T)[];
export type LabeledEntity = Entity & {
    label: string | ScriptFunctionConfig;
};
export type FieldableEntityType = {
    isFieldable?: boolean;
    fields?: {
        [id: string]: FieldConfigSetting;
    };
};
export type FieldableEntity = Entity & {
    isFieldable: boolean;
    fields?: {
        [id: string]: Field;
    };
};
export type FieldableEntityConfigSetting = {
    fields: {
        [id: string]: string | FieldConfigSetting;
    };
};
export type DisplayableEntity = Entity & {
    displays: EntityDisplayConfigSetting;
    displayComponent?: Component;
};
export type DisplayableEntityType = EntityType & {
    displays?: EntityDisplayConfigSetting;
    displayComponent?: string;
};
export type DisplayableEntityConfigSetting = {
    displays?: EntityDisplayConfigSetting;
};
export type EntityType = {
    id: string;
};
export type ConfigurableEntityType = EntityType & {
    optionFields?: {
        [key: string]: ConfigFieldConfigSetting;
    };
    options?: ConfigSetting;
};
type CMSSettings = ConfigSetting & {
    adminStore?: string | ContentStoreConfigSetting;
    indexer?: string | IndexerConfigSetting;
    rootContentType?: string;
    frontPageSlug?: string;
};
export type CMSConfigSetting = {
    configPath?: string;
    settings?: CMSSettings;
    displays?: {
        [entityTypeID: string]: {
            [displayMode: string]: DisplayConfigSetting;
        };
    };
    adminStore?: string | ContentStoreConfigSetting;
    contentTypes?: {
        [key: string]: ContentTypeConfigSetting;
    };
    lists?: {
        [key: string]: string | (string | number | {
            id: string | number;
            value: ConfigSetting;
        })[];
    };
    contentStores?: {
        [key: string]: ContentStoreConfigSetting;
    };
    mediaStores?: {
        [key: string]: MediaStoreConfigSetting;
    };
    fields?: {
        [key: string]: FieldConfigSetting;
    };
    widgets?: {
        [key: string]: WidgetConfigSetting;
    };
    fieldgroups?: {
        [key: string]: FieldgroupConfigSetting;
    };
    transformers?: {
        [key: string]: TransformerConfigSetting;
    };
    components?: {
        [key: string]: ComponentConfigSetting;
    };
    plugins?: {
        [key: string]: ConfigSetting;
    };
};
export default class SvelteCMS {
    conf: CMSConfigSetting;
    defaultConf: CMSConfigSetting;
    entityTypes: {
        adminPage: EntityTemplate;
        component: EntityTemplate;
        contentStore: EntityTemplate;
        contentType: EntityTemplate;
        display: EntityTemplate;
        field: EntityTemplate;
        fieldgroup: EntityTemplate;
        hook: EntityTemplate;
        indexer: EntityTemplate;
        mediaStore: EntityTemplate;
        plugin: EntityTemplate;
        scriptFunction: EntityTemplate;
        slug: EntityTemplate;
        transformer: EntityTemplate;
        widget: EntityTemplate;
    };
    admin: ContentType;
    indexer: Indexer;
    adminPages?: {
        [key: string]: AdminPageConfig;
    };
    adminFieldgroups?: {
        [key: string]: AdminFieldgroupConfigSetting;
    };
    displays: {
        [entityTypeID: string]: FullEntityDisplayConfig;
    };
    fields: {
        [key: string]: FieldConfigSetting;
    };
    fieldgroups: {
        [key: string]: FieldgroupConfigSetting;
    };
    components: {
        [key: string]: ComponentType;
    };
    widgets: {
        [key: string]: WidgetConfigSetting;
    };
    scriptFunctions: {
        [key: string]: ScriptFunctionType;
    };
    fieldTypes: {
        [key: string]: FieldType & {
            widgetTypes?: string[];
        };
    };
    widgetTypes: {
        [key: string]: WidgetType;
    };
    transformers: {
        [key: string]: Transformer;
    };
    contentStores: {
        [key: string]: ContentStoreType;
    };
    mediaStores: {
        [key: string]: MediaStoreType;
    };
    indexers: {
        [key: string]: IndexerType;
    };
    contentTypes: {
        [key: string]: ContentType;
    };
    defaultContentType: ContentType;
    lists: CMSListConfig;
    plugins: {
        [key: string]: CMSPlugin;
    };
    hooks: CMSHookFunctions;
    constructor(conf: CMSConfigSetting, plugins?: CMSPlugin[]);
    use(plugin: CMSPlugin, config?: any): void;
    preMount(fieldableEntity: ContentType | Field | Fieldgroup, values: Content): Content;
    preSave(fieldableEntity: ContentType | Field | Fieldgroup, values: Content): Content;
    doFieldTransforms(op: 'preSave' | 'preMount', field: Field, value: any): any;
    listEntities(type: string, includeAdmin?: boolean, entityID?: string): string[];
    getEntityType(type: string): EntityTemplate;
    getEntity(type: string, id: string): any;
    getEntityParent(type: string, id: string): any;
    getEntityRoot(type: string, id: string): any;
    getFieldTypes(includeAdmin?: boolean): string[];
    getFieldTypeWidgets(includeAdmin?: boolean, fieldTypeID?: string): string[];
    getContentType(contentType: string): ContentType;
    getContentStore(contentType: string | ContentType): import("./core/ContentStore").ContentStore;
    getUrl(item: Content, contentTypeID?: string): string;
    slugifyContent(content: Content | Content[], contentType: ContentType, force?: boolean): Content | Content[];
    getSlug(content: any, slug: SlugConfig, force: boolean): any;
    listContent(contentTypes: string | ContentType | Array<string | ContentType>, options?: string | {
        skipIndex?: boolean;
        getRaw?: boolean;
        searchText?: string | undefined;
        [key: string]: any;
    }): Promise<Content[]>;
    /**
     * Gets an individual piece of content or all content of a content type
     * @param contentType string
     * The id of the content type
     * @param slug string
     * The text slug for an individual piece of content
     * @param options object
     * @returns object
     */
    getContent(contentType: string | ContentType, slug: string | number | null, options?: {
        [key: string]: any;
    }): Promise<Content>;
    saveContent(contentType: string | ContentType, content: Content | Content[], options?: {
        skipHooks?: boolean;
        skipIndex?: boolean;
        [key: string]: any;
    }): Promise<Content | Content[]>;
    deleteContent(contentType: string | ContentType, content: Content | Content[], options?: {
        skipHooks?: boolean;
        skipIndex?: boolean;
        [key: string]: any;
    }): Promise<Content | Content[]>;
    newContent(contentTypeID: string, values?: {
        [id: string]: Value;
    }): Content;
    getIndexItem(content?: Content): IndexItem | undefined;
    runHook(type: string, ...args: any[]): Promise<void>;
    transform(value: any, conf: ConfigurableEntityConfigSettingValue<TransformerConfigSetting>): any;
    getConfigOptionValue(value: any): any;
    getConfigOptionsFromFields(optionFields: {
        [id: string]: ConfigFieldConfigSetting;
    }): ConfigSetting;
    mergeConfigOptions(options1: ConfigSetting, ...optionsAll: Array<string | ConfigSetting>): ConfigSetting;
    getWidgetFields(fieldgroup: FieldableEntity, vars: Omit<ScriptVars, 'cms' | 'id' | 'field'> & {
        field?: Field;
    }): WidgetFieldFieldgroup;
    findFields(fields: {
        [id: string]: Field;
    }, query: {
        [path: string]: string | number | boolean;
    } | ((item: Field) => boolean), prefix?: string): string[];
    initializeContentField(field: Field, vars: Omit<ScriptVars, 'field'>): void;
    /**
     * Converts an object property (e.g. on a Field or an options object) into a getter which runs
     * one of the available functions.
     * @param obj The object on which the property is to be defined
     * @param prop The name of the property
     * @param vars The vars object for the defined function
     */
    initializeFunction(obj: {
        [key: string]: any;
    }, prop: string, vars: ScriptVars): void;
    initializeConfigOptions(options: any, vars: ScriptVars): void;
    getAdminPage(path: string): AdminPage;
    getInstanceOptions(entityType: ConfigurableEntityType, conf?: string | ConfigurableEntityConfigSetting): ConfigSetting;
    /**
     * Recursive helper function to get the descendant configuration from an entity object
     * @param entity An Entity object
     * @param options A list of options to retreive from the entity
     * @returns
     */
    _getEntityConfig(entity: any, options: string[]): ConfigSetting;
    /**
     * Get the full config setting for a particular entity
     * @param type The Entity Type, e.g. 'field'
     * @param id The ID of the particular entity to get
     * @param parentOnly If true, the config for the current entity will be ignored
     * @returns ConfigSetting
     */
    getEntityConfig(type: string, id: string, parentOnly?: boolean): ConfigSetting;
    /**
     * Get the list of configuration fields for a specific object
     * @param type The Entity Type, e.g. 'field'
     * @param id The ID of a specific entity
     * @returns An object whose values are ConfigFieldConfigSettings
     */
    getEntityConfigFields(type: string, id?: string): {
        [id: string]: ConfigFieldConfigSetting;
    };
    /**
     * Get the full Fieldgroup object for configuring an entity.
     * @param type The Entity Type
     * @param id The Entity ID (needed for option fields)
     * @returns Fieldgroup
     */
    getEntityConfigFieldgroup(type: string, id?: string): Fieldgroup;
    get defaultMediaStore(): string;
    _scriptFunctionHelp: any;
    get scriptFunctionHelp(): Array<{
        id: string;
        helptext?: string;
        params: Array<{
            id: string;
            multiple: boolean;
            helptext: string;
        }>;
    }>;
    /**
     * @TODO: allow adding displayModes, either with config or plugins
     */
    get displayModes(): string[];
    /**
     *
     * @param entityTypeID The ID of a Displayable Entity Type, e.g. "contentType", "field", or "fieldgroup"
     * @param entity A Displayable Entity, e.g. a ContentType, Field, or Fieldgroup
     * @param displayMode A displayMode, e.g. "default", "page", "teaser", "reference", or a custom displayMode
     * @returns FullEntityDisplayConfig
     */
    getFullEntityDisplayConfig(entityTypeID: string, entity: Entity | DisplayableEntity): FullEntityDisplayConfig;
    /**
     *
     * @param entityTypeID The ID of a Displayable Entity Type, e.g. "contentType", "field", or "fieldgroup"
     * @param entity A Displayable Entity, e.g. a ContentType, Field, or Fieldgroup
     * @param displayMode A displayMode, e.g. "default", "page", "teaser", "reference", or a custom displayMode
     * @returns
     */
    getEntityDisplayConfig(entityTypeID: string, entity: Entity | DisplayableEntity, displayMode: string): DisplayConfigSetting;
}
export type WidgetField = Field & {
    label: string;
    helptext?: string;
    required?: boolean;
    disabled?: boolean;
    hidden?: boolean;
    class: string;
    multiple?: boolean;
    multipleLabel?: boolean;
    multipleMin?: number;
    multipleMax?: number;
};
export type WidgetFieldFieldgroup = {
    fields: {
        [id: string]: WidgetField;
    };
    [key: string]: any;
};
/**
 * Converts e.g. "points[0].title" to "fields.points.fields.title"
 * @param path string
 */
export declare function getConfigPathFromValuePath(path: string): string;
/**
 * All "Setting" types must fit the pattern of ConfigSetting
 */
export type ConfigSetting = {
    [key: string]: string | number | boolean | null | undefined | ConfigSetting | Array<string | number | ConfigSetting>;
};
export type EntityConfigSetting = ConfigSetting & {
    id?: string;
    type?: string;
};
export type CMSListConfig = {
    [key: string]: Array<string | number | {
        id: string | number;
        value: any;
    }>;
};
