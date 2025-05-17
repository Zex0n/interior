declare module 'three/examples/jsm/exporters/GLTFExporter.js' {
  import { Scene } from 'three';

  export class GLTFExporter {
    constructor();
    parse(
      input: Scene | Scene[],
      onDone: (gltf: ArrayBuffer | { [key: string]: any }) => void,
      onError: (error: ErrorEvent) => void,
      options?: any
    ): void;
  }
}

declare module 'three/examples/jsm/loaders/GLTFLoader.js' {
  import { LoadingManager, Group, AnimationClip, Camera } from 'three';

  export interface GLTF {
    scene: Group;
    scenes: Group[];
    animations: AnimationClip[];
    cameras: Camera[];
    asset: any; // Or a more specific type if known
    parser: any; // Or a more specific type if known
    userData: any;
  }

  export class GLTFLoader {
    constructor(manager?: LoadingManager);
    load(
      url: string,
      onLoad: (gltf: GLTF) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: ErrorEvent) => void
    ): void;
    parse(
        data: ArrayBuffer | string,
        path: string,
        onLoad: (gltf: GLTF) => void,
        onError?: (event: ErrorEvent) => void
    ) : void;
  }
}

