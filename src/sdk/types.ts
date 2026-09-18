/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PrismPM (Prism Platform Model Framework) SDK - Type Definitions
 */

export interface PrismModelEntity {
  id: string;
  name: string;
  kind: 'inductive' | 'structure' | 'theorem' | 'operation' | 'view';
  sourceFile: string;
  line: number;
  description: string;
  formalSignature: string;
}

export interface PrismModelConfig {
  id: string;
  name: string;
  version: string;
  author: string;
  license: string;
  entrypoint: string;
  target: 'hologram:guest/core-wasm@1';
  limits: {
    maxHoloBytes: number;
    maxEntities: number;
    maxDiagnostics: number;
  };
}

export interface ViewManifestField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'address' | 'bytes32' | 'select';
  label: string;
  placeholder?: string;
  defaultValue?: string | number;
  options?: string[];
  required: boolean;
}

export interface ViewManifestAction {
  id: string;
  discriminant: number;
  name: string;
  label: string;
  description: string;
  fields: ViewManifestField[];
  buttonClass?: string;
}

export interface ViewManifest {
  version: string;
  appId: string;
  appName: string;
  description: string;
  ariaLiveRegion: {
    id: string;
    role: 'status';
    ariaLive: 'polite';
  };
  actions: ViewManifestAction[];
  stateView: {
    metrics: string[];
    logContainerId: string;
  };
}

export interface BrowserClosureFile {
  filename: string;
  path: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  content: string | Uint8Array;
  description: string;
}

export interface BrowserClosure {
  appId: string;
  version: string;
  modelHash: string;
  files: {
    indexHtml: BrowserClosureFile;
    manifestJson: BrowserClosureFile;
    adapterJs: BrowserClosureFile;
    adapterWasm: BrowserClosureFile;
    provenanceJson: BrowserClosureFile;
    lock: BrowserClosureFile;
  };
  totalSizeBytes: number;
  rootDigest: string;
}

export interface CargoCrateManifest {
  packageName: string;
  version: string;
  authors: string[];
  edition: '2021';
  description: string;
  license: string;
  repository: string;
  dependencies: Record<string, string>;
  crateFileName: string;
  crateSizeBytes: number;
  crateSha256: string;
}

export interface ProvenanceRecord {
  schema: 'https://uor.foundation/prismpm/provenance/v1.json';
  model_id: string;
  view_model_id: string;
  generated_core_sha256: string;
  adapter_wasm_sha256: string;
  binding_javascript_sha256: string;
  view_manifest_sha256: string;
  adapter_lock_sha256: string;
  index_html_sha256: string;
  provenance_generated_at: string;
  toolchain: {
    prismpm: string;
    lexlean: string;
    lean4: string;
    target: string;
  };
  verification: {
    passed: boolean;
    invariants_proven: number;
    acceptance_suite: string;
  };
}

export interface PublishOptions {
  dryRun?: boolean;
  targetRegistry?: 'uor-content-addressed' | 'crates.io' | 'gh-pages';
  signArtifacts?: boolean;
  onProgress?: (stage: string, percent: number, details: string) => void;
}

export interface PublishResult {
  success: boolean;
  appId: string;
  version: string;
  publishedAt: string;
  closureDigest: string;
  uorCid: string;
  endpoints: {
    previewUrl: string;
    closureBundleUrl: string;
    crateRegistryUrl: string;
    gitHubPagesUrl: string;
  };
  closure: BrowserClosure;
  crate: CargoCrateManifest;
  provenance: ProvenanceRecord;
}
