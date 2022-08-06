import type { default as SvelteCMS, CMSPlugin, CMSPluginBuilder } from 'sveltecms';
import type { ConfigFieldConfigSetting } from 'sveltecms/core/Field';
import type { MKDirOptions, PromisifiedFS } from '@isomorphic-git/lightning-fs'
import { isBrowser, isWebWorker, isJsDom } from 'browser-or-node'
import bytes from 'bytes'
import { cloneDeep, get } from 'lodash-es';
import { dirname } from 'sveltecms/utils/path';
import Fuse from 'fuse.js';
import { findReferenceIndex } from 'sveltecms/utils';
const fs = {}

function extname(path:string) { return path.replace(/^.+\//, '').replace(/^[^\.].*\./,'').replace(/^\..+/, '') }
function getBasedir() { return (isBrowser || isWebWorker) ? '' : import.meta.url.replace(/\/(?:node_modules|src)\/.+/, '').replace(/^file:\/\/\//, '/') }
export async function getFs(databaseName):Promise<PromisifiedFS> {
  if (fs[databaseName]) return fs[databaseName]
  if (isBrowser || isWebWorker) {
    const {default:FS} = await import('@isomorphic-git/lightning-fs')
    let _fs = new FS(databaseName)
    fs[databaseName] = _fs.promises
  }
  else {
    if (isJsDom) console.warn('Use of jsdom is untested and unsupported by SvelteCMS')
    const { promises } = await import('fs')
    // @ts-ignore: todo: how to get the type for fs/promises
    fs[databaseName] = promises
  }
  return fs[databaseName]
}

export const databaseNameField:ConfigFieldConfigSetting = {
  type: 'text',
  default: '',
  helptext: 'The name used for saving files in-browser. This is required if you are using the browser-based filesystem. ' +
    'It should be globally unique and generally should be the same across one site or app; your site url might be a good choice. ' +
    'At the moment, if you are using something like isomorphic-git, you must import content into the browser filesystem yourself.',
}

export type staticFilesContentOptions = {
  contentDirectory: string,
  prependContentTypeIdAs: ""|"directory"|"filename",
  fileExtension: "md"|"json"|"yml"|"yaml",
  markdownBodyField: string,
}

export const staticFilesContentOptionFields:{[key:string]:ConfigFieldConfigSetting} = {
  contentDirectory: {
    type: 'text',
    default: 'content',
    helptext: 'The directory for local content files relative to the project root.',
  },
  prependContentTypeIdAs: {
    type: 'text',
    widget: {
      type: 'select',
      options: {
        items: {
          '': 'None',
          'directory': 'Directory',
          'filename': 'Filename prefix'
        },
      },
    },
    default: 'directory',
    helptext: 'Include the content type id as part of the path',
  },
  fileExtension: {
    type: 'text',
    default: 'md',
    required: true,
    widget: {
      type: 'select',
      options: {
        items: {
          'md': '.md (Markdown)',
          'json': '.json (JSON)',
          'yml': '.yml (YAML)',
          'yaml': '.yaml (YAML)',
        }
      }
    },
    helptext: 'What type of file to use for new content; must be one of "md", "json", "yml", or "yaml"',
  },
  markdownBodyField: {
    type: 'text',
    default: 'body',
    helptext: 'Which field should be used as the body of the Markdown file',
  },
}

export type staticFilesMediaOptions = {
  staticDirectory:string,
  mediaDirectory:string,
  allowMediaTypes:string,
  maxUploadSize:string,
}

export const staticFilesMediaOptionFields:{[key:string]:ConfigFieldConfigSetting} = {
  staticDirectory: {
    type: 'text',
    default: 'static',
    helptext: 'The directory for static files relative to the project root. For SvelteKit projects this is "static" by default.'
  },
  mediaDirectory: {
    type: 'text',
    default: '',
    helptext: 'The directory for media files relative to the static directory.',
  },
  allowMediaTypes: {
    type: 'text',
    multiple: true,
    default: ['image/*'],
    widget: 'multiselect',
    helptext: 'A comma-separated list of unique file type specifiers, e.g. "image/jpeg" or ".jpg".',
  },
  maxUploadSize: {
    type: 'text',
    default: "",
    helptext: 'The maximum file size allowed for media uploads, e.g. "10MB". Empty or 0 for unlimited.'
  },
}

export async function parseFileStoreContentItem(_filepath, content, opts) {
  let ext = extname(_filepath)
  if (ext === 'json') return { ...JSON.parse(content) }
  else {
    const yaml = await import('js-yaml')
    if (ext === 'yml' || ext === 'yaml') return { ...yaml.load(content) }
    else if (ext === 'md') {
      let sections = content.split(/^---[\r\n]+/gm)
      if (sections.length > 2 && sections.shift() === '') {
        let data
        try {
          data = yaml.load(sections.shift())
        }
        catch (e) {} // The yaml would not load.
        if (data) return { ...data, [opts.markdownBodyField]: sections[0] }
        else return { [opts.markdownBodyField]: content }
      }
    }
    else throw new Error('Extension for file stores must be md, json, yml or yaml.')
  }
}

export function getSlugFromFilepath(filepath:string, contentTypeID:string, opts:staticFilesContentOptions):string {
  let slug = filepath.replace(/.+\//, '').replace(/\.[^\.]*$/, '')
  if (opts.prependContentTypeIdAs === 'filename' && slug.indexOf(contentTypeID) === 0) slug = slug.slice(contentTypeID.length)
  return slug
}

const plugin:CMSPlugin = {
  id: 'staticFiles',
  contentStores: [
    {
      id: 'staticFiles',
      optionFields: { databaseName:databaseNameField, ...staticFilesContentOptionFields },
      listContent: async (contentType, opts:staticFilesContentOptions & { full?:boolean, glob?:string }) => {
        const fs = await getFs('opts.databaseName')
        let glob = opts.glob ? `${getBasedir()}/${opts.glob}` :
          `${getBasedir()}/${opts.contentDirectory}/` + // base dir
          `${opts.prependContentTypeIdAs ?          // content type, as directory or prefix
            contentType.id + ( opts.prependContentTypeIdAs === 'directory' ? '/' : '_') : ''}` +
          `*.${opts.fileExtension}`   // file extensions
        glob = glob.replace(/\/+/g, '/')
        const {default:fg} = await import('fast-glob')
        const items = await fg(glob)

        if (!opts.full) return items.map(filepath => {
          return {
            _slug: getSlugFromFilepath(filepath, contentType.id, opts)
          }
        })
        let files = await Promise.all(items.map(async f => {
          let item = await fs.readFile(f, { encoding: 'utf8' })
          return parseFileStoreContentItem(f, item, opts)
        }))
        return files
      },

      getContent: async (contentType, opts:staticFilesContentOptions & { glob?:string, slug?:string }, slug = '') => {

        slug = slug || opts.slug || '*'

        const fs = await getFs('opts.databaseName')
        let glob = opts.glob ? `${getBasedir()}/${opts.glob}` :
          `${getBasedir()}/${opts.contentDirectory}/` + // base dir
          `${opts.prependContentTypeIdAs ?          // content type, as directory or prefix
            contentType.id + ( opts.prependContentTypeIdAs === 'directory' ? '/' : '_') : ''}` +
          `${slug}.${opts.fileExtension}`   // file extensions
        glob = glob.replace(/\/+/g, '/')
        const {default:fg} = await import('fast-glob')
        const items = await fg(glob)
        const files = items.map(async f => {
          let item = await fs.readFile(f, { encoding: 'utf8' })
          return parseFileStoreContentItem(f, item, opts)
        })
        await Promise.all(files)
        return files.length === 1 ? files[0] : files
      },

      saveContent: async (content, contentType, opts:staticFilesContentOptions & { filepath?:string, slug?:string }) => {

        let slug = opts.slug ?? content._slug ?? content.slug
        if (!slug && !opts.filepath) throw new Error(`Content to be saved must have a slug or a provided filepath: ${contentType.label}\n - opts.slug: ${opts.slug}\n - content._slug: ${content._slug}\n - content.slug: ${content.slug}`)

        const fs = await getFs('opts.databaseName')

        const base = `${getBasedir()}/${opts.contentDirectory}/`
        let filepath = opts.filepath ? `${getBasedir()}/${opts.filepath}` :
          `${getBasedir()}/${opts.contentDirectory}/` + // base dir
          `${opts.prependContentTypeIdAs ?          // content type, as directory or prefix
            contentType.id + ( opts.prependContentTypeIdAs === 'directory' ? '/' : '_') : ''}` +
          `${slug}.${opts.fileExtension}`   // file extensions

        let body = ''
        let saveContent:any = cloneDeep(content)
        switch (opts.fileExtension) {
          case "json":
            saveContent = JSON.stringify(saveContent, null, 2)
            break;
          case "md":
            body = saveContent[opts.markdownBodyField] || ''
            delete(saveContent[opts.markdownBodyField])
          case "yml":
          case "yaml":
            let yaml = await import('js-yaml')
            saveContent = yaml.dump(saveContent).trim()
            if (opts.fileExtension === 'md') saveContent = `---\n${saveContent}\n---\n${body}`
            break;
          default:
            throw new Error('Extension for file stores must be md, json, yml or yaml.')
        }

        try {
          await mkdirp(fs, dirname(filepath))
          await fs.writeFile(filepath, saveContent.replace(/\r\n/g, '\n'))
          return content
        }
        catch (e) {
          e.message = `Error writing ${filepath}:\n${e.message}`
          throw e
        }

      },

      deleteContent: async (content, contentType, opts:staticFilesContentOptions & { filepath?:string, slug?:string }) => {

        let slug = opts.slug ?? content._slug ?? content.slug
        if (!slug && !opts.filepath) throw new Error(`Content to be deleted must have a slug or a provided filepath: ${contentType.label}`)

        const fs = await getFs('opts.databaseName')

        let filepath = opts.filepath ? `${getBasedir()}/${opts.filepath}` :
          `${getBasedir()}/${opts.contentDirectory}/` + // base dir
          `${opts.prependContentTypeIdAs ?          // content type, as directory or prefix
            contentType.id + ( opts.prependContentTypeIdAs === 'directory' ? '/' : '_') : ''}` +
          `${slug}.${opts.fileExtension}`   // file extensions

        try {
          await fs.unlink(filepath)
          return content
        }
        catch (e) {
          e.message = `Error deleting ${filepath}:\n${e.message}`
          throw e
        }

      },

    }
  ],
  indexers: [
    {
      id: 'staticFiles',
      optionFields: {
        databaseName: databaseNameField,
        contentDirectory: {
          type: 'text',
          default: 'content',
          helptext: 'The directory for local content files relative to the project root.',
        },
      },
      getIndex: async function(id) {
        const fs = await getFs(this?.options?.databaseName)
        const filepath = `${getBasedir()}/${this?.options?.contentDirectory || 'content'}/_${id}.index.json`

        let index = []
        try {
          // @ts-ignore This should be absolutely a string
          index = JSON.parse(await fs.readFile(filepath, 'utf8'))
        }
        catch(e) {
          try {
            let contentTypeID = filepath.replace(/.+\/_/, '').replace(/\..+/, '')
            let fetchedIndex = await fetch(`/${contentTypeID}/__data.json`).then(async res => { return (await res.json())?.content ?? [] })
            index = fetchedIndex
          }
          catch(e) {
            console.warn(e.message)
            // just continue with empty index
          }
        }
        return index
      },
      updateIndex: async function(id, changes) {
        let index = await this.getIndex(id)
        changes.forEach(change => {
          // get the index of the item
          let i = findReferenceIndex(change.before, index)
          // For deleted items
          if (!change.after) {
            if (i !== -1) index.splice(i,1)
          }
          // For changed items
          else if (i !== -1) {
            index.splice(i,1,change.after)
          }
          // For added items
          else {
            index.unshift(change.after)
          }
        })
        await this.saveIndex(id, index)
      },
      saveIndex: async function(id, index) {
        const fs = await getFs(this?.options?.databaseName)
        const filepath = `${getBasedir()}/${this?.options?.contentDirectory || 'content'}/_${id}.index.json`

        try {
          return fs.writeFile(filepath, '[\n' + index.map(item => JSON.stringify(item)).join(',\n') + '\n]')
        }
        catch(e) {
          if (e.code === 'ENOENT') {
            try {
              await mkdirp(fs, dirname(filepath))
              return fs.writeFile(filepath, '[\n' + index.map(item => JSON.stringify(item)).join(',\n') + '\n]')
            }
            catch(e) {
              e.message = `Indexer staticFiles could not save index: ${filepath}\n` + e.message
              throw e
            }
          }
        }

      },
      searchIndex: async function(id, search, options) {
        if (!this?._indexes) this._indexes = {}
        if (!this._indexes[id]) {
          let index = await this.getIndex(id)
          this._indexes[id] = new Fuse(index, options)
        }
        let index = await this._indexes[id]
        if (!search) return index._docs
        return index.search(search, { includeScore:true }).map(res => ({...res.item, _score:res?.score }))
      },
      saveContent: async function (contentType, content) {
        let id = contentType?.['id'] ?? contentType
        let index = await this.getIndex(id)
        content = Array.isArray(content) ? content : [content]

        content.forEach(item => {

          let i = index.findIndex(indexedItem => item._slug === indexedItem._slug)
          if (i > -1) index[i] = item
          else index.unshift(item)

          // If the slug has changed, remove the index entry for the old slug
          if (item._oldSlug && (item._oldSlug !== item._slug)) {
            i = index.findIndex(item => item._slug === item._oldSlug)
            if (i > -1) index.splice(i, 1)
          }
        })

        // Unset the cached search index for this content type
        if (this?._indexes?.[id]) this._indexes[id] = undefined

        return this.saveIndex(id, index)
      },
      deleteContent: async function (contentType, content) {
        let id = contentType?.['id'] ?? contentType
        let index = await this.getIndex(id)
        content = Array.isArray(content) ? content : [content]

        content.forEach(item => {
          // Find the exact item in the index
          let slug = item._oldSlug ?? item._slug
          let i = index.findIndex(item => item._slug === slug)

          // If the item is not in the index, just return
          if (i === -1) return

          // Remove the item from the index
          index.splice(i, 1)
        })

        // Unset the cached search index for this content type
        if (this?._indexes?.[id]) this._indexes[id] = undefined

        return this.saveIndex(id, index)
      },
      searchContent: async function (contentType, search, options = {}) {
        let keys = [...(contentType?.['indexFields'] || []), '_slug']
        return this.searchIndex(contentType?.['id'] ?? contentType, search, { keys, ...options })
      },
      saveMedia: async function (allMedia) {
        let index = await this.getIndex('_media')
        allMedia = Array.isArray(allMedia) ? allMedia : [allMedia]

        allMedia.forEach(media => {
          let item = { src: media.src };
          (this.mediaKeys || []).forEach(k => { item[k] = media[k] })
          let i = index.findIndex(item => item.src === media.src)
          if (i > -1) index[i] = item
          else index.unshift(item)
        })

        if (this?._indexes?._media) this._indexes._media = undefined
        return this.saveIndex('_media', index)
      },
      deleteMedia: async function (allMedia) {
        let index = await this.getIndex('_media')
        allMedia = Array.isArray(allMedia) ? allMedia : [allMedia]

        allMedia.forEach(media => {
          let i = index.findIndex(item => item.src === media.src)
          if (i === -1) return
          index.splice(i, 1)
        })

        if (this?._indexes?._media) this._indexes._media = undefined
        return this.saveIndex('_media', index)
      },
      searchMedia: async function (search, options = {}) {
        return this.searchIndex('_media', search, { keys: this.mediaKeys, ...options })
      },
    }
  ],
  mediaStores: [
    {
      id: 'staticFiles',
      optionFields: { databaseName:databaseNameField, ...staticFilesMediaOptionFields },
      saveMedia: async (file, opts:staticFilesMediaOptions) => {

        // Check media for validity
        let mediaTypes = opts.allowMediaTypes.split(/\s*,\s*/)
        if (
          !mediaTypes.includes(file.type) && // exact type
          !mediaTypes.includes(file.type.replace(/\/.+/, '/*')) && // wildcard type
          !mediaTypes.includes(file.name.replace(/^.+\./, '.')) // file extension
        ) throw new Error(`${file.name} is not among the allowed media types (${mediaTypes.join(', ')}).`)

        let maxUploadSize = bytes.parse(opts.maxUploadSize)
        if (maxUploadSize && file.size > maxUploadSize) throw new Error(`${file.name} exceeds maximum upload size of ${opts.maxUploadSize}`)

        // Get file system
        const fs = await getFs('opts.databaseName')
        const filepath = `${getBasedir()}/${opts.staticDirectory}/${opts.mediaDirectory}/${file.name}`.replace(/\/+/g,'/')

        // TODO: determine what to do if files exist
        let fileStats
        try {
          fileStats = await fs.stat(filepath)
        }
        catch(e) {
          if (e.code === 'ENOENT') fileStats = false
        }

        try {
          await mkdirp(fs, dirname(filepath))
          const buffer = await file.arrayBuffer()
          const uint8 = new Uint8Array(buffer)
          await fs.writeFile(filepath, uint8)
          return `/${opts.mediaDirectory}/${file.name}`
        }
        catch(e) {
          throw e
        }

      },
      deleteMedia: async (file, opts:staticFilesMediaOptions) => {
        const fs = await getFs('opts.databaseName')
        throw new Error('Deleting local media is not yet implemented')
        return ''
      },
    }
  ],
  adminPages: [
    {
      id: 'components',
      component: 'CMSComponentList',
      GET: async() => {
        // @ts-ignore TODO: remove sveltekit/vite-specific code
        let files = await import.meta.glob(`$lib/**/*.svelte`)
        return Object.keys(files)
      },
      POST: async({cms, event}) => {
        let values = await event.request.json()
        let saveComponents = Object.keys(values)
          .filter(k => values[k])
          .filter(f => f.match(/^[a-zA-Z0-9_\/]+$/)) // no filenames with ".", and no saving files above $lib

        let imports = [], components = []
        saveComponents.forEach(f => {
          f = f.replace(/^\/+/,'');
          let id = f.replace(/\W/g,'_')
          imports.push(`import ${id} from "$lib/${f}.svelte";`)
          components.push(`{ id:'${id}', component:${id} }`)
        })

        let output = `// This file is auto-generated by SvelteCMS at /admin/components.\n`+
          `${imports.join('\n')}\n\n`+
          `export const components = [\n`+
          `  ${components.join(',\n  ')}\n`+
          `]\n\n`+
          `export default components;`

        let fs = await getFs('opts.databaseName')
        let filepath = `${getBasedir()}/${cms.conf.configPath}.components.ts`
        await fs.writeFile(filepath, output)

        // @ts-ignore TODO: remove sveltekit/vite-specific code
        return Object.keys(await import.meta.glob(`$lib/**/*.svelte`))
      }
    },
  ]
}

/**
 * taken from https://github.com/isaacs/node-mkdirp
 * @param path
 * @param fs a filesystem adapter, either node's fs or a lightning-fs
 * @returns
 */
export async function mkdirp(fs:PromisifiedFS, path:string, opts?:MKDirOptions, made?:boolean) {
  const parent = dirname(path)
  if (parent === path) {
    return fs.mkdir(path).catch(er => {
      // swallowed by recursive implementation on posix systems
      // any other error is a failure
      if (er.code !== 'EISDIR')
        throw er
    })
  }

  return fs.mkdir(path).then(() => made || path, er => {
    if (er.code === 'ENOENT')
      return mkdirp(fs, parent, opts)
        .then(made => mkdirp(fs, path, opts, made))
    if (er.code !== 'EEXIST' && er.code !== 'EROFS')
      throw er
    return fs.stat(path).then(st => {
      if (st.isDirectory())
        return made
      else
        throw er
    }, () => { throw er })
  })
}

export default plugin