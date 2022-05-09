import type { CMSPluginBuilder } from 'sveltecms'
import type { ConfigFieldConfigSetting } from 'sveltecms/core/Field'
import type { MediaStoreType } from 'sveltecms/core/MediaStore'
import { initializeApp } from 'firebase/app'
import { getStorage, connectStorageEmulator, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { merge } from 'lodash-es'

type PluginOptions = {
  firebaseConfig: {
    apiKey:string
    authDomain:string
    projectId:string
    storageBucket:string
    messagingSenderId:string
    appId:string
  },
  useEmulators: boolean,
}

const defaultOptions = {
  firebaseConfig: {
    apiKey:"",
    authDomain:"",
    projectId:"",
    storageBucket:"",
    messagingSenderId:"",
    appId:"",
  },
  path: "",
  useEmulators: false,
}


const storageBuilder:CMSPluginBuilder = (options:PluginOptions):{mediaStores:MediaStoreType[]} => {

  const opts = merge({}, defaultOptions, options)

  const optionFields:{[key:string]:ConfigFieldConfigSetting} = {
    path: {
      type: 'text',
      default: opts?.path ?? "",
      tooltip: 'The path, within your storage bucket, at which to save or retrieve content.',
    },
    firebaseConfig: {
      type: "collection",
      default: {},
      tooltip: 'The Firebase configuration as provided on the "Project settings" page of your Firebase project at https://console.firebase.google.com.',
      fields: {
        apiKey: {
          type: "text",
          default: opts?.firebaseConfig?.apiKey ?? "",
          tooltip: 'The API key for your firebase project. Compared to most API keys, '+
          'Firebase API keys do not have the same security implications, and do not need to be kept secret. However, '+
          'in some cases it will be necessary to take other security measures for the integrity of your project.'+
          'See https://firebase.google.com/docs/projects/api-keys.',
        },
        authDomain: {
          type: "text",
          default: opts?.firebaseConfig?.authDomain ?? "",
          tooltip: 'The authDomain for your Firebase app.',
        },
        projectId: {
          type: "text",
          default: opts?.firebaseConfig?.projectId ?? "",
          tooltip: 'The projectID for your Firebase app.',
        },
        storageBucket: {
          type: "text",
          default: opts?.firebaseConfig?.storageBucket ?? "",
          tooltip: 'The storageBucket for your Firebase app.',
        },
        messagingSenderId: {
          type: "text",
          default: opts?.firebaseConfig?.messagingSenderId ?? "",
          tooltip: 'The messagingSenderID for your Firebase app.',
        },
        appId: {
          type: "text",
          default: opts?.firebaseConfig?.appId ?? "",
          tooltip: 'The appId for your Firebase app.',
        },
      }
    },
  }

  function getFirebaseStorage() {
    const app = initializeApp(opts.firebaseConfig)
    const storage = getStorage(app)
    if (opts.useEmulators) { // We use only the global useEmulators here. This should not be accessible per field/contentType.
      console.log('firebaseStorage: using emulators')
      connectStorageEmulator(storage, 'localhost', 9199)
    }
    return storage
  }

  return {
    mediaStores: [
      {
        id: 'firebaseStorage',
        immediateUpload: true,
        async getMedia(filename, opts):Promise<string> {
          const storage = getFirebaseStorage()
          const fileRef = ref(storage, `${opts.path ?? this.opts.path ?? ''}/${filename}`.replace(/\/+/g,'/'))
          return getDownloadURL(fileRef)
        },
        async saveMedia(file, opts):Promise<string> {
          const storage = getFirebaseStorage()
          const fileRef = ref(storage, `${opts.path ?? this.opts.path ?? ''}/${file.name}`.replace(/\/+/g,'/'))
          const snap = await uploadBytes(fileRef, file)
          return getDownloadURL(fileRef)
        },
        optionFields,
      }
    ],
  }

}

export default storageBuilder