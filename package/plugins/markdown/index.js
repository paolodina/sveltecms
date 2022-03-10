// import CMSWidgetMarkdown from './CMSWidgetMarkdown.svelte'
import MarkdownIT from 'markdown-it';
let md;
const pluginBuilder = (config) => {
    config = Object.assign({}, {
        commonmark: true,
    }, config);
    if (config.md)
        md = config.md;
    else {
        md = new MarkdownIT(config.commonmark ? 'commonmark' : 'default');
    }
    const plugin = {
        transformers: [
            {
                id: 'markdown',
                fn: (value) => {
                    return md.render(value);
                },
            }
        ],
        fieldTypes: [
            {
                id: 'markdown',
                defaultValue: '',
                defaultWidget: 'textarea',
                defaultPreMount: ['markdown']
            },
        ],
    };
    return plugin;
};
export default pluginBuilder;
