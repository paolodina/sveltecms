import Image from "sveltecms/display/field/Image.svelte";
import File from "sveltecms/display/field/File.svelte";
import Fieldgroup from "sveltecms/display/field/Fieldgroup.svelte";
import Reference from "sveltecms/display/field/Reference.svelte";
export const templateDisplay = {
    id: 'display',
    label: 'Display',
    labelPlural: 'Displays',
    description: 'A Display configuration determines how SvelteCMS will display a field by default.',
    typeField: true,
    configFields: {
        type: {
            type: 'text',
            default: '',
            helptext: 'An HTML element (p, li, etc.) or include path for a SvelteCMS Component to use when displaying the field.',
        },
        wrapper: {
            type: 'text',
            default: '',
            helptext: 'An HTML element (div, ul, etc.) or include path for a SvelteCMS Component to use as a wrapper for the displayed field.',
        },
        html: {
            type: 'boolean',
            default: false,
            helptext: `Whether to treat the field value as pre-sanitized HTML. ` +
                `NOTE! Unless the user input for the field is sanitized with ` +
                `an appropriate and properly configured preMount Transformer, ` +
                `using this feature is a critical security vulnerability.`
        },
        link: {
            type: 'boolean',
            default: false,
            helptext: `Whether to display the field value as a link to its parent Content.`
        },
    }
};
export class Display {
    constructor(conf, cms) {
        this.type = '';
        this.isDisplayed = false;
        this.link = false;
        if (!conf)
            return;
        conf = typeof conf === 'string' ? { type: conf } : conf;
        if (!conf.type || ['none', 'hidden'].includes(conf.type))
            return;
        this.isDisplayed = true;
        this.type = conf.type.trim();
        this.component = cms.getEntity('component', this.type);
        this.link = conf.link ? true : false;
        if (!this.component) {
            this.html = conf?.html;
            let el, classes, tag, id;
            [el, ...classes] = this.type.split('.');
            this.classes = classes;
            [tag, id] = el.split('#');
            this.tag = tag;
            this.id = id;
        }
        if (conf.wrapper)
            this.wrapper = new Display(conf.wrapper, cms);
    }
    get classList() { return this.classes.join(' '); }
}
export const displayComponents = [
    { id: 'sveltecms/display/field/Image', component: Image, admin: true },
    { id: 'sveltecms/display/field/File', component: File, admin: true },
    { id: 'sveltecms/display/field/Fieldgroup', component: Fieldgroup, admin: true },
    { id: 'sveltecms/display/field/Reference', component: Reference, admin: true },
];
export default Display;
