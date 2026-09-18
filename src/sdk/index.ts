/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PrismPM (Prism Platform Model Framework) SDK
 * 
 * The authoritative client and development SDK for modeling, building,
 * verifying, and publishing applications on the UOR Framework.
 */

import { PrismApplication } from './application';
import { PrismPublisher } from './publisher';
import { createSixFileBrowserClosure, generateViewManifest, generateIndexHtml, generateAdapterJs } from './closure';
import { createCargoCrateManifest, generateCargoToml, generateLibRs } from './crate';
import { sha256Bytes, syncSha256, verifyProvenanceRecord } from './provenance';
import { BrowserClosure, ViewManifest, PublishOptions, PublishResult, CargoCrateManifest, ProvenanceRecord } from './types';
import { VaultState } from '../types';

export const PrismPM = {
  version: '0.4.0',
  framework: 'UOR Framework',

  /**
   * Create an application instance using the PrismPM SDK
   */
  createApplication(initialState?: VaultState): PrismApplication {
    return new PrismApplication(initialState);
  },

  /**
   * Access the publication engine
   */
  publisher: new PrismPublisher(),

  /**
   * Publish the application (closure, crate, provenance, UOR identity)
   */
  async publish(options?: PublishOptions): Promise<PublishResult> {
    return this.publisher.publish(options);
  },

  /**
   * Generate the 6-file browser closure matching calculator-example
   */
  getBrowserClosure(): BrowserClosure {
    return createSixFileBrowserClosure();
  },

  /**
   * Generate the Cargo crate manifest
   */
  getCargoCrate(): CargoCrateManifest {
    return createCargoCrateManifest();
  },

  /**
   * Get the standard View Manifest
   */
  getViewManifest(): ViewManifest {
    return generateViewManifest();
  },

  /**
   * Verify provenance records
   */
  verifyProvenance(record: ProvenanceRecord) {
    return verifyProvenanceRecord(record);
  },

  /**
   * Compute SHA-256 hash
   */
  hash: syncSha256
};

export {
  PrismApplication,
  PrismPublisher,
  createSixFileBrowserClosure,
  generateViewManifest,
  generateIndexHtml,
  generateAdapterJs,
  createCargoCrateManifest,
  generateCargoToml,
  generateLibRs,
  sha256Bytes,
  syncSha256,
  verifyProvenanceRecord
};

export * from './types';
export default PrismPM;
